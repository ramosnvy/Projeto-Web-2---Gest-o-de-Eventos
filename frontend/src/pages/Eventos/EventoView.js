import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Event,
  Person,
  CalendarToday,
  Category,
  People,
  Description,
  LocationOn,
  HowToReg,
  Cancel
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';

const EventoView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [isInscrito, setIsInscrito] = useState(false);
  const [inscricaoLoading, setInscricaoLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEvento();
  }, [id]);

  const fetchEvento = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados do evento
      const eventoResponse = await api.get(`/eventos/${id}`);
      setEvento(eventoResponse.data.dados);

      // Buscar inscrições do evento (apenas para organizadores e administradores)
      if (user?.tipo_usuario === 'organizador' || user?.tipo_usuario === 'administrador') {
        try {
          const inscricoesResponse = await api.get(`/inscricoes/evento/${id}`);
          setInscricoes(inscricoesResponse.data.dados.inscricoes || []);
        } catch (err) {
          console.warn('Erro ao buscar inscrições:', err);
        }
      }

      // Verificar se o participante está inscrito
      if (user?.tipo_usuario === 'participante') {
        try {
          const inscricaoResponse = await api.get(`/inscricoes/verificar/${id}`);
          setIsInscrito(inscricaoResponse.data.dados.inscrito || false);
        } catch (err) {
          console.warn('Erro ao verificar inscrição:', err);
        }
      }

    } catch (err) {
      console.error('Erro ao buscar evento:', err);
      setError('Erro ao carregar evento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/eventos/editar/${id}`);
  };

  const handleInscricao = async () => {
    try {
      setInscricaoLoading(true);
      
      if (isInscrito) {
        // Cancelar inscrição
        await api.delete(`/inscricoes/cancelar/${id}`);
        setIsInscrito(false);
        setSnackbar({
          open: true,
          message: 'Inscrição cancelada com sucesso!',
          severity: 'success'
        });
      } else {
        // Fazer inscrição - não enviar usuario_id, o backend pegará do token
        await api.post('/inscricoes', { evento_id: id });
        setIsInscrito(true);
        setSnackbar({
          open: true,
          message: 'Inscrição realizada com sucesso!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Erro ao processar inscrição:', err);
      setSnackbar({
        open: true,
        message: 'Erro ao processar inscrição. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setInscricaoLoading(false);
    }
  };

  const canEdit = user?.tipo_usuario === 'administrador' || 
                 (user?.tipo_usuario === 'organizador' && evento?.organizador_id === user?.id);

  const canInscricao = user?.tipo_usuario === 'participante';

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !evento) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Evento não encontrado'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/eventos')}
        >
          Voltar
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Event color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              {evento.titulo}
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/eventos')}
            >
              Voltar
            </Button>
            {canEdit && (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Editar
              </Button>
            )}
            {canInscricao && (
              <Button
                variant={isInscrito ? "outlined" : "contained"}
                color={isInscrito ? "error" : "primary"}
                startIcon={isInscrito ? <Cancel /> : <HowToReg />}
                onClick={handleInscricao}
                disabled={inscricaoLoading}
              >
                {inscricaoLoading ? (
                  <CircularProgress size={20} />
                ) : isInscrito ? (
                  'Cancelar Inscrição'
                ) : (
                  'Inscrever-se'
                )}
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Informações Principais */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Detalhes do Evento
              </Typography>
              
              <Grid container spacing={3}>
                {/* Título */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Event color="primary" />
                    <Typography variant="h6">
                      {evento.titulo}
                    </Typography>
                  </Box>
                </Grid>

                {/* Descrição */}
                <Grid item xs={12}>
                  <Box display="flex" alignItems="flex-start" gap={1} mb={2}>
                    <Description color="action" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Descrição
                      </Typography>
                      <Typography variant="body1">
                        {evento.descricao}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Data do Evento */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Data e Hora
                      </Typography>
                      <Typography variant="body1">
                        {new Date(evento.data_evento).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Organizador */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Organizador
                      </Typography>
                      <Typography variant="body1">
                        {evento.organizador_nome || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Categoria */}
                {evento.categoria && (
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Category color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          Categoria
                        </Typography>
                        <Chip
                          label={evento.categoria.nome}
                          color="primary"
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Grid>
                )}

                {/* Status */}
                <Grid item xs={12} md={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <People color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary">
                        Inscrições
                      </Typography>
                      <Typography variant="body1">
                        {inscricoes.length} participantes
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Sidebar com Informações Adicionais */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Rápidas
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data de Criação"
                      secondary={new Date(evento.data_criacao || evento.data_evento).toLocaleDateString('pt-BR')}
                    />
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Person fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Organizador"
                      secondary={evento.organizador_nome || 'N/A'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Lista de Inscrições (apenas para organizadores e administradores) */}
            {(user?.tipo_usuario === 'organizador' || user?.tipo_usuario === 'administrador') && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Participantes ({inscricoes.length})
                  </Typography>
                  
                  {inscricoes.length > 0 ? (
                    <List dense>
                      {inscricoes.slice(0, 5).map((inscricao) => (
                        <ListItem key={inscricao.id}>
                          <ListItemIcon>
                            <Person fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={inscricao.usuario?.nome || inscricao.usuario_nome}
                            secondary={new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}
                          />
                        </ListItem>
                      ))}
                      {inscricoes.length > 5 && (
                        <ListItem>
                          <ListItemText
                            primary={`+${inscricoes.length - 5} mais participantes`}
                            primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                          />
                        </ListItem>
                      )}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Nenhum participante inscrito ainda.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        {/* Snackbar para feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
};

export default EventoView; 