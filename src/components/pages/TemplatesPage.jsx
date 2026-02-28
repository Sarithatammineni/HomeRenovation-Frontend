import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Loader2, X, LayoutTemplate, AlertCircle, CheckCircle2, Zap } from 'lucide-react';


const SAMPLE_TEMPLATES = [
  {
    id:'stpl-1', name:'Full Kitchen Remodel', description:'End-to-end kitchen renovation covering demo, plumbing, electrical, tiling, and cabinets.',
    tasks:[
      { name:'Demolish existing cabinets and flooring' },
      { name:'Rough-in plumbing for sink and dishwasher' },
      { name:'Electrical work — new sockets and lighting circuit' },
      { name:'Lay kitchen floor tiles' },
      { name:'Install modular cabinets and countertops' },
      { name:'Fit sink, tap, and appliances' },
      { name:'Paint walls and install backsplash' },
      { name:'Final inspection and snagging' },
    ],
  },
  {
    id:'stpl-2', name:'Bathroom Renovation', description:'Complete bathroom overhaul including waterproofing, tiling, fixtures, and plumbing.',
    tasks:[
      { name:'Hack existing tiles and screed' },
      { name:'Apply 2-coat waterproofing membrane' },
      { name:'Lay floor and wall tiles' },
      { name:'Install WC, wash basin, and shower enclosure' },
      { name:'Plumbing — hot/cold water connections' },
      { name:'Electrical — exhaust fan and lighting' },
      { name:'Install towel rails, mirrors, and accessories' },
    ],
  },
  {
    id:'stpl-3', name:'Interior Painting', description:'Professional interior repaint for a standard 3BHK apartment.',
    tasks:[
      { name:'Sand and fill all wall cracks' },
      { name:'Apply wall putty — 2 coats' },
      { name:'Sand putty once dry' },
      { name:'Apply primer coat' },
      { name:'Paint — first emulsion coat' },
      { name:'Touch up and second emulsion coat' },
      { name:'Paint doors, windows, and trims' },
      { name:'Clean up and remove masking tape' },
    ],
  },
  {
    id:'stpl-4', name:'False Ceiling Installation', description:'Gypsum false ceiling with cove lighting for living and dining areas.',
    tasks:[
      { name:'Finalise ceiling design and light positions' },
      { name:'Install perimeter wall angle' },
      { name:'Fix main runner and cross tee grid' },
      { name:'Lay gypsum boards on grid' },
      { name:'Tape and compound all joints' },
      { name:'Electrical — lay conduit and wiring for cove lights' },
      { name:'Install LED strip lights in cove' },
      { name:'Prime and paint false ceiling' },
    ],
  },
  {
    id:'stpl-5', name:'Flooring Replacement', description:'Remove old flooring and install new vitrified tiles throughout.',
    tasks:[
      { name:'Remove existing flooring and clean subfloor' },
      { name:'Level subfloor with self-levelling compound' },
      { name:'Dry-lay tiles to plan layout and cuts' },
      { name:'Lay tiles with adhesive mortar' },
      { name:'Allow 24h for adhesive to cure' },
      { name:'Apply tile grout and clean joints' },
      { name:'Polish tiles and apply sealant' },
    ],
  },
  {
    id:'stpl-6', name:'Exterior Painting & Waterproofing', description:'Exterior facade repaint with waterproof coating for monsoon protection.',
    tasks:[
      { name:'Pressure-wash all exterior surfaces' },
      { name:'Repair cracks and spalling concrete' },
      { name:'Apply waterproof putty on all surfaces' },
      { name:'First coat — exterior primer' },
      { name:'Apply waterproof texture coating' },
      { name:'Final colour coat — exterior emulsion' },
      { name:'Seal all window and door frames with silicone' },
    ],
  },
];


function ApplyModal({ template, onClose, onApply, projects, applying }) {
  const [name, setName] = useState(`${template.name} — New`);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-pop w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-dark-100">
          <h2 className="font-display text-xl font-bold text-dark-900">Use Template</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-dark-50 text-dark-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4">
            <div className="font-semibold text-dark-900">{template.name}</div>
            {template.description && <div className="text-sm text-dark-500 mt-1">{template.description}</div>}
            {template.tasks?.length > 0 && <div className="text-xs text-brand-600 mt-2 font-semibold">{template.tasks.length} tasks will be created</div>}
          </div>
          <div>
            <label className="label">Project Name</label>
            <input className="field" value={name} onChange={e=>setName(e.target.value)}/>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input className="field" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={()=>onApply(template.id, name, startDate)} disabled={applying||!name.trim()}
            className="flex-1 btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center">
            {applying ? <Loader2 className="w-4 h-4 animate-spin-fast"/> : <><Zap className="w-4 h-4"/>Create Project</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [projects,  setProjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [selected,  setSelected]  = useState(null);
  const [applying,  setApplying]  = useState(false);

  useEffect(()=>{
    (async()=>{
      try {
        const [t, p] = await Promise.all([api.templates.list(), api.projects.list()]);
        setTemplates(t); setProjects(p);
      } catch(e) {
        setTemplates(SAMPLE_TEMPLATES);
        setProjects([]);
        setError(e.message);
      } finally { setLoading(false); }
    })();
  },[]);

  const apply = async (templateId, name, startDate) => {
    setApplying(true);
    try {
      const res = await api.templates.apply({ template_id: templateId, project_name: name, start_date: startDate });
      setSelected(null);
      setSuccess(`Project "${res.project.name}" created with ${res.tasksCreated} tasks!`);
      setTimeout(()=>setSuccess(''), 5000);
    } catch(e) { setError(e.message); }
    finally { setApplying(false); }
  };

  const ICONS = ['🏗️','🏠','🛁','🍳','🌿','🔧','⚡','🎨'];

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-display text-3xl font-bold text-dark-900">Templates</h1>
        <p className="text-dark-400 text-sm mt-1">Start new projects quickly with pre-built task lists and timelines</p>
      </div>

      {success && <div className="flex items-center gap-2 bg-success-light text-success border border-success/20 rounded-xl px-4 py-3 text-sm"><CheckCircle2 className="w-4 h-4"/>{success}</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_,i)=><div key={i} className="card p-6 animate-pulse space-y-3"><div className="skeleton h-12 w-12 rounded-2xl"/><div className="skeleton h-5 w-2/3 rounded"/><div className="skeleton h-3 w-full rounded"/></div>)}
        </div>
      ) : templates.length===0 ? (
        <div className="text-center py-20">
          <LayoutTemplate className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No templates available</p>
          <p className="text-dark-300 text-sm mt-1">Templates are created by admins — check back soon</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t,i)=>(
            <div key={t.id} className="card p-6 hover:shadow-pop transition-shadow flex flex-col">
              <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center text-2xl mb-4">
                {ICONS[i % ICONS.length]}
              </div>
              <h3 className="font-display font-bold text-dark-900 text-lg mb-1">{t.name}</h3>
              {t.description && <p className="text-dark-400 text-sm mb-3 flex-1">{t.description}</p>}
              {t.tasks?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-2">Includes {t.tasks.length} tasks</div>
                  <ul className="space-y-1">
                    {t.tasks.slice(0,3).map((task,j)=>(
                      <li key={j} className="text-xs text-dark-400 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-brand-400 inline-block"/>
                        {task.name}
                      </li>
                    ))}
                    {t.tasks.length > 3 && <li className="text-xs text-dark-300 italic">+{t.tasks.length-3} more…</li>}
                  </ul>
                </div>
              )}
              <button onClick={()=>setSelected(t)}
                className="w-full btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow justify-center mt-auto">
                <Zap className="w-4 h-4"/> Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && <ApplyModal template={selected} onClose={()=>setSelected(null)} onApply={apply} projects={projects} applying={applying}/>}
    </div>
  );
}
