import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/app';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/v1/auth/login', {
        email,
        password,
      });

      const { access_token, user } = response.data.data;
      login(access_token, user);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please verify your access.');
      } else {
        setError('Authentication service unavailable. Contact system administrator.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded shadow-2xl p-8">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-950 text-blue-500 rounded flex items-center justify-center mb-4 border border-blue-900">
            <ShieldAlert size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-100 tracking-wide">AEGISGRID</h1>
          <h2 className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest text-center">Energy Supply Resilience</h2>
          <p className="text-xs text-slate-500 mt-4 text-center">Monitor disruption. Model consequences. Decide with confidence.</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 px-4 py-3 rounded text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Operator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="operator@aegisgrid.local"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
              Passphrase
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm py-2.5 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

      </div>
      
      <div className="mt-8 text-xs text-slate-600 flex space-x-4">
        <span>AegisGrid Operational Platform</span>
        <span>•</span>
        <span>Secure Access Only</span>
      </div>
    </div>
  );
}
