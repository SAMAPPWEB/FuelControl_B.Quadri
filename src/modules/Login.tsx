import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginProps {
  onLogin: (email: string, senha: string) => Promise<{ success: boolean; error?: string; waitTime?: number }>;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (waitTime > 0) {
      const timer = setInterval(() => setWaitTime(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [waitTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (waitTime > 0) return;
    setLoading(true);
    setError('');
    
    try {
      const result = await onLogin(email, senha);
      if (!result.success) {
        setError(result.error || 'Credenciais inválidas');
        if (result.waitTime) setWaitTime(result.waitTime);
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden noise-bg font-outfit">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-brand-blue/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-brand-purple/20 rounded-full blur-[100px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-20 h-20 bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] p-4 rounded-3xl shadow-[0_0_10px_rgba(191,149,63,0.15)] mb-6 flex items-center justify-center"
          >
            <ShieldCheck size={40} className="text-black" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            SAMAPP <span className="text-gradient-gold">WEB</span>
          </h1>
          <p className="text-dark-secondary font-medium uppercase tracking-[0.3em] text-[10px] opacity-70">
            Plataforma de Automação SaaS
          </p>
        </div>

        {/* Login Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'bg-black rounded-[3rem] p-8 md:p-12 shadow-gold relative overflow-hidden',
            shake && 'animate-shake'
          )}
        >
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-7" autoComplete="off">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-dark-secondary ml-1">
                E-mail ou Usuário
              </label>
                  <div className="relative group">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-brand-blue transition-colors" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ex: samar.santos"
                  className="w-full bg-white/[0.08] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[15px] text-white placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue/50 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-dark-secondary ml-1">
                Senha de Acesso
              </label>
                  <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted group-focus-within:text-brand-purple transition-colors" />
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.08] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-[15px] text-white placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple/50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white transition-colors"
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertTriangle size={18} className="shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || waitTime > 0}
              className="w-full bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] text-black font-black text-sm uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_10px_rgba(191,149,63,0.1)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : waitTime > 0 ? (
                `Aguarde ${waitTime}s`
              ) : (
                'Entrar no Sistema'
              )}
            </button>

            <div className="text-center pt-2">
              <button type="button" className="text-xs text-dark-secondary hover:text-white transition-colors font-medium">
                Esqueceu sua senha? <span className="text-white underline underline-offset-4 opacity-70 hover:opacity-100 transition-opacity">Recuperar acesso</span>
              </button>
            </div>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-[11px] text-dark-muted uppercase tracking-[0.2em] font-bold"
        >
          Brasil Quadri &copy; 2026 — Todos os direitos reservados
        </motion.p>
      </motion.div>
    </div>
  );
}

