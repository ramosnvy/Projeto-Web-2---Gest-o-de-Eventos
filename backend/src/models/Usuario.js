const database = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Modelo de Usuário
 * Gerencia todas as operações relacionadas aos usuários no banco de dados
 */
class Usuario {
    /**
     * Cria um novo usuário
     * @param {Object} usuarioData - Dados do usuário
     * @returns {Promise} Usuário criado
     */
    static async criar(usuarioData) {
        try {
            const { nome, email, senha, tipo_usuario = 'participante' } = usuarioData;
            
            // Criptografar a senha
            const senhaCriptografada = await bcrypt.hash(senha, 10);
            
            const query = `
                INSERT INTO usuarios (nome, email, senha, tipo_usuario)
                VALUES ($1, $2, $3, $4)
                RETURNING id, nome, email, tipo_usuario, data_criacao
            `;
            
            const result = await database.query(query, [nome, email, senhaCriptografada, tipo_usuario]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    /**
     * Busca todos os usuários
     * @param {number} limit - Limite de resultados
     * @param {number} offset - Offset para paginação
     * @returns {Promise} Lista de usuários
     */
    static async buscarTodos(limit = 10, offset = 0) {
        try {
            const query = `
                SELECT id, nome, email, tipo_usuario, data_criacao
                FROM usuarios
                ORDER BY data_criacao DESC
                LIMIT $1 OFFSET $2
            `;
            
            const result = await database.query(query, [limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            throw error;
        }
    }

    /**
     * Busca um usuário por ID
     * @param {number} id - ID do usuário
     * @returns {Promise} Usuário encontrado
     */
    static async buscarPorId(id) {
        try {
            const query = `
                SELECT id, nome, email, tipo_usuario, data_criacao
                FROM usuarios
                WHERE id = $1
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    /**
     * Busca um usuário por email
     * @param {string} email - Email do usuário
     * @returns {Promise} Usuário encontrado (incluindo senha para autenticação)
     */
    static async buscarPorEmail(email) {
        try {
            const query = `
                SELECT id, nome, email, senha, tipo_usuario, data_criacao
                FROM usuarios
                WHERE email = $1
            `;
            
            const result = await database.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    /**
     * Atualiza um usuário
     * @param {number} id - ID do usuário
     * @param {Object} usuarioData - Dados para atualização
     * @returns {Promise} Usuário atualizado
     */
    static async atualizar(id, usuarioData) {
        try {
            const { nome, email, tipo_usuario } = usuarioData;
            
            const query = `
                UPDATE usuarios
                SET nome = COALESCE($1, nome),
                    email = COALESCE($2, email),
                    tipo_usuario = COALESCE($3, tipo_usuario)
                WHERE id = $4
                RETURNING id, nome, email, tipo_usuario, data_criacao
            `;
            
            const result = await database.query(query, [nome, email, tipo_usuario, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    /**
     * Atualiza a senha de um usuário
     * @param {number} id - ID do usuário
     * @param {string} novaSenha - Nova senha
     * @returns {Promise} Resultado da atualização
     */
    static async atualizarSenha(id, novaSenha) {
        try {
            const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
            
            const query = `
                UPDATE usuarios
                SET senha = $1
                WHERE id = $2
                RETURNING id
            `;
            
            const result = await database.query(query, [senhaCriptografada, id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            throw error;
        }
    }

    /**
     * Remove um usuário
     * @param {number} id - ID do usuário
     * @returns {Promise} Resultado da remoção
     */
    static async remover(id) {
        try {
            const query = `
                DELETE FROM usuarios
                WHERE id = $1
                RETURNING id
            `;
            
            const result = await database.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            throw error;
        }
    }

    /**
     * Verifica se um email já existe
     * @param {string} email - Email a ser verificado
     * @param {number} excludeId - ID do usuário a ser excluído da verificação
     * @returns {Promise<boolean>} True se o email existe
     */
    static async emailExiste(email, excludeId = null) {
        try {
            let query = 'SELECT id FROM usuarios WHERE email = $1';
            let params = [email];
            
            if (excludeId) {
                query += ' AND id != $2';
                params.push(excludeId);
            }
            
            const result = await database.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Erro ao verificar email:', error);
            throw error;
        }
    }

    /**
     * Verifica se a senha está correta
     * @param {string} senha - Senha fornecida
     * @param {string} senhaHash - Hash da senha armazenada
     * @returns {Promise<boolean>} True se a senha está correta
     */
    static async verificarSenha(senha, senhaHash) {
        return await bcrypt.compare(senha, senhaHash);
    }

    /**
     * Busca usuários por tipo
     * @param {string} tipo - Tipo de usuário
     * @returns {Promise} Lista de usuários do tipo especificado
     */
    static async buscarPorTipo(tipo) {
        try {
            const query = `
                SELECT id, nome, email, tipo_usuario, data_criacao
                FROM usuarios
                WHERE tipo_usuario = $1
                ORDER BY nome
            `;
            
            const result = await database.query(query, [tipo]);
            return result.rows;
        } catch (error) {
            console.error('Erro ao buscar usuários por tipo:', error);
            throw error;
        }
    }

    /**
     * Conta o total de usuários
     * @returns {Promise<number>} Total de usuários
     */
    static async contar() {
        try {
            const query = 'SELECT COUNT(*) as total FROM usuarios';
            const result = await database.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Erro ao contar usuários:', error);
            throw error;
        }
    }
}

module.exports = Usuario; 