const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { autenticar, autorizarAdmin } = require('../middleware/auth');
const { validarUsuario, validarId, validarBusca, validarPaginacao } = require('../middleware/validacao');

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUsuarioRequest:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *         - tipo
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *         tipo:
 *           type: string
 *           enum: [admin, organizador, participante]
 *           description: Tipo do usuário
 *     UpdateUsuarioRequest:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         tipo:
 *           type: string
 *           enum: [admin, organizador, participante]
 *           description: Tipo do usuário
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuários (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 dados:
 *                   type: object
 *                   properties:
 *                     usuarios:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Usuario'
 *                     paginacao:
 *                       type: object
 *                       properties:
 *                         pagina:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         paginas:
 *                           type: integer
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', autenticar, autorizarAdmin, validarPaginacao, UsuarioController.listar);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Buscar usuário por ID (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 dados:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', autenticar, autorizarAdmin, validarId, UsuarioController.buscarPorId);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Criar novo usuário (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUsuarioRequest'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 mensagem:
 *                   type: string
 *                 dados:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', autenticar, autorizarAdmin, validarUsuario.criar, UsuarioController.criar);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUsuarioRequest'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 mensagem:
 *                   type: string
 *                 dados:
 *                   $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', autenticar, autorizarAdmin, validarId, validarUsuario.atualizar, UsuarioController.atualizar);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Remover usuário (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 mensagem:
 *                   type: string
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', autenticar, autorizarAdmin, validarId, UsuarioController.remover);

/**
 * @swagger
 * /api/usuarios/tipo/{tipo}:
 *   get:
 *     summary: Buscar usuários por tipo (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, organizador, participante]
 *         description: Tipo do usuário
 *     responses:
 *       200:
 *         description: Lista de usuários do tipo especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 */
router.get('/tipo/:tipo', autenticar, autorizarAdmin, UsuarioController.buscarPorTipo);

/**
 * @swagger
 * /api/usuarios/buscar:
 *   get:
 *     summary: Buscar usuários por termo (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Usuários encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Usuario'
 */
router.get('/buscar', autenticar, autorizarAdmin, validarBusca, UsuarioController.buscar);

/**
 * @swagger
 * /api/usuarios/estatisticas/total:
 *   get:
 *     summary: Estatísticas de usuários (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 dados:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     por_tipo:
 *                       type: object
 *                       properties:
 *                         admin:
 *                           type: integer
 *                         organizador:
 *                           type: integer
 *                         participante:
 *                           type: integer
 */
router.get('/estatisticas/total', autenticar, autorizarAdmin, UsuarioController.estatisticas);

/**
 * @swagger
 * /api/usuarios/{id}/tipo:
 *   put:
 *     summary: Atualizar tipo de usuário (Admin)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [admin, organizador, participante]
 *                 description: Novo tipo do usuário
 *     responses:
 *       200:
 *         description: Tipo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 mensagem:
 *                   type: string
 *                 dados:
 *                   $ref: '#/components/schemas/Usuario'
 */
router.put('/:id/tipo', autenticar, autorizarAdmin, validarId, UsuarioController.atualizarTipo);

module.exports = router; 