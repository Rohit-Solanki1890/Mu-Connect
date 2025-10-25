import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from './ui/Avatar';
import { Card, CardBody } from './ui/Card';

export function PostCard({ post, onLike, onComment }: { post: any; onLike: () => void; onComment: (text: string) => void }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={post.author?.profilePicture} size={36} />
          <div>
            <Link to={`/profile/${post.author?._id}`} className="font-medium">{post.author?.name}</Link>
            <div className="text-xs opacity-60">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div className="whitespace-pre-wrap mb-4 text-[15px]">{post.content}</div>
        <div className="flex items-center gap-3 text-sm">
          <button onClick={onLike} className="px-3 py-1 rounded border">Like ({post.likes?.length || 0})</button>
          <InlineComment onSubmit={onComment} />
        </div>
        {post.comments?.length > 0 && (
          <div className="mt-3 space-y-2">
            {post.comments.map((c: any) => (
              <div key={c._id} className="text-sm">
                <span className="font-medium">{c.author?.name}:</span> {c.content}
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
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


