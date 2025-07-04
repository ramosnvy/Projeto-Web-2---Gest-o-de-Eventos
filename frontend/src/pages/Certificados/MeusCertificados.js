import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Button
} from '@mui/material';
import { School, Download } from '@mui/icons-material';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';

const MeusCertificados = () => {
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Definir colunas da tabela
  const columns = [
    {
      field: 'evento_titulo',
      headerName: 'Evento',
      minWidth: 250,
      render: (value, row) => row.inscricao?.evento?.titulo || 'N/A'
    },
    {
      field: 'evento_data_evento',
      headerName: 'Data do Evento',
      type: 'datetime',
      minWidth: 180,
      render: (value, row) => row.inscricao?.evento?.data_evento ? new Date(row.inscricao.evento.data_evento).toLocaleString('pt-BR') : 'N/A'
    },
    {
      field: 'data_emissao',
      headerName: 'Data de Emissão',
      type: 'datetime',
      minWidth: 180,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      render: (value) => (
        <Chip
          label={value === 'valido' ? 'Válido' : 'Expirado'}
          color={value === 'valido' ? 'success' : 'error'}
          size="small"
        />
      )
    }
  ];

  useEffect(() => {
    fetchMeusCertificados();
  }, []);

  const fetchMeusCertificados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/certificados/meus');
      
      // Verificar se a resposta tem a estrutura esperada
      if (response.data.sucesso) {
        setCertificados(response.data.dados.certificados || []);
      } else {
        setError('Erro ao carregar certificados: ' + (response.data.mensagem || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('Erro ao buscar certificados:', err);
      
      // Tratar diferentes tipos de erro
      if (err.response) {
        // Erro do servidor (400, 401, 403, 500, etc.)
        if (err.response.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else if (err.response.status === 403) {
          setError('Acesso negado. Você não tem permissão para acessar esta página.');
        } else if (err.response.status === 400) {
          setError('Dados inválidos: ' + (err.response.data?.mensagem || 'Parâmetros incorretos'));
        } else {
          setError('Erro do servidor: ' + (err.response.data?.mensagem || 'Erro interno'));
        }
      } else if (err.request) {
        // Erro de rede
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Outros erros
        setError('Erro ao carregar certificados. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <School color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Meus Certificados
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Certificados */}
        <DataTable
          columns={columns}
          data={certificados}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          title="Meus Certificados"
          searchable={true}
          filterable={true}
        />
      </Box>
    </Layout>
  );
};

export default MeusCertificados; 