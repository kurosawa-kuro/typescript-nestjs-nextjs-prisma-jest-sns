import { useState, useEffect } from 'react';

export type CurrentUser = { id: number } | null;

export function useCurrentUser(): CurrentUser {
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