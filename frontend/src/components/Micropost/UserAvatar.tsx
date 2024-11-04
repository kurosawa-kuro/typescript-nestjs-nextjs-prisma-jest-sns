import Image from 'next/image';
import { UserInfo } from '@/types/user';

interface UserAvatarProps {
  user: Pick<UserInfo, 'id' | 'name'> & { 
    profile: { avatarPath?: string }
  };
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return (
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
        {user.profile?.avatarPath && (
          <Image
            src={`${apiUrl}/uploads/${user.profile.avatarPath}`}
            alt={user.name}
            width={40}
            height={40}
            className="object-cover"
          />
        )}
      </div>
      <span className="text-gray-700">{user.name}</span>
    </div>
  );
};

export default UserAvatar; 