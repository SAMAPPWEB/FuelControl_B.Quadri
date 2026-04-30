import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Filter, Plus, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Edit3, MoreVertical, Trash2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemEstoque {
  id: string;
  nome: string;
  categoria: string;
  quantidade: number;
  minimo: number;
  precoCusto: number;
  precoVenda: number;
  ultimaEntrada: string;
}

const ESTOQUE_MOCK: ItemEstoque[] = [
  { id: '1', nome: 'Coca-Cola 350ml', categoria: 'Bebidas', quantidade: 24, minimo: 10, precoCusto: 3.20, precoVenda: 5.50, ultimaEntrada: '2026-04-28' },
  { id: '2', nome: 'Água Mineral 500ml', categoria: 'Bebidas', quantidade: 8, minimo: 15, precoCusto: 1.50, precoVenda: 3.00, ultimaEntrada: '2026-04-25' },
  { id: '3', nome: 'Salgadinho Lays', categoria: 'Snacks', quantidade: 15, minimo: 12, precoCusto: 5.40, precoVenda: 8.90, ultimaEntrada: '2026-04-29' },
  { id: '4', nome: 'Chocolate Nestlé', categoria: 'Doces', quantidade: 0, minimo: 10, precoCusto: 4.10, precoVenda: 6.50, ultimaEntrada: '2026-04-20' },
  { id: '5', nome: 'Energético Monster', categoria: 'Bebidas', quantidade: 45, minimo: 20, precoCusto: 8.50, precoVenda: 12.90, ultimaEntrada: '2026-04-29' },
];

export default function Estoque() {
  const [items, setItems] = useState<ItemEstoque[]>(ESTOQUE_MOCK);
  const [busca, setBusca] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ItemEstoque | null>(null);

  const filtrados = items.filter(item => 
    item.nome.toLowerCase().includes(busca.toLowerCase()) ||
    item.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      setItems(items.filter(i => i.id !== id));
      setOpenMenu(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      if (editingItem.id === 'new') {
        setItems([...items, { ...editingItem, id: Math.random().toString(36).substr(2, 9) }]);
      } else {
        setItems(items.map(i => i.id === editingItem.id ? editingItem : i));
      }
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6 font-outfit">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Estoque</h1>
          <p className="text-dark-secondary">Controle e reposição de produtos da loja</p>
        </div>
        <button 
          onClick={() => setEditingItem({ id: 'new', nome: '', categoria: 'Geral', quantidade: 0, minimo: 5, precoCusto: 0, precoVenda: 0, ultimaEntrada: new Date().toISOString() })}
          className="bg-brand-gradient px-6 py-3 rounded-2xl text-white font-bold text-sm uppercase tracking-widest shadow-brand flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/* Grid de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Total de Itens" 
          value={items.reduce((acc, i) => acc + i.quantidade, 0).toString()} 
          icon={Package} 
          color="blue"
        />
        <StatsCard 
          label="Estoque Baixo" 
          value={items.filter(i => i.quantidade > 0 && i.quantidade <= i.minimo).length.toString()} 
          icon={AlertCircle} 
          color="yellow"
        />
        <StatsCard 
          label="Esgotados" 
          value={items.filter(i => i.quantidade === 0).length.toString()} 
          icon={AlertCircle} 
          color="red"
        />
        <StatsCard 
          label="Valor em Estoque" 
          value={(items.reduce((acc, i) => acc + (i.quantidade * i.precoVenda), 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
          icon={ArrowUpRight} 
          color="purple"
        />
      </div>

      {/* Filtros e Lista */}
      <div className="glass-card rounded-[2rem] overflow-hidden shadow-glass border border-black/5 neon-gold">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar no inventário..."
              className="w-full bg-black/5 border border-black/10 rounded-xl py-3 pl-12 pr-4 text-sm text-foreground focus:outline-none focus:border-brand-blue/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/5 border border-black/5 text-dark-secondary text-sm font-bold hover:bg-black/10 transition-all">
            <Filter size={18} />
            Filtros Avançados
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.03] text-[11px] uppercase tracking-[0.2em] text-foreground font-black border-b border-black/5">
                <th className="px-6 py-5">Produto</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Estoque Atual</th>
                <th className="px-6 py-4 text-right">Preço Venda</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtrados.map((item, idx) => {
                const isLow = item.quantidade > 0 && item.quantidade <= item.minimo;
                const isOut = item.quantidade === 0;
                
                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item.id} 
                    className="group hover:bg-black/[0.02] transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-foreground text-sm tracking-tight">{item.nome}</span>
                        <span className="text-[10px] text-dark-muted font-bold">ID: {item.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-black/5 text-dark-secondary uppercase tracking-widest border border-black/5">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        {isOut ? (
                          <span className="px-4 py-1.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-sm shadow-red-500/10">
                            Esgotado
                          </span>
                        ) : isLow ? (
                          <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 shadow-sm shadow-amber-500/10">
                            Baixo Estoque
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest border border-green-500/20 shadow-sm shadow-green-500/10">
                            Normal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={cn(
                        "text-base font-black tracking-tighter",
                        isOut ? "text-red-500" : isLow ? "text-amber-500" : "text-foreground"
                      )}>
                        {item.quantidade} <span className="text-[10px] font-bold text-dark-muted lowercase">un</span>
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-brand-blue text-sm tracking-tight">
                      {item.precoVenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-5 text-right relative">
                      <div className="flex justify-end">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === item.id ? null : item.id);
                          }}
                          className={cn(
                            "p-2 rounded-xl transition-all",
                            openMenu === item.id ? "bg-brand-blue/10 text-brand-blue" : "text-dark-muted hover:text-brand-blue hover:bg-black/5"
                          )}
                        >
                          <MoreVertical size={18} />
                        </button>

                        <AnimatePresence>
                          {openMenu === item.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-16 top-0 w-40 bg-white rounded-2xl shadow-2xl border border-black/5 p-2 z-50 neon-gold"
                              >
                                <button 
                                  onClick={() => {
                                    setEditingItem(item);
                                    setOpenMenu(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-dark-secondary hover:bg-black/5 transition-colors"
                                >
                                  <Edit3 size={16} className="text-brand-blue" />
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={16} />
                                  Excluir
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-foreground">
                  {editingItem.id === 'new' ? 'Novo Produto' : 'Editar Produto'}
                </h3>
                <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-black/5 rounded-xl">
                  <X size={24} className="text-dark-muted" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Nome do Produto</label>
                      <input 
                        required
                        type="text" 
                        value={editingItem.nome}
                        onChange={e => setEditingItem({...editingItem, nome: e.target.value})}
                        className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 text-sm font-bold focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Categoria</label>
                      <select 
                        value={editingItem.categoria}
                        onChange={e => setEditingItem({...editingItem, categoria: e.target.value})}
                        className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 text-sm font-bold focus:border-brand-blue"
                      >
                        <option>Bebidas</option>
                        <option>Gelados</option>
                        <option>Snacks</option>
                        <option>Doces</option>
                        <option>Geral</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Estoque Atual</label>
                      <input 
                        type="number" 
                        value={editingItem.quantidade}
                        onChange={e => setEditingItem({...editingItem, quantidade: Number(e.target.value)})}
                        className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 text-sm font-bold focus:border-brand-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Preço Custo</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-dark-muted">R$</span>
                        <input 
                          type="number" step="0.01"
                          value={editingItem.precoCusto}
                          onChange={e => setEditingItem({...editingItem, precoCusto: Number(e.target.value)})}
                          className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-10 text-sm font-bold focus:border-brand-blue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Preço Venda</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-dark-muted">R$</span>
                        <input 
                          type="number" step="0.01"
                          value={editingItem.precoVenda}
                          onChange={e => setEditingItem({...editingItem, precoVenda: Number(e.target.value)})}
                          className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 pl-10 text-sm font-bold focus:border-brand-blue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-dark-muted mb-2 block tracking-widest">Estoque Mín.</label>
                      <input 
                        type="number" 
                        value={editingItem.minimo}
                        onChange={e => setEditingItem({...editingItem, minimo: Number(e.target.value)})}
                        className="w-full bg-black/5 border border-black/10 rounded-2xl p-4 text-sm font-bold focus:border-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" onClick={() => setEditingItem(null)}
                    className="flex-1 py-4 rounded-2xl font-bold text-dark-secondary bg-black/5 hover:bg-black/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl font-black text-white bg-brand-gradient shadow-brand hover:brightness-110 transition-all uppercase tracking-widest text-xs"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  const themes: any = {
    blue: 'text-brand-blue bg-brand-blue/10 border-brand-blue/20',
    purple: 'text-brand-purple bg-brand-purple/10 border-brand-purple/20',
    yellow: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-black/[0.03] shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3", themes[color])}>
        <Icon size={28} />
      </div>
      
      <div className="flex flex-col gap-2">
        <span className={cn("text-[11px] font-black uppercase tracking-[0.2em]", themes[color].split(' ')[0])}>
          {label}
        </span>
        <span className="text-3xl font-black text-foreground tracking-tighter italic">
          {value}
        </span>
      </div>
    </div>
  );
}

