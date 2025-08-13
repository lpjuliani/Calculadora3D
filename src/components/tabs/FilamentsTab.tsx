import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { useApp, Filament } from '../../context/AppContext';

const FilamentsTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [formData, setFormData] = useState({
    marca: '',
    tipo: '',
    cor: '',
    custoRolo: 0,
    pesoRolo: 0,
    estoqueAtual: 0,
  });

  // Obter marcas e tipos únicos do histórico
  const uniqueBrands = [...new Set(state.filaments.map(f => f.marca).filter(Boolean))].sort();
  const uniqueTypes = [...new Set(state.filaments.map(f => f.tipo).filter(Boolean))].sort();
  
  // Tipos padrão + tipos do histórico
  const defaultTypes = ['PLA', 'ABS', 'PETG', 'TPU', 'WOOD', 'CARBON FIBER', 'SILK', 'TRANSPARENT', 'NYLON'];
  const allTypes = [...new Set([...defaultTypes, ...uniqueTypes])].sort();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filamentData: Filament = {
      id: editingFilament ? editingFilament.id : Date.now().toString(),
      ...formData,
    };

    if (editingFilament) {
      dispatch({ type: 'UPDATE_FILAMENT', payload: filamentData });
    } else {
      dispatch({ type: 'ADD_FILAMENT', payload: filamentData });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      marca: '',
      tipo: '',
      cor: '',
      custoRolo: 0,
      pesoRolo: 0,
      estoqueAtual: 0,
    });
    setEditingFilament(null);
    setIsFormOpen(false);
  };

  const handleEdit = (filament: Filament) => {
    setFormData({
      marca: filament.marca,
      tipo: filament.tipo,
      cor: filament.cor,
      custoRolo: filament.custoRolo,
      pesoRolo: filament.pesoRolo,
      estoqueAtual: filament.estoqueAtual,
    });
    setEditingFilament(filament);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este filamento?')) {
      dispatch({ type: 'DELETE_FILAMENT', payload: id });
    }
  };

  const getStockStatus = (current: number, total: number) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    if (percentage <= 10) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Crítico' };
    if (percentage <= 30) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Baixo' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'Bom' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-semibold text-gray-900">Filamentos</h3>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Filamento</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <h4 className="text-lg font-semibold mb-4">
              {editingFilament ? 'Editar Filamento' : 'Novo Filamento'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  list="brands-list"
                  type="text"
                  required
                  value={formData.marca}
                  onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Digite ou selecione uma marca"
                />
                <datalist id="brands-list">
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <input
                  list="types-list"
                  type="text"
                  required
                  value={formData.tipo}
                  onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Digite ou selecione um tipo"
                />
                <datalist id="types-list">
                  {allTypes.map(type => (
                    <option key={type} value={type} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cor}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Preto, Branco, Azul..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custo por Rolo (R$) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.custoRolo}
                  onChange={(e) => setFormData(prev => ({ ...prev, custoRolo: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso do Rolo (g) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.pesoRolo}
                  onChange={(e) => setFormData(prev => ({ ...prev, pesoRolo: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estoque Atual (g) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.estoqueAtual}
                  onChange={(e) => setFormData(prev => ({ ...prev, estoqueAtual: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingFilament ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filaments List */}
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        {state.filaments.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum filamento cadastrado</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-2 text-orange-500 hover:text-orange-600"
            >
              Cadastre seu primeiro filamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especificações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Custo/g
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.filaments.map((filament, index) => {
                  const costPerGram = filament.pesoRolo > 0 ? filament.custoRolo / filament.pesoRolo : 0;
                  const stockStatus = getStockStatus(filament.estoqueAtual, filament.pesoRolo);
                  
                  return (
                    <tr key={filament.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {filament.marca}
                          </div>
                          <div className="text-sm text-gray-500">
                            {filament.tipo} - {filament.cor}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {filament.pesoRolo}g por rolo
                        </div>
                        <div className="text-sm text-gray-500">
                          R$ {filament.custoRolo.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {costPerGram.toFixed(3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {filament.estoqueAtual}g
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                          {filament.estoqueAtual <= filament.pesoRolo * 0.1 && (
                            <AlertTriangle className="w-3 h-3 mr-1" />
                          )}
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(filament)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(filament.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilamentsTab;