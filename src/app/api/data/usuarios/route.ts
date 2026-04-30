import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Listar Usuários
export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: true,
      usuarios: [
        { 
          id: 'master-01', 
          nome: 'Samar Santos', 
          apelido: 'Samar', 
          perfil: 'master', 
          funcao: 'Proprietário', 
          whatsapp: '11999999999', 
          avatar: 'masculino',
          modulos: ['loja', 'abastecimento'],
          status: 'ativo'
        },
        { 
          id: '2', 
          nome: 'Maria Oliveira', 
          apelido: 'Maria', 
          perfil: 'atendimento', 
          funcao: 'Frentista', 
          whatsapp: '11888888888', 
          avatar: 'feminino',
          modulos: ['abastecimento'],
          status: 'ativo'
        }
      ]
    });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, usuarios: data });
}

// Criar/Atualizar Usuário
export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ success: true, message: 'Modo demonstração: usuário não salvo.' });
  }
  const body = await request.json();
  const { id, ...userData } = body;

  console.log('Tentando salvar usuário:', { id, userData });

  try {
    if (id) {
      // Tentar converter ID para número se for puramente numérico (para compatibilidade com int8)
      const targetId = !isNaN(Number(id)) && typeof id === 'string' && id.trim() !== '' ? Number(id) : id;
      
      const { error } = await supabase.from('usuarios').update(userData).eq('id', targetId);
      if (error) {
        console.error('Erro no Update do Supabase:', error);
        throw error;
      }
    } else {
      const { error } = await supabase.from('usuarios').insert([userData]);
      if (error) {
        console.error('Erro no Insert do Supabase:', error);
        throw error;
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Deletar Usuário
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });

  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
