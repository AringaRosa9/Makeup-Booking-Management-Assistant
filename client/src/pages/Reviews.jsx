import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { api } from '../api';
import { useAuth } from '../auth';

function Stars({ rating, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange?.(i)} className={`text-lg ${i <= rating ? 'text-yellow-400' : 'text-gray-200'} ${onChange ? 'cursor-pointer' : 'cursor-default'}`}>
          ★
        </button>
      ))}
    </div>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, avg_rating: 0, distribution: [] });

  const load = () => {
    api.getReviews({}).then(setReviews).catch(() => {});
    api.getReviewStats().then(setStats).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleToggle = async (id, current) => {
    try { await api.setReviewVisibility(id, !current); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">客户评价</h1>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-semibold text-[var(--color-primary-dark)]">{stats.avg_rating || '-'}</div>
            <div className="text-xs text-gray-400 mt-1">{stats.total} 条评价</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map(r => {
              const count = stats.distribution?.find(d => d.rating === r)?.count || 0;
              const pct = stats.total ? (count / stats.total * 100) : 0;
              return (
                <div key={r} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-400 w-4">{r}★</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5"><div className="bg-yellow-400 rounded-full h-1.5" style={{ width: `${pct}%` }} /></div>
                  <span className="text-gray-300 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {reviews.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">暂无评价</div>}

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center text-sm text-[var(--color-primary-dark)]">{r.nickname[0]}</div>
                <div>
                  <span className="text-sm font-medium text-gray-700">{r.nickname}</span>
                  <span className="text-xs text-gray-400 ml-2">{r.makeup_name}</span>
                </div>
              </div>
              <Stars rating={r.rating} />
            </div>
            {r.content && <p className="text-sm text-gray-500 mb-2">{r.content}</p>}
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>{dayjs(r.created_at).format('YYYY-MM-DD')}</span>
              <button onClick={() => handleToggle(r.id, r.is_public)} className={`px-2 py-0.5 rounded text-xs ${r.is_public ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>
                {r.is_public ? '公开' : '隐藏'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientReviews() {
  const [completedAppointments, setCompleted] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(null);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');

  const load = () => {
    api.getAppointments({ status: 'completed' }).then(setCompleted).catch(() => {});
    api.getReviews({ public_only: '1' }).then(setReviews).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const reviewedIds = new Set(reviews.map(r => r.appointment_id));

  const handleSubmit = async () => {
    try {
      await api.addReview({ appointment_id: showForm, rating, content });
      setShowForm(null);
      setRating(5);
      setContent('');
      load();
      alert('评价成功！');
    } catch (e) { alert(e.message); }
  };

  const unreviewedAppointments = completedAppointments.filter(a => !reviewedIds.has(a.id));

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">评价</h1>

      {unreviewedAppointments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-600 mb-2">待评价</h2>
          <div className="space-y-2">
            {unreviewedAppointments.map(a => (
              <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700">{a.date} {a.start_time}</div>
                  <div className="text-xs text-gray-400">{a.makeup_name} · ¥{a.total_price}</div>
                </div>
                <button onClick={() => { setShowForm(a.id); setRating(5); setContent(''); }} className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg">评价</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-sm font-medium text-gray-600 mb-2">全部评价</h2>
      {reviews.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">暂无评价</div>}
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center text-sm text-[var(--color-primary-dark)]">{r.nickname[0]}</div>
                <span className="text-sm font-medium text-gray-700">{r.nickname}</span>
              </div>
              <Stars rating={r.rating} />
            </div>
            {r.content && <p className="text-sm text-gray-500">{r.content}</p>}
            <div className="text-xs text-gray-300 mt-2">{r.makeup_name} · {dayjs(r.created_at).format('YYYY-MM-DD')}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-lg font-semibold">评价服务</h3>
            <div className="flex items-center justify-center py-2">
              <Stars rating={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">评价内容</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-24 focus:outline-none focus:border-[var(--color-primary)]" placeholder="分享你的体验..." />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
              <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm">提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reviews() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminReviews /> : <ClientReviews />;
}
