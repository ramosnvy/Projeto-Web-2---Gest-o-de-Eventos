import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Button
} from '@mui/material';
import { People, Event } from '@mui/icons-material';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';

const MinhasInscricoes = () => {
  const { user } = useAuth();
  const [inscricoes, setInscricoes] = useState([]);
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
      render: (value, row) => row.evento_titulo || 'N/A'
    },
    {
      field: 'evento_data_evento',
      headerName: 'Data do Evento',
      type: 'datetime',
      minWidth: 180,
      render: (value, row) => row.data_evento ? new Date(row.data_evento).toLocaleString('pt-BR') : 'N/A'
    },
    {
      field: 'data_inscricao',
      headerName: 'Data da Inscrição',
      type: 'datetime',
      minWidth: 180,
      render: (value, row) => row.data_inscricao ? new Date(row.data_inscricao).toLocaleString('pt-BR') : 'N/A'
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      render: (value, row) => {
        const status = row.status || 'pendente';
        const statusConfig = {
          'pendente': { label: 'Pendente', color: 'warning' },
          'aprovada': { label: 'Aprovada', color: 'success' },
          'rejeitada': { label: 'Rejeitada', color: 'error' }
        };
        const config = statusConfig[status] || statusConfig.pendente;
        return (
          <Chip
            label={config.label}
            color={config.color}
            size="small"
          />
        );
      }
    }
  ];

  useEffect(() => {
    fetchMinhasInscricoes();
  }, [page, rowsPerPage]);

  const fetchMinhasInscricoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/inscricoes/minhas');
      
      // Verificar se a resposta tem a estrutura esperada
      if (response.data.sucesso) {
        setInscricoes(response.data.dados.inscricoes || []);
      } else {
        setError('Erro ao carregar inscrições: ' + (response.data.mensagem || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('Erro ao buscar inscrições:', err);
      
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
        setError('Erro ao carregar inscrições. Tente novamente.');
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
          <People color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Minhas Inscrições
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Inscrições */}
        <DataTable
          columns={columns}
          data={inscricoes}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          title="Minhas Inscrições em Eventos"
          searchable={true}
          filterable={true}
        />
      </Box>
    </Layout>
  );
};

export default MinhasInscricoes; 