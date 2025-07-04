import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Search,
  FilterList
} from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  loading = false,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  filterable = true,
  title = 'Tabela de Dados'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // Filtrar dados baseado no termo de busca
  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [data, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getCellValue = (item, column) => {
    if (column.render) {
      return column.render(item[column.field], item);
    }
    
    const value = item[column.field];
    
    // Formatação específica por tipo
    if (column.type === 'date' && value) {
      return new Date(value).toLocaleDateString('pt-BR');
    }
    
    if (column.type === 'datetime' && value) {
      return new Date(value).toLocaleString('pt-BR');
    }
    
    if (column.type === 'status' && value) {
      return (
        <Chip
          label={value}
          color={value === 'ativo' || value === 'aprovado' ? 'success' : 'error'}
          size="small"
        />
      );
    }
    
    if (column.type === 'tipo_usuario' && value) {
      const colors = {
        administrador: 'error',
        organizador: 'warning',
        participante: 'info'
      };
      return (
        <Chip
          label={value.charAt(0).toUpperCase() + value.slice(1)}
          color={colors[value] || 'default'}
          size="small"
        />
      );
    }
    
    return value;
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Header da Tabela */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {searchable && (
              <TextField
                size="small"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 200 }}
              />
            )}
            {filterable && (
              <Tooltip title="Filtros">
                <IconButton size="small">
                  <FilterList />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {/* Tabela */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.headerName}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  Ações
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} align="center">
                  <Box display="flex" alignItems="center" justifyContent="center" py={4}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>Carregando...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} align="center">
                  <Typography color="textSecondary" py={4}>
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum dado disponível'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover key={row.id || index}>
                    {columns.map((column) => (
                      <TableCell key={column.field} align={column.align || 'left'}>
                        {getCellValue(row, column)}
                      </TableCell>
                    ))}
                    {(onEdit || onDelete || onView) && (
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          {onView && (
                            <Tooltip title="Visualizar">
                              <IconButton
                                size="small"
                                onClick={() => onView(row)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => onEdit(row)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => onDelete(row)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      {!loading && filteredData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      )}
    </Paper>
  );
};

export default DataTable; 