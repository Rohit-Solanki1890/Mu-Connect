import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';
import { PostCard } from '../../components/PostCard';
import Sidebar from '../../components/Sidebar';
import { Trends } from '../../components/Trends';
import { useState } from 'react';

export function FeedPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => (await api.get('/api/posts')).data,
  });

  const createPost = useMutation({
    mutationFn: async (content: string) => (await api.post('/api/posts', { content })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  const likePost = useMutation({
    mutationFn: async (id: string) => (await api.post(`/api/posts/${id}/like`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  const commentPost = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => (await api.post(`/api/posts/${id}/comment`, { content })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  });

  if (isLoading) return <div>Loading feed...</div>;
  if (error) return <div>Failed to load feed</div>;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-[1fr,auto]">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Home</h2>
        <Card><CardBody>
          <PostComposer onSubmit={(text) => createPost.mutate(text)} loading={createPost.isPending} />
        </CardBody></Card>
        {data?.data?.map((post: any) => (
          <PostCard key={post._id} post={post} onLike={() => likePost.mutate(post._id)} onComment={(text) => commentPost.mutate({ id: post._id, content: text })} />
        ))}
      </div>
      <div className="hidden sm:block">
        <Sidebar />
      </div>
    </div>
  );
}

function PostComposer({ onSubmit, loading }: { onSubmit: (text: string) => void; loading: boolean }) {
  const [text, setText] = useState('');
  return (
    <div className="border rounded p-3">
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share something..." className="w-full bg-transparent border rounded p-2" rows={3} />
      <div className="mt-2 flex justify-end">
        <button disabled={loading || !text.trim()} onClick={() => { onSubmit(text.trim()); setText(''); }} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">Post</button>
      </div>
    </div>
  );
}

function InlineComment({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment" className="border rounded px-2 py-1 bg-transparent" />
      <button onClick={() => { if (text.trim()) { onSubmit(text.trim()); setText(''); } }} className="px-3 py-1 rounded bg-gray-900 text-white dark:bg-white dark:text-gray-900">Send</button>
    </div>
  );
}



