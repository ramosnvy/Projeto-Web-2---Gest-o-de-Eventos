# Documentação da API - Sistema de Eventos e Certificados

## Autenticação
- Todas as rotas protegidas exigem o envio do token JWT no header:
  - `Authorization: Bearer <token>`

## Endpoints Principais

### Usuários
- `POST /api/auth/registrar` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/perfil` - Perfil do usuário logado
- `PUT /api/auth/perfil` - Atualizar perfil
- `PUT /api/auth/alterar-senha` - Alterar senha
- `POST /api/auth/renovar-token` - Renovar token
- `POST /api/auth/logout` - Logout

### Administração de Usuários (admin)
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/:id` - Buscar usuário por ID
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Remover usuário
- `PUT /api/usuarios/:id/tipo` - Atualizar tipo de usuário

### Eventos
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Buscar evento por ID
- `POST /api/eventos` - Criar evento
- `PUT /api/eventos/:id` - Atualizar evento
- `DELETE /api/eventos/:id` - Remover evento
- `GET /api/eventos/meus` - Listar eventos do organizador
- `GET /api/eventos/futuros` - Listar eventos futuros

### Inscrições
- `GET /api/inscricoes` - Listar inscrições
- `POST /api/inscricoes` - Inscrever-se em evento
- `DELETE /api/inscricoes/:id` - Cancelar inscrição
- `GET /api/inscricoes/minhas` - Minhas inscrições
- `GET /api/inscricoes/evento/:evento_id` - Inscrições de um evento

### Certificados
- `GET /api/certificados` - Listar certificados
- `POST /api/certificados` - Emitir certificado
- `GET /api/certificados/meus` - Meus certificados
- `GET /api/certificados/evento/:evento_id` - Certificados de um evento
- `GET /api/certificados/inscricao/:inscricao_id` - Certificado por inscrição
- `POST /api/certificados/emitir/:inscricao_id` - Emitir certificado automaticamente

### Categorias
- `GET /api/categorias` - Listar categorias
- `POST /api/categorias` - Criar categoria
- `PUT /api/categorias/:id` - Atualizar categoria
- `DELETE /api/categorias/:id` - Remover categoria

### Acessos de Certificados (MongoDB)
- `GET /api/acessos-certificados` - Listar acessos
- `POST /api/acessos-certificados` - Registrar acesso
- `GET /api/acessos-certificados/:id` - Buscar acesso por ID

## Observações
- Todos os retornos seguem o padrão `{ sucesso: boolean, mensagem?: string, dados?: any }`
- Para detalhes completos de cada rota, consulte o código-fonte ou solicite exemplos específicos. 