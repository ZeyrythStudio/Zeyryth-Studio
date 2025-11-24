import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import { useParams } from 'wouter';
import MainLayout from '@/components/MainLayout';
import AvatarUpload from '@/components/AvatarUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { Trophy, Award, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';

export default function Profile() {
  const { t } = useTranslation();
  const { user: currentUser, loading: authLoading } = useAuth();
  const params = useParams();
  const userId = params.userId ? parseInt(params.userId) : undefined;
  const isOwnProfile = !userId || userId === currentUser?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
  });

  const utils = trpc.useUtils();
  const { data: profileUser, isLoading } = trpc.profile.get.useQuery(
    { userId },
    { enabled: !!currentUser }
  );
  const { data: trophies } = trpc.profile.getTrophies.useQuery(
    { userId },
    { enabled: !!currentUser }
  );

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      setIsEditing(false);
      utils.profile.get.invalidate();
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  useEffect(() => {
    if (profileUser) {
      setFormData({
        name: profileUser.name || '',
        bio: profileUser.bio || '',
        avatar: profileUser.avatar || '',
      });
    }
  }, [profileUser]);

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>{t('common.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (!currentUser) {
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>{t('common.loading')}</p>
        </div>
      </MainLayout>
    );
  }

  if (!profileUser) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p>Usuário não encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleAvatarUploadSuccess = (url: string) => {
    setFormData({ ...formData, avatar: url });
    utils.profile.get.invalidate();
  };

  const getTitleBadge = (points: number) => {
    if (points >= 1000) return { title: t('profile.titles.legend'), color: 'bg-yellow-500' };
    if (points >= 500) return { title: t('profile.titles.master'), color: 'bg-purple-500' };
    if (points >= 200) return { title: t('profile.titles.artist'), color: 'bg-blue-500' };
    if (points >= 50) return { title: t('profile.titles.apprentice'), color: 'bg-green-500' };
    return { title: t('profile.titles.novice'), color: 'bg-gray-500' };
  };

  const titleBadge = getTitleBadge(profileUser.activityPoints || 0);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-start flex-1">
                {isOwnProfile && isEditing ? (
                  <AvatarUpload
                    currentAvatar={formData.avatar}
                    userName={formData.name}
                    onUploadSuccess={handleAvatarUploadSuccess}
                  />
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileUser.avatar || undefined} />
                    <AvatarFallback className="text-3xl">
                      {profileUser.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <CardTitle className="text-2xl mb-2">{profileUser.name}</CardTitle>
                  <Badge className={titleBadge.color}>{titleBadge.title}</Badge>
                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{profileUser.activityPoints || 0} pontos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{trophies?.length || 0} troféus</span>
                    </div>
                  </div>
                </div>
              </div>
              {isOwnProfile && (
                <Button
                  variant="outline"
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                >
                  {isEditing ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('profile.save')}
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      {t('profile.edit')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>
              </>
            ) : (
              <div>
                <h3 className="font-semibold mb-2">{t('profile.bio')}</h3>
                <p className="text-muted-foreground">
                  {profileUser.bio || 'Nenhuma biografia adicionada'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {trophies && trophies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.trophies')}</CardTitle>
              <CardDescription>Conquistas desbloqueadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {trophies.map((trophy) => (
                  <div key={trophy.id} className="flex gap-3 p-3 rounded-lg bg-muted">
                    <Trophy className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">{trophy.trophyName}</h4>
                      {trophy.description && (
                        <p className="text-sm text-muted-foreground">{trophy.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(trophy.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
