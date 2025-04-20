# Xadrez Online

Uma aplicação de xadrez online com sistema de ranking, registro de jogadores e histórico de partidas.

<p align="center">
  <img src="./public/chess-screenshot.png" alt="Xadrez Online Screenshot" width="600">
</p>

## Funcionalidades

- 🎮 Jogo de xadrez completo com todas as regras oficiais
- 🤖 Modo de jogo contra IA com diferentes níveis de dificuldade
- 📊 Sistema de ranking baseado em ELO
- 👤 Perfis de jogadores com estatísticas
- 📜 Histórico de partidas
- 🔒 Sistema de autenticação de usuários

## Configuração do Projeto

### Pré-requisitos

- Node.js (v16 ou superior)
- NPM ou Yarn
- Conta no Firebase
- Conta no Netlify (para deployment)

### Configuração do Firebase

1. Crie um projeto no [Console do Firebase](https://console.firebase.google.com/)
2. Adicione um aplicativo web e obtenha as credenciais
3. Ative a **Authentication** com método de e-mail/senha
4. Configure o **Firestore Database**
5. Crie um arquivo `.env` na raiz do projeto usando o modelo abaixo:

```
# Firebase Config
REACT_APP_FIREBASE_API_KEY=sua_chave_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu-projeto
REACT_APP_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
```

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/xadrez-online.git
cd xadrez-online

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

## Deploy no Netlify

### Método 1: Deploy Automatizado via GitHub

1. Faça um fork deste repositório
2. Conecte sua conta Netlify com GitHub
3. Selecione o repositório e configure as variáveis de ambiente:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Adicione as variáveis de ambiente do Firebase nas configurações do site

### Método 2: Deploy Manual

1. Construa o projeto: `npm run build`
2. Arraste e solte a pasta `build` na interface do Netlify
3. Configure as variáveis de ambiente nas configurações do site

## Estrutura do Banco de Dados (Firestore)

### Coleção `players`

```
players/{userId}
  - uid: string
  - displayName: string
  - email: string
  - rating: number
  - wins: number
  - losses: number
  - draws: number
  - createdAt: timestamp
```

### Coleção `games`

```
games/{gameId}
  - whitePlayerId: string
  - blackPlayerId: string
  - result: string ('white', 'black', 'draw', 'ongoing')
  - moves: array
  - pgn: string
  - fen: string
  - startTime: timestamp
  - endTime: timestamp
```

## Regras de Segurança do Firestore

Adicione estas regras ao seu Firestore para proteger os dados:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{userId} {
      allow read;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /games/{gameId} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

## Tecnologias

- React
- Firebase (Auth e Firestore)
- Chess.js (lógica do xadrez)
- react-chessboard (interface do tabuleiro)

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
