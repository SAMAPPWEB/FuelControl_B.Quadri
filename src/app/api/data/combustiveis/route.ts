import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });

    const updateData: any = {};
    if (body.precoCusto !== undefined) updateData.preco_custo = parseFloat(body.precoCusto);
    if (body.precoVenda !== undefined) updateData.preco_venda = parseFloat(body.precoVenda);
    if (body.estoqueLitros !== undefined) updateData.estoque_litros = parseFloat(body.estoqueLitros);
    if (body.limiteMinimo !== undefined) updateData.limite_minimo = parseFloat(body.limiteMinimo);
    if (body.alertaAbaixoDe !== undefined) updateData.alerta_abaixo_de = parseFloat(body.alertaAbaixoDe);

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
