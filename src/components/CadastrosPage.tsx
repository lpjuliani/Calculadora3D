import React, { useState } from 'react';
import { Printer, Package, Settings, Box, Tag, BarChart, Building2, History, Shield } from 'lucide-react';
import PrintersTab from './tabs/PrintersTab';
import FilamentsTab from './tabs/FilamentsTab';
import AccessoriesTab from './tabs/AccessoriesTab';
import PackagingTab from './tabs/PackagingTab';
import CategoriesTab from './tabs/CategoriesTab';
import ReportsTab from './tabs/ReportsTab';
import CompanySettingsTab from './tabs/CompanySettingsTab';
import HistoryTab from './tabs/HistoryTab';
import AdminPanel from './AdminPanel';
import { useAuth } from '../context/AuthContext';

type Tab = 'printers' | 'filaments' | 'accessories' | 'packaging' | 'categories' | 'history' | 'reports' | 'company' | 'admin';

const CadastrosPage: React.FC = () => {
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('printers');
  const isAdmin = authState.currentUser?.role === 'admin';

  const baseTabs = [
    { id: 'printers', label: 'Impressoras', icon: Printer },
    { id: 'filaments', label: 'Filamentos', icon: Package },
    { id: 'accessories', label: 'Acessórios', icon: Settings },
    { id: 'packaging', label: 'Embalagens', icon: Box },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'reports', label: 'Relatórios', icon: BarChart },
    { id: 'company', label: 'Empresa', icon: Building2 },
  ] as const;

  const adminTabs = [
    { id: 'admin', label: 'Admin', icon: Shield },
  ] as const;

  const tabs = isAdmin ? [...baseTabs, ...adminTabs] : baseTabs;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'printers':
        return <PrintersTab />;
      case 'filaments':
        return <FilamentsTab />;
      case 'accessories':
        return <AccessoriesTab />;
      case 'packaging':
        return <PackagingTab />;
      case 'categories':
        return <CategoriesTab />;
      case 'history':
        return <HistoryTab />;
      case 'reports':
        return <ReportsTab />;
      case 'company':
        return <CompanySettingsTab />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <PrintersTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastros e Estoque</h2>
        <p className="text-gray-600">Gerencie impressoras, filamentos, acessórios e relatórios</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CadastrosPage;