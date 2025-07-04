const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para verificar se há erros de validação
 */
const verificarErros = (req, res, next) => {
    const erros = validationResult(req);
    
    if (!erros.isEmpty()) {
        return res.status(400).json({
            sucesso: false,
            mensagem: 'Dados inválidos',
            erros: erros.array().map(erro => ({
                campo: erro.path,
                mensagem: erro.msg,
                valor: erro.value
            }))
        });
    }
    
    next();
};

/**
 * Regras de validação para usuários
 */
const validarUsuario = {
    criar: [
        body('nome')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Nome deve ter entre 2 e 255 caracteres'),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email deve ser válido'),
        body('senha')
            .isLength({ min: 6 })
            .withMessage('Senha deve ter pelo menos 6 caracteres'),
        body('tipo_usuario')
            .optional()
            .isIn(['administrador', 'organizador', 'participante'])
            .withMessage('Tipo de usuário deve ser administrador, organizador ou participante'),
        verificarErros
    ],
    
    atualizar: [
        body('nome')
            .optional()
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('Nome deve ter entre 2 e 255 caracteres'),
        body('email')
            .optional()
            .isEmail()
            .normalizeEmail()
            .withMessage('Email deve ser válido'),
        body('tipo_usuario')
            .optional()
            .isIn(['administrador', 'organizador', 'participante'])
            .withMessage('Tipo de usuário deve ser administrador, organizador ou participante'),
        verificarErros
    ],
    
    login: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email deve ser válido'),
        body('senha')
            .notEmpty()
            .withMessage('Senha é obrigatória'),
        verificarErros
    ],
    
    alterarSenha: [
        body('senha_atual')
            .notEmpty()
            .withMessage('Senha atual é obrigatória'),
        body('nova_senha')
            .isLength({ min: 6 })
            .withMessage('Nova senha deve ter pelo menos 6 caracteres'),
        verificarErros
    ]
};

/**
 * Regras de validação para eventos
 */
const validarEvento = {
    criar: [
        body('titulo')
            .trim()
            .isLength({ min: 3, max: 255 })
            .withMessage('Título deve ter entre 3 e 255 caracteres'),
        body('descricao')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Descrição deve ter no máximo 1000 caracteres'),
        body('data_evento')
            .isISO8601()
            .withMessage('Data do evento deve ser uma data válida')
            .custom((value) => {
                const dataEvento = new Date(value);
                const agora = new Date();
                if (dataEvento <= agora) {
                    throw new Error('Data do evento deve ser futura');
                }
                return true;
            }),
        body('organizador_id')
            .isInt({ min: 1 })
            .withMessage('ID do organizador deve ser um número inteiro válido'),
        verificarErros
    ],
    
    atualizar: [
        body('titulo')
            .optional()
            .trim()
            .isLength({ min: 3, max: 255 })
            .withMessage('Título deve ter entre 3 e 255 caracteres'),
        body('descricao')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Descrição deve ter no máximo 1000 caracteres'),
        body('data_evento')
            .optional()
            .isISO8601()
            .withMessage('Data do evento deve ser uma data válida')
            .custom((value) => {
                const dataEvento = new Date(value);
                const agora = new Date();
                if (dataEvento <= agora) {
                    throw new Error('Data do evento deve ser futura');
                }
                return true;
            }),
        verificarErros
    ]
};

/**
 * Regras de validação para inscrições
 */
const validarInscricao = {
    criar: [
        body('usuario_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('ID do usuário deve ser um número inteiro válido'),
        body('evento_id')
            .isInt({ min: 1 })
            .withMessage('ID do evento deve ser um número inteiro válido'),
        verificarErros
    ]
};

/**
 * Regras de validação para certificados
 */
const validarCertificado = {
    criar: [
        body('inscricao_id')
            .isInt({ min: 1 })
            .withMessage('ID da inscrição deve ser um número inteiro válido'),
        verificarErros
    ]
};

/**
 * Regras de validação para categorias
 */
const validarCategoria = {
    criar: [
        body('nome')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome da categoria deve ter entre 2 e 100 caracteres'),
        verificarErros
    ],
    
    atualizar: [
        body('nome')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome da categoria deve ter entre 2 e 100 caracteres'),
        verificarErros
    ]
};

/**
 * Regras de validação para acessos de certificados (MongoDB)
 */
const validarAcessoCertificado = {
    criar: [
        body('usuario_id')
            .isInt({ min: 1 })
            .withMessage('ID do usuário deve ser um número inteiro válido'),
        body('evento_id')
            .isInt({ min: 1 })
            .withMessage('ID do evento deve ser um número inteiro válido'),
        body('tipo_acesso')
            .isIn(['inscricao', 'certificado'])
            .withMessage('Tipo de acesso deve ser inscricao ou certificado'),
        body('ip_acesso')
            .optional()
            .isIP()
            .withMessage('IP de acesso deve ser um endereço IP válido'),
        body('dispositivo')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('Dispositivo deve ter no máximo 255 caracteres'),
        verificarErros
    ]
};

/**
 * Regras de validação para parâmetros de ID
 */
const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID deve ser um número inteiro válido'),
    verificarErros
];

/**
 * Regras de validação para paginação
 */
const validarPaginacao = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número inteiro maior que 0'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser um número entre 1 e 100'),
    verificarErros
];

/**
 * Regras de validação para busca
 */
const validarBusca = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Termo de busca deve ter entre 2 e 100 caracteres'),
    verificarErros
];

/**
 * Regras de validação para filtros de data
 */
const validarFiltroData = [
    query('data_inicio')
        .optional()
        .isISO8601()
        .withMessage('Data de início deve ser uma data válida'),
    query('data_fim')
        .optional()
        .isISO8601()
        .withMessage('Data de fim deve ser uma data válida')
        .custom((value, { req }) => {
            if (req.query.data_inicio && value) {
                const dataInicio = new Date(req.query.data_inicio);
                const dataFim = new Date(value);
                if (dataFim <= dataInicio) {
                    throw new Error('Data de fim deve ser posterior à data de início');
                }
            }
            return true;
        }),
    verificarErros
];

module.exports = {
    verificarErros,
    validarUsuario,
    validarEvento,
    validarInscricao,
    validarCertificado,
    validarCategoria,
    validarAcessoCertificado,
    validarId,
    validarPaginacao,
    validarBusca,
    validarFiltroData
}; 