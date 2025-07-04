import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import { Assessment, Timeline } from '@mui/icons-material';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';

const AcessosList = () => {
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({});

  // Definir colunas da tabela
  const columns = [
    {
      field: 'usuario_nome',
      headerName: 'Usuário',
      minWidth: 200,
      render: (value, row) => row.usuario?.nome || 'N/A'
    },
    {
      field: 'evento_titulo',
      headerName: 'Evento',
      minWidth: 250,
      render: (value, row) => row.evento?.titulo || 'N/A'
    },
    {
      field: 'tipo_acesso',
      headerName: 'Tipo de Acesso',
      minWidth: 150,
      render: (value) => (
        <Chip
          label={value === 'inscricao' ? 'Inscrição' : 'Certificado'}
          color={value === 'inscricao' ? 'primary' : 'success'}
          size="small"
        />
      )
    },
    {
      field: 'data_acesso',
      headerName: 'Data do Acesso',
      type: 'datetime',
      minWidth: 180,
    },
    {
      field: 'detalhes.status',
      headerName: 'Status',
      minWidth: 120,
      render: (value, row) => (
        <Chip
          label={row.detalhes?.status === 'ativo' ? 'Ativo' : 'Inativo'}
          color={row.detalhes?.status === 'ativo' ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'detalhes.ip_acesso',
      headerName: 'IP',
      minWidth: 120,
      render: (value, row) => row.detalhes?.ip_acesso || 'N/A'
    }
  ];

  const fetchAcessos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/acessos-certificados', {
        params: {
          page: page + 1, // Backend espera página começando em 1
          limit: rowsPerPage
        }
      });
      
      // Verificar se a resposta tem a estrutura esperada
      if (response.data.sucesso) {
        setAcessos(response.data.dados || []);
      } else {
        setError('Erro ao carregar acessos: ' + (response.data.mensagem || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('Erro ao buscar acessos:', err);
      
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
        setError('Erro ao carregar acessos. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/acessos-certificados/estatisticas/total');
      setStats(response.data.dados || {});
    } catch (err) {
      console.warn('Erro ao buscar estatísticas:', err);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    fetchAcessos();
    fetchStats();
  }, [page, rowsPerPage]);

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Assessment color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Acessos a Certificados
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Estatísticas */}
        <Box mb={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Estatísticas de Acesso
            </Typography>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box display="flex" alignItems="center" gap={1}>
                <Timeline color="primary" />
                <Typography variant="body2">
                  Total de Acessos: <strong>{stats.totalAcessos || 0}</strong>
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Timeline color="success" />
                <Typography variant="body2">
                  Acessos Ativos: <strong>{stats.acessosAtivos || 0}</strong>
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Timeline color="info" />
                <Typography variant="body2">
                  Inscrições: <strong>{stats.totalInscricoes || 0}</strong>
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Timeline color="warning" />
                <Typography variant="body2">
                  Certificados: <strong>{stats.totalCertificados || 0}</strong>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Tabela de Acessos */}
        <DataTable
          columns={columns}
          data={acessos}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          title="Log de Acessos a Certificados"
          searchable={true}
          filterable={true}
        />
      </Box>
    </Layout>
  );
};

export default AcessosList; 