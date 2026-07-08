import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      navigate('/prices');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--color-primary-dark)]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">接妆管理助手</h1>
          <p className="text-sm text-gray-400 mt-1">登录你的账号</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2.5 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm text-gray-500 mb-1">手机号</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="请输入手机号" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="请输入密码" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? '登录中...' : '登录'}
          </button>
          <p className="text-center text-sm text-gray-400">
            还没有账号？<Link to="/register" className="text-[var(--color-primary-dark)]">立即注册</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
