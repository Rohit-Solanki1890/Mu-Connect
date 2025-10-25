import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useEffect, useState } from 'react';

export function RoomsPage() {
  const { socket } = useSocket();
  const [joined, setJoined] = useState<string | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => (await api.get('/api/rooms')).data,
  });

  useEffect(() => {
    if (!socket || !joined) return;
    const rid = joined;
    socket.emit('room:join', { roomId: rid, userId: 'me' });
    return () => socket.emit('room:leave', { roomId: rid, userId: 'me' });
  }, [socket, joined]);

  if (isLoading) return <div>Loading rooms...</div>;
  if (error) return <div>Failed to load rooms</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Rooms</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {data?.data?.map((room: any) => (
          <div key={room._id} className="border rounded p-4">
            <div className="font-semibold">{room.name}</div>
            <div className="text-sm opacity-80">{room.description}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={() => setJoined(room._id)}>
                {joined === room._id ? 'Joined' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



