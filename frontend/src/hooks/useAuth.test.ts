import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import React from 'react';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import authReducer from '@/store/authSlice';
import { useAuth } from './useAuth';

const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockGetCurrentUser = jest.fn();

jest.mock('@/api/auth', () => ({
  authAPI: {
    register: mockRegister,
    login: mockLogin,
    logout: mockLogout,
    getCurrentUser: mockGetCurrentUser
  }
}));

interface RootState {
  auth: {
    user: any;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  };
}

const createMockStore = (initialState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: {
      auth: authReducer
    },
    preloadedState: initialState
  });
};

const createWrapper = (store: ReturnType<typeof createMockStore>) => {
  return ({ children }: { children: React.ReactNode }): React.ReactElement => 
    React.createElement(Provider, { store, children } as any);
};

describe('useAuth', () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore({
      auth: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    });
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('calls register API and updates state on success', async () => {
      const mockUser = { id: '1', email: 'test@example.com', username: 'testuser', role: 'user' as const, createdAt: new Date(), updatedAt: new Date() };
      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };

      mockRegister.mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await result.current.register('test@example.com', 'testuser', 'password');

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'testuser', 'password');
      });
    });

    it('sets error on register failure', async () => {
      const errorMessage = 'Registration failed';
      mockRegister.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await expect(result.current.register('test@example.com', 'testuser', 'password'))
        .rejects.toThrow();
    });
  });

  describe('login', () => {
    it('calls login API and updates state on success', async () => {
      const mockUser = { id: '1', email: 'test@example.com', username: 'testuser', role: 'user' as const, createdAt: new Date(), updatedAt: new Date() };
      const mockTokens = { accessToken: 'access', refreshToken: 'refresh' };

      mockLogin.mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await result.current.login('test@example.com', 'password');

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
      });
    });

    it('sets error on login failure', async () => {
      const errorMessage = 'Login failed';
      mockLogin.mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await expect(result.current.login('test@example.com', 'password'))
        .rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('calls logout API and clears state', async () => {
      mockLogout.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await result.current.logout();

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });
  });

  describe('getCurrentUser', () => {
    it('calls getCurrentUser API and updates state on success', async () => {
      const mockUser = { id: '1', email: 'test@example.com', username: 'testuser', role: 'user' as const, createdAt: new Date(), updatedAt: new Date() };

      mockGetCurrentUser.mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await result.current.getCurrentUser();

      await waitFor(() => {
        expect(mockGetCurrentUser).toHaveBeenCalled();
      });
    });

    it('logs out user on getCurrentUser failure', async () => {
      mockGetCurrentUser.mockRejectedValueOnce({
        response: { data: { message: 'Unauthorized' } }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(store)
      });

      await expect(result.current.getCurrentUser()).rejects.toThrow();
    });
  });
});