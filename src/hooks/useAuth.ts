import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/services/api';
import type { Usuario, Perfil } from '@/types';

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      const stored = sessionStorage.getItem('bq_user');
      if (stored) {
        const user = JSON.parse(stored);
        setUsuario(user);
        setPerfil(user.perfil as Perfil);
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = useCallback(async (email: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await ApiService.post<{ success: boolean; user: Usuario; error?: string }>('/api/auth/login', {
        email,
        senha
      });

      if (res.success && res.user) {
        setUsuario(res.user);
        setPerfil(res.user.perfil as Perfil);
        sessionStorage.setItem('bq_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: res.error || 'Erro ao entrar' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erro de conexão com o servidor' };
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('bq_user');
    setUsuario(null);
    setPerfil(null);
  }, []);

  return {
    usuario,
    perfil,
    loading,
    login,
    logout,
    isAuthenticated: !!usuario
  };
}
