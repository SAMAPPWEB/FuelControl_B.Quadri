export type Perfil = 'atendimento' | 'admin' | 'master';
export type StatusUsuario = 'ativo' | 'inativo' | 'bloqueado';
export type GeneroAvatar = 'masculino' | 'feminino' | 'foto';
export type ModuleId = 'loja' | 'abastecimento';

export interface Usuario {
  id: string;
  nome: string;
  apelido: string;
  whatsapp?: string;
  email: string;
  senhaHash: string;
  funcao: string;
  perfil: Perfil;
  status: StatusUsuario;
  avatar: GeneroAvatar;
  fotoUrl?: string;
  modulos: ModuleId[]; // Módulos que o usuário tem acesso
  createdAt: string;
  updatedAt: string;
  ultimoAcesso?: string;
}

export interface TipoCombustivel {
  id: string;
  nome: 'Gasolina' | 'Diesel S-10';
  icone: 'fuel' | 'truck';
  precoCusto: number;
  precoVenda: number;
  estoqueInicial: number;
  estoqueLitros: number;
  limiteMinimo: number;
  alertaAbaixoDe: number;
  principal: boolean;
  historicoPrecos: HistoricoPreco[];
}

export interface HistoricoPreco {
  preco: number;
  data: string;
  motivo?: string;
}

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  whatsapp: string;
  pixKey?: string;
  logoUrl?: string;
}

export interface Abastecimento {
  id: string;
  tipoCombustivelId: string;
  tipoCombustivelNome: string;
  litros: number;
  precoLitro: number;
  valorTotal: number;
  placaVeiculo?: string;
  observacao?: string;
  frentistaId: string;
  frentistaNome: string;
  createdAt: string;
}

export interface AlertaEmergencial {
  id: string;
  tipo: 'critico' | 'aviso' | 'informativo';
  titulo: string;
  descricao: string;
  data: string;
  lido: boolean;
}

export interface FiltrosRelatorio {
  periodo: 'hoje' | 'ontem' | '7dias' | '30dias' | 'personalizado';
  dataInicio?: string;
  dataFim?: string;
  tipoCombustivel: 'todos' | 'gasolina' | 'diesel';
}

export interface Sessao {
  usuarioId: string;
  perfil: Perfil;
  token: string;
  expiracao: number;
}
