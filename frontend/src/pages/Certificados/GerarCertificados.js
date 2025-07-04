import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { School, CheckCircle, Cancel, Event, Person } from '@mui/icons-material';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const GerarCertificados = () => {
  const { user } = useAuth();
  const [inscricoes, setInscricoes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({ open: false, inscricao: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar eventos do organizador
      const eventosResponse = await api.get('/eventos/meus');
      setEventos(eventosResponse.data.dados.eventos || []);

      // Buscar inscrições dos eventos do organizador
      const inscricoesResponse = await api.get('/inscricoes/meus-eventos');
      setInscricoes(inscricoesResponse.data.dados.inscricoes || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmitirCertificado = async (inscricao) => {
    try {
      setLoading(true);
      setError(null);

      await api.post(`/certificados/emitir/${inscricao.id}`);
      
      // Atualizar a lista de inscrições
      await fetchData();
      
      setConfirmDialog({ open: false, inscricao: null });
    } catch (err) {
      console.error('Erro ao emitir certificado:', err);
      setError(err.response?.data?.message || 'Erro ao emitir certificado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInscricoes = selectedEvento 
    ? inscricoes.filter(inscricao => inscricao.evento_id === parseInt(selectedEvento))
    : inscricoes;

  const inscricoesSemCertificado = filteredInscricoes.filter(inscricao => !inscricao.certificado_id);

  if (loading && inscricoes.length === 0) {
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
          <School color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Gerar Certificados
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
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
            </Grid>
          </Grid>
        </Paper>

        {/* Estatísticas */}
        <Box display="flex" gap={2} mb={3}>
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
                Sem Certificado
              </Typography>
              <Typography variant="h4" color="warning.main">
                {inscricoesSemCertificado.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Com Certificado
              </Typography>
              <Typography variant="h4" color="success.main">
                {filteredInscricoes.length - inscricoesSemCertificado.length}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Lista de Inscrições */}
        <Typography variant="h6" mb={2}>
          Inscrições Pendentes de Certificado
        </Typography>

        {inscricoesSemCertificado.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Todas as inscrições já possuem certificados emitidos!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {inscricoesSemCertificado.map((inscricao) => (
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

                    <Typography variant="body2" color="textSecondary">
                      Inscrito em: {new Date(inscricao.data_inscricao).toLocaleDateString('pt-BR')}
                    </Typography>

                    <Box mt={2}>
                      <Chip
                        label="Aguardando Certificado"
                        color="warning"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => setConfirmDialog({ open: true, inscricao })}
                      disabled={loading}
                    >
                      Emitir Certificado
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Dialog de Confirmação */}
        <ConfirmDialog
          open={confirmDialog.open}
          title="Confirmar Emissão de Certificado"
          message={`Deseja emitir o certificado para ${confirmDialog.inscricao?.usuario_nome} no evento "${confirmDialog.inscricao?.evento_titulo}"?`}
          onConfirm={() => handleEmitirCertificado(confirmDialog.inscricao)}
          onClose={() => setConfirmDialog({ open: false, inscricao: null })}
          confirmText="Emitir"
          cancelText="Cancelar"
        />
      </Box>
    </Layout>
  );
};

export default GerarCertificados; 