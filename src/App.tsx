import React, { useState, useEffect } from 'react';
import { Calculator, Database, FileText, BarChart3, LogOut, User } from 'lucide-react';
import MainPage from './components/MainPage';
import CadastrosPage from './components/CadastrosPage';
import LoginPage from './components/LoginPage';
import ProfileModal from './components/ProfileModal';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'main' | 'cadastros'>('main');
  const [profileOpen, setProfileOpen] = useState(false);

  if (!authState.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  Calculadora 3D Pro
                </h1>
              </div>
              
              {/* Navigation */}
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage('main')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'main'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Nova Impressão</span>
                  </div>
                </button>
                <button
                  onClick={() => setCurrentPage('cadastros')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 'cadastros'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Cadastros e Estoque</span>
                  </div>
                </button>
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{authState.currentUser?.username}</span>
                </div>
                <button
                onClick={() => setProfileOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Perfil</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentPage === 'main' ? <MainPage /> : <CadastrosPage />}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()}{' '}
              <a 
                href="https://www.instagram.com/stratta3d/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Stratta3D
              </a>
              {' · v1.0 · eficiência em cada camada'}
            </div>
          </div>
        </footer>
      </div>
      
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </AppProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;