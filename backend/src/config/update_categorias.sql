-- Script para adicionar categoria_id na tabela eventos
-- Execute este script para habilitar a funcionalidade de categorias

-- Adicionar coluna categoria_id na tabela eventos
ALTER TABLE eventos ADD COLUMN categoria_id INTEGER REFERENCES categorias(id);

-- Atualizar eventos existentes para usar a primeira categoria (Tecnologia)
UPDATE eventos SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Tecnologia' LIMIT 1) WHERE categoria_id IS NULL;

-- Criar índice para melhor performance
CREATE INDEX idx_eventos_categoria ON eventos(categoria_id);

-- Comentário sobre a nova coluna
COMMENT ON COLUMN eventos.categoria_id IS 'Referência à categoria do evento'; 