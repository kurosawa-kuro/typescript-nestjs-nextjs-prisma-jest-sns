import { UserDetails } from '@/types/user';

interface ProfileDisplayProps {
  user: UserDetails;
  handleEdit: () => void;
  showEditButton: boolean;
}

export function ProfileDisplay({ user, handleEdit, showEditButton }: ProfileDisplayProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-gray-600">Name:</label>
        <p className="font-medium">{user.name}</p>
      </div>
      <div>
        <label className="text-gray-600">Email:</label>
        <p className="font-medium">{user.email}</p>
      </div>
      {showEditButton && (
        <button
          onClick={handleEdit}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Edit Profile
        </button>
      )}
    </div>
  );
} 