import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Fab,
  Tooltip
} from '@mui/material';
import { Add, Event } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const EventosList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, evento: null });

  // Definir colunas da tabela
  const columns = [
    {
      field: 'titulo',
      headerName: 'Título',
      minWidth: 200,
    },
    {
      field: 'descricao',
      headerName: 'Descrição',
      minWidth: 300,
      render: (value) => value?.length > 100 ? `${value.substring(0, 100)}...` : value
    },
    {
      field: 'data_evento',
      headerName: 'Data do Evento',
      type: 'datetime',
      minWidth: 150,
    },
    {
      field: 'organizador',
      headerName: 'Organizador',
      minWidth: 150,
      render: (value, row) => row.organizador_nome || 'N/A'
    },
    {
      field: 'inscricoes_count',
      headerName: 'Inscrições',
      align: 'center',
      minWidth: 100,
      render: (value, row) => row.total_inscricoes || 0
    }
  ];

  useEffect(() => {
    fetchEventos();
  }, [page, rowsPerPage, user?.tipo_usuario]);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar eventos baseado no tipo de usuário
      let endpoint = '/eventos';
      let params = {};
      
      if (user?.tipo_usuario === 'organizador') {
        endpoint = '/eventos/meus';
        // Endpoint /meus não precisa de paginação
      } else if (user?.tipo_usuario === 'participante') {
        endpoint = '/eventos/futuros';
        // Endpoint /futuros não precisa de paginação
      } else {
        // Endpoint /eventos (admin) precisa de paginação
        params = {
          page: page + 1, // Converter para base 1 (backend espera página 1, 2, 3...)
          limit: rowsPerPage
        };
      }
      
      const response = await api.get(endpoint, { params });
      
      // Verificar se a resposta tem a estrutura esperada
      if (response.data.sucesso) {
        setEventos(response.data.dados.eventos || []);
      } else {
        setError('Erro ao carregar eventos: ' + (response.data.mensagem || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      
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
        setError('Erro ao carregar eventos. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (evento) => {
    navigate(`/eventos/editar/${evento.id}`);
  };

  const handleView = (evento) => {
    navigate(`/eventos/visualizar/${evento.id}`);
  };

  const handleDelete = (evento) => {
    setDeleteDialog({ open: true, evento });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/eventos/${deleteDialog.evento.id}`);
      
      // Atualizar lista
      setEventos(eventos.filter(e => e.id !== deleteDialog.evento.id));
      
      // Fechar dialog
      setDeleteDialog({ open: false, evento: null });
      
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      setError('Erro ao excluir evento. Tente novamente.');
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const canCreateEvent = user?.tipo_usuario === 'administrador' || user?.tipo_usuario === 'organizador';

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Event color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              Eventos
            </Typography>
          </Box>
          {canCreateEvent && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/eventos/novo')}
            >
              Novo Evento
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Eventos */}
        <DataTable
          columns={columns}
          data={eventos}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={canCreateEvent ? handleEdit : undefined}
          onDelete={canCreateEvent ? handleDelete : undefined}
          onView={handleView}
          title="Lista de Eventos"
        />

        {/* Botão Flutuante para Mobile */}
        {canCreateEvent && (
          <Tooltip title="Novo Evento">
            <Fab
              color="primary"
              aria-label="add"
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                display: { xs: 'flex', md: 'none' }
              }}
              onClick={() => navigate('/eventos/novo')}
            >
              <Add />
            </Fab>
          </Tooltip>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <ConfirmDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, evento: null })}
          onConfirm={confirmDelete}
          title="Excluir Evento"
          message={`Tem certeza que deseja excluir o evento "${deleteDialog.evento?.titulo}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          severity="error"
        />
      </Box>
    </Layout>
  );
};

export default EventosList; 