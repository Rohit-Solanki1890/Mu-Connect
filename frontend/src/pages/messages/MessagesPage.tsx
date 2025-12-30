import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface Conversation {
  _id: string;
  name: string;
  profilePicture: string;
  bio?: string;
  lastActive?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  _id: string;
  sender: { _id: string; name: string; profilePicture: string };
  recipient: { _id: string; name: string; profilePicture: string };
  content: string;
  createdAt: string;
  isRead: boolean;
}

export function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { userId: urlUserId } = useParams<{ userId?: string }>();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(urlUserId || null);
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Get conversations
  const { data: conversationsData, isLoading: conversationsLoading, isError: conversationsError } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/api/messages/conversations');
      return response.data;
    },
    refetchInterval: 5000,
    retry: 2,
  });

  // Get messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useQuery({
    queryKey: ['messages', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const response = await api.get(`/api/messages/${selectedUserId}`);
      return response.data;
    },
    enabled: !!selectedUserId,
    refetchInterval: 3000,
    retry: 2,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/api/messages/send/${selectedUserId}`, { content });
      return response.data;
    },
    onSuccess: () => {
      setMessageContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit('user:join', { userId: user._id });

    const handleNewMessage = (message: Message) => {
      if (
        (message.sender._id === selectedUserId && message.recipient._id === user._id) ||
        (message.sender._id === user._id && message.recipient._id === selectedUserId)
      ) {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleTyping = ({ senderId, isTyping: typing }: any) => {
      if (senderId === selectedUserId) {
        setIsTyping(typing);
      }
    };

    socket.on('message:receive', handleNewMessage);
    socket.on('message:typing', handleTyping);

    return () => {
      socket.off('message:receive', handleNewMessage);
      socket.off('message:typing', handleTyping);
    };
  }, [socket, user, selectedUserId, queryClient]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.data]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedUserId) return;
    
    socket.emit('message:typing', {
      recipientId: selectedUserId,
      senderId: user?._id,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('message:typing', {
        recipientId: selectedUserId,
        senderId: user?._id,
        isTyping: false,
      });
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim() || !selectedUserId) return;
    sendMessageMutation.mutate(messageContent);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col">
          <CardBody className="flex flex-col h-full p-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white unselectable">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversationsError ? (
                <div className="p-4 text-center text-red-600 dark:text-red-400">
                  Error loading conversations. Try refreshing.
                </div>
              ) : conversationsLoading ? (
                <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                  Loading conversations...
                </div>
              ) : !conversationsData?.data || conversationsData?.data?.length === 0 ? (
                <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                  No conversations yet. Start messaging someone!
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversationsData?.data?.map((conv: Conversation) => (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedUserId(conv._id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedUserId === conv._id
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {conv.profilePicture ? (
                            <img
                              src={conv.profilePicture}
                              alt={conv.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {conv.name[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          {conv.lastActive && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {conv.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {conv.lastMessage || 'No messages yet'}
                          </div>
                        </div>
                        {conv.unreadCount! > 0 && (
                          <div className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {selectedUserId ? (
          <Card className="h-full flex flex-col">
            <CardBody className="flex flex-col h-full p-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {conversationsData?.data?.find((c: Conversation) => c._id === selectedUserId)?.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isTyping ? '✍️ typing...' : 'Online'}
                  </p>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                {messagesError ? (
                  <div className="text-center text-red-600 dark:text-red-400 py-8">
                    Error loading messages. Try refreshing.
                  </div>
                ) : messagesLoading ? (
                  <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                    Loading messages...
                  </div>
                ) : !messagesData?.data || messagesData?.data?.length === 0 ? (
                  <div className="text-center text-gray-600 dark:text-gray-400 py-8">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <>
                    {messagesData?.data?.map((msg: Message) => (
                      <div
                        key={msg._id}
                        className={`flex ${
                          msg.sender._id === user?._id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender._id === user?._id
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender._id === user?._id
                              ? 'text-blue-100'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2"
              >
                <Input
                  type="text"
                  value={messageContent}
                  onChange={(e) => {
                    setMessageContent(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="px-6"
                >
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
                </Button>
              </form>
            </CardBody>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardBody className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Select a conversation to start messaging
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
