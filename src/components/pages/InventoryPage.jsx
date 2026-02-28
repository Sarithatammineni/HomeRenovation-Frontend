import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Loader2, Trash2, Pencil, X, Package, AlertCircle, Search } from 'lucide-react';

const CONDITIONS = ['Good','Fair','Poor','New'];
const EMPTY = { name:'', category:'', quantity:'1', unit:'', condition:'Good', location:'', notes:'' };

const SAMPLE_INVENTORY = [
  
  { id:'sinv-1', name:'Bosch GSB 18V-55 Cordless Drill', category:'Power Tools', quantity:1, unit:'pcs', condition:'Good', location:'Garage — Shelf A, Left', notes:'18V brushless motor. 2×2Ah battery packs + fast charger. Used for drilling concrete (with SDS bit) and driving screws. Last serviced: Jan 2025.', _sample:true },
  { id:'sinv-2', name:'Makita 9565CV Angle Grinder', category:'Power Tools', quantity:1, unit:'pcs', condition:'Good', location:'Garage — Shelf A, Left', notes:'4.5 inch, 1400W. Variable speed dial. Always use the safety guard and face shield. Spare cutting disc pack (10 pcs) stored in same shelf drawer.', _sample:true },
  { id:'sinv-3', name:'Black & Decker Jigsaw JS10', category:'Power Tools', quantity:1, unit:'pcs', condition:'Fair', location:'Garage — Shelf A, Right', notes:'Corded, 450W. Blade slightly worn — replace before next use. Good for cutting plywood, wood sheets, and curved cuts. Extra blades: T101B (wood) × 5.', _sample:true },
  { id:'sinv-4', name:'Dewalt DCS391 Circular Saw', category:'Power Tools', quantity:1, unit:'pcs', condition:'Good', location:'Garage — Shelf A, Right', notes:'20V MAX, 165mm blade. Ideal for ripping plywood sheets. Blade guard intact. Keep away from children. Blade: 24-tooth TCT. Spare blade stored in red toolbox.', _sample:true },
  { id:'sinv-5', name:'Bosch GBH 2-26 Rotary Hammer', category:'Power Tools', quantity:1, unit:'pcs', condition:'Good', location:'Garage — Shelf B, Left', notes:'SDS-plus, 830W, 2.7J impact energy. For drilling into brick, RCC columns. Includes chisel bit and core drill bits (50mm, 75mm). Use hearing protection.', _sample:true },
  
  { id:'sinv-6', name:'Claw Hammer 16oz', category:'Hand Tools', quantity:2, unit:'pcs', condition:'Good', location:'Red Toolbox — Rack 1', notes:'Fibreglass handle. One used for demo work, one kept clean for finish carpentry. Replace rubber grip on Demo hammer — worn out.', _sample:true },
  { id:'sinv-7', name:'Stanley 10-Piece Screwdriver Set', category:'Hand Tools', quantity:1, unit:'set', condition:'New', location:'Red Toolbox — Rack 1', notes:'Phillips PH1/PH2/PH3 + flathead 4/5/6/8mm. Bought Oct 2024, still in original case. Magnetised tips.', _sample:true },
  { id:'sinv-8', name:'Measuring Tape 5m', category:'Hand Tools', quantity:3, unit:'pcs', condition:'Good', location:'Multiple locations', notes:'Stanley FatMax. One in kitchen drawer, one in master bedroom, one in garage. Replace garage unit — locking tab broken.', _sample:true },
  { id:'sinv-9', name:'Spirit Level 1.2m', category:'Hand Tools', quantity:1, unit:'pcs', condition:'Good', location:'Garage — Wall hook', notes:'Aluminium box-section, 3-vial (horizontal, vertical, 45°). Essential for tile and cabinet installation. Check calibration before major jobs.', _sample:true },
  { id:'sinv-10', name:'Pliers Set (5-piece)', category:'Hand Tools', quantity:1, unit:'set', condition:'Good', location:'Red Toolbox — Rack 2', notes:'Combination, needle-nose, diagonal cutters, slip-joint, locking pliers. Snap-on brand. Used for electrical and plumbing tasks.', _sample:true },
  { id:'sinv-11', name:'Allen Key Set (Metric)', category:'Hand Tools', quantity:1, unit:'set', condition:'Good', location:'Red Toolbox — Rack 2', notes:'1.5mm–10mm, ball-end hex keys. Stored in folding holder. Used for furniture assembly and machine bolts. Missing 2mm key — order replacement.', _sample:true },
  { id:'sinv-12', name:'Hacksaw + 5 Spare Blades', category:'Hand Tools', quantity:1, unit:'set', condition:'Good', location:'Red Toolbox — Rack 3', notes:'24 TPI blade for metal cutting. Spare blades in a ziploc pouch taped to frame. Good for copper pipes and steel brackets.', _sample:true },
  
  { id:'sinv-13', name:'Ceramic Floor Tiles 60×60 cm — Cream', category:'Materials', quantity:45, unit:'sqft', condition:'New', location:'Storeroom — Back wall, stacked', notes:'Brand: Kajaria. Leftover from kitchen remodel. Enough to tile a small bathroom (approx. 40 sqft). Keep dry — moisture can affect adhesive on back.', _sample:true },
  { id:'sinv-14', name:'Asian Paints Royale — Ivory White (Interior)', category:'Materials', quantity:4, unit:'litres', condition:'Good', location:'Storeroom — Shelf 2', notes:'4 sealed 1-litre tins. Matches current living room finish. Approx. coverage: 140 sqft per litre (2 coats). Check if still within 2-year shelf life.', _sample:true },
  { id:'sinv-15', name:'Seasoned Teak Wood Planks 6ft × 4in', category:'Materials', quantity:12, unit:'pcs', condition:'Good', location:'Garage — Floor stack, covered with tarp', notes:'Grade A teak, air-dried. Intended for the back deck project. Keep covered to prevent warping. Do not store directly on concrete floor — moisture damage risk.', _sample:true },
  { id:'sinv-16', name:'Portland Cement OPC 53-grade', category:'Materials', quantity:8, unit:'bags', condition:'Good', location:'Storeroom — Dry shelf, elevated', notes:'50kg bags, Ultratech brand. Purchased Feb 2025. Use within 3 months of purchase. Store off the ground on wooden pallet — moisture kills cement.', _sample:true },
  { id:'sinv-17', name:'Wall Putty (White Cement Based)', category:'Materials', quantity:3, unit:'bags', condition:'Good', location:'Storeroom — Shelf 3', notes:'JK Wall Putty, 20kg bags. For wall surface prep before painting. 2 bags allocated for bedroom repaint, 1 bag spare. Mix ratio: 1 part putty : 0.5 part water.', _sample:true },
  { id:'sinv-18', name:'PVC Conduit Pipe 20mm × 3m', category:'Materials', quantity:10, unit:'pcs', condition:'New', location:'Garage — Side wall, vertical storage', notes:'Finolex brand, ISI marked. For routing electrical wiring inside walls. Stored vertically to prevent bending. Includes 8 elbow joints and 6 junction boxes.', _sample:true },
  { id:'sinv-19', name:'CPVC Pipe 1/2 inch × 3m', category:'Materials', quantity:6, unit:'pcs', condition:'New', location:'Storeroom — Floor, bundled', notes:'Astral CPVC, suitable for hot and cold water. Leftover from bathroom plumbing. Includes 4 tees, 6 elbows, 2 unions. Solvent cement (Astral brand) also stored here.', _sample:true },
  

  { id:'sinv-20', name:'Safety Helmet (ISI BIS)', category:'Safety Equipment', quantity:3, unit:'pcs', condition:'Good', location:'Garage — Shelf B, Right', notes:'Yellow hard hats. One for owner, two for on-site workers. ISI marked (IS:2925). Inspect harness inside monthly. Replace if cracked or after any impact.', _sample:true },
  { id:'sinv-21', name:'Heavy Duty Leather Safety Gloves', category:'Safety Equipment', quantity:6, unit:'pairs', condition:'New', location:'Garage — Shelf B, Right', notes:'Cut-resistant, EN388 rated. Mandatory for all cutting, grinding, and tile work. Size L×4, Size M×2. Dispose and replace if torn — do not repair leather gloves.', _sample:true },
  { id:'sinv-22', name:'Anti-Fog Safety Goggles', category:'Safety Equipment', quantity:4, unit:'pcs', condition:'Good', location:'Garage — Shelf B, Right', notes:'Polycarbonate lens, EN166 rated. Use when grinding, cutting tiles, or mixing cement. Clean with soft cloth only. One pair has scratched lens — replace before next use.', _sample:true },
  { id:'sinv-23', name:'Dust Mask N95 Respirators', category:'Safety Equipment', quantity:20, unit:'pcs', condition:'New', location:'Garage — Shelf B, Left', notes:'3M Aura N95, pack of 20. For use during sanding, cutting fibre cement, and mixing cement/putty. Single use — dispose after each full-day session.', _sample:true },
  { id:'sinv-24', name:'First Aid Kit', category:'Safety Equipment', quantity:1, unit:'kit', condition:'Good', location:'Kitchen — Top shelf, near window', notes:'Contains bandages, antiseptic, gauze, scissors, tweezers, burn gel, triangular bandage. Check expiry dates every 6 months. Last checked: Dec 2024. Refill burn gel — running low.', _sample:true },
 
  { id:'sinv-25', name:'Aluminium Folding Ladder 6-step', category:'Ladders & Access', quantity:1, unit:'pcs', condition:'Good', location:'Garage — Against back wall', notes:'Load capacity 150kg. Non-slip rubber feet. Used for ceiling work, high shelving, painting walls. Do not stand on top step. Inspect hinges and feet before every use.', _sample:true },
  { id:'sinv-26', name:'Step Stool 2-step Fibreglass', category:'Ladders & Access', quantity:1, unit:'pcs', condition:'Good', location:'Kitchen — Under sink cabinet', notes:'Non-conductive fibreglass — safe for electrical work. Folds flat for easy storage. Max load: 120kg. Kept in kitchen for everyday high-shelf access too.', _sample:true },
 
  { id:'sinv-27', name:'Extension Cord 15m 3-pin (Heavy Duty)', category:'Electrical', quantity:2, unit:'pcs', condition:'Good', location:'Garage — Wall hook, coiled', notes:'16A rated, 3-core flexible cable. One for power tools, one as spare. Always uncoil fully before use to prevent overheating. Do not use if outer sheath is damaged.', _sample:true },
  { id:'sinv-28', name:'Digital Multimeter', category:'Electrical', quantity:1, unit:'pcs', condition:'Good', location:'Red Toolbox — Rack 1', notes:'Fluke 107 True-RMS. Measures AC/DC voltage, current, resistance, continuity. Calibration valid until Jun 2026. 9V battery replaced Dec 2024. Keep in protective case.', _sample:true },
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
            <div className="col-span-2">
              <label className="label">Item Name *</label>
              <input className="field" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Power drill, Extra tiles"/>
            </div>
            <div>
              <label className="label">Category</label>
              <input className="field" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Tools / Materials"/>
            </div>
            <div>
              <label className="label">Condition</label>
              <select className="field" value={form.condition} onChange={e=>setForm(f=>({...f,condition:e.target.value}))}>
                {Conditions.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quantity</label>
              <input className="field" type="number" min="0" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="field" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="pcs / sqft / kg"/>
            </div>
          </div>
          <div>
            <label className="label">Storage Location</label>
            <input className="field" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Garage shelf B, Storeroom"/>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="field resize-none" rows={2} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Brand, model, purchase details…"/>
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


const Conditions = ['Good','Fair','Poor','New'];

export default function InventoryPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    try {
      setError('');
      const d = await api.inventory.list();
      setItems([...d, ...SAMPLE_INVENTORY]);
    } catch(e) {
      setItems(SAMPLE_INVENTORY);
    } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const openAdd  = () => { setForm(EMPTY); setModal('add'); };
  const openEdit = (it) => { setForm({name:it.name,category:it.category||'',quantity:it.quantity||'1',unit:it.unit||'',condition:it.condition||'Good',location:it.location||'',notes:it.notes||''}); setModal(it); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal==='add') await api.inventory.create(form);
      else await api.inventory.update(modal.id, form);
      setModal(null); await load();
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Remove this item?')) return;
    if (String(id).startsWith('sinv-')) { setItems(p=>p.filter(i=>i.id!==id)); return; }
    try { await api.inventory.delete(id); await load(); }
    catch(e) { setError(e.message); }
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.category||'').toLowerCase().includes(search.toLowerCase()));

  const COND_CLS = { Good:'bg-success-light text-success', New:'bg-brand-100 text-brand-600', Fair:'bg-warning-light text-warning', Poor:'bg-danger-light text-danger' };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Inventory</h1>
          <p className="text-dark-400 text-sm mt-1">{items.length} item{items.length!==1?'s':''} owned</p>
        </div>
        <button onClick={openAdd} className="btn-lg bg-brand-500 text-white hover:bg-brand-600 rounded-2xl shadow-glow">
          <Plus className="w-5 h-5"/> Add Item
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
        <input className="field pl-10" placeholder="Search inventory…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {error && <div className="flex items-center gap-2 bg-danger-light text-danger border border-danger/20 rounded-xl px-4 py-3 text-sm"><AlertCircle className="w-4 h-4"/>{error}</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_,i)=><div key={i} className="card p-5 animate-pulse space-y-3"><div className="skeleton h-5 w-2/3 rounded"/><div className="skeleton h-3 w-1/3 rounded"/></div>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No inventory items yet</p>
          <p className="text-dark-300 text-sm mt-1">Log tools and materials you own to avoid duplicate purchases</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(it=>(
            <div key={it.id} className="card p-5 hover:shadow-pop transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-dark-900">{it.name}</h3>
                  {it.category && <p className="text-xs text-dark-400 mt-0.5">{it.category}</p>}
                </div>
                {it.condition && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${COND_CLS[it.condition]||'bg-dark-100 text-dark-500'}`}>{it.condition}</span>}
              </div>
              <div className="text-xs text-dark-500 space-y-1">
                {it.quantity && <div>Qty: <span className="font-semibold text-dark-700">{it.quantity}{it.unit ? ` ${it.unit}` : ''}</span></div>}
                {it.location && <div>📍 {it.location}</div>}
                {it.notes && <div className="text-dark-400 italic line-clamp-2 mt-2">{it.notes}</div>}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-dark-100">
                <button onClick={()=>openEdit(it)} className="flex-1 btn-ghost text-xs py-1.5 rounded-xl"><Pencil className="w-3.5 h-3.5"/>Edit</button>
                <button onClick={()=>del(it.id)} className="flex-1 btn-ghost text-xs py-1.5 rounded-xl text-danger hover:bg-danger-light hover:text-danger"><Trash2 className="w-3.5 h-3.5"/>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <Modal title={modal==='add'?'Add Item':'Edit Item'} onClose={()=>setModal(null)} onSave={save} form={form} setForm={setForm} saving={saving}/>}
    </div>
  );
}
