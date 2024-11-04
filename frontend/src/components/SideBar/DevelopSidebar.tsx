'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

const DevelopSidebar: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-gray-800 text-white w-64 h-screen p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-4">開発メニュー</h2>
      <nav className="flex-grow overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link href="/develop" className="block py-2 px-4 hover:bg-gray-700 rounded">
              開発ホーム
            </Link>
          </li>
          <li>
            <Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Public
            </Link>
          </li>
          <li>
            <Link href="/profile" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Profile
            </Link>
          </li>
          <li>
            <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Admin
            </Link>
          </li>
        </ul>
      </nav>
      {user && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-2">ログイン中：</h3>
          <div className="text-sm">
            <p className="font-bold">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-400">{user.userRoles.includes('admin') ? '管理者' : 'ユーザー'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopSidebar;
