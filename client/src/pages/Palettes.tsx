import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { Plus, Copy, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';

export default function Palettes() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPalette, setNewPalette] = useState({
    name: '',
    description: '',
    colors: ['#000000'],
    isPublic: false,
  });

  const utils = trpc.useUtils();
  const { data: myPalettes, isLoading: loadingMy } = trpc.palettes.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: publicPalettes, isLoading: loadingPublic } = trpc.palettes.public.useQuery({ limit: 50 });
  const { data: sharedPalettes, isLoading: loadingShared, error: sharedError } = trpc.palettes.shared.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.palettes.create.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setIsCreateDialogOpen(false);
      setNewPalette({ name: '', description: '', colors: ['#000000'], isPublic: false });
      utils.palettes.list.invalidate();
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  const deleteMutation = trpc.palettes.delete.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      utils.palettes.list.invalidate();
    },
  });

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>{t('common.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-xl">{t('auth.loginMessage')}</p>
          <Button asChild>
            <a href={getLoginUrl()}>{t('auth.login')}</a>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleCreatePalette = () => {
    createMutation.mutate(newPalette);
  };

  const addColor = () => {
    setNewPalette({
      ...newPalette,
      colors: [...newPalette.colors, '#000000'],
    });
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...newPalette.colors];
    newColors[index] = color;
    setNewPalette({ ...newPalette, colors: newColors });
  };

  const removeColor = (index: number) => {
    if (newPalette.colors.length > 1) {
      setNewPalette({
        ...newPalette,
        colors: newPalette.colors.filter((_, i) => i !== index),
      });
    }
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`${color} copiado!`);
  };

  const PaletteCard = ({ palette, showActions = false }: any) => (
    <Card>
      <CardHeader>
        <CardTitle>{palette.name}</CardTitle>
        {palette.description && <CardDescription>{palette.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 h-20">
          {palette.colors && Array.isArray(palette.colors) ? (
            palette.colors.map((color: string, index: number) => (
              <div
                key={index}
                className="flex-1 rounded cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => copyColor(color)}
                title={color}
              />
            ))
          ) : (
            <p className="text-muted-foreground">Cores não disponíveis</p>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteMutation.mutate({ id: palette.id })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('palettes.title')}</h1>
            <p className="text-muted-foreground">Crie e gerencie suas paletas de cores</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('palettes.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('palettes.create')}</DialogTitle>
                <DialogDescription>Crie uma nova paleta de cores</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('palettes.name')}</Label>
                  <Input
                    id="name"
                    value={newPalette.name}
                    onChange={(e) => setNewPalette({ ...newPalette, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t('palettes.description')}</Label>
                  <Textarea
                    id="description"
                    value={newPalette.description}
                    onChange={(e) => setNewPalette({ ...newPalette, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t('palettes.colors')}</Label>
                  <div className="space-y-2 mt-2">
                    {newPalette.colors.map((color, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          className="w-20"
                        />
                        <Input value={color} onChange={(e) => updateColor(index, e.target.value)} />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeColor(index)}
                          disabled={newPalette.colors.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addColor} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Cor
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={newPalette.isPublic}
                    onCheckedChange={(checked) =>
                      setNewPalette({ ...newPalette, isPublic: checked as boolean })
                    }
                  />
                  <Label htmlFor="isPublic">{t('palettes.isPublic')}</Label>
                </div>
                <Button onClick={handleCreatePalette} className="w-full">
                  {t('palettes.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="my">
          <TabsList>
            <TabsTrigger value="my">{t('palettes.title')}</TabsTrigger>
            <TabsTrigger value="public">{t('palettes.public')}</TabsTrigger>
            <TabsTrigger value="shared">{t('palettes.shared')}</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="space-y-4 mt-6">
            {loadingMy ? (
              <p>{t('common.loading')}</p>
            ) : myPalettes && myPalettes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPalettes.map((palette) => (
                  <PaletteCard key={palette.id} palette={palette} showActions />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Você ainda não criou nenhuma paleta
              </p>
            )}
          </TabsContent>

          <TabsContent value="public" className="space-y-4 mt-6">
            {loadingPublic ? (
              <p>{t('common.loading')}</p>
            ) : publicPalettes && publicPalettes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicPalettes.map((palette) => (
                  <PaletteCard key={palette.id} palette={palette} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Nenhuma paleta pública disponível
              </p>
            )}
          </TabsContent>

          <TabsContent value="shared" className="space-y-4 mt-6">
            {loadingShared ? (
              <p>{t('common.loading')}</p>
            ) : sharedError ? (
              <p className="text-muted-foreground text-center py-12">
                Nenhuma paleta compartilhada
              </p>
            ) : sharedPalettes && sharedPalettes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedPalettes.map((palette) => (
                  <PaletteCard key={palette.id} palette={palette} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Nenhuma paleta compartilhada
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
