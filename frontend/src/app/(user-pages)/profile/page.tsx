import { getUserDetails } from '@/app/actions/users';
import { getUserMicroposts } from '@/app/actions/micropost';
import UserProfileClient from './UserProfileClient';
import { headers } from 'next/headers';

export default async function UserProfilePage() {
  const userId = getUserIdFromHeaders();
  
  if (!userId) {
    return <div>User ID not found</div>;
  }

  try {
    const [userDetails, userMicroposts] = await Promise.all([
      getUserDetails(userId),
      getUserMicroposts(userId)
    ]);

    if (!userDetails) {
      return <div>User details not found</div>;
    }
    return <UserProfileClient 
      initialUserDetails={userDetails} 
      initialMicroposts={userMicroposts}
    />;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return <div>Error loading user data</div>;
  }
}

function getUserIdFromHeaders(): number | null {
  const headersList = headers();
  const userDataString = headersList.get('x-user-data');
  
  if (!userDataString) {
    return null;
  }

  try {
    const userData = JSON.parse(userDataString);
    return typeof userData.id === 'number' ? userData.id : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}
