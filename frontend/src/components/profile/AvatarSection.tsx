import Image from 'next/image';
import { UserDetails } from '@/types/user';

interface AvatarSectionProps {
  user: UserDetails;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  handleAvatarClick?: () => void;
  handleAvatarChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isEditable?: boolean;
}

export function AvatarSection({ 
  user, 
  fileInputRef, 
  handleAvatarClick, 
  handleAvatarChange,
  isEditable = false 
}: AvatarSectionProps) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-center relative">
      <div 
        className={`relative inline-block ${isEditable ? 'group cursor-pointer' : ''}`}
        onClick={isEditable ? handleAvatarClick : undefined}
      >
        <Image 
          src={`http://localhost:3001/uploads/${user.profile?.avatarPath}`}
          alt="User Avatar"
          width={120}
          height={120}
          className="rounded-full border-4 border-white mx-auto"
        />
        {isEditable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-white text-sm">Change Avatar</span>
          </div>
        )}
      </div>
      {isEditable && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />
      )}
    </div>
  );
}