import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface User {
  _id: string;
  name: string;
  profilePicture: string;
  bio: string;
  college: string;
  year: string;
  branch: string;
  followers: number;
  following: number;
  email: string;
  createdAt: string;
}

export function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Get current user's following list
  const { data: followingData } = useQuery({
    queryKey: ['my-following'],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const response = await api.get(`/api/users/${currentUser._id}/following`);
      return response.data.data;
    },
    enabled: !!currentUser?._id
  });

  // Check if current user follows this user
  const isFollowing = followingData?.some((u: any) => u._id === id);

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/users/${id}/follow`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    }
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/api/users/${id}/unfollow`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center text-red-600">Failed to load profile</div>
        </CardBody>
      </Card>
    );
  }

  const user = data?.user as User;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-700">
                  <span className="text-5xl text-white font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user?.name}
                  </h1>
                  {user?.college && (
                    <p className="text-gray-600 dark:text-gray-400">
                      🎓 {user.college}
                      {user?.year && ` • ${user.year}`}
                      {user?.branch && ` • ${user.branch}`}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {currentUser?._id !== id && (
                  <div className="flex gap-2">
                    {isFollowing ? (
                      <Button
                        variant="outline"
                        onClick={() => unfollowMutation.mutate()}
                        disabled={unfollowMutation.isPending}
                      >
                        {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => followMutation.mutate()}
                        disabled={followMutation.isPending}
                      >
                        {followMutation.isPending ? 'Following...' : 'Follow'}
                      </Button>
                    )}
                    <Link to={`/messages/${id}`}>
                      <Button variant="ghost">💬 Message</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user?.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {user?.followers || 0}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {user?.following || 0}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">Following</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            About
          </h2>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            {user?.email && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">📧</span>
                <span>{user.email}</span>
              </div>
            )}
            {user?.college && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">🎓</span>
                <span>{user.college}</span>
              </div>
            )}
            {user?.branch && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">📚</span>
                <span>{user.branch}</span>
              </div>
            )}
            {user?.year && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">📆</span>
                <span>{user.year}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">📅</span>
              <span>
                Joined {new Date(user?.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}



