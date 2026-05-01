import { ApiService } from './api';
import type { Usuario, TipoCombustivel, Empresa, Abastecimento, AlertaEmergencial } from '@/types';

export class DataService {
  // Usuários
  static async getUsuarios(): Promise<Usuario[]> {
    const res = await ApiService.get<any>('/api/data/usuarios');
    const items = res.usuarios || (Array.isArray(res) ? res : []);
    return items.map((u: any) => ({
      ...u,
      senhaHash: u.senha_hash || u.senhaHash || '',
      createdAt: u.created_at || u.createdAt || '',
    }));
  }

  static async createUsuario(usuario: Omit<Usuario, 'id' | 'createdAt' | 'updatedAt'>): Promise<Usuario> {
    return ApiService.post<Usuario>('/api/data/usuarios', usuario);
  }

  static async updateUsuario(id: string, dados: Partial<Usuario>): Promise<Usuario> {
    return ApiService.post<Usuario>('/api/data/usuarios', { id, ...dados });
  }

  static async deleteUsuario(id: string): Promise<boolean> {
    const res = await ApiService.delete<{ success: boolean }>(`/api/data/usuarios?id=${id}`);
    return res.success;
  }

  // Combustíveis
  static async getCombustiveis(): Promise<TipoCombustivel[]> {
    const res = await ApiService.get<any>('/api/data/dashboard');
    return (res.combustiveis || []).map((c: any) => ({
      id: c.id,
      nome: c.nome,
      icone: c.icone,
      precoCusto: parseFloat(c.preco_custo || c.preco_atual || 0),
      precoVenda: parseFloat(c.preco_venda || c.preco_atual || 0),
      estoqueInicial: parseFloat(c.estoque_inicial || 0),
      estoqueLitros: parseFloat(c.estoque_litros || 0),
      limiteMinimo: parseFloat(c.limite_minimo || 0),
      alertaAbaixoDe: parseFloat(c.alerta_abaixo_de || 0),
      principal: !!parseInt(c.principal),
      historicoPrecos: []
    }));
  }

  static async updateCombustivel(id: string, dados: Partial<TipoCombustivel>, novoPreco?: number): Promise<TipoCombustivel> {
    return ApiService.post<TipoCombustivel>(`/api/data/combustiveis?id=${id}`, { ...dados, novoPreco });
  }

  // Empresa
  static async getEmpresa(): Promise<Empresa | null> {
    const res = await ApiService.get<any>('/api/data/empresa');
    const e = res.empresa || (res.id ? res : null);
    if (!e) return null;
    return {
      id: e.id,
      razaoSocial: e.razao_social || e.razaoSocial || '',
      nomeFantasia: e.nome_fantasia || e.nomeFantasia || '',
      cnpj: e.cnpj || '',
      endereco: e.endereco || '',
      whatsapp: e.whatsapp || '',
      pixKey: e.pix_key || e.pixKey || '',
      logoUrl: e.logo_url || e.logoUrl || '',
    };
  }

  static async saveEmpresa(empresa: Empresa): Promise<void> {
    const data = {
      id: empresa.id,
      razao_social: empresa.razaoSocial,
      nome_fantasia: empresa.nomeFantasia,
      cnpj: empresa.cnpj,
      endereco: empresa.endereco,
      whatsapp: empresa.whatsapp,
      telefone: empresa.whatsapp, // Compatibilidade com nomes antigos
      pix_key: empresa.pixKey,
      logo_url: empresa.logoUrl
    };
    await ApiService.post('/api/data/empresa', data);
  }

  // Abastecimentos
  static async getAbastecimentos(): Promise<Abastecimento[]> {
    const res = await ApiService.get<any>('/api/data/dashboard');
    const items = res.abastecimentos || (Array.isArray(res) ? res : []);
    return items.map((a: any) => ({
      ...a,
      id: a.id,
      tipoCombustivelId: a.tipo_combustivel_id || a.tipoCombustivelId,
      tipoCombustivelNome: a.tipo_combustivel_nome || a.tipoCombustivelNome,
      litros: parseFloat(a.litros || 0),
      precoLitro: parseFloat(a.preco_litro || a.precoLitro || 0),
      valorTotal: parseFloat(a.valor_total || a.valorTotal || 0),
      placaVeiculo: a.placa_veiculo || a.placaVeiculo || '',
      frentistaId: a.frentista_id || a.frentistaId,
      frentistaNome: a.frentista_nome || a.frentistaNome,
      createdAt: a.created_at || a.createdAt,
    }));
  }

  static async createAbastecimento(abastecimento: Omit<Abastecimento, 'id' | 'createdAt'>): Promise<Abastecimento> {
    return ApiService.post<Abastecimento>('/api/data/dashboard', { action: 'create_abastecimento', ...abastecimento });
  }

  // Alertas
  static async getAlertas(): Promise<AlertaEmergencial[]> {
    const res = await ApiService.get<any>('/api/data/dashboard');
    const items = res.alertas || (Array.isArray(res) ? res : []);
    return items.map((a: any) => ({
      ...a,
      lido: !!parseInt(a.lido),
      data: a.data || a.created_at || a.createdAt || new Date().toISOString()
    }));
  }

  static async marcarAlertaLido(id: string): Promise<void> {
    await ApiService.post('/api/data/dashboard', { action: 'marcar_alerta_lido', id });
  }

  // Reset do Sistema
  static async resetSystem(): Promise<boolean> {
    try {
      localStorage.removeItem('mock_abastecimentos');
      localStorage.removeItem('mock_alertas');
      
      const res = await ApiService.post<{ success: boolean }>('/api/data/dashboard', { action: 'reset_db' });
      return res.success;
    } catch (error) {
      console.error('Erro ao resetar sistema:', error);
      return false;
    }
  }

  // Histórico de Entradas
  static async getHistoricoEntradas(): Promise<any[]> {
    const res = await ApiService.get<any>('/api/data/historico');
    return res.historico || [];
  }

  static async saveHistoricoEntrada(dados: any): Promise<void> {
    await ApiService.post('/api/data/historico', dados);
  }

  static async deleteHistoricoEntrada(id: string): Promise<void> {
    await ApiService.post('/api/data/historico', { action: 'delete', id });
  }
}

