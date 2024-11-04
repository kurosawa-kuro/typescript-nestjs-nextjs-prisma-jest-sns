import { getFollowing } from '@/app/actions/users';
import FollowingList from '@/app/(user-pages)/users/[id]/following/FollowingList';

export default async function FollowingPage({ params }: { params: { id: string } }) {
  const following = await getFollowing(parseInt(params.id));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Following</h1>
      <FollowingList following={following} />
    </div>
  );
}
