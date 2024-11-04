import { useRef } from 'react';
import { ClientSideApiService } from '@/services/ClientSideApiService';
import { useUserProfileStore } from '@/store/UserProfileStore';   

type MessageCallback = (message: string) => void;

export function useAvatarUpload(onSuccess: MessageCallback, onError: MessageCallback) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser } = useUserProfileStore();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const updatedUser = await ClientSideApiService.updateAvatar(user.id, formData);
      updateUser(updatedUser);
      onSuccess('Avatar updated successfully');
    } catch (error) {
      console.error('Error updating avatar:', error);
      onError('Failed to update avatar');
    }
  };

  return {
    fileInputRef,
    handleAvatarClick,
    handleAvatarChange
  };
}
