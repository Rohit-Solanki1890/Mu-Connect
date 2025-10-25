export function Trends() {
  const items = [
    { tag: '#MarwadiLife', count: '1.2K' },
    { tag: '#MUFest2026', count: '980' },
    { tag: '#CodeWithMU', count: '740' },
  ];
  return (
    <aside className="sticky top-4">
      <div className="border rounded-xl overflow-hidden">
        <div className="px-4 py-3 font-semibold border-b">Trends for you</div>
        <ul>
          {items.map((t) => (
            <li
              key={t.tag}
              className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 animate-bubble"
            >
              <div className="font-medium">{t.tag}</div>
              <div className="text-xs opacity-70">{t.count} posts</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}


