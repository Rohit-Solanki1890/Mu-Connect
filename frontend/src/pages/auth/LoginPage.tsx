import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setLoading(true);
    try {
        await login(email.trim(), password.trim());
      navigate('/feed');
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.errors?.[0]?.msg 
          || (err?.message === 'Network Error' ? 'Cannot connect to server' : err?.message)
          || 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Login</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}



