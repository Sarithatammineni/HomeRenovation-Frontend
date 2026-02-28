import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import {
  Plus, Loader2, Trash2, Pencil, X, FolderKanban,
  Calendar, DollarSign, AlertCircle, CheckCircle2, Clock, Search
} from 'lucide-react';

const STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed'];
const STATUS_META = {
  planning:  { label: 'Planning',   cls: 'bg-info-light text-info border border-info/20' },
  active:    { label: 'Active',     cls: 'bg-success-light text-success border border-success/20' },
  on_hold:   { label: 'On Hold',    cls: 'bg-warning-light text-warning border border-warning/20' },
  completed: { label: 'Completed',  cls: 'bg-dark-100 text-dark-500 border border-dark-200' },
};
const COLORS = ['#c17b3a','#2d6a4f','#5c4b8a','#b94040','#d4a017','#3a7cb8'];
const EMPTY = { name:'', description:'', budget:'', deadline:'', status:'planning', color:'#c17b3a' };

const SAMPLE_PROJECTS = [
  { id:'sproj-1', name:'Kitchen Renovation',        description:'Full kitchen remodel including new cabinets, countertops, and appliances.',    status:'active',    budget:350000, deadline: new Date(Date.now()+60*86400000).toISOString().split('T')[0], color:'#c17b3a', _sample:true },
  { id:'sproj-2', name:'Master Bedroom Repaint',    description:'Repaint walls, ceiling, and trim. New curtains and lighting fixtures.',        status:'active',    budget:45000,  deadline: new Date(Date.now()+20*86400000).toISOString().split('T')[0], color:'#2d6a4f', _sample:true },
  { id:'sproj-3', name:'Bathroom Waterproofing',    description:'Waterproof the master bathroom floor and walls before re-tiling.',              status:'planning',  budget:80000,  deadline: new Date(Date.now()+45*86400000).toISOString().split('T')[0], color:'#5c4b8a', _sample:true },
  { id:'sproj-4', name:'Living Room False Ceiling', description:'Install gypsum false ceiling with cove lighting in the main living area.',      status:'on_hold',   budget:120000, deadline: new Date(Date.now()+90*86400000).toISOString().split('T')[0], color:'#b94040', _sample:true },
  { id:'sproj-5', name:'Front Gate & Compound Wall',description:'New MS fabricated gate with intercom and compound wall plastering.',             status:'completed', budget:95000,  deadline: new Date(Date.now()-10*86400000).toISOString().split('T')[0], color:'#3a7cb8', _sample:true },
  { id:'sproj-6', name:'Balcony Waterproofing',     description:'Waterproof balcony floor and parapet walls. Add drain channels.',               status:'planning',  budget:35000,  deadline: new Date(Date.now()+30*86400000).toISOString().split('T')[0], color:'#d4a017', _sample:true },
];

function fmt(n) { return n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '—'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'; }

function Modal({ title, onClose, onSave, form, setForm, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-pop w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-100">
          <h2 className="font-display text-xl font-bold text-dark-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-50 text-dark-400 transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Kitchen Remodel"/>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="field resize-none" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief project overview…"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Budget (₹)</label>
              <input className="field" type="number" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))} placeholder="250000"/>
            </div>
            <div>
              <label className="label">Deadline</label>
              <input className="field" type="date" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="field" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                {STATUS_OPTIONS.map(s=><option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 mt-1.5">
                {COLORS.map(c=>(
                  <button key={c} onClick={()=>setForm(f=>({...f,color:c}))}
                    className={`w-7 h-7 rounded-full transition-all ${form.color===c?'ring-2 ring-offset-2 ring-dark-400 scale-110':''}`}
                    style={{background:c}}/>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving||!form.name.trim()}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    try {
      setError('');
      const d = await api.projects.list();
      setProjects(d);
    } catch(e) {
      setProjects(SAMPLE_PROJECTS);
      setError(e.message);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (p) => { setForm({name:p.name,description:p.description||'',budget:p.budget||'',deadline:p.deadline||'',status:p.status,color:p.color||'#c17b3a'}); setModal(p); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal==='add') await api.projects.create(form);
      else await api.projects.update(modal.id, form);
      setModal(null); await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this project?')) return;
    if (String(id).startsWith('sproj-')) { setProjects(p=>p.filter(x=>x.id!==id)); return; }
    try { await api.projects.delete(id); await load(); }
    catch(e) { setError(e.message); }
  };

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Projects</h1>
          <p className="text-dark-400 text-sm mt-1">{projects.length} renovation project{projects.length!==1?'s':''}</p>
        </div>
        <button onClick={openAdd} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> New Project
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
        <input className="field pl-10" placeholder="Search projects…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>


      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i)=><div key={i} className="card p-5 space-y-3 animate-pulse"><div className="skeleton h-5 w-2/3 rounded"/><div className="skeleton h-3 w-full rounded"/><div className="skeleton h-3 w-1/2 rounded"/></div>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <FolderKanban className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No projects yet</p>
          <p className="text-dark-300 text-sm mt-1">Create your first renovation project to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p=>(
            <div key={p.id} className="card p-5 border-t-4 hover:shadow-pop transition-shadow" style={{borderTopColor:p.color||'#c17b3a'}}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display font-bold text-dark-900 text-lg leading-tight pr-2">{p.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_META[p.status]?.cls||''}`}>
                  {STATUS_META[p.status]?.label||p.status}
                </span>
              </div>
              {p.description && <p className="text-dark-400 text-sm mb-3 line-clamp-2">{p.description}</p>}
              <div className="space-y-1.5 text-xs text-dark-500">
                <div className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-dark-300"/>{fmt(p.budget)}</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-dark-300"/>{fmtDate(p.deadline)}</div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-dark-100">
                <button onClick={()=>openEdit(p)} className="flex-1 btn-ghost text-xs py-1.5 rounded-xl"><Pencil className="w-3.5 h-3.5"/>Edit</button>
                <button onClick={()=>del(p.id)} className="flex-1 btn-ghost text-xs py-1.5 rounded-xl text-danger hover:bg-danger-light hover:text-danger"><Trash2 className="w-3.5 h-3.5"/>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <Modal title={modal==='add'?'New Project':'Edit Project'} onClose={()=>setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving}/>}
    </div>
  );
}
