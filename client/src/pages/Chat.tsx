import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';
import { Send } from 'lucide-react';
import { getLoginUrl } from '@/const';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  createdAt: Date;
  user: {
    id: number;
    name: string | null;
    avatar: string | null;
  } | null;
}

export default function Chat() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages, isLoading } = trpc.chat.messages.useQuery({ limit: 100 });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages as ChatMessage[]);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!user) return;

    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      path: '/api/socket.io',
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat');
      newSocket.emit('join-chat', user.id);
    });

    newSocket.on('new-message', (newMessage: ChatMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !socket || !user) return;

    socket.emit('send-message', {
      userId: user.id,
      message: message.trim(),
      userName: user.name || 'Usuário',
      userAvatar: user.avatar,
    });

    setMessage('');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle>{t('chat.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-5rem)]">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-center text-muted-foreground">{t('common.loading')}</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-muted-foreground">Nenhuma mensagem ainda</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.userId === user.id ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.user?.avatar || undefined} />
                        <AvatarFallback>
                          {msg.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex flex-col ${
                          msg.userId === user.id ? 'items-end' : 'items-start'
                        }`}
                      >
                        <span className="text-xs text-muted-foreground mb-1">
                          {msg.user?.name || 'Usuário'}
                        </span>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-md ${
                            msg.userId === user.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('chat.typeMessage')}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
