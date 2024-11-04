"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function SideBar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const baseClasses = "block py-2 px-4 rounded transition-colors duration-200";
    return pathname === href
      ? `${baseClasses} bg-blue-600 text-white`
      : `${baseClasses} hover:bg-gray-700`;
  };

  return (
    <nav className="bg-gray-800 text-white w-64 h-screen p-4 flex flex-col">
      <div className="text-2xl font-bold mb-6 text-center">
        My Application
      </div>
      <ul className="space-y-2 flex-grow overflow-y-auto">
        <li>
          <Link href="/" className={getLinkClassName('/')}>Public</Link>
        </li>
        <li>
          <Link href="/timeline" className={getLinkClassName('/timeline')}>Timeline</Link>
        </li>
        {user && (
          <>
            <li>
              <Link href="/profile" className={getLinkClassName('/profile')}>Profile</Link>
            </li>

            <li>
              <Link href="/users" className={getLinkClassName('/users')}>Users</Link>
            </li>
          </>
        )}
        {user?.userRoles.includes('admin') && (
          <li>
            <Link href="/admin" className={getLinkClassName('/admin')}>Admin</Link>
          </li>
        )}
        {!user && (
          <>
            <li>
              <Link href="/login" className={getLinkClassName('/login')}>Login</Link>
            </li>
            <li>
              <Link href="/register" className={getLinkClassName('/register')}>Register</Link>
            </li>
          </>
        )}
      </ul>
      {user && (
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="text-center mb-2">{user.name}</div>
          <button 
            onClick={logout} 
            className="block w-full text-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
