import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';

export function ProfilePage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => (await axios.get(`/api/users/${id}`)).data,
    enabled: !!id,
  });

  if (isLoading) return <div>Loading profile...</div>;
  if (error) return <div>Failed to load profile</div>;

  const user = data?.user;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <img src={user?.profilePicture || ''} className="w-16 h-16 rounded-full bg-gray-200" />
        <div>
          <div className="text-xl font-semibold">{user?.name}</div>
          <div className="opacity-70 text-sm">{user?.college} • {user?.year}</div>
        </div>
      </div>
      {user?.bio && <p className="opacity-80 whitespace-pre-wrap">{user.bio}</p>}
    </div>
  );
}



