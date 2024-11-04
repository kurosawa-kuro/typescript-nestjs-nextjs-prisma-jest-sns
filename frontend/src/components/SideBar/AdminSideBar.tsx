"use client"

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function AdminSideBar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="bg-gray-900 text-white w-64 h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-6 text-center text-yellow-400">
        Admin Dashboard
      </div>
      <ul className="space-y-2 flex-grow overflow-y-auto">
        <li>
          <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">Dashboard</Link>
        </li>
        <li>
          <Link href="/admin/users" className="block py-2 px-4 hover:bg-gray-700 rounded">Manage Users</Link>
        </li>
        <li>
          <Link href="/admin/band-users" className="block py-2 px-4 hover:bg-gray-700 rounded">Manage Band Users</Link>
        </li>
        <li>
          <Link href="/admin/microposts" className="block py-2 px-4 hover:bg-gray-700 rounded">Manage Microposts</Link>
        </li>
        <li>
          <Link href="/admin/ranking" className="block py-2 px-4 hover:bg-gray-700 rounded">Ranking</Link>
        </li>
        <li>
          <Link href="/admin/settings" className="block py-2 px-4 hover:bg-gray-700 rounded">Settings</Link>
        </li>
        <li>
          <Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded">Back to Public Site</Link>
        </li>
      </ul>
      {user && (
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="text-center mb-2 text-yellow-400">Admin: {user.name}</div>
          <button 
            onClick={logout} 
            className="block w-full text-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
