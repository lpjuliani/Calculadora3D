import React from 'react';
import jsPDF from 'jspdf';
import { useApp } from '../context/AppContext';

interface PDFData {
  cliente: string;
  produto: string;
  categoria: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
  frete: number;
  desconto: number;
  observacoes: string;
}

interface PDFGeneratorProps {
  data: PDFData;
  onGenerate?: () => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data, onGenerate }) => {
  const { state } = useApp();
  const { companySettings } = state;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Cores
    const primaryColor = [59, 130, 246]; // Azul
    const secondaryColor = [249, 115, 22]; // Laranja
    const grayColor = [107, 114, 128];
    const darkColor = [17, 24, 39];

    let yPosition = 20;

    // Header com logo e dados da empresa
    if (companySettings.logo) {
      try {
        doc.addImage(companySettings.logo, 'JPEG', 20, yPosition, 40, 25);
      } catch (error) {
        console.warn('Erro ao adicionar logo:', error);
      }
    }

    // Dados da empresa (lado direito)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(companySettings.nomeFantasia || 'Sua Empresa', pageWidth - 20, yPosition + 8, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    
    if (companySettings.razaoSocial) {
      yPosition += 12;
      doc.text(companySettings.razaoSocial, pageWidth - 20, yPosition, { align: 'right' });
    }
    
    if (companySettings.cnpj) {
      yPosition += 8;
      doc.text(`CNPJ: ${companySettings.cnpj}`, pageWidth - 20, yPosition, { align: 'right' });
    }
    
    if (companySettings.endereco) {
      yPosition += 8;
      const enderecoLines = doc.splitTextToSize(companySettings.endereco, 80);
      doc.text(enderecoLines, pageWidth - 20, yPosition, { align: 'right' });
      yPosition += (enderecoLines.length - 1) * 8;
    }
    
    if (companySettings.telefone) {
      yPosition += 8;
      doc.text(`Tel: ${companySettings.telefone}`, pageWidth - 20, yPosition, { align: 'right' });
    }
    
    if (companySettings.email) {
      yPosition += 8;
      doc.text(companySettings.email, pageWidth - 20, yPosition, { align: 'right' });
    }
    
    if (companySettings.site) {
      yPosition += 8;
      doc.text(companySettings.site, pageWidth - 20, yPosition, { align: 'right' });
    }


    // Título do documento
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.text('ORÇAMENTO', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Data e número do orçamento
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const today = new Date().toLocaleDateString('pt-BR');
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    doc.text(`Data: ${today}`, 20, yPosition);
    doc.text(`Orçamento Nº: ${orderNumber}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 20;

    // Dados do cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('DADOS DO CLIENTE', 20, yPosition);
    
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkColor);
    doc.text(`Cliente: ${data.cliente}`, 20, yPosition);
    
    yPosition += 20;

    // Tabela do pedido
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('ITENS DO PEDIDO', 20, yPosition);
    
    yPosition += 10;

    // Cabeçalho da tabela
    doc.setFillColor(...primaryColor);
    doc.rect(20, yPosition, pageWidth - 40, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PRODUTO', 25, yPosition + 5);
    doc.text('CATEGORIA', 80, yPosition + 5);
    doc.text('QTD', 120, yPosition + 5);
    doc.text('PREÇO UNIT.', 140, yPosition + 5);
    doc.text('TOTAL', pageWidth - 25, yPosition + 5, { align: 'right' });
    
    yPosition += 8;

    // Linha do produto
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPosition, pageWidth - 40, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkColor);
    
    const categoryName = state.categories.find(cat => cat.id === data.categoria)?.nome || data.categoria;
    
    doc.text(data.produto, 25, yPosition + 5);
    doc.text(categoryName, 80, yPosition + 5);
    doc.text(data.quantidade.toString(), 120, yPosition + 5);
    doc.text(`R$ ${data.precoUnitario.toFixed(2)}`, 140, yPosition + 5);
    doc.text(`R$ ${data.precoTotal.toFixed(2)}`, pageWidth - 25, yPosition + 5, { align: 'right' });
    
    yPosition += 20;

    // Resumo financeiro
    const subtotal = data.precoTotal;
    const frete = data.frete || 0;
    const desconto = data.desconto || 0;
    const total = subtotal + frete - desconto;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    
    if (subtotal > 0) {
      doc.text('Subtotal:', pageWidth - 80, yPosition);
      doc.text(`R$ ${subtotal.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
      yPosition += 8;
    }
    
    if (frete > 0) {
      doc.text('Frete:', pageWidth - 80, yPosition);
      doc.text(`R$ ${frete.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
      yPosition += 8;
    }
    
    if (desconto > 0) {
      doc.text('Desconto:', pageWidth - 80, yPosition);
      doc.text(`- R$ ${desconto.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
      yPosition += 8;
    }

    // Total geral
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    doc.text('TOTAL GERAL:', pageWidth - 80, yPosition);
    doc.text(`R$ ${total.toFixed(2)}`, pageWidth - 25, yPosition, { align: 'right' });
    
    yPosition += 20;

    // Formas de pagamento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('FORMAS DE PAGAMENTO', 20, yPosition);
    
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkColor);
    
    if (companySettings.pixChave) {
      doc.text(`• PIX: ${companySettings.pixChave}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (companySettings.dadosBancarios) {
      doc.text('• Transferência Bancária:', 20, yPosition);
      yPosition += 6;
      const bankLines = doc.splitTextToSize(companySettings.dadosBancarios, pageWidth - 60);
      doc.text(bankLines, 25, yPosition);
      yPosition += bankLines.length * 6 + 5;
    }
    
    doc.text('• Cartão de Crédito/Débito (consultar condições)', 20, yPosition);
    yPosition += 8;
    
    // QR Code PIX
    if (companySettings.qrCodePix) {
      try {
        doc.text('• QR Code PIX:', 20, yPosition);
        yPosition += 8;
        doc.addImage(companySettings.qrCodePix, 'JPEG', 25, yPosition, 30, 30);
        yPosition += 35;
      } catch (error) {
        console.warn('Erro ao adicionar QR Code:', error);
        yPosition += 5;
      }
    } else {
      yPosition += 10;
    }

    // Informações adicionais
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('INFORMAÇÕES IMPORTANTES', 20, yPosition);
    
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkColor);
    
    if (companySettings.prazoEntrega) {
      doc.text(`• Prazo de entrega: ${companySettings.prazoEntrega}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (companySettings.validadeOrcamento) {
      doc.text(`• Este orçamento é válido por ${companySettings.validadeOrcamento}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (data.observacoes || companySettings.observacoes) {
      doc.text('• Observações:', 20, yPosition);
      yPosition += 6;
      const obs = data.observacoes || companySettings.observacoes;
      const obsLines = doc.splitTextToSize(obs, pageWidth - 60);
      doc.text(obsLines, 25, yPosition);
      yPosition += obsLines.length * 6 + 10;
    }

    // QR Code PIX no canto inferior direito
    if (companySettings.qrCodePix) {
      try {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('PIX QR Code:', pageWidth - 70, pageHeight - 45);
        doc.addImage(companySettings.qrCodePix, 'JPEG', pageWidth - 70, pageHeight - 40, 35, 35);
      } catch (error) {
        console.warn('Erro ao adicionar QR Code:', error);
      }
    }

    // Rodapé centralizado
    if (yPosition < pageHeight - 50) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...secondaryColor);
      doc.text('Agradecemos pela preferência!', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    // Salvar PDF
    const fileName = `Orcamento_${data.cliente.replace(/\s+/g, '_')}_${orderNumber}.pdf`;
    doc.save(fileName);
    
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Gerar PDF para Cliente</span>
    </button>
  );
};

export default PDFGenerator;