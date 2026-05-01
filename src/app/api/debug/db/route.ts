import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    if (!supabase) return NextResponse.json({ error: 'Supabase não configurado' });

    // 1. Verificar colunas da tabela empresa (via query de sistema)
    const { data: columns, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'empresa' });
    
    // 2. Verificar dados atuais
    const { data: content, error: contError } = await supabase.from('empresa').select('*');

    return NextResponse.json({
      success: true,
      columns: columns || 'RPC get_table_columns não disponível',
      content: content,
      errors: { colError, contError }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
