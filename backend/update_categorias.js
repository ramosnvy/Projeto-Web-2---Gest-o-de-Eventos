const database = require('./src/config/database');

async function updateCategorias() {
    try {
        console.log('🔄 Atualizando estrutura do banco de dados...');

        // Adicionar coluna categoria_id na tabela eventos
        await database.query(`
            ALTER TABLE eventos ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id)
        `);
        console.log('✅ Coluna categoria_id adicionada');

        // Atualizar eventos existentes para usar a primeira categoria (Tecnologia)
        await database.query(`
            UPDATE eventos 
            SET categoria_id = (SELECT id FROM categorias WHERE nome = 'Tecnologia' LIMIT 1) 
            WHERE categoria_id IS NULL
        `);
        console.log('✅ Eventos existentes atualizados');

        // Criar índice para melhor performance
        await database.query(`
            CREATE INDEX IF NOT EXISTS idx_eventos_categoria ON eventos(categoria_id)
        `);
        console.log('✅ Índice criado');

        console.log('✅ Atualização concluída com sucesso!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro durante a atualização:', error);
        process.exit(1);
    }
}

updateCategorias(); 