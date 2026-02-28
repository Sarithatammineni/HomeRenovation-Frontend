// frontend/src/components/pages/InspirationPage.jsx
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Sparkles, ExternalLink, Search, Heart } from 'lucide-react';

const STYLES = [
  { id:'all',       label:'All Styles' },
  { id:'modern',    label:'Modern' },
  { id:'classic',   label:'Classic' },
  { id:'industrial',label:'Industrial' },
  { id:'scandinavian',label:'Scandinavian' },
  { id:'rustic',    label:'Rustic' },
  { id:'minimalist',label:'Minimalist' },
];

// Curated local inspiration data (shown when no Supabase data)
const CURATED = [
  { id:1, title:'Open Kitchen Concept', style:'modern', room:'Kitchen', description:'Clean lines with marble counters and integrated appliances create a seamless cooking space.', color:'#f5f0e8', accent:'#c17b3a' },
  { id:2, title:'Spa-Style Bathroom',   style:'minimalist', room:'Bathroom', description:'Floating vanities, rainfall showers, and neutral tones bring a luxury hotel feel home.', color:'#e8f0ed', accent:'#2d6a4f' },
  { id:3, title:'Exposed Brick Living', style:'industrial', room:'Living Room', description:'Raw brick walls paired with warm leather and Edison lighting for urban character.', color:'#ede8e0', accent:'#8b5e3c' },
  { id:4, title:'Scandi Bedroom',       style:'scandinavian', room:'Bedroom', description:'Light wood, muted tones, and functional furniture for a calm Nordic retreat.', color:'#f0eeeb', accent:'#7a7468' },
  { id:5, title:'Classic Veranda',      style:'classic', room:'Outdoor', description:'Arched doorways, terracotta pots, and rattan furniture for timeless outdoor living.', color:'#f5ede0', accent:'#c17b3a' },
  { id:6, title:'Rustic Study',         style:'rustic', room:'Study', description:'Reclaimed wood shelving, warm lighting, and earthy tones for a cozy home office.', color:'#ede5d8', accent:'#875220' },
  { id:7, title:'Modern Master Suite',  style:'modern', room:'Bedroom', description:'Floor-to-ceiling windows, clean geometry, and monochrome palette for a statement room.', color:'#e8edf0', accent:'#3a7cb8' },
  { id:8, title:'Farmhouse Kitchen',    style:'rustic', room:'Kitchen', description:'Shaker cabinets, butcher-block counters, and apron sinks bring rural warmth to cooking.', color:'#ede8e0', accent:'#5a5850' },
  { id:9, title:'Industrial Loft Bath', style:'industrial', room:'Bathroom', description:'Matte black fixtures, concrete tiles, and open shelving for an urban edge.', color:'#e8e8e8', accent:'#3a3830' },
];

function InspirationCard({ item, liked, onToggleLike }) {
  return (
    <div className="card overflow-hidden hover:shadow-pop transition-all duration-300 group">
      {/* Color swatch header */}
      <div className="h-40 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${item.color}, ${item.accent}22)` }}>
        <div className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
          {item.room==='Kitchen'?'🍳':item.room==='Bathroom'?'🛁':item.room==='Bedroom'?'🛏️':item.room==='Outdoor'?'🌿':item.room==='Study'?'📚':'🏠'}
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/80 backdrop-blur-sm text-dark-600">{item.room}</span>
        </div>
        <button
          onClick={()=>onToggleLike(item.id)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-danger text-danger' : 'text-dark-400'}`}/>
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-bold text-dark-900 text-base leading-snug">{item.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-600 font-semibold flex-shrink-0 capitalize">{item.style}</span>
        </div>
        <p className="text-sm text-dark-400 leading-relaxed">{item.description}</p>
        {/* Color accent strip */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ background: item.accent }}/>
          <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0" style={{ background: item.color }}/>
          <span className="text-xs text-dark-300 font-mono ml-1">{item.accent}</span>
        </div>
      </div>
    </div>
  );
}

export default function InspirationPage() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [style,    setStyle]    = useState('all');
  const [liked,    setLiked]    = useState(new Set());

  useEffect(()=>{
    // Try to load from backend; fall back to curated local data
    (async()=>{
      try {
        const data = await api.inspiration?.list?.();
        setItems(data && data.length > 0 ? data : CURATED);
      } catch {
        setItems(CURATED);
      } finally {
        setLoading(false);
      }
    })();
  },[]);

  const toggleLike = (id) => setLiked(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = items
    .filter(i => style==='all' || i.style===style)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()) || i.room.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-bold text-dark-900">Inspiration</h1>
          <p className="text-dark-400 text-sm mt-1">Browse curated design ideas and renovation styles</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-400">
          <Heart className="w-4 h-4 text-danger fill-danger"/>
          {liked.size} saved
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400"/>
          <input className="field pl-10" placeholder="Search styles, rooms…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STYLES.map(s=>(
            <button key={s.id} onClick={()=>setStyle(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${style===s.id?'bg-brand-500 text-white shadow-glow':'bg-dark-50 text-dark-500 hover:bg-dark-100'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>


      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=><div key={i} className="card overflow-hidden animate-pulse"><div className="h-40 skeleton"/><div className="p-5 space-y-2"><div className="skeleton h-4 w-2/3 rounded"/><div className="skeleton h-3 w-full rounded"/></div></div>)}
        </div>
      ) : filtered.length===0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-12 h-12 text-dark-200 mx-auto mb-4"/>
          <p className="text-dark-400 font-medium">No results found</p>
          <p className="text-dark-300 text-sm mt-1">Try a different style or search term</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item=>(
            <InspirationCard key={item.id} item={item} liked={liked.has(item.id)} onToggleLike={toggleLike}/>
          ))}
        </div>
      )}
    </div>
  );
}
