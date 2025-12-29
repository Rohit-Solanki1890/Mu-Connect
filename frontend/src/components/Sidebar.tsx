import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Card, CardBody } from './ui/Card';
import { Button } from './ui/Button';

const publicNavItems = [
  { name: "Home", path: "/home", icon: "🏠", description: "Welcome page" },
  { name: "Explore", path: "/search", icon: "🔍", description: "Discover content" },
];

const authNavItems = [
  { name: "Home", path: "/home", icon: "🏠", description: "Welcome page" },
  { name: "Feed", path: "/feed", icon: "📱", description: "Latest posts" },
  { name: "Messages", path: "/messages", icon: "💬", description: "Chat with friends" },
  { name: "People", path: "/people", icon: "👥", description: "Find & follow users" },
  { name: "Rooms", path: "/rooms", icon: "🎮", description: "Chat & games" },
  { name: "Search", path: "/search", icon: "🔍", description: "Find anything" },
];

export default function Sidebar() {
  const { isAuthenticated, user } = useAuth();
  const navItems = isAuthenticated ? authNavItems : publicNavItems;

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      {isAuthenticated && (
        <Card>
          <CardBody className="p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/feed">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  ✍️ Create Post
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  💬 Send Message
                </Button>
              </Link>
              <Link to="/rooms">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  🎮 Join Room
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardBody className="p-4">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Navigation</h3>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                </div>
              </Link>
            ))}
          </nav>
        </CardBody>
      </Card>

      {/* Profile Summary */}
      {isAuthenticated && user && (
        <Card>
          <CardBody className="p-4">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Your Profile</h3>
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</div>
              </div>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Platform Info */}
      <Card>
        <CardBody className="p-4">
          <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">About Platform</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>🎓</span>
              <span>For Marwadi Students</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span>Real-time Chat</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🎮</span>
              <span>Interactive Games</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📚</span>
              <span>Knowledge Sharing</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}


