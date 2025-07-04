import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { People, School, CheckCircle, Download } from '@mui/icons-material';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const InscricoesList = () => {
  const { user } = useAuth();
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, inscricao: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, inscricao: null });

  // Definir colunas da tabela
  const columns = [
    {
      field: 'usuario_nome',
      headerName: 'Participante',
      minWidth: 200,
      render: (value, row) => row.usuario_nome || 'N/A'
    },
    {
      field: 'evento_titulo',
      headerName: 'Evento',
      minWidth: 250,
      render: (value, row) => row.evento_titulo || 'N/A'
    },
    {
      field: 'data_inscricao',
      headerName: 'Data da Inscrição',
      type: 'datetime',
      minWidth: 180,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      render: (value) => (
        <Chip
          label={value === 'confirmada' ? 'Confirmada' : 'Pendente'}
          color={value === 'confirmada' ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'certificado',
      headerName: 'Certificado',
      minWidth: 150,
      render: (value, row) => {
        if (row.certificado_id) {
          return (
            <Chip
              label="Emitido"
              color="success"
              size="small"
              icon={<CheckCircle />}
            />
          );
        } else {
          return (
            <Chip
              label="Pendente"
              color="warning"
              size="small"
            />
          );
        }
      }
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      minWidth: 150,
      render: (value, row) => {
        // Apenas organizadores/admin podem excluir inscrições
        if (user?.tipo_usuario === 'organizador' || user?.tipo_usuario === 'administrador') {
          return (
            <Button color="error" size="small" onClick={() => setDeleteDialog({ open: true, inscricao: row })}>
              Excluir
            </Button>
          );
        }
        return null;
      }
    }
  ];

  useEffect(() => {
    fetchInscricoes();
  }, []);

  const fetchInscricoes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar inscrições baseado no tipo de usuário
      let endpoint = '/inscricoes';
      if (user?.tipo_usuario === 'organizador') {
        endpoint = '/inscricoes/meus-eventos';
      }
      
      const response = await api.get(endpoint);
      setInscricoes(response.data.dados?.inscricoes || []);
    } catch (err) {
      console.error('Erro ao buscar inscrições:', err);
      setError('Erro ao carregar inscrições. Tente novamente.');
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
      await fetchInscricoes();
      
      setConfirmDialog({ open: false, inscricao: null });
    } catch (err) {
      console.error('Erro ao emitir certificado:', err);
      setError(err.response?.data?.message || 'Erro ao emitir certificado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/inscricoes/${deleteDialog.inscricao.id}`);
      setInscricoes(inscricoes.filter(i => i.id !== deleteDialog.inscricao.id));
      setDeleteDialog({ open: false, inscricao: null });
    } catch (err) {
      setError('Erro ao excluir inscrição. Tente novamente.');
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
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <People color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Inscrições
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Inscrições */}
        <DataTable
          columns={columns}
          data={inscricoes}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          title="Lista de Inscrições"
          searchable={true}
          filterable={true}
        />

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

        <ConfirmDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, inscricao: null })}
          onConfirm={confirmDelete}
          title="Excluir Inscrição"
          message={`Tem certeza que deseja excluir esta inscrição? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          severity="error"
        />
      </Box>
    </Layout>
  );
};

export default InscricoesList; 