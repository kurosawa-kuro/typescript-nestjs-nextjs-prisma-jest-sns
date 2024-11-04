'use client';
import { useState, useEffect } from 'react';
import { UserDetails } from '@/types/user';
import { useUserStore } from '@/store/userStore';
import { UserTableHeader } from './components/UserTableHeader';
import { UserTableRow } from './components/UserTableRow';
import RoleChangeModal from './RoleChangeModal';
import { ClientSideApiService } from '@/services/ClientSideApiService';

interface UsersClientProps {
  initialUsers: UserDetails[];
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const { users, setUsers } = useUserStore();
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers, setUsers]);

  const handleOpenModal = (user: UserDetails) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await ClientSideApiService.exportUsers();
    } catch (error) {
      console.error('Error exporting users:', error);
      // エラー通知を表示する場合はここに追加
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative flex justify-center mb-6">
          <h1 className="text-3xl font-bold">Users</h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Exporting...
                </span>
              ) : (
                'Export Users'
              )}
            </button>
          </div>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <UserTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user: UserDetails) => (
              <UserTableRow
                key={user.id}
                user={user}
                onChangeRole={handleOpenModal}
              />
            ))}
          </tbody>
        </table>
        {selectedUser && (
          <RoleChangeModal
            user={selectedUser}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}
