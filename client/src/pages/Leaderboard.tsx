import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { trpc } from '@/lib/trpc';
import { Trophy, Medal, Award } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';

export default function Leaderboard() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  const { data: topUsers, isLoading } = trpc.leaderboard.top.useQuery({ limit: 50 });

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

  const getTitleBadge = (points: number) => {
    if (points >= 1000) return { title: t('profile.titles.legend'), color: 'bg-yellow-500' };
    if (points >= 500) return { title: t('profile.titles.master'), color: 'bg-purple-500' };
    if (points >= 200) return { title: t('profile.titles.artist'), color: 'bg-blue-500' };
    if (points >= 50) return { title: t('profile.titles.apprentice'), color: 'bg-green-500' };
    return { title: t('profile.titles.novice'), color: 'bg-gray-500' };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <Award className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
            {t('leaderboard.title')}
          </h1>
          <p className="text-muted-foreground">Os designers mais ativos da plataforma</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p>{t('common.loading')}</p>
          </div>
        ) : topUsers && topUsers.length > 0 ? (
          <>
            {/* Top 3 */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {topUsers.slice(0, 3).map((topUser, index) => {
                const titleBadge = getTitleBadge(topUser.activityPoints || 0);
                return (
                  <Card
                    key={topUser.id}
                    className={`${
                      index === 0
                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
                        : index === 1
                        ? 'border-gray-400'
                        : 'border-orange-600'
                    }`}
                  >
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-2">{getRankIcon(index + 1)}</div>
                      <Avatar className="h-20 w-20 mx-auto mb-2">
                        <AvatarImage src={topUser.avatar || undefined} />
                        <AvatarFallback className="text-2xl">
                          {topUser.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle>{topUser.name}</CardTitle>
                      <CardDescription>
                        <Badge className={titleBadge.color}>{titleBadge.title}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {topUser.activityPoints || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">pontos</p>
                      <Link href={`/profile/${topUser.id}`}>
                        <Button variant="outline" size="sm" className="mt-4">
                          Ver Perfil
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Rest of the leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking Completo</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">{t('leaderboard.rank')}</TableHead>
                      <TableHead>{t('leaderboard.user')}</TableHead>
                      <TableHead>{t('leaderboard.title_label')}</TableHead>
                      <TableHead className="text-right">{t('leaderboard.points')}</TableHead>
                      <TableHead className="w-32"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers.map((rankUser, index) => {
                      const titleBadge = getTitleBadge(rankUser.activityPoints || 0);
                      return (
                        <TableRow
                          key={rankUser.id}
                          className={rankUser.id === user.id ? 'bg-muted' : ''}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index + 1)}
                              <span>#{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={rankUser.avatar || undefined} />
                                <AvatarFallback>
                                  {rankUser.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{rankUser.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={titleBadge.color}>{titleBadge.title}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {rankUser.activityPoints || 0}
                          </TableCell>
                          <TableCell>
                            <Link href={`/profile/${rankUser.id}`}>
                              <Button variant="ghost" size="sm">
                                Ver Perfil
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-12">Nenhum usuário no ranking</p>
        )}
      </div>
    </MainLayout>
  );
}
