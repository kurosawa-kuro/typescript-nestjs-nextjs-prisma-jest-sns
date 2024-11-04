import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientSideApiService } from '@/services/ClientSideApiService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

type FollowButtonProps = {
  userId: number;
  isFollowing: boolean;
};

export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState(isFollowing);
  const router = useRouter();

  const handleFollowAction = async () => {
    try {
      setLoading(true);
      await (followStatus 
        ? ClientSideApiService.unfollowUser(userId)
        : ClientSideApiService.followUser(userId));
      
      setFollowStatus(!followStatus);
      router.refresh();
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowAction}
      disabled={loading}
      className={`w-full mt-4 py-2 px-4 rounded-md text-white transition-colors duration-200 
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${followStatus ? 'bg-rose-400 hover:bg-rose-500' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2">{followStatus ? 'Unfollowing...' : 'Following...'}</span>
        </span>
      ) : (
        followStatus ? 'Unfollow' : 'Follow'
      )}
    </button>
  );
} 