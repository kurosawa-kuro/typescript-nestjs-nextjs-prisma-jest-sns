'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserDetails } from '@/types/user';

interface FollowingListProps {
  following: UserDetails[];
}

export default function FollowingList({ following }: FollowingListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {following.map((user) => (
        <div key={user.id} className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Image
              src={`http://localhost:3001/uploads/${user.profile?.avatarPath}`}
              alt={`${user.name}'s avatar`}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="flex-grow">
              <Link href={`/users/${user.id}`} className="text-lg font-semibold hover:underline">
                {user.name}
              </Link>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">User ID: {user.id}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
