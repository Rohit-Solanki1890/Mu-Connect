import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function NotificationsBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { data } = useQuery({
    queryKey: ['notifications','unread-count'],
    queryFn: async () => (await api.get('/api/notifications/unread-count')).data,
    refetchInterval: 5000,
  });
  const count = data?.count || 0;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {count > 0 && (
          <span className="absolute top-1 right-1 text-[10px] bg-red-600 text-white rounded-full px-1.5 py-0.5 font-semibold">{count}</span>
        )}
      </button>
      
      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {count > 0 ? (
              <div className="space-y-2 p-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New message from John</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Hey, how are you doing?</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">2 minutes ago</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Room invite: Gaming Squad</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">You've been invited to join</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">1 hour ago</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">New follower: Sarah</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sarah started following you</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">3 hours ago</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-lg mb-2">🔔</p>
                <p className="text-gray-600 dark:text-gray-400">No new notifications</p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link to="/notifications" className="text-center block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


