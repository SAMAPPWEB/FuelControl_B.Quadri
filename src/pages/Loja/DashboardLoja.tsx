import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Users, ShoppingBag, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight,
  X, CheckCircle2, AlertCircle, ShoppingCart, CreditCard, Banknote, QrCode,
  Sparkles, Zap, Cpu, Pencil, Trash2, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLoja({ onScreenChange, caixaAberto }: { onScreenChange: (s: any) => void, caixaAberto: boolean }) {
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showLockAlert, setShowLockAlert] = useState(false);

  const recentSales = [
    { 
      id: 'V-8942', 
      time: '14:25', 
      itemsCount: '3 itens', 
      total: 45.90, 
      status: 'Finalizado',
      pagamento: 'PIX',
      itens: [
        { nome: 'Coca-Cola 350ml', qtd: 2, preco: 15.00 },
        { nome: 'Batata Pringles', qtd: 1, preco: 30.90 }
      ]
    },
    { 
      id: 'V-8941', 
      time: '14:10', 
      itemsCount: '1 item', 
      total: 5.50, 
      status: 'Finalizado',
      pagamento: 'Dinheiro',
      itens: [
        { nome: 'Chocolate Bis', qtd: 1, preco: 5.50 }
      ]
    },
    { 
      id: 'V-8940', 
      time: '13:55', 
      itemsCount: '5 itens', 
      total: 124.00, 
      status: 'Finalizado',
      pagamento: 'Crédito',
      itens: [
        { nome: 'Vinho Tinto Reservado', qtd: 1, preco: 89.00 },
        { nome: 'Queijo Brie', qtd: 2, preco: 35.00 }
      ]
    },
    { 
      id: 'V-8939', 
      time: '13:40', 
      itemsCount: '2 itens', 
      total: 18.20, 
      status: 'Cancelado', 
      error: true,
      pagamento: '-',
      itens: [
        { nome: 'Suco Del Valle', qtd: 2, preco: 18.20 }
      ]
    },
  ];

  return (
    <div className="space-y-8 font-outfit">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Dashboard <span className="text-gradient-gold">Loja</span>
          </h1>
          <p className="text-dark-secondary mt-1">Visão geral do seu PDV e Estoque hoje</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">Status da Loja</p>
            <p className="text-sm font-bold text-green-400">Operando Normalmente</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Vendas Hoje" 
          value="R$ 1.284,50" 
          trend="+12.5%" 
          up={true}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard 
          label="Atendimentos" 
          value="42" 
          trend="+5" 
          up={true}
          icon={Users}
          color="purple"
        />
        <MetricCard 
          label="Ticket Médio" 
          value="R$ 30,58" 
          trend="-2.4%" 
          up={false}
          icon={TrendingUp}
          color="pink"
        />
        <MetricCard 
          label="Produtos Sairam" 
          value="156" 
          trend="+18%" 
          up={true}
          icon={ShoppingBag}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ActionCard 
              title="Abrir Novo PDV"
              desc="Iniciar uma nova venda rápida"
              icon={ShoppingBag}
              gradient="bg-blue-gradient"
              onClick={() => onScreenChange('pdv')}
            />
            <ActionCard 
              title="Gerenciar Estoque"
              desc="Verificar e repor produtos"
              icon={PackageIcon}
              gradient="bg-blue-gradient opacity-90 hover:opacity-100"
              onClick={() => onScreenChange('estoque')}
            />
          </div>

          {/* Recent Sales List */}
          <div className="glass-card rounded-[2.5rem] p-8 shadow-glass neon-gold">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <Clock size={20} className="text-brand-blue" />
                Vendas Recentes
              </h3>
              <button className="text-xs font-bold text-brand-blue bg-brand-blue/5 px-3 py-1.5 rounded-xl uppercase tracking-widest hover:bg-blue-gradient hover:text-white transition-all">Ver Todas</button>
            </div>
            
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <button 
                  key={sale.id} 
                  onClick={() => setSelectedSale(sale)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5 hover:bg-white hover:shadow-xl hover:scale-[1.01] transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12",
                      sale.error ? "bg-red-500/10 text-red-400" : "bg-green-500/10 text-green-400"
                    )}>
                      <ShoppingBag size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">{sale.itemsCount}</p>
                      <p className="text-[10px] text-dark-muted font-bold uppercase tracking-wider">{sale.time} • {sale.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">{sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p className="text-[10px] text-dark-muted font-medium uppercase">{sale.id}</p>
                    </div>
                    <ChevronRight size={14} className="text-dark-muted group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="flex flex-col gap-6 h-full min-h-0">
          <div className="glass-card rounded-[2.5rem] p-6 shadow-glass bg-brand-gradient/5 neon-gold">
            <h3 className="text-lg font-bold text-foreground mb-4">Top Categorias</h3>
            <div className="space-y-4">
              {[
                { label: 'Conveniência', value: 65, color: 'bg-brand-blue' },
                { label: 'Lubrificantes', value: 45, color: 'bg-brand-blue/60' },
                { label: 'Serviços', value: 30, color: 'bg-brand-blue/30' },
              ].map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-dark-muted">
                    <span>{cat.label}</span>
                    <span>{cat.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.value}%` }}
                      className={cn("h-full", cat.color)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Laranja - IA Insight (Compacto e Seguro) */}
          <div className="flex-1 relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl border border-orange-400/30 bg-[#FF8C00] group flex flex-col justify-between">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[60px] rounded-full -mr-24 -mt-24" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg">
                    <Cpu size={24} className="text-[#FF8C00] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 leading-none">System Analysis</h4>
                    <h3 className="text-2xl font-black text-black tracking-tighter">INSIGHT IA <Sparkles size={16} className="inline ml-1" /></h3>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-[10px] font-black text-black uppercase tracking-widest">
                  Live Scan
                </div>
              </div>

              <p className="text-[11px] font-black text-black/40 uppercase tracking-widest mb-4">
                Padrão detectado em: <span className="bg-black text-white px-3 py-1 rounded-full ml-1">TEMPO REAL</span>
              </p>

              {/* Mini Cards Internos */}
              <div className="space-y-3">
                <div className="bg-black rounded-3xl p-5 shadow-xl border border-white/5 transform hover:scale-[1.02] transition-all">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Categoria Crítica</span>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Crescimento</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-black text-white leading-none">Bebidas Geladas</p>
                    <p className="text-2xl font-black text-[#FF8C00] leading-none">+24%</p>
                  </div>
                </div>

                <div className="bg-black rounded-3xl p-5 shadow-xl border border-white/5 transform hover:scale-[1.02] transition-all">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF8C00] flex items-center justify-center shrink-0 shadow-lg">
                      <Zap size={20} className="text-black" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-[#FF8C00] uppercase tracking-widest">Recomendação IA:</p>
                      <p className="text-[11px] font-bold text-white/80 leading-snug">
                        Reforçar estoque frontal para maximizar conversão durante o pico detectado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar Decor */}
            <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-black/20 rounded-full" />)}
              </div>
              <div className="text-[9px] font-black text-black/30 uppercase tracking-[0.3em]">Processing...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes da Venda - Fora da grid principal para evitar problemas de layout */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSale(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between bg-black/[0.02]">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    selectedSale.error ? "bg-red-500/10 text-red-400" : "bg-blue-gradient text-white"
                  )}>
                    {selectedSale.error ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">{selectedSale.id}</h2>
                    <p className="text-[10px] font-bold text-dark-secondary uppercase tracking-[0.2em]">{selectedSale.time} • {selectedSale.status}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Botões CRUD discretos */}
                  <div className="flex items-center gap-2 mr-4 px-3 py-2 bg-black/5 rounded-2xl border border-black/5">
                    <button 
                      onClick={() => !caixaAberto ? setShowLockAlert(true) : alert('Editar venda em breve...')}
                      className="p-2 rounded-xl hover:bg-brand-blue/10 text-dark-muted hover:text-brand-blue transition-all"
                      title="Editar Venda"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => !caixaAberto ? setShowLockAlert(true) : alert('Cancelar venda em breve...')}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-dark-muted hover:text-red-500 transition-all"
                      title="Cancelar Venda"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <button 
                    onClick={() => setSelectedSale(null)}
                    className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-all active:scale-90"
                  >
                    <X size={20} className="text-dark-secondary" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                <div>
                  <h4 className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] mb-4">Itens do Carrinho</h4>
                  <div className="space-y-3">
                    {selectedSale.itens.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-black text-brand-blue shadow-sm">
                            {item.qtd}x
                          </div>
                          <span className="text-sm font-bold text-foreground">{item.nome}</span>
                        </div>
                        <span className="text-sm font-black text-foreground">
                          {item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-black/5 border border-black/5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-dark-secondary font-medium">Método de Pagamento</span>
                    <div className="flex items-center gap-2 text-brand-blue font-bold">
                      {selectedSale.pagamento === 'PIX' ? <QrCode size={16} /> : selectedSale.pagamento === 'Dinheiro' ? <Banknote size={16} /> : <CreditCard size={16} />}
                      {selectedSale.pagamento}
                    </div>
                  </div>
                  <div className="h-px bg-black/5" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">Total Pago</span>
                    <span className="text-2xl font-black text-brand-blue">
                      {selectedSale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/[0.02] border-t border-black/5">
                <button 
                  onClick={() => setSelectedSale(null)}
                  className="w-full py-4 rounded-2xl bg-blue-gradient text-white font-black uppercase tracking-[0.2em] text-xs shadow-brand hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Fechar Visualização
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alerta de Caixa Fechado */}
      <AnimatePresence>
        {showLockAlert && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockAlert(false)}
              className="fixed inset-0 bg-red-950/20 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl text-center border border-red-500/10"
            >
              <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
                <ShieldAlert size={40} />
              </div>
              <h3 className="text-xl font-black text-foreground mb-4">Ação Bloqueada</h3>
              <p className="text-dark-secondary text-sm leading-relaxed mb-8">
                Caixa já encontra-se <span className="text-red-500 font-bold uppercase">Fechado</span>.<br/>Solicite a Reabertura para prosseguir!
              </p>
              <button
                onClick={() => setShowLockAlert(false)}
                className="w-full bg-red-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 transition-all"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, trend, up, icon: Icon, color }: any) {
  const themes: any = {
    blue: {
      bg: 'bg-brand-blue/10',
      border: 'border-brand-blue/20',
      text: 'text-brand-blue',
      icon: 'text-brand-blue'
    },
    purple: {
      bg: 'bg-brand-purple/10',
      border: 'border-brand-purple/20',
      text: 'text-brand-purple',
      icon: 'text-brand-purple'
    },
    pink: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      text: 'text-pink-600',
      icon: 'text-pink-500'
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-600',
      icon: 'text-orange-500'
    },
  };

  const theme = themes[color] || themes.blue;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.03] shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3", theme.bg, theme.text)}>
        <Icon size={28} />
      </div>
      
      <div className="flex flex-col gap-2">
        <span className={cn("text-[11px] font-black uppercase tracking-[0.2em]", theme.text)}>
          {label}
        </span>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-3xl font-black text-foreground tracking-tighter italic">
            {value}
          </span>
          {trend && (
            <span className={cn(
              "text-[10px] font-black px-2 py-1 rounded-xl shadow-sm",
              up ? "bg-green-500/10 text-green-500 border border-green-500/10" : "bg-red-500/10 text-red-500 border border-red-500/10"
            )}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon: Icon, gradient, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative p-8 rounded-[2.5rem] text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-lg",
        gradient
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
          <Icon size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/70 font-medium">{desc}</p>
      </div>
    </button>
  );
}

function ProgressItem({ label, percent, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-dark-secondary">{label}</span>
        <span className="text-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn("h-full rounded-full", color)} 
        />
      </div>
    </div>
  );
}

function PackageIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  )
}

