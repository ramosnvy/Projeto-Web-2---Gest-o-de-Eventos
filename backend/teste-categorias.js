const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testarCategorias() {
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
        
        console.log('✅ Resposta do endpoint /categorias:');
        console.log(JSON.stringify(categoriasResponse.data, null, 2));
        
        if (categoriasResponse.data.sucesso && categoriasResponse.data.dados.categorias) {
            console.log(`✅ Encontradas ${categoriasResponse.data.dados.categorias.length} categorias`);
        } else {
            console.log('❌ Formato de resposta inesperado');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.response?.data || error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testarCategorias(); 