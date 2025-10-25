import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

export function SearchPage() {
  const [q, setQ] = useState('');
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: async () => (await api.get(`/api/posts?search=${encodeURIComponent(q)}`)).data,
    enabled: false,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Search</h2>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts" className="border rounded px-3 py-2 bg-transparent w-full" />
        <button onClick={() => refetch()} className="px-4 py-2 rounded bg-brand-600 text-white">{isFetching ? 'Searching...' : 'Search'}</button>
      </div>
      <div className="space-y-2">
        {data?.data?.map((p: any) => (
          <div key={p._id} className="border rounded p-3">{p.content}</div>
        ))}
      </div>
    </div>
  );
}


