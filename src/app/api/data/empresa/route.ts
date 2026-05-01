import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  if (!supabase) {
    return NextResponse.json({
      success: true,
      empresa: {
        id: 'demo-01',
        nome: 'Brasil Quadri - Demonstração',
        cnpj: '00.000.000/0001-00',
        telefone: '11999999999',
        email: 'contato@brasilquadri.com',
        endereco: 'Rua das Trilhas, 123'
      }
    });
  }
  const { data, error } = await supabase.from('empresa').select('*').single();
  if (error && error.code !== 'PGRST116') return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, empresa: data });
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Modo demonstração: Simulação de salvamento' });
    }

    const body = await request.json();
    const { id, ...empresaData } = body;
    let targetId = id;
    
    // Se não temos ID, tentamos buscar o registro existente para atualizar
    if (!targetId) {
      const { data: existing } = await supabase.from('empresa').select('id').maybeSingle();
      if (existing) targetId = existing.id;
    }

    // Se ainda não temos ID e a tabela está vazia, deixamos o Supabase gerar um (ou usamos um padrão se necessário)
    const payload = targetId ? { id: targetId, ...empresaData } : empresaData;

    const { error } = await supabase.from('empresa').upsert(payload);
    
    if (error) {
      console.error('Supabase Upsert Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('POST Empresa Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
