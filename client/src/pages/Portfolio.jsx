import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';

export default function Portfolio() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);
  const [filter, setFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ makeup_type_id: '', description: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const load = () => {
    api.getPortfolio(filter || undefined).then(setItems).catch(() => {});
    api.getTypes().then(setTypes).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const handleUpload = async () => {
    if (!file) { alert('请选择图片'); return; }
    const fd = new FormData();
    fd.append('image', file);
    if (uploadForm.makeup_type_id) fd.append('makeup_type_id', uploadForm.makeup_type_id);
    if (uploadForm.description) fd.append('description', uploadForm.description);
    try {
      await api.addPortfolio(fd);
      setShowUpload(false);
      setFile(null);
      setPreview(null);
      setUploadForm({ makeup_type_id: '', description: '' });
      load();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定删除这张作品？')) return;
    try { await api.deletePortfolio(id); load(); } catch (e) { alert(e.message); }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    }
  };

  const grouped = {};
  items.forEach(item => {
    const key = item.makeup_type_name || '其他';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">作品集</h1>
        {isAdmin && (
          <button onClick={() => setShowUpload(true)} className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg">+ 上传作品</button>
        )}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilter('')} className={`shrink-0 px-3 py-1.5 text-sm rounded-lg ${!filter ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>全部</button>
        {types.map(t => (
          <button key={t.id} onClick={() => setFilter(String(t.id))} className={`shrink-0 px-3 py-1.5 text-sm rounded-lg ${filter === String(t.id) ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>{t.name}</button>
        ))}
      </div>

      {items.length === 0 && <div className="text-center text-gray-400 py-12 text-sm">暂无作品</div>}

      {filter ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <img src={`/uploads/${item.image_path}`} className="w-full aspect-square object-cover" alt="" />
              {item.description && <p className="p-2 text-xs text-gray-500">{item.description}</p>}
              {isAdmin && (
                <div className="px-2 pb-2">
                  <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400">删除</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([typeName, groupItems]) => (
          <div key={typeName} className="mb-6">
            <h2 className="text-sm font-medium text-gray-600 mb-2">{typeName}</h2>
            <div className="grid grid-cols-2 gap-3">
              {groupItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                  <img src={`/uploads/${item.image_path}`} className="w-full aspect-square object-cover" alt="" />
                  {item.description && <p className="p-2 text-xs text-gray-500">{item.description}</p>}
                  {isAdmin && (
                    <div className="px-2 pb-2">
                      <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400">删除</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-lg font-semibold">上传作品</h3>
            <div>
              <label className="block text-sm text-gray-500 mb-1">选择图片 *</label>
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500" />
              {preview && <img src={preview} className="w-full max-h-48 object-contain mt-2 rounded-lg" alt="" />}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">所属妆型</label>
              <select value={uploadForm.makeup_type_id} onChange={e => setUploadForm({ ...uploadForm, makeup_type_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--color-primary)]">
                <option value="">不分类</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">描述</label>
              <input type="text" value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="选填" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowUpload(false); setFile(null); setPreview(null); }} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
              <button onClick={handleUpload} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm">上传</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
