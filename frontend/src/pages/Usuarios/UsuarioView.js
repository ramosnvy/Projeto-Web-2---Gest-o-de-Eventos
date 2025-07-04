import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import { People, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/common/Layout';

const UsuarioView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/usuarios/${id}`);
        setUsuario(response.data.dados);
      } catch (err) {
        setError('Erro ao carregar usuário.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsuario();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box p={3}>
          <Typography color="error">{error}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')} sx={{ mt: 2 }}>
            Voltar
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <People color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Visualizar Usuário
          </Typography>
        </Box>
        <Paper sx={{ p: 3, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>Dados do Usuário</Typography>
          <Typography><b>Nome:</b> {usuario?.nome}</Typography>
          <Typography><b>Email:</b> {usuario?.email}</Typography>
          <Typography><b>Tipo:</b> {usuario?.tipo_usuario}</Typography>
          <Typography><b>Data de Criação:</b> {usuario?.data_criacao ? new Date(usuario.data_criacao).toLocaleString('pt-BR') : '-'}</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/usuarios')} sx={{ mt: 3 }}>
            Voltar
          </Button>
        </Paper>
      </Box>
    </Layout>
  );
};

export default UsuarioView; 