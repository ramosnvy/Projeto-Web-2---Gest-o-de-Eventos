import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados completos do usuário
  const fetchUserData = async (token) => {
    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/perfil');
      if (response.data.sucesso) {
        return response.data.dados;
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
    return null;
  };

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    if (tokenSalvo) {
      try {
        const decodedToken = jwtDecode(tokenSalvo);
        setToken(tokenSalvo);
        
        // Buscar dados completos do usuário
        fetchUserData(tokenSalvo).then(userData => {
          if (userData) {
            setUsuario(userData);
          } else {
            // Se não conseguir buscar dados, limpar token
            localStorage.removeItem('token');
            setToken(null);
            setUsuario(null);
          }
          setLoading(false);
        });
      } catch {
        localStorage.removeItem('token');
        setUsuario(null);
        setToken(null);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha });
    if (res.data.sucesso) {
      const token = res.data.dados.token;
      localStorage.setItem('token', token);
      setToken(token);
      
      // Buscar dados completos do usuário
      const userData = await fetchUserData(token);
      if (userData) {
        setUsuario(userData);
      }
    }
    return res;
  };

  const registrar = async (dados) => {
    const res = await api.post('/auth/registrar', dados);
    if (res.data.sucesso) {
      const token = res.data.dados.token;
      localStorage.setItem('token', token);
      setToken(token);
      
      // Buscar dados completos do usuário
      const userData = await fetchUserData(token);
      if (userData) {
        setUsuario(userData);
      }
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    }
    localStorage.removeItem('token');
    setUsuario(null);
    setToken(null);
  };

  const updateUser = (userData) => {
    setUsuario(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user: usuario, 
      token, 
      login, 
      registrar, 
      logout, 
      updateUser,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 