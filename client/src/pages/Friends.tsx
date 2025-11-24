import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { UserPlus, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { getLoginUrl } from '@/const';
import { Link } from 'wouter';

export default function Friends() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [searchId, setSearchId] = useState('');

  const utils = trpc.useUtils();
  const { data: friends, isLoading: loadingFriends } = trpc.friends.list.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: requests, isLoading: loadingRequests } = trpc.friends.requests.useQuery(undefined, {
    enabled: !!user,
  });

  const sendRequestMutation = trpc.friends.send.useMutation({
    onSuccess: () => {
      toast.success('Solicitação enviada!');
      setSearchId('');
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao enviar solicitação');
    },
  });

  const acceptMutation = trpc.friends.accept.useMutation({
    onSuccess: () => {
      toast.success('Amigo adicionado!');
      utils.friends.list.invalidate();
      utils.friends.requests.invalidate();
    },
  });

  const rejectMutation = trpc.friends.reject.useMutation({
    onSuccess: () => {
      toast.success('Solicitação rejeitada');
      utils.friends.requests.invalidate();
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

  const handleSendRequest = () => {
    const id = parseInt(searchId);
    if (isNaN(id)) {
      toast.error('ID inválido');
      return;
    }
    sendRequestMutation.mutate({ friendId: id });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('friends.title')}</h1>
          <p className="text-muted-foreground">Conecte-se com outros designers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('friends.add')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Digite o ID do usuário"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                type="number"
              />
              <Button onClick={handleSendRequest} disabled={sendRequestMutation.isPending}>
                <UserPlus className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">
              {t('friends.title')}
              {friends && friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">
              {t('friends.requests')}
              {requests && requests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4 mt-6">
            {loadingFriends ? (
              <p>{t('common.loading')}</p>
            ) : friends && friends.length > 0 ? (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <Card key={friend.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={friend.avatar || undefined} />
                          <AvatarFallback>
                            {friend.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{friend.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {friend.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/profile/${friend.id}`}>
                          <Button variant="outline" size="sm">
                            Ver Perfil
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">{t('friends.noFriends')}</p>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-6">
            {loadingRequests ? (
              <p>{t('common.loading')}</p>
            ) : requests && requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request: any) => (
                  <Card key={request.requestId}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.avatar || undefined} />
                          <AvatarFallback>
                            {request.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{request.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {request.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => acceptMutation.mutate({ requestId: request.requestId })}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          {t('friends.accept')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rejectMutation.mutate({ requestId: request.requestId })}
                        >
                          <X className="mr-1 h-4 w-4" />
                          {t('friends.reject')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">
                {t('friends.noPendingRequests')}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
