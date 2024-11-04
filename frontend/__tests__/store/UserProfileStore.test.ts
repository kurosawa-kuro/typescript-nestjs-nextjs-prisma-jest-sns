import { useUserProfileStore } from '@/store/userProfileStore';
import { UserDetails } from '@/types/user';

describe('UserProfileStore', () => {
  // 各テストの前にストアをリセット
  beforeEach(() => {
    useUserProfileStore.setState({ user: null });
  });

  // テストユーザーデータ
  const mockUser: UserDetails = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    userRoles: [],
    profile: {
      avatarPath: '/path/to/avatar.jpg',
    }
  };

  // setUserのテスト
  test('setUser should update user state', () => {
    const { setUser } = useUserProfileStore.getState();
    setUser(mockUser);
    
    expect(useUserProfileStore.getState().user).toEqual(mockUser);
  });

  // updateUserのテスト
  test('updateUser should partially update user state', () => {
    // 初期ユーザーを設定
    const { setUser, updateUser } = useUserProfileStore.getState();
    setUser(mockUser);

    // 名前のみを更新
    const updatedName = 'Updated User';
    updateUser({ name: updatedName });

    // 更新された状態を検証
    expect(useUserProfileStore.getState().user).toEqual({
      ...mockUser,
      name: updatedName
    });
  });

  // userが null の場合のupdateUserのテスト
  test('updateUser should not update when user is null', () => {
    const { updateUser } = useUserProfileStore.getState();
    updateUser({ name: 'New Name' });

    expect(useUserProfileStore.getState().user).toBeNull();
  });
});
