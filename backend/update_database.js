const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eventos_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function updateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Atualizando banco de dados...');
    
    // Verificar se a coluna status já existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inscricoes' AND column_name = 'status'
    `;
    
    const columnExists = await client.query(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      console.log('📝 Adicionando coluna status na tabela inscricoes...');
      
      // Adicionar coluna status
      await client.query(`
        ALTER TABLE inscricoes ADD COLUMN status VARCHAR(20) DEFAULT 'pendente'
      `);
      
      // Adicionar constraint
      await client.query(`
        ALTER TABLE inscricoes ADD CONSTRAINT check_status 
        CHECK (status IN ('pendente', 'aprovada', 'rejeitada'))
      `);
      
      console.log('✅ Coluna status adicionada com sucesso!');
    } else {
      console.log('ℹ️ Coluna status já existe.');
    }
    
    // Atualizar inscrições existentes para status 'aprovada'
    console.log('🔄 Atualizando inscrições existentes...');
    const updateResult = await client.query(`
      UPDATE inscricoes 
      SET status = 'aprovada' 
      WHERE status IS NULL OR status = 'pendente'
    `);
    
    console.log(`✅ ${updateResult.rowCount} inscrições atualizadas para status 'aprovada'`);
    
    console.log('🎉 Atualização do banco de dados concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateDatabase()
    .then(() => {
      console.log('✅ Script de atualização executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar script:', error);
      process.exit(1);
    });
}

module.exports = { updateDatabase }; 