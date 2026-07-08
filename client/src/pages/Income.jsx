import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { api } from '../api';

export default function Income() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [summary, setSummary] = useState(null);
  const [details, setDetails] = useState({ appointments: [], manual_records: [] });
  const [tab, setTab] = useState('overview');
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ date: dayjs().format('YYYY-MM-DD'), client_name: '', makeup_type: '', amount: '', notes: '' });

  useEffect(() => {
    api.getIncomeSummary(month).then(setSummary).catch(() => {});
    api.getIncomeDetails(month).then(setDetails).catch(() => {});
  }, [month]);

  const handleAddManual = async () => {
    if (!manualForm.amount) { alert('请填写金额'); return; }
    try {
      await api.addManualIncome({ ...manualForm, amount: Number(manualForm.amount) });
      setShowManual(false);
      setManualForm({ date: dayjs().format('YYYY-MM-DD'), client_name: '', makeup_type: '', amount: '', notes: '' });
      api.getIncomeSummary(month).then(setSummary).catch(() => {});
      api.getIncomeDetails(month).then(setDetails).catch(() => {});
    } catch (e) { alert(e.message); }
  };

  const handleDeleteManual = async (id) => {
    if (!confirm('确定删除？')) return;
    try {
      await api.deleteManualIncome(id);
      api.getIncomeSummary(month).then(setSummary).catch(() => {});
      api.getIncomeDetails(month).then(setDetails).catch(() => {});
    } catch (e) { alert(e.message); }
  };

  const statusLabel = { confirmed: '已确认', completed: '已完成' };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">收入统计</h1>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(dayjs(month).subtract(1, 'month').format('YYYY-MM'))} className="text-gray-400 text-sm">&lt; 上月</button>
        <span className="font-medium text-gray-700">{month}</span>
        <button onClick={() => setMonth(dayjs(month).add(1, 'month').format('YYYY-MM'))} className="text-gray-400 text-sm">下月 &gt;</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('overview')} className={`flex-1 py-2 text-sm rounded-lg ${tab === 'overview' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>概览</button>
        <button onClick={() => setTab('details')} className={`flex-1 py-2 text-sm rounded-lg ${tab === 'details' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>明细</button>
      </div>

      {tab === 'overview' && summary && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">预期收入</div>
              <div className="text-xl font-semibold text-[var(--color-primary-dark)]">¥{summary.expected_income}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">已完成收入</div>
              <div className="text-xl font-semibold text-green-500">¥{summary.completed_income}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">线下记账</div>
              <div className="text-xl font-semibold text-blue-500">¥{summary.manual_income}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">总收入</div>
              <div className="text-xl font-semibold text-gray-800">¥{summary.total_income}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-semibold text-gray-800">{summary.appointment_count}</div>
              <div className="text-xs text-gray-400 mt-1">预约数</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-semibold text-red-400">{summary.cancelled_count}</div>
              <div className="text-xs text-gray-400 mt-1">取消数</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div className="space-y-3">
          <button onClick={() => setShowManual(true)} className="w-full py-2 bg-white rounded-xl text-sm text-[var(--color-primary-dark)] shadow-sm border border-dashed border-[var(--color-primary)]">+ 手动记账</button>

          {details.appointments.length === 0 && details.manual_records.length === 0 && (
            <div className="text-center text-gray-400 py-8 text-sm">暂无收入记录</div>
          )}

          {details.appointments.map(a => (
            <div key={`a-${a.id}`} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">{a.date} {a.start_time}</span>
                  <span className="text-xs text-gray-400 ml-2">{a.nickname}</span>
                </div>
                <span className="font-semibold text-[var(--color-primary-dark)]">¥{a.total_price}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{a.makeup_name} · {statusLabel[a.status]}</div>
            </div>
          ))}

          {details.manual_records.map(m => (
            <div key={`m-${m.id}`} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">{m.date}</span>
                  {m.client_name && <span className="text-xs text-gray-400 ml-2">{m.client_name}</span>}
                  <span className="text-xs text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded ml-2">线下</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-500">¥{m.amount}</span>
                  <button onClick={() => handleDeleteManual(m.id)} className="text-xs text-red-400">删除</button>
                </div>
              </div>
              {m.makeup_type && <div className="text-xs text-gray-400 mt-1">{m.makeup_type}</div>}
              {m.notes && <div className="text-xs text-gray-400 mt-1">{m.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {showManual && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4">
            <h3 className="text-lg font-semibold">手动记账</h3>
            <div>
              <label className="block text-sm text-gray-500 mb-1">日期 *</label>
              <input type="date" value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">客户名称</label>
              <input type="text" value={manualForm.client_name} onChange={e => setManualForm({ ...manualForm, client_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="选填" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">妆型</label>
              <input type="text" value={manualForm.makeup_type} onChange={e => setManualForm({ ...manualForm, makeup_type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="选填" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">金额 *</label>
              <input type="number" value={manualForm.amount} onChange={e => setManualForm({ ...manualForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">备注</label>
              <input type="text" value={manualForm.notes} onChange={e => setManualForm({ ...manualForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="选填" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowManual(false)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
              <button onClick={handleAddManual} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
