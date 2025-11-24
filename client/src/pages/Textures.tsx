import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Sparkles, Info } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { toast } from 'sonner';

// Função para gerar ruído Perlin simplificado
const perlinNoise = (x: number, y: number, seed: number = 0): number => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
};

// Interpolação suave
const smoothstep = (t: number): number => t * t * (3 - 2 * t);

// Ruído Perlin melhorado
const improvedPerlin = (x: number, y: number, seed: number = 0): number => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;

  const n00 = perlinNoise(xi, yi, seed);
  const n10 = perlinNoise(xi + 1, yi, seed);
  const n01 = perlinNoise(xi, yi + 1, seed);
  const n11 = perlinNoise(xi + 1, yi + 1, seed);

  const u = smoothstep(xf);
  const v = smoothstep(yf);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;
  return nx0 * (1 - v) + nx1 * v;
};

// Interpolação de cores
const interpolateColor = (color1: string, color2: string, t: number): string => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

export default function Textures() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [marbleType, setMarbleType] = useState('carrara');
  const [woodType, setWoodType] = useState('oak');
  const [skinTone, setSkinTone] = useState('medium');
  const [generatedTexture, setGeneratedTexture] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

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

  const generateMarbleTexture = () => {
    setGenerating(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const marbleColors: Record<string, { base: string[]; vein: string[] }> = {
        carrara: {
          base: ['#f5f5f5', '#ececec', '#e0e0e0'],
          vein: ['#a8a8a8', '#909090', '#787878'],
        },
        calacatta: {
          base: ['#fefefe', '#f8f8f8', '#e8d4c0'],
          vein: ['#d4a574', '#b8956a', '#9d7e5d'],
        },
        nero: {
          base: ['#1a1a1a', '#0f0f0f', '#050505'],
          vein: ['#404040', '#2a2a2a', '#1a1a1a'],
        },
      };

      const colors = marbleColors[marbleType] || marbleColors.carrara;
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;

      // Gerar textura com Perlin noise
      for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
          const noise1 = improvedPerlin(x / 50, y / 50, 0);
          const noise2 = improvedPerlin(x / 100, y / 100, 1);
          const noise3 = improvedPerlin(x / 200, y / 200, 2);

          const combined = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
          const colorIndex = Math.floor(combined * (colors.base.length - 1));
          const t = combined % 1;

          let color = colors.base[colorIndex];
          if (combined > 0.6) {
            color = interpolateColor(colors.base[colorIndex], colors.vein[0], (combined - 0.6) * 2);
          }

          const c = parseInt(color.slice(1), 16);
          const r = (c >> 16) & 255;
          const g = (c >> 8) & 255;
          const b = c & 255;

          const idx = (y * 512 + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setGeneratedTexture(canvas.toDataURL());
      setGenerating(false);
      toast.success('Textura de mármore gerada com sucesso!');
    }, 1500);
  };

  const generateWoodTexture = () => {
    setGenerating(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const woodColors: Record<string, { base: string[]; grain: string[] }> = {
        oak: {
          base: ['#d4a574', '#c19a6b', '#a67c52'],
          grain: ['#8b6f47', '#6b5a3d', '#4a3f2e'],
        },
        walnut: {
          base: ['#6b4423', '#5c4033', '#4a3426'],
          grain: ['#3d2817', '#2d1f0f', '#1a1410'],
        },
        pine: {
          base: ['#e8d4b8', '#e3c565', '#d4b55c'],
          grain: ['#c5a653', '#a89050', '#8b7a3d'],
        },
      };

      const colors = woodColors[woodType] || woodColors.oak;
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;

      for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
          const noise1 = improvedPerlin(x / 30, y / 150, 0);
          const noise2 = improvedPerlin(x / 60, y / 300, 1);
          const grainNoise = improvedPerlin(x / 10, y / 5, 2);

          const combined = noise1 * 0.6 + noise2 * 0.4;
          const colorIndex = Math.floor(combined * (colors.base.length - 1));

          let color = colors.base[colorIndex];
          if (grainNoise > 0.7) {
            color = interpolateColor(colors.base[colorIndex], colors.grain[0], (grainNoise - 0.7) * 3);
          }

          const c = parseInt(color.slice(1), 16);
          const r = (c >> 16) & 255;
          const g = (c >> 8) & 255;
          const b = c & 255;

          const idx = (y * 512 + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setGeneratedTexture(canvas.toDataURL());
      setGenerating(false);
      toast.success('Textura de madeira gerada com sucesso!');
    }, 1500);
  };

  const generateSkinTexture = () => {
    setGenerating(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const skinColors: Record<string, { base: string; undertone: string; shadow: string }> = {
        light: {
          base: '#f5d5c0',
          undertone: '#f0c8b8',
          shadow: '#e8b8a0',
        },
        medium: {
          base: '#d4a574',
          undertone: '#c99968',
          shadow: '#b8845c',
        },
        dark: {
          base: '#8d5524',
          undertone: '#7a4a1f',
          shadow: '#6b3d1a',
        },
      };

      const colors = skinColors[skinTone] || skinColors.medium;
      const imageData = ctx.createImageData(512, 512);
      const data = imageData.data;

      for (let y = 0; y < 512; y++) {
        for (let x = 0; x < 512; x++) {
          const noise1 = improvedPerlin(x / 40, y / 40, 0);
          const noise2 = improvedPerlin(x / 80, y / 80, 1);
          const poreNoise = improvedPerlin(x / 15, y / 15, 2);

          const combined = noise1 * 0.5 + noise2 * 0.5;

          let color = colors.base;
          if (combined > 0.5) {
            color = interpolateColor(colors.base, colors.undertone, (combined - 0.5) * 2);
          } else if (combined < 0.3) {
            color = interpolateColor(colors.shadow, colors.base, combined / 0.3);
          }

          let c = parseInt(color.slice(1), 16);
          let r = (c >> 16) & 255;
          let g = (c >> 8) & 255;
          let b = c & 255;

          // Adicionar poros
          if (poreNoise > 0.8) {
            const darkness = (poreNoise - 0.8) * 5;
            r = Math.max(0, r - darkness * 20);
            g = Math.max(0, g - darkness * 20);
            b = Math.max(0, b - darkness * 20);
          }

          const idx = (y * 512 + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setGeneratedTexture(canvas.toDataURL());
      setGenerating(false);
      toast.success('Textura de pele gerada com sucesso!');
    }, 1500);
  };

  const downloadTexture = () => {
    if (!generatedTexture) return;
    const link = document.createElement('a');
    link.download = 'texture.png';
    link.href = generatedTexture;
    link.click();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('textures.title')}</h1>
          <p className="text-muted-foreground">Gere texturas realistas para seus projetos</p>
        </div>

        <Tabs defaultValue="marble">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marble">{t('textures.marble')}</TabsTrigger>
            <TabsTrigger value="wood">{t('textures.wood')}</TabsTrigger>
            <TabsTrigger value="skin">{t('textures.skin')}</TabsTrigger>
          </TabsList>

          <TabsContent value="marble" className="space-y-4 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Escolha o tipo de mármore</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Mármore</label>
                    <Select value={marbleType} onValueChange={setMarbleType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carrara">{t('textures.types.carrara')}</SelectItem>
                        <SelectItem value="calacatta">{t('textures.types.calacatta')}</SelectItem>
                        <SelectItem value="nero">{t('textures.types.nero')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateMarbleTexture} disabled={generating} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generating ? 'Gerando...' : t('textures.generate')}
                  </Button>
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {t('textures.tips')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{t('textures.marbleTips')}</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prévia</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedTexture ? (
                    <div className="space-y-4">
                      <img src={generatedTexture} alt="Generated texture" className="w-full rounded-lg" />
                      <Button onClick={downloadTexture} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {t('textures.download')}
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gere uma textura para ver a prévia</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wood" className="space-y-4 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Escolha o tipo de madeira</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Madeira</label>
                    <Select value={woodType} onValueChange={setWoodType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oak">{t('textures.types.oak')}</SelectItem>
                        <SelectItem value="walnut">{t('textures.types.walnut')}</SelectItem>
                        <SelectItem value="pine">{t('textures.types.pine')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateWoodTexture} disabled={generating} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generating ? 'Gerando...' : t('textures.generate')}
                  </Button>
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {t('textures.tips')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{t('textures.woodTips')}</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prévia</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedTexture ? (
                    <div className="space-y-4">
                      <img src={generatedTexture} alt="Generated texture" className="w-full rounded-lg" />
                      <Button onClick={downloadTexture} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {t('textures.download')}
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gere uma textura para ver a prévia</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skin" className="space-y-4 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                  <CardDescription>Escolha o tom de pele</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tom de Pele</label>
                    <Select value={skinTone} onValueChange={setSkinTone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t('textures.types.light')}</SelectItem>
                        <SelectItem value="medium">{t('textures.types.medium')}</SelectItem>
                        <SelectItem value="dark">{t('textures.types.dark')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={generateSkinTexture} disabled={generating} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {generating ? 'Gerando...' : t('textures.generate')}
                  </Button>
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        {t('textures.tips')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{t('textures.skinTips')}</p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prévia</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatedTexture ? (
                    <div className="space-y-4">
                      <img src={generatedTexture} alt="Generated texture" className="w-full rounded-lg" />
                      <Button onClick={downloadTexture} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        {t('textures.download')}
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gere uma textura para ver a prévia</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
