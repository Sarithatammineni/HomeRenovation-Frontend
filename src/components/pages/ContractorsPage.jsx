import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Loader2, Trash2, Pencil, X, HardHat, AlertCircle, Search, Phone, Mail, Star } from 'lucide-react';

const TRADES = ['Plumber','Electrician','Carpenter','Painter','Tiler','Mason','HVAC','Architect','Interior Designer','General Contractor','Other'];
const EMPTY  = { name:'', trade:'Plumber', phone:'', email:'', company:'', rating:'', notes:'' };

const SAMPLE_CONTRACTORS = [
  {
    id: 'sample-1',
    name: 'Ravi Kumar',
    trade: 'Plumber',
    company: 'Kumar Plumbing Works',
    phone: '+91 98765 43210',
    email: 'ravi.kumar@plumbingworks.in',
    rating: 5,
    notes: 'Excellent work on bathroom renovations. Always on time, fair pricing. Specialises in concealed pipework, CP fittings, and modern fixtures. Completed master bath + guest bath in 6 days. Charges ₹800/hr for labour.',
    _sample: true,
  },
  {
    id: 'sample-2',
    name: 'Suresh Reddy',
    trade: 'Electrician',
    company: 'Reddy Electro Solutions',
    phone: '+91 91234 56789',
    email: 'suresh@reddyelectro.in',
    rating: 4,
    notes: 'Certified electrician with 12 years experience. Handled full rewiring of 3BHK apartment. Excellent with smart home (Alexa, Google Home) installations. Licensed for up to 10kW load. Charges ₹1,200/hr.',
    _sample: true,
  },
  {
    id: 'sample-3',
    name: 'Anita Sharma',
    trade: 'Interior Designer',
    company: 'Sharma Interiors Studio',
    phone: '+91 99887 76655',
    email: 'anita@sharmainteriors.com',
    rating: 5,
    notes: 'Brilliant eye for detail. Transformed living room with a modern Scandinavian theme. Provides detailed 3D renders and mood boards before work begins. Works with trusted vendor network. Charges 8% of project cost as design fee.',
    _sample: true,
  },
  {
    id: 'sample-4',
    name: 'Mohammed Farooq',
    trade: 'Painter',
    company: 'Farooq Painting Services',
    phone: '+91 93456 78901',
    email: 'farooq.painter@gmail.com',
    rating: 4,
    notes: 'Very neat and clean work. Specialises in texture painting, stucco, and wall murals. Brings own quality Asian Paints & Berger materials. Covers walls with plastic sheets before starting. Charges ₹18/sqft for 2-coat emulsion.',
    _sample: true,
  },
  {
    id: 'sample-5',
    name: 'Vijay Nair',
    trade: 'Carpenter',
    company: 'Nair Wood Craft',
    phone: '+91 87654 32109',
    email: 'vijay@nairwoodcraft.in',
    rating: 5,
    notes: 'Master carpenter with 20 years experience. Custom wardrobes, modular kitchens, wooden flooring, and false ceilings. Uses BWP 710-grade ply only. Provides 5-year warranty on all joinery work. Charges ₹950/hr; project quotes available.',
    _sample: true,
  },
  {
    id: 'sample-6',
    name: 'Deepak Patel',
    trade: 'Tiler',
    company: 'Patel Tile & Stone Works',
    phone: '+91 96321 47850',
    email: 'deepak.tiles@gmail.com',
    rating: 4,
    notes: 'Specialist in large-format tiles (600x1200 and above), marble laying, and anti-skid bathroom floors. Works with all tile types — ceramic, vitrified, natural stone. Very accurate grouting. Charges ₹55/sqft for floor tiles.',
    _sample: true,
  },
  {
    id: 'sample-7',
    name: 'Sanjay Mehta',
    trade: 'Mason',
    company: 'Mehta Construction & Civil Works',
    phone: '+91 94567 23410',
    email: 'sanjay.mehta@mehtacivil.in',
    rating: 4,
    notes: 'Experienced mason for brick work, plastering, RCC column casting, and compound wall construction. Has a team of 4 skilled workers. Good at reading structural drawings. Rates: ₹700/day per worker, minimum 3-day booking.',
    _sample: true,
  },
  {
    id: 'sample-8',
    name: 'Priya Venkatesh',
    trade: 'Architect',
    company: 'Priya Venkatesh Design Associates',
    phone: '+91 97801 55432',
    email: 'priya@pvdesigns.in',
    rating: 5,
    notes: 'Licensed architect (COA registered) with 14 years experience. Handles building plan approvals, BBMP sanction drawings, and vastu-compliant designs. Expert in space optimisation for urban plots. Charges ₹120/sqft for complete architectural drawings.',
    _sample: true,
  },
  {
    id: 'sample-9',
    name: 'Ramesh Iyer',
    trade: 'HVAC',
    company: 'CoolTech Air Systems',
    phone: '+91 90000 11234',
    email: 'ramesh@cooltech.in',
    rating: 4,
    notes: 'Authorised installer for Daikin, Voltas, and Blue Star ACs. Handles split AC, cassette AC, VRF systems, and ducted HVAC. Offers AMC plans. Charges ₹1,500 per AC installation (standard). 24-hour emergency call-out available.',
    _sample: true,
  },
  {
    id: 'sample-10',
    name: 'Arjun D\'Souza',
    trade: 'General Contractor',
    company: 'D\'Souza Build & Renovate',
    phone: '+91 98001 76543',
    email: 'arjun@dsouzabuild.com',
    rating: 5,
    notes: 'Turnkey renovation contractor managing all trades under one contract. Managed complete 2,200 sqft home renovation in 11 weeks. Provides daily WhatsApp progress updates with photos. Transparent billing with weekly breakdowns. Preferred vendor for high-end projects.',
    _sample: true,
  },
];

function Modal({ title, onClose, onSave, form, setForm, saving }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-pop w-full max-w-lg animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-100">
          <h2 className="font-display text-xl font-bold text-dark-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-50 text-dark-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name *</label>
              <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Ravi Sharma"/>
            </div>
            <div>
              <label className="label">Trade</label>
              <select className="field" value={form.trade} onChange={e=>setForm(f=>({...f,trade:e.target.value}))}>
                {TRADES.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Company</label>
            <input className="field" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Company or business name"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="field" type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210"/>
            </div>
            <div>
              <label className="label">Email</label>
              <input className="field" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="contractor@email.com"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Rating (1–5)</label>
              <input className="field" type="number" min="1" max="5" value={form.rating} onChange={e=>setForm(f=>({...f,rating:e.target.value}))} placeholder="4"/>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="field resize-none" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Reliability, rates, specialisms…"/>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={onSave} disabled={saving||!form.name.trim()}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : 'Save Contractor'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [modal,       setModal]       = useState(null);
  const [form,        setForm]        = useState(EMPTY);
  const [saving,      setSaving]      = useState(false);

  const load = async () => {
    try {
      setError('');
      const d = await api.contractors.list();
      setContractors([...d, ...SAMPLE_CONTRACTORS]);
    } catch(e) {
      setContractors(SAMPLE_CONTRACTORS);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (c) => { setForm({name:c.name,trade:c.trade||'Plumber',phone:c.phone||'',email:c.email||'',company:c.company||'',rating:c.rating||'',notes:c.notes||''}); setModal(c); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal==='add') await api.contractors.create(form);
      else await api.contractors.update(modal.id, form);
      setModal(null); await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Remove this contractor?')) return;
    if (String(id).startsWith('sample-')) { setContractors(p=>p.filter(c=>c.id!==id)); return; }
    try { await api.contractors.delete(id); await load(); }
    catch(e) { setError(e.message); }
  };

  const filtered = contractors.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.trade||'').toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name) => name.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const avatarColors = ['bg-brand-100 text-brand-600','bg-success-light text-success','bg-info-light text-info','bg-warning-light text-warning'];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Contractors</h1>
          <p className="text-dark-400 text-sm mt-1">{contractors.length} contact{contractors.length!==1?'s':''} in your network</p>
        </div>
        <button onClick={openAdd} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> Add Contractor
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
        <input className="field pl-10" placeholder="Search by name or trade…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {error && <div className="flex items-center gap-2 bg-danger-light text-danger border border-danger/20 rounded-xl px-4 py-3 text-sm"><AlertCircle className="w-4 h-4"/>{error}</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i)=><div key={i} className="card p-5 animate-pulse space-y-3"><div className="flex gap-3"><div className="skeleton w-12 h-12 rounded-2xl"/><div className="flex-1 space-y-2"><div className="skeleton h-4 w-2/3 rounded"/><div className="skeleton h-3 w-1/2 rounded"/></div></div></div>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <HardHat className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No contractors yet</p>
          <p className="text-dark-300 text-sm mt-1">Store contacts and call or email them directly from the app</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c,i)=>(
            <div key={c.id} className="card p-5 hover:shadow-pop transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColors[i%avatarColors.length]}`}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-dark-900 truncate">{c.name}</div>
                  <div className="text-xs text-dark-400">{c.trade}{c.company ? ` · ${c.company}` : ''}</div>
                  {c.rating && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_,j)=>(
                        <Star key={j} className={`w-3 h-3 ${j<Number(c.rating)?'text-warning fill-warning':'text-dark-200'}`}/>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 mb-4">
                {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs text-dark-500 hover:text-brand-500 transition-colors"><Phone className="w-3.5 h-3.5 text-dark-300"/>{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-dark-500 hover:text-brand-500 transition-colors truncate"><Mail className="w-3.5 h-3.5 text-dark-300 flex-shrink-0"/>{c.email}</a>}
              </div>
              {c.notes && <p className="text-xs text-dark-400 italic mb-3 line-clamp-2">{c.notes}</p>}
              <div className="flex gap-2 pt-3 border-t border-dark-100">
                <button onClick={()=>openEdit(c)} className="flex-1 btn-ghost text-xs py-1.5 rounded-xl"><Pencil className="w-3.5 h-3.5"/>Edit</button>
                <button onClick={()=>del(c.id)} className="flex-1 btn-ghost text-xs py-1.5 rounded-xl text-danger hover:bg-danger-light hover:text-danger"><Trash2 className="w-3.5 h-3.5"/>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <Modal title={modal==='add'?'Add Contractor':'Edit Contractor'} onClose={()=>setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving}/>}
    </div>
  );
}
