'use client';

import Image from 'next/image';
import Link from 'next/link';
import { UserDetails } from '@/types/user';

interface FollowersListProps {
  followers: UserDetails[];
}

export default function FollowersList({ followers }: FollowersListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {followers.map((follower) => (
        <div key={follower.id} className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <Image
              src={`http://localhost:3001/uploads/${follower.profile?.avatarPath}`}
              alt={`${follower.name}'s avatar`}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="flex-grow">
              <Link href={`/users/${follower.id}`} className="text-lg font-semibold hover:underline">
                {follower.name}
              </Link>
              <p className="text-sm text-gray-500">{follower.email}</p>
              <p className="text-xs text-gray-400">User ID: {follower.id}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
