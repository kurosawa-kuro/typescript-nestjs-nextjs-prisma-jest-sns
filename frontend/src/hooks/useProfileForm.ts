import { useState } from 'react';
import { UserDetails } from '@/types/user';
import { useUserProfileUpdate } from './useUserProfileUpdate';
import { useUserProfileStore } from '@/store/UserProfileStore';

export function useProfileForm(user: UserDetails | null, setFlashMessage: (message: string | null) => void) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const { updateUser } = useUserProfileStore();
  
  const { updateUserProfile } = useUserProfileUpdate(
    user,
    setFlashMessage,
    setFlashMessage
  );

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
  };

  const handleSave = async () => {
    const updatedUser = await updateUserProfile({ name: editedName, email: editedEmail });
    if (updatedUser) {
      updateUser(updatedUser);
      setIsEditing(false);
      setFlashMessage('User profile updated successfully');
    }
  };

  const handleCancel = () => {
    setEditedName(user?.name || '');
    setEditedEmail(user?.email || '');
    setIsEditing(false);
  };

  return {
    isEditing,
    editedName,
    editedEmail,
    setEditedName,
    setEditedEmail,
    handleEdit,
    handleSave,
    handleCancel,
  };
} 