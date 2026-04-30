import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel, Truck, ArrowLeft, Check, Calculator,
  Droplet, DollarSign, Car, User, AlertTriangle, ArrowRight, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';

export default function Abastecimento() {
  const { combustiveis = [], createAbastecimento, refresh } = useData();
  const { usuario } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedComb, setSelectedComb] = useState<string | null>(null);
  const [litros, setLitros] = useState('');
  const [placa, setPlaca] = useState('');
  const [obs, setObs] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const comb = combustiveis.find(c => c.id === selectedComb);
  const valorEstimado = comb ? (parseFloat(litros.replace(',', '.')) || 0) * comb.precoVenda : 0;
  const estoqueApos = comb ? comb.estoqueLitros - (parseFloat(litros.replace(',', '.')) || 0) : 0;

  const handleNext = () => {
    setError('');
    if (step === 1 && !selectedComb) {
      setError('Selecione um tipo de combustível');
      return;
    }
    if (step === 2 && (!litros || parseFloat(litros.replace(',', '.')) <= 0)) {
      setError('Informe uma quantidade válida');
      return;
    }
    if (step === 2 && comb && parseFloat(litros.replace(',', '.')) > comb.estoqueLitros) {
      setError('Quantidade maior que o estoque disponível');
      return;
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    if (!comb || !usuario) return;
    setLoading(true);
    setError('');
    
    try {
      const l = parseFloat(litros.replace(',', '.'));
      await createAbastecimento({
        tipoCombustivelId: comb.id,
        tipoCombustivelNome: comb.nome,
        litros: l,
        precoLitro: comb.precoVenda,
        valorTotal: l * comb.precoVenda,
        placaVeiculo: placa || undefined,
        observacao: obs || undefined,
        frentistaId: usuario.id,
        frentistaNome: usuario.apelido || usuario.nome,
      });
      
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false);
        setStep(1);
        setSelectedComb(null);
        setLitros('');
        setPlaca('');
        setObs('');
        refresh();
      }, 2500);
    } catch (err) {
      setError('Falha ao registrar abastecimento. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-outfit">
      {/* Header com Navegação */}
      <div className="flex items-center gap-4 mb-8">
        {step > 1 && !confirmed && (
          <button 
            onClick={handleBack} 
            className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <ArrowLeft size={20} className="text-brand-blue" />
          </button>
        )}
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Novo Abastecimento</h1>
          <p className="text-dark-secondary text-sm">Preencha os dados do registro</p>
        </div>
      </div>

      {/* Modern Stepper */}
      <div className="flex items-center gap-3 mb-10">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500',
              s < step ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 
              s === step ? 'bg-brand-gradient text-white shadow-brand' : 
              'bg-black/5 text-dark-muted border border-black/10'
            )}>
              {s < step ? <Check size={18} /> : s}
            </div>
            {s < 3 && (
              <div className="h-1 flex-1 bg-black/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: s < step ? '100%' : '0%' }}
                  className="h-full bg-brand-gradient" 
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold flex items-center gap-3"
        >
          <AlertTriangle size={18} className="shrink-0" />
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Seleção */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {combustiveis.map(c => {
                const isSelected = selectedComb === c.id;
                const Icon = c.nome.toLowerCase().includes('gasolina') ? Fuel : Truck;
                const colorClass = c.nome.toLowerCase().includes('gasolina') ? 'from-orange-500 to-red-600' : 'from-blue-500 to-brand-blue';
                
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedComb(c.id)}
                   className={cn(
                      'glass-card group p-8 rounded-[2rem] flex flex-col items-center text-center relative overflow-hidden transition-all neon-gold',
                      isSelected ? 'border-brand-blue ring-2 ring-brand-blue/30 scale-[1.02]' : 'hover:bg-black/5'
                    )}
                  >
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform",
                      colorClass
                    )}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1 uppercase tracking-tight">{c.nome}</h3>
                    <p className="text-brand-blue font-black text-lg">
                      R$ {c.precoVenda.toFixed(2)}/L
                    </p>
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-brand-blue">
                        <Check size={20} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={handleNext}
              disabled={!selectedComb}
              className="w-full bg-brand-gradient py-5 rounded-[1.5rem] text-white font-bold uppercase tracking-[0.2em] shadow-brand hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3"
            >
              Continuar
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Step 2: Dados */}
        {step === 2 && comb && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-[2.5rem] p-8 space-y-6 neon-gold">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-secondary mb-3 block ml-1">
                  Volume Abastecido (Litros)
                </label>
                <div className="relative group">
                  <Droplet className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-blue group-focus-within:scale-110 transition-transform" />
                  <input
                    type="number"
                    inputMode="decimal"
                    value={litros}
                    onChange={e => setLitros(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-black/5 border border-black/10 rounded-3xl py-6 px-14 text-3xl font-black text-foreground focus:outline-none focus:ring-4 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                    autoFocus
                  />
                </div>
                <div className="mt-4 flex items-center justify-between p-4 rounded-2xl bg-brand-blue/10 border border-brand-blue/20">
                  <div className="flex items-center gap-2 text-brand-blue font-bold text-sm">
                    <Calculator size={18} />
                    Valor Total:
                  </div>
                  <span className="text-brand-blue font-black text-xl">
                    R$ {valorEstimado.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-secondary mb-3 block ml-1">
                  Identificação do Veículo
                </label>
                <div className="relative">
                  <Car className="absolute left-5 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="text"
                    value={placa}
                    onChange={e => setPlaca(e.target.value.toUpperCase())}
                    placeholder="DIGITE A PLACA"
                    className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-12 text-sm font-bold text-foreground uppercase tracking-widest placeholder:text-dark-muted focus:outline-none focus:border-brand-blue/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-secondary mb-3 block ml-1">
                  Observações Extras
                </label>
                <textarea
                  value={obs}
                  onChange={e => setObs(e.target.value)}
                  placeholder="Ex: Cliente solicitou nota fiscal..."
                  rows={2}
                  className="w-full bg-black/5 border border-black/10 rounded-2xl py-4 px-6 text-sm text-foreground focus:outline-none focus:border-brand-blue/40 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-brand-gradient py-5 rounded-[1.5rem] text-white font-bold uppercase tracking-[0.2em] shadow-brand hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              Revisar Registro
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Step 3: Confirmação */}
        {step === 3 && comb && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {confirmed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card rounded-[3rem] p-12 flex flex-col items-center text-center neon-gold"
              >
                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                  <ShieldCheck size={48} className="text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-2">Sucesso!</h3>
                <p className="text-dark-secondary font-medium">Abastecimento registrado e sincronizado com sucesso.</p>
                
                <div className="mt-10 p-4 px-8 rounded-2xl bg-black/5 border border-black/10">
                  <p className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em]">Protocolo Digital</p>
                  <p className="text-sm font-mono text-foreground mt-1">SAM-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="glass-card rounded-[2.5rem] p-8 border-brand-purple/20 relative overflow-hidden neon-gold">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-3xl rounded-full" />
                  <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <Check size={20} className="text-brand-purple" />
                    Resumo do Registro
                  </h3>
                  
                  <div className="space-y-4">
                    <SummaryRow icon={Fuel} label="Combustível" value={comb.nome} />
                    <SummaryRow icon={Droplet} label="Volume" value={`${parseFloat(litros.replace(',', '.')).toFixed(2)} Litros`} />
                    <SummaryRow 
                      icon={DollarSign} 
                      label="Custo Total" 
                      value={`R$ ${valorEstimado.toFixed(2)}`} 
                      highlight={true}
                    />
                    <SummaryRow icon={Car} label="Veículo" value={placa || 'Não Informado'} />
                    <SummaryRow icon={User} label="Operador" value={usuario?.apelido || 'Usuário'} />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-6 border-red-500/10 neon-gold">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-dark-secondary mb-3">
                    <span>Impacto no Estoque</span>
                    <span className={cn(estoqueApos < comb.limiteMinimo ? "text-red-500" : "text-green-500")}>
                      {estoqueApos.toFixed(1)} L Restante
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ width: `${Math.max(0, (estoqueApos / 5000) * 100)}%` }}
                      className={cn("h-full", estoqueApos < comb.limiteMinimo ? "bg-red-500" : "bg-brand-blue")} 
                    />
                  </div>
                  {estoqueApos < comb.limiteMinimo && (
                    <p className="text-[10px] font-bold text-red-400 mt-3 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle size={12} />
                      ESTOQUE CRÍTICO APÓS ESTA AÇÃO!
                    </p>
                  )}
                </div>

                <button
                  disabled={loading}
                  onClick={handleConfirm}
                  className="w-full bg-brand-gradient py-5 rounded-[1.5rem] text-white font-bold uppercase tracking-[0.2em] shadow-brand hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Confirmar e Finalizar'}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value, highlight }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-black/5 last:border-0">
      <div className="flex items-center gap-3 text-dark-secondary">
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className={cn(
        "text-sm font-black",
        highlight ? "text-brand-blue text-lg" : "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
}

