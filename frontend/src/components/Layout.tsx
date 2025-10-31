import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';
import { NotificationsBell } from './NotificationsBell';
import Sidebar from './Sidebar';
import { Trends } from './Trends';

export function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                Marwadi Connect Pro
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <NavLink to="/home" className={linkClass}>Home</NavLink>
              <NavLink to="/feed" className={linkClass}>Feed</NavLink>
              <NavLink to="/blogs" className={linkClass}>Blogs</NavLink>
              <NavLink to="/rooms" className={linkClass}>Rooms</NavLink>
              <NavLink to="/search" className={linkClass}>Search</NavLink>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={toggle} size="sm">
                {theme === 'light' ? '🌙' : '☀️'}
              </Button>

              {isAuthenticated ? (
                <>
                  <NotificationsBell />
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to={`/profile/${user?._id}`} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                          Profile
                        </Link>
                        <Link to="/blogs/new" className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                          Write Blog
                        </Link>
                        <button onClick={logout} className="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6">
                {children}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <Trends />
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-2">
        <div className="flex justify-around items-center">
          <NavLink to="/home" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </NavLink>
          <NavLink to="/feed" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400">
            <span className="text-xl">📱</span>
            <span className="text-xs mt-1">Feed</span>
          </NavLink>
          <NavLink to="/search" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400">
            <span className="text-xl">🔍</span>
            <span className="text-xs mt-1">Search</span>
          </NavLink>
          <NavLink to="/rooms" className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400">
            <span className="text-xl">💬</span>
            <span className="text-xs mt-1">Rooms</span>
          </NavLink>
          {isAuthenticated && (
            <NavLink to={`/profile/${user?._id}`} className="flex flex-col items-center p-2 text-gray-600 dark:text-gray-400">
              <span className="text-xl">👤</span>
              <span className="text-xs mt-1">Profile</span>
            </NavLink>
          )}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-16"></div>
    </div>
  );
}



