import React, { useState, useMemo } from 'react';
import { History, Eye, Calendar, User, Package, Printer, Clock, DollarSign, TrendingUp, Filter } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const HistoryTab: React.FC = () => {
  const { state } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'profit'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredHistory = useMemo(() => {
    let filtered = [...state.printHistory];
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.data.split('/').reverse().join('-')).getTime() - 
                      new Date(b.data.split('/').reverse().join('-')).getTime();
          break;
        case 'client':
          comparison = a.cliente.localeCompare(b.cliente);
          break;
        case 'profit':
          comparison = a.lucroTotal - b.lucroTotal;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return filtered;
  }, [state.printHistory, selectedCategory, sortBy, sortOrder]);

  const getCategoryName = (categoryId: string) => {
    const category = state.categories.find(cat => cat.id === categoryId);
    return category ? category.nome : 'Categoria não encontrada';
  };

  const getPrinterName = (printerId: string) => {
    const printer = state.printers.find(p => p.id === printerId);
    return printer ? `${printer.marca} ${printer.modelo}` : printerId;
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  const totalStats = useMemo(() => {
    const total = filteredHistory.reduce((acc, item) => ({
      vendas: acc.vendas + (item.precoUnitario * item.quantidade),
      lucro: acc.lucro + item.lucroTotal,
      quantidade: acc.quantidade + item.quantidade,
      impressoes: acc.impressoes + 1
    }), { vendas: 0, lucro: 0, quantidade: 0, impressoes: 0 });
    
    return total;
  }, [filteredHistory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <History className="w-6 h-6 text-indigo-500" />
          <h3 className="text-xl font-semibold text-gray-900">Histórico de Impressões</h3>
        </div>
        
        {/* Filtros */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">Todas as categorias</option>
              {state.categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as 'date' | 'client' | 'profit');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          >
            <option value="date-desc">Mais recente</option>
            <option value="date-asc">Mais antigo</option>
            <option value="client-asc">Cliente A-Z</option>
            <option value="client-desc">Cliente Z-A</option>
            <option value="profit-desc">Maior lucro</option>
            <option value="profit-asc">Menor lucro</option>
          </select>
        </div>
      </div>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Impressões</p>
              <p className="text-xl font-bold text-gray-900">{totalStats.impressoes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Vendas</p>
              <p className="text-xl font-bold text-gray-900">R$ {totalStats.vendas.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Lucro</p>
              <p className={`text-xl font-bold ${totalStats.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {totalStats.lucro.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Peças</p>
              <p className="text-xl font-bold text-gray-900">{totalStats.quantidade}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Histórico */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedCategory ? 'Nenhuma impressão encontrada para esta categoria' : 'Nenhuma impressão registrada ainda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qtd
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lucro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHistory.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.data}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.produto}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getCategoryName(item.categoria)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={item.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}>
                        R$ {item.lucroTotal.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Ver detalhes</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-semibold text-gray-900">Detalhes da Impressão</h4>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <User className="w-4 h-4 mr-2 text-blue-500" />
                    Informações Básicas
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data:</span>
                      <span className="font-medium">{selectedItem.data}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cliente:</span>
                      <span className="font-medium">{selectedItem.cliente}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produto:</span>
                      <span className="font-medium">{selectedItem.produto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categoria:</span>
                      <span className="font-medium">{getCategoryName(selectedItem.categoria)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantidade:</span>
                      <span className="font-medium">{selectedItem.quantidade} peças</span>
                    </div>
                  </div>
                </div>

                {/* Informações Técnicas */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <Printer className="w-4 h-4 mr-2 text-orange-500" />
                    Informações Técnicas
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressora:</span>
                      <span className="font-medium">{getPrinterName(selectedItem.impressora)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso Total:</span>
                      <span className="font-medium">{selectedItem.pesoTotal}g</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo Total:</span>
                      <span className="font-medium">{formatTime(selectedItem.tempoTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Informações Financeiras */}
                <div className="md:col-span-2 space-y-4">
                  <h5 className="font-medium text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                    Informações Financeiras
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-gray-600 text-sm">Custo Total</p>
                        <p className="text-lg font-semibold text-orange-600">
                          R$ {selectedItem.custoTotal.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 text-sm">Preço Unitário</p>
                        <p className="text-lg font-semibold text-blue-600">
                          R$ {selectedItem.precoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600 text-sm">Lucro Total</p>
                        <p className={`text-lg font-semibold ${selectedItem.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {selectedItem.lucroTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Margem de Lucro:</span>
                        <span className={`font-medium ${selectedItem.lucroUnitario >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedItem.precoUnitario > 0 ? ((selectedItem.lucroUnitario / selectedItem.precoUnitario) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Vendas Totais:</span>
                        <span className="font-medium text-blue-600">
                          R$ {(selectedItem.precoUnitario * selectedItem.quantidade).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTab;