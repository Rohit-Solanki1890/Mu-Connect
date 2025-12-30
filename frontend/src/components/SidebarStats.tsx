import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardBody } from './ui/Card';

export function SidebarStats() {
  const { user } = useAuth();

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <Card>
        <CardBody className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Connections</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                0
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Rooms</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">Blogs</span>
              <span className="font-semibold text-gray-900 dark:text-white">0</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardBody className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Suggestions</h3>
          <div className="space-y-3">
            <Link to="/people" className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded transition-colors">
              <span className="text-lg">People</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Find Friends</span>
            </Link>
            <Link to="/rooms" className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded transition-colors">
              <span className="text-lg">Rooms</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Join Rooms</span>
            </Link>
            <Link to="/blogs" className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded transition-colors">
              <span className="text-lg">Blogs</span>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Read Blogs</span>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* CloseNet Info */}
      <Card>
        <CardBody className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About CloseNet</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Stay connected with friends and family. Share moments, join interest-based rooms, and create lasting memories together.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Features:</p>
            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <li>✨ Real-time chat rooms</li>
              <li>📸 Share posts & photos</li>
              <li>🎮 Mini-games & fun</li>
              <li>📧 Direct messaging</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
