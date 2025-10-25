import { useState } from 'react';
import { api } from '../../services/api';

export function BlogEditorPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.post('/api/blogs', { title, content });
      setTitle('');
      setContent('');
      alert('Blog published');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Write a Blog</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border rounded px-3 py-2 bg-transparent" />
      <div>
        <div className="flex gap-2 mb-2">
          <button onClick={() => setContent(c => c + '**bold** ')} className="px-2 py-1 text-sm border rounded">Bold</button>
          <button onClick={() => setContent(c => c + '_italic_ ')} className="px-2 py-1 text-sm border rounded">Italic</button>
          <button onClick={() => setContent(c => c + '## Heading\n')} className="px-2 py-1 text-sm border rounded">H2</button>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="w-full border rounded p-3 bg-transparent" placeholder="Write your story..." />
      </div>
      <button disabled={saving} onClick={save} className="px-4 py-2 rounded bg-brand-600 text-white disabled:opacity-50">{saving ? 'Publishing...' : 'Publish'}</button>
    </div>
  );
}


