import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Loader2, Trash2, X, ShoppingCart, AlertCircle, Search, CheckCircle2, Circle, Pencil } from 'lucide-react';

const EMPTY = { name:'', project_id:'', quantity:'1', unit:'', estimated_cost:'', purchased:false };
const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';


const SAMPLE_PROJECTS = [
  { id:'sproj-1', name:'Kitchen Renovation' },
  { id:'sproj-2', name:'Master Bedroom Repaint' },
  { id:'sproj-3', name:'Bathroom Waterproofing' },
  { id:'sproj-4', name:'Living Room False Ceiling' },
];
const SAMPLE_ITEMS = [
  { id:'sshop-1',  name:'Kajaria Vitrified Floor Tiles 60×60 — Ivory Matt',  project_id:'sproj-1', quantity:55,  unit:'sqft',  estimated_cost:22000, purchased:false, projects:{ name:'Kitchen Renovation' } },
  { id:'sshop-2',  name:'Kitchen Sink — Stainless Steel Double Bowl',         project_id:'sproj-1', quantity:1,   unit:'pcs',   estimated_cost:8500,  purchased:false, projects:{ name:'Kitchen Renovation' } },
  { id:'sshop-3',  name:'Hindware Kitchen Tap (Pull-out)',                    project_id:'sproj-1', quantity:1,   unit:'pcs',   estimated_cost:4200,  purchased:false, projects:{ name:'Kitchen Renovation' } },
  { id:'sshop-4',  name:'Cabinet Handles — Brushed Nickel (Pair)',            project_id:'sproj-1', quantity:24,  unit:'pcs',   estimated_cost:3600,  purchased:false, projects:{ name:'Kitchen Renovation' } },
  { id:'sshop-5',  name:'Asian Paints Royale Emulsion — Ivory White 20L',    project_id:'sproj-2', quantity:1,   unit:'can',   estimated_cost:9800,  purchased:true,  projects:{ name:'Master Bedroom Repaint' } },
  { id:'sshop-6',  name:'JK Wall Putty 20kg bags',                           project_id:'sproj-2', quantity:3,   unit:'bags',  estimated_cost:2700,  purchased:true,  projects:{ name:'Master Bedroom Repaint' } },
  { id:'sshop-7',  name:'Paint Rollers + Trays (Set of 4)',                   project_id:'sproj-2', quantity:1,   unit:'set',   estimated_cost:850,   purchased:false, projects:{ name:'Master Bedroom Repaint' } },
  { id:'sshop-8',  name:'Masking Tape 2-inch (Pack of 6)',                    project_id:'sproj-2', quantity:1,   unit:'pack',  estimated_cost:420,   purchased:false, projects:{ name:'Master Bedroom Repaint' } },
  { id:'sshop-9',  name:'Dr. Fixit Waterproof Membrane 20L',                  project_id:'sproj-3', quantity:2,   unit:'cans',  estimated_cost:13000, purchased:false, projects:{ name:'Bathroom Waterproofing' } },
  { id:'sshop-10', name:'Anti-skid Bathroom Floor Tiles 30×30',               project_id:'sproj-3', quantity:35,  unit:'sqft',  estimated_cost:9100,  purchased:false, projects:{ name:'Bathroom Waterproofing' } },
  { id:'sshop-11', name:'Grohe Shower System (Head + Arm)',                   project_id:'sproj-3', quantity:1,   unit:'set',   estimated_cost:22000, purchased:false, projects:{ name:'Bathroom Waterproofing' } },
  { id:'sshop-12', name:'Saint-Gobain Gyproc 12.5mm (False Ceiling)',         project_id:'sproj-4', quantity:80,  unit:'sqft',  estimated_cost:6400,  purchased:false, projects:{ name:'Living Room False Ceiling' } },
  { id:'sshop-13', name:'LED Cove Light Strip — Warm White 5m',               project_id:'sproj-4', quantity:3,   unit:'rolls', estimated_cost:4500,  purchased:false, projects:{ name:'Living Room False Ceiling' } },
  { id:'sshop-14', name:'Metal Ceiling Grid (Main Runner + Cross Tee)',        project_id:'sproj-4', quantity:1,   unit:'lot',   estimated_cost:3200,  purchased:false, projects:{ name:'Living Room False Ceiling' } },
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
            <label className="label">Item Name *</label>
            <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Ceramic floor tiles 60x60cm"/>
          </div>
          <div>
            <label className="label">Project</label>
            <select className="field" value={form.project_id} onChange={e=>setForm(f=>({...f,project_id:e.target.value}))}>
              <option value="">— Select project —</option>
              {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Qty</label>
              <input className="field" type="number" min="1" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="field" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="pcs / sqft"/>
            </div>
            <div>
              <label className="label">Est. Cost (₹)</label>
              <input className="field" type="number" value={form.estimated_cost} onChange={e=>setForm(f=>({...f,estimated_cost:e.target.value}))} placeholder="2500"/>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving||!form.name.trim()}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : 'Save Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShoppingPage() {
  const [items,    setItems]    = useState([]);
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
      const [it, pr] = await Promise.all([api.shopping.list(), api.projects.list()]);
      setItems(it); setProjects(pr);
    } catch(e) {
      setItems(SAMPLE_ITEMS);
      setProjects(SAMPLE_PROJECTS);
      setError(e.message);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (it) => { setForm({ name:it.name, project_id:it.project_id||'', quantity:it.quantity||'1', unit:it.unit||'', estimated_cost:it.estimated_cost||'', purchased:it.purchased||false }); setModal(it); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal==='add') await api.shopping.create(form);
      else await api.shopping.update(modal.id, form);
      setModal(null); await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const togglePurchased = async (it) => {
    if (String(it.id).startsWith('sshop-')) { setItems(prev=>prev.map(x=>x.id===it.id?{...x,purchased:!x.purchased}:x)); return; }
    try { await api.shopping.update(it.id, { purchased: !it.purchased }); await load(); }
    catch(e) { setError(e.message); }
  };

  const del = async (id) => {
    if (!confirm('Remove this item?')) return;
    if (String(id).startsWith('sshop-')) { setItems(p=>p.filter(i=>i.id!==id)); return; }
    try { await api.shopping.delete(id); await load(); }
    catch(e) { setError(e.message); }
  };

  const filtered  = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const pending   = filtered.filter(i=>!i.purchased);
  const purchased = filtered.filter(i=>i.purchased);
  const totalEst  = items.reduce((s,i) => s + (Number(i.estimated_cost)||0) * (Number(i.quantity)||1), 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Shopping List</h1>
          <p className="text-dark-400 text-sm mt-1">{items.filter(i=>!i.purchased).length} items to buy · Est. {fmt(totalEst)}</p>
        </div>
        <button onClick={openAdd} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> Add Item
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
        <input className="field pl-10" placeholder="Search items…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>


      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="card p-4 animate-pulse flex gap-3"><div className="skeleton w-5 h-5 rounded-full"/><div className="flex-1 skeleton h-4 rounded"/></div>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">Shopping list is empty</p>
          <p className="text-dark-300 text-sm mt-1">Track materials and supplies you need to buy</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">To Buy ({pending.length})</h2>
              <div className="space-y-2">
                {pending.map(it=>(
                  <div key={it.id} className="card p-4 flex items-center gap-3 hover:shadow-pop transition-shadow">
                    <button onClick={()=>togglePurchased(it)} className="flex-shrink-0 text-dark-300 hover:text-success transition-colors">
                      <Circle className="w-5 h-5"/>
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-dark-900">{it.name}</span>
                      <div className="text-xs text-dark-400 mt-0.5 flex items-center gap-2">
                        {it.projects?.name && <span>{it.projects.name}</span>}
                        {it.quantity && <span>{it.quantity}{it.unit ? ` ${it.unit}` : ''}</span>}
                        {it.estimated_cost && <span className="font-mono">{fmt(it.estimated_cost)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(it)} className="p-1.5 rounded-lg hover:bg-dark-50 text-dark-400 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                      <button onClick={()=>del(it.id)} className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {purchased.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Purchased ({purchased.length})</h2>
              <div className="space-y-2 opacity-60">
                {purchased.map(it=>(
                  <div key={it.id} className="card p-4 flex items-center gap-3">
                    <button onClick={()=>togglePurchased(it)} className="flex-shrink-0 text-success"><CheckCircle2 className="w-5 h-5"/></button>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-dark-500 line-through">{it.name}</span>
                    </div>
                    <button onClick={()=>del(it.id)} className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modal && <Modal title={modal==='add'?'Add Item':'Edit Item'} onClose={()=>setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving} projects={projects}/>}
    </div>
  );
}
