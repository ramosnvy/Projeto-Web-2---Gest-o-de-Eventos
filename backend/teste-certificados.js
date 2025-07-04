const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testarCertificados() {
    try {
        console.log('🧪 Testando geração de certificados...\n');

        // 1. Fazer login como administrador
        console.log('1. Fazendo login como administrador...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@teste.com',
            senha: '123456'
        });

        const token = loginResponse.data.dados.token;
        console.log('✅ Login realizado com sucesso\n');

        // 2. Listar inscrições
        console.log('2. Listando inscrições...');
        const inscricoesResponse = await axios.get(`${API_URL}/inscricoes`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const inscricoes = inscricoesResponse.data.dados.inscricoes;
        console.log(`✅ Encontradas ${inscricoes.length} inscrições\n`);

        if (inscricoes.length === 0) {
            console.log('❌ Nenhuma inscrição encontrada para testar');
            return;
        }

        // 3. Encontrar uma inscrição sem certificado
        const inscricaoSemCertificado = inscricoes.find(i => !i.certificado_id);
        
        if (!inscricaoSemCertificado) {
            console.log('❌ Todas as inscrições já possuem certificados');
            return;
        }

        console.log(`3. Testando geração de certificado para inscrição ${inscricaoSemCertificado.id}...`);
        console.log(`   Usuário: ${inscricaoSemCertificado.usuario_nome}`);
        console.log(`   Evento: ${inscricaoSemCertificado.evento_titulo}`);

        // 4. Gerar certificado
        const certificadoResponse = await axios.post(
            `${API_URL}/certificados/emitir/${inscricaoSemCertificado.id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('✅ Certificado gerado com sucesso!');
        console.log(`   ID do certificado: ${certificadoResponse.data.dados.id}`);
        console.log(`   Data de emissão: ${certificadoResponse.data.dados.data_emissao}\n`);

        // 5. Verificar se o certificado foi criado
        console.log('4. Verificando se o certificado foi criado...');
        const certificadosResponse = await axios.get(`${API_URL}/certificados`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const certificados = certificadosResponse.data.dados.certificados;
        const certificadoCriado = certificados.find(c => c.inscricao_id === inscricaoSemCertificado.id);
        
        if (certificadoCriado) {
            console.log('✅ Certificado encontrado na lista!');
            console.log(`   ID: ${certificadoCriado.id}`);
            console.log(`   Inscrição: ${certificadoCriado.inscricao_id}`);
            console.log(`   Usuário: ${certificadoCriado.usuario_nome}`);
            console.log(`   Evento: ${certificadoCriado.evento_titulo}`);
        } else {
            console.log('❌ Certificado não encontrado na lista');
        }

    } catch (error) {
        console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    }
}

testarCertificados(); 