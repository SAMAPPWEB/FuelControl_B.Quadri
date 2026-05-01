import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ success: true, historico: [] });
    
    const { data, error } = await supabase
      .from('historico_entradas')
      .select('*')
      .order('data', { ascending: false });
      
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, historico: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!supabase) return NextResponse.json({ success: true });
    
    const body = await request.json();
    const { action, ...data } = body;
    
    if (action === 'delete') {
      const { error } = await supabase.from('historico_entradas').delete().eq('id', data.id);
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } else {
      const { error } = await supabase.from('historico_entradas').upsert(data);
      if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
