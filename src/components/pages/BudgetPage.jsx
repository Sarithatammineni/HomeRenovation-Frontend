import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Loader2, Trash2, X, DollarSign, AlertCircle, Search, TrendingUp } from 'lucide-react';

const CATEGORIES = ['Materials','Labour','Equipment','Permits','Design','Other'];
const EMPTY = { description:'', project_id:'', category:'Materials', amount:'', expense_date: new Date().toISOString().split('T')[0] };
const fmt = (n) => `₹${Number(n||0).toLocaleString('en-IN')}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—';

const CAT_COLORS = {
  Materials: 'bg-brand-100 text-brand-600',
  Labour:    'bg-info-light text-info',
  Equipment: 'bg-warning-light text-warning',
  Permits:   'bg-danger-light text-danger',
  Design:    'bg-success-light text-success',
  Other:     'bg-dark-100 text-dark-500',
};


const SAMPLE_PROJECTS = [
  { id:'sproj-1', name:'Kitchen Renovation' },
  { id:'sproj-2', name:'Master Bedroom Repaint' },
  { id:'sproj-3', name:'Bathroom Waterproofing' },
];
const SAMPLE_EXPENSES = [
  { id:'sexp-1',  description:'Kajaria floor tiles 60×60 (45 sqft)',      category:'Materials', amount:18500, expense_date: new Date(Date.now()-1*86400000).toISOString().split('T')[0], projects:{ name:'Kitchen Renovation' } },
  { id:'sexp-2',  description:'Plumber labour — demo and rough-in',        category:'Labour',    amount:8000,  expense_date: new Date(Date.now()-2*86400000).toISOString().split('T')[0], projects:{ name:'Kitchen Renovation' } },
  { id:'sexp-3',  description:'Asian Paints Royale Ivory White 10L',       category:'Materials', amount:5200,  expense_date: new Date(Date.now()-3*86400000).toISOString().split('T')[0], projects:{ name:'Master Bedroom Repaint' } },
  { id:'sexp-4',  description:'Electrician — 4 new power points',          category:'Labour',    amount:4500,  expense_date: new Date(Date.now()-4*86400000).toISOString().split('T')[0], projects:{ name:'Kitchen Renovation' } },
  { id:'sexp-5',  description:'Cabinet hardware (handles & hinges)',        category:'Materials', amount:2300,  expense_date: new Date(Date.now()-5*86400000).toISOString().split('T')[0], projects:{ name:'Kitchen Renovation' } },
  { id:'sexp-6',  description:'JK Wall Putty 3 bags',                      category:'Materials', amount:1800,  expense_date: new Date(Date.now()-6*86400000).toISOString().split('T')[0], projects:{ name:'Master Bedroom Repaint' } },
  { id:'sexp-7',  description:'Waterproofing membrane — Dr. Fixit 20L',    category:'Materials', amount:6500,  expense_date: new Date(Date.now()-7*86400000).toISOString().split('T')[0], projects:{ name:'Bathroom Waterproofing' } },
  { id:'sexp-8',  description:'Painter labour — putty + 2 coats',          category:'Labour',    amount:12000, expense_date: new Date(Date.now()-8*86400000).toISOString().split('T')[0], projects:{ name:'Master Bedroom Repaint' } },
  { id:'sexp-9',  description:'Interior design consultation fee',           category:'Design',    amount:15000, expense_date: new Date(Date.now()-9*86400000).toISOString().split('T')[0], projects:{ name:'Kitchen Renovation' } },
  { id:'sexp-10', description:'CPVC pipes and fittings',                    category:'Materials', amount:3200,  expense_date: new Date(Date.now()-10*86400000).toISOString().split('T')[0],projects:{ name:'Bathroom Waterproofing' } },
  { id:'sexp-11', description:'Angle grinder rental (3 days)',              category:'Equipment', amount:900,   expense_date: new Date(Date.now()-11*86400000).toISOString().split('T')[0],projects:{ name:'Bathroom Waterproofing' } },
  { id:'sexp-12', description:'Building permit application fee',            category:'Permits',   amount:2500,  expense_date: new Date(Date.now()-12*86400000).toISOString().split('T')[0],projects:{ name:'Kitchen Renovation' } },
];
const SAMPLE_SUMMARY = {
  total: 80400,
  byCategory: { Materials: 37500, Labour: 24500, Design: 15000, Equipment: 900, Permits: 2500, Other: 0 },
};

function Modal({ onClose, onSave, form, setForm, saving, projects }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-pop w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-100">
          <h2 className="font-display text-xl font-bold text-dark-900">Log Expense</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-50 text-dark-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Description *</label>
            <input className="field" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="e.g. Marble tiles for kitchen floor"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Project *</label>
              <select className="field" value={form.project_id} onChange={e=>setForm(f=>({...f,project_id:e.target.value}))}>
                <option value="">— Select —</option>
                {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="field" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount (₹) *</label>
              <input className="field" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="5000"/>
            </div>
            <div>
              <label className="label">Date</label>
              <input className="field" type="date" value={form.expense_date} onChange={e=>setForm(f=>({...f,expense_date:e.target.value}))}/>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving||!form.description.trim()||!form.project_id||!form.amount}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : 'Log Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary,  setSummary]  = useState({ total: 0, byCategory: {} });
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    try {
      setError('');
      const [e, p, s] = await Promise.all([api.expenses.list(), api.projects.list(), api.expenses.summary()]);
      setExpenses(e); setProjects(p); setSummary(s);
    } catch(e) {
      setExpenses(SAMPLE_EXPENSES);
      setProjects(SAMPLE_PROJECTS);
      setSummary(SAMPLE_SUMMARY);
      setError(e.message);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const save = async () => {
    setSaving(true);
    try { await api.expenses.create(form); setModal(false); await load(); }
    catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this expense?')) return;
    if (String(id).startsWith('sexp-')) { setExpenses(p=>p.filter(e=>e.id!==id)); return; }
    try { await api.expenses.delete(id); await load(); }
    catch(e) { setError(e.message); }
  };

  const filtered = expenses.filter(e => e.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Budget & Expenses</h1>
          <p className="text-dark-400 text-sm mt-1">Total spent: {fmt(summary.total)}</p>
        </div>
        <button onClick={()=>{ setForm(EMPTY); setModal(true); }} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> Log Expense
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map(cat=>(
          <div key={cat} className="card p-4 text-center">
            <div className={`text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block ${CAT_COLORS[cat]}`}>{cat}</div>
            <div className="font-display font-bold text-dark-900 text-sm">{fmt(summary.byCategory?.[cat]||0)}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
        <input className="field pl-10" placeholder="Search expenses…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>


      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_,i)=><div key={i} className="card p-4 animate-pulse flex gap-3"><div className="skeleton h-4 flex-1 rounded"/><div className="skeleton h-4 w-24 rounded"/></div>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <DollarSign className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No expenses logged yet</p>
          <p className="text-dark-300 text-sm mt-1">Track spending across all your renovation projects</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-100">
              <tr>
                {['Description','Project','Category','Amount','Date',''].map(h=>(
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-50">
              {filtered.map(e=>(
                <tr key={e.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-dark-900">{e.description}</td>
                  <td className="px-4 py-3 text-dark-500">{e.projects?.name||'—'}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CAT_COLORS[e.category]||'bg-dark-100 text-dark-500'}`}>{e.category}</span></td>
                  <td className="px-4 py-3 font-mono font-semibold text-dark-900">{fmt(e.amount)}</td>
                  <td className="px-4 py-3 text-dark-400">{fmtDate(e.expense_date)}</td>
                  <td className="px-4 py-3">
                    <button onClick={()=>del(e.id)} className="p-1.5 rounded-lg hover:bg-danger-light text-dark-300 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && <Modal onClose={()=>setModal(false)} onSave={save} form={form} setForm={setForm} saving={saving} projects={projects}/>}
    </div>
  );
}
