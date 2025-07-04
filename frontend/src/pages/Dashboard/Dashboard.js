import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Event,
  People,
  School,
  TrendingUp,
  CalendarToday,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar estatísticas baseadas no tipo de usuário
        const statsResponse = await api.get('/dashboard/stats');
        setStats(statsResponse.data.dados || {});

        // Buscar eventos recentes
        const eventsResponse = await api.get('/eventos?limit=5');
        setRecentEvents(eventsResponse.data.eventos || []);

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatCards = () => {
    const cards = [];

    if (user?.tipo_usuario === 'administrador') {
      cards.push(
        { title: 'Total de Usuários', value: stats.total_usuarios || 0, icon: <People />, color: '#1976d2' },
        { title: 'Total de Eventos', value: stats.total_eventos || 0, icon: <Event />, color: '#388e3c' },
        { title: 'Total de Inscrições', value: stats.total_inscricoes || 0, icon: <TrendingUp />, color: '#f57c00' },
        { title: 'Certificados Emitidos', value: stats.total_certificados || 0, icon: <School />, color: '#7b1fa2' }
      );
    } else if (user?.tipo_usuario === 'organizador') {
      cards.push(
        { title: 'Meus Eventos', value: stats.total_eventos || 0, icon: <Event />, color: '#1976d2' },
        { title: 'Inscrições Ativas', value: stats.total_inscricoes || 0, icon: <People />, color: '#388e3c' },
        { title: 'Certificados Emitidos', value: stats.total_certificados || 0, icon: <School />, color: '#f57c00' },
        { title: 'Eventos Ativos', value: stats.eventos_ativos || 0, icon: <CheckCircle />, color: '#7b1fa2' }
      );
    } else {
      // Participante
      cards.push(
        { title: 'Eventos Disponíveis', value: stats.eventos_disponiveis || 0, icon: <Event />, color: '#1976d2' },
        { title: 'Minhas Inscrições', value: stats.total_inscricoes || 0, icon: <People />, color: '#388e3c' },
        { title: 'Meus Certificados', value: stats.total_certificados || 0, icon: <School />, color: '#f57c00' },
        { title: 'Próximos Eventos', value: stats.proximos_eventos || 0, icon: <CalendarToday />, color: '#7b1fa2' }
      );
    }

    return cards;
  };

  const getWelcomeMessage = () => {
    const hora = new Date().getHours();
    let saudacao = 'Bom dia';
    
    if (hora >= 12 && hora < 18) {
      saudacao = 'Boa tarde';
    } else if (hora >= 18) {
      saudacao = 'Boa noite';
    }

    return `${saudacao}, ${user?.nome}!`;
  };

  const getDashboardTitle = () => {
    switch (user?.tipo_usuario) {
      case 'administrador':
        return 'Painel Administrativo';
      case 'organizador':
        return 'Painel do Organizador';
      case 'participante':
        return 'Área do Participante';
      default:
        return 'Dashboard';
    }
  };

  if (loading) {
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
        {/* Header do Dashboard */}
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            {getDashboardTitle()}
          </Typography>
          <Typography variant="h6" color="textSecondary">
            {getWelcomeMessage()}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Cards de Estatísticas */}
        <Grid container spacing={3} mb={4}>
          {getStatCards().map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="h6">
                        {card.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ color: card.color, fontWeight: 'bold' }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        color: card.color,
                        backgroundColor: `${card.color}15`,
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Conteúdo Específico por Tipo de Usuário */}
        <Grid container spacing={3}>
          {/* Eventos Recentes */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Eventos Recentes
              </Typography>
              {recentEvents.length > 0 ? (
                <List>
                  {recentEvents.map((evento, index) => (
                    <React.Fragment key={evento.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Event color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={evento.titulo}
                          secondary={new Date(evento.data_evento).toLocaleDateString('pt-BR')}
                        />
                      </ListItem>
                      {index < recentEvents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary" align="center">
                  Nenhum evento encontrado
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Ações Rápidas */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <List>
                {user?.tipo_usuario === 'administrador' && (
                  <>
                    <ListItem button onClick={() => navigate('/usuarios')}>
                      <ListItemIcon>
                        <People color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Gerenciar Usuários" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/eventos/novo')}>
                      <ListItemIcon>
                        <Event color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Criar Novo Evento" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/categorias')}>
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Gerenciar Categorias" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/certificados')}>
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Gerenciar Certificados" />
                    </ListItem>
                  </>
                )}
                {user?.tipo_usuario === 'organizador' && (
                  <>
                    <ListItem button onClick={() => navigate('/eventos/novo')}>
                      <ListItemIcon>
                        <Event color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Criar Evento" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/certificados/gerar')}>
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Emitir Certificados" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/eventos')}>
                      <ListItemIcon>
                        <CalendarToday color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Meus Eventos" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/inscricoes')}>
                      <ListItemIcon>
                        <People color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Gerenciar Inscrições" />
                    </ListItem>
                  </>
                )}
                {user?.tipo_usuario === 'participante' && (
                  <>
                    <ListItem button onClick={() => navigate('/eventos')}>
                      <ListItemIcon>
                        <Event color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Ver Eventos Disponíveis" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/meus-certificados')}>
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Meus Certificados" />
                    </ListItem>
                    <ListItem button onClick={() => navigate('/minhas-inscricoes')}>
                      <ListItemIcon>
                        <People color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Minhas Inscrições" />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {/* Informações do Sistema */}
        <Box mt={4}>
          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Info color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Informações do Sistema
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Sistema de Gestão de Eventos e Certificados - Versão 1.0
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
};

export default Dashboard; 