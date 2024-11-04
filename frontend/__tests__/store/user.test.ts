import { useUserStore } from '@/store/userStore';
import { UserDetails } from '@/types/user';

describe('UserStore', () => {
  // 各テストの前にストアをリセット
  beforeEach(() => {
    useUserStore.setState({ users: [] });
  });

  // テストユーザーデータ
  const mockUsers: UserDetails[] = [
    {
      id: 1,
      name: 'User 1',
      email: 'user1@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: ['user'],
      profile: {
        avatarPath: '/avatar1.jpg',
      }
    },
    {
      id: 2,
      name: 'User 2',
      email: 'user2@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: ['user'],
      profile: {
        avatarPath: '/avatar2.jpg',
      }
    }
  ];

  // setUsersのテスト
  test('setUsers should update users state', () => {
    const { setUsers } = useUserStore.getState();
    setUsers(mockUsers);
    
    expect(useUserStore.getState().users).toEqual(mockUsers);
  });

  // updateUserのテスト
  test('updateUser should update user roles correctly', () => {
    // 初期ユーザーを設定
    const { setUsers, updateUser } = useUserStore.getState();
    setUsers(mockUsers);

    // User 1のロールを更新
    const updatedUser = {
      ...mockUsers[0],
      userRoles: ['admin']
    };
    updateUser(updatedUser);

    // 更新された状態を検証
    const updatedUsers = useUserStore.getState().users;
    expect(updatedUsers[0].userRoles).toEqual(['admin']);
    // 他のユーザーは変更されていないことを確認
    expect(updatedUsers[1].userRoles).toEqual(['user']);
  });

  // 存在しないユーザーのupdateUserのテスト
  test('updateUser should not affect users when userId does not exist', () => {
    const { setUsers, updateUser } = useUserStore.getState();
    setUsers(mockUsers);

    // 存在しないユーザーIDで更新を試みる
    const nonExistentUser: UserDetails = {
      id: 999,
      name: 'Non Existent',
      email: 'nonexistent@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: ['admin'],
      profile: {
        avatarPath: '/avatar.jpg',
      }
    };
    updateUser(nonExistentUser);

    // ユーザー一覧が変更されていないことを確認
    expect(useUserStore.getState().users).toEqual(mockUsers);
  });
});
