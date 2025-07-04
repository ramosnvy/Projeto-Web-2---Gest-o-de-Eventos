import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Save, ArrowBack, Event } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';

const EventoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const isEditing = Boolean(id);

  // Schema de validação
  const validationSchema = Yup.object({
    titulo: Yup.string()
      .required('Título é obrigatório')
      .min(3, 'Título deve ter pelo menos 3 caracteres')
      .max(200, 'Título deve ter no máximo 200 caracteres'),
    descricao: Yup.string()
      .required('Descrição é obrigatória')
      .min(10, 'Descrição deve ter pelo menos 10 caracteres')
      .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
    data_evento: Yup.date()
      .required('Data do evento é obrigatória')
      .min(new Date(), 'Data do evento deve ser futura'),
    categoria_id: Yup.number()
      .required('Categoria é obrigatória'),
    ...(user?.tipo_usuario === 'administrador' && {
      organizador_id: Yup.number().required('Organizador é obrigatório')
    })
  });

  // Formulário com Formik
  const formik = useFormik({
    initialValues: {
      titulo: '',
      descricao: '',
      data_evento: '',
      categoria_id: '',
      ...(user?.tipo_usuario === 'administrador' && { organizador_id: '' })
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        const eventoData = {
          ...values,
          data_evento: new Date(values.data_evento).toISOString()
        };

        // Para organizadores, incluir automaticamente o ID do usuário logado
        if (user?.tipo_usuario === 'organizador') {
          eventoData.organizador_id = user.id;
        }

        if (isEditing) {
          await api.put(`/eventos/${id}`, eventoData);
        } else {
          await api.post('/eventos', eventoData);
        }

        navigate('/eventos');
      } catch (err) {
        console.error('Erro ao salvar evento:', err);
        setError(err.response?.data?.message || 'Erro ao salvar evento. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  });

  // Carregar dados iniciais
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        
        // Buscar categorias
        const categoriasResponse = await api.get('/categorias');
        console.log('Resposta de categorias no formulário:', categoriasResponse.data);
        console.log('Categorias encontradas no formulário:', categoriasResponse.data.dados?.categorias);
        setCategorias(categoriasResponse.data.dados.categorias || []);

        // Buscar organizadores (apenas para administradores)
        if (user?.tipo_usuario === 'administrador') {
          const organizadoresResponse = await api.get('/usuarios/tipo/organizador');
          setOrganizadores((organizadoresResponse.data.dados && organizadoresResponse.data.dados.usuarios) || []);
        }

        // Se estiver editando, buscar dados do evento
        if (isEditing) {
          const eventoResponse = await api.get(`/eventos/${id}`);
          const evento = eventoResponse.data.evento;
          
          formik.setValues({
            titulo: evento.titulo || '',
            descricao: evento.descricao || '',
            data_evento: evento.data_evento ? new Date(evento.data_evento).toISOString().slice(0, 16) : '',
            categoria_id: evento.categoria_id || '',
            ...(user?.tipo_usuario === 'administrador' && { organizador_id: evento.organizador_id || '' })
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [id, isEditing, user?.tipo_usuario]);

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
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Event color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Formulário */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Título */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="titulo"
                  name="titulo"
                  label="Título do Evento"
                  value={formik.values.titulo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.titulo && Boolean(formik.errors.titulo)}
                  helperText={formik.touched.titulo && formik.errors.titulo}
                  disabled={loading}
                />
              </Grid>

              {/* Descrição */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="descricao"
                  name="descricao"
                  label="Descrição"
                  multiline
                  rows={4}
                  value={formik.values.descricao}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.descricao && Boolean(formik.errors.descricao)}
                  helperText={formik.touched.descricao && formik.errors.descricao}
                  disabled={loading}
                />
              </Grid>

              {/* Data do Evento */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="data_evento"
                  name="data_evento"
                  label="Data e Hora do Evento"
                  type="datetime-local"
                  value={formik.values.data_evento}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.data_evento && Boolean(formik.errors.data_evento)}
                  helperText={formik.touched.data_evento && formik.errors.data_evento}
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Categoria */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={formik.touched.categoria_id && Boolean(formik.errors.categoria_id)}>
                  <InputLabel id="categoria-label">Categoria</InputLabel>
                  <Select
                    labelId="categoria-label"
                    id="categoria_id"
                    name="categoria_id"
                    value={formik.values.categoria_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={loading}
                  >
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.categoria_id && formik.errors.categoria_id && (
                    <FormHelperText>{formik.errors.categoria_id}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Organizador (apenas para administradores) */}
              {user?.tipo_usuario === 'administrador' && organizadores.length > 0 && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={formik.touched.organizador_id && Boolean(formik.errors.organizador_id)}>
                    <InputLabel id="organizador-label">Organizador</InputLabel>
                    <Select
                      labelId="organizador-label"
                      id="organizador_id"
                      name="organizador_id"
                      value={formik.values.organizador_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={loading}
                    >
                      {organizadores.map((organizador) => (
                        <MenuItem key={organizador.id} value={organizador.id}>
                          {organizador.nome}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.organizador_id && formik.errors.organizador_id && (
                      <FormHelperText>{formik.errors.organizador_id}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
              )}
            </Grid>

            {/* Botões */}
            <Box display="flex" gap={2} mt={4}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/eventos')}
                disabled={loading}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                disabled={loading || !formik.isValid}
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Layout>
  );
};

export default EventoForm; 