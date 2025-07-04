const database = require('../config/database');

/**
 * Modelo de Categoria
 * Gerencia todas as operações relacionadas às categorias no banco de dados
 */
class Categoria {
    /**
     * Cria uma nova categoria
     * @param {Object} categoriaData - Dados da categoria
     * @returns {Promise} Categoria criada
     */
    static async criar(categoriaData) {
        try {
            const { nome } = categoriaData;
            
            const query = `
                INSERT INTO categorias (nome)
                VALUES ($1)
                RETURNING id, nome
            `;
            
            const result = await database.query(query, [nome]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }
    }

    /**
     * Busca todas as categorias
     * @returns {Promise} Lista de categorias
     */
    static async buscarTodas() {
        try {
            const query = `
                SELECT id, nome
                FROM categorias
                ORDER BY nome ASC
            `;
            
            const result = await database.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    }

    /**
     * Busca uma categoria por ID
     * @param {number} id - ID da categoria
     * @returns {Promise} Categoria encontrada
     */
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT id, nome
                FROM categorias
                WHERE id = $1
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar categoria por ID:', error);
            throw error;
        }
    }

    /**
     * Busca uma categoria por nome
     * @param {string} nome - Nome da categoria
     * @returns {Promise} Categoria encontrada
     */
    static async buscarPorNome(nome) {
        try {
            const query = `
                SELECT id, nome
                FROM categorias
                WHERE nome ILIKE $1
            `;
            
            const result = await database.query(query, [nome]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar categoria por nome:', error);
            throw error;
        }
    }

    /**
     * Atualiza uma categoria
     * @param {number} id - ID da categoria
     * @param {Object} categoriaData - Dados para atualização
     * @returns {Promise} Categoria atualizada
     */
    static async atualizar(id, categoriaData) {
        try {
            const { nome } = categoriaData;
            
            const query = `
                UPDATE categorias
                SET nome = $1
                WHERE id = $2
                RETURNING id, nome
            `;
            
            const result = await database.query(query, [nome, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            throw error;
        }
    }

    /**
     * Remove uma categoria
     * @param {number} id - ID da categoria
     * @returns {Promise} Resultado da remoção
     */
    static async remover(id) {
        try {
            const query = `
                DELETE FROM categorias
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover categoria:', error);
            throw error;
        }
    }

    /**
     * Verifica se uma categoria existe
     * @param {string} nome - Nome da categoria
     * @param {number} excludeId - ID da categoria a ser excluída da verificação
     * @returns {Promise<boolean>} True se a categoria existe
     */
    static async categoriaExiste(nome, excludeId = null) {
        try {
            let query = 'SELECT id FROM categorias WHERE nome ILIKE $1';
            let params = [nome];
            
            if (excludeId) {
                query += ' AND id != $2';
                params.push(excludeId);
            }
            
            const result = await database.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar categoria:', error);
            throw error;
        }
    }

    /**
     * Busca categorias com contagem de eventos
     * @returns {Promise} Lista de categorias com contagem de eventos
     */
    static async buscarComContagemEventos() {
        try {
            const query = `
                SELECT c.id, c.nome,
                       COUNT(e.id) as total_eventos
                FROM categorias c
                LEFT JOIN eventos e ON c.id = e.categoria_id
                GROUP BY c.id, c.nome
                ORDER BY c.nome ASC
            `;
            
            const result = await database.query(query);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar categorias com contagem de eventos:', error);
            throw error;
        }
    }

    /**
     * Conta o total de categorias
     * @returns {Promise<number>} Total de categorias
     */
    static async contar() {
        try {
            const query = 'SELECT COUNT(*) as total FROM categorias';
            const result = await database.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar categorias:', error);
            throw error;
        }
    }

    /**
     * Busca categorias por termo de busca
     * @param {string} termo - Termo para busca
     * @returns {Promise} Lista de categorias que contêm o termo
     */
    static async buscarPorTermo(termo) {
        try {
            const query = `
                SELECT id, nome
                FROM categorias
                WHERE nome ILIKE $1
                ORDER BY nome ASC
            `;
            
            const result = await database.query(query, [`%${termo}%`]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar categorias por termo:', error);
            throw error;
        }
    }
}

module.exports = Categoria; 