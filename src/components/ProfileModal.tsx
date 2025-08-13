import React, { useState } from 'react';
import { User, Mail, Lock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { state: auth, updateProfile } = useAuth();
  const me = auth.currentUser!;
  const [username, setUsername] = useState(me.username);
  const [email, setEmail] = useState(me.email);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  if (!open) return null;

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    
    const { ok, reason } = updateProfile({
      username: username.trim() === me.username ? undefined : username.trim(),
      email: email.trim() === me.email ? undefined : email.trim(),
      newPassword: newPassword || undefined
    });
    
    if (ok) {
      setMsg('Dados atualizados com sucesso.');
      setMsgType('success');
      setNewPassword('');
      setTimeout(onClose, 1000);
    } else {
      const map: Record<string, string> = {
        'email-taken': 'Este e-mail já está em uso.',
        'username-taken': 'Este usuário já existe.',
        'not-authenticated': 'Sessão expirada.'
      };
      setMsg(map[reason!] ?? 'Não foi possível atualizar.');
      setMsgType('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-500" />
              <span>Meu Perfil</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form className="space-y-4" onSubmit={onSave}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Nome de Usuário
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                E-mail
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Nova Senha (opcional)
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
              />
            </div>

            {msg && (
              <div className={`p-3 rounded-lg ${
                msgType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <p className="text-sm">{msg}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;