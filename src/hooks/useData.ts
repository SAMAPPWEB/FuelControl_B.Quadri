import { useState, useCallback, useEffect } from 'react';
import { DataService } from '@/services/data';
import type { Usuario, TipoCombustivel, Empresa, Abastecimento, AlertaEmergencial } from '@/types';

export function useData() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [combustiveis, setCombustiveis] = useState<TipoCombustivel[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [alertas, setAlertas] = useState<AlertaEmergencial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [users, fuels, company, supplies, alerts] = await Promise.all([
          DataService.getUsuarios(),
          DataService.getCombustiveis(),
          DataService.getEmpresa(),
          DataService.getAbastecimentos(),
          DataService.getAlertas()
        ]);
        setUsuarios(users);
        setCombustiveis(fuels);
        setEmpresa(company);
        setAbastecimentos(supplies);
        setAlertas(alerts);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  return {
    usuarios,
    combustiveis,
    empresa,
    abastecimentos,
    alertas,
    loading,
    refresh,
    refreshKey,
    createUsuario: async (u: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>) => { await DataService.createUsuario(u); refresh(); },
    updateUsuario: async (id: string, u: Partial<Usuario>) => { await DataService.updateUsuario(id, u); refresh(); },
    deleteUsuario: async (id: string) => { await DataService.deleteUsuario(id); refresh(); },
    updateCombustivel: async (id: string, c: Partial<TipoCombustivel>, novoPreco?: number) => { await DataService.updateCombustivel(id, c, novoPreco); refresh(); },
    saveEmpresa: async (e: Empresa) => { await DataService.saveEmpresa(e); refresh(); },
    createAbastecimento: async (a: Omit<Abastecimento, 'id' | 'createdAt'>) => { await DataService.createAbastecimento(a); refresh(); },
    marcarAlertaLido: async (id: string) => { await DataService.marcarAlertaLido(id); refresh(); },
  };
}
