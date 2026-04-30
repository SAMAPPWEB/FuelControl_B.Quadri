import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    // 1. Caso Especial: Usuário Master Hardcoded (para emergência/primeiro acesso)
    const loginInput = email?.toLowerCase().trim();
    if ((loginInput === 'samar santos' || loginInput === 'samar') && senha === 'Master123') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'master-01',
          nome: 'Samar Santos',
          apelido: 'Samar',
          perfil: 'master',
          funcao: 'Proprietário',
          modulos: ['loja', 'abastecimento'],
          avatar: 'masculino'
        }
      });
    }

    // 2. Busca no Supabase (Nome, Apelido ou WhatsApp)
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Banco de dados não configurado. Use o acesso Master.' }, { status: 503 });
    }

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .or(`nome.eq."${email}",apelido.eq."${email}",whatsapp.eq."${email}"`)
      .single();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Senha ou usuário errado. Tente novamente ou contate o Admin.' }, { status: 401 });
    }

    // 3. Verificação de Senha (Para produção usar bcrypt.compare)
    if (user.senha_hash === senha) {
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          nome: user.nome,
          apelido: user.apelido,
          perfil: user.perfil,
          funcao: user.funcao,
          modulos: user.modulos || ['abastecimento']
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Senha ou usuário errado. Tente novamente ou contate o Admin.' }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno no servidor' }, { status: 500 });
  }
}
