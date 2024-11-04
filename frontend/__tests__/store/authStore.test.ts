import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../../src/store/authStore';
import { ClientSideApiService } from '../../src/services/clientSideApiService';
import { useFlashMessageStore } from '../../src/store/flashMessageStore';
import { UserDetails } from '@/types/user';
import * as usersActions from '@/app/actions/users';

// モックの設定
jest.mock('../../src/services/ClientSideApiService');
jest.mock('../../src/store/flashMessageStore', () => ({
  useFlashMessageStore: {
    getState: jest.fn(() => ({
      setFlashMessage: jest.fn(),
    })),
  },
}));

jest.mock('@/app/actions/users', () => ({
  getUserDetails: jest.fn(),
}));

describe('useAuthStore', () => {
  const mockUser: UserDetails = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAuthStore.getState().resetStore();
    });
    (useFlashMessageStore.getState as jest.Mock).mockReturnValue({
      setFlashMessage: jest.fn(),
    });
  });

  const renderAuthHook = () => renderHook(() => useAuthStore());

  it('should initialize with default state', () => {
    const { result } = renderAuthHook();
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('login', () => {
    it('should update state on successful login', async () => {
      const mockResponse = { user: mockUser, token: 'test-token' };
      (ClientSideApiService.login as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderAuthHook();

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(useFlashMessageStore.getState().setFlashMessage).toHaveBeenCalledWith('Login successful!');
    });

    it('should update state on failed login', async () => {
      (ClientSideApiService.login as jest.Mock).mockRejectedValue(new Error('Login failed'));

      const { result } = renderAuthHook();

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Login failed');
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      act(() => {
        useAuthStore.setState({ user: mockUser });
      });
    });

    it('should clear state and redirect on successful logout', async () => {
      const { result } = renderAuthHook();

      const originalLocation = window.location;
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(ClientSideApiService.logout).toHaveBeenCalled();
      expect(useFlashMessageStore.getState().setFlashMessage).toHaveBeenCalledWith('Logged out successfully');
      expect(window.location.href).toBe('/');

      Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
    });

    it('should handle logout error', async () => {
      const { result } = renderAuthHook();

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (ClientSideApiService.logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));

      await act(async () => {
        await result.current.logout();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      expect(result.current.user).not.toBeNull();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('state updates', () => {
    it('should update user state', () => {
      const { result } = renderAuthHook();

      act(() => {
        useAuthStore.setState({ user: mockUser });
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it('should update loading state', () => {
      const { result } = renderAuthHook();

      act(() => {
        useAuthStore.setState({ isLoading: true });
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should update error state', () => {
      const { result } = renderAuthHook();

      act(() => {
        useAuthStore.setState({ error: 'Test error' });
      });

      expect(result.current.error).toBe('Test error');
    });
  });
});
