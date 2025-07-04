const { Pool } = require('pg');
require('dotenv').config();

/**
 * Configuração da conexão com PostgreSQL
 * Gerencia a conexão com o banco de dados relacional
 */
class Database {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'eventos_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            max: 20, // máximo de conexões no pool
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Tratamento de erros de conexão
        this.pool.on('error', (err) => {
            console.error('Erro inesperado no pool do PostgreSQL:', err);
        });
    }

    /**
     * Executa uma query no banco de dados
     * @param {string} text - Query SQL
     * @param {Array} params - Parâmetros da query
     * @returns {Promise} Resultado da query
     */
    async query(text, params) {
        const start = Date.now();
        try {
            const res = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log('Query executada:', { text, duration, rows: res.rowCount });
            return res;
        } catch (error) {
            console.error('Erro na query:', error);
            throw error;
        }
    }

    /**
     * Obtém um cliente do pool para transações
     * @returns {Promise} Cliente do pool
     */
    async getClient() {
        return await this.pool.connect();
    }

    /**
     * Testa a conexão com o banco de dados
     * @returns {Promise<boolean>} True se conectado com sucesso
     */
    async testConnection() {
        try {
            const result = await this.query('SELECT NOW()');
            console.log('Conexão com PostgreSQL estabelecida com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao conectar com PostgreSQL:', error);
            return false;
        }
    }

    /**
     * Fecha todas as conexões do pool
     */
    async close() {
        await this.pool.end();
    }
}

// Instância única do banco de dados
const database = new Database();

module.exports = database; 