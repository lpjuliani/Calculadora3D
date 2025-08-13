import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calculator, Save, PieChart, Skull, TrendingDown, AlertTriangle, MinusCircle, ThumbsUp, Coffee, Rocket, Crown, Medal, Zap, Trophy, Infinity } from 'lucide-react';
import CostChart from './CostChart';
import PDFGenerator from './PDFGenerator';
import { getMarginBadge } from '../utils/marginBadge';

interface FilamentUsage {
  id: string;
  peso: number;
}

interface ItemUsage {
  id: string;
  quantidade: number;
}

interface FormData {
  cliente: string;
  produto: string;
  categoria: string;
  impressora: string;
  tempoHoras: number;
  tempoMinutos: number;
  quantidade: number;
  filamentos: FilamentUsage[];
  taxaEnergia: number;
  acessorios: ItemUsage[];
  embalagens: ItemUsage[];
  custosPintura: number;
  custosMaoObra: number;
  maoObraComFalhas: boolean;
  percentualImpostos: number;
  custosFrete: number;
  percentualMarketplace: number;
  custosExtras: number;
  custosExtrasType: 'percent' | 'fixed';
  precoVendaUnitario: number;
  observacoesPDF: string;
  fretePDF: number;
  descontoPDF: number;
}

const MainPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState<FormData>({
    cliente: '',
    produto: '',
    categoria: '',
    impressora: '',
    tempoHoras: 0,
    tempoMinutos: 0,
    quantidade: 1,
    filamentos: [{ id: '', peso: 0 }],
    taxaEnergia: 0.85,
    acessorios: [],
    embalagens: [],
    custosPintura: 0,
    custosMaoObra: 0,
    maoObraComFalhas: true,
    percentualImpostos: 0,
    custosFrete: 0,
    percentualMarketplace: 0,
    custosExtras: 0,
    custosExtrasType: 'fixed',
    precoVendaUnitario: 0,
    observacoesPDF: '',
    fretePDF: 0,
    descontoPDF: 0,
  });

  const [calculations, setCalculations] = useState({
    custoFilamento: 0,
    custoEnergia: 0,
    custoDesgaste: 0,
    custoAcessorios: 0,
    custoEmbalagens: 0,
    custosAdicionais: 0,
    ajusteFalhas: 0,
    valorCustosExtras: 0,
    valorImpostos: 0,
    valorMarketplace: 0,
    custoTotal: 0,
    custoUnitario: 0,
    lucroUnitario: 0,
    lucroTotal: 0,
    margemLucro: 0
  });

  const [chartOptions, setChartOptions] = useState({
    tributos: true,
    falhas: true
  });

  // Mapeamento de ícones
  const iconMap = {
    Skull,
    TrendingDown,
    AlertTriangle,
    MinusCircle,
    ThumbsUp,
    Coffee,
    Rocket,
    Crown,
    Medal,
    Zap,
    PartyPopper: Trophy, // PartyPopper não existe no lucide, usando Trophy
    Trophy,
    Infinity
  };

  // Calcula custos automaticamente quando dados mudam
  useEffect(() => {
    const calculateCosts = () => {
      // Obter dados da impressora selecionada
      const printer = state.printers.find(p => p.id === formData.impressora);
      const percentualFalhas = printer ? printer.percentualFalhas : 0;
      
      // Custos de produção que sofrem com falhas
      let custoFilamento = 0;
      formData.filamentos.forEach(fil => {
        const filament = state.filaments.find(f => f.id === fil.id);
        if (filament && fil.peso > 0) {
          custoFilamento += (fil.peso / filament.pesoRolo) * filament.custoRolo;
        }
      });

      let custoEnergia = 0;
      if (printer) {
        const tempoTotalHoras = formData.tempoHoras + (formData.tempoMinutos / 60);
        if (tempoTotalHoras > 0 && formData.taxaEnergia > 0) {
          custoEnergia = (printer.potencia * tempoTotalHoras / 1000) * formData.taxaEnergia;
        }
      }

      let custoDesgaste = 0;
      if (printer) {
        const tempoTotalHoras = formData.tempoHoras + (formData.tempoMinutos / 60);
        if (tempoTotalHoras > 0 && printer.vidaUtil > 0) {
          custoDesgaste = (tempoTotalHoras / printer.vidaUtil) * printer.valorPago;
        }
      }

      // Custos que sofrem com falhas (precisam ser refeitos se a peça falhar)
      const maoObraProducao = formData.maoObraComFalhas ? formData.custosMaoObra : 0;
      const maoObraEntrega = formData.maoObraComFalhas ? 0 : formData.custosMaoObra;
      const custosProducao = custoFilamento + custoEnergia + custoDesgaste + maoObraProducao;
      
      // Aplicar fator de rendimento correto: custo / (1 - percentualFalhas/100)
      const custosProducaoAjustados = percentualFalhas > 0 && percentualFalhas < 100 
        ? custosProducao / (1 - percentualFalhas / 100)
        : custosProducao;
      
      const ajusteFalhas = custosProducaoAjustados - custosProducao;
      
      // Custos que não sofrem com falhas (só aplicados nas peças entregues)
      let custoAcessorios = 0;
      formData.acessorios.forEach(acc => {
        const accessory = state.accessories.find(a => a.id === acc.id);
        if (accessory) {
          custoAcessorios += accessory.precoUnitario * acc.quantidade;
        }
      });

      let custoEmbalagens = 0;
      formData.embalagens.forEach(emb => {
        const packaging = state.packaging.find(p => p.id === emb.id);
        if (packaging) {
          custoEmbalagens += packaging.precoUnitario * emb.quantidade;
        }
      });

      // Custos adicionais que não sofrem com falhas
      const baseAdditionalCosts = formData.custosPintura + formData.custosFrete + maoObraEntrega;
      
      // Custos que não sofrem com falhas
      const custosSemFalhas = custoAcessorios + custoEmbalagens + baseAdditionalCosts;
      
      // Calcular impostos e taxa marketplace sobre o valor de venda
      const valorImpostos = formData.precoVendaUnitario * formData.quantidade * (formData.percentualImpostos / 100);
      const valorMarketplace = formData.precoVendaUnitario * formData.quantidade * (formData.percentualMarketplace / 100);
      
      // Calcular custos extras (% sobre venda ou valor fixo)
      const valorCustosExtras = formData.custosExtrasType === 'percent' 
        ? formData.precoVendaUnitario * formData.quantidade * (formData.custosExtras / 100)
        : formData.custosExtras;
      
      // Custo Total = Custos de produção ajustados + Custos sem falhas + taxas sobre venda
      const custoTotal = custosProducaoAjustados + custosSemFalhas + valorImpostos + valorMarketplace + valorCustosExtras;
      
      const custoUnitario = formData.quantidade > 0 ? custoTotal / formData.quantidade : 0;
      const lucroUnitario = formData.precoVendaUnitario - custoUnitario;
      const lucroTotal = lucroUnitario * formData.quantidade;
      const margemLucro = formData.precoVendaUnitario > 0 ? (lucroUnitario / formData.precoVendaUnitario) * 100 : 0;

      // DEBUG DETALHADO DA MARGEM
      // DEBUG: Cálculo de energia
      if (printer) {
        const tempoTotalHoras = formData.tempoHoras + (formData.tempoMinutos / 60);
        console.log('🔋 DEBUG ENERGIA:');
        console.log('  Impressora:', printer.marca, printer.modelo);
        console.log('  Potência:', printer.potencia, 'W');
        console.log('  Tempo total:', tempoTotalHoras, 'h');
        console.log('  Taxa energia:', formData.taxaEnergia, 'R$/kWh');
        console.log('  Cálculo: (', printer.potencia, '*', tempoTotalHoras, '/ 1000) *', formData.taxaEnergia);
        console.log('  Resultado:', custoEnergia, 'R$');
      }

      setCalculations({
        custoFilamento,
        custoEnergia,
        custoDesgaste,
        custoAcessorios,
        custoEmbalagens,
        custosAdicionais: baseAdditionalCosts,
        ajusteFalhas,
        valorCustosExtras,
        valorImpostos,
        valorMarketplace,
        custoTotal,
        custoUnitario,
        lucroUnitario,
        lucroTotal,
        margemLucro
      });
    };

    calculateCosts();
  }, [formData, state.printers, state.filaments, state.accessories, state.packaging]);

  const addFilament = () => {
    setFormData(prev => ({
      ...prev,
      filamentos: [...prev.filamentos, { id: '', peso: 0 }]
    }));
  };

  const removeFilament = (index: number) => {
    setFormData(prev => ({
      ...prev,
      filamentos: prev.filamentos.filter((_, i) => i !== index)
    }));
  };

  const addAccessory = () => {
    setFormData(prev => ({
      ...prev,
      acessorios: [...prev.acessorios, { id: '', quantidade: 0 }]
    }));
  };

  const removeAccessory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      acessorios: prev.acessorios.filter((_, i) => i !== index)
    }));
  };

  const addPackaging = () => {
    setFormData(prev => ({
      ...prev,
      embalagens: [...prev.embalagens, { id: '', quantidade: 0 }]
    }));
  };

  const removePackaging = (index: number) => {
    setFormData(prev => ({
      ...prev,
      embalagens: prev.embalagens.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    // Validação completa dos campos obrigatórios
    const errors = [];
    
    // Campos básicos obrigatórios
    if (!formData.cliente || formData.cliente.trim() === '') errors.push('Cliente');
    if (!formData.produto || formData.produto.trim() === '') errors.push('Nome do Produto');
    if (!formData.categoria || formData.categoria === '') errors.push('Categoria');
    if (!formData.impressora || formData.impressora === '') errors.push('Impressora');
    
    // Tempo obrigatório (pelo menos 1 minuto)
    const tempoTotalMinutos = (formData.tempoHoras * 60) + formData.tempoMinutos;
    if (tempoTotalMinutos <= 0) {
      errors.push('Tempo de impressão (mínimo 1 minuto)');
    }
    
    // Quantidade obrigatória (mínimo 1)
    if (!formData.quantidade || formData.quantidade <= 0) {
      errors.push('Quantidade (mínimo 1 peça)');
    }
    
    // Pelo menos um filamento com peso > 0
    const hasValidFilament = formData.filamentos.some(f => f.id && f.id !== '' && f.peso > 0);
    if (!hasValidFilament) {
      errors.push('Pelo menos um filamento com peso maior que 0');
    }
    
    // Taxa de energia obrigatória
    if (!formData.taxaEnergia || formData.taxaEnergia <= 0) {
      errors.push('Taxa de energia (deve ser maior que 0)');
    }
    
    if (errors.length > 0) {
      alert(`Preencha os seguintes campos obrigatórios:\n\n• ${errors.join('\n• ')}`);
      return;
    }

    // Criar registro de impressão
    const printRecord = {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      cliente: formData.cliente,
      produto: formData.produto,
      categoria: formData.categoria,
      impressora: state.printers.find(p => p.id === formData.impressora)?.modelo || '',
      pesoTotal: formData.filamentos.reduce((sum, f) => sum + f.peso, 0),
      tempoTotal: formData.tempoHoras + (formData.tempoMinutos / 60),
      quantidade: formData.quantidade,
      custoTotal: calculations.custoTotal,
      precoUnitario: formData.precoVendaUnitario,
      lucroUnitario: calculations.lucroUnitario,
      lucroTotal: calculations.lucroTotal
    };

    // Atualizar estoque
    const stockUpdate = {
      filaments: formData.filamentos.map(f => ({ id: f.id, amount: f.peso })),
      accessories: formData.acessorios.map(a => ({ id: a.id, amount: a.quantidade })),
      packaging: formData.embalagens.map(e => ({ id: e.id, amount: e.quantidade }))
    };

    dispatch({ type: 'ADD_PRINT_RECORD', payload: printRecord });
    dispatch({ type: 'UPDATE_STOCK', payload: stockUpdate });

    // Resetar formulário
    setFormData({
      cliente: '',
      produto: '',
      categoria: '',
      impressora: '',
      tempoHoras: 0,
      tempoMinutos: 0,
      quantidade: 1,
      filamentos: [{ id: '', peso: 0 }],
      taxaEnergia: 0.85,
      acessorios: [],
      embalagens: [],
      custosPintura: 0,
      custosMaoObra: 0,
      maoObraComFalhas: true,
      percentualImpostos: 0,
      custosFrete: 0,
      percentualMarketplace: 0,
      custosExtras: 0,
      custosExtrasType: 'fixed',
      precoVendaUnitario: 0,
      observacoesPDF: '',
      fretePDF: 0,
      descontoPDF: 0,
    });

    alert('Impressão salva com sucesso!');
  };

  const costData = [
    { label: 'Filamento', value: calculations.custoFilamento, color: '#F97316' },
    { label: 'Energia', value: calculations.custoEnergia, color: '#3B82F6' },
    { label: 'Desgaste', value: calculations.custoDesgaste, color: '#10B981' },
    { label: 'Acessórios', value: calculations.custoAcessorios, color: '#8B5CF6' },
    { label: 'Embalagens', value: calculations.custoEmbalagens, color: '#F59E0B' },
    { label: 'Adicionais', value: calculations.custosAdicionais - calculations.valorCustosExtras, color: '#EF4444' },
    { label: 'Custos extras', value: calculations.valorCustosExtras, color: '#EC4899' },
    { label: 'Ajuste por falhas', value: calculations.ajusteFalhas, color: '#F97316', optional: true },
    { label: 'Impostos', value: calculations.valorImpostos, color: '#6B7280', optional: true },
    { label: 'Marketplace', value: calculations.valorMarketplace, color: '#9CA3AF', optional: true }
  ];

  // Verificar se todos os campos obrigatórios estão preenchidos para habilitar PDF
  const canGeneratePDF = formData.cliente && formData.produto && formData.categoria && formData.precoVendaUnitario > 0;

  // Obter badge da margem
  const marginBadge = getMarginBadge(calculations.margemLucro);
  
  // DEBUG: Log para investigar o problema
  console.log('🔍 DEBUG Margem:', {
    precoVenda: formData.precoVendaUnitario,
    custoUnitario: calculations.custoUnitario,
    lucroUnitario: calculations.lucroUnitario,
    margemCalculada: calculations.margemLucro,
    marginBadge: marginBadge
  });
  
  const MarginIcon = iconMap[marginBadge.icon as keyof typeof iconMap] || AlertTriangle;

  const pdfData = {
    cliente: formData.cliente,
    produto: formData.produto,
    categoria: formData.categoria,
    quantidade: formData.quantidade,
    precoUnitario: formData.precoVendaUnitario,
    precoTotal: formData.precoVendaUnitario * formData.quantidade,
    frete: formData.fretePDF,
    desconto: formData.descontoPDF,
    observacoes: formData.observacoesPDF
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Nova Impressão</h2>
              <p className="text-gray-600">Calcule custos e lucratividade em tempo real</p>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${marginBadge.colorClasses}`}>
              <MarginIcon className="w-4 h-4" />
              <span>{marginBadge.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              {marginBadge.message}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Básicos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <input
                  type="text"
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={formData.produto}
                  onChange={(e) => setFormData(prev => ({ ...prev, produto: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {state.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impressora *
                </label>
                <select
                  value={formData.impressora}
                  onChange={(e) => setFormData(prev => ({ ...prev, impressora: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione uma impressora</option>
                  {state.printers.map(printer => (
                    <option key={printer.id} value={printer.id}>
                      {printer.marca} {printer.modelo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tempo e Quantidade */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tempo e Quantidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.tempoHoras}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempoHoras: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minutos
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.tempoMinutos}
                  onChange={(e) => setFormData(prev => ({ ...prev, tempoMinutos: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade de Peças
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Filamentos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filamentos Utilizados</h3>
              <button
                onClick={addFilament}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                + Adicionar Filamento
              </button>
            </div>
            <div className="space-y-3">
              {formData.filamentos.map((filament, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filamento
                    </label>
                    <select
                      value={filament.id}
                      onChange={(e) => {
                        const newFilaments = [...formData.filamentos];
                        newFilaments[index].id = e.target.value;
                        setFormData(prev => ({ ...prev, filamentos: newFilaments }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um filamento</option>
                      {state.filaments.map(fil => (
                        <option key={fil.id} value={fil.id}>
                          {fil.marca} - {fil.tipo} {fil.cor}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={filament.peso}
                      onChange={(e) => {
                        const newFilaments = [...formData.filamentos];
                        newFilaments[index].peso = Number(e.target.value);
                        setFormData(prev => ({ ...prev, filamentos: newFilaments }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {formData.filamentos.length > 1 && (
                    <button
                      onClick={() => removeFilament(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Remover
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Taxa de Energia */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h3>
            <div className="max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Energia (R$/kWh)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.taxaEnergia}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxaEnergia: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {formData.impressora && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Percentual de falhas da impressora:</strong> {state.printers.find(p => p.id === formData.impressora)?.percentualFalhas || 0}%
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Aplicado automaticamente nos custos de produção usando fator de rendimento
                </p>
              </div>
            )}
          </div>

          {/* Acessórios e Embalagens */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Acessórios */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Acessórios</h4>
                  <button
                    onClick={addAccessory}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.acessorios.map((accessory, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <select
                          value={accessory.id}
                          onChange={(e) => {
                            const newAccessories = [...formData.acessorios];
                            newAccessories[index].id = e.target.value;
                            setFormData(prev => ({ ...prev, acessorios: newAccessories }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione um acessório</option>
                          {state.accessories.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.tipo}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="0"
                          placeholder="Qtd"
                          value={accessory.quantidade}
                          onChange={(e) => {
                            const newAccessories = [...formData.acessorios];
                            newAccessories[index].quantidade = Number(e.target.value);
                            setFormData(prev => ({ ...prev, acessorios: newAccessories }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => removeAccessory(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Embalagens */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Embalagens</h4>
                  <button
                    onClick={addPackaging}
                    className="px-3 py-1 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    + Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.embalagens.map((packaging, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <select
                          value={packaging.id}
                          onChange={(e) => {
                            const newPackaging = [...formData.embalagens];
                            newPackaging[index].id = e.target.value;
                            setFormData(prev => ({ ...prev, embalagens: newPackaging }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Selecione uma embalagem</option>
                          {state.packaging.map(pack => (
                            <option key={pack.id} value={pack.id}>{pack.tipo}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          min="0"
                          placeholder="Qtd"
                          value={packaging.quantidade}
                          onChange={(e) => {
                            const newPackaging = [...formData.embalagens];
                            newPackaging[index].quantidade = Number(e.target.value);
                            setFormData(prev => ({ ...prev, embalagens: newPackaging }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={() => removePackaging(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Custos Adicionais */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Custos Adicionais (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pintura (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.custosPintura}
                  onChange={(e) => setFormData(prev => ({ ...prev, custosPintura: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mão de obra (R$)
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.custosMaoObra}
                    onChange={(e) => setFormData(prev => ({ ...prev, custosMaoObra: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.maoObraComFalhas}
                      onChange={(e) => setFormData(prev => ({ ...prev, maoObraComFalhas: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">Aplicar ajuste de falhas na mão de obra</span>
                  </label>
                  <p className="text-xs text-gray-500">
                    {formData.maoObraComFalhas 
                      ? "Mão de obra será ajustada pelo percentual de falhas (trabalho de produção)"
                      : "Mão de obra não será ajustada (trabalho de finalização/entrega)"
                    }
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frete (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.custosFrete}
                  onChange={(e) => setFormData(prev => ({ ...prev, custosFrete: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custos Extras
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <select
                      value={formData.custosExtrasType}
                      onChange={(e) => setFormData(prev => ({ ...prev, custosExtrasType: e.target.value as 'percent' | 'fixed' }))}
                      className="w-20 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="fixed">R$</option>
                      <option value="percent">%</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.custosExtras}
                      onChange={(e) => setFormData(prev => ({ ...prev, custosExtras: Number(e.target.value) }))}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={formData.custosExtrasType === 'percent' ? '0.0' : '0,00'}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.custosExtrasType === 'percent' 
                      ? 'Percentual sobre o valor de venda total'
                      : 'Valor fixo em reais'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <h4 className="text-md font-medium text-gray-900 mt-6 mb-4">Percentuais sobre Valor de Venda</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impostos (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentualImpostos}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentualImpostos: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa Marketplace (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentualMarketplace}
                  onChange={(e) => setFormData(prev => ({ ...prev, percentualMarketplace: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dados para PDF */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações para Orçamento (PDF)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frete (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.fretePDF}
                  onChange={(e) => setFormData(prev => ({ ...prev, fretePDF: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.descontoPDF}
                  onChange={(e) => setFormData(prev => ({ ...prev, descontoPDF: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações para o Cliente
              </label>
              <textarea
                value={formData.observacoesPDF}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoesPDF: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Observações específicas para este orçamento..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Resultados */}
        <div className="space-y-6">
          {/* Preço de Venda */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border-2 border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Preço de Venda
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preço Unitário (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.precoVendaUnitario}
                onChange={(e) => setFormData(prev => ({ ...prev, precoVendaUnitario: Number(e.target.value) }))}
                className="w-full px-4 py-4 text-lg font-semibold border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                placeholder="0,00"
              />
              {formData.quantidade > 1 && formData.precoVendaUnitario > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Total: <span className="font-semibold text-blue-600">R$ {(formData.precoVendaUnitario * formData.quantidade).toFixed(2)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Resumo de Custos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Custos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Filamento:</span>
                <span className="font-medium">R$ {calculations.custoFilamento.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Energia:</span>
                <span className="font-medium">R$ {calculations.custoEnergia.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Desgaste:</span>
                <span className="font-medium">R$ {calculations.custoDesgaste.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Acessórios:</span>
                <span className="font-medium">R$ {calculations.custoAcessorios.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Embalagens:</span>
                <span className="font-medium">R$ {calculations.custoEmbalagens.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Adicionais:</span>
                <span className="font-medium">R$ {calculations.custosAdicionais.toFixed(2)}</span>
              </div>
              {calculations.valorCustosExtras > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Custos extras ({formData.custosExtrasType === 'percent' ? `${formData.custosExtras}%` : 'fixo'}):
                  </span>
                  <span className="font-medium">R$ {calculations.valorCustosExtras.toFixed(2)}</span>
                </div>
              )}
              {calculations.ajusteFalhas > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ajuste por falhas:</span>
                  <span className="font-medium text-orange-600">+ R$ {calculations.ajusteFalhas.toFixed(2)}</span>
                </div>
              )}
              {calculations.valorImpostos > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Impostos ({formData.percentualImpostos}%):</span>
                  <span className="font-medium">R$ {calculations.valorImpostos.toFixed(2)}</span>
                </div>
              )}
              {calculations.valorMarketplace > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Marketplace ({formData.percentualMarketplace}%):</span>
                  <span className="font-medium">R$ {calculations.valorMarketplace.toFixed(2)}</span>
                </div>
              )}
              <hr className="my-3" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Custo Total:</span>
                <span className="text-orange-600">R$ {calculations.custoTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Custo Unitário:</span>
                <span className="font-medium">R$ {calculations.custoUnitario.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Análise de Lucratividade */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lucratividade</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Preço Unitário:</span>
                <span className="font-medium">R$ {formData.precoVendaUnitario.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lucro Unitário:</span>
                <span className={`font-medium ${calculations.lucroUnitario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {calculations.lucroUnitario.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lucro Total:</span>
                <span className={`font-medium ${calculations.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {calculations.lucroTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Margem:</span>
                <span className={`font-medium ${calculations.margemLucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculations.margemLucro.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de Custos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <PieChart className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Distribuição de Custos</h3>
            </div>
            <CostChart data={costData} />
            <CostChart 
              data={costData} 
              showOptional={chartOptions}
              onToggleOptional={(type) => setChartOptions(prev => ({ ...prev, [type]: !prev[type] }))}
            />
          </div>

          {/* Gerar PDF */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Orçamento para Cliente</h3>
            {canGeneratePDF ? (
              <PDFGenerator data={pdfData} />
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">
                  Preencha os campos obrigatórios para gerar o PDF:
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {!formData.cliente && <li>• Cliente</li>}
                  {!formData.produto && <li>• Nome do produto</li>}
                  {!formData.categoria && <li>• Categoria</li>}
                  {formData.precoVendaUnitario <= 0 && <li>• Preço de venda</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Botão Salvar */}
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-blue-600 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Salvar Impressão</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;