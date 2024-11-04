import { getUsers } from '@/app/actions/users';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const users = await getUsers();

  return <UsersClient initialUsers={users} />;
}
