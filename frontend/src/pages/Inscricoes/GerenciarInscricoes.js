import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  People, 
  CheckCircle, 
  Cancel, 
  Event,
  Person,
  Schedule
} from '@mui/icons-material';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const GerenciarInscricoes = () => {
  const { user } = useAuth();
  const [inscricoes, setInscricoes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, inscricao: null, action: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar eventos
      const eventosResponse = await api.get('/eventos');
      setEventos(eventosResponse.data.dados.eventos || []);

      // Buscar inscrições dos eventos do usuário
      const inscricoesResponse = await api.get('/inscricoes/meus-eventos');
      setInscricoes(inscricoesResponse.data.dados.inscricoes || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (inscricao) => {
    try {
      setLoading(true);
      setError(null);

      await api.put(`/inscricoes/${inscricao.id}/aprovar`);
      
      // Atualizar a lista
      await fetchData();
      
      setConfirmDialog({ open: false, inscricao: null, action: '' });
    } catch (err) {
      console.error('Erro ao aprovar inscrição:', err);
      setError('Erro ao aprovar inscrição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejeitar = async (inscricao) => {
    try {
      setLoading(true);
      setError(null);

      await api.put(`/inscricoes/${inscricao.id}/rejeitar`);
      
      // Atualizar a lista
      await fetchData();
      
      setConfirmDialog({ open: false, inscricao: null, action: '' });
    } catch (err) {
      console.error('Erro ao rejeitar inscrição:', err);
      setError('Erro ao rejeitar inscrição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarCertificado = async (inscricao) => {
    try {
      setLoading(true);
      setError(null);

      await api.post(`/certificados/emitir/${inscricao.id}`);
      
      // Atualizar a lista
      await fetchData();
      
      setConfirmDialog({ open: false, inscricao: null, action: '' });
    } catch (err) {
      console.error('Erro ao gerar certificado:', err);
      setError('Erro ao gerar certificado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInscricoes = selectedEvento 
    ? inscricoes.filter(inscricao => inscricao.evento_id === parseInt(selectedEvento))
    : inscricoes;

  const inscricoesPendentes = filteredInscricoes.filter(inscricao => inscricao.status === 'pendente');
  const inscricoesAprovadas = filteredInscricoes.filter(inscricao => inscricao.status === 'aprovada');
  const inscricoesComCertificado = filteredInscricoes.filter(inscricao => inscricao.certificado_id);

  const getStatusConfig = (status) => {
    const configs = {
      'pendente': { label: 'Pendente', color: 'warning' },
      'aprovada': { label: 'Aprovada', color: 'success' },
      'rejeitada': { label: 'Rejeitada', color: 'error' }
    };
    return configs[status] || configs.pendente;
  };

  if (loading && inscricoes.length === 0) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Carregando...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <People color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Gerenciar Inscrições
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              Filtros
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Filtrar por Evento</InputLabel>
              <Select
                value={selectedEvento}
                onChange={(e) => setSelectedEvento(e.target.value)}
                label="Filtrar por Evento"
              >
                <MenuItem value="">Todos os Eventos</MenuItem>
                {eventos.map((evento) => (
                  <MenuItem key={evento.id} value={evento.id}>
                    {evento.titulo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Inscrições
              </Typography>
              <Typography variant="h4">
                {filteredInscricoes.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendentes
              </Typography>
              <Typography variant="h4" color="warning.main">
                {inscricoesPendentes.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Aprovadas
              </Typography>
              <Typography variant="h4" color="success.main">
                {inscricoesAprovadas.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Com Certificado
              </Typography>
              <Typography variant="h4" color="info.main">
                {inscricoesComCertificado.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Lista de Inscrições */}
        <Typography variant="h6" mb={2}>
          Inscrições
        </Typography>

        {filteredInscricoes.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                Nenhuma inscrição encontrada
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {filteredInscricoes.map((inscricao) => (
              <Grid item xs={12} md={6} lg={4} key={inscricao.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Person color="primary" />
                      <Typography variant="h6" noWrap>
                        {inscricao.usuario_nome}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Event color="action" />
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {inscricao.evento_titulo}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Schedule color="action" />
                      <Typography variant="body2" color="textSecondary">
                        Inscrito em: {new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>

                    <Box mb={2}>
                      <Chip
                        label={getStatusConfig(inscricao.status).label}
                        color={getStatusConfig(inscricao.status).color}
                        size="small"
                      />
                      {inscricao.certificado_id && (
                        <Chip
                          label="Certificado Emitido"
                          color="success"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    {inscricao.status === 'pendente' && (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={() => setConfirmDialog({ 
                            open: true, 
                            inscricao, 
                            action: 'aprovar' 
                          })}
                          disabled={loading}
                        >
                          Aprovar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => setConfirmDialog({ 
                            open: true, 
                            inscricao, 
                            action: 'rejeitar' 
                          })}
                          disabled={loading}
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {inscricao.status === 'aprovada' && !inscricao.certificado_id && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircle />}
                        onClick={() => setConfirmDialog({ 
                          open: true, 
                          inscricao, 
                          action: 'certificado' 
                        })}
                        disabled={loading}
                      >
                        Gerar Certificado
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog de Confirmação */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={
            confirmDialog.action === 'aprovar' ? 'Confirmar Aprovação' :
            confirmDialog.action === 'rejeitar' ? 'Confirmar Rejeição' :
            'Confirmar Emissão de Certificado'
          }
          message={
            confirmDialog.action === 'aprovar' ? 
              `Deseja aprovar a inscrição de ${confirmDialog.inscricao?.usuario_nome} no evento "${confirmDialog.inscricao?.evento_titulo}"?` :
            confirmDialog.action === 'rejeitar' ? 
              `Deseja rejeitar a inscrição de ${confirmDialog.inscricao?.usuario_nome} no evento "${confirmDialog.inscricao?.evento_titulo}"?` :
              `Deseja gerar o certificado para ${confirmDialog.inscricao?.usuario_nome} no evento "${confirmDialog.inscricao?.evento_titulo}"?`
          }
          onConfirm={() => {
            if (confirmDialog.action === 'aprovar') {
              handleAprovar(confirmDialog.inscricao);
            } else if (confirmDialog.action === 'rejeitar') {
              handleRejeitar(confirmDialog.inscricao);
            } else if (confirmDialog.action === 'certificado') {
              handleGerarCertificado(confirmDialog.inscricao);
            }
          }}
          onClose={() => setConfirmDialog({ open: false, inscricao: null, action: '' })}
          confirmText={
            confirmDialog.action === 'aprovar' ? 'Aprovar' :
            confirmDialog.action === 'rejeitar' ? 'Rejeitar' :
            'Gerar'
          }
        />
      </Box>
    </Layout>
  );
};

export default GerenciarInscricoes; 