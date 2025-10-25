import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/Card';

export function BlogsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => (await api.get('/api/blogs')).data,
  });

  if (isLoading) return <div className="text-center py-8">Loading blogs...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Failed to load blogs</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blogs</h2>
        <Link to="/blogs/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Write Blog
        </Link>
      </div>
      
      {data?.data?.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No blogs published yet.</p>
            <Link to="/blogs/new" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Write the first blog
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data?.map((blog: any) => (
            <Card key={blog._id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{blog.author?.name}</span>
                    <span>•</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    {blog.excerpt || blog.content?.slice(0, 160)}...
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      {blog.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <Link 
                      to={`/blogs/${blog._id}`} 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



