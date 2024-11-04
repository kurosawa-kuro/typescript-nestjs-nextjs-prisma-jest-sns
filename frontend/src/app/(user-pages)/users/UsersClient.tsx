'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UserDetails } from '@/types/user';
import { useUserStore } from '@/store/userStore';
import { followUser, unfollowUser } from '@/app/actions/users';

interface UsersClientProps {
  initialUsers: UserDetails[];
  initialPage: number;
  totalUsers: number;
  usersPerPage: number;
}

export default function UsersClient({ initialUsers, initialPage, totalUsers, usersPerPage }: UsersClientProps) {
  const { users, setUsers } = useUserStore();
  const [currentPage, setCurrentPage] = useState(initialPage);
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers, setUsers]);

  const handleFollowUser = async (userId: number) => {
    try {
      const updatedUsers = await followUser(userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  const handleUnfollowUser = async (userId: number) => {
    try {
      const updatedUsers = await unfollowUser(userId);
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avatar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.profile?.avatarPath ? (
                    <Image
                      src={`http://localhost:3001/uploads/${user.profile.avatarPath}`}
                      alt={`${user.name}'s avatar`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 text-sm">{user.name.charAt(0)}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/users/${user.id}`} className="text-blue-600 hover:text-blue-900">
                    {user.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.userRoles.includes('admin') ? 'Admin' : 'User'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.isFollowing ? (
                    <button
                      onClick={() => handleUnfollowUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Unfollow
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollowUser(user.id)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Follow
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ページャー (修正後) */}
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            {currentPage > 1 && (
              <Link href={`/users?page=${currentPage - 1}`} className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/users?page=${page}`}
                className={`px-4 py-2 bg-white border border-gray-300 text-sm font-medium ${
                  currentPage === page ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            ))}
            {currentPage < totalPages && (
              <Link href={`/users?page=${currentPage + 1}`} className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
