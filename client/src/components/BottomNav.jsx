import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth';

export default function BottomNav() {
  const { isAdmin } = useAuth();
  const base = 'flex flex-col items-center gap-0.5 text-xs py-2 px-3 transition-colors';
  const active = 'text-[var(--color-primary-dark)] font-medium';
  const inactive = 'text-gray-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center z-50 max-w-[48rem] mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <NavLink to="/prices" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v2m0 8v2m-3.5-8.5h7a1.5 1.5 0 010 3h-5a1.5 1.5 0 000 3h7"/></svg>
        <span>妆价</span>
      </NavLink>
      <NavLink to="/booking" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <span>预约</span>
      </NavLink>
      {isAdmin && (
        <NavLink to="/income" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          <span>收入</span>
        </NavLink>
      )}
      <NavLink to="/profile" className={({ isActive }) => `${base} ${isActive ? active : inactive}`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>我的</span>
      </NavLink>
    </nav>
  );
}
