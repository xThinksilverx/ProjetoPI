'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/perfil');
      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, senha) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        const tipo = data.data.tipo;
        if (tipo === 'admin') router.push('/admin');
        else if (tipo === 'psicologo') router.push('/perfil');
        else router.push('/');
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro ao autenticar. Tente novamente.' };
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
