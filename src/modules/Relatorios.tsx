import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter, Search, ChevronDown, 
  Fuel, DollarSign, FileDown, X,
  Droplet, Users, LockOpen, History, Wallet, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { PdfService } from '@/services/pdf';
import type { Abastecimento, Usuario } from '@/types';

export default function Relatorios() {
  const data = useData();
  
  const [filterOpen, setFilterOpen] = useState(false);
  const [periodo, setPeriodo] = useState<string>('7dias');
  const [frentistaFiltro, setFrentistaFiltro] = useState<string>('todos');
  const [veiculoFiltro, setVeiculoFiltro] = useState<string>('todos');
  const [expandedCard, setExpandedCard] = useState<string | null>('abastecimentos');

  const abastecimentos: Abastecimento[] = Array.isArray(data?.abastecimentos) ? data.abastecimentos : [];
  const usuarios: Usuario[] = Array.isArray(data?.usuarios) ? data.usuarios : [];
  const empresa = data?.empresa || null;
  const loading = data?.loading;

  const veiculosDisponiveis = useMemo(() => {
    const v = abastecimentos
      .map(a => a.placaVeiculo)
      .filter((p): p is string => !!p && p.trim() !== '');
    return Array.from(new Set(v)).sort();
  }, [abastecimentos]);

  const stats = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    let dataLimite = new Date(0);
    if (periodo === 'hoje') dataLimite = hoje;
    else if (periodo === 'ontem') {
      const d = new Date(hoje);
      d.setDate(d.getDate() - 1);
      dataLimite = d;
    } else if (periodo === '7dias') {
      const d = new Date(hoje);
      d.setDate(d.getDate() - 7);
      dataLimite = d;
    } else if (periodo === '30dias') {
      const d = new Date(hoje);
      d.setDate(d.getDate() - 30);
      dataLimite = d;
    }

    const filtered = abastecimentos.filter((a: Abastecimento) => {
      const dataA = new Date(a.createdAt);
      const okData = dataA >= dataLimite;
      const okFrentista = frentistaFiltro === 'todos' || a.frentistaId === frentistaFiltro;
      const okVeiculo = veiculoFiltro === 'todos' || a.placaVeiculo === veiculoFiltro;
      return okData && okFrentista && okVeiculo;
    });

    const ranking = usuarios.filter(u => u.perfil === 'atendimento').map(u => {
      const doFrentista = filtered.filter(a => a.frentistaId === u.id);
      const litros = doFrentista.reduce((s, a) => s + Number(a.litros || 0), 0);
      const valor = doFrentista.reduce((s, a) => s + Number(a.valorTotal || 0), 0);
      return { id: u.id, nome: u.nome, apelido: u.apelido, count: doFrentista.length, litros, valor };
    });

    return { 
      filtrados: filtered, 
      ranking,
      faturamentoTotal: filtered.reduce((s, a) => s + Number(a.valorTotal || 0), 0),
      litrosTotais: filtered.reduce((s, a) => s + Number(a.litros || 0), 0)
    };
  }, [abastecimentos, usuarios, periodo, frentistaFiltro, veiculoFiltro]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-2 border-brand-purple border-t-transparent rounded-full animate-spin shadow-brand" />
        <p className="text-sm font-medium text-dark-secondary animate-pulse uppercase tracking-widest">Processando Dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Central de <span className="text-gradient-gold">Relatórios</span></h1>
          <p className="text-dark-secondary mt-1">Análise detalhada de movimentações e faturamento</p>
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/5 border border-black/10 text-foreground font-bold text-sm uppercase tracking-widest hover:bg-black/10 transition-all neon-gold"
        >
          <Filter size={18} className="text-brand-blue" />
          Filtrar Dados
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryItem label="Abastecimentos" value={stats.filtrados.length.toString()} icon={Fuel} color="blue" />
        <SummaryItem label="Volume Total" value={`${stats.litrosTotais.toFixed(1)} L`} icon={Droplet} color="purple" />
        <SummaryItem label="Faturamento" value={`R$ ${stats.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="green" />
      </div>

      {/* Filters Modal */}
      <AnimatePresence>
        {filterOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full max-w-xl bg-white border-t md:border border-black/5 rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Filtrar Relatórios</h2>
                <button onClick={() => setFilterOpen(false)} className="p-2 text-dark-muted hover:text-foreground transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-4 block">Período</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['hoje', 'ontem', '7dias', '30dias'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPeriodo(p)}
                        className={cn(
                          "py-3 px-4 rounded-xl text-xs font-bold transition-all border",
                          periodo === p 
                            ? "bg-brand-blue border-brand-blue text-white shadow-brand" 
                            : "bg-black/5 border-black/5 text-dark-secondary hover:bg-black/10"
                        )}
                      >
                        {p === 'hoje' ? 'Hoje' : p === 'ontem' ? 'Ontem' : p === '7dias' ? '7 Dias' : '30 Dias'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-4 block">Operador (Frentista)</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterTag 
                      label="Todos" 
                      active={frentistaFiltro === 'todos'} 
                      onClick={() => setFrentistaFiltro('todos')} 
                    />
                    {usuarios.filter(u => u.perfil === 'atendimento').map(u => (
                      <FilterTag 
                        key={u.id}
                        label={u.apelido || u.nome} 
                        active={frentistaFiltro === u.id} 
                        onClick={() => setFrentistaFiltro(u.id)} 
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-4 block">Veículo / Placa</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    <FilterTag 
                      label="Todas as Placas" 
                      active={veiculoFiltro === 'todos'} 
                      onClick={() => setVeiculoFiltro('todos')} 
                    />
                    {veiculosDisponiveis.map(v => (
                      <FilterTag 
                        key={v}
                        label={v} 
                        active={veiculoFiltro === v} 
                        onClick={() => setVeiculoFiltro(v)} 
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full bg-brand-gradient py-5 rounded-2xl text-white font-bold uppercase tracking-[0.2em] shadow-brand hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Aplicar Filtros
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="space-y-6">
        {stats.filtrados.length === 0 ? (
          <div className="glass-card rounded-[3rem] py-20 text-center border-dashed border-red-500/20 neon-gold">
             <Search size={48} className="mx-auto text-dark-muted mb-4" />
             <p className="text-foreground font-bold text-lg">Nenhum registro encontrado</p>
             <p className="text-dark-secondary text-sm">Tente ajustar os filtros de período ou operador.</p>
          </div>
        ) : (
          <>
            {/* NOVO: Seção de Movimentação de Caixa */}
            <ReportSection 
              title="Movimentação de Caixa (Turnos)" 
              icon={Wallet} 
              isOpen={expandedCard === 'caixas'}
              onToggle={() => setExpandedCard(expandedCard === 'caixas' ? null : 'caixas')}
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-6 rounded-[2rem] bg-green-500/5 border border-green-500/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-green-500">
                      <ArrowUpRight size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Total Entradas</span>
                    </div>
                    <p className="text-2xl font-black text-foreground">R$ {stats.faturamentoTotal.toFixed(2)}</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-red-500">
                      <ArrowDownLeft size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Total Saídas</span>
                    </div>
                    <p className="text-2xl font-black text-foreground">R$ 0,00</p>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-brand-blue/5 border border-brand-blue/10 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-brand-blue">
                      <History size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Turnos Encerrados</span>
                    </div>
                    <p className="text-2xl font-black text-foreground">01</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-black/5">
                        <th className="pb-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Abertura / Fechamento</th>
                        <th className="pb-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Operador</th>
                        <th className="pb-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Fundo Inicial</th>
                        <th className="pb-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Saldo Final</th>
                        <th className="pb-4 text-[10px] font-black text-dark-muted uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 text-sm">
                      <tr className="hover:bg-black/[0.01] group">
                        <td className="py-5">
                          <p className="font-bold text-foreground">30/04/2026 08:00</p>
                          <p className="text-[10px] text-dark-muted font-bold">FECHADO: 14:00</p>
                        </td>
                        <td className="py-5 font-medium text-dark-secondary">João Silva</td>
                        <td className="py-5 text-dark-secondary font-medium">R$ 200,00</td>
                        <td className="py-5">
                          <span className="px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue font-black text-xs">R$ {stats.faturamentoTotal.toFixed(2)}</span>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button className="p-2.5 rounded-xl bg-black/5 text-dark-muted hover:bg-brand-blue/10 hover:text-brand-blue transition-all" title="Ver Detalhes">
                              <Search size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm("Deseja REABRIR este caixa? Todas as operações do PDV serão desbloqueadas.")) {
                                  alert("Caixa Reaberto com Sucesso! O PDV está agora disponível.");
                                }
                              }}
                              className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple hover:bg-brand-purple hover:text-white transition-all shadow-sm" title="Reabrir Caixa">
                              <LockOpen size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ReportSection>

            <ReportSection 
              title="Abastecimentos Detalhados" 
              icon={Droplet} 
              isOpen={expandedCard === 'abastecimentos'}
              onToggle={() => setExpandedCard(expandedCard === 'abastecimentos' ? null : 'abastecimentos')}
            >
              <div className="space-y-3">
                {stats.filtrados.map((a, i) => (
                  <div key={a.id || i} className="flex items-center justify-between p-6 rounded-3xl bg-black/5 border border-black/5 hover:bg-black/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:scale-110 transition-transform">
                        <Fuel size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">{a.combustivelNome}</p>
                        <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest">
                          {new Date(a.createdAt).toLocaleDateString('pt-BR')} • {new Date(a.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-foreground">{Number(a.litros).toFixed(1)} L</p>
                      <p className="text-[10px] text-brand-blue font-black uppercase tracking-widest">R$ {Number(a.valorTotal).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            <ReportSection 
              title="Performance por Operador" 
              icon={Users}
              isOpen={expandedCard === 'frentistas'}
              onToggle={() => setExpandedCard(expandedCard === 'frentistas' ? null : 'frentistas')}
            >
              <div className="space-y-4">
                {stats.ranking.filter(u => u.count > 0).map((u) => (
                  <div key={u.id} className="p-8 rounded-[2.5rem] bg-black/5 border border-black/5 hover:border-brand-purple/20 transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-brand text-white font-black text-sm">
                          {u.apelido.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-foreground text-lg">{u.apelido || u.nome}</p>
                          <p className="text-[10px] text-dark-muted font-black uppercase tracking-[0.2em]">{u.count} Abastecimentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-foreground">R$ {u.valor.toFixed(2)}</p>
                        <p className="text-[10px] text-green-400 font-black uppercase tracking-widest">{u.litros.toFixed(1)} Litros</p>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-black/5 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(u.valor / stats.faturamentoTotal) * 100}%` }}
                        className="h-full bg-brand-gradient shadow-brand" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            <div className="pt-8">
              <PdfButton filtrados={stats.filtrados} empresa={empresa} periodo={periodo} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
    purple: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
  };

  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-black/5 group hover:scale-[1.02] transition-all neon-gold neon-gold-hover cursor-default">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg", colors[color])}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
    </div>
  );
}

function FilterTag({ label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
        active 
          ? "bg-brand-purple/20 border-brand-purple text-brand-purple shadow-[0_0_15px_rgba(124,58,237,0.2)]" 
          : "bg-black/5 border-black/5 text-dark-secondary hover:bg-black/10"
      )}
    >
      {label}
    </button>
  );
}

function ReportSection({ title, icon: Icon, children, isOpen, onToggle }: any) {
  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-black/5 shadow-glass neon-gold">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-8 text-left hover:bg-black/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-black/5 text-brand-blue">
            <Icon size={20} />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown size={24} className="text-dark-muted" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-black/5"
          >
            <div className="p-8 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PdfButton({ filtrados, empresa, periodo }: any) {
  const [generating, setGenerating] = useState(false);

  const handlePdf = async () => {
    try {
      setGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await PdfService.generateReport(filtrados, empresa, periodo);
    } catch (err) {
      alert('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button 
      onClick={handlePdf}
      disabled={generating}
      className="w-full bg-brand-gradient py-5 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] text-sm shadow-brand hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
    >
      {generating ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <FileDown size={20} />
      )}
      {generating ? 'Gerando Relatório...' : 'Exportar Relatório PDF'}
    </button>
  );
}


