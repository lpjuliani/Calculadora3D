import React, { useState } from 'react';
import { Users, UserPlus, Shield, User as UserIcon, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminPanel: React.FC = () => {
  const { state: auth, createUser, suspendUser } = useAuth();
  const isAdmin = auth.currentUser?.role === 'admin';

  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    role: 'user' as 'user'|'admin' 
  });
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  if (!isAdmin) return null;

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setMessage('E-mail e senha são obrigatórios');
      setMessageType('error');
      return;
    }
    
    if (!email.includes('@')) {
      setMessage('Digite um e-mail válido');
      setMessageType('error');
      return;
    }

    if (password.length < 6) {
      setMessage('A senha deve ter pelo menos 6 caracteres');
      setMessageType('error');
      return;
    }

    const ok = createUser({ email, password, role: formData.role });
    if (ok) {
      setMessage('Acesso criado! O usuário poderá entrar usando o e-mail ou o usuário gerado.');
      setMessageType('success');
      setFormData({ email: '', password: '', role: 'user' });
    } else {
      setMessage('Não foi possível criar (e-mail já usado ou sem permissão).');
      setMessageType('error');
    }
  };

  const usersList = Object.values(auth.users).map(userData => userData.user);

  const handleSuspendUser = (userId: string, suspended: boolean) => {
    const success = suspendUser(userId, suspended);
    if (success) {
      setMessage(suspended ? 'Usuário suspenso com sucesso' : 'Usuário reativado com sucesso');
      setMessageType('success');
    } else {
      setMessage('Não foi possível alterar o status do usuário');
      setMessageType('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="w-6 h-6 text-red-500" />
        <h3 className="text-xl font-semibold text-gray-900">Painel Administrativo</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Criar Usuário */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-semibold text-gray-900">Criar Novo Usuário</h4>
          </div>
          
          <form onSubmit={handleCreateUser} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite a senha (mín. 6 caracteres)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Usuário
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'user'|'admin' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Criar Usuário
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-semibold text-gray-900">Usuários Cadastrados</h4>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {usersList.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum usuário cadastrado</p>
            ) : (
              usersList.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user.suspended ? 'bg-gray-100' : user.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {user.suspended ? (
                        <UserX className="w-4 h-4 text-gray-600" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-red-600" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${user.suspended ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {user.username}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.suspended
                            ? 'bg-gray-100 text-gray-600'
                            : user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.suspended ? 'Suspenso' : user.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {user.lastLoginAt ? `Último acesso: ${new Date(user.lastLoginAt).toLocaleString('pt-BR')}` : 'Nunca acessou'}
                      </p>
                    </div>
                    
                    {/* Botão de Suspender/Reativar (não mostrar para o próprio usuário) */}
                    {auth.currentUser?.id !== user.id && (
                      <button
                        onClick={() => handleSuspendUser(user.id, !user.suspended)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.suspended
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={user.suspended ? 'Reativar usuário' : 'Suspender usuário'}
                      >
                        {user.suspended ? (
                          <UserCheck className="w-4 h-4" />
                        ) : (
                          <UserX className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;