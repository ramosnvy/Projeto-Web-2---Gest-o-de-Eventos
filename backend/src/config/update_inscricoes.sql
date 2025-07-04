-- Script para adicionar coluna status na tabela inscricoes
-- Execute este script se a tabela já existe

-- Adicionar coluna status se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inscricoes' AND column_name = 'status'
    ) THEN
        ALTER TABLE inscricoes ADD COLUMN status VARCHAR(20) DEFAULT 'pendente';
        ALTER TABLE inscricoes ADD CONSTRAINT check_status CHECK (status IN ('pendente', 'aprovada', 'rejeitada'));
    END IF;
END $$;

-- Atualizar inscrições existentes para status 'aprovada'
UPDATE inscricoes SET status = 'aprovada' WHERE status IS NULL OR status = 'pendente'; 