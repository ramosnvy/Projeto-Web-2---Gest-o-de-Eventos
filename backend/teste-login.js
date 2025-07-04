const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testarLogin() {
    try {
        console.log('🔍 Testando login...');
        
        // Fazer login
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'teste@gmail.com.br',
            senha: '123456'
        });
        
        console.log('✅ Login realizado com sucesso!');
        console.log('Token:', loginResponse.data.dados.token);
        
        // Buscar perfil do usuário
        const token = loginResponse.data.dados.token;
        const perfilResponse = await axios.get(`${API_URL}/auth/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Perfil do usuário:');
        console.log(JSON.stringify(perfilResponse.data.dados, null, 2));
        
        // Verificar se o tipo_usuario está correto
        const userData = perfilResponse.data.dados;
        console.log(`\n📋 Tipo de usuário: ${userData.tipo_usuario}`);
        
        if (userData.tipo_usuario === 'administrador') {
            console.log('✅ Usuário é administrador - deve ver todos os botões!');
        } else {
            console.log('❌ Usuário NÃO é administrador - problema encontrado!');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
    }
}

testarLogin(); 