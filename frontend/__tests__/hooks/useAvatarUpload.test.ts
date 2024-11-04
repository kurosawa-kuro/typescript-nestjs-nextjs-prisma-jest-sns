import { renderHook, act } from '@testing-library/react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { ClientSideApiService } from '@/services/clientSideApiService';
import { useUserProfileStore } from '@/store/userProfileStore';
import { UserDetails } from '@/types/user';

// ClientSideApiServiceのモック
jest.mock('@/services/ClientSideApiService', () => ({
  ClientSideApiService: {
    updateAvatar: jest.fn(),
  },
}));

describe('useAvatarUpload', () => {
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    profile: {
      avatarPath: '/path/to/avatar.jpg',
    }
  };

  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useUserProfileStore.setState({ user: mockUser as UserDetails });
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  it('should initialize with correct refs and handlers', () => {
    const { result } = renderHook(() => useAvatarUpload(mockOnSuccess, mockOnError));

    expect(result.current.fileInputRef.current).toBe(null);
    expect(typeof result.current.handleAvatarClick).toBe('function');
    expect(typeof result.current.handleAvatarChange).toBe('function');
  });

  it('should handle avatar click by triggering file input click', () => {
    const { result } = renderHook(() => useAvatarUpload(mockOnSuccess, mockOnError));
    const mockClick = jest.fn();

    // Cast to MutableRefObject to allow assignment
    (result.current.fileInputRef as React.MutableRefObject<HTMLInputElement>).current = {
      click: mockClick,
    } as unknown as HTMLInputElement;

    act(() => {
      result.current.handleAvatarClick();
    });

    expect(mockClick).toHaveBeenCalled();
  });

  it('should handle successful avatar upload', async () => {
    const { result } = renderHook(() => useAvatarUpload(mockOnSuccess, mockOnError));
    const updatedUser = { ...mockUser, profile: { ...mockUser.profile, avatarPath: '/new/avatar.jpg' }};
    
    (ClientSideApiService.updateAvatar as jest.Mock).mockResolvedValueOnce(updatedUser);

    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleAvatarChange(mockEvent);
    });

    expect(ClientSideApiService.updateAvatar).toHaveBeenCalledWith(mockUser.id, expect.any(FormData));
    expect(mockOnSuccess).toHaveBeenCalledWith('Avatar updated successfully');
    expect(useUserProfileStore.getState().user).toEqual(updatedUser);
  });

  it('should handle avatar upload failure', async () => {
    const { result } = renderHook(() => useAvatarUpload(mockOnSuccess, mockOnError));
    const mockError = new Error('Upload failed');
    
    (ClientSideApiService.updateAvatar as jest.Mock).mockRejectedValueOnce(mockError);

    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleAvatarChange(mockEvent);
    });

    expect(mockOnError).toHaveBeenCalledWith('Failed to update avatar');
  });

  it('should do nothing when no file is selected', async () => {
    const { result } = renderHook(() => useAvatarUpload(mockOnSuccess, mockOnError));
    
    const mockEvent = {
      target: {
        files: [],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleAvatarChange(mockEvent);
    });

    expect(ClientSideApiService.updateAvatar).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it('should do nothing when user is null', async () => {
    useUserProfileStore.setState({ user: null });
    const { result } = renderHook(() => useAvatarUpload(mockOnSuccess, mockOnError));
    
    const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    await act(async () => {
      await result.current.handleAvatarChange(mockEvent);
    });

    expect(ClientSideApiService.updateAvatar).not.toHaveBeenCalled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnError).not.toHaveBeenCalled();
  });
});
