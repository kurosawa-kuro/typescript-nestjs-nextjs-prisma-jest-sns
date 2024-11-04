import { useState } from 'react';
import { UserDetails } from '@/types/user';
import { ClientSideApiService } from '@/services/ClientSideApiService';

export function useUserProfileUpdate(
  user: UserDetails | null,
  onSuccess: (message: string) => void,
  onError: (message: string) => void,
) {
  const [isLoading, setIsLoading] = useState(false);

  const updateUserProfile = async (updatedFields: Partial<UserDetails>): Promise<UserDetails | null> => {
    if (!user) return null;
    setIsLoading(true);
    try {
      const updatedUser = await ClientSideApiService.updateUserProfile(user.id, updatedFields);
      onSuccess('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      onError('Failed to update profile');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserProfile,
    isLoading
  };
}
