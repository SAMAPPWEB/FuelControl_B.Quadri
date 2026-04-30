import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Fuel, DollarSign, Database, Bell, BarChart3,
  AlertTriangle, AlertCircle, Info, Clock,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import type { AlertaEmergencial } from '@/types';

export default function Dashboard({ onScreenChange }: { onScreenChange?: (s: any) => void }) {
  const { combustiveis = [], abastecimentos = [], alertas = [], marcarAlertaLido, loading } = useData();
  const { usuario } = useAuth();
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-2 border-brand-blue border-t-transparent rounded-full animate-spin shadow-brand" />
        <p className="text-sm font-medium text-dark-secondary uppercase tracking-widest animate-pulse">Sincronizando Dados...</p>
      </div>
    );
  }

  const gasolina = combustiveis?.find(c => c.nome === 'Gasolina');
  const diesel = combustiveis?.find(c => c.nome.includes('Diesel'));

  const hoje = new Date().toISOString().split('T')[0];
  const abastHoje = abastecimentos?.filter(a => a?.createdAt?.startsWith(hoje)) || [];
  const litrosHoje = abastHoje.reduce((sum, a) => sum + Number(a.litros || 0), 0);
  const faturamentoHoje = abastHoje.reduce((sum, a) => sum + Number(a.valorTotal || 0), 0);

  const alertasNaoLidos = alertas?.filter(a => !a.lido) || [];

  return (
    <div className="space-y-8 font-outfit">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Dashboard <span className="text-gradient-gold">Abastecimento</span>
          </h1>
          <div className="flex items-center gap-2 mt-1 text-dark-secondary">
            <Clock size={14} />
            <p className="text-sm">Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative w-12 h-12 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black/10 transition-all group">
            <Bell size={22} className="text-dark-secondary group-hover:text-brand-blue" />
            {alertasNaoLidos.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center text-white ring-4 ring-dark-bg">
                {alertasNaoLidos.length}
              </span>
            )}
          </button>
          
          <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-black/5 border border-black/10">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
              <span className="text-xs font-black text-white">{usuario?.nome?.charAt(0) || 'U'}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-foreground leading-none">{usuario?.apelido || 'Usuário'}</p>
              <p className="text-[9px] font-bold text-dark-muted uppercase tracking-wider mt-1">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Greeting Card Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border-brand-blue/10 bg-brand-gradient/5 neon-gold"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {getSaudacao()}, {usuario?.apelido || 'Comandante'}!
            </h2>
            <p className="text-dark-secondary text-sm font-medium">
              Tudo pronto para os abastecimentos de hoje. {alertasNaoLidos.length > 0 ? `Você tem ${alertasNaoLidos.length} novos alertas.` : 'Sem alertas críticos no momento.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-black/5 border border-black/10 text-xs font-bold text-dark-secondary uppercase tracking-widest">
              {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Litros Abastecidos" 
          value={litrosHoje.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} 
          unit="L"
          trend="+8.2%" 
          up={true}
          icon={Fuel}
          color="blue"
        />
        <MetricCard 
          label="Faturamento Total" 
          value={`R$ ${faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          trend="+15%" 
          up={true}
          icon={DollarSign}
          color="purple"
        />
        <MetricCard 
          label="Estoque Gasolina" 
          value={gasolina ? Number(gasolina.estoqueLitros).toLocaleString('pt-BR', { minimumFractionDigits: 0 }) : '0'} 
          unit="L"
          trend={gasolina && gasolina.estoqueLitros < gasolina.limiteMinimo ? "Crítico" : "Ok"} 
          up={!(gasolina && gasolina.estoqueLitros < gasolina.limiteMinimo)}
          icon={Database}
          color={gasolina && gasolina.estoqueLitros < gasolina.limiteMinimo ? "red" : "blue"}
        />
        <MetricCard 
          label="Estoque Diesel" 
          value={diesel ? Number(diesel.estoqueLitros).toLocaleString('pt-BR', { minimumFractionDigits: 0 }) : '0'} 
          unit="L"
          trend={diesel && diesel.estoqueLitros < diesel.limiteMinimo ? "Baixo" : "Ok"} 
          up={!(diesel && diesel.estoqueLitros < diesel.limiteMinimo)}
          icon={Database}
          color={diesel && diesel.estoqueLitros < diesel.limiteMinimo ? "red" : "purple"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts & Notifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 shadow-glass border-red-500/10 neon-gold">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-500" />
                Alertas da IA
              </h3>
              <span className="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest">Ativa</span>
            </div>
            
            <div className="space-y-4">
              {alertas?.length > 0 ? (
                (showAllAlerts ? alertas : alertas.slice(0, 3)).map((alerta, i) => (
                  <AlertItem key={alerta.id} alerta={alerta} index={i} onRead={() => marcarAlertaLido(alerta.id)} />
                ))
              ) : (
                <div className="py-10 text-center opacity-40">
                  <p className="text-sm font-medium">Nenhum alerta pendente</p>
                </div>
              )}
            </div>

            {alertas?.length > 3 && (
              <button
                onClick={() => setShowAllAlerts(!showAllAlerts)}
                className="mt-6 w-full py-3 rounded-xl border border-black/5 text-dark-secondary text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-all"
              >
                {showAllAlerts ? 'Ocultar Alertas' : `Ver mais ${alertas.length - 3} alertas`}
              </button>
            )}
          </div>

          {/* Chart Section */}
          <div className="glass-card rounded-[2.5rem] p-8 shadow-glass neon-gold">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 size={20} className="text-brand-purple" />
                Fluxo Semanal
              </h3>
              <select className="bg-black/5 border border-black/10 rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none text-foreground">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
              </select>
            </div>
            <BarChart abastecimentos={abastecimentos} />
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2.5rem] p-8 shadow-glass bg-brand-gradient text-white neon-gold">
            <h3 className="text-xl font-bold mb-2">Novo Registro</h3>
            <p className="text-sm opacity-80 mb-8 font-medium">Inicie um novo abastecimento agora mesmo.</p>
            <button 
              onClick={() => onScreenChange?.('abastecimento')}
              className="w-full bg-white text-brand-blue py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Abastecer Veículo
            </button>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 shadow-glass neon-gold">
            <h3 className="text-lg font-bold text-foreground mb-6">Metas do Dia</h3>
            <div className="space-y-6">
              <ProgressItem label="Volume Vendas" percent={0} color="bg-brand-blue" />
              <ProgressItem label="Meta Faturamento" percent={0} color="bg-brand-purple" />
              <ProgressItem label="Diesel S-10" percent={0} color="bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, trend, up, icon: Icon, color }: any) {
  const colors: any = {
    blue: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20 shadow-blue-500/10',
    purple: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20 shadow-purple-500/10',
    red: 'text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    green: 'text-green-500 bg-green-500/10 border-green-500/20 shadow-green-500/10',
  };

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border border-black/5 relative overflow-hidden group neon-gold neon-gold-hover transition-all cursor-default">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg", colors[color])}>
        <Icon size={22} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em]">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-foreground">{value}</span>
          {unit && <span className="text-[10px] font-bold text-dark-muted">{unit}</span>}
        </div>
        <div className={cn(
          "text-[10px] font-bold mt-2 flex items-center gap-1",
          up ? "text-green-400" : "text-red-400"
        )}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alerta, index, onRead }: { alerta: AlertaEmergencial; index: number; onRead: () => void }) {
  const IconMap = { critico: AlertTriangle, aviso: AlertCircle, informativo: Info };
  const colorMap = {
    critico: 'bg-red-500/5 border-red-500/10 text-red-400',
    aviso: 'bg-amber-500/5 border-amber-500/10 text-amber-400',
    informativo: 'bg-brand-blue/5 border-brand-blue/10 text-brand-blue',
  };
  const Icon = IconMap[alerta.tipo] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onRead}
      className={cn(
        "p-4 rounded-2xl border flex items-start gap-4 cursor-pointer hover:bg-white/[0.02] transition-all",
        colorMap[alerta.tipo] || colorMap.informativo
      )}
    >
      <div className="w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate text-foreground">{alerta.titulo}</p>
        <p className="text-xs opacity-70 mt-0.5 line-clamp-1">{alerta.descricao}</p>
      </div>
      {!alerta.lido && <div className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />}
    </motion.div>
  );
}

function BarChart({ abastecimentos }: { abastecimentos: any[] }) {
  const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hoje = new Date();
  const dados = [...Array(7)].map((_, i) => {
    const d = new Date(hoje);
    d.setDate(d.getDate() - (6 - i));
    const dataStr = d.toISOString().split('T')[0];
    const total = (abastecimentos || [])
      .filter(a => a?.createdAt?.startsWith(dataStr))
      .reduce((sum, a) => sum + Number(a.litros || 0), 0);
    return { dia: dias[d.getDay()], litros: total };
  });

  const maxLitros = Math.max(...dados.map(d => d.litros), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-48 pt-4">
      {dados.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
          <div className="relative w-full flex justify-center group">
             <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(d.litros / maxLitros) * 100}%` }}
              className="w-8 md:w-10 rounded-xl bg-brand-gradient shadow-brand relative group-hover:brightness-125 transition-all"
            />
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-black/10 p-2 rounded-lg text-[10px] font-black text-foreground whitespace-nowrap shadow-xl z-20">
              {d.litros.toFixed(1)} L
            </div>
          </div>
          <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">{d.dia}</span>
        </div>
      ))}
    </div>
  );
}

function ProgressItem({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-dark-secondary">{label}</span>
        <span className="text-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden border border-black/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", color)} 
        />
      </div>
    </div>
  );
}

function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

