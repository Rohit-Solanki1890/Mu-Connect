import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';

export function AdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin','reported'],
    queryFn: async () => (await api.get('/api/admin/reported')).data,
  });

  if (isLoading) return <div>Loading admin...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>Reported Posts</CardHeader>
          <CardBody>
            <ul className="list-disc pl-5 space-y-1">
              {data?.posts?.map((p: any) => (<li key={p._id}>{p.content?.slice(0,80)}...</li>))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Reported Blogs</CardHeader>
          <CardBody>
            <ul className="list-disc pl-5 space-y-1">
              {data?.blogs?.map((b: any) => (<li key={b._id}>{b.title}</li>))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}


