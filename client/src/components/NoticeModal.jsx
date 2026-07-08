import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';

export default function NoticeModal({ onConfirm }) {
  const { isAdmin } = useAuth();
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotice().then(n => { setContent(n.content); setEditContent(n.content); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await api.updateNotice(editContent);
      setContent(editContent);
      setEditing(false);
    } catch (e) { alert(e.message); }
  };

  if (loading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold">注意事项</h2>
          {isAdmin && !editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-[var(--color-primary-dark)]">编辑</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {editing ? (
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="w-full h-48 p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="请输入注意事项..."
            />
          ) : (
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{content || '暂无注意事项'}</div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm">保存</button>
            </>
          ) : (
            <button onClick={onConfirm} className="w-full py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium">我已知晓</button>
          )}
        </div>
      </div>
    </div>
  );
}
