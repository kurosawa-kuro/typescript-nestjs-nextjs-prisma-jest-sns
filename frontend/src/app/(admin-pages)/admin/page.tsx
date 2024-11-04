import { getUserDetails } from '@/app/actions/users';
import { headers } from 'next/headers';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
  const userId = getUserIdFromHeaders();
  
  if (!userId) {
    return <div>User ID not found</div>;
  }

  try {
    const userDetails = await getUserDetails(userId);

    if (!userDetails) {
      return <div>User details not found</div>;
    }

    if (!userDetails.userRoles.includes('admin')) {
      return <div>Access denied. Admin privileges required.</div>;
    }

    return <AdminDashboardClient initialUserDetails={userDetails} />;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return <div>Error loading user details</div>;
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
