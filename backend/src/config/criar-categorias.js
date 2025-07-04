const database = require('./database');

async function criarCategorias() {
    try {
        // Verificar se já existem categorias
        const checkQuery = 'SELECT COUNT(*) as total FROM categorias';
        const checkResult = await database.query(checkQuery);
        const totalCategorias = parseInt(checkResult.rows[0].total);
        
        console.log(`📊 Total de categorias encontradas: ${totalCategorias}`);
        
        if (totalCategorias === 0) {
            console.log('📝 Criando categorias padrão...');
            
            const categoriasPadrao = [
                'Tecnologia',
                'Educação',
                'Saúde',
                'Negócios',
                'Arte e Cultura',
                'Esportes',
                'Meio Ambiente',
                'Desenvolvimento Pessoal'
            ];
            
            for (const nome of categoriasPadrao) {
                const insertQuery = 'INSERT INTO categorias (nome) VALUES ($1) RETURNING id, nome';
                const result = await database.query(insertQuery, [nome]);
                console.log(`✅ Categoria criada: ${result.rows[0].nome} (ID: ${result.rows[0].id})`);
            }
            
            console.log('🎉 Todas as categorias padrão foram criadas!');
        } else {
            console.log('✅ Categorias já existem no banco de dados.');
        }
        
        // Listar todas as categorias
        const listQuery = 'SELECT id, nome FROM categorias ORDER BY nome';
        const listResult = await database.query(listQuery);
        console.log('\n📋 Lista de todas as categorias:');
        listResult.rows.forEach(categoria => {
            console.log(`ID: ${categoria.id} | Nome: ${categoria.nome}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await database.end();
    }
}

criarCategorias(); 