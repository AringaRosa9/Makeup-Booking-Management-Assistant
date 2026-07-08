import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth';

export default function Register() {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(phone, nickname, password);
      navigate('/prices');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[var(--color-primary-dark)]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6m3-3h-6"/></svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">创建账号</h1>
          <p className="text-sm text-gray-400 mt-1">注册后即可查看妆价和预约</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          {error && <div className="text-sm text-red-500 bg-red-50 p-2.5 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm text-gray-500 mb-1">手机号</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="请输入手机号" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">昵称</label>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="请输入昵称" />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="至少6位" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {loading ? '注册中...' : '注册'}
          </button>
          <p className="text-center text-sm text-gray-400">
            已有账号？<Link to="/login" className="text-[var(--color-primary-dark)]">去登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
