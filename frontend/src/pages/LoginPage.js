import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../services/AuthContext';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = React.useState(null);

  const formik = useFormik({
    initialValues: { email: '', senha: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Email inválido').required('Obrigatório'),
      senha: Yup.string().required('Obrigatório'),
    }),
    onSubmit: async (values) => {
      setErro(null);
      try {
        const res = await login(values.email, values.senha);
        if (res.data.sucesso) {
          navigate('/');
        } else {
          setErro(res.data.mensagem || 'Falha no login');
        }
      } catch (e) {
        setErro('Falha ao conectar ao servidor');
      }
    },
  });

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="email"
            name="email"
            label="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            margin="normal"
            id="senha"
            name="senha"
            label="Senha"
            type="password"
            value={formik.values.senha}
            onChange={formik.handleChange}
            error={formik.touched.senha && Boolean(formik.errors.senha)}
            helperText={formik.touched.senha && formik.errors.senha}
          />
          {erro && <Typography color="error" mt={1}>{erro}</Typography>}
          <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Entrar
          </Button>
        </form>
        <Typography mt={2} variant="body2">
          Não tem conta? <Link to="/registrar">Cadastre-se</Link>
        </Typography>
      </Paper>
    </Box>
  );
} 