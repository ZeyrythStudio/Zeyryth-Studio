import { useAuth } from "@/_core/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl, APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";
import { Palette, Pipette, Image as ImageIcon, MessageSquare, Users, Trophy, Sparkles } from "lucide-react";
import MainLayout from "@/components/MainLayout";

export default function Home() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
        <div className="container min-h-screen flex flex-col items-center justify-center py-12">
          <div className="text-center mb-12 space-y-4">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-24 w-24 mx-auto mb-6" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              {t('app.tagline')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl">
            <Card>
              <CardHeader>
                <Pipette className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>{t('nav.colorPicker')}</CardTitle>
                <CardDescription>
                  Extraia cores de imagens com precisão usando nossa lupa avançada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Palette className="h-10 w-10 text-pink-600 mb-2" />
                <CardTitle>{t('nav.palettes')}</CardTitle>
                <CardDescription>
                  Crie e compartilhe paletas de cores incríveis com a comunidade
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <ImageIcon className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>{t('nav.textures')}</CardTitle>
                <CardDescription>
                  Gere texturas realistas de mármore, madeira e peles humanas
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Button size="lg" asChild className="text-lg px-8 py-6">
            <a href={getLoginUrl()}>
              <Sparkles className="mr-2 h-5 w-5" />
              {t('auth.login')}
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Pipette,
      title: t('nav.colorPicker'),
      description: 'Extraia cores de imagens com precisão',
      link: '/color-picker',
      color: 'text-purple-600',
    },
    {
      icon: Palette,
      title: t('nav.palettes'),
      description: 'Crie e gerencie suas paletas de cores',
      link: '/palettes',
      color: 'text-pink-600',
    },
    {
      icon: ImageIcon,
      title: t('nav.textures'),
      description: 'Gere texturas realistas',
      link: '/textures',
      color: 'text-orange-600',
    },
    {
      icon: MessageSquare,
      title: t('nav.chat'),
      description: 'Converse com a comunidade',
      link: '/chat',
      color: 'text-blue-600',
    },
    {
      icon: Users,
      title: t('nav.friends'),
      description: 'Conecte-se com outros designers',
      link: '/friends',
      color: 'text-green-600',
    },
    {
      icon: Trophy,
      title: t('nav.leaderboard'),
      description: 'Veja os melhores usuários',
      link: '/leaderboard',
      color: 'text-yellow-600',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {t('auth.welcome')}, {user.name}!
          </h1>
          <p className="text-xl text-muted-foreground">
            O que você gostaria de criar hoje?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.link} href={feature.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <Icon className={`h-12 w-12 ${feature.color} mb-4`} />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
