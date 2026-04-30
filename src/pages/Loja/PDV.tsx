import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, 
  ArrowRight, CheckCircle2, X, PlusCircle, CreditCard, 
  Banknote, QrCode, DollarSign, Wallet, ArrowDownCircle, ArrowUpCircle, History
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  estoque: number;
  foto?: string;
}

const PRODUTOS_MOCK: Produto[] = [
  { id: '1', nome: 'Coca-Cola 350ml', preco: 5.50, categoria: 'Bebidas', estoque: 24 },
  { id: '2', nome: 'Água Mineral 500ml', preco: 3.00, categoria: 'Bebidas', estoque: 48 },
  { id: '3', nome: 'Salgadinho Lays', preco: 8.90, categoria: 'Snacks', estoque: 15 },
  { id: '4', nome: 'Chocolate Nestlé', preco: 6.50, categoria: 'Doces', estoque: 10 },
  { id: '5', nome: 'Energético Monster', preco: 12.90, categoria: 'Bebidas', estoque: 12 },
  { id: '6', nome: 'Pastilha Halls', preco: 2.50, categoria: 'Doces', estoque: 50 },
];

export function PDV({ caixaAberto, setCaixaAberto }: { caixaAberto: boolean, setCaixaAberto: (v: boolean) => void }) {
  const [busca, setBusca] = useState('');
  const [carrinho, setCarrinho] = useState<{ produto: Produto; qtd: number }[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [pagamentos, setPagamentos] = useState<{ id: string; metodo: string; valor: number }[]>([]);
  const [metodoSelecionado, setMetodoSelecionado] = useState<string | null>(null);
  const [valorParcial, setValorParcial] = useState('');

  // Estados de Gestão de Caixa
  // Estados de Gestão de Caixa (caixaAberto vem via props)
  const [showCaixaModal, setShowCaixaModal] = useState<'abrir' | 'fechar' | 'sangria' | 'suprimento' | null>(null);
  const [fundoReserva, setFundoReserva] = useState('0,00');
  const [movimentacoesCaixa, setMovimentacoesCaixa] = useState<any[]>([]);
  const [justificativaCaixa, setJustificativaCaixa] = useState('');
  const [valorCaixaOp, setValorCaixaOp] = useState('');

  const produtosFiltrados = PRODUTOS_MOCK.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const total = useMemo(() => 
    carrinho.reduce((acc, item) => acc + (item.produto.preco * item.qtd), 0),
  [carrinho]);

  const totalPago = useMemo(() => 
    pagamentos.reduce((acc, p) => acc + p.valor, 0),
  [pagamentos]);

  const abrirCaixa = () => {
    const valor = parseFloat(fundoReserva.replace(',', '.'));
    setMovimentacoesCaixa([{
      id: Date.now(),
      tipo: 'abertura',
      valor,
      hora: new Date().toLocaleTimeString(),
      obs: 'Abertura de caixa'
    }]);
    setCaixaAberto(true);
    setShowCaixaModal(null);
  };

  const fecharCaixa = () => {
    setCaixaAberto(false);
    setMovimentacoesCaixa([]);
    setShowCaixaModal(null);
    alert('Caixa fechado com sucesso!');
  };

  const operacaoCaixa = (tipo: 'sangria' | 'suprimento') => {
    const valor = parseFloat(valorCaixaOp.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return;

    setMovimentacoesCaixa(prev => [{
      id: Date.now(),
      tipo,
      valor,
      hora: new Date().toLocaleTimeString(),
      obs: justificativaCaixa
    }, ...prev]);

    setValorCaixaOp('');
    setJustificativaCaixa('');
    setShowCaixaModal(null);
  };

  const restante = useMemo(() => 
    Math.max(0, total - totalPago),
  [total, totalPago]);

  const troco = useMemo(() => 
    totalPago > total ? totalPago - total : 0,
  [totalPago, total]);

  const adicionarPagamento = () => {
    if (!metodoSelecionado || !valorParcial) return;
    const valor = parseFloat(valorParcial.replace(',', '.'));
    if (isNaN(valor) || valor <= 0) return;

    const novosPagamentos = [...pagamentos, {
      id: Math.random().toString(36).substr(2, 9),
      metodo: metodoSelecionado,
      valor
    }];

    setPagamentos(novosPagamentos);
    
    const novoTotalPago = novosPagamentos.reduce((acc, p) => acc + p.valor, 0);
    const novoRestante = Math.max(0, total - novoTotalPago);
    
    if (novoRestante > 0) {
      setValorParcial(novoRestante.toFixed(2).replace('.', ','));
    } else {
      setValorParcial('');
    }
    
    setMetodoSelecionado(null);
  };

  const removerPagamento = (id: string) => {
    setPagamentos(prev => prev.filter(p => p.id !== id));
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho(prev => {
      const existe = prev.find(item => item.produto.id === produto.id);
      if (existe) {
        return prev.map(item => 
          item.produto.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
        );
      }
      return [...prev, { produto, qtd: 1 }];
    });
  };

  const alterarQtd = (id: string, delta: number) => {
    setCarrinho(prev => prev.map(item => {
      if (item.produto.id === id) {
        const novaQtd = Math.max(1, item.qtd + delta);
        return { ...item, qtd: novaQtd };
      }
      return item;
    }));
  };

  const removerDoCarrinho = (id: string) => {
    setCarrinho(prev => prev.filter(item => item.produto.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-outfit h-[calc(100vh-12rem)]">
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar produtos ou categorias..."
              className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {!caixaAberto ? (
              <button 
                onClick={() => setShowCaixaModal('abrir')}
                className="px-6 py-4 rounded-2xl bg-green-500 text-white font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Wallet size={20} />
                ABRIR CAIXA
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowCaixaModal('suprimento')}
                  className="p-4 rounded-2xl bg-black/5 text-brand-blue hover:bg-brand-blue/10 transition-all"
                  title="Suprimento"
                >
                  <ArrowUpCircle size={20} />
                </button>
                <button 
                  onClick={() => setShowCaixaModal('sangria')}
                  className="p-4 rounded-2xl bg-black/5 text-red-500 hover:bg-red-500/10 transition-all"
                  title="Sangria"
                >
                  <ArrowDownCircle size={20} />
                </button>
                <button 
                  onClick={() => setShowCaixaModal('fechar')}
                  className="px-6 py-4 rounded-2xl bg-black text-white font-bold flex items-center gap-2 hover:bg-red-600 transition-all"
                >
                  FECHAR CAIXA
                </button>
              </div>
            )}
          </div>
        </div>

        {!caixaAberto && (
          <div className="p-12 glass-card rounded-[3rem] border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-black/5 flex items-center justify-center mb-6">
              <Wallet size={40} className="text-dark-muted" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">Caixa Fechado</h2>
            <p className="text-dark-secondary mb-8 max-w-sm">Abra o caixa informando o fundo de reserva para começar a vender.</p>
            <button 
              onClick={() => setShowCaixaModal('abrir')}
              className="px-10 py-5 rounded-2xl bg-blue-gradient text-white font-black uppercase tracking-widest shadow-brand hover:scale-105 active:scale-95 transition-all"
            >
              Iniciar Turno agora
            </button>
          </div>
        )}

        <div className={cn(
          "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar transition-all",
          !caixaAberto && "opacity-20 pointer-events-none grayscale blur-[2px]"
        )}>
          {produtosFiltrados.map(p => (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => adicionarAoCarrinho(p)}
              className="glass-card group p-4 rounded-3xl flex flex-col items-center text-center relative overflow-hidden neon-gold"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-gradient/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <div className="text-brand-blue font-bold text-lg">?</div>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1 line-clamp-1">{p.nome}</h3>
              <p className="text-xs text-dark-secondary mb-3">{p.categoria}</p>
              <div className="text-brand-blue font-extrabold">
                {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-green-500/10 text-[10px] font-bold text-green-400 border border-green-500/20">
                {p.estoque} un
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="glass-card rounded-[2.5rem] flex flex-col h-full overflow-hidden shadow-glass neon-gold">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-brand-purple" />
              <h2 className="font-bold text-foreground">Carrinho</h2>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg bg-black/5 text-dark-secondary">
              {carrinho.length} itens
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {carrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                <ShoppingCart size={48} className="mb-4" />
                <p className="text-sm font-medium">Seu carrinho está vazio</p>
              </div>
            ) : (
              carrinho.map(item => (
                <div key={item.produto.id} className="bg-black/5 rounded-2xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate">{item.produto.nome}</h4>
                    <p className="text-xs text-dark-secondary">
                      {item.produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-black/10 rounded-xl p-1">
                    <button onClick={() => alterarQtd(item.produto.id, -1)} className="p-1 hover:text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{item.qtd}</span>
                    <button onClick={() => alterarQtd(item.produto.id, 1)} className="p-1 hover:text-white transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removerDoCarrinho(item.produto.id)} className="text-red-400/50 hover:text-red-400 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-black/5 border-t border-black/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-dark-secondary font-medium">Total</span>
              <span className="text-2xl font-black text-foreground">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            
            <button 
              disabled={carrinho.length === 0 || !caixaAberto}
              onClick={() => setShowCheckout(true)}
              className={cn(
                "w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3",
                carrinho.length > 0 && caixaAberto
                  ? "bg-blue-gradient shadow-brand hover:scale-[1.02] active:scale-[0.98] cursor-pointer" 
                  : "bg-black/10 text-black/20 cursor-not-allowed"
              )}
            >
              FINALIZAR VENDA
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-black/5 rounded-[3rem] p-8 md:p-10 shadow-2xl neon-gold"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Pagamento</h2>
                  <p className="text-sm text-dark-secondary">Adicione uma ou mais formas de pagamento</p>
                </div>
                <button onClick={() => setShowCheckout(false)} className="p-2 text-dark-muted hover:text-foreground">
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'pix', icon: QrCode, label: 'PIX' },
                      { id: 'dinheiro', icon: Banknote, label: 'Dinheiro' },
                      { id: 'debito', icon: CreditCard, label: 'Débito' },
                      { id: 'credito', icon: CreditCard, label: 'Crédito' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setMetodoSelecionado(m.id);
                          setValorParcial(restante.toFixed(2).replace('.', ','));
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                          metodoSelecionado === m.id 
                            ? "border-transparent bg-blue-gradient text-white shadow-brand scale-[1.02]" 
                            : "bg-black/5 border-transparent text-dark-secondary hover:bg-black/10"
                        )}
                      >
                        <m.icon size={24} className={metodoSelecionado === m.id ? "text-white" : ""} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-[10px] font-bold text-dark-secondary uppercase tracking-widest">Valor a Adicionar</label>
                      <button 
                        onClick={() => setValorParcial(restante.toFixed(2).replace('.', ','))}
                        className="text-[10px] font-black text-brand-blue bg-brand-blue/5 px-3 py-1 rounded-lg uppercase tracking-tighter hover:bg-blue-gradient hover:text-white transition-all shadow-sm"
                      >
                        Inserir Restante
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={valorParcial}
                          onChange={e => setValorParcial(e.target.value)}
                          placeholder="0,00"
                          className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-4 text-2xl font-black text-foreground focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all placeholder:opacity-20"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={adicionarPagamento}
                        disabled={!metodoSelecionado || !valorParcial || parseFloat(valorParcial.replace(',', '.')) <= 0}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                          metodoSelecionado && valorParcial && parseFloat(valorParcial.replace(',', '.')) > 0
                            ? "bg-blue-gradient text-white shadow-brand hover:scale-105 active:scale-95" 
                            : "bg-black/5 text-dark-muted cursor-not-allowed opacity-50"
                        )}
                      >
                        <Plus size={28} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar mb-6 bg-black/5 rounded-3xl p-4 border border-dashed border-black/10">
                    {pagamentos.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white shadow-sm border border-black/5 mb-2">
                        <span className="text-[10px] font-black uppercase">{p.metodo}</span>
                        <span className="font-bold">{p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <button onClick={() => removerPagamento(p.id)}><X size={14} /></button>
                      </div>
                    ))}
                  </div>

                  {troco > 0 && (
                    <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 mb-4 flex justify-between">
                      <span className="font-bold">Troco</span>
                      <span className="font-black">{troco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}

                  <button
                    disabled={totalPago < total}
                    onClick={() => {
                      alert('Venda finalizada!');
                      setCarrinho([]);
                      setPagamentos([]);
                      setShowCheckout(false);
                    }}
                    className="w-full py-5 rounded-2xl bg-blue-gradient text-white font-black uppercase tracking-widest shadow-brand"
                  >
                    FINALIZAR VENDA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCaixaModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCaixaModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative z-[120] flex flex-col"
            >
              <div className="p-8 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    showCaixaModal === 'abrir' ? "bg-green-500 text-white" : 
                    showCaixaModal === 'fechar' ? "bg-black text-white" :
                    showCaixaModal === 'suprimento' ? "bg-brand-blue text-white" : "bg-red-500 text-white"
                  )}>
                    {showCaixaModal === 'abrir' ? <Wallet size={24} /> : 
                     showCaixaModal === 'fechar' ? <Lock size={24} /> :
                     showCaixaModal === 'suprimento' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">
                      {showCaixaModal === 'abrir' ? 'Abertura de Caixa' : 
                       showCaixaModal === 'fechar' ? 'Fechamento de Caixa' :
                       showCaixaModal === 'suprimento' ? 'Suprimento de Caixa' : 'Sangria de Caixa'}
                    </h2>
                    <p className="text-[10px] font-bold text-dark-secondary uppercase tracking-widest">Controle de Fluxo Interno</p>
                  </div>
                </div>
                <button onClick={() => setShowCaixaModal(null)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {(showCaixaModal === 'abrir' || showCaixaModal === 'suprimento' || showCaixaModal === 'sangria') && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-dark-secondary uppercase tracking-widest mb-2 block">
                        {showCaixaModal === 'abrir' ? 'Fundo de Reserva (Troco)' : 'Valor da Operação'}
                      </label>
                      <input
                        type="text"
                        value={showCaixaModal === 'abrir' ? fundoReserva : valorCaixaOp}
                        onChange={e => showCaixaModal === 'abrir' ? setFundoReserva(e.target.value) : setValorCaixaOp(e.target.value)}
                        placeholder="R$ 0,00"
                        className="w-full bg-black/5 border border-black/10 rounded-2xl py-5 px-6 text-3xl font-black text-foreground focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
                      />
                    </div>
                    
                    {showCaixaModal !== 'abrir' && (
                      <div>
                        <label className="text-[10px] font-bold text-dark-secondary uppercase tracking-widest mb-2 block">Justificativa / Observação</label>
                        <textarea
                          value={justificativaCaixa}
                          onChange={e => setJustificativaCaixa(e.target.value)}
                          placeholder="Descreva o motivo desta movimentação..."
                          className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-4 h-24 text-sm font-medium focus:outline-none transition-all resize-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {showCaixaModal === 'fechar' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-[2rem] bg-black/5 border border-black/5 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-dark-secondary font-bold uppercase tracking-widest text-[10px]">Total de Vendas</span>
                        <span className="font-black text-foreground text-lg">R$ 1.284,50</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-dark-secondary font-bold uppercase tracking-widest text-[10px]">Fundo Inicial</span>
                        <span className="font-bold text-foreground">R$ 100,00</span>
                      </div>
                      <div className="h-px bg-black/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black uppercase text-foreground">Saldo em Caixa</span>
                        <span className="text-2xl font-black text-brand-blue">R$ 1.384,50</span>
                      </div>
                    </div>
                    <p className="text-center text-[10px] text-dark-secondary font-bold uppercase px-8">Confirme se todos os valores físicos batem com o relatório do sistema antes de encerrar.</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (showCaixaModal === 'abrir') abrirCaixa();
                    else if (showCaixaModal === 'fechar') fecharCaixa();
                    else operacaoCaixa(showCaixaModal as any);
                  }}
                  className={cn(
                    "w-full py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-sm shadow-lg transition-all active:scale-95",
                    showCaixaModal === 'sangria' ? 'bg-red-500' : 'bg-blue-gradient'
                  )}
                >
                  {showCaixaModal === 'abrir' ? 'ABRIR CAIXA AGORA' : 
                   showCaixaModal === 'fechar' ? 'CONFIRMAR FECHAMENTO' : 'EFETUAR LANÇAMENTO'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {caixaAberto && (
        <div className="fixed right-6 bottom-32 z-40">
          <button 
            onClick={() => {}}
            className="w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-brand-blue hover:scale-110 active:scale-90 transition-all border border-black/5"
          >
            <History size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function Lock(props: any) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
