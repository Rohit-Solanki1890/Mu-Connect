import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function NotificationsBell() {
  const { data } = useQuery({
    queryKey: ['notifications','unread-count'],
    queryFn: async () => (await api.get('/api/notifications/unread-count')).data,
    refetchInterval: 5000,
  });
  const count = data?.count || 0;
  return (
    <div className="relative">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1.5 py-0.5">{count}</span>
      )}
    </div>
  );
}


