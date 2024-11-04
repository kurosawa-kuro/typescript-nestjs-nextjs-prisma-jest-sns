'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserDetails } from '@/types/user';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import { useUserProfileStore } from '@/store/UserProfileStore';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { useProfileForm } from '@/hooks/useProfileForm';
import { AvatarSection } from '@/components/profile/AvatarSection';
import { EditForm } from '@/components/profile/EditForm';
import { FlashMessage } from '@/components/common/FlashMessage';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Link from 'next/link';
import { Micropost } from '@/types/micropost';
import Image from 'next/image';
import { FiEye, FiHeart, FiMessageCircle, FiCamera, FiEdit2, FiUsers } from "react-icons/fi";

interface UserProfileClientProps {
  initialUserDetails: UserDetails;
  initialMicroposts: Micropost[];
}

export default function UserProfileClient({ 
  initialUserDetails, 
  initialMicroposts 
}: UserProfileClientProps) {
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();
  const { user, setUser } = useUserProfileStore();
  const router = useRouter();

  const {
    isEditing,
    editedName,
    editedEmail,
    setEditedName,
    setEditedEmail,
    handleEdit,
    handleSave,
    handleCancel,
  } = useProfileForm(user, setFlashMessage);

  const { fileInputRef, handleAvatarClick, handleAvatarChange } = useAvatarUpload(
    (message) => setFlashMessage(message),
    (message) => setFlashMessage(message)
  );

  useEffect(() => {
    if (!initialUserDetails) {
      router.push('/login');
    } else {
      setUser(initialUserDetails);
    }
  }, [initialUserDetails, setUser, router]);

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => setFlashMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダーセクション */}
        <div className="w-full">
          {/* ヘッダー: グラデーションを単色に */}
          <div className="bg-gray-100 h-1 w-full" />
          
          {/* プロフィール情報 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="-mt-8 relative">
              {/* プロフィール画像 */}
              <div className="flex justify-between items-start">
                <div 
                  className="bg-white p-1 rounded-full inline-block cursor-pointer relative"
                  onClick={handleAvatarClick}
                >
                  <Image
                    src={`http://localhost:3001/uploads/${user.profile?.avatarPath}`}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full hover:opacity-80 transition-opacity"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors">
                    <FiCamera className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Edit Profileボタン */}
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center space-x-1"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* ユーザー情報 */}
              <div className="mt-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Name"
                    />
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Email"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                    <p className="text-gray-500">{user.email}</p>
                  </>
                )}
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

          {/* 投稿一覧: グリッドレイアウトに変更 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Posts</h2>
            {/* 投稿カード */}
            <div className="grid grid-cols-3 gap-4">
              {initialMicroposts.map((post) => (
                <div key={post.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  {/* 画像サイズを調整 */}
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
                        <span>{post.comments.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-1 flex flex-wrap gap-1">
                    {post.categories.map((category) => (
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
      {flashMessage && <FlashMessage message={flashMessage} />}
    </div>
  );
}
