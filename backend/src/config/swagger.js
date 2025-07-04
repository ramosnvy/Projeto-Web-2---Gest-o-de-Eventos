const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Eventos e Certificados',
      version: '1.0.0',
      description: 'API completa para gestão de eventos, inscrições, certificados e usuários',
      contact: {
        name: 'Sistema de Eventos',
        email: 'contato@sistemaeventos.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            tipo: { type: 'string', enum: ['admin', 'organizador', 'participante'] },
            data_criacao: { type: 'string', format: 'date-time' }
          }
        },
        Evento: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            titulo: { type: 'string' },
            descricao: { type: 'string' },
            data_inicio: { type: 'string', format: 'date-time' },
            data_fim: { type: 'string', format: 'date-time' },
            local: { type: 'string' },
            capacidade: { type: 'integer' },
            categoria_id: { type: 'integer' },
            organizador_id: { type: 'integer' },
            status: { type: 'string', enum: ['ativo', 'cancelado', 'finalizado'] }
          }
        },
        Inscricao: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            evento_id: { type: 'integer' },
            usuario_id: { type: 'integer' },
            status: { type: 'string', enum: ['pendente', 'aprovada', 'rejeitada'] },
            data_inscricao: { type: 'string', format: 'date-time' }
          }
        },
        Certificado: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            inscricao_id: { type: 'integer' },
            codigo: { type: 'string' },
            data_emissao: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['ativo', 'revogado'] }
          }
        },
        Categoria: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nome: { type: 'string' },
            data_criacao: { type: 'string', format: 'date-time' }
          }
        },
        AcessoCertificado: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            certificado_id: { type: 'integer' },
            ip_acesso: { type: 'string' },
            data_acesso: { type: 'string', format: 'date-time' },
            user_agent: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            sucesso: { type: 'boolean' },
            mensagem: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs; 