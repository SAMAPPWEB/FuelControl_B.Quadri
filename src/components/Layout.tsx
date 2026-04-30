import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Fuel, FileText, Settings, User, 
  ShoppingCart, Package, Home, LogOut, RefreshCcw, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleId, Usuario } from '@/types';

export type AppScreen = 'dashboard' | 'abastecimento' | 'pdv' | 'estoque' | 'relatorios' | 'configuracoes' | 'perfil' | 'home';

interface NavItem {
  key: AppScreen;
  label: string;
  icon: React.ElementType;
}

const LOJA_NAV: NavItem[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'pdv', label: 'PDV', icon: ShoppingCart },
  { key: 'estoque', label: 'Estoque', icon: Package },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const ABASTECIMENTO_NAV: NavItem[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'abastecimento', label: 'Abastecer', icon: Fuel },
  { key: 'relatorios', label: 'Relatórios', icon: FileText },
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Layout({
  activeModule,
  activeScreen,
  onScreenChange,
  children,
  usuario,
  onLogout,
  onChangeModule
}: {
  activeModule: ModuleId | null;
  activeScreen: AppScreen;
  onScreenChange: (s: AppScreen) => void;
  children: React.ReactNode;
  usuario: Usuario | null;
  onLogout: () => void;
  onChangeModule: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = activeModule === 'loja' ? LOJA_NAV : ABASTECIMENTO_NAV;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-outfit noise-bg">
      {/* Header Mobile / Top Bar Desktop */}
      <header className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-xl border-b border-black/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-gradient flex items-center justify-center shadow-brand">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            SAMAPP <span className="text-brand-blue">{activeModule === 'loja' ? 'LOJA' : 'FUEL'}</span>
          </span>
        </div>
        
        <button 
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center hover:bg-black/10 transition-colors"
        >
          <User size={20} className="text-dark-secondary" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Modern Bottom Nav (Mobile-First) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
        <div className="glass-card rounded-[2rem] p-2 flex items-center justify-around shadow-glass neon-gold">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeScreen === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onScreenChange(item.key)}
                className={cn(
                  "relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-300 tap-highlight-transparent",
                  isActive ? "text-white" : "text-dark-muted hover:text-dark-secondary"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-gradient rounded-2xl shadow-brand"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={22} className="relative z-10" />
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider mt-1 relative z-10",
                  isActive ? "opacity-100" : "opacity-0 scale-75"
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center w-16 h-14 rounded-2xl text-dark-muted hover:text-dark-secondary transition-all"
          >
            <User size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-0 scale-75">Perfil</span>
          </button>
        </div>
      </nav>

      {/* Right Drawer (Profile/More) */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white border-l border-black/5 z-[70] p-8 overflow-y-auto shadow-2xl"
            >
              <div className="flex flex-col items-center gap-4 mb-10">
                <div className="w-24 h-24 rounded-3xl bg-blue-gradient p-1 shadow-brand relative">
                  <div className="w-full h-full bg-white rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                    <User size={40} className="text-dark-muted" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-green-500 border-4 border-white shadow-lg animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground">{usuario?.nome || 'Usuário'}</h3>
                  <p className="text-sm text-dark-secondary uppercase tracking-widest font-semibold opacity-60">
                    {usuario?.funcao || 'Membro'}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-dark-muted uppercase tracking-[0.2em] mb-4">Gerenciamento</p>
                
                <MenuButton 
                  icon={Settings} 
                  label="Configurações" 
                  onClick={() => { onScreenChange('configuracoes'); setMenuOpen(false); }} 
                />

                {usuario?.modulos && usuario.modulos.length > 1 && (
                  <MenuButton 
                    icon={RefreshCcw} 
                    label="Trocar Módulo" 
                    color="text-brand-blue"
                    onClick={() => { onChangeModule(); setMenuOpen(false); }} 
                  />
                )}

                <div className="h-px bg-black/5 my-6" />
                
                <MenuButton 
                  icon={LogOut} 
                  label="Sair do Sistema" 
                  color="text-red-400"
                  onClick={() => { onLogout(); setMenuOpen(false); }} 
                />
              </div>

              <div className="mt-20 p-6 rounded-3xl glass-card bg-blue-gradient/5 border-brand-blue/10">
                <p className="text-xs font-bold text-brand-blue uppercase tracking-widest mb-1">Plano Premium</p>
                <p className="text-[10px] text-dark-secondary leading-relaxed">
                  Acesso total liberado para todos os módulos e suporte prioritário.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, color = "text-dark-secondary" }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-black/5 border border-black/5 hover:bg-black/10 hover:border-black/10 transition-all group"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={color} />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight size={16} className="text-dark-muted group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
