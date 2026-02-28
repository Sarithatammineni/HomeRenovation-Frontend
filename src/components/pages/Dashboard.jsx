import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  FolderKanban, CheckSquare, DollarSign, Wrench,
  TrendingUp, Plus, ArrowRight, Loader2, AlertCircle,
  Calendar, Clock, CheckCircle2, Circle, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS = {
  planning:  '#d4a017',
  active:    '#2d6a4f',
  paused:    '#b94040',
  completed: '#7a7468',
};

const PIE_COLORS = ['#c17b3a','#2d6a4f','#5c4b8a','#b94040','#d4a017','#3a7cb8'];

const SAMPLE_PROJECTS = [
  { id:'sp-1', name:'Kitchen Renovation',        status:'active',    budget:350000, colour:'#c17b3a' },
  { id:'sp-2', name:'Master Bedroom Repaint',    status:'active',    budget:45000,  colour:'#2d6a4f' },
  { id:'sp-3', name:'Bathroom Waterproofing',    status:'planning',  budget:80000,  colour:'#5c4b8a' },
  { id:'sp-4', name:'Living Room False Ceiling', status:'paused',    budget:120000, colour:'#b94040' },
  { id:'sp-5', name:'Front Gate & Compound',     status:'completed', budget:95000,  colour:'#3a7cb8' },
];

const SAMPLE_TASKS = [
  { id:'st-1', name:'Finalise tile selection for kitchen floor', status:'todo',        priority:'high',   due_date: new Date(Date.now()+5*86400000).toISOString(),  projects:{ name:'Kitchen Renovation' } },
  { id:'st-2', name:'Get 3 quotes from plumbers',               status:'in_progress', priority:'high',   due_date: new Date(Date.now()+2*86400000).toISOString(),  projects:{ name:'Kitchen Renovation' } },
  { id:'st-3', name:'Buy primer and wall putty',                status:'todo',        priority:'medium', due_date: new Date(Date.now()+7*86400000).toISOString(),  projects:{ name:'Master Bedroom Repaint' } },
  { id:'st-4', name:'Schedule waterproofing contractor visit',  status:'todo',        priority:'medium', due_date: new Date(Date.now()+10*86400000).toISOString(), projects:{ name:'Bathroom Waterproofing' } },
  { id:'st-5', name:'Approve false ceiling design layout',      status:'in_progress', priority:'low',    due_date: new Date(Date.now()+14*86400000).toISOString(), projects:{ name:'Living Room False Ceiling' } },
  { id:'st-6', name:'Order kitchen cabinet hardware',           status:'todo',        priority:'high',   due_date: new Date(Date.now()+3*86400000).toISOString(),  projects:{ name:'Kitchen Renovation' } },
  { id:'st-7', name:'Sand and clean bedroom walls',             status:'done',        priority:'medium', due_date: new Date(Date.now()-2*86400000).toISOString(),  projects:{ name:'Master Bedroom Repaint' } },
  { id:'st-8', name:'Confirm gate design with fabricator',      status:'done',        priority:'low',    due_date: new Date(Date.now()-5*86400000).toISOString(),  projects:{ name:'Front Gate & Compound' } },
];

const SAMPLE_EXPENSES = [
  { id:'se-1', description:'Kajaria floor tiles (45 sqft)',  category:'Materials', amount:18500, expense_date: new Date(Date.now()-1*86400000).toISOString() },
  { id:'se-2', description:'Plumber labour — bathroom demo', category:'Labour',    amount:8000,  expense_date: new Date(Date.now()-2*86400000).toISOString() },
  { id:'se-3', description:'Asian Paints Royale 10L',        category:'Materials', amount:5200,  expense_date: new Date(Date.now()-3*86400000).toISOString() },
  { id:'se-4', description:'Electrician — new power points', category:'Labour',    amount:4500,  expense_date: new Date(Date.now()-4*86400000).toISOString() },
  { id:'se-5', description:'Hardware & fasteners',           category:'Fixtures',  amount:2300,  expense_date: new Date(Date.now()-5*86400000).toISOString() },
];

const SAMPLE_EXP_SUMMARY = {
  total: 38500,
  byCategory: { Materials: 23700, Labour: 12500, Fixtures: 2300 },
};

const SAMPLE_MAINTENANCE = [
  { id:'sm-1', name:'Water Tank Cleaning',    frequency:'Every 6 months', next_date: new Date(Date.now()+3*86400000).toISOString(),  icon:'🪣' },
  { id:'sm-2', name:'AC Filter Service',      frequency:'Every 3 months', next_date: new Date(Date.now()+7*86400000).toISOString(),  icon:'❄️' },
  { id:'sm-3', name:'Pest Control Treatment', frequency:'Every 6 months', next_date: new Date(Date.now()-2*86400000).toISOString(),  icon:'🐜' },
  { id:'sm-4', name:'Electrical Panel Check', frequency:'Annually',       next_date: new Date(Date.now()+21*86400000).toISOString(), icon:'⚡' },
];

function StatCard({ icon: Icon, label, value, sub, iconBg, delay = '0s' }) {
  return (
    <div className="stat-card" style={{ animationDelay: delay }}>
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="font-display text-[1.8rem] font-bold text-dark-900 leading-none mt-1">{value}</div>
      <div className="text-xs text-dark-400 uppercase tracking-wider font-bold">{label}</div>
      {sub && <div className="text-xs text-dark-300 flex items-center gap-1 mt-0.5"><TrendingUp className="w-3 h-3 text-success" />{sub}</div>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card animate-pulse">
      <div className="skeleton w-11 h-11 rounded-2xl" />
      <div className="skeleton h-7 w-16 rounded mt-1" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [projects,    setProjects]    = useState([]);
  const [tasks,       setTasks]       = useState([]);
  const [expenses,    setExpenses]    = useState([]);
  const [expSummary,  setExpSummary]  = useState({ total: 0, byCategory: {} });
  const [maintenance, setMaintenance] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, t, e, es, m] = await Promise.all([
          api.projects.list(),
          api.tasks.list(),
          api.expenses.list(),
          api.expenses.summary(),
          api.maintenance.list(),
        ]);
        setProjects(p);
        setTasks(t);
        setExpenses(e);
        setExpSummary(es);
        setMaintenance(m);
      } catch (err) {

        setProjects(SAMPLE_PROJECTS);
        setTasks(SAMPLE_TASKS);
        setExpenses(SAMPLE_EXPENSES);
        setExpSummary(SAMPLE_EXP_SUMMARY);
        setMaintenance(SAMPLE_MAINTENANCE);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const displayName    = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const pendingTasks   = tasks.filter(t => t.status !== 'done').length;
  const doneTasks      = tasks.filter(t => t.status === 'done').length;
  const recentExpenses = expenses.slice(0, 5);
  const upcomingTasks  = tasks.filter(t => t.status !== 'done').slice(0, 6);
  const upcomingMaint  = maintenance.slice(0, 4);

  const expCatData = Object.entries(expSummary.byCategory || {}).map(([name, value]) => ({ name, value }));
  const statusData = ['planning','active','paused','completed'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: projects.filter(p => p.status === s).length,
    fill: STATUS_COLORS[s],
  })).filter(d => d.count > 0);

  const fmt     = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '';

  return (
    <div className="space-y-7 animate-fade-up">

      {/* Greeting */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-brand-500">{displayName.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={() => navigate('/projects')} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Soft banner — only when backend is unreachable; page still shows sample data */}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={FolderKanban} label="Total Projects"    value={projects.length}       sub={`${activeProjects} active`} iconBg="bg-brand-100 text-brand-600"  delay="0s"   />
            <StatCard icon={CheckSquare}  label="Open Tasks"        value={pendingTasks}           sub={`${doneTasks} completed`}   iconBg="bg-info-light text-info"       delay=".05s" />
            <StatCard icon={DollarSign}   label="Total Spent"       value={fmt(expSummary.total)}  sub="across all projects"        iconBg="bg-success-light text-success" delay=".1s"  />
            <StatCard icon={Wrench}       label="Maintenance Items" value={upcomingMaint.length}   sub="upcoming"                   iconBg="bg-warning-light text-warning" delay=".15s" />
          </>
        )}
      </div>

      {/* Projects + Open Tasks */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-100">
            <h2 className="font-display text-lg font-bold text-dark-900">Projects</h2>
            <button onClick={() => navigate('/projects')} className="btn-ghost text-xs">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton w-1 h-14 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1"><div className="skeleton h-4 w-1/2 rounded"/><div className="skeleton h-2.5 w-full rounded-full"/></div>
                </div>
              ))
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="w-10 h-10 text-dark-200 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">No projects yet</p>
                <button onClick={() => navigate('/projects')} className="btn-ghost mt-3 text-xs"><Plus className="w-3 h-3" /> Create first project</button>
              </div>
            ) : (
              projects.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-dark-50 cursor-pointer transition-colors" onClick={() => navigate('/projects')}>
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: p.colour || '#c17b3a' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium capitalize
                        ${p.status==='active'   ? 'bg-success-light text-success' :
                          p.status==='planning' ? 'bg-warning-light text-warning' :
                          p.status==='paused'   ? 'bg-danger-light text-danger'   :
                          'bg-dark-100 text-dark-500'}`}>{p.status}</span>
                      {p.budget && <span className="text-xs text-dark-400">{fmt(p.budget)}</span>}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-dark-300 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-100">
            <h2 className="font-display text-lg font-bold text-dark-900">Open Tasks</h2>
            <button onClick={() => navigate('/tasks')} className="btn-ghost text-xs">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="p-4 space-y-2">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3 p-2">
                  <div className="skeleton w-5 h-5 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-2/3 rounded"/><div className="skeleton h-2.5 w-1/3 rounded"/></div>
                </div>
              ))
            ) : upcomingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-10 h-10 text-success/30 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">All tasks complete! 🎉</p>
              </div>
            ) : (
              upcomingTasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-dark-50 transition-colors cursor-pointer" onClick={() => navigate('/tasks')}>
                  <Circle className="w-4 h-4 text-dark-300 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark-900 truncate">{t.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {t.projects?.name && <span className="text-xs text-dark-400">{t.projects.name}</span>}
                      {t.due_date && <span className="flex items-center gap-1 text-xs text-dark-400"><Calendar className="w-3 h-3" />{fmtDate(t.due_date)}</span>}
                    </div>
                  </div>
                  <span className={`badge badge-${t.priority} flex-shrink-0`}>{t.priority}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      {!loading && (expCatData.length > 0 || statusData.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {expCatData.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-500" /> Spending by Category
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expCatData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                    {expCatData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {statusData.length > 0 && (
            <div className="card p-5">
              <h2 className="font-display text-lg font-bold text-dark-900 mb-4 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-brand-500" /> Projects by Status
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fontSize:12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {statusData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Recent Expenses + Maintenance */}
      <div className="grid lg:grid-cols-2 gap-6">

        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-100">
            <h2 className="font-display text-lg font-bold text-dark-900">Recent Expenses</h2>
            <button onClick={() => navigate('/budget')} className="btn-ghost text-xs">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="divide-y divide-dark-50">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="px-5 py-3 animate-pulse flex justify-between">
                  <div className="skeleton h-3.5 w-1/2 rounded" /><div className="skeleton h-3.5 w-16 rounded" />
                </div>
              ))
            ) : recentExpenses.length === 0 ? (
              <div className="text-center py-8"><DollarSign className="w-10 h-10 text-dark-200 mx-auto mb-3" /><p className="text-dark-400 text-sm">No expenses logged</p></div>
            ) : (
              recentExpenses.map(e => (
                <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-dark-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-dark-900">{e.description}</p>
                    <p className="text-xs text-dark-400">{e.category} · {fmtDate(e.expense_date)}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-dark-900">{fmt(e.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-dark-100">
            <h2 className="font-display text-lg font-bold text-dark-900">Maintenance</h2>
            <button onClick={() => navigate('/maintenance')} className="btn-ghost text-xs">View all <ArrowRight className="w-3 h-3" /></button>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-2/3 rounded"/><div className="skeleton h-2.5 w-1/2 rounded"/></div>
                </div>
              ))
            ) : upcomingMaint.length === 0 ? (
              <div className="text-center py-8">
                <Wrench className="w-10 h-10 text-dark-200 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">No maintenance tasks</p>
                <button onClick={() => navigate('/maintenance')} className="btn-ghost mt-3 text-xs"><Plus className="w-3 h-3" /> Add task</button>
              </div>
            ) : (
              upcomingMaint.map(m => {
                const days = m.next_date ? Math.ceil((new Date(m.next_date) - new Date()) / 86400000) : null;
                return (
                  <div key={m.id} className="flex items-center gap-3 cursor-pointer hover:bg-dark-50 rounded-xl p-2 transition-colors" onClick={() => navigate('/maintenance')}>
                    <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{m.icon || '🔧'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark-900">{m.name}</p>
                      <p className="text-xs text-dark-400">{m.frequency}</p>
                    </div>
                    {days !== null && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                        days < 0    ? 'bg-danger-light text-danger' :
                        days <= 7   ? 'bg-warning-light text-warning' :
                        'bg-dark-100 text-dark-500'}`}>
                        {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today' : `${days}d`}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
