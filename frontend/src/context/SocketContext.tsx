import { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

type SocketContextValue = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextValue>({ socket: null });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = io('/', { 
      path: '/socket.io', 
      transports: ['websocket', 'polling'],
      withCredentials: true
    });
    socketRef.current = s;
    if (user?._id) s.emit('user:join', { userId: user._id });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  const value = useMemo(() => ({ socket: socketRef.current }), [socketRef.current]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}


