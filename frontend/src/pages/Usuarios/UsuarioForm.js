import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Alert, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { People, Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/common/Layout';

const tiposUsuario = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'organizador', label: 'Organizador' },
  { value: 'participante', label: 'Participante' }
];

const UsuarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('participante');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEditing) {
      // Buscar dados do usuário
      const fetchUsuario = async () => {
        try {
          setInitialLoading(true);
          const response = await api.get(`/usuarios/${id}`);
          setNome(response.data.dados.nome || '');
          setEmail(response.data.dados.email || '');
          setTipoUsuario(response.data.dados.tipo_usuario || 'participante');
        } catch (err) {
          setError('Erro ao carregar usuário.');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchUsuario();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!nome.trim() || !email.trim() || (!isEditing && !senha.trim())) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/usuarios/${id}`, { nome, email, tipo_usuario: tipoUsuario });
        setSuccess('Usuário atualizado com sucesso!');
      } else {
        await api.post('/usuarios', { nome, email, senha, tipo_usuario: tipoUsuario });
        setSuccess('Usuário criado com sucesso!');
        setNome('');
        setEmail('');
        setSenha('');
        setTipoUsuario('participante');
      }
      setTimeout(() => navigate('/usuarios'), 1000);
    } catch (err) {
      setError(err.response?.data?.mensagem || 'Erro ao salvar usuário.');
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
          <People color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
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
              label="Nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              fullWidth
              required
              disabled={loading}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              required
              disabled={loading || isEditing}
              sx={{ mb: 3 }}
            />
            {!isEditing && (
              <TextField
                label="Senha"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                fullWidth
                required
                disabled={loading}
                sx={{ mb: 3 }}
              />
            )}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="tipo-usuario-label">Tipo de Usuário</InputLabel>
              <Select
                labelId="tipo-usuario-label"
                value={tipoUsuario}
                label="Tipo de Usuário"
                onChange={e => setTipoUsuario(e.target.value)}
                disabled={loading}
              >
                {tiposUsuario.map(tipo => (
                  <MenuItem key={tipo.value} value={tipo.value}>{tipo.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
                onClick={() => navigate('/usuarios')}
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

export default UsuarioForm; 