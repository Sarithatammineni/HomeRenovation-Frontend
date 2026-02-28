import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Plus, Loader2, Trash2, Pencil, X, CheckSquare,
  AlertCircle, Calendar, User, Flag, Search, CheckCircle2, Circle
} from 'lucide-react';

const PRIORITIES = ['low','medium','high'];
const STATUSES   = ['todo','in_progress','done'];

const PRI_META = {
  high:   { cls: 'bg-danger-light text-danger border border-danger/20',   dot: 'bg-danger' },
  medium: { cls: 'bg-warning-light text-warning border border-warning/20', dot: 'bg-warning' },
  low:    { cls: 'bg-dark-100 text-dark-500 border border-dark-200',       dot: 'bg-dark-400' },
};
const STA_META = {
  todo:        { label: 'To Do',       cls: 'bg-dark-100 text-dark-500' },
  in_progress: { label: 'In Progress', cls: 'bg-info-light text-info' },
  done:        { label: 'Done',        cls: 'bg-success-light text-success' },
};

const EMPTY = { name:'', description:'', project_id:'', priority:'medium', status:'todo', assignee:'', due_date:'' };
function fmtDate(d){ return d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'; }


const SAMPLE_PROJECTS = [
  { id:'sproj-1', name:'Kitchen Renovation' },
  { id:'sproj-2', name:'Master Bedroom Repaint' },
  { id:'sproj-3', name:'Bathroom Waterproofing' },
  { id:'sproj-4', name:'Living Room False Ceiling' },
];
const SAMPLE_TASKS = [
  { id:'stask-1',  name:'Finalise tile selection for kitchen floor',  description:'Visit Kajaria and Orientbell showrooms. Decide on 60×60 vitrified.',    project_id:'sproj-1', priority:'high',   status:'todo',        assignee:'Ravi Kumar',   due_date: new Date(Date.now()+5*86400000).toISOString().split('T')[0],  projects:{ name:'Kitchen Renovation' } },
  { id:'stask-2',  name:'Get 3 quotes from plumbers',                 description:'Reach out to Ravi, Suresh, and one more. Compare rates for pipe work.',  project_id:'sproj-1', priority:'high',   status:'in_progress', assignee:'Self',          due_date: new Date(Date.now()+2*86400000).toISOString().split('T')[0],  projects:{ name:'Kitchen Renovation' } },
  { id:'stask-3',  name:'Order modular kitchen cabinets',             description:'Finalise design with IKEA / local carpenter. Delivery lead time: 3 wks.', project_id:'sproj-1', priority:'high',   status:'todo',        assignee:'Anita Sharma',  due_date: new Date(Date.now()+10*86400000).toISOString().split('T')[0], projects:{ name:'Kitchen Renovation' } },
  { id:'stask-4',  name:'Buy primer and wall putty (2 bags)',         description:'Asian Paints Primer + JK Wall Putty. Purchase from Hira Paints.',         project_id:'sproj-2', priority:'medium', status:'todo',        assignee:'Self',          due_date: new Date(Date.now()+3*86400000).toISOString().split('T')[0],  projects:{ name:'Master Bedroom Repaint' } },
  { id:'stask-5',  name:'Sand and clean bedroom walls',               description:'Use 80-grit sandpaper on all four walls. Fill cracks with putty.',        project_id:'sproj-2', priority:'medium', status:'done',        assignee:'Mohammed Farooq',due_date: new Date(Date.now()-2*86400000).toISOString().split('T')[0],  projects:{ name:'Master Bedroom Repaint' } },
  { id:'stask-6',  name:'Apply first coat of emulsion',               description:'Asian Paints Royale Ivory White, 2 coats. Allow 6h drying between coats.',project_id:'sproj-2', priority:'medium', status:'in_progress', assignee:'Mohammed Farooq',due_date: new Date(Date.now()+1*86400000).toISOString().split('T')[0],  projects:{ name:'Master Bedroom Repaint' } },
  { id:'stask-7',  name:'Schedule waterproofing contractor visit',    description:'Call Deepak and Sanjay for site inspection and quote.',                    project_id:'sproj-3', priority:'medium', status:'todo',        assignee:'Self',          due_date: new Date(Date.now()+7*86400000).toISOString().split('T')[0],  projects:{ name:'Bathroom Waterproofing' } },
  { id:'stask-8',  name:'Hack existing floor tiles in bathroom',      description:'Remove existing tiles carefully. Dispose of debris same day.',             project_id:'sproj-3', priority:'high',   status:'todo',        assignee:'Sanjay Mehta', due_date: new Date(Date.now()+14*86400000).toISOString().split('T')[0], projects:{ name:'Bathroom Waterproofing' } },
  { id:'stask-9',  name:'Approve false ceiling design layout',        description:'Review 3D render from Anita. Confirm cove light positions.',               project_id:'sproj-4', priority:'low',    status:'in_progress', assignee:'Self',          due_date: new Date(Date.now()+6*86400000).toISOString().split('T')[0],  projects:{ name:'Living Room False Ceiling' } },
  { id:'stask-10', name:'Order gypsum boards and metal framework',    description:'Saint-Gobain Gyproc 12.5mm. Get 10% extra for wastage.',                  project_id:'sproj-4', priority:'low',    status:'todo',        assignee:'Vijay Nair',   due_date: new Date(Date.now()+20*86400000).toISOString().split('T')[0], projects:{ name:'Living Room False Ceiling' } },
];

function Modal({ title, onClose, onSave, form, setForm, saving, projects }) {
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
            <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Order backsplash tiles"/>
          </div>
          <div>
            <label className="label">Project *</label>
            <select className="field" value={form.project_id} onChange={e=>setForm(f=>({...f,project_id:e.target.value}))}>
              <option value="">— Select project —</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="field" value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}>
                {PRIORITIES.map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="field" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {STATUSES.map(s=><option key={s} value={s}>{STA_META[s].label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assignee</label>
              <input className="field" value={form.assignee} onChange={e=>setForm(f=>({...f,assignee:e.target.value}))} placeholder="Name or email"/>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input className="field" type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))}/>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="field resize-none" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Additional notes…"/>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving||!form.name.trim()||!form.project_id}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    try {
      setError('');
      const [t, p] = await Promise.all([api.tasks.list(), api.projects.list()]);
      setTasks(t); setProjects(p);
    } catch(e) {
      setTasks(SAMPLE_TASKS);
      setProjects(SAMPLE_PROJECTS);
      setError(e.message);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (t) => { setForm({name:t.name,description:t.description||'',project_id:t.project_id||'',priority:t.priority,status:t.status,assignee:t.assignee||'',due_date:t.due_date||''}); setModal(t); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal==='add') await api.tasks.create(form);
      else await api.tasks.update(modal.id, form);
      setModal(null); await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const toggleDone = async (t) => {
    if (String(t.id).startsWith('stask-')) { setTasks(prev=>prev.map(x=>x.id===t.id?{...x,status:x.status==='done'?'todo':'done'}:x)); return; }
    try { await api.tasks.update(t.id, { status: t.status==='done' ? 'todo' : 'done' }); await load(); }
    catch(e) { setError(e.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this task?')) return;
    if (String(id).startsWith('stask-')) { setTasks(p=>p.filter(t=>t.id!==id)); return; }
    try { await api.tasks.delete(id); await load(); }
    catch(e) { setError(e.message); }
  };

  const filtered = tasks
    .filter(t => filter==='all' || t.status===filter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const counts = { all: tasks.length, todo: tasks.filter(t=>t.status==='todo').length, in_progress: tasks.filter(t=>t.status==='in_progress').length, done: tasks.filter(t=>t.status==='done').length };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Tasks</h1>
          <p className="text-dark-400 text-sm mt-1">{tasks.length} task{tasks.length!==1?'s':''} across all projects</p>
        </div>
        <button onClick={openAdd} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> Add Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
          <input className="field pl-10" placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-2 bg-dark-50 rounded-2xl p-1">
          {(['all','todo','in_progress','done']).map(s=>(
            <button key={s} onClick={()=>setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter===s?'bg-white shadow text-dark-900':'text-dark-400 hover:text-dark-700'}`}>
              {s==='all'?'All':STA_META[s]?.label} <span className="ml-1 text-dark-300">{counts[s]}</span>
            </button>
          ))}
        </div>
      </div>


      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="card p-4 animate-pulse flex gap-3"><div className="skeleton w-5 h-5 rounded-full flex-shrink-0"/><div className="flex-1 space-y-2"><div className="skeleton h-4 w-1/2 rounded"/><div className="skeleton h-3 w-1/3 rounded"/></div></div>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <CheckSquare className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No tasks found</p>
          <p className="text-dark-300 text-sm mt-1">Add tasks with priorities, due dates and assignees</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t=>(
            <div key={t.id} className={`card p-4 flex items-start gap-3 hover:shadow-pop transition-shadow ${t.status==='done'?'opacity-60':''}`}>
              <button onClick={()=>toggleDone(t)} className="mt-0.5 flex-shrink-0 text-dark-300 hover:text-success transition-colors">
                {t.status==='done' ? <CheckCircle2 className="w-5 h-5 text-success"/> : <Circle className="w-5 h-5"/>}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className={`font-medium text-dark-900 ${t.status==='done'?'line-through':''}`}>{t.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRI_META[t.priority]?.cls}`}>{t.priority}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STA_META[t.status]?.cls}`}>{STA_META[t.status]?.label}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-dark-400">
                  {t.projects?.name && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-400 inline-block"/>{ t.projects.name}</span>}
                  {t.assignee && <span className="flex items-center gap-1"><User className="w-3 h-3"/>{t.assignee}</span>}
                  {t.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/>{fmtDate(t.due_date)}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={()=>openEdit(t)} className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-400 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                <button onClick={()=>del(t.id)}   className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <Modal title={modal==='add'?'New Task':'Edit Task'} onClose={()=>setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving} projects={projects}/>}
    </div>
  );
}
