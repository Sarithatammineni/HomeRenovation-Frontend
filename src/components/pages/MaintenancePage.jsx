// frontend/src/components/pages/MaintenancePage.jsx
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Loader2, Trash2, Pencil, X, Wrench, Calendar, RefreshCw } from 'lucide-react';

const FREQUENCIES = ['Weekly','Monthly','Quarterly','Semi-Annual','Annual','As Needed'];
const EMPTY = { name:'', description:'', frequency:'Monthly', last_date:'', next_date:'', notes:'' };

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';
function daysUntil(d) {
  if (!d) return null;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
}

function DueBadge({ date }) {
  if (!date) return <span className="text-dark-400 text-xs">No date set</span>;
  const days = daysUntil(date);
  if (days < 0)  return <span className="text-xs font-semibold text-danger flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-danger inline-block"/>Overdue by {Math.abs(days)}d</span>;
  if (days <= 7) return <span className="text-xs font-semibold text-warning flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-warning inline-block"/>Due in {days}d</span>;
  return <span className="text-xs text-dark-400 flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmtDate(date)}</span>;
}

function Modal({ title, onClose, onSave, form, setForm, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-pop w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-100">
          <h2 className="font-display text-xl font-bold text-dark-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-50 text-dark-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Task Name *</label>
            <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. HVAC filter replacement"/>
          </div>
          <div>
            <label className="label">Frequency</label>
            <select className="field" value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))}>
              {FREQUENCIES.map(fr=><option key={fr} value={fr}>{fr}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Last Done</label>
              <input className="field" type="date" value={form.last_date} onChange={e=>setForm(f=>({...f,last_date:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Next Due</label>
              <input className="field" type="date" value={form.next_date} onChange={e=>setForm(f=>({...f,next_date:e.target.value}))}/>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="field resize-none" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Service provider, parts needed…"/>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving||!form.name.trim()}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    try { const d = await api.maintenance.list(); setTasks(d); }
    catch(e) { console.error('Maintenance fetch error:', e.message); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (t) => { setForm({name:t.name,description:t.description||'',frequency:t.frequency||'Monthly',last_date:t.last_date||'',next_date:t.next_date||'',notes:t.notes||''}); setModal(t); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal==='add') await api.maintenance.create(form);
      else await api.maintenance.update(modal.id, form);
      setModal(null); await load();
    } catch(e) { console.error('Save error:', e.message); }
    finally { setSaving(false); }
  };

  const markDone = async (t) => {
    const today = new Date().toISOString().split('T')[0];
    try { await api.maintenance.update(t.id, { last_date: today }); await load(); }
    catch(e) { console.error('Mark done error:', e.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this maintenance task?')) return;
    try { await api.maintenance.delete(id); await load(); }
    catch(e) { console.error('Delete error:', e.message); }
  };

  const overdue = tasks.filter(t => t.next_date && daysUntil(t.next_date) < 0);
  const upcoming = tasks.filter(t => !t.next_date || daysUntil(t.next_date) >= 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Maintenance</h1>
          <p className="text-dark-400 text-sm mt-1">{tasks.length} recurring task{tasks.length!==1?'s':''}{overdue.length>0?` · ${overdue.length} overdue`:''}</p>
        </div>
        <button onClick={openAdd} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> Add Task
        </button>
      </div>


      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="card p-5 animate-pulse space-y-2"><div className="skeleton h-4 w-1/2 rounded"/><div className="skeleton h-3 w-1/3 rounded"/></div>)}</div>
      ) : tasks.length===0 ? (
        <div className="text-center py-20">
          <Wrench className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No maintenance tasks yet</p>
          <p className="text-dark-300 text-sm mt-1">Schedule recurring home maintenance reminders</p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-danger uppercase tracking-wider mb-3">⚠️ Overdue ({overdue.length})</h2>
              <TaskList tasks={overdue} openEdit={openEdit} del={del} markDone={markDone}/>
            </div>
          )}
          {upcoming.length > 0 && (
            <div>
              {overdue.length > 0 && <h2 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>}
              <TaskList tasks={upcoming} openEdit={openEdit} del={del} markDone={markDone}/>
            </div>
          )}
        </div>
      )}

      {modal && <Modal title={modal==='add'?'Add Maintenance Task':'Edit Task'} onClose={()=>setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving}/>}
    </div>
  );
}

function TaskList({ tasks, openEdit, del, markDone }) {
  return (
    <div className="space-y-3">
      {tasks.map(t=>(
        <div key={t.id} className="card p-5 flex items-center gap-4 hover:shadow-pop transition-shadow">
          <div className="w-10 h-10 bg-brand-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Wrench className="w-5 h-5 text-brand-600"/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-dark-900">{t.name}</div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className="flex items-center gap-1 text-dark-400"><RefreshCw className="w-3 h-3"/>{t.frequency}</span>
              {t.last_date && <span className="text-dark-400">Last: {fmtDate(t.last_date)}</span>}
              <DueBadge date={t.next_date}/>
            </div>
            {t.notes && <p className="text-xs text-dark-400 italic mt-1 line-clamp-1">{t.notes}</p>}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={()=>markDone(t)} className="text-xs px-3 py-1.5 bg-success-light text-success rounded-xl font-semibold hover:bg-success/20 transition-colors">Done</button>
            <button onClick={()=>openEdit(t)} className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-400 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
            <button onClick={()=>del(t.id)} className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
          </div>
        </div>
      ))}
    </div>
  );
}
