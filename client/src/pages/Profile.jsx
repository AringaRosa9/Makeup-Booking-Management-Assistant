import { useAuth } from '../auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">我的</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center">
            <span className="text-xl text-[var(--color-primary-dark)]">{user?.nickname?.[0] || '?'}</span>
          </div>
          <div>
            <div className="font-medium text-gray-800 text-lg">{user?.nickname}</div>
            <div className="text-sm text-gray-400">{user?.phone}</div>
            {isAdmin && <span className="text-xs text-[var(--color-primary-dark)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded mt-1 inline-block">管理员</span>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isAdmin && (
          <button onClick={() => navigate('/prices')} className="w-full px-5 py-4 flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 text-left">
            <span>管理妆价</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        )}
        {isAdmin && (
          <button onClick={() => navigate('/booking')} className="w-full px-5 py-4 flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 text-left">
            <span>管理预约</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        )}
        {isAdmin && (
          <button onClick={() => navigate('/income')} className="w-full px-5 py-4 flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 text-left">
            <span>收入统计</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        )}
        <button onClick={() => navigate('/reviews')} className="w-full px-5 py-4 flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 text-left">
          <span>{isAdmin ? '管理评价' : '我的评价'}</span>
          <span className="text-gray-300">&gt;</span>
        </button>
        {isAdmin && (
          <button onClick={() => navigate('/share')} className="w-full px-5 py-4 flex items-center justify-between text-sm text-gray-700 border-b border-gray-50 text-left">
            <span>分享获客</span>
            <span className="text-gray-300">&gt;</span>
          </button>
        )}
        <button onClick={handleLogout} className="w-full px-5 py-4 flex items-center justify-between text-sm text-red-400 text-left">
          <span>退出登录</span>
          <span className="text-gray-300">&gt;</span>
        </button>
      </div>
    </div>
  );
}
