import Image from 'next/image';
import { UserDetails } from '@/types/user';
import { RoleBadge } from './RoleBadge';

interface UserTableRowProps {
  user: UserDetails;
  onChangeRole: (user: UserDetails) => void;
}

export function UserTableRow({ user, onChangeRole }: UserTableRowProps) {
  return (
    <tr key={user.id}>
      <td className="w-16 px-6 py-4 whitespace-nowrap">
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
      <td className="w-16 px-6 py-4 whitespace-nowrap">{user.id}</td>
      <td className="w-40 px-6 py-4 whitespace-nowrap">{user.name}</td>
      <td className="w-52 px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis">{user.email}</td>
      <td className="w-40 px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-1">
          {user.userRoles.map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </td>
      <td className="w-32 px-6 py-4 whitespace-nowrap">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="w-24 px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onChangeRole(user)}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Change Role
        </button>
      </td>
    </tr>
  );
} 