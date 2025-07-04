const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testarEndpointCategorias() {
    try {
        console.log('🔍 Testando endpoint de categorias...');
        
        // Primeiro fazer login para obter token
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'teste@gmail.com.br',
            senha: '123456'
        });
        
        const token = loginResponse.data.dados.token;
        console.log('✅ Login realizado, token obtido');
        
        // Testar endpoint de categorias
        const categoriasResponse = await axios.get(`${API_URL}/categorias`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Resposta completa do endpoint /categorias:');
        console.log(JSON.stringify(categoriasResponse.data, null, 2));
        
        // Verificar estrutura
        if (categoriasResponse.data.sucesso && categoriasResponse.data.dados && categoriasResponse.data.dados.categorias) {
            console.log(`✅ Estrutura correta! Encontradas ${categoriasResponse.data.dados.categorias.length} categorias`);
            console.log('📋 Categorias encontradas:');
            categoriasResponse.data.dados.categorias.forEach(cat => {
                console.log(`  - ID: ${cat.id}, Nome: ${cat.nome}`);
            });
        } else {
            console.log('❌ Estrutura incorreta ou categorias não encontradas');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
        }
    }
}

testarEndpointCategorias(); 