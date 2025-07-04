# Documentação da API - Swagger

## Visão Geral

Esta API fornece endpoints para gerenciamento completo de eventos, inscrições, certificados e usuários. A documentação interativa está disponível através do Swagger UI.

## Acesso à Documentação

### URL da Documentação
```
http://localhost:3001/api-docs
```

### Como Acessar
1. Inicie o servidor backend:
   ```bash
   npm run dev
   ```

2. Abra seu navegador e acesse:
   ```
   http://localhost:3001/api-docs
   ```

## Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para acessar endpoints protegidos:

1. **Faça login** usando o endpoint `/api/auth/login`
2. **Copie o token** retornado na resposta
3. **Clique no botão "Authorize"** no Swagger UI
4. **Digite o token** no formato: `Bearer SEU_TOKEN_AQUI`
5. **Clique em "Authorize"**

### Exemplo de Token
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/registrar` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/perfil` - Obter perfil do usuário
- `PUT /api/auth/perfil` - Atualizar perfil
- `PUT /api/auth/alterar-senha` - Alterar senha

### Usuários (Admin)
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios/{id}` - Buscar usuário por ID
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Remover usuário

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/futuros` - Listar eventos futuros
- `POST /api/eventos` - Criar evento (Organizador/Admin)
- `GET /api/eventos/{id}` - Buscar evento por ID
- `PUT /api/eventos/{id}` - Atualizar evento
- `DELETE /api/eventos/{id}` - Remover evento

### Inscrições
- `GET /api/inscricoes` - Listar inscrições (Admin/Organizador)
- `GET /api/inscricoes/minhas` - Minhas inscrições (Participante)
- `POST /api/inscricoes` - Criar inscrição (Participante)
- `PUT /api/inscricoes/{id}/aprovar` - Aprovar inscrição
- `PUT /api/inscricoes/{id}/rejeitar` - Rejeitar inscrição

### Certificados
- `GET /api/certificados` - Listar certificados (Admin/Organizador)
- `GET /api/certificados/meus` - Meus certificados (Participante)
- `POST /api/certificados` - Criar certificado
- `GET /api/certificados/{id}` - Buscar certificado por ID
- `GET /api/certificados/visualizar/{id}` - Visualizar certificado

### Categorias
- `GET /api/categorias` - Listar categorias
- `POST /api/categorias` - Criar categoria (Admin)
- `GET /api/categorias/{id}` - Buscar categoria por ID
- `PUT /api/categorias/{id}` - Atualizar categoria (Admin)
- `DELETE /api/categorias/{id}` - Remover categoria (Admin)

## Tipos de Usuário

### Admin
- Acesso completo a todos os endpoints
- Pode gerenciar usuários, eventos, inscrições e certificados
- Pode criar e gerenciar categorias

### Organizador
- Pode criar e gerenciar seus próprios eventos
- Pode gerenciar inscrições dos seus eventos
- Pode emitir certificados para participantes dos seus eventos
- Pode visualizar estatísticas dos seus eventos

### Participante
- Pode visualizar eventos disponíveis
- Pode se inscrever em eventos
- Pode visualizar suas inscrições e certificados
- Pode cancelar inscrições

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado (token inválido)
- `403` - Proibido (sem permissão)
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Exemplos de Uso

### 1. Registrar um novo usuário
```bash
curl -X POST "http://localhost:3001/api/auth/registrar" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@exemplo.com",
    "senha": "senha123",
    "tipo": "participante"
  }'
```

### 2. Fazer login
```bash
curl -X POST "http://localhost:3001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "senha": "senha123"
  }'
```

### 3. Criar um evento (com token)
```bash
curl -X POST "http://localhost:3001/api/eventos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "titulo": "Workshop de React",
    "descricao": "Aprenda React do zero",
    "data_inicio": "2024-02-15T09:00:00Z",
    "data_fim": "2024-02-15T17:00:00Z",
    "local": "Auditório Principal",
    "capacidade": 50,
    "categoria_id": 1
  }'
```

## Testando a API

### Usando o Swagger UI
1. Acesse `http://localhost:3001/api-docs`
2. Clique em "Authorize" e insira seu token
3. Navegue pelos endpoints e clique em "Try it out"
4. Preencha os parâmetros necessários
5. Clique em "Execute"

### Usando Postman
1. Importe a coleção da API
2. Configure a variável de ambiente `baseUrl` como `http://localhost:3001`
3. Configure a variável de ambiente `token` com seu JWT
4. Execute as requisições
