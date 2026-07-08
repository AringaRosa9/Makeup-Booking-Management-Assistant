import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { api } from '../api';
import { useAuth } from '../auth';

function AdminBooking() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [dates, setDates] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [tab, setTab] = useState('schedule');
  const [editDate, setEditDate] = useState(null);
  const [slots, setSlots] = useState([{ start_time: '09:00', end_time: '10:00' }]);

  const loadDates = () => api.getAvailableDates(month).then(setDates).catch(() => {});
  const loadAppointments = () => api.getAppointments({ month }).then(setAppointments).catch(() => {});
  useEffect(() => { loadDates(); loadAppointments(); }, [month]);

  const daysInMonth = useMemo(() => {
    const start = dayjs(month + '-01');
    const days = [];
    for (let i = 0; i < start.daysInMonth(); i++) {
      days.push(start.add(i, 'day').format('YYYY-MM-DD'));
    }
    return days;
  }, [month]);

  const dateSet = new Set(dates.map(d => d.date));
  const firstDayOffset = dayjs(month + '-01').day();

  const handleSaveSlots = async () => {
    if (!editDate) return;
    try {
      await api.setAvailableDate({ date: editDate, slots });
      setEditDate(null);
      loadDates();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteDate = async (date) => {
    if (!confirm('确定移除该日期？')) return;
    try { await api.deleteAvailableDate(date); loadDates(); } catch (e) { alert(e.message); }
  };

  const handleStatus = async (id, status) => {
    try { await api.updateAppointmentStatus(id, status); loadAppointments(); } catch (e) { alert(e.message); }
  };

  const addSlot = () => setSlots([...slots, { start_time: '09:00', end_time: '10:00' }]);
  const removeSlot = (i) => setSlots(slots.filter((_, idx) => idx !== i));
  const updateSlot = (i, field, val) => {
    const n = [...slots]; n[i] = { ...n[i], [field]: val }; setSlots(n);
  };

  const statusLabel = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' };
  const statusColor = { pending: 'text-orange-500 bg-orange-50', confirmed: 'text-blue-500 bg-blue-50', completed: 'text-green-500 bg-green-50', cancelled: 'text-gray-400 bg-gray-50' };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('schedule')} className={`flex-1 py-2 text-sm rounded-lg ${tab === 'schedule' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>排期管理</button>
        <button onClick={() => setTab('list')} className={`flex-1 py-2 text-sm rounded-lg ${tab === 'list' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>预约列表</button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMonth(dayjs(month).subtract(1, 'month').format('YYYY-MM'))} className="text-gray-400 text-sm">&lt; 上月</button>
        <span className="font-medium text-gray-700">{month}</span>
        <button onClick={() => setMonth(dayjs(month).add(1, 'month').format('YYYY-MM'))} className="text-gray-400 text-sm">下月 &gt;</button>
      </div>

      {tab === 'schedule' && (
        <>
          <div className="bg-white rounded-xl p-3 shadow-sm mb-4">
            <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
              {['日','一','二','三','四','五','六'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
              {daysInMonth.map(day => {
                const isAvailable = dateSet.has(day);
                const isPast = dayjs(day).isBefore(dayjs(), 'day');
                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isPast) return;
                      if (isAvailable) { handleDeleteDate(day); }
                      else { setEditDate(day); setSlots([{ start_time: '09:00', end_time: '18:00' }]); }
                    }}
                    className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-colors
                      ${isPast ? 'text-gray-300 cursor-default' : isAvailable ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-medium' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    {dayjs(day).date()}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[var(--color-primary-light)]" /> 可接妆</span>
              <span>点击日期设置/取消</span>
            </div>
          </div>

          {editDate && (
            <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5">
                <h3 className="text-lg font-semibold mb-4">设置 {editDate} 的可约时间</h3>
                <div className="space-y-3 mb-4">
                  {slots.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={s.start_time} onChange={e => updateSlot(i, 'start_time', e.target.value)} className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm" />
                      <span className="text-gray-400">至</span>
                      <input type="time" value={s.end_time} onChange={e => updateSlot(i, 'end_time', e.target.value)} className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm" />
                      {slots.length > 1 && <button onClick={() => removeSlot(i)} className="text-red-400 text-sm">删除</button>}
                    </div>
                  ))}
                </div>
                <button onClick={addSlot} className="text-sm text-[var(--color-primary-dark)] mb-4">+ 添加时间段</button>
                <div className="flex gap-2">
                  <button onClick={() => setEditDate(null)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500">取消</button>
                  <button onClick={handleSaveSlots} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm">保存</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'list' && (
        <div className="space-y-3">
          {appointments.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">暂无预约</div>}
          {appointments.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-medium text-gray-800">{a.nickname}</span>
                  <span className="text-sm text-gray-400 ml-2">{a.user_phone}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${statusColor[a.status]}`}>{statusLabel[a.status]}</span>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div>{a.date} {a.start_time}-{a.end_time}</div>
                <div>{a.makeup_name} · ¥{a.total_price}</div>
                {a.extras?.length > 0 && <div className="text-xs text-gray-400">附加：{a.extras.map(e => e.name).join('、')}</div>}
                {a.notes && <div className="text-xs text-gray-400">备注：{a.notes}</div>}
                {a.contact_wechat && <div className="text-xs text-gray-400">微信：{a.contact_wechat}</div>}
                {a.images?.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {a.images.map((img, i) => <img key={i} src={`/uploads/${img}`} className="w-16 h-16 rounded-lg object-cover" />)}
                  </div>
                )}
              </div>
              {a.status === 'pending' && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleStatus(a.id, 'confirmed')} className="flex-1 py-1.5 text-sm bg-blue-50 text-blue-500 rounded-lg">确认</button>
                  <button onClick={() => handleStatus(a.id, 'cancelled')} className="flex-1 py-1.5 text-sm bg-red-50 text-red-400 rounded-lg">取消</button>
                </div>
              )}
              {a.status === 'confirmed' && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleStatus(a.id, 'completed')} className="w-full py-1.5 text-sm bg-green-50 text-green-500 rounded-lg">标记完成</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientBooking() {
  const { user } = useAuth();
  const [step, setStep] = useState('calendar');
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [types, setTypes] = useState([]);
  const [extras, setExtras] = useState([]);
  const [form, setForm] = useState({ makeup_type_id: '', extra_ids: [], contact_phone: '', contact_wechat: '', notes: '' });
  const [images, setImages] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [tab, setTab] = useState('book');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getAvailableDates(month).then(setDates).catch(() => {});
  }, [month]);

  useEffect(() => {
    api.getTypes().then(setTypes).catch(() => {});
    api.getExtras().then(setExtras).catch(() => {});
    api.getAppointments({}).then(setMyAppointments).catch(() => {});
    if (user?.phone) setForm(f => ({ ...f, contact_phone: user.phone }));
  }, []);

  const daysInMonth = useMemo(() => {
    const start = dayjs(month + '-01');
    return Array.from({ length: start.daysInMonth() }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD'));
  }, [month]);

  const dateMap = {};
  dates.forEach(d => { dateMap[d.date] = d; });
  const firstDayOffset = dayjs(month + '-01').day();

  const selectedDateData = selectedDate ? dateMap[selectedDate] : null;

  const handleSubmit = async () => {
    if (!selectedSlot || !form.makeup_type_id) { alert('请选择时间和妆型'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('slot_id', selectedSlot);
      fd.append('makeup_type_id', form.makeup_type_id);
      fd.append('extra_service_ids', JSON.stringify(form.extra_ids));
      fd.append('contact_phone', form.contact_phone);
      fd.append('contact_wechat', form.contact_wechat);
      fd.append('notes', form.notes);
      images.forEach(f => fd.append('images', f));
      await api.createAppointment(fd);
      alert('预约成功！请等待化妆师确认');
      setStep('calendar'); setSelectedDate(null); setSelectedSlot(null);
      setForm({ makeup_type_id: '', extra_ids: [], contact_phone: user?.phone || '', contact_wechat: '', notes: '' });
      setImages([]);
      api.getAppointments({}).then(setMyAppointments).catch(() => {});
      api.getAvailableDates(month).then(setDates).catch(() => {});
    } catch (e) { alert(e.message); }
    setSubmitting(false);
  };

  const handleCancel = async (id) => {
    if (!confirm('确定取消预约？')) return;
    try { await api.cancelAppointment(id); api.getAppointments({}).then(setMyAppointments).catch(() => {}); } catch (e) { alert(e.message); }
  };

  const selectedType = types.find(t => t.id === Number(form.makeup_type_id));
  const selectedExtras = extras.filter(e => form.extra_ids.includes(e.id));
  const totalPrice = (selectedType?.price || 0) + selectedExtras.reduce((s, e) => s + e.price, 0);

  const statusLabel = { pending: '待确认', confirmed: '已确认', completed: '已完成', cancelled: '已取消' };
  const statusColor = { pending: 'text-orange-500 bg-orange-50', confirmed: 'text-blue-500 bg-blue-50', completed: 'text-green-500 bg-green-50', cancelled: 'text-gray-400 bg-gray-50' };

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('book')} className={`flex-1 py-2 text-sm rounded-lg ${tab === 'book' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>预约</button>
        <button onClick={() => setTab('my')} className={`flex-1 py-2 text-sm rounded-lg ${tab === 'my' ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-gray-500'}`}>我的预约</button>
      </div>

      {tab === 'book' && (
        <>
          {step === 'calendar' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setMonth(dayjs(month).subtract(1, 'month').format('YYYY-MM'))} className="text-gray-400 text-sm">&lt; 上月</button>
                <span className="font-medium text-gray-700">{month}</span>
                <button onClick={() => setMonth(dayjs(month).add(1, 'month').format('YYYY-MM'))} className="text-gray-400 text-sm">下月 &gt;</button>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-sm mb-4">
                <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                  {['日','一','二','三','四','五','六'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOffset }).map((_, i) => <div key={`e-${i}`} />)}
                  {daysInMonth.map(day => {
                    const dateInfo = dateMap[day];
                    const isPast = dayjs(day).isBefore(dayjs(), 'day');
                    const isAvailable = !!dateInfo && !isPast;
                    const allFull = dateInfo?.slots.every(s => s.booked_count >= s.max_capacity);
                    return (
                      <button
                        key={day}
                        disabled={!isAvailable || allFull}
                        onClick={() => { setSelectedDate(day); setSelectedSlot(null); }}
                        className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-colors
                          ${selectedDate === day ? 'bg-[var(--color-primary)] text-white' : ''}
                          ${isPast ? 'text-gray-300 cursor-default' : isAvailable && !allFull ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' : allFull && isAvailable ? 'bg-gray-100 text-gray-400' : 'text-gray-400 cursor-default'}`}
                      >
                        <span>{dayjs(day).date()}</span>
                        {allFull && isAvailable && <span className="text-[8px] leading-none">满</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[var(--color-primary-light)]" /> 可预约</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100" /> 已约满</span>
                </div>
              </div>

              {selectedDateData && (
                <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">{selectedDate} 可选时间</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDateData.slots.map(s => {
                      const full = s.booked_count >= s.max_capacity;
                      return (
                        <button
                          key={s.id}
                          disabled={full}
                          onClick={() => { setSelectedSlot(s.id); setStep('form'); }}
                          className={`py-2.5 rounded-lg text-sm transition-colors
                            ${full ? 'bg-gray-50 text-gray-300 cursor-default' : selectedSlot === s.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'}`}
                        >
                          {s.start_time}-{s.end_time}
                          {full && ' (已约)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'form' && (
            <div className="space-y-4">
              <button onClick={() => setStep('calendar')} className="text-sm text-gray-400">&lt; 返回选择时间</button>
              <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                <div className="text-sm text-gray-500">已选：{selectedDate} {selectedDateData?.slots.find(s => s.id === selectedSlot)?.start_time}-{selectedDateData?.slots.find(s => s.id === selectedSlot)?.end_time}</div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">选择妆型 *</label>
                  <select value={form.makeup_type_id} onChange={e => setForm({ ...form, makeup_type_id: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[var(--color-primary)]">
                    <option value="">请选择</option>
                    {types.filter(t => t.status === 'active').map(t => <option key={t.id} value={t.id}>{t.name} - ¥{t.price}</option>)}
                  </select>
                </div>
                {extras.length > 0 && (
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">附加服务</label>
                    <div className="space-y-2">
                      {extras.map(e => (
                        <label key={e.id} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={form.extra_ids.includes(e.id)} onChange={ev => {
                            setForm({ ...form, extra_ids: ev.target.checked ? [...form.extra_ids, e.id] : form.extra_ids.filter(id => id !== e.id) });
                          }} className="rounded accent-[var(--color-primary)]" />
                          <span>{e.name} (+¥{e.price})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-500 mb-1">联系电话 *</label>
                  <input type="tel" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">微信号</label>
                  <input type="text" value={form.contact_wechat} onChange={e => setForm({ ...form, contact_wechat: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)]" placeholder="选填" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">备注</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[var(--color-primary)] resize-none h-20" placeholder="如：偏好风格、角色名称等" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">参考图片（最多6张）</label>
                  <input type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files].slice(0, 6))} className="text-sm text-gray-500" />
                  {images.length > 0 && <div className="text-xs text-gray-400 mt-1">已选 {images.length} 张</div>}
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">费用明细</h3>
                {selectedType && <div className="flex justify-between text-sm text-gray-500"><span>{selectedType.name}</span><span>¥{selectedType.price}</span></div>}
                {selectedExtras.map(e => <div key={e.id} className="flex justify-between text-sm text-gray-500"><span>{e.name}</span><span>+¥{e.price}</span></div>)}
                <div className="flex justify-between text-base font-semibold text-gray-800 mt-2 pt-2 border-t border-gray-100"><span>合计</span><span className="text-[var(--color-primary-dark)]">¥{totalPrice}</span></div>
              </div>

              <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {submitting ? '提交中...' : '提交预约'}
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'my' && (
        <div className="space-y-3">
          {myAppointments.length === 0 && <div className="text-center text-gray-400 py-8 text-sm">暂无预约记录</div>}
          {myAppointments.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{a.date} {a.start_time}-{a.end_time}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${statusColor[a.status]}`}>{statusLabel[a.status]}</span>
              </div>
              <div className="text-sm text-gray-500">{a.makeup_name} · ¥{a.total_price}</div>
              {a.extras?.length > 0 && <div className="text-xs text-gray-400 mt-1">附加：{a.extras.map(e => e.name).join('、')}</div>}
              {a.notes && <div className="text-xs text-gray-400 mt-1">备注：{a.notes}</div>}
              {a.status === 'pending' && (
                <button onClick={() => handleCancel(a.id)} className="mt-3 w-full py-1.5 text-sm bg-red-50 text-red-400 rounded-lg">取消预约</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Booking() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminBooking /> : <ClientBooking />;
}
