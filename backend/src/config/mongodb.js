const { MongoClient } = require('mongodb');
require('dotenv').config();

/**
 * Configuração da conexão com MongoDB
 * Gerencia a conexão com o banco de dados NoSQL
 */
class MongoDB {
    constructor() {
        this.uri = process.env.MONGO_URL || 'mongodb://localhost:27017/';
        this.client = null;
        this.db = null;
        this.dbName = process.env.MONGO_DB || 'eventos_nosql';
    }

    /**
     * Conecta ao MongoDB
     * @returns {Promise} Conexão estabelecida
     */
    async connect() {
        try {
            this.client = new MongoClient(this.uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            await this.client.connect();
            this.db = this.client.db(this.dbName);
            
            console.log('Conexão com MongoDB estabelecida com sucesso');
            
            // Criar índices para melhor performance
            await this.createIndexes();
            
            return this.db;
        } catch (error) {
            console.error('Erro ao conectar com MongoDB:', error);
            throw error;
        }
    }

    /**
     * Cria índices para otimização de consultas
     */
    async createIndexes() {
        try {
            const acessosCollection = this.db.collection('acessos_certificados');
            
            // Índice composto para consultas por usuário e evento
            await acessosCollection.createIndex({ 
                usuario_id: 1, 
                evento_id: 1 
            });
            
            // Índice para data de acesso
            await acessosCollection.createIndex({ 
                data_acesso: -1 
            });
            
            // Índice para tipo de acesso
            await acessosCollection.createIndex({ 
                tipo_acesso: 1 
            });
            
            console.log('Índices do MongoDB criados com sucesso');
        } catch (error) {
            console.error('Erro ao criar índices do MongoDB:', error);
        }
    }

    /**
     * Obtém a coleção especificada
     * @param {string} collectionName - Nome da coleção
     * @returns {Collection} Coleção do MongoDB
     */
    getCollection(collectionName) {
        if (!this.db) {
            throw new Error('MongoDB não está conectado');
        }
        return this.db.collection(collectionName);
    }

    /**
     * Insere um documento na coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} document - Documento a ser inserido
     * @returns {Promise} Resultado da inserção
     */
    async insertOne(collectionName, document) {
        const collection = this.getCollection(collectionName);
        return await collection.insertOne(document);
    }

    /**
     * Busca documentos na coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} filter - Filtro da busca
     * @param {Object} options - Opções da busca
     * @returns {Promise} Resultado da busca
     */
    async find(collectionName, filter = {}, options = {}) {
        const collection = this.getCollection(collectionName);
        return await collection.find(filter, options).toArray();
    }

    /**
     * Busca um documento específico na coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} filter - Filtro da busca
     * @returns {Promise} Documento encontrado
     */
    async findOne(collectionName, filter = {}) {
        const collection = this.getCollection(collectionName);
        return await collection.findOne(filter);
    }

    /**
     * Atualiza um documento na coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} filter - Filtro para encontrar o documento
     * @param {Object} update - Dados para atualização
     * @returns {Promise} Resultado da atualização
     */
    async updateOne(collectionName, filter, update) {
        const collection = this.getCollection(collectionName);
        return await collection.updateOne(filter, { $set: update });
    }

    /**
     * Remove um documento da coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} filter - Filtro para encontrar o documento
     * @returns {Promise} Resultado da remoção
     */
    async deleteOne(collectionName, filter) {
        const collection = this.getCollection(collectionName);
        return await collection.deleteOne(filter);
    }

    /**
     * Fecha a conexão com o MongoDB
     */
    async close() {
        if (this.client) {
            await this.client.close();
            console.log('Conexão com MongoDB fechada');
        }
    }

    /**
     * Testa a conexão com o MongoDB
     * @returns {Promise<boolean>} True se conectado com sucesso
     */
    async testConnection() {
        try {
            await this.connect();
            const result = await this.db.admin().ping();
            console.log('Teste de conexão MongoDB:', result);
            return true;
        } catch (error) {
            console.error('Erro no teste de conexão MongoDB:', error);
            return false;
        }
    }
}

// Instância única do MongoDB
const mongodb = new MongoDB();

module.exports = mongodb; 