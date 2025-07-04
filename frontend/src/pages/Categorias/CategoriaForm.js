import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { Category, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/common/Layout';

const CategoriaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditing) {
      // Buscar dados da categoria
      const fetchCategoria = async () => {
        try {
          setInitialLoading(true);
          const response = await api.get(`/categorias/${id}`);
          setNome(response.data.dados.nome || '');
        } catch (err) {
          setError('Erro ao carregar categoria.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchCategoria();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!nome.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }
    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/categorias/${id}`, { nome });
        setSuccess('Categoria atualizada com sucesso!');
      } else {
        await api.post('/categorias', { nome });
        setSuccess('Categoria criada com sucesso!');
        setNome('');
      }
      setTimeout(() => navigate('/categorias'), 1000);
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao salvar categoria.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Category color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </Typography>
        </Box>
        <Paper sx={{ p: 3, maxWidth: 500 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nome da Categoria"
              value={nome}
              onChange={e => setNome(e.target.value)}
              fullWidth
              required
              disabled={loading}
              sx={{ mb: 3 }}
            />
            <Box display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<Save />}
                disabled={loading}
              >
                Salvar
              </Button>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/categorias')}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default CategoriaForm; 