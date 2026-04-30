import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tipoCombustivelId, litros, precoLitro, valorTotal, placaVeiculo, frentistaId, frentistaNome, tipoCombustivelNome } = body;

    // 1. Inserir o registro de abastecimento
    const { data: newAbastecimento, error: insertError } = await supabase
      .from('abastecimentos')
      .insert([{
        tipo_combustivel_id: tipoCombustivelId,
        tipo_combustivel_nome: tipoCombustivelNome,
        litros: parseFloat(litros),
        preco_litro: parseFloat(precoLitro),
        valor_total: parseFloat(valorTotal),
        placa_veiculo: placaVeiculo,
        frentista_id: frentistaId,
        frentista_nome: frentistaNome
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // 2. Buscar estoque atual do combustível
    const { data: fuel } = await supabase
      .from('combustiveis')
      .select('estoque_litros')
      .eq('id', tipoCombustivelId)
      .single();

    if (fuel) {
      const novoEstoque = parseFloat(fuel.estoque_litros) - parseFloat(litros);
      
      // 3. Atualizar o estoque
      await supabase
        .from('combustiveis')
        .update({ estoque_litros: novoEstoque })
        .eq('id', tipoCombustivelId);
    }

    return NextResponse.json({ success: true, ...newAbastecimento });

  } catch (error: any) {
    console.error('Erro ao salvar abastecimento:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
