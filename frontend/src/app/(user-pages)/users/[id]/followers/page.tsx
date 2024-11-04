import { getFollowers } from '@/app/actions/users';     
import FollowersList from '@/app/(user-pages)/users/[id]/followers/FollowersList';

export default async function FollowersPage({ params }: { params: { id: string } }) {
  const followers = await getFollowers(parseInt(params.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Followers</h1>
      <FollowersList followers={followers} />
    </div>
  );
}
