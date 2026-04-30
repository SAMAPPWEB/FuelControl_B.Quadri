import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });

    const updateData = {
      preco_custo: parseFloat(body.precoCusto || 0),
      preco_venda: parseFloat(body.precoVenda || 0),
      estoque_litros: parseFloat(body.estoqueLitros || 0),
      limite_minimo: parseFloat(body.limiteMinimo || 0),
      alerta_abaixo_de: parseFloat(body.alertaAbaixoDe || 0)
    };

    const { error } = await supabase
      .from('combustiveis')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
