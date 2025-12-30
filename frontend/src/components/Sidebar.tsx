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
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="w-full justify-start bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                    ⚙️ Admin Panel
                  </Button>
                </Link>
              )}
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
      {/* Removed - Profile will be accessible from top nav */}

      {/* Platform Info */}
      {/* Moved to HomePage */}
    </div>
  );
}


