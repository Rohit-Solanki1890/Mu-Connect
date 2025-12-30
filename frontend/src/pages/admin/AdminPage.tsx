import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-kingdom.css';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  isApproved?: boolean;
  college?: string;
  year?: string;
  specialAccess?: {
    type: 'premium' | 'moderator' | 'content_creator';
    expiresAt?: Date;
    permanent: boolean;
  };
  createdAt?: string;
}

interface Stats {
  users: { total: number; active: number; admins: number; inactive: number };
  posts: { total: number; reported: number };
  blogs: { total: number; published: number };
  rooms: { total: number; active: number };
  notifications: number;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessData, setAccessData] = useState({ type: 'premium', permanent: true, days: 30 });
  const [showSecretChatModal, setShowSecretChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Verify admin access
  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = '/';
    }
  }, [user]);

  // ==================== QUERIES ====================

  const statsQuery = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data?.data as Stats;
    },
    retry: 2,
  });

  const pendingQuery = useQuery({
    queryKey: ['adminPending'],
    queryFn: async () => {
      const res = await api.get('/admin/pending-users');
      return res.data?.data || [];
    },
    retry: 2,
  });

  const usersQuery = useQuery({
    queryKey: ['adminUsers', searchQuery],
    queryFn: async () => {
      const res = await api.get(`/admin/users?search=${searchQuery}`);
      return res.data?.data || [];
    },
    retry: 2,
  });

  // ==================== MUTATIONS ====================

  // APPROVE pending user
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post(`/admin/approve-user/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPending'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('✅ User Approved!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || 'Approval failed'}`);
    },
  });

  // REJECT pending user
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post(`/admin/reject-user/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPending'] });
      alert('✅ User Rejected!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || 'Rejection failed'}`);
    },
  });

  // GRANT special access to user
  const grantAccessMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) throw new Error('No user selected');
      const expiryDate = accessData.permanent ? null : new Date(Date.now() + accessData.days * 24 * 60 * 60 * 1000);
      return api.post(`/admin/grant-access/${selectedUser._id}`, {
        accessType: accessData.type,
        permanent: accessData.permanent,
        expiresAt: expiryDate
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert(`✅ Special Access Granted for ${accessData.days} days!`);
      setShowAccessModal(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || 'Grant access failed'}`);
    },
  });

  // REVOKE special access
  const revokeAccessMutation = useMutation({
    mutationFn: async (userId: string) => {
      return api.post(`/admin/revoke-access/${userId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert('✅ Special Access Revoked!');
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || 'Revoke access failed'}`);
    },
  });

  // SEND secret chat invitation
  const sendSecretChatMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !chatMessage.trim()) throw new Error('Invalid input');
      return api.post(`/admin/send-secret-invite/${selectedUser._id}`, {
        message: chatMessage
      });
    },
    onSuccess: () => {
      alert('✅ Secret Chat Invitation Sent!');
      setShowSecretChatModal(false);
      setChatMessage('');
      setSelectedUser(null);
    },
    onError: (error: any) => {
      alert(`❌ Error: ${error.response?.data?.message || 'Invite failed'}`);
    },
  });

  // ==================== PENDING TAB ====================

  const renderPendingTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">⏳ Pending Registrations</h2>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold">
          {pendingQuery.data?.length || 0} Pending
        </span>
      </div>

      {pendingQuery.isLoading && <div className="text-center py-8">⏳ Loading...</div>}
      {pendingQuery.error && <div className="text-center py-8 text-red-600">❌ Error loading pending users</div>}

      {pendingQuery.data && pendingQuery.data.length === 0 && (
        <div className="bg-green-50 border-2 border-green-200 p-8 rounded-lg text-center">
          <p className="text-green-700 font-semibold text-lg">✅ No pending registrations!</p>
          <p className="text-green-600 text-sm mt-1">All users have been approved</p>
        </div>
      )}

      {pendingQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingQuery.data.map((u: User) => (
            <div key={u._id} className="admin-card bg-yellow-50 border-2 border-yellow-300">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">{u.name}</h3>
                <p className="text-gray-600 text-sm">{u.email}</p>
                {u.college && <p className="text-gray-500 text-xs mt-1">📚 {u.college} | {u.year}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate(u._id)}
                  disabled={approveMutation.isPending}
                  className="flex-1 admin-btn admin-btn-success"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate(u._id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1 admin-btn admin-btn-danger"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== USERS TAB (MANAGE ACCESS & INVITES) ====================

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600">👥 Manage Users</h2>
      </div>

      <input
        type="text"
        placeholder="🔍 Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 outline-none"
      />

      {usersQuery.isLoading && <div className="text-center py-8">⏳ Loading...</div>}
      {usersQuery.error && <div className="text-center py-8 text-red-600">❌ Error loading users</div>}

      {usersQuery.data && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left font-bold">Name</th>
                <th className="px-4 py-3 text-left font-bold">Email</th>
                <th className="px-4 py-3 text-left font-bold">Access</th>
                <th className="px-4 py-3 text-left font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data.map((u: User) => (
                <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.specialAccess ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                        🔓 {u.specialAccess.type} {u.specialAccess.permanent ? '(Permanent)' : '(Temp)'}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">No special access</span>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowAccessModal(true);
                      }}
                      className="admin-btn admin-btn-primary text-xs px-2 py-1"
                    >
                      🔐 Grant Access
                    </button>
                    {u.specialAccess && (
                      <button
                        onClick={() => revokeAccessMutation.mutate(u._id)}
                        className="admin-btn admin-btn-danger text-xs px-2 py-1"
                      >
                        ⛔ Revoke
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowSecretChatModal(true);
                      }}
                      className="admin-btn admin-btn-secondary text-xs px-2 py-1"
                    >
                      💬 Secret Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ==================== DASHBOARD TAB ====================

  const renderDashboardTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-indigo-600 mb-6">📊 Dashboard</h2>

      {statsQuery.isLoading && <div className="text-center py-8">⏳ Loading...</div>}
      {statsQuery.error && <div className="text-center py-8 text-red-600">❌ Error loading stats</div>}

      {statsQuery.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '👥', label: 'Total Users', value: statsQuery.data.users.total },
            { icon: '✅', label: 'Active Users', value: statsQuery.data.users.active },
            { icon: '👨‍💼', label: 'Admins', value: statsQuery.data.users.admins },
            { icon: '📝', label: 'Posts', value: statsQuery.data.posts.total },
            { icon: '⚠️', label: 'Reported', value: statsQuery.data.posts.reported },
            { icon: '📚', label: 'Blogs', value: statsQuery.data.blogs.total },
          ].map((stat, idx) => (
            <div key={idx} className="admin-card">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">{stat.value}</p>
                </div>
                <p className="text-4xl">{stat.icon}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== MODALS ====================

  // Grant Access Modal
  const GrantAccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="admin-card max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">🔐 Grant Special Access</h3>
        <p className="text-gray-600 mb-4">User: <strong>{selectedUser?.name}</strong></p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Access Type:</label>
            <select
              value={accessData.type}
              onChange={(e) => setAccessData({ ...accessData, type: e.target.value as any })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-indigo-500 outline-none"
            >
              <option value="premium">💎 Premium Features</option>
              <option value="moderator">🛡️ Moderator Tools</option>
              <option value="content_creator">✍️ Content Creator Suite</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={accessData.permanent}
                onChange={(e) => setAccessData({ ...accessData, permanent: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">Permanent Access</span>
            </label>
          </div>

          {!accessData.permanent && (
            <div>
              <label className="block text-sm font-semibold mb-2">Duration (Days):</label>
              <input
                type="number"
                min="1"
                max="365"
                value={accessData.days}
                onChange={(e) => setAccessData({ ...accessData, days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-indigo-500 outline-none"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={() => grantAccessMutation.mutate()}
              disabled={grantAccessMutation.isPending}
              className="flex-1 admin-btn admin-btn-success"
            >
              ✅ Grant
            </button>
            <button
              onClick={() => setShowAccessModal(false)}
              className="flex-1 admin-btn admin-btn-secondary"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Secret Chat Invitation Modal
  const SecretChatModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="admin-card max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">💬 Send Secret Chat Invitation</h3>
        <p className="text-gray-600 mb-4">User: <strong>{selectedUser?.name}</strong></p>

        <div className="space-y-4">
          <textarea
            placeholder="Write an invitation message..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:border-indigo-500 outline-none min-h-24 resize-none"
          />

          <div className="flex gap-2">
            <button
              onClick={() => sendSecretChatMutation.mutate()}
              disabled={sendSecretChatMutation.isPending || !chatMessage.trim()}
              className="flex-1 admin-btn admin-btn-success"
            >
              📤 Send Invite
            </button>
            <button
              onClick={() => setShowSecretChatModal(false)}
              className="flex-1 admin-btn admin-btn-secondary"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏛️ Admin Control Panel</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! 👋</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200 pb-4 overflow-x-auto">
          {[
            { id: 'pending', label: '⏳ Pending Approvals', icon: '📋' },
            { id: 'users', label: '👥 Manage Users', icon: '⚙️' },
            { id: 'dashboard', label: '📊 Dashboard', icon: '📈' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-semibold whitespace-nowrap rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'pending' && renderPendingTab()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'dashboard' && renderDashboardTab()}
        </div>
      </div>

      {/* Modals */}
      {showAccessModal && <GrantAccessModal />}
      {showSecretChatModal && <SecretChatModal />}
    </div>
  );
};

export { AdminPage };
