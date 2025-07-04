const database = require('./database');
const bcrypt = require('bcryptjs');

async function criarAdmin() {
    try {
        // Verificar se o usuário admin já existe
        const checkQuery = 'SELECT id, tipo_usuario FROM usuarios WHERE email = $1';
        const checkResult = await database.query(checkQuery, ['teste@gmail.com.br']);
        
        if (checkResult.rows.length > 0) {
            const usuario = checkResult.rows[0];
            console.log(`Usuário encontrado: ID ${usuario.id}, Tipo: ${usuario.tipo_usuario}`);
            
            if (usuario.tipo_usuario !== 'administrador') {
                // Atualizar para administrador
                const updateQuery = 'UPDATE usuarios SET tipo_usuario = $1 WHERE id = $2';
                await database.query(updateQuery, ['administrador', usuario.id]);
                console.log('✅ Usuário atualizado para administrador!');
            } else {
                console.log('✅ Usuário já é administrador!');
            }
        } else {
            // Criar novo usuário administrador
            const senhaCriptografada = await bcrypt.hash('123456', 10);
            const insertQuery = `
                INSERT INTO usuarios (nome, email, senha, tipo_usuario)
                VALUES ($1, $2, $3, $4)
                RETURNING id, nome, email, tipo_usuario
            `;
            const result = await database.query(insertQuery, [
                'Administrador Teste',
                'teste@gmail.com.br',
                senhaCriptografada,
                'administrador'
            ]);
            console.log('✅ Usuário administrador criado:', result.rows[0]);
        }
        
        // Listar todos os usuários para verificação
        const listQuery = 'SELECT id, nome, email, tipo_usuario FROM usuarios ORDER BY id';
        const listResult = await database.query(listQuery);
        console.log('\n📋 Lista de todos os usuários:');
        listResult.rows.forEach(user => {
            console.log(`ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email} | Tipo: ${user.tipo_usuario}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await database.end();
    }
}

criarAdmin(); 