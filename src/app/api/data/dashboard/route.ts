import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Se o Supabase não estiver configurado, retorna dados de exemplo para o sistema não quebrar
    if (!supabase) {
      return NextResponse.json({
        success: true,
        empresa: { nome: 'Brasil Quadri - Demonstração', cnpj: '00.000.000/0001-00' },
        combustiveis: [
          { id: 1, nome: 'Gasolina', estoque_atual: 500, capacidade: 1000, preco_custo: 5.5, preco_venda: 6.2 },
          { id: 2, nome: 'Diesel', estoque_atual: 800, capacidade: 2000, preco_custo: 4.8, preco_venda: 5.5 }
        ],
        abastecimentos: [],
        alertas: []
      });
    }

    // 1. Buscar Dados da Empresa
    const { data: empresa } = await supabase
      .from('empresa')
      .select('*')
      .single();

    // 2. Buscar Combustíveis
    const { data: combustiveis } = await supabase
      .from('combustiveis')
      .select('*')
      .order('principal', { ascending: false });

    // 3. Buscar Últimos Abastecimentos (limitado a 50)
    const { data: abastecimentos } = await supabase
      .from('abastecimentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    // 4. Buscar Alertas não lidos
    const { data: alertas } = await supabase
      .from('alertas')
      .select('*')
      .eq('lido', false)
      .order('data', { ascending: false });

    return NextResponse.json({
      success: true,
      empresa: empresa || null,
      combustiveis: combustiveis || [],
      abastecimentos: abastecimentos || [],
      alertas: alertas || []
    });

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar dados do dashboard' }, { status: 500 });
  }
}
