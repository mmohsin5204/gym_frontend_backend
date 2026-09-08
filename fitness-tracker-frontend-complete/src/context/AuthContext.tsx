import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { User, AuthResponse, UserPreferences } from '../types';
import { authApi, settingsApi, TOKEN_KEY, DEMO_MODE_KEY } from '../api/client';
import { useToast } from './ToastContext';
import { INITIAL_USER } from '../api/mockData';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAIL' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: false,
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_FAIL':
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (email: string, password?: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password?: string, profilePicture?: string) => Promise<AuthResponse>;
  loginDemo: () => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<User | null>;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  updateUserProfile: (data: Partial<User> & { password?: string }) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { info, error } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DEMO_MODE_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const user = await authApi.getProfile();
      dispatch({ type: 'UPDATE_USER', payload: user });
      return user;
    } catch (err) {
      console.error('Failed to refresh profile:', err);
      return null;
    }
  }, []);

  // Check auth session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        // If not logged in, but user has never visited or want instant preview demo:
        // we can either leave unauthenticated or let user log in with 1-click
        dispatch({ type: 'AUTH_FAIL' });
        return;
      }

      try {
        const user = await authApi.getProfile();
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token: storedToken },
        });
      } catch (err) {
        console.warn('Session verification failed, falling back or clearing token:', err);
        // Only restore session via mock data if the user explicitly opened demo mode
        if (localStorage.getItem(DEMO_MODE_KEY) === 'true') {
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user: INITIAL_USER, token: storedToken },
          });
        } else {
          localStorage.removeItem(TOKEN_KEY);
          dispatch({ type: 'AUTH_FAIL' });
        }
      }
    };

    initAuth();

    // Listen to token expiry event from Axios interceptor
    const handleAuthExpired = () => {
      logout();
      info('Session expired, please log in again.', 'Session Expired');
    };

    window.addEventListener('fittrack_auth_expired', handleAuthExpired);
    return () => {
      window.removeEventListener('fittrack_auth_expired', handleAuthExpired);
    };
  }, [info, logout]);

  // Apply dark/light theme class to document
  useEffect(() => {
    if (state.user?.preferences?.theme) {
      if (state.user.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [state.user?.preferences?.theme]);

  const login = async (email: string, password?: string): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });
    try {
      localStorage.removeItem(DEMO_MODE_KEY); // real login attempt, demo off
      const res = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, res.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: res.token,
          user: {
            _id: res._id,
            name: res.name,
            email: res.email,
            profilePicture: res.profilePicture,
            preferences: res.preferences || { unit: 'metric', theme: 'dark', notificationsEnabled: true },
          },
        },
      });
      return res;
    } catch (err) {
      dispatch({ type: 'AUTH_FAIL' });
      throw err;
    }
  };

  const loginDemo = async (): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });
    try {
      localStorage.setItem(DEMO_MODE_KEY, 'true');
      const res = await authApi.login({ email: 'alex.rivera@example.com', password: 'demo123456' });
      localStorage.setItem(TOKEN_KEY, res.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: res.token,
          user: {
            _id: res._id,
            name: res.name,
            email: res.email,
            profilePicture: res.profilePicture,
            preferences: res.preferences || { unit: 'metric', theme: 'dark', notificationsEnabled: true },
          },
        },
      });
      return res;
    } catch (err) {
      dispatch({ type: 'AUTH_FAIL' });
      throw err;
    }
  };

  const register = async (
    name: string,
    email: string,
    password?: string,
    profilePicture?: string
  ): Promise<AuthResponse> => {
    dispatch({ type: 'AUTH_START' });
    try {
      localStorage.removeItem(DEMO_MODE_KEY); // real register attempt, demo off
      const res = await authApi.register({ name, email, password, profilePicture });
      localStorage.setItem(TOKEN_KEY, res.token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: res.token,
          user: {
            _id: res._id,
            name: res.name,
            email: res.email,
            profilePicture: res.profilePicture,
            preferences: res.preferences || { unit: 'metric', theme: 'dark', notificationsEnabled: true },
          },
        },
      });
      return res;
    } catch (err) {
      dispatch({ type: 'AUTH_FAIL' });
      throw err;
    }
  };

  const updateUserPreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const updatedPrefs = await settingsApi.updateSettings(prefs);
      if (state.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: {
            ...state.user,
            preferences: updatedPrefs,
          },
        });
      }
    } catch (err) {
      error('Failed to update preferences');
      throw err;
    }
  };

  const updateUserProfile = async (data: Partial<User> & { password?: string }) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (err) {
      error('Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginDemo,
        logout,
        refreshProfile,
        updateUserPreferences,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
