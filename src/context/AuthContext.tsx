function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        currentUser: action.payload,
      };

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUser: null,
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
          [key]: { password: action.payload.password, user: newUser },
        },
      };
    }

    case 'LOAD_USERS':
      return {
        ...state,
        users: action.payload,
      };

    case 'UPDATE_USER': {
      const { usernameKey, user, password } = action.payload;
      // se a chave ainda não existe, preserva estado para não quebrar
      const current = state.users[usernameKey];
      if (!current) {
        return state;
      }
      return {
        ...state,
        users: {
          ...state.users,
          [usernameKey]: {
            password: password ?? current.password,
            user,
          },
        },
        currentUser: state.currentUser?.id === user.id ? user : state.currentUser,
      };
    }

    case 'SUSPEND_USER': {
      const { userId, suspended } = action.payload;
      const updatedUsers = { ...state.users };

      // encontrar o usuário pelo ID e atualizar
      for (const key in updatedUsers) {
        if (updatedUsers[key].user.id === userId) {
          updatedUsers[key] = {
            ...updatedUsers[key],
            user: { ...updatedUsers[key].user, suspended },
          };
          break;
        }
      }

      const shouldLogout = state.currentUser?.id === userId && suspended;

      return {
        ...state,
        users: updatedUsers,
        isAuthenticated: shouldLogout ? false : state.isAuthenticated,
        currentUser: shouldLogout ? null : state.currentUser,
      };
    }

    default:
      return state;
  }
}
