# ⛽ FuelControl B.Quadri - Gestão Inteligente de Combustíveis

Sistema de gestão executivo para postos de combustível e lojas de conveniência, desenvolvido com foco em performance, segurança e experiência do usuário (UX) premium.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Estilização**: Tailwind CSS + Framer Motion (Animações)
- **Componentes**: Radix UI + Shadcn/UI
- **Backend/Banco de Dados**: Supabase (PostgreSQL)
- **Segurança**: Criptografia ponta a ponta com CryptoJS
- **Deploy**: Vercel

## ✨ Funcionalidades Principais

- **Dashboard Executivo**: Visão geral de vendas, lucros e estoque em tempo real.
- **Controle de Estoque**: Monitoramento inteligente de tanques de combustível e produtos.
- **Gestão de Equipe**: Controle de permissões (Master, Admin, Operador) com perfis personalizados.
- **Histórico de Vendas**: Registro detalhado de abastecimentos e transações.
- **Alertas Automáticos**: Notificações de estoque baixo e emergências.
- **Design Responsivo**: Totalmente otimizado para dispositivos móveis e desktop.

## 🛠️ Configuração para Desenvolvimento

1. **Clonar o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/fuel-control.git
   ```

2. **Instalar dependências**:
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**:
   Crie um arquivo `.env.local` na raiz e adicione suas chaves do Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

4. **Rodar em modo dev**:
   ```bash
   npm run dev
   ```

## 📦 Deploy na Vercel

O projeto está pronto para ser implantado na Vercel. Ao conectar seu repositório do GitHub, certifique-se de adicionar as variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`) nas configurações de projeto da Vercel.

---
Desenvolvido por **Samapp Automações**
