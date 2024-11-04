import { getUserDetails } from '@/app/actions/users';
import UserProfileClient from './UserProfileClient';
import { notFound } from 'next/navigation';
import { getUserMicroposts } from '@/app/actions/micropost';

interface Props {
  params: { id: string }
}

export default async function UserProfilePage({ params }: Props) {
  // paramsのidを数値に変換
  const userId = parseInt(params.id, 10);
  
  if (isNaN(userId)) {
    notFound(); // 無効なIDの場合は404ページを表示
    return null;
  }

  try {
    const userDetails = await getUserDetails(userId);
    const userMicroposts = await getUserMicroposts(userId);

    if (!userDetails) {
      return <div className="p-4 text-center">User details not found</div>;
    }
    
    return <UserProfileClient 
      initialUserDetails={{
        ...userDetails,
        microposts: userMicroposts
      }} 
    />;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return (
      <div className="p-4 text-center text-red-500">
        An error occurred while loading user details. Please try again later.
      </div>
    );
  }
}
