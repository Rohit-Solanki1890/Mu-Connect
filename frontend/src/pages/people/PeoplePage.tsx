import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  college?: string;
  followers: number;
  following: number;
}

export function PeoplePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [followingMap, setFollowingMap] = useState<{ [key: string]: boolean }>({});
  const queryClient = useQueryClient();

  const { data: usersData, isLoading, isError } = useQuery({
    queryKey: ['people', search],
    queryFn: async () => {
      const response = await api.get('/api/users', {
        params: { search, limit: 20 }
      });
      return response.data;
    },
    retry: 2,
  });

  const { data: followingData } = useQuery({
    queryKey: ['my-following'],
    queryFn: async () => {
      if (!user?._id) return [];
      const response = await api.get(`/api/users/${user._id}/following`);
      return response.data.data;
    },
    enabled: !!user?._id
  });

  // Update following map when data changes
  if (followingData && Array.isArray(followingData)) {
    const map: { [key: string]: boolean } = {};
    followingData.forEach((u: User) => {
      map[u._id] = true;
    });
    setFollowingMap(map);
  }

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/api/users/${userId}/follow`);
      return response.data;
    },
    onSuccess: (_, userId) => {
      setFollowingMap(prev => ({ ...prev, [userId]: true }));
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/api/users/${userId}/unfollow`);
      return response.data;
    },
    onSuccess: (_, userId) => {
      setFollowingMap(prev => ({ ...prev, [userId]: false }));
      queryClient.invalidateQueries({ queryKey: ['my-following'] });
    }
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading people...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">Failed to load people. Please try again.</p>
        </CardBody>
      </Card>
    );
  }

  if (!usersData?.data || usersData?.data?.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Connect with People
        </h1>
        <Input
          type="text"
          placeholder="Search by name, college..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {usersData.data.map((person: User) => (
          <Card key={person._id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardBody className="space-y-4">
              {/* Profile Picture */}
              <Link to={`/profile/${person._id}`}>
                <div className="flex justify-center">
                  {person.profilePicture ? (
                    <img
                      src={person.profilePicture}
                      alt={person.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl font-semibold">
                        {person.name[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Name & Bio */}
              <div className="text-center">
                <Link to={`/profile/${person._id}`}>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white hover:text-blue-600">
                    {person.name}
                  </h3>
                </Link>
                {person.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {person.bio}
                  </p>
                )}
                {person.college && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {person.college}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-around text-center">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {person.followers}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Followers</div>
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {person.following}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Following</div>
                </div>
              </div>

              {/* Actions */}
              {person._id === user?._id ? (
                <Link to={`/profile/${person._id}`} className="w-full">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  {followingMap[person._id] ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => unfollowMutation.mutate(person._id)}
                      disabled={unfollowMutation.isPending}
                    >
                      {unfollowMutation.isPending ? '...' : 'Unfollow'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={() => followMutation.mutate(person._id)}
                      disabled={followMutation.isPending}
                    >
                      {followMutation.isPending ? '...' : 'Follow'}
                    </Button>
                  )}
                  <Link to={`/messages/${person._id}`} className="w-full">
                    <Button type="button" variant="ghost" size="sm" className="w-full">
                      Message
                    </Button>
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
