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
  const body = await request.json();
  let targetId = id;
  
  // Se não temos ID, tentamos buscar o registro existente para atualizar
  if (!targetId) {
    const { data: existing } = await supabase.from('empresa').select('id').single();
    if (existing) targetId = existing.id;
  }

  const { error } = await supabase.from('empresa').upsert({ 
    ...(targetId ? { id: targetId } : {}), 
    ...empresaData 
  });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
