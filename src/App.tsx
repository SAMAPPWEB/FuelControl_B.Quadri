import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Layout, type AppScreen } from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Abastecimento from '@/pages/Abastecimento';
import Relatorios from '@/pages/Relatorios';
import Configuracoes from '@/pages/Configuracoes';
import ModuleSelection from '@/components/ModuleSelection';
import PDV from './pages/Loja/PDV';
import Estoque from './pages/Loja/Estoque';
import DashboardLoja from './pages/Loja/DashboardLoja';
import type { ModuleId } from '@/types';

function App() {
  const { usuario, isAuthenticated, loading, login, logout } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null);
  const [activeScreen, setActiveScreen] = useState<AppScreen>('dashboard');
  const [mounted, setMounted] = useState(false);
  
  // Estado Global do Caixa
  const [caixaAberto, setCaixaAberto] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Efeito para seleção automática de módulo se houver apenas um
  useEffect(() => {
    if (isAuthenticated && usuario && !activeModule) {
      if (usuario.modulos?.length === 1) {
        setActiveModule(usuario.modulos[0]);
      }
    }
  }, [isAuthenticated, usuario, activeModule]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center noise-bg">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-full border-2 border-brand-blue border-t-transparent shadow-brand" 
          />
          <p className="text-sm font-medium text-foreground uppercase tracking-[0.2em] animate-pulse">
            Carregando SAMAPP...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // Se o usuário tem mais de um módulo e ainda não escolheu nenhum
  if (!activeModule && usuario?.modulos && usuario.modulos.length > 1) {
    return (
      <ModuleSelection 
        availableModules={usuario.modulos} 
        onSelect={(mod) => setActiveModule(mod)} 
      />
    );
  }

  const renderScreen = () => {
    // Módulo Loja
    if (activeModule === 'loja') {
      switch (activeScreen) {
        case 'home':
        case 'dashboard': return <DashboardLoja onScreenChange={setActiveScreen} caixaAberto={caixaAberto} />;
        case 'pdv': return <PDV caixaAberto={caixaAberto} setCaixaAberto={setCaixaAberto} />;
        case 'estoque': return <Estoque />;
        case 'configuracoes': return <Configuracoes />;
        default: return <DashboardLoja onScreenChange={setActiveScreen} caixaAberto={caixaAberto} />;
      }
    }

    // Módulo Abastecimento
    switch (activeScreen) {
      case 'home':
      case 'dashboard': return <Dashboard onScreenChange={setActiveScreen} />;
      case 'abastecimento': return <Abastecimento />;
      case 'relatorios': return <Relatorios />;
      case 'configuracoes': return <Configuracoes />;
      default: return <Dashboard onScreenChange={setActiveScreen} />;
    }
  };

  return (
    <Layout 
      activeModule={activeModule}
      activeScreen={activeScreen} 
      onScreenChange={setActiveScreen} 
      usuario={usuario}
      onLogout={() => {
        setActiveModule(null);
        logout();
      }}
      onChangeModule={() => setActiveModule(null)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeModule}-${activeScreen}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="min-h-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
