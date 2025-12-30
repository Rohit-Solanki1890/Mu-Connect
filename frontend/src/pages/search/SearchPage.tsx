import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { addRecentSearch, getRecentSearches, removeRecentSearch, clearRecentSearches } from '../../utils/searchCache';

export function SearchPage() {
  const [q, setQ] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'people' | 'rooms'>('all');
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Search Posts
  const { data: postsData, isFetching: postsLoading } = useQuery({
    queryKey: ['search-posts', q],
    queryFn: async () => {
      if (!q.trim()) return { data: [] };
      const response = await api.get(`/api/posts?search=${encodeURIComponent(q)}`);
      return response.data;
    },
  });

  // Search People
  const { data: peopleData, isFetching: peopleLoading } = useQuery({
    queryKey: ['search-people', q],
    queryFn: async () => {
      if (!q.trim()) return { data: [] };
      const response = await api.get(`/api/users?search=${encodeURIComponent(q)}`);
      return response.data;
    },
  });

  // Search Rooms
  const { data: roomsData, isFetching: roomsLoading } = useQuery({
    queryKey: ['search-rooms', q],
    queryFn: async () => {
      if (!q.trim()) return { data: [] };
      const response = await api.get(`/api/rooms?search=${encodeURIComponent(q)}`);
      return response.data;
    },
  });

  const isLoading = postsLoading || peopleLoading || roomsLoading;

  // Filter results based on selected type
  const filteredPosts = searchType === 'all' || searchType === 'posts' ? postsData?.data || [] : [];
  const filteredPeople = searchType === 'all' || searchType === 'people' ? peopleData?.data || [] : [];
  const filteredRooms = searchType === 'all' || searchType === 'rooms' ? roomsData?.data || [] : [];

  const hasResults = filteredPosts.length > 0 || filteredPeople.length > 0 || filteredRooms.length > 0;

  // Handle search submission and caching
  const handleSearch = (searchQuery: string, type: 'all' | 'posts' | 'people' | 'rooms' = 'all') => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery, type);
      setQ(searchQuery);
      setRecentSearches(getRecentSearches());
    }
  };

  // Handle removing recent search
  const handleRemoveRecent = (query: string) => {
    removeRecentSearch(query);
    setRecentSearches(getRecentSearches());
  };

  // Handle clearing all recent searches
  const handleClearAll = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">🔍 Search</h2>
        <div className="flex gap-2 mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, people, rooms..."
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && q.trim()) {
                handleSearch(q, searchType);
              }
            }}
          />
        </div>

        {/* Filter Tabs */}
        {q && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSearchType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSearchType('posts')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'posts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              📱 Posts ({postsData?.data?.length || 0})
            </button>
            <button
              onClick={() => setSearchType('people')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'people'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              👥 People ({peopleData?.data?.length || 0})
            </button>
            <button
              onClick={() => setSearchType('rooms')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === 'rooms'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              🎮 Rooms ({roomsData?.data?.length || 0})
            </button>
          </div>
        )}
      </div>

      {!q ? (
        <div className="space-y-6">
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Start typing to search for posts, people, and rooms
              </p>
            </CardBody>
          </Card>

          {/* Suggestions: People */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">👥 Suggestions</h3>
            {peopleData?.data && peopleData.data.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {peopleData.data.slice(0, 4).map((person: any) => (
                  <Card key={person._id} className="hover:shadow-lg transition-shadow">
                    <CardBody className="text-center space-y-3">
                      {person.profilePicture ? (
                        <img
                          src={person.profilePicture}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover mx-auto"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-white text-xl font-semibold">
                            {person.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link to={`/profile/${person._id}`}>
                          <h4 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 truncate">
                            {person.name}
                          </h4>
                        </Link>
                        {person.college && (
                          <p className="text-xs text-gray-500 dark:text-gray-500">🎓 {person.college}</p>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-400">{person.followers} followers</p>
                      </div>
                      <Link to={`/profile/${person._id}`} className="block">
                        <Button size="sm" className="w-full">
                          View Profile
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardBody className="text-center py-6">
                  <p className="text-gray-600 dark:text-gray-400">No suggestions available</p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">⏱️ Recent Searches</h3>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <div
                    key={`${search.query}-${search.timestamp}`}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <button
                      onClick={() => handleSearch(search.query, search.type)}
                      className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                    >
                      {search.query}
                    </button>
                    <button
                      onClick={() => handleRemoveRecent(search.query)}
                      className="text-gray-500 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 text-xs ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isLoading ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </CardBody>
        </Card>
      ) : !hasResults ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No results found for "{q}"</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Posts Results */}
          {filteredPosts.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">📱 Posts</h3>
              <div className="space-y-3">
                {filteredPosts.map((post: any) => (
                  <Card key={post._id}>
                    <CardBody>
                      <div className="flex gap-3">
                        {post.author?.profilePicture && (
                          <img
                            src={post.author.profilePicture}
                            alt={post.author.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <Link to={`/profile/${post.author?._id}`}>
                            <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                              {post.author?.name}
                            </p>
                          </Link>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">{post.content}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* People Results */}
          {filteredPeople.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">👥 People</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPeople.map((person: any) => (
                  <Card key={person._id}>
                    <CardBody>
                      <div className="text-center">
                        {person.profilePicture ? (
                          <img
                            src={person.profilePicture}
                            alt={person.name}
                            className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-white text-xl font-semibold">
                              {person.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <Link to={`/profile/${person._id}`}>
                          <h4 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                            {person.name}
                          </h4>
                        </Link>
                        {person.bio && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {person.bio}
                          </p>
                        )}
                        {person.college && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            🎓 {person.college}
                          </p>
                        )}
                        <div className="flex justify-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span>{person.followers} followers</span>
                          <span>{person.following} following</span>
                        </div>
                        <Link to={`/profile/${person._id}`} className="mt-3 block">
                          <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            View Profile
                          </button>
                        </Link>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rooms Results */}
          {filteredRooms.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">🎮 Rooms</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room: any) => (
                  <Card key={room._id}>
                    <CardBody>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{room.name}</h4>
                      {room.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {room.description}
                        </p>
                      )}
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        👥 {room.members?.length || 0} members
                      </div>
                      <Link to={`/rooms`} className="mt-3 block">
                        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                          Join Room
                        </button>
                      </Link>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


