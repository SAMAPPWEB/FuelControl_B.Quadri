import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Fuel, Truck, Building2, Pencil, Trash2, UserPlus,
  Upload, Check, Shield, User, Plus, History as HistoryIcon, X,
  Save, Eye, EyeOff, LayoutGrid, Settings2, Sparkles, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/hooks/useData';
import { SecurityService } from '@/services/security';
import type { Perfil, StatusUsuario, GeneroAvatar } from '@/types';

export default function Configuracoes() {
  const { loading } = useData();
  const [activeTab, setActiveTab] = useState<'usuarios' | 'combustivel' | 'empresa' | 'modulos'>('usuarios');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-12 h-12 border-2 border-brand-blue border-t-transparent rounded-full animate-spin shadow-brand" />
        <p className="text-sm font-medium text-dark-secondary animate-pulse uppercase tracking-widest">Sincronizando Sistema...</p>
      </div>
    );
  }

  const tabs = [
    { key: 'usuarios' as const, label: 'Equipe', icon: Users },
    { key: 'modulos' as const, label: 'Módulos', icon: LayoutGrid },
    { key: 'combustivel' as const, label: 'Produtos', icon: Fuel },
    { key: 'empresa' as const, label: 'Empresa', icon: Building2 },
  ];

  return (
    <div className="space-y-8 font-outfit">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight">Configurações do <span className="text-gradient-gold">Sistema</span></h1>
        <p className="text-dark-secondary mt-1">Gerencie permissões, módulos e dados da plataforma</p>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all relative overflow-hidden group',
                  isActive 
                    ? 'bg-brand-gradient text-white shadow-brand' 
                    : 'bg-black/5 border border-black/5 text-dark-secondary hover:bg-black/10'
                )}
              >
                <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-brand-blue")} />
                <span className="font-bold text-sm">{tab.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="tab-indicator"
                    className="absolute inset-0 bg-white/10"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'usuarios' && <UsuariosConfig />}
              {activeTab === 'modulos' && <ModulosConfig />}
              {activeTab === 'combustivel' && <CombustivelConfig />}
              {activeTab === 'empresa' && <EmpresaConfig />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ================= USUARIOS ================= */
function UsuariosConfig() {
  const { usuarios = [], createUsuario, updateUsuario } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [form, setForm] = useState({
    nome: '',
    apelido: '',
    email: '',
    senha: '',
    perfil: 'atendimento' as Perfil,
    funcao: 'Atendimento',
    status: 'ativo' as StatusUsuario,
    avatar: 'masculino' as GeneroAvatar
  });

  const AVATARES = {
    masculino: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    feminino: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop'
  };

  const resetForm = () => {
    setForm({
      nome: '',
      apelido: '',
      email: '',
      senha: '',
      perfil: 'atendimento',
      funcao: 'Atendimento',
      status: 'ativo',
      avatar: 'masculino'
    });
    setEditing(null);
  };

  const openEdit = (u: any) => {
    setEditing(u);
    setForm({
      nome: u.nome || '',
      apelido: u.apelido || '',
      email: u.email || '',
      senha: '',
      perfil: u.perfil || 'atendimento',
      funcao: u.funcao || 'Atendimento',
      status: u.status || 'ativo',
      avatar: u.avatar || 'masculino'
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.apelido || !form.email || !form.funcao || !form.perfil || !form.status) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    if (editing) {
      const updates: any = { ...form };
      if (updates.senha) updates.senhaHash = SecurityService.hashPassword(updates.senha);
      delete updates.senha;
      updateUsuario(editing.id, updates);
    } else {
      const { senha, ...userData } = form;
      const hash = SecurityService.hashPassword(senha || 'senha123');
      createUsuario({ 
        ...userData, 
        senhaHash: hash, 
        modulos: ['abastecimento'],
        whatsapp: '' 
      });
    }
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-black text-foreground">Equipe <span className="text-brand-blue">Operacional</span></h3>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="bg-brand-gradient p-4 rounded-2xl text-white shadow-brand hover:brightness-110 active:scale-95 transition-all"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {usuarios.map((u) => (
          <div key={u.id} className="bg-white/60 backdrop-blur-sm group p-5 rounded-[2rem] flex items-center justify-between hover:bg-white/80 transition-all border border-black/5 shadow-sm neon-gold">
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-white",
                u.avatar === 'feminino' ? 'bg-pink-500' : 'bg-brand-blue'
              )}>
                <img 
                  src={u.avatar === 'feminino' ? AVATARES.feminino : AVATARES.masculino} 
                  className="w-full h-full object-cover" 
                  alt="Avatar"
                />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">{u.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-widest">{u.apelido}</span>
                  <span className="w-1 h-1 rounded-full bg-dark-muted" />
                  <span className="text-xs text-dark-secondary">{u.funcao}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end gap-1 mr-4">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  u.perfil === 'master' ? "bg-red-500/10 text-red-500" : "bg-brand-blue/10 text-brand-blue"
                )}>
                  {u.perfil}
                </span>
                <span className={cn("text-[10px] font-bold", u.status === 'ativo' ? "text-green-500" : "text-dark-muted")}>
                  ● {u.status?.toUpperCase() || 'INATIVO'}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(u)} className="p-3 rounded-xl bg-black/5 border border-black/5 text-dark-muted hover:text-brand-blue transition-colors">
                  <Pencil size={18} />
                </button>
                <button onClick={() => setDeleteConfirmId(u.id)} className="p-3 rounded-xl bg-black/5 border border-black/5 text-dark-muted hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              onClick={() => setModalOpen(false)} 
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white border border-black/5 rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <h2 className="text-2xl font-black text-foreground mb-8">{editing ? 'Editar' : 'Novo'} Operador</h2>
              
              <div className="space-y-6">
                <div className="flex justify-center gap-8 mb-4">
                   {['masculino', 'feminino'].map(g => (
                     <button
                       key={g}
                       type="button"
                       onClick={() => setForm({...form, avatar: g as any})}
                       className={cn(
                         "relative w-24 h-24 rounded-3xl overflow-hidden transition-all border-4 shadow-xl",
                         form.avatar === g ? "border-brand-blue scale-110 shadow-brand/20" : "border-white/5 opacity-40 grayscale"
                       )}
                     >
                       <img 
                         src={g === 'masculino' ? AVATARES.masculino : AVATARES.feminino} 
                         className="w-full h-full object-cover" 
                         alt={g} 
                       />
                       <div className={cn(
                         "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                         form.avatar === g ? "opacity-0" : "opacity-100"
                       )}>
                         <Check size={32} className="text-white" />
                       </div>
                     </button>
                   ))}
                </div>

                <div className="space-y-4">
                  <PremiumInput label="Nome Completo" value={form.nome} onChange={(v: string) => setForm({...form, nome: v})} />
                  <PremiumInput label="Apelido" value={form.apelido} onChange={(v: string) => setForm({...form, apelido: v})} />
                  <PremiumInput label="E-mail / Login" value={form.email} onChange={(v: string) => setForm({...form, email: v})} />
                  <PremiumInput label="Senha" type="password" value={form.senha} onChange={(v: string) => setForm({...form, senha: v})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-3 block">Função *</label>
                     <select 
                       value={form.funcao}
                       onChange={e => setForm({...form, funcao: e.target.value})}
                       className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                     >
                       <option value="Atendimento">Atendimento</option>
                       <option value="Caixa">Caixa</option>
                       <option value="Financeiro">Financeiro</option>
                       <option value="Administrativo">Administrativo</option>
                     </select>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-3 block">Perfil *</label>
                     <select 
                       value={form.perfil}
                       onChange={e => setForm({...form, perfil: e.target.value as any})}
                       className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                     >
                       <option value="atendimento">Operador</option>
                       <option value="admin">Administrador</option>
                       <option value="master">Master (Total)</option>
                     </select>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <div>
                     <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-3 block">Status *</label>
                     <select 
                       value={form.status}
                       onChange={e => setForm({...form, status: e.target.value as any})}
                       className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-4 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                     >
                       <option value="ativo">Ativo</option>
                       <option value="inativo">Inativo</option>
                       <option value="bloqueado">Bloqueado</option>
                     </select>
                   </div>
                </div>

                <button
                  onClick={handleSave}
                  className="w-full bg-brand-gradient py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-brand hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Confirmar Dados
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= MODULOS ================= */
function ModulosConfig() {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 mb-2">
        <Sparkles size={24} className="text-brand-purple" />
        <h3 className="text-2xl font-black text-foreground">Ecossistema <span className="text-brand-purple">SaaS</span></h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ModuleCard 
          title="Loja" 
          desc="PDV, Estoque de Produtos e Vendas diretas." 
          icon={LayoutGrid} 
          active={true}
          color="purple"
        />
        <ModuleCard 
          title="Abastecimento" 
          desc="Controle de frotas e bombas de combustível." 
          icon={Fuel} 
          active={true}
          color="blue"
        />
        <ModuleCard 
          title="Financeiro" 
          desc="Contas a pagar, receber e fluxo de caixa." 
          icon={DollarSign} 
          active={false}
          color="green"
        />
        <ModuleCard 
          title="Delivery" 
          desc="Gestão de pedidos e entregadores." 
          icon={Truck} 
          active={false}
          color="orange"
        />
      </div>
      
      <div className="p-8 rounded-[2.5rem] bg-brand-purple/10 border border-brand-purple/20 flex flex-col md:flex-row items-center gap-6 neon-gold">
         <div className="w-16 h-16 rounded-2xl bg-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
           <Shield size={32} />
         </div>
         <div>
           <p className="text-foreground font-bold text-lg">Precisa de mais módulos?</p>
           <p className="text-dark-secondary text-sm">Contate o suporte técnico para habilitar novos recursos em sua licença SaaS.</p>
         </div>
         <button className="whitespace-nowrap px-8 py-4 rounded-xl bg-brand-purple text-white font-bold text-sm hover:brightness-110 transition-all ml-auto">
           Falar com Suporte
         </button>
      </div>
    </div>
  );
}

function ModuleCard({ title, desc, icon: Icon, active, color }: any) {
  const colors: any = {
    purple: 'text-brand-purple bg-brand-purple/10',
    blue: 'text-brand-blue bg-brand-blue/10',
    green: 'text-green-500 bg-green-500/10',
    orange: 'text-orange-500 bg-orange-500/10',
  };

  return (
    <div className={cn(
      "glass-card p-8 rounded-[3rem] border border-white/5 flex flex-col items-center text-center group transition-all neon-gold",
      !active && "opacity-40 grayscale"
    )}>
      <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", colors[color])}>
        <Icon size={32} />
      </div>
      <h4 className="text-xl font-bold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-dark-secondary mb-6 leading-relaxed">{desc}</p>
      
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/5 text-[10px] font-black uppercase tracking-widest text-dark-muted">
        {active ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-green-500">Módulo Ativo</span>
          </>
        ) : (
          <span>Disponível em breve</span>
        )}
      </div>
    </div>
  );
}

/* ================= COMBUSTIVEL ================= */
function CombustivelConfig() {
  const { combustiveis = [], updateCombustivel } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showEntry, setShowEntry] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [entryForm, setEntryForm] = useState({ qtd: '', custo: '' });
  const [editingHistory, setEditingHistory] = useState<any>(null);

  // Mock de histórico para demonstração visual
  const [historico, setHistorico] = useState<any[]>([]);

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setForm({
      custo: (c.precoCusto || 0).toFixed(2),
      venda: (c.precoVenda || 0).toFixed(2),
      atual: (c.estoqueLitros || 0).toFixed(2),
      limite: (c.limiteMinimo || 0).toFixed(0),
    });
  };

  const handleSave = (c: any) => {
    updateCombustivel(c.id, {
      precoCusto: parseFloat(form.custo),
      precoVenda: parseFloat(form.venda),
      estoqueLitros: parseFloat(form.atual),
      limiteMinimo: parseFloat(form.limite),
    });
    setEditingId(null);
  };

  const handleEntry = async (fuelId: string) => {
    const qtd = parseFloat(entryForm.qtd);
    const custo = parseFloat(entryForm.custo);
    const fuel = combustiveis.find(f => String(f.id) === String(fuelId));
    
    if (fuel && !isNaN(qtd)) {
      if (editingHistory) {
        // Ajuste de estoque na edição: novo = atual - anterior + novo
        const delta = qtd - editingHistory.qtd;
        await updateCombustivel(fuelId, {
          estoqueLitros: fuel.estoqueLitros + delta,
          precoCusto: custo || fuel.precoCusto
        });

        setHistorico(historico.map(h => 
          h.id === editingHistory.id 
            ? { ...h, qtd, custo: custo || h.custo } 
            : h
        ));
      } else {
        // Nova entrada normal
        await updateCombustivel(fuelId, {
          estoqueLitros: fuel.estoqueLitros + qtd,
          precoCusto: custo || fuel.precoCusto
        });
        
        setHistorico([
          { 
            id: Math.random().toString(), 
            fuelId, 
            data: new Date().toLocaleString('pt-BR').slice(0, 16), 
            qtd, 
            custo: custo || fuel.precoCusto, 
            user: 'Admin' 
          },
          ...historico
        ]);
      }
      
      setShowEntry(null);
      setEditingHistory(null);
      setEntryForm({ qtd: '', custo: '' });
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Fuel size={24} className="text-brand-blue" />
          <h3 className="text-2xl font-black text-foreground">Produtos & <span className="text-brand-blue">Estoque</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {combustiveis.map(c => {
          const isEditing = editingId === c.id;
          const tankPercent = (c.estoqueLitros / 5000) * 100;
          
          return (
            <div key={c.id} className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-6 relative overflow-hidden neon-gold">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                    c.nome === 'Gasolina' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {c.nome === 'Gasolina' ? <Fuel size={28} /> : <Truck size={28} />}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-foreground">{c.nome}</h4>
                    <span className="text-[10px] font-black opacity-50 uppercase tracking-widest">Capacidade 5.000L</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowEntry(c.id)}
                    className="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-sm active:scale-90"
                    title="Registrar Entrada"
                  >
                    <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => isEditing ? handleSave(c) : startEdit(c)}
                    className={cn(
                      "p-3 rounded-xl transition-all shadow-sm active:scale-90",
                      isEditing ? "bg-green-500/10 text-green-500" : "bg-black/5 text-dark-muted hover:bg-brand-blue/10 hover:text-brand-blue"
                    )}
                  >
                    {isEditing ? <Check size={20} /> : <Settings2 size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/5 border border-black/5">
                   <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-1 whitespace-nowrap italic">R$ Custo</p>
                   {isEditing ? (
                     <input 
                       type="number" step="0.01" value={form.custo} 
                       onChange={e => setForm({...form, custo: e.target.value})}
                       className="w-full bg-transparent text-xl font-black text-foreground focus:outline-none"
                     />
                   ) : (
                     <p className="text-xl font-black text-foreground tracking-tighter">R$ {c.precoCusto?.toFixed(2)}</p>
                   )}
                </div>
                <div className="p-4 rounded-2xl bg-black/5 border border-black/5">
                   <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-1 whitespace-nowrap italic">R$ Venda</p>
                   {isEditing ? (
                     <input 
                       type="number" step="0.01" value={form.venda} 
                       onChange={e => setForm({...form, venda: e.target.value})}
                       className="w-full bg-transparent text-xl font-black text-foreground focus:outline-none"
                     />
                   ) : (
                     <p className="text-xl font-black text-foreground tracking-tighter">R$ {c.precoVenda.toFixed(2)}</p>
                   )}
                </div>
                <div className="p-4 rounded-2xl bg-black/5 border border-black/5">
                   <p className="text-[10px] font-bold text-dark-muted uppercase tracking-widest mb-1 whitespace-nowrap italic">Estoque</p>
                   {isEditing ? (
                     <input 
                       type="number" step="0.01" value={form.atual} 
                       onChange={e => setForm({...form, atual: e.target.value})}
                       className="w-full bg-transparent text-xl font-black text-foreground focus:outline-none"
                     />
                   ) : (
                     <p className={cn(
                       "text-xl font-black tracking-tighter",
                       tankPercent < 20 ? "text-red-500" : "text-foreground"
                     )}>
                       {c.estoqueLitros.toFixed(0)}<span className="text-[10px] opacity-40 ml-0.5">L</span>
                     </p>
                   )}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest">Nível do Tanque</span>
                  <span className={cn(
                    "text-[10px] font-black",
                    tankPercent < 20 ? "text-red-500 animate-pulse" : "text-brand-blue"
                  )}>
                    {tankPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-black/5 rounded-full overflow-hidden border border-black/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${tankPercent}%` }}
                    className={cn(
                      "h-full transition-colors duration-1000",
                      tankPercent < 20 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-brand-blue shadow-brand-blue"
                    )} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Histórico de Reabastecimento */}
      <div className="glass-card p-8 rounded-[3rem] border border-white/5 space-y-6 neon-gold">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HistoryIcon size={20} className="text-dark-muted" />
            <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Histórico de Reabastecimento</h4>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-dark-muted uppercase tracking-[0.2em] border-b border-black/5">
                <th className="py-4 px-4">Data/Hora</th>
                <th className="py-4 px-4">Combustível</th>
                <th className="py-4 px-4 text-right">Volume</th>
                <th className="py-4 px-4 text-right">Preço Custo</th>
                <th className="py-4 px-4 text-right">Operador</th>
                <th className="py-4 px-4 text-right w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {historico.map(h => {
                const fuel = combustiveis.find(f => String(f.id) === String(h.fuelId));
                return (
                  <tr key={h.id} className="group hover:bg-black/[0.02] transition-all">
                    <td className="py-4 px-4 text-xs font-bold text-dark-muted">{h.data}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                        fuel?.nome === 'Gasolina' ? "bg-orange-500/10 text-orange-500" : 
                        fuel?.nome?.includes('Diesel') ? "bg-blue-500/10 text-blue-500" : "bg-black/5 text-dark-muted"
                      )}>
                        {fuel?.nome || 'Combustível'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-black text-foreground">+{h.qtd} L</td>
                    <td className="py-4 px-4 text-right text-sm font-bold text-dark-muted">R$ {h.custo.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right text-xs font-black text-brand-blue uppercase tracking-tighter">{h.user}</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingHistory(h);
                          setEntryForm({ qtd: h.qtd.toString(), custo: h.custo.toString() });
                          setShowEntry(h.fuelId);
                        }}
                        className="p-2 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white transition-all active:scale-90"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Entrada de Tanque */}
      <AnimatePresence>
        {showEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowEntry(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-foreground">
                  {editingHistory ? 'Editar' : 'Entrada de'} <span className="text-green-500">Tanque</span>
                </h3>
                <button onClick={() => { setShowEntry(null); setEditingHistory(null); setEntryForm({ qtd: '', custo: '' }); }} className="p-2 hover:bg-black/5 rounded-xl"><X size={24} /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Quantidade (Litros)</label>
                  <input 
                    type="number" value={entryForm.qtd}
                    onChange={e => setEntryForm({...entryForm, qtd: e.target.value})}
                    placeholder="Ex: 5000"
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-5 text-xl font-black focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Preço de Custo (Compra)</label>
                  <input 
                    type="number" step="0.01" value={entryForm.custo}
                    onChange={e => setEntryForm({...entryForm, custo: e.target.value})}
                    placeholder="R$ 0.00"
                    className="w-full bg-black/5 border border-black/10 rounded-2xl p-5 text-xl font-black focus:border-green-500 outline-none"
                  />
                </div>

                <button 
                  onClick={() => handleEntry(showEntry)}
                  className="w-full bg-green-500 py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-green-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  Confirmar Entrada
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= EMPRESA ================= */
function EmpresaConfig() {
  const { empresa = null, saveEmpresa } = useData();
  const [form, setForm] = useState({
    razaoSocial: empresa?.razaoSocial || '',
    nomeFantasia: empresa?.nomeFantasia || '',
    cnpj: empresa?.cnpj || '',
    endereco: empresa?.endereco || '',
    whatsapp: empresa?.whatsapp || '',
    pixKey: empresa?.pixKey || '',
    logoUrl: empresa?.logoUrl || '',
  });
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    alert('CLICOU NO BOTÃO!');
    setIsSaving(true);
    try {
      await saveEmpresa({ 
        id: empresa?.id || '1', 
        ...form 
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error(error);
      alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido na API'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 mb-2">
        <Building2 size={24} className="text-brand-blue" />
        <h3 className="text-2xl font-black text-foreground">Dados da <span className="text-brand-blue">Unidade</span></h3>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-10 rounded-[3rem] border border-black/5 space-y-8 shadow-sm neon-gold">
        <div className="flex flex-col items-center gap-4 py-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group relative cursor-pointer"
            >
              {form.logoUrl ? (
                <img src={form.logoUrl} className="w-full h-full object-cover" />
              ) : (
                <Building2 size={40} className="text-dark-muted" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <Upload size={20} className="text-white" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em]">Logomarca da Unidade</p>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumInput label="Razão Social" value={form.razaoSocial} onChange={(v: string) => setForm({...form, razaoSocial: v})} />
          <PremiumInput label="Nome Fantasia" value={form.nomeFantasia} onChange={(v: string) => setForm({...form, nomeFantasia: v})} />
          <PremiumInput label="CNPJ" value={form.cnpj} onChange={(v: string) => setForm({...form, cnpj: v})} />
          <PremiumInput label="WhatsApp Comercial" value={form.whatsapp} onChange={(v: string) => setForm({...form, whatsapp: v})} />
        </div>

        <PremiumInput label="Endereço da Unidade" value={form.endereco} onChange={(v: string) => setForm({...form, endereco: v})} />
        <PremiumInput label="Chave PIX (Recebimentos)" value={form.pixKey} onChange={(v: string) => setForm({...form, pixKey: v})} />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-brand hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
            saved ? 'bg-green-500' : 'bg-brand-gradient'
          } disabled:opacity-50`}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check size={20} />
              Dados Sincronizados
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ================= UTILS ================= */
function PremiumInput({ label, value, onChange, type = 'text', placeholder }: any) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-widest text-dark-muted mb-3 block ml-1">{label}</label>
      <div className="relative group">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-6 text-sm font-bold text-foreground placeholder:text-dark-muted focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue/40 transition-all pr-12"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}


