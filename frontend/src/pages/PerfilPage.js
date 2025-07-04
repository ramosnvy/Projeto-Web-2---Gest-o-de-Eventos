import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { Person, Save } from '@mui/icons-material';
import { useAuth } from '../services/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import Layout from '../components/common/Layout';

const PerfilPage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Schema de validação
  const validationSchema = Yup.object({
    nome: Yup.string()
      .required('Nome é obrigatório')
      .min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: Yup.string()
      .email('Email inválido')
      .required('Email é obrigatório'),
    senha_atual: Yup.string()
      .min(6, 'Senha deve ter pelo menos 6 caracteres'),
    nova_senha: Yup.string()
      .min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    confirmar_senha: Yup.string()
      .oneOf([Yup.ref('nova_senha'), null], 'Senhas devem ser iguais')
  });

  // Formulário com Formik
  const formik = useFormik({
    initialValues: {
      nome: user?.nome || '',
      email: user?.email || '',
      senha_atual: '',
      nova_senha: '',
      confirmar_senha: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        const updateData = {
          nome: values.nome,
          email: values.email
        };

        // Se forneceu senha atual e nova senha, incluir na atualização
        if (values.senha_atual && values.nova_senha) {
          updateData.senha_atual = values.senha_atual;
          updateData.nova_senha = values.nova_senha;
        }

        const response = await api.put('/usuarios/perfil', updateData);
        
        // Atualizar dados do usuário no contexto
        updateUser(response.data.usuario);
        
        setSuccess('Perfil atualizado com sucesso!');
        
        // Limpar campos de senha
        formik.setFieldValue('senha_atual', '');
        formik.setFieldValue('nova_senha', '');
        formik.setFieldValue('confirmar_senha', '');
        
      } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
        setError(err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Person color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Meu Perfil
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Informações do Perfil */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  {/* Nome */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="nome"
                      name="nome"
                      label="Nome Completo"
                      value={formik.values.nome}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.nome && Boolean(formik.errors.nome)}
                      helperText={formik.touched.nome && formik.errors.nome}
                      disabled={loading}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={loading}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Alterar Senha (opcional)
                      </Typography>
                    </Divider>
                  </Grid>

                  {/* Senha Atual */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="senha_atual"
                      name="senha_atual"
                      label="Senha Atual"
                      type="password"
                      value={formik.values.senha_atual}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.senha_atual && Boolean(formik.errors.senha_atual)}
                      helperText={formik.touched.senha_atual && formik.errors.senha_atual}
                      disabled={loading}
                    />
                  </Grid>

                  {/* Nova Senha */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="nova_senha"
                      name="nova_senha"
                      label="Nova Senha"
                      type="password"
                      value={formik.values.nova_senha}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.nova_senha && Boolean(formik.errors.nova_senha)}
                      helperText={formik.touched.nova_senha && formik.errors.nova_senha}
                      disabled={loading}
                    />
                  </Grid>

                  {/* Confirmar Nova Senha */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="confirmar_senha"
                      name="confirmar_senha"
                      label="Confirmar Nova Senha"
                      type="password"
                      value={formik.values.confirmar_senha}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.confirmar_senha && Boolean(formik.errors.confirmar_senha)}
                      helperText={formik.touched.confirmar_senha && formik.errors.confirmar_senha}
                      disabled={loading}
                    />
                  </Grid>

                  {/* Botões */}
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading || !formik.isValid}
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Sidebar com Informações */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Avatar
                  sx={{ width: 80, height: 80, mb: 2 }}
                >
                  <Person sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6">
                  {user?.nome}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Tipo de Usuário
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.tipo_usuario === 'administrador' && 'Administrador'}
                  {user?.tipo_usuario === 'organizador' && 'Organizador'}
                  {user?.tipo_usuario === 'participante' && 'Participante'}
                </Typography>
              </Box>

              <Box mt={2}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Membro desde
                </Typography>
                <Typography variant="body1">
                  {user?.data_criacao ? new Date(user.data_criacao).toLocaleDateString('pt-BR') : 'N/A'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
};

export default PerfilPage; 