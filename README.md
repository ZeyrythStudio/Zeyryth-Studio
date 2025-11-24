# 🎨 Zeyryth'Studio

Uma plataforma criativa e colaborativa para design de cores, texturas e paletas. Conecte-se com designers, compartilhe suas criações e explore um universo infinito de possibilidades visuais.

## ✨ Funcionalidades Principais

### 🎯 Coletor de Cores
- **Lupa de Precisão**: Passe o mouse sobre qualquer imagem para capturar cores em tempo real
- **Preview Instantâneo**: Veja a cor selecionada enquanto move o mouse
- **Múltiplos Formatos**: Copie cores em HEX, RGB ou outros formatos
- **Paletas Rápidas**: Clique para adicionar cores à sua paleta

### 🎨 Gerador de Paletas
- Crie paletas personalizadas com cores coletadas
- Compartilhe paletas com a comunidade
- Explore paletas públicas de outros designers
- Organize suas criações em coleções

### 🪨 Gerador de Texturas Realistas
- **Mármores**: Carrara, Calacatta, Nero com veios autênticos
- **Madeiras**: Carvalho, Nogueira, Pinho com padrões naturais
- **Peles Humanas**: Tons claros, médios e escuros com detalhes realistas
- Download em alta resolução (512x512px)

### 💬 Chat Global em Tempo Real
- Converse com toda a comunidade
- Compartilhe dicas e inspirações
- Notificações em tempo real
- Histórico de mensagens

### 👥 Sistema de Amizades
- Adicione outros designers como amigos
- Envie mensagens privadas
- Compartilhe paletas diretamente
- Veja o que seus amigos estão criando

### 🏆 Sistema de Meritocracia
- Ganhe pontos de atividade
- Desbloqueie títulos especiais
- Colete troféus por conquistas
- Apareça no ranking global

### 👤 Perfis Personalizáveis
- Upload de avatar
- Bio e informações profissionais
- Histórico de criações
- Estatísticas de atividade

### 🌙 Tema Claro/Escuro
- Alterne entre temas conforme preferência
- Interface adaptada para cada tema
- Salvo automaticamente

### 🌍 Suporte Multilíngue
- Português (Brasil)
- Inglês
- Troque de idioma a qualquer momento

## 🚀 Como Começar

### Requisitos
- Node.js 18+
- npm ou pnpm
- Navegador moderno

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu_usuario/zeyryth-studio.git
cd zeyryth-studio

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Execute o banco de dados
pnpm db:push

# Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse `http://localhost:3000` no seu navegador.

## 📚 Estrutura do Projeto

```
zeyryth-studio/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React
│   │   ├── i18n/          # Internacionalização
│   │   └── lib/           # Utilitários
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Procedimentos tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Infraestrutura
├── drizzle/               # Schema do banco de dados
└── storage/               # Integração com S3
```

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Banco de Dados**: MySQL/TiDB com Drizzle ORM
- **Autenticação**: Manus OAuth
- **Chat em Tempo Real**: Socket.IO
- **Armazenamento**: S3
- **Testes**: Vitest

## 📖 Documentação

- [Guia de Deploy](./GUIA_DEPLOY_ZEYRYTH_STUDIO.md) - Como colocar online
- [Documentação da API](./docs/API.md) - Endpoints disponíveis
- [Guia de Contribuição](./CONTRIBUTING.md) - Como contribuir

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar com coverage
pnpm test:coverage

# Modo watch
pnpm test:watch
```

## 🏗️ Build para Produção

```bash
# Compilar para produção
pnpm build

# Testar build localmente
pnpm preview
```

## 🔐 Segurança

- Todas as senhas são hasheadas
- Tokens JWT para autenticação
- Validação de entrada em todos os endpoints
- HTTPS obrigatório em produção
- CORS configurado corretamente

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de submissão.

## 💬 Comunidade

- Discord: [Junte-se ao nosso servidor](https://discord.gg/zeyryth)
- Twitter: [@ZeyrytheStudio](https://twitter.com/zeyryth)
- Email: contato@zeyryth.studio

## 🙏 Agradecimentos

Obrigado a todos os designers e criadores que fazem parte da comunidade Zeyryth'Studio!

---

**Feito com ❤️ para designers e criadores de todo o mundo**
