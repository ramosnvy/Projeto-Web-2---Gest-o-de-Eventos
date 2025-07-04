import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  Button
} from '@mui/material';
import { School, Download } from '@mui/icons-material';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import Layout from '../../components/common/Layout';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CertificadosList = () => {
  const { user } = useAuth();
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, certificado: null });

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
      field: 'data_emissao',
      headerName: 'Data de Emissão',
      type: 'datetime',
      minWidth: 180,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      render: (value) => (
        <Chip
          label={value === 'valido' ? 'Válido' : 'Expirado'}
          color={value === 'valido' ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: 'acoes',
      headerName: 'Ações',
      minWidth: 120,
      render: (value, row) => {
        if (user?.tipo_usuario === 'administrador' || user?.tipo_usuario === 'organizador') {
          return (
            <Button color="error" size="small" onClick={() => setDeleteDialog({ open: true, certificado: row })}>
              Excluir
            </Button>
          );
        }
        return null;
      }
    }
  ];

  useEffect(() => {
    fetchCertificados();
  }, []);

  const fetchCertificados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar certificados baseado no tipo de usuário
      let endpoint = '/certificados';
      if (user?.tipo_usuario === 'organizador') {
        endpoint = '/certificados/meus-eventos';
      }
      
      const response = await api.get(endpoint);
      setCertificados(response.data.dados?.certificados || []);
    } catch (err) {
      console.error('Erro ao buscar certificados:', err);
      setError('Erro ao carregar certificados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/certificados/${deleteDialog.certificado.id}`);
      setCertificados(certificados.filter(c => c.id !== deleteDialog.certificado.id));
      setDeleteDialog({ open: false, certificado: null });
    } catch (err) {
      setError('Erro ao excluir certificado. Tente novamente.');
    }
  };

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <School color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            Certificados
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabela de Certificados */}
        <DataTable
          columns={columns}
          data={certificados}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          title="Lista de Certificados Emitidos"
          searchable={true}
          filterable={true}
        />
        <ConfirmDialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, certificado: null })}
          onConfirm={confirmDelete}
          title="Excluir Certificado"
          message={`Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          severity="error"
        />
      </Box>
    </Layout>
  );
};

export default CertificadosList; 