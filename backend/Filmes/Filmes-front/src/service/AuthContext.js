import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function signIn({ email, senha }) {
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token, usuario } = response.data; // Estrutura vinda do teu login.js

      localStorage.setItem('token', token);
      setUser(usuario);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      alert("Erro no login: " + error.response.data.erro);
    }
  }

  function signOut() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, signed: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}