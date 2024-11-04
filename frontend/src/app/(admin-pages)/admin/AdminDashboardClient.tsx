'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { UserDetails, UserInfo } from '@/types/user';

export default function AdminDashboardClient({ initialUserDetails }: { initialUserDetails: UserInfo }) {
  const router = useRouter();
  const { message: flashMessage, setFlashMessage } = useFlashMessageStore();

  useEffect(() => {
    // 管理者ログイン成功時にフラッシュメッセージを設定
    setFlashMessage('管理者としてログインしました');
  }, [setFlashMessage]);

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, 5000); // 5秒後にメッセージを消す
      return () => clearTimeout(timer);
    }
  }, [flashMessage, setFlashMessage]);

  if (!initialUserDetails) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      {flashMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
          {flashMessage}
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4 text-black">Admin Dashboard</h1>
      <div className="mb-4 text-black">
        <p>Name: <span className="inline-block w-32">{initialUserDetails.name}</span></p>
        <p>Email: <span className="inline-block w-32">{initialUserDetails.email}</span></p>
        <p>Role: <span className="inline-block w-32">Administrator</span></p>
      </div>
    </div>
  );
}
