import React, { useState } from 'react';
import { Building2, Upload, Save } from 'lucide-react';
import { useApp, CompanySettings } from '../../context/AppContext';

const CompanySettingsTab: React.FC = () => {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState<CompanySettings>(state.companySettings);
  const [saved, setSaved] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, logo: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQRCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({ ...prev, qrCodePix: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_COMPANY_SETTINGS', payload: formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-6 h-6 text-indigo-500" />
          <h3 className="text-xl font-semibold text-gray-900">Configurações da Empresa</h3>
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            saved 
              ? 'bg-green-500 text-white' 
              : 'bg-indigo-500 text-white hover:bg-indigo-600'
          }`}
        >
          {saved ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Salvo!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Dados da Empresa</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Fantasia *
              </label>
              <input
                type="text"
                value={formData.nomeFantasia}
                onChange={(e) => setFormData(prev => ({ ...prev, nomeFantasia: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nome da sua empresa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razão Social
              </label>
              <input
                type="text"
                value={formData.razaoSocial}
                onChange={(e) => setFormData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Razão social completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço Completo
              </label>
              <textarea
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Rua, número, bairro, cidade, CEP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="contato@empresa.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site
              </label>
              <input
                type="url"
                value={formData.site}
                onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://www.empresa.com"
              />
            </div>
          </div>

          {/* Logo e Configurações */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Logo e Configurações</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Empresa
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {formData.logo ? (
                  <div className="space-y-3">
                    <img 
                      src={formData.logo} 
                      alt="Logo" 
                      className="max-h-24 mx-auto"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover logo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <label className="cursor-pointer bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                        Fazer upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-sm text-gray-500">PNG, JPG até 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave PIX
              </label>
              <input
                type="text"
                value={formData.pixChave}
                onChange={(e) => setFormData(prev => ({ ...prev, pixChave: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="CPF, CNPJ, e-mail ou telefone"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code PIX
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {formData.qrCodePix ? (
                  <div className="space-y-3">
                    <img 
                      src={formData.qrCodePix} 
                      alt="QR Code PIX" 
                      className="max-h-32 mx-auto border rounded"
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, qrCodePix: '' }))}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remover QR Code
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <label className="cursor-pointer bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm">
                        Fazer upload do QR Code
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQRCodeUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG até 2MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dados Bancários
              </label>
              <textarea
                value={formData.dadosBancarios}
                onChange={(e) => setFormData(prev => ({ ...prev, dadosBancarios: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Banco, Agência, Conta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prazo de Entrega Padrão
              </label>
              <input
                type="text"
                value={formData.prazoEntrega}
                onChange={(e) => setFormData(prev => ({ ...prev, prazoEntrega: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: 7 dias úteis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade do Orçamento
              </label>
              <input
                type="text"
                value={formData.validadeOrcamento}
                onChange={(e) => setFormData(prev => ({ ...prev, validadeOrcamento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ex: 30 dias"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações Padrão
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Observações que aparecerão nos orçamentos"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySettingsTab;