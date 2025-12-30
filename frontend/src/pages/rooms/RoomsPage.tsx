import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';

interface Room {
  _id: string;
  name: string;
  description: string;
  category: string;
  members?: string[];
  isPrivate?: boolean;
  admin?: string;
}

const categoryBadgeColors: { [key: string]: string } = {
  General: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  Family: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  Friends: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
  Gaming: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  Hobbies: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
  Sports: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200',
  Entertainment: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200',
  Travel: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200',
  Study: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
  Food: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
};

export function RoomsPage() {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [joined, setJoined] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showGameZone, setShowGameZone] = useState(false);
  const [showGameInvite, setShowGameInvite] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [roomMembers, setRoomMembers] = useState<any[]>([]);
  const [roomMessages, setRoomMessages] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [newRoomForm, setNewRoomForm] = useState({ 
    name: '', 
    description: '', 
    category: 'General',
    isPrivate: false 
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await api.get('/api/rooms')).data,
  });

  const createRoomMutation = useMutation({
    mutationFn: async (roomData: { name: string; description: string; category: string; isPrivate: boolean }) => 
      (await api.post('/api/rooms', roomData)).data,
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      setNewRoomForm({ name: '', description: '', category: 'General', isPrivate: false });
    },
  });

  const rooms: Room[] = data?.data || [];
  const uniqueCategories = Array.from(new Set(rooms.map((r) => r.category)));
  const categories: string[] = ['All', ...uniqueCategories];

  const filteredRooms = selectedCategory === 'All' 
    ? rooms 
    : rooms.filter((r) => r.category === selectedCategory);

  useEffect(() => {
    if (!socket || !joined) return;
    socket.emit('room:join', { roomId: joined, userId: user?._id });
    return () => {
      if (socket && joined) {
        socket.emit('room:leave', { roomId: joined, userId: user?._id });
      }
    };
  }, [socket, joined, user?._id]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.name.trim()) return;
    createRoomMutation.mutate(newRoomForm);
  };

  const handleJoinRequest = (room: Room) => {
    if (room.isPrivate) {
      // Send join request
      console.log('Sending join request for private room:', room._id);
    } else {
      // Direct join
      setJoined(room._id);
    }
  };

  const handleChatClick = (room: Room) => {
    setSelectedRoom(room);
    setShowChatModal(true);
    // In runtime, fetch room members
    setRoomMembers([
      { _id: '1', name: 'User 1' },
      { _id: '2', name: 'User 2' },
      { _id: '3', name: 'User 3' },
    ]);
  };

  const handlePlayGameClick = (room: Room) => {
    setSelectedRoom(room);
    setShowGameZone(true);
  };

  const handleGameSelection = (gameType: string, room: Room) => {
    setSelectedRoom(room);
    setShowGameZone(false);
    setShowGameInvite(true);
  };

  const handleSendGameInvite = (invitedUserId: string) => {
    if (selectedRoom && user) {
      console.log('Game invitation sent to:', invitedUserId);
      // Send notification through socket
      socket?.emit('game:invite', {
        gameType: 'tictactoe',
        invitedUserId,
        roomId: selectedRoom._id,
        inviterName: user.name,
      });
      setShowGameInvite(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-600 dark:text-gray-400">Loading rooms...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center py-12">
      <div className="text-red-600 dark:text-red-400">Failed to load rooms</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Rooms</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Join rooms and connect with your community</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
          + Create Room
        </Button>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-700">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Room</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-2xl text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                X
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoomForm.name}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, name: e.target.value })}
                  placeholder="e.g., Family Game Night"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newRoomForm.description}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, description: e.target.value })}
                  placeholder="What is this room about?"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newRoomForm.category}
                  onChange={(e) => setNewRoomForm({ ...newRoomForm, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Family</option>
                  <option>Friends</option>
                  <option>Gaming</option>
                  <option>Hobbies</option>
                  <option>Sports</option>
                  <option>Entertainment</option>
                  <option>Travel</option>
                  <option>Food</option>
                  <option>General</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={newRoomForm.isPrivate}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, isPrivate: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Private Room (requires approval to join)
                  </span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={createRoomMutation.isPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400"
                >
                  {createRoomMutation.isPending ? 'Creating...' : 'Create Room'}
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        {categories.map((cat: string) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-2xl mb-4">No rooms</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No rooms found in this category</p>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
            Create the first room!
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room: any) => (
            <div 
              key={room._id}
              className={`group cursor-pointer transition-all duration-300 ${
                joined === room._id 
                  ? 'ring-2 ring-green-500 shadow-lg' 
                  : 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700'
              }`}
              onClick={() => setSelectedRoom(room)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedRoom(room);
                }
              }}
            >
              <Card className="h-full">
                <CardBody className="p-5">
                  {/* Header with category badge and privacy */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{room.name}</h3>
                      {room.isPrivate && (
                        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Private</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${categoryBadgeColors[room.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                      {room.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                    {room.description}
                  </p>

                  {/* Room Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <span className="flex items-center gap-1">
                      {room.members?.length || 0} members
                    </span>
                    <span className="flex items-center gap-1">
                      Active
                    </span>
                  </div>

                  {/* Room Actions */}
                  {joined === room._id ? (
                    <div className="space-y-2">
                      <Button 
                        type="button"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedRoom(room); }}
                        className="w-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 hover:bg-green-200"
                      >
                        Joined
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleChatClick(room); }}
                        >
                          Chat
                        </Button>
                        <Button 
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="text-xs"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handlePlayGameClick(room); }}
                        >
                          Play Game
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      onClick={(e: React.MouseEvent) => { 
                        e.stopPropagation(); 
                        handleJoinRequest(room);
                      }}
                      className={`w-full font-medium ${
                        room.isPrivate
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {room.isPrivate ? 'Request to Join' : 'Join Room'}
                    </Button>
                  )}
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Room Detail Sidebar */}
      {selectedRoom && joined === selectedRoom._id && !showChatModal && !showGameZone && (
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-2 border-green-200 dark:border-green-700">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedRoom.name} - Room Controls
              </h3>
              <button onClick={() => setSelectedRoom(null)} className="text-2xl text-gray-500 hover:text-gray-700">X</button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" className="bg-gray-400 text-white cursor-not-allowed line-through" disabled>
                Voice Call
              </Button>
              <Button type="button" className="bg-gray-400 text-white cursor-not-allowed line-through" disabled>
                Video Call
              </Button>
              <Button type="button" className="bg-gray-400 text-white cursor-not-allowed line-through" disabled>
                Share Screen
              </Button>
              <Button type="button" className="bg-gray-400 text-white cursor-not-allowed line-through" disabled>
                Room Settings
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedRoom && (
        <Card className="fixed bottom-4 right-4 w-96 max-h-96 shadow-2xl z-50">
          <CardBody className="p-4 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedRoom.name} - Chat</h3>
              <button onClick={() => setShowChatModal(false)} className="text-xl text-gray-500 hover:text-gray-700">X</button>
            </div>
            
            <div className="flex-1 overflow-y-auto mb-3 bg-gray-50 dark:bg-gray-800 rounded p-3 text-xs text-gray-600 dark:text-gray-400">
              <p>Room chat messages appear here (runtime memory only)</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type message..."
                className="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <button
                onClick={() => {
                  socket?.emit('room:message', { roomId: selectedRoom._id, message: chatMessage });
                  setChatMessage('');
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Game Zone Modal */}
      {showGameZone && selectedRoom && (
        <Card className="fixed inset-0 m-4 max-w-2xl mx-auto z-50 flex flex-col">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Game Zone</h3>
              <button 
                onClick={() => {
                  setShowGameZone(false);
                  setSelectedRoom(null);
                }}
                className="text-3xl text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>

            <div className="grid gap-4">
              <div
                className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border-2 border-purple-300 dark:border-purple-700 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => handleGameSelection('tictactoe', selectedRoom)}
              >
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tic Tac Toe</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">Classic 3x3 game for 2 players</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center">More games coming soon...</p>
          </CardBody>
        </Card>
      )}

      {/* Game Invitation Modal */}
      {showGameInvite && selectedRoom && (
        <Card className="fixed inset-0 m-4 max-w-lg mx-auto z-50 flex flex-col">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Invite Player</h3>
              <button 
                onClick={() => {
                  setShowGameInvite(false);
                  setSelectedRoom(null);
                }}
                className="text-3xl text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Select a room member to play with:</p>

            <div className="space-y-2 mb-6">
              {roomMembers.map((member) => (
                <div
                  key={member._id}
                  onClick={() => handleSendGameInvite(member._id)}
                  className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Selected member will receive game invitation notification
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
