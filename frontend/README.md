# Frontend - Sistema de Gestão de Eventos e Certificados

Este é o frontend do sistema de gestão de eventos e certificados, desenvolvido em React com Material-UI.

## ✅ Funcionalidades Implementadas

### Autenticação e Autorização
- ✅ Login/Logout com JWT
- ✅ Registro de usuários
- ✅ Contexto de autenticação
- ✅ Rotas protegidas por tipo de usuário
- ✅ Atualização de perfil

### Dashboard e Navegação
- ✅ Dashboard principal com estatísticas dinâmicas
- ✅ Layout responsivo com sidebar
- ✅ Navegação baseada no tipo de usuário
- ✅ Menu de perfil com logout

### CRUD de Eventos
- ✅ Listagem de eventos com filtros
- ✅ Criação de eventos
- ✅ Edição de eventos
- ✅ Visualização detalhada
- ✅ Exclusão com confirmação

### CRUD de Usuários (Administradores)
- ✅ Listagem de usuários
- ✅ Formulários de criação/edição (placeholder)
- ✅ Visualização de usuários (placeholder)
- ✅ Exclusão com confirmação

### CRUD de Categorias (Administradores)
- ✅ Listagem de categorias
- ✅ Formulários de criação/edição (placeholder)
- ✅ Exclusão com confirmação

### Inscrições
- ✅ Listagem de inscrições (organizadores/administradores)
- ✅ Minhas inscrições (participantes)

### Certificados
- ✅ Listagem de certificados (organizadores/administradores)
- ✅ Meus certificados (participantes)

### Acessos MongoDB (Administradores)
- ✅ Listagem de logs de acesso
- ✅ Estatísticas de acesso
- ✅ Filtros e busca

### Componentes Reutilizáveis
- ✅ DataTable com paginação e busca
- ✅ ConfirmDialog para exclusões
- ✅ Layout responsivo
- ✅ Loading states
- ✅ Tratamento de erros

### Interface e UX
- ✅ Material-UI com tema personalizado
- ✅ Responsividade mobile
- ✅ Validação de formulários com Yup
- ✅ Mensagens de sucesso/erro
- ✅ Loading states
- ✅ Navegação intuitiva

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Backend rodando na porta 3001

### Instalação
```bash
cd frontend
npm install
```

### Execução
```bash
npm start
```

O frontend estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
frontend/src/
├── components/
│   └── common/           # Componentes reutilizáveis
│       ├── Layout.js     # Layout principal com sidebar
│       ├── DataTable.js  # Tabela com paginação e busca
│       └── ConfirmDialog.js # Modal de confirmação
├── pages/
│   ├── Dashboard/        # Dashboard principal
│   ├── Eventos/          # CRUD de eventos
│   ├── Usuarios/         # CRUD de usuários
│   ├── Categorias/       # CRUD de categorias
│   ├── Inscricoes/       # Gestão de inscrições
│   ├── Certificados/     # Gestão de certificados
│   ├── Acessos/          # Logs MongoDB
│   ├── LoginPage.js      # Página de login
│   ├── RegisterPage.js   # Página de registro
│   ├── PerfilPage.js     # Página de perfil
│   └── NotFoundPage.js   # Página 404
├── services/
│   ├── api.js           # Configuração do Axios
│   └── AuthContext.js   # Contexto de autenticação
└── App.js               # Rotas principais
```

## 🎨 Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **React Router 6** - Roteamento
- **Material-UI 5** - Componentes de UI
- **Axios** - Cliente HTTP
- **Formik + Yup** - Formulários e validação
- **JWT Decode** - Decodificação de tokens

## 🔐 Tipos de Usuário

### Administrador
- Acesso total ao sistema
- Gestão de usuários
- Gestão de categorias
- Visualização de logs MongoDB
- CRUD completo de eventos

### Organizador
- Criação e gestão de próprios eventos
- Visualização de inscrições em seus eventos
- Emissão de certificados
- Gestão de participantes

### Participante
- Visualização de eventos disponíveis
- Inscrição em eventos
- Visualização de próprios certificados
- Atualização de perfil

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔧 Configuração da API

O frontend está configurado para se conectar ao backend na porta 3001. Para alterar a URL da API, edite o arquivo `src/services/api.js`.

## 🚀 Próximas Melhorias

- [ ] Implementação completa dos formulários de usuário e categoria
- [ ] Sistema de notificações em tempo real
- [ ] Exportação de relatórios
- [ ] Upload de imagens para eventos
- [ ] Sistema de busca avançada
- [ ] Temas personalizáveis
- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)

## 📝 Observações

- Todas as telas, mensagens e comentários estão em português brasileiro
- Para rodar o frontend, o backend deve estar em execução
- O sistema segue o padrão MVC com separação clara de responsabilidades 