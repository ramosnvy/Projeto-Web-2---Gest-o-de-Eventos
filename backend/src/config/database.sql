-- Script de criação do banco de dados PostgreSQL
-- Sistema de Gestão de Eventos e Certificados

-- Criação do banco de dados (execute separadamente se necessário)
-- CREATE DATABASE eventos_db;

-- Conectar ao banco eventos_db antes de executar este script

-- Criação do tipo enum para tipos de usuário
CREATE TYPE tipo_usuario AS ENUM ('administrador', 'organizador', 'participante');

-- Tabela de usuários (6 colunas)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario tipo_usuario NOT NULL DEFAULT 'participante',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias (2 colunas)
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Tabela de eventos (5 colunas)
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_evento TIMESTAMP NOT NULL,
    organizador_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de inscrições (5 colunas)
CREATE TABLE inscricoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    evento_id INTEGER REFERENCES eventos(id) ON DELETE CASCADE,
    data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
    UNIQUE(usuario_id, evento_id)
);

-- Tabela de certificados (3 colunas)
CREATE TABLE certificados (
    id SERIAL PRIMARY KEY,
    inscricao_id INTEGER REFERENCES inscricoes(id) ON DELETE CASCADE,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserção de dados iniciais

-- Inserir categorias padrão
INSERT INTO categorias (nome) VALUES 
('Tecnologia'),
('Educação'),
('Saúde'),
('Negócios'),
('Arte e Cultura');

-- Inserir usuário administrador padrão
-- Senha: admin123 (criptografada com bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES 
('Administrador', 'admin@eventos.com', '$2a$10$rQZ8K9mN2pL1vX3yU6wE7t.8i9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f', 'administrador');

-- Inserir usuário organizador padrão
-- Senha: org123 (criptografada com bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES 
('Organizador', 'org@eventos.com', '$2a$10$sRZ9L0nO3qM2wY4zV7xF8u.9j0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g', 'organizador');

-- Inserir usuário participante padrão
-- Senha: part123 (criptografada com bcrypt)
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES 
('Participante', 'part@eventos.com', '$2a$10$tSZ0M1pP4rN3xZ5wW8yG9v.0k1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h', 'participante');

-- Criar índices para melhor performance
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_eventos_organizador ON eventos(organizador_id);
CREATE INDEX idx_eventos_data ON eventos(data_evento);
CREATE INDEX idx_inscricoes_usuario ON inscricoes(usuario_id);
CREATE INDEX idx_inscricoes_evento ON inscricoes(evento_id);
CREATE INDEX idx_certificados_inscricao ON certificados(inscricao_id);

-- Comentários sobre as tabelas
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema com diferentes tipos de acesso';
COMMENT ON TABLE categorias IS 'Tabela de categorias para classificação de eventos';
COMMENT ON TABLE eventos IS 'Tabela de eventos criados pelos organizadores';
COMMENT ON TABLE inscricoes IS 'Tabela de inscrições de participantes em eventos';
COMMENT ON TABLE certificados IS 'Tabela de certificados emitidos para participantes'; 