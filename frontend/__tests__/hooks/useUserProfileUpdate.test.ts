import { renderHook, act } from '@testing-library/react';
import { useUserProfileUpdate } from '@/hooks/useUserProfileUpdate';
import { ClientSideApiService } from '@/services/clientSideApiService';
import { UserDetails } from '@/types/user';

jest.mock('@/services/ClientSideApiService', () => ({
  ClientSideApiService: {
    updateUserProfile: jest.fn(),
  },
}));

describe('useUserProfileUpdate', () => {
  const mockUser: UserDetails = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
    profile: {
      avatarPath: '/path/to/avatar.jpg',
    }
  };

  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  it('should initialize with isLoading as false', () => {
    const { result } = renderHook(() => 
      useUserProfileUpdate(mockUser, mockOnSuccess, mockOnError)
    );

    expect(result.current.isLoading).toBe(false);
  });

  it('should return null if user is null', async () => {
    const { result } = renderHook(() => 
      useUserProfileUpdate(null, mockOnSuccess, mockOnError)
    );

    const updatedFields = { name: 'New Name' };
    const response = await result.current.updateUserProfile(updatedFields);

    expect(response).toBeNull();
    expect(ClientSideApiService.updateUserProfile).not.toHaveBeenCalled();
  });

  it('should successfully update user profile', async () => {
    const { result } = renderHook(() => 
      useUserProfileUpdate(mockUser, mockOnSuccess, mockOnError)
    );

    const updatedFields = { name: 'New Name' };
    const updatedUser = { ...mockUser, ...updatedFields };
    
    (ClientSideApiService.updateUserProfile as jest.Mock).mockResolvedValueOnce(updatedUser);

    let response;
    await act(async () => {
      response = await result.current.updateUserProfile(updatedFields);
    });

    expect(result.current.isLoading).toBe(false);
    expect(response).toEqual(updatedUser);
    expect(ClientSideApiService.updateUserProfile).toHaveBeenCalledWith(mockUser.id, updatedFields);
    expect(mockOnSuccess).toHaveBeenCalledWith('Profile updated successfully');
  });

  it('should handle update failure', async () => {
    const { result } = renderHook(() => 
      useUserProfileUpdate(mockUser, mockOnSuccess, mockOnError)
    );

    const mockError = new Error('Update failed');
    const updatedFields = { name: 'New Name' };
    
    (ClientSideApiService.updateUserProfile as jest.Mock).mockRejectedValueOnce(mockError);

    let response;
    await act(async () => {
      response = await result.current.updateUserProfile(updatedFields);
    });

    expect(result.current.isLoading).toBe(false);
    expect(response).toBeNull();
    expect(mockOnError).toHaveBeenCalledWith('Failed to update profile');
  });
});
