import { getUsersWithFollowStatus } from '@/app/actions/users';
import UsersClient from './UsersClient';
import { UserDetails } from '@/types/user';

const USERS_PER_PAGE = 10;

interface UsersClientProps {
  initialUsers: UserDetails[];
  initialPage: number;
  totalUsers: number;
  usersPerPage: number;
}

export default async function UsersPage() {
  const allUsers = await getUsersWithFollowStatus();
  const totalUsers = allUsers.length;

  return (
    <UsersClient
      initialUsers={allUsers}
      initialPage={1}
      totalUsers={totalUsers}
      usersPerPage={USERS_PER_PAGE}
    />
  );
}
