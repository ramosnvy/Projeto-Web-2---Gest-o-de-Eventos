import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../services/AuthContext';
import { Box, Button, TextField, Typography, Paper, MenuItem } from '@mui/material';

export default function RegisterPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = React.useState(null);

  const formik = useFormik({
    initialValues: { nome: '', email: '', senha: '', tipo_usuario: 'participante' },
    validationSchema: Yup.object({
      nome: Yup.string().min(2, 'Mínimo 2 caracteres').required('Obrigatório'),
      email: Yup.string().email('Email inválido').required('Obrigatório'),
      senha: Yup.string().min(6, 'Mínimo 6 caracteres').required('Obrigatório'),
      tipo_usuario: Yup.string().oneOf(['participante', 'organizador'], 'Tipo inválido').required('Obrigatório'),
    }),
    onSubmit: async (values) => {
      setErro(null);
      try {
        const res = await registrar(values);
        if (res.data.sucesso) {
          navigate('/');
        } else {
          setErro(res.data.mensagem || 'Falha no cadastro');
        }
      } catch (e) {
        setErro('Falha ao conectar ao servidor');
      }
    },
  });

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>Cadastro</Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="nome"
            name="nome"
            label="Nome"
            value={formik.values.nome}
            onChange={formik.handleChange}
            error={formik.touched.nome && Boolean(formik.errors.nome)}
            helperText={formik.touched.nome && formik.errors.nome}
          />
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
          <TextField
            select
            fullWidth
            margin="normal"
            id="tipo_usuario"
            name="tipo_usuario"
            label="Tipo de Usuário"
            value={formik.values.tipo_usuario}
            onChange={formik.handleChange}
            error={formik.touched.tipo_usuario && Boolean(formik.errors.tipo_usuario)}
            helperText={formik.touched.tipo_usuario && formik.errors.tipo_usuario}
          >
            <MenuItem value="participante">Participante</MenuItem>
            <MenuItem value="organizador">Organizador</MenuItem>
          </TextField>
          {erro && <Typography color="error" mt={1}>{erro}</Typography>}
          <Button color="primary" variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>
            Cadastrar
          </Button>
        </form>
        <Typography mt={2} variant="body2">
          Já tem conta? <Link to="/login">Entrar</Link>
        </Typography>
      </Paper>
    </Box>
  );
} 