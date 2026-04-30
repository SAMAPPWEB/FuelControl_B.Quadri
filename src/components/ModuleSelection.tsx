import { motion } from 'framer-motion';
import { ShoppingCart, Fuel, ArrowRight } from 'lucide-react';
import type { ModuleId } from '@/types';

interface ModuleSelectionProps {
  availableModules: ModuleId[];
  onSelect: (module: ModuleId) => void;
}

export default function ModuleSelection({ availableModules, onSelect }: ModuleSelectionProps) {
  const modules = [
    {
      id: 'loja' as ModuleId,
      name: 'Módulo Loja',
      description: 'PDV, Estoque e Gestão de Vendas',
      icon: ShoppingCart,
      color: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      id: 'abastecimento' as ModuleId,
      name: 'Módulo Abastecimento',
      description: 'Controle de Combustível e Veículos',
      icon: Fuel,
      color: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20'
    }
  ].filter(m => availableModules.includes(m.id));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 noise-bg">
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block p-3 rounded-2xl bg-brand-gradient shadow-brand mb-6"
          >
            <img src="/logo.jpeg" alt="SAMAPP" className="w-16 h-16 rounded-xl object-contain bg-white/10" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-foreground mb-2"
          >
            Bem-vindo ao <span className="text-gradient-gold">SAMAPP WEB</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-dark-secondary"
          >
            Selecione o módulo que deseja acessar agora
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m, idx) => (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              onClick={() => onSelect(m.id)}
              className="glass-card group p-8 rounded-3xl text-left relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] neon-gold"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${m.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-6 shadow-lg ${m.shadow} group-hover:scale-110 transition-transform`}>
                <m.icon size={32} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-brand-blue transition-colors">
                {m.name}
              </h3>
              <p className="text-sm text-dark-secondary mb-8">
                {m.description}
              </p>

              <div className="flex items-center gap-2 text-brand-blue font-semibold text-sm">
                Acessar agora
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-xs text-dark-muted uppercase tracking-widest font-medium">
            SAMAPP WEB — Plataforma SaaS Multi-Módulo
          </p>
        </motion.div>
      </div>
    </div>
  );
}
