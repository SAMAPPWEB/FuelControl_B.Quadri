export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: true,
        empresa: { id: '1', razao_social: 'Brasil Quadri - Demo', cnpj: '00.000.000/0001-00' }
      });
    }
    // Buscamos o primeiro registro, independente do ID
    const { data, error } = await supabase.from('empresa').select('*').limit(1).maybeSingle();
    
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, empresa: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'Simulação' });
    }

    const body = await request.json();
    const { id, ...empresaData } = body;
    
    // Primeiro, tentamos descobrir se já existe QUALQUER registro
    const { data: existing } = await supabase.from('empresa').select('id').limit(1).maybeSingle();
    
    const targetId = existing?.id || id || '1';

    const { error } = await supabase.from('empresa').upsert({ 
      id: targetId,
      ...empresaData 
    });
    
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
