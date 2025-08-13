import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { useApp, Category } from '../../context/AppContext';

const CategoriesTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData: Category = {
      id: editingCategory ? editingCategory.id : Date.now().toString(),
      ...formData,
    };

    if (editingCategory) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: categoryData });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: categoryData });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
    });
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      nome: category.nome,
    });
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Tag className="w-6 h-6 text-green-500" />
          <h3 className="text-xl font-semibold text-gray-900">Categorias de Produtos</h3>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Decorativos, Utilitários, Brinquedos..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  {editingCategory ? 'Atualizar' : 'Cadastrar'}
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

      {/* Categories List */}
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        {state.categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma categoria cadastrada</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-2 text-green-500 hover:text-green-600"
            >
              Cadastre sua primeira categoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {state.categories.map((category) => {
              // Calculate stats for this category
              const categoryPrints = state.printHistory.filter(print => print.categoria === category.id);
              const totalSales = categoryPrints.reduce((sum, print) => sum + (print.precoUnitario * print.quantidade), 0);
              const totalProfit = categoryPrints.reduce((sum, print) => sum + print.lucroTotal, 0);
              
              return (
                <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900">{category.nome}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-green-600 hover:text-green-900 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Impressões:</span>
                      <span className="font-medium">{categoryPrints.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vendas Totais:</span>
                      <span className="font-medium">R$ {totalSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro Total:</span>
                      <span className={`font-medium ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {totalProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesTab;