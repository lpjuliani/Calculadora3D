import React, { createContext, useContext, useReducer, useEffect } from 'react';

function slugFromEmail(email: string) {
  return email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function pickUniqueUsername(base: string, users: Record<string, { password: string; user: User }>) {
  let candidate = base || 'user';
  let i = 1;
  while (users[candidate]) {
    candidate = `${base}${i++}`;
  }
  return candidate;
}

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role: 'admin' | 'user';
  lastLoginAt?: string;
  suspended?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: Record<string, { password: string; user: User }>;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'CREATE_USER'; payload: { username: string; email: string; password: string; role?: 'admin'|'user' } }
  | { type: 'LOAD_USERS'; payload: Record<string, { password: string; user: User }> }
  | { type: 'UPDATE_USER'; payload: { usernameKey: string; user: User; password?: string } }
  | { type: 'SUSPEND_USER'; payload: { userId: string; suspended: boolean } };

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  users: {}
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null
      };
    case 'CREATE_USER': {
      const newUser: User = {
        id: Date.now().toString(),
        username: action.payload.username,
        email: action.payload.email,
        createdAt: new Date().toISOString(),
        role: action.payload.role ?? 'user',
      };
      const key = action.payload.username.toLowerCase();
      return {
        ...state,
        users: {
          ...state.users,
          [key]: { password: action.payload.password, user: newUser }
        }
      };
    }
    case 'LOAD_USERS':
      return {
        ...state,
        users: action.payload
      };
    default:
    case 'UPDATE_USER': {
      const { usernameKey, user, password } = action.payload;
      return {
        ...state,
        users: {
          ...state.users,
          [usernameKey]: {
            password: password ?? state.users[usernameKey].password,
            user
          }
        },
        currentUser: state.currentUser?.id === user.id ? user : state.currentUser
      };
    }
    case 'SUSPEND_USER': {
      const { userId, suspended } = action.payload;
      const updatedUsers = { ...state.users };
      
      // Encontrar o usuário pelo ID
      for (const key in updatedUsers) {
        if (updatedUsers[key].user.id === userId) {
          updatedUsers[key] = {
            ...updatedUsers[key],
            user: { ...updatedUsers[key].user, suspended }
          };
          break;
        }
      }
      
      // Se o usuário suspenso é o atual, fazer logout
      const shouldLogout = state.currentUser?.id === userId && suspended;
      
      return {
        ...state,
        users: updatedUsers,
        isAuthenticated: shouldLogout ? false : state.isAuthenticated,
        currentUser: shouldLogout ? null : state.currentUser
      };
    }
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  createUser: (data: {email: string; password: string; role?: 'admin'|'user'; username?: string}) => boolean;
  updateProfile: (data: { username?: string; email?: string; newPassword?: string }) => { ok: boolean; reason?: string };
  suspendUser: (userId: string, suspended: boolean) => boolean;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // CRÍTICO: Carregar dados existentes PRIMEIRO, sem sobrescrever
    console.log('🔍 Carregando dados de usuários...');
    
    // 1) Carregar mapa salvo (NUNCA sobrescrever se existir)
    const savedUsersRaw = localStorage.getItem('3d-printing-users');
    let usersMap: Record<string, { password: string; user: User }> = {};

    if (savedUsersRaw) {
      try {
        const loaded = JSON.parse(savedUsersRaw) as typeof usersMap;
        console.log('📂 Usuários encontrados no localStorage:', Object.keys(loaded));

        // MIGRAÇÃO SEGURA: preservar dados existentes
        for (const k of Object.keys(loaded)) {
          const entry = loaded[k];
          if (entry && entry.user) {
            const keyLower = (entry.user.username || k).toLowerCase();
            const role = entry.user.role || 'user'; // legacy -> user
            usersMap[keyLower] = {
              password: entry.password,
              user: { ...entry.user, role } as User,
            };
          }
        }
        console.log('✅ Usuários migrados:', Object.keys(usersMap));
      } catch (e) {
        console.error('❌ Erro lendo usuários (mantendo dados existentes):', e);
        // NÃO limpar em caso de erro - manter o que tem
      }
    } else {
      console.log('📝 Nenhum usuário encontrado - primeira execução');
    }

    // 2) APENAS criar admin se NÃO existir nenhum admin
    const hasAdmin = Object.values(usersMap).some(u => u.user.role === 'admin');
    console.log('👑 Admin existe?', hasAdmin);

    if (!hasAdmin) {
      const adminUser = import.meta.env.VITE_ADMIN_USER || 'admin';
      const adminPass = import.meta.env.VITE_ADMIN_PASS || 'admin123';
      const adminKey = adminUser.toLowerCase();

      // APENAS adicionar se não existir
      if (!usersMap[adminKey]) {
        usersMap[adminKey] = {
          password: adminPass,
          user: {
            id: Date.now().toString(),
            username: adminUser,
            email: 'admin@local',
            createdAt: new Date().toISOString(),
            role: 'admin',
          },
        };
        console.log('🔧 Admin criado:', adminUser);
      }
    }

    // 3) SALVAR apenas se houve mudanças (não sobrescrever desnecessariamente)
    const currentSaved = localStorage.getItem('3d-printing-users');
    const newSaved = JSON.stringify(usersMap);
    
    if (currentSaved !== newSaved) {
      localStorage.setItem('3d-printing-users', newSaved);
      console.log('💾 Dados de usuários salvos');
    }
    
    dispatch({ type: 'LOAD_USERS', payload: usersMap });
    console.log('📊 Estado atualizado com', Object.keys(usersMap).length, 'usuários');

    // 4) Restaurar usuário atual (se houver)
    const savedCurrentUser = localStorage.getItem('3d-printing-current-user');
    if (savedCurrentUser) {
      try {
        const user = JSON.parse(savedCurrentUser) as User;
        // MIGRA: se vier sem role, define 'user'
        const userWithRole = { ...user, role: user.role ?? 'user' as const };
        dispatch({ type: 'LOGIN', payload: userWithRole });
        console.log('👤 Usuário atual restaurado:', userWithRole.username);
      } catch (e) {
        console.error('❌ Erro carregando usuário atual:', e);
      }
    }
  }, []);

  useEffect(() => {
    // CRÍTICO: Só salvar se realmente houver usuários para não sobrescrever
    if (Object.keys(state.users).length > 0) {
      localStorage.setItem('3d-printing-users', JSON.stringify(state.users));
      console.log('💾 Usuários salvos:', Object.keys(state.users));
    } else {
      console.warn('⚠️ Tentativa de salvar estado vazio - ignorando para preservar dados');
    }
  }, [state.users]);

  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('3d-printing-current-user', JSON.stringify(state.currentUser));
    } else {
      localStorage.removeItem('3d-printing-current-user');
    }
  }, [state.currentUser]);

  const login = (username: string, password: string): boolean => {
    const id = username.trim().toLowerCase();

    // 1) tentar por username
    let userData = state.users[id];

    // 2) se não achou, procurar por e-mail
    if (!userData) {
      const byEmail = Object.values(state.users).find(
        u => u.user.email?.toLowerCase() === id
      );
      if (byEmail) userData = byEmail;
    }

    console.log('🔍 Tentativa de login:', { identifier: username, userExists: !!userData });
    console.log('👥 Usuários disponíveis:', Object.keys(state.users));
    if (userData && userData.password === password && !userData.user.suspended) {
      const now = new Date().toISOString();
      const key = userData.user.username.toLowerCase();
      const updatedUser: User = { ...userData.user, lastLoginAt: now };
      
      dispatch({ type: 'UPDATE_USER', payload: { usernameKey: key, user: updatedUser } });
      dispatch({ type: 'LOGIN', payload: updatedUser });
      console.log('✅ Login bem-sucedido:', userData.user);
      return true;
    } else if (userData && userData.user.suspended) {
      console.log('🚫 Login negado - usuário suspenso');
    }
    console.log('❌ Login falhou');
    return false;
  };

  const createUser = (data: {email: string; password: string; role?: 'admin'|'user'; username?: string}): boolean => {
    if (!state.currentUser || state.currentUser.role !== 'admin') return false;

    const email = data.email.trim();
    const role = data.role ?? 'user';

    // verificar duplicidade de e-mail
    const existsByEmail = Object.values(state.users).some(
      u => u.user.email?.toLowerCase() === email.toLowerCase()
    );
    if (existsByEmail) return false;

    // gerar/validar username único (chave do mapa)
    const base = (data.username?.trim().toLowerCase()) || slugFromEmail(email);
    const username = pickUniqueUsername(base, state.users);

    // criar user
    dispatch({
      type: 'CREATE_USER',
      payload: { username, email, password: data.password, role }
    });
    return true;
  };

  const updateProfile = (data: { username?: string; email?: string; newPassword?: string }): { ok: boolean; reason?: string } => {
    const me = state.currentUser;
    if (!me) return { ok: false, reason: 'not-authenticated' };

    // checar e-mail duplicado (exceto o meu)
    if (data.email) {
      const dup = Object.values(state.users).some(u => u.user.email.toLowerCase() === data.email!.toLowerCase() && u.user.id !== me.id);
      if (dup) return { ok: false, reason: 'email-taken' };
    }

    // se o username mudou, precisamos mover a entrada de chave
    const oldKey = me.username.toLowerCase();
    const newUsername = (data.username?.trim() || me.username);
    const newKey = newUsername.toLowerCase();

    // se for mudar username, garantir que não exista outro com essa chave
    if (newKey !== oldKey && state.users[newKey]) {
      return { ok: false, reason: 'username-taken' };
    }

    // monta novo user
    const newUser: User = { ...me, username: newUsername, email: data.email ?? me.email };

    // aplica no mapa (movendo chave se necessário)
    let users = { ...state.users };
    const currentPwd = users[oldKey].password;
    delete users[oldKey];
    users[newKey] = { password: data.newPassword ?? currentPwd, user: newUser };

    // persiste no estado
    dispatch({ type: 'LOAD_USERS', payload: users });
    dispatch({ type: 'LOGIN', payload: newUser }); // mantém sessão com novo perfil

    return { ok: true };
  };

  const suspendUser = (userId: string, suspended: boolean): boolean => {
    if (!state.currentUser || state.currentUser.role !== 'admin') return false;
    
    // Não permitir suspender a si mesmo
    if (state.currentUser.id === userId) return false;
    
    dispatch({ type: 'SUSPEND_USER', payload: { userId, suspended } });
    return true;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  return (
    <AuthContext.Provider value={{ state, dispatch, login, logout, createUser, updateProfile, suspendUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export type { User };