require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const database = require('./config/database');
const mongodb = require('./config/mongodb');

// Rotas
const authRoutes = require('./routes/auth');
const usuarioRoutes = require('./routes/usuarios');
const eventoRoutes = require('./routes/eventos');
const inscricaoRoutes = require('./routes/inscricoes');
const certificadoRoutes = require('./routes/certificados');
const categoriaRoutes = require('./routes/categorias');
const acessosCertificadosRoutes = require('./routes/acessosCertificados');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

// Inicializar conexões com bancos de dados
async function initializeDatabases() {
    try {
        // Testar conexão com PostgreSQL
        await database.testConnection();
        console.log('✅ PostgreSQL conectado com sucesso');
        
        // Tentar conectar com MongoDB (opcional)
        try {
            await mongodb.connect();
            console.log('✅ MongoDB conectado com sucesso');
        } catch (mongoError) {
            console.warn('⚠️ MongoDB não disponível:', mongoError.message);
            console.log('O sistema continuará funcionando sem MongoDB');
        }
    } catch (error) {
        console.error('❌ Erro ao inicializar bancos de dados:', error);
        process.exit(1);
    }
}

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API de Eventos e Certificados - Documentação'
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/certificados', certificadoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/acessos-certificados', acessosCertificadosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de status
app.get('/api/status', async (req, res) => {
    try {
        const dbOk = await database.testConnection();
        let mongoOk = false;
        try {
            mongoOk = await mongodb.testConnection();
        } catch (error) {
            console.warn('MongoDB não disponível para teste');
        }
        res.json({
            sucesso: true,
            status: 'ok',
            postgres: dbOk,
            mongodb: mongoOk
        });
    } catch (error) {
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao testar conexões' });
    }
});

// Rota padrão
app.get('/', (req, res) => {
    res.send('API de Eventos e Certificados - Backend rodando!');
});

// Tratamento de rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada' });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3001;

// Inicializar bancos e depois iniciar servidor
initializeDatabases().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    });
}).catch((error) => {
    console.error('❌ Falha ao inicializar servidor:', error);
    process.exit(1);
}); 