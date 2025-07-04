import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container
} from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Paper sx={{ p: 6, borderRadius: 3 }}>
          <Typography variant="h1" component="h1" gutterBottom color="primary">
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Página Não Encontrada
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            A página que você está procurando não existe ou foi movida.
          </Typography>
          
          <Box display="flex" gap={2} justifyContent="center" mt={4}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={handleGoHome}
            >
              {user ? 'Ir para Dashboard' : 'Ir para Login'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
            >
              Voltar
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage; 