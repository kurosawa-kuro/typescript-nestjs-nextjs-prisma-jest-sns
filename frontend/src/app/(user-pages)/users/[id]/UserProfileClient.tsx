'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserDetails } from '@/types/user';
import { useUserProfileStore } from '@/store/UserProfileStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import { ClientSideApiService } from '@/services/ClientSideApiService';
import { FiEye, FiHeart, FiMessageCircle, FiUsers } from "react-icons/fi";
import { Micropost } from '@/types/micropost';

// Add this custom hook at the top of the file
function useCurrentUser(): CurrentUser {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  useEffect(() => {
    const userData = document.cookie.split('; ')
      .find(row => row.startsWith('x-user-data='))
      ?.split('=')[1];
    if (userData) {
      setCurrentUser(JSON.parse(decodeURIComponent(userData)));
    }
  }, []);

  return currentUser;
}

// Add this type at the top of the file
type CurrentUser = { id: number } | null;

export default function UserProfileClient({ initialUserDetails }: { initialUserDetails: UserDetails & { microposts: Micropost[] } } ) {
  const { user, setUser } = useUserProfileStore();
  const router = useRouter();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (!initialUserDetails) {
      router.push('/login');
    } else {
      setUser(initialUserDetails);
    }
  }, [initialUserDetails, setUser, router]);

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="w-full">
          <div className="bg-gray-100 h-1 w-full" />
          
          {/* プロフィール情報 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="-mt-8 relative">
              {/* プロフィール画像 */}
              <div className="flex justify-between items-start">
                <div className="bg-white p-1 rounded-full inline-block">
                  <Image
                    src={`http://localhost:3001/uploads/${user.profile?.avatarPath}`}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full"
                  />
                </div>

                {/* シンプルなUnfollowボタン */}
                <button
                  className="px-4 py-2 rounded-md text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Unfollow
                </button>
              </div>

              {/* ユーザー情報 */}
              <div className="mt-4">
                <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>

              {/* フォロー情報 */}
              <div className="mt-4 flex space-x-6">
                <Link 
                  href={`/users/${user.id}/followers`} 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiUsers className="w-4 h-4" />
                  <span className="text-gray-500">Followers</span>
                </Link>
                <Link 
                  href={`/users/${user.id}/following`} 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiUsers className="w-4 h-4" />
                  <span className="text-gray-500">Following</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 投稿一覧 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Posts</h2>
            {/* 投稿カード */}
            <div className="grid grid-cols-3 gap-4">
              {initialUserDetails.microposts?.map((post) => (
                <div key={post.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <div className="aspect-square w-full max-w-[250px] relative mb-2">
                    <Image
                      src={`http://localhost:3001/uploads/${post.imagePath}`}
                      alt={post.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  
                  <h3 className="font-medium text-gray-900 text-sm">{post.title}</h3>
                  
                  {/* 統計情報 */}
                  <div className="mt-2 flex items-center justify-between text-gray-500 text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <FiEye className="w-4 h-4" />
                        <span>{post.viewsCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiHeart className="w-4 h-4" />
                        <span>{post.likesCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiMessageCircle className="w-4 h-4" />
                        <span>{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.categories?.map((category) => (
                      <span
                        key={category.id}
                        className="inline-block px-3 py-1.5 bg-blue-50 text-blue-600 text-xs rounded-md border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// FollowButtonコンポーネントを更新
function FollowButton({ userId, isFollowing }: { userId: number; isFollowing: boolean }) {
  const [loading, setLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState(isFollowing);
  const router = useRouter();

  const handleFollowAction = async () => {
    try {
      // setLoading(true);
      // if (followStatus) {
      //   await ClientSideApiService.unfollowUser(userId);
      // } else {
      //   await ClientSideApiService.followUser(userId);
      // }
      // setFollowStatus(!followStatus);
      // router.refresh(); // UIを更新
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
      className={`
        px-4 py-2 rounded-md text-sm transition-colors duration-200 flex items-center space-x-1
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${followStatus 
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
          : 'bg-blue-500 text-white hover:bg-blue-600'
        }
      `}
    >
      {loading ? (
        <div className="flex items-center space-x-1">
          <LoadingSpinner />
          <span>{followStatus ? 'Unfollowing...' : 'Following...'}</span>
        </div>
      ) : (
        <span>{followStatus ? 'Unfollow' : 'Follow'}</span>
      )}
    </button>
  );
}
