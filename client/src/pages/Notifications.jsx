import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { api } from '../api';

export default function Notifications() {
  const [items, setItems] = useState([]);

  const load = () => { api.getNotifications().then(setItems).catch(() => {}); };
  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    try { await api.markRead(id); load(); } catch {}
  };

  const handleReadAll = async () => {
    try { await api.markAllRead(); load(); } catch {}
  };

  const unreadCount = items.filter(n => !n.is_read).length;

  const typeIcon = {
    new_appointment: '📅',
    status_change: '🔔',
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">消息通知</h1>
        {unreadCount > 0 && (
          <button onClick={handleReadAll} className="text-sm text-[var(--color-primary-dark)]">全部已读</button>
        )}
      </div>

      {items.length === 0 && <div className="text-center text-gray-400 py-12 text-sm">暂无消息</div>}

      <div className="space-y-2">
        {items.map(n => (
          <div
            key={n.id}
            onClick={() => !n.is_read && handleRead(n.id)}
            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-colors ${!n.is_read ? 'border-l-3 border-[var(--color-primary)]' : 'opacity-70'}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{typeIcon[n.type] || '📢'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${!n.is_read ? 'text-gray-800' : 'text-gray-500'}`}>{n.title}</span>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0" />}
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{n.content}</p>
                <span className="text-xs text-gray-300 mt-1 block">{dayjs(n.created_at).format('MM-DD HH:mm')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
