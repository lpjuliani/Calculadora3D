import React from 'react';

interface CostData {
  label: string;
  value: number;
  color: string;
  optional?: boolean;
}

interface CostChartProps {
  data: CostData[];
  showOptional?: {
    tributos: boolean;
    falhas: boolean;
  };
  onToggleOptional?: (type: 'tributos' | 'falhas') => void;
}

const CostChart: React.FC<CostChartProps> = ({ data, showOptional, onToggleOptional }) => {
  const filteredData = data.filter(item => {
    if (item.optional && showOptional) {
      if (item.label.includes('Impostos') || item.label.includes('Marketplace')) {
        return showOptional.tributos;
      }
      if (item.label.includes('Ajuste')) {
        return showOptional.falhas;
      }
    }
    return !item.optional || item.value > 0;
  });
  
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        Nenhum custo calculado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles de Visualização */}
      {onToggleOptional && showOptional && (
        <div className="space-y-2 pb-4 border-b border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Mostrar no gráfico:</p>
          <div className="space-y-1">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOptional.tributos}
                onChange={() => onToggleOptional('tributos')}
                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
              />
              <span className="text-xs text-gray-600">Tributos e Marketplace</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showOptional.falhas}
                onChange={() => onToggleOptional('falhas')}
                className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
              />
              <span className="text-xs text-gray-600">Ajuste por falhas</span>
            </label>
          </div>
        </div>
      )}
      
      {/* Bar Chart */}
      <div className="space-y-2">
        {filteredData.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">R$ {item.value.toFixed(2)} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm font-medium">
          <span>Total:</span>
          <span className="text-orange-600">R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostChart;