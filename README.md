# Sistema de Gestão de Eventos e Certificados

## Descrição
Sistema completo de gestão de eventos e certificados desenvolvido em Node.js, Express, PostgreSQL, MongoDB e React, seguindo o padrão MVC.

## Tecnologias Utilizadas
- **Backend**: Node.js com Express
- **Banco Relacional**: PostgreSQL
- **Banco NoSQL**: MongoDB
- **Frontend**: React
- **Padrão**: MVC (Model-View-Controller)
- **Autenticação**: JWT
- **Criptografia**: bcrypt

## Estrutura do Projeto
```
projeto-eventos/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── utils/
│   ├── documentacao/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Pré-requisitos
- Node.js (versão 16 ou superior)
- PostgreSQL
- MongoDB
- npm ou yarn

## Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd projeto-eventos
```

### 2. Configuração do Backend
```bash
cd backend
npm install
```

### 3. Configuração do Banco de Dados

#### PostgreSQL
1. Crie um banco de dados PostgreSQL
2. Execute o script de criação das tabelas em `backend/src/config/database.sql`

#### MongoDB
1. Certifique-se de que o MongoDB está rodando
2. O sistema criará automaticamente a coleção necessária

### 4. Configuração das Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backend`:
```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos_db
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eventos_nosql

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# Servidor
PORT=3001
```

### 5. Configuração do Frontend
```bash
cd ../frontend
npm install
```

### 6. Executando o Projeto

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm start
```

O sistema estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Tipos de Usuário

### Administrador
- Acesso total ao sistema
- Gerenciar todos os usuários
- Aprovar/rejeitar eventos
- Visualizar relatórios completos

### Organizador
- Criar e editar próprios eventos
- Visualizar inscrições em seus eventos
- Emitir certificados
- Gerenciar participantes

### Participante
- Visualizar eventos disponíveis
- Inscrever-se em eventos
- Visualizar próprios certificados
- Atualizar perfil

## Funcionalidades Principais

### Gestão de Usuários
- Cadastro e login
- Diferentes níveis de acesso
- Perfil do usuário

### Gestão de Eventos
- Criação e edição de eventos
- Inscrições em eventos
- Categorização

### Gestão de Certificados
- Emissão automática de certificados
- Visualização de certificados
- Histórico de acessos

## Documentação da API
A documentação completa da API está disponível em `backend/documentacao/api.md`


## Licença
Este projeto está sob a licença MIT. 