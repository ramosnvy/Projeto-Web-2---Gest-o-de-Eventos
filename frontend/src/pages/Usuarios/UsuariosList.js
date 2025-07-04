import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import { Add, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UsuariosList = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, usuario: null });

  // Definir colunas da tabela
  const columns = [
    {
      field: 'nome',
      headerName: 'Nome',
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 250,
    },
    {
      field: 'tipo_usuario',
      headerName: 'Tipo',
      type: 'tipo_usuario',
      minWidth: 150,
    },
    {
      field: 'data_criacao',
      headerName: 'Data de Criação',
      type: 'date',
      minWidth: 150,
    }
  ];

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/usuarios');
      setUsuarios(response.data.dados.usuarios || []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Erro ao carregar usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario) => {
    navigate(`/usuarios/editar/${usuario.id}`);
  };

  const handleView = (usuario) => {
    navigate(`/usuarios/visualizar/${usuario.id}`);
  };

  const handleDelete = (usuario) => {
    setDeleteDialog({ open: true, usuario });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/usuarios/${deleteDialog.usuario.id}`);
      
      // Atualizar lista
      setUsuarios(usuarios.filter(u => u.id !== deleteDialog.usuario.id));
      
      // Fechar dialog
      setDeleteDialog({ open: false, usuario: null });
      
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setError('Erro ao excluir usuário. Tente novamente.');
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <People color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              Usuários
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/usuarios/novo')}
          >
            Novo Usuário
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Usuários */}
        <DataTable
          columns={columns}
          data={usuarios}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          title="Lista de Usuários"
        />

        {/* Botão Flutuante para Mobile */}
        <Tooltip title="Novo Usuário">
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'flex', md: 'none' }
            }}
            onClick={() => navigate('/usuarios/novo')}
          >
            <Add />
          </Fab>
        </Tooltip>

        {/* Dialog de Confirmação de Exclusão */}
        <ConfirmDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, usuario: null })}
          onConfirm={confirmDelete}
          title="Excluir Usuário"
          message={`Tem certeza que deseja excluir o usuário "${deleteDialog.usuario?.nome}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          severity="error"
        />
      </Box>
    </Layout>
  );
};

export default UsuariosList; 