import React, { useMemo } from 'react';
import { BarChart, TrendingUp, Package, DollarSign, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ReportsTab: React.FC = () => {
  const { state } = useApp();

  const reports = useMemo(() => {
    const printHistory = state.printHistory;
    
    // Sales by category
    const salesByCategory = state.categories.map(category => {
      const categoryPrints = printHistory.filter(print => print.categoria === category.id);
      const totalSales = categoryPrints.reduce((sum, print) => sum + (print.precoUnitario * print.quantidade), 0);
      const totalProfit = categoryPrints.reduce((sum, print) => sum + print.lucroTotal, 0);
      const totalQuantity = categoryPrints.reduce((sum, print) => sum + print.quantidade, 0);
      
      return {
        category: category.nome,
        sales: totalSales,
        profit: totalProfit,
        quantity: totalQuantity,
        prints: categoryPrints.length
      };
    }).sort((a, b) => b.sales - a.sales);

    // Most sold item (by product name)
    const productSales = printHistory.reduce((acc, print) => {
      const key = print.produto;
      if (!acc[key]) {
        acc[key] = {
          name: key,
          quantity: 0,
          sales: 0,
          profit: 0
        };
      }
      acc[key].quantity += print.quantidade;
      acc[key].sales += print.precoUnitario * print.quantidade;
      acc[key].profit += print.lucroTotal;
      return acc;
    }, {} as Record<string, any>);

    const mostSoldItem = Object.values(productSales).sort((a: any, b: any) => b.quantity - a.quantity)[0] || null;

    // Highest profit margin item
    const highestMarginItem = printHistory
      .filter(print => print.precoUnitario > 0)
      .map(print => ({
        ...print,
        margin: (print.lucroUnitario / print.precoUnitario) * 100
      }))
      .sort((a, b) => b.margin - a.margin)[0] || null;

    // General stats
    const totalSales = printHistory.reduce((sum, print) => sum + (print.precoUnitario * print.quantidade), 0);
    const totalProfit = printHistory.reduce((sum, print) => sum + print.lucroTotal, 0);
    const totalQuantity = printHistory.reduce((sum, print) => sum + print.quantidade, 0);
    const averageMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      salesByCategory,
      mostSoldItem,
      highestMarginItem,
      totalSales,
      totalProfit,
      totalQuantity,
      averageMargin,
      totalPrints: printHistory.length
    };
  }, [state.categories, state.printHistory]);

  const exportToCSV = () => {
    const headers = ['Data', 'Cliente', 'Produto', 'Categoria', 'Impressora', 'Quantidade', 'Custo Total', 'Preço Unitário', 'Lucro Total'];
    const csvContent = [
      headers.join(','),
      ...state.printHistory.map(print => [
        print.data,
        print.cliente,
        print.produto,
        state.categories.find(cat => cat.id === print.categoria)?.nome || '',
        print.impressora,
        print.quantidade,
        print.custoTotal.toFixed(2),
        print.precoUnitario.toFixed(2),
        print.lucroTotal.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_impressoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart className="w-6 h-6 text-blue-500" />
          <h3 className="text-xl font-semibold text-gray-900">Relatórios e Análises</h3>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
              <p className="text-2xl font-bold text-gray-900">R$ {reports.totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lucro Total</p>
              <p className={`text-2xl font-bold ${reports.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {reports.totalProfit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Peças Vendidas</p>
              <p className="text-2xl font-bold text-gray-900">{reports.totalQuantity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Margem Média</p>
              <p className={`text-2xl font-bold ${reports.averageMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {reports.averageMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Categoria</h4>
        {reports.salesByCategory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma venda registrada ainda</p>
        ) : (
          <div className="space-y-4">
            {reports.salesByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{category.category}</h5>
                  <p className="text-sm text-gray-600">
                    {category.prints} impressões • {category.quantity} peças
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">R$ {category.sales.toFixed(2)}</p>
                  <p className={`text-sm ${category.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Lucro: R$ {category.profit.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Sold Item */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Item Mais Vendido</h4>
          {reports.mostSoldItem ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Produto:</span>
                <span className="font-medium">{reports.mostSoldItem.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantidade:</span>
                <span className="font-medium">{reports.mostSoldItem.quantity} peças</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendas:</span>
                <span className="font-medium">R$ {reports.mostSoldItem.sales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lucro:</span>
                <span className={`font-medium ${reports.mostSoldItem.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {reports.mostSoldItem.profit.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
          )}
        </div>

        {/* Highest Profit Margin Item */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Maior Margem de Lucro</h4>
          {reports.highestMarginItem ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Produto:</span>
                <span className="font-medium">{reports.highestMarginItem.produto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-medium">{reports.highestMarginItem.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Preço:</span>
                <span className="font-medium">R$ {reports.highestMarginItem.precoUnitario.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Margem:</span>
                <span className="font-medium text-green-600">
                  {reports.highestMarginItem.margin.toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Impressões</h4>
        {state.printHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma impressão registrada ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Custo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lucro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {state.printHistory.slice(-20).reverse().map((print, index) => (
                  <tr key={print.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900">{print.data}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{print.cliente}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{print.produto}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{print.quantidade}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">R$ {print.custoTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">R$ {print.precoUnitario.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-sm font-medium ${print.lucroTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {print.lucroTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;