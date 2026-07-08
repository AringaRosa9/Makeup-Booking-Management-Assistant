import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';

function EditModal({ title, item, fields, onSave, onClose }) {
  const [form, setForm] = useState(item || {});
  const handleSave = () => { onSave(form); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm text-gray-500 mb-1">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none h-20" placeholder={f.placeholder} />
            ) : (
              <input type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder={f.placeholder} />
            )}
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm">保存</button>
        </div>
      </div>
    </div>
  );
}

export default function Prices() {
  const { isAdmin } = useAuth();
  const [types, setTypes] = useState([]);
  const [extras, setExtras] = useState([]);
  const [editModal, setEditModal] = useState(null);

  const load = () => {
    api.getTypes().then(setTypes).catch(() => {});
    api.getExtras().then(setExtras).catch(() => {});
  };
  useEffect(load, []);

  const typeFields = [
    { key: 'name', label: '妆型名称', placeholder: '如：新娘妆' },
    { key: 'price', label: '价格（元）', type: 'number', placeholder: '0' },
    { key: 'description', label: '描述', type: 'textarea', placeholder: '可选，如包含哪些服务' },
  ];
  const extraFields = [
    { key: 'name', label: '服务名称', placeholder: '如：上门服务' },
    { key: 'price', label: '加收金额（元）', type: 'number', placeholder: '0' },
    { key: 'description', label: '描述', type: 'textarea', placeholder: '可选' },
  ];

  const handleSaveType = async (form) => {
    try {
      if (form.id) await api.updateType(form.id, form);
      else await api.addType(form);
      load(); setEditModal(null);
    } catch (e) { alert(e.message); }
  };

  const handleSaveExtra = async (form) => {
    try {
      if (form.id) await api.updateExtra(form.id, form);
      else await api.addExtra(form);
      load(); setEditModal(null);
    } catch (e) { alert(e.message); }
  };

  const handleDeleteType = async (id) => {
    if (!confirm('确定删除？')) return;
    try { await api.deleteType(id); load(); } catch (e) { alert(e.message); }
  };

  const handleDeleteExtra = async (id) => {
    if (!confirm('确定删除？')) return;
    try { await api.deleteExtra(id); load(); } catch (e) { alert(e.message); }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'active' ? 'paused' : 'active';
    try { await api.updateType(item.id, { status: newStatus }); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">妆价列表</h1>
        {isAdmin && (
          <button onClick={() => setEditModal({ type: 'type', item: null })} className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg">+ 添加妆型</button>
        )}
      </div>

      {types.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">暂无妆型</div>}
      <div className="space-y-3 mb-6">
        {types.map(t => (
          <div key={t.id} className={`bg-white rounded-xl p-4 shadow-sm ${t.status === 'paused' ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{t.name}</span>
                  {t.status === 'paused' && <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">暂不接单</span>}
                </div>
                {t.description && <p className="text-sm text-gray-400 mt-1">{t.description}</p>}
              </div>
              <span className="text-lg font-semibold text-[var(--color-primary-dark)]">¥{t.price}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => setEditModal({ type: 'type', item: t })} className="text-xs text-gray-400">编辑</button>
                <button onClick={() => handleToggleStatus(t)} className="text-xs text-gray-400">{t.status === 'active' ? '暂停接单' : '恢复接单'}</button>
                <button onClick={() => handleDeleteType(t.id)} className="text-xs text-red-400">删除</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">附加服务</h2>
        {isAdmin && (
          <button onClick={() => setEditModal({ type: 'extra', item: null })} className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg">+ 添加服务</button>
        )}
      </div>

      {extras.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">暂无附加服务</div>}
      <div className="space-y-3">
        {extras.map(e => (
          <div key={e.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="font-medium text-gray-800">{e.name}</span>
                {e.description && <p className="text-sm text-gray-400 mt-1">{e.description}</p>}
              </div>
              <span className="text-lg font-semibold text-[var(--color-primary-dark)]">+¥{e.price}</span>
            </div>
            {isAdmin && (
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => setEditModal({ type: 'extra', item: e })} className="text-xs text-gray-400">编辑</button>
                <button onClick={() => handleDeleteExtra(e.id)} className="text-xs text-red-400">删除</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editModal?.type === 'type' && (
        <EditModal title={editModal.item ? '编辑妆型' : '添加妆型'} item={editModal.item} fields={typeFields} onSave={handleSaveType} onClose={() => setEditModal(null)} />
      )}
      {editModal?.type === 'extra' && (
        <EditModal title={editModal.item ? '编辑附加服务' : '添加附加服务'} item={editModal.item} fields={extraFields} onSave={handleSaveExtra} onClose={() => setEditModal(null)} />
      )}
    </div>
  );
}
