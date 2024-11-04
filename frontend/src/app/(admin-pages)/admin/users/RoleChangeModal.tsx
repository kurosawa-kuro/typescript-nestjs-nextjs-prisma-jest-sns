import React, { useState, useEffect } from 'react';
import { Role, UserDetails } from '@/types/user';
import { ApiClient } from '@/services/apiClient';
import { useUserStore } from '@/store/userStore';

interface RoleChangeModalProps {
  user: UserDetails;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleChangeModal({ user, isOpen, onClose }: RoleChangeModalProps) {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.userRoles);
  const { updateUser } = useUserStore();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await ApiClient.get<Role[]>('/users/available-roles');
        
        setAvailableRoles(roles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      }
    };
    
    if (isOpen) {
      fetchRoles();
      setSelectedRoles(user.userRoles);
    }
  }, [isOpen, user.userRoles]);

  const handleRoleToggle = (roleName: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleName)
        ? prev.filter(r => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSave = async () => {
    try {
      const rolesToAdd = selectedRoles.filter(role => !user.userRoles.includes(role));
      const rolesToRemove = user.userRoles.filter(role => !selectedRoles.includes(role));

      if (rolesToAdd.length > 0) {
        await ApiClient.put(`/users/${user.id}/roles`, {
          roles: rolesToAdd,
          action: 'add'
        });
      }

      if (rolesToRemove.length > 0) {
        await ApiClient.put(`/users/${user.id}/roles`, {
          roles: rolesToRemove,
          action: 'remove'
        });
      }

      // 更新されたユーザー情報を取得
      const updatedUser = await ApiClient.get<UserDetails>(`/users/${user.id}`);
      updateUser(updatedUser);
      onClose();
    } catch (error) {
      console.error('Failed to update user roles:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Change Roles for {user.name}</h2>
        <div className="mb-4">
          {availableRoles.length > 0 ? (
            availableRoles.map(role => (
              <div key={role.id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.name)}
                  onChange={() => handleRoleToggle(role.name)}
                  className="h-4 w-4"
                />
                <label htmlFor={`role-${role.id}`} className="flex flex-col">
                  <span className="font-medium">{role.name}</span>
                  <span className="text-sm text-gray-500">{role.description}</span>
                </label>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Loading roles...</div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
