'use client';

import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../../lib/dataUtils';

interface Props {
  onLogin: (user: { role: string }) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('dashboardUser', JSON.stringify({ role: 'admin' }));
        onLogin({ role: 'admin' });
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác!');
      }
      setLoading(false);
    }, 300);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-indigo-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Shield className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Đăng Nhập</h2>
          <p className="text-indigo-100 text-sm mt-1">Truy cập Dashboard Quản Trị</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên đăng nhập</label>
            <input
              type="text"
              autoFocus
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="Nhập tên tài khoản..."
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-rose-500 text-xs font-bold text-center mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold rounded-lg p-3 hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  );
}
