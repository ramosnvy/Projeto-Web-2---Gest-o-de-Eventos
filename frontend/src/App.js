import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import PerfilPage from './pages/PerfilPage';
import NotFoundPage from './pages/NotFoundPage';

// Páginas de Eventos
import EventosList from './pages/Eventos/EventosList';
import EventoForm from './pages/Eventos/EventoForm';
import EventoView from './pages/Eventos/EventoView';

// Páginas de Usuários
import UsuariosList from './pages/Usuarios/UsuariosList';
import UsuarioForm from './pages/Usuarios/UsuarioForm';
import UsuarioView from './pages/Usuarios/UsuarioView';

// Páginas de Inscrições
import InscricoesList from './pages/Inscricoes/InscricoesList';
import MinhasInscricoes from './pages/Inscricoes/MinhasInscricoes';
import GerenciarInscricoes from './pages/Inscricoes/GerenciarInscricoes';

// Páginas de Certificados
import CertificadosList from './pages/Certificados/CertificadosList';
import MeusCertificados from './pages/Certificados/MeusCertificados';
import GerarCertificados from './pages/Certificados/GerarCertificados';

// Páginas de Categorias
import CategoriasList from './pages/Categorias/CategoriasList';
import CategoriaForm from './pages/Categorias/CategoriaForm';

// Páginas de Acessos (MongoDB)
import AcessosList from './pages/Acessos/AcessosList';

// Rota protegida
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.tipo_usuario)) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        
        {/* Rotas protegidas */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        
        {/* Rotas de Eventos */}
        <Route path="/eventos" element={
          <PrivateRoute><EventosList /></PrivateRoute>
        } />
        <Route path="/eventos/novo" element={
          <PrivateRoute roles={['administrador', 'organizador']}><EventoForm /></PrivateRoute>
        } />
        <Route path="/eventos/editar/:id" element={
          <PrivateRoute roles={['administrador', 'organizador']}><EventoForm /></PrivateRoute>
        } />
        <Route path="/eventos/visualizar/:id" element={
          <PrivateRoute><EventoView /></PrivateRoute>
        } />
        
        {/* Rotas de Usuários (apenas administradores) */}
        <Route path="/usuarios" element={
          <PrivateRoute roles={['administrador']}><UsuariosList /></PrivateRoute>
        } />
        <Route path="/usuarios/novo" element={
          <PrivateRoute roles={['administrador']}><UsuarioForm /></PrivateRoute>
        } />
        <Route path="/usuarios/editar/:id" element={
          <PrivateRoute roles={['administrador']}><UsuarioForm /></PrivateRoute>
        } />
        <Route path="/usuarios/visualizar/:id" element={
          <PrivateRoute roles={['administrador']}><UsuarioView /></PrivateRoute>
        } />
        
        {/* Rotas de Inscrições */}
        <Route path="/inscricoes" element={
          <PrivateRoute roles={['administrador', 'organizador']}><InscricoesList /></PrivateRoute>
        } />
        <Route path="/minhas-inscricoes" element={
          <PrivateRoute roles={['participante']}><MinhasInscricoes /></PrivateRoute>
        } />
        <Route path="/gerenciar-inscricoes" element={
          <PrivateRoute roles={['administrador', 'organizador']}><GerenciarInscricoes /></PrivateRoute>
        } />
        
        {/* Rotas de Certificados */}
        <Route path="/certificados" element={
          <PrivateRoute roles={['administrador', 'organizador']}><CertificadosList /></PrivateRoute>
        } />
        <Route path="/certificados/gerar" element={
          <PrivateRoute roles={['administrador', 'organizador']}><GerarCertificados /></PrivateRoute>
        } />
        <Route path="/meus-certificados" element={
          <PrivateRoute roles={['participante']}><MeusCertificados /></PrivateRoute>
        } />
        
        {/* Rotas de Categorias (apenas administradores) */}
        <Route path="/categorias" element={
          <PrivateRoute roles={['administrador']}><CategoriasList /></PrivateRoute>
        } />
        <Route path="/categorias/novo" element={
          <PrivateRoute roles={['administrador']}><CategoriaForm /></PrivateRoute>
        } />
        <Route path="/categorias/editar/:id" element={
          <PrivateRoute roles={['administrador']}><CategoriaForm /></PrivateRoute>
        } />
        
        {/* Rotas de Acessos (MongoDB - apenas administradores) */}
        <Route path="/acessos" element={
          <PrivateRoute roles={['administrador']}><AcessosList /></PrivateRoute>
        } />
        
        {/* Rotas de Perfil */}
        <Route path="/perfil" element={
          <PrivateRoute><PerfilPage /></PrivateRoute>
        } />
        
        {/* Rota padrão */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
} 