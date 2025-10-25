import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { FeedPage } from './pages/feed/FeedPage';
import { BlogsPage } from './pages/blogs/BlogsPage';
import { BlogEditorPage } from './pages/blogs/BlogEditorPage';
import { RoomsPage } from './pages/rooms/RoomsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AdminPage } from './pages/admin/AdminPage';
import { SearchPage } from './pages/search/SearchPage';
import { Protected } from './components/Protected';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}>
            <Layout>
              <Suspense fallback={<div className="p-6">Loading...</div>}>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/feed" element={<FeedPage />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/new" element={<Protected><BlogEditorPage /></Protected>} />
                  <Route path="/rooms" element={<Protected><RoomsPage /></Protected>} />
                  <Route path="/admin" element={<Protected><AdminPage /></Protected>} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile/:id" element={<ProfilePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}



