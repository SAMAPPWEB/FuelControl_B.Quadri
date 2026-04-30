import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Abastecimento, Empresa } from '../types';

export class PdfService {
  private static async cropImageToCircle(url: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }
        
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }

  static async generateReport(abastecimentos: Abastecimento[], empresa: Empresa | null, periodo: string) {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Header Background
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo (Circular Container)
    let textXOffset = 15;
    if (empresa?.logoUrl) {
      try {
        const radius = 12; // Slightly larger
        const logoCirc = await this.cropImageToCircle(empresa.logoUrl);
        doc.addImage(logoCirc, 'PNG', 15, 10.5, radius * 2, radius * 2);
        textXOffset = 45; 
      } catch (e) {
        console.error('Error adding logo to PDF', e);
      }
    }

    // Company Name
    doc.setTextColor(212, 175, 55); // Gold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(empresa?.nomeFantasia || 'BRASIL QUADRI', textXOffset, 19);
    
    // Period (Top Right)
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Período: ${periodo.toUpperCase()}`, pageWidth - 15, 19, { align: 'right' });

    // Empresa Info
    if (empresa) {
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(8);
      
      const line1 = `${empresa.razaoSocial} | CNPJ: ${empresa.cnpj}`;
      const line2 = `Endereço: ${empresa.endereco || 'Não informado'}`;
      const line3 = `Contato: ${empresa.whatsapp || 'Não informado'} | PIX: ${empresa.pixKey || 'Não cadastrado'}`;
      
      doc.text(line1, textXOffset, 27);
      doc.text(line2, textXOffset, 31);
      doc.text(line3, textXOffset, 35);
    }

    // Report Title (Above Table)
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('RELATÓRIO DETALHADO DE ABASTECIMENTOS', 15, 54);

    // Table
    const tableData = abastecimentos.map(a => [
      a.createdAt ? new Date(a.createdAt).toLocaleString('pt-BR') : '-',
      a.tipoCombustivelNome || '-',
      `${Number(a.litros || 0).toFixed(2)} L`,
      `R$ ${Number(a.precoLitro || 0).toFixed(2)}`,
      `R$ ${Number(a.valorTotal || 0).toFixed(2)}`,
      a.placaVeiculo || '-',
      a.frentistaNome || '-'
    ]);

    autoTable(doc, {
      startY: 58,
      head: [['Data/Hora', 'Combustível', 'Volume', 'Preço Unit.', 'Subtotal', 'Placa', 'Frentista']],
      body: tableData,
      theme: 'striped',
      headStyles: { 
        fillColor: [212, 175, 55], 
        textColor: [10, 10, 10], 
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      },
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { top: 60 }
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY || 70;
    const totalLitros = abastecimentos.reduce((s, a) => s + Number(a.litros || 0), 0);
    const totalValor = abastecimentos.reduce((s, a) => s + Number(a.valorTotal || 0), 0);

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(15, finalY + 5, pageWidth - 15, finalY + 5);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de registros: ${abastecimentos.length}`, 15, finalY + 12);
    doc.text(`Volume Acumulado: ${Number(totalLitros).toFixed(2)} Litros`, 15, finalY + 17);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text(`VALOR TOTAL: R$ ${Number(totalValor).toFixed(2)}`, pageWidth - 15, finalY + 17, { align: 'right' });

    // Footer - One divider line and page data
    const pageCount = doc.internal.getNumberOfPages();
    
    // Formatar data: Quarta-feira, 29 de abril de 2026, às 17:01:10
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const dateStr = now.toLocaleDateString('pt-BR', dateOptions);
    const timeStr = now.toLocaleTimeString('pt-BR');
    const formattedDate = `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}, às ${timeStr}`;

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer Divider (Cinza Escuro)
      doc.setDrawColor(60, 60, 60);
      doc.setLineWidth(0.1);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      
      // Left: Full Date with Time
      doc.text(formattedDate, 15, pageHeight - 10);
      
      // Right: Page count
      doc.text(`Página ${i}/${pageCount}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }

    doc.save(`Relatorio_${periodo}_${new Date().toISOString().split('T')[0]}.pdf`);
  }
}
