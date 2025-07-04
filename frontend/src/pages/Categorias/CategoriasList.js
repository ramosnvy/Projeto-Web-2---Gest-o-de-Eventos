import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import { Add, Category } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CategoriasList = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, categoria: null });

  // Definir colunas da tabela
  const columns = [
    {
      field: 'nome',
      headerName: 'Nome',
      minWidth: 200,
    },
    {
      field: 'total_eventos',
      headerName: 'Eventos',
      align: 'center',
      minWidth: 100,
      render: (value) => value || 0
    }
  ];

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar categorias com contagem de eventos
      const response = await api.get('/categorias/com-eventos');
      setCategorias(response.data.dados || []);
    } catch (err) {
      setError('Erro ao carregar categorias. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    navigate(`/categorias/editar/${categoria.id}`);
  };

  const handleDelete = (categoria) => {
    setDeleteDialog({ open: true, categoria });
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/categorias/${deleteDialog.categoria.id}`);
      
      // Atualizar lista
      setCategorias(categorias.filter(c => c.id !== deleteDialog.categoria.id));
      
      // Fechar dialog
      setDeleteDialog({ open: false, categoria: null });
      
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      setError('Erro ao excluir categoria. Tente novamente.');
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
            <Category color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              Categorias
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/categorias/novo')}
          >
            Nova Categoria
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Categorias */}
        <DataTable
          columns={columns}
          data={categorias}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          title="Lista de Categorias"
        />

        {/* Botão Flutuante para Mobile */}
        <Tooltip title="Nova Categoria">
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              display: { xs: 'flex', md: 'none' }
            }}
            onClick={() => navigate('/categorias/novo')}
          >
            <Add />
          </Fab>
        </Tooltip>

        {/* Dialog de Confirmação de Exclusão */}
        <ConfirmDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, categoria: null })}
          onConfirm={confirmDelete}
          title="Excluir Categoria"
          message={`Tem certeza que deseja excluir a categoria "${deleteDialog.categoria?.nome}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          severity="error"
        />
      </Box>
    </Layout>
  );
};

export default CategoriasList; 