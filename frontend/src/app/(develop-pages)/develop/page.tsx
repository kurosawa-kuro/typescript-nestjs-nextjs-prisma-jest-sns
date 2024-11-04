// src/app/demo-login/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useFlashMessageStore } from '@/store/flashMessageStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DevelopPage() {
  const { login, logout, isLoading, error, user, resetStore } = useAuthStore();
  const { message: flashMessage, clearFlashMessage } = useFlashMessageStore();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<string>('');
  const [zustandInfo, setZustandInfo] = useState<string>('');

  // Storage information management
  const updateStorageInfo = useCallback(() => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsedAuthStorage = JSON.parse(authStorage);
        const { state } = parsedAuthStorage;
        setStorageInfo(JSON.stringify({ state }, null, 2));
      } catch (error) {
        setStorageInfo('Error parsing auth-storage');
      }
    } else {
      setStorageInfo('auth-storage not found');
    }
  }, []);

  // Zustand state management
  const updateZustandInfo = useCallback(() => {
    const zustandState = {
      auth: { user, isLoading, error },
      flashMessage: { message: flashMessage },
    };
    setZustandInfo(JSON.stringify(zustandState, null, 2));
  }, [user, isLoading, error, flashMessage]);

  // Effect for updating information
  useEffect(() => {
    updateStorageInfo();
    updateZustandInfo();
  }, [user, isLoading, error, flashMessage, updateStorageInfo, updateZustandInfo]);

  // Login handling
  const handleDemoLogin = async (isAdmin: boolean) => {
    setLoginStatus('ログイン中...');
    const email = isAdmin ? 'admin@example.com' : 'alice@example.com';
    const password = 'password';

    const success = await login(email, password);

    if (success) {
      setLoginStatus('ログイン成功！新しいタブで開きます...');
      updateStorageInfo();
      const { user } = useAuthStore.getState();
      if (user) {
        const url = user.userRoles.includes('admin') ? '/admin' : '/profile';
        window.open(url, '_blank');
      }
    } else {
      setLoginStatus('ログインに失敗しました。');
    }
  };

  // Data clearing
  const handleClearAllData = () => {
    localStorage.clear();
    sessionStorage.clear();
    resetStore();
    clearFlashMessage();
    updateStorageInfo();
    updateZustandInfo();
    setLoginStatus('全てのデータがクリアされました。');
  };

  // Logout handling
  const handleLogout = async () => {
    await logout();
    setLoginStatus('ログアウトしました。');
    updateStorageInfo();
    updateZustandInfo();
  };

  // UI rendering
  const renderButtons = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <button
        onClick={() => handleDemoLogin(false)}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
        disabled={isLoading}
      >
        デモユーザーでログイン
      </button>
      <button
        onClick={() => handleDemoLogin(true)}
        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
        disabled={isLoading}
      >
        デモ管理者でログイン
      </button>
      <button
        onClick={handleLogout}
        className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-200"
        disabled={isLoading}
      >
        ログアウト
      </button>
      <button
        onClick={handleClearAllData}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
      >
        全データを削除
      </button>
    </div>
  );

  const renderStatusMessages = () => (
    <>
      {loginStatus && (
        <p className="text-center text-sm text-gray-600 mb-4">{loginStatus}</p>
      )}
      {error && (
        <p className="text-center text-sm text-red-600 mb-4">{error}</p>
      )}
    </>
  );

  const renderInfoPanels = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <h2 className="text-xl font-bold mb-2 p-3 bg-blue-100 border-b border-gray-300">Zustand 状態</h2>
        <pre className="bg-white p-4 overflow-auto h-[calc(100vh-300px)] text-sm whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {zustandInfo}
        </pre>
      </div>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <h2 className="text-xl font-bold mb-2 p-3 bg-green-100 border-b border-gray-300">ローカルストレージ情報</h2>
        <pre className="bg-white p-4 overflow-auto h-[calc(100vh-300px)] text-sm whitespace-pre-wrap break-words scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {storageInfo}
        </pre>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <h1 className="font-bold py-2 bg-gray-800 text-white text-center">開発ツール</h1>
        <div className="p-6">
          {renderButtons()}
          {renderStatusMessages()}
          {renderInfoPanels()}
        </div>
      </div>
    </div>
  );
}
