import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export default function Share() {
  const [config, setConfig] = useState({ title: '', description: '' });
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    api.getShareConfig().then(c => { setConfig(c); setEditForm({ title: c.title, description: c.description }); }).catch(() => {});
  }, []);

  const shareUrl = `${window.location.origin}/register`;

  const handleSave = async () => {
    try {
      await api.updateShareConfig(editForm);
      setConfig(editForm);
      setEditing(false);
    } catch (e) { alert(e.message); }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">分享获客</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-600">分享信息</h2>
          {!editing && <button onClick={() => setEditing(true)} className="text-sm text-[var(--color-primary-dark)]">编辑</button>}
        </div>
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1">标题</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">描述</label>
              <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20 focus:outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
              <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm">保存</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-lg font-medium text-gray-800">{config.title}</div>
            <div className="text-sm text-gray-400 mt-1">{config.description}</div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
        <h2 className="text-sm font-medium text-gray-600 mb-3">专属链接</h2>
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 break-all mb-3">{shareUrl}</div>
        <button onClick={handleCopy} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-green-50 text-green-500' : 'bg-[var(--color-primary)] text-white'}`}>
          {copied ? '已复制' : '复制链接'}
        </button>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-medium text-gray-600 mb-3">二维码</h2>
        <div className="flex justify-center" ref={qrRef}>
          <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">客户扫码即可访问您的页面</p>
      </div>
    </div>
  );
}
