// frontend/src/components/pages/PermitsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Plus, X, FileText, AlertTriangle, CheckCircle2, Clock,
  Calendar, Building2, Search, Loader2, Trash2, Pencil,
  ChevronDown, AlertCircle, RefreshCw, ShieldCheck,
  FolderOpen, Info
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['required', 'pending', 'approved'];

const STATUS_META = {
  required: {
    label: 'Required',
    icon:  AlertTriangle,
    badge: 'bg-danger-light text-danger border border-danger/20',
    dot:   'bg-danger',
    card:  'border-l-danger',
    glow:  'shadow-[0_0_0_3px_rgba(185,64,64,0.1)]',
  },
  pending: {
    label: 'Pending',
    icon:  Clock,
    badge: 'bg-warning-light text-warning border border-warning/20',
    dot:   'bg-warning',
    card:  'border-l-warning',
    glow:  'shadow-[0_0_0_3px_rgba(212,160,23,0.1)]',
  },
  approved: {
    label: 'Approved',
    icon:  CheckCircle2,
    badge: 'bg-success-light text-success border border-success/20',
    dot:   'bg-success',
    card:  'border-l-success',
    glow:  'shadow-[0_0_0_3px_rgba(45,106,79,0.1)]',
  },
};

const EMPTY_FORM = {
  name: '', issuer: '', status: 'required',
  expiry_date: '', project_id: '', notes: '',
};

// ── Helpers ────────────────────────────────────────────────────────────────
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function ExpiryBadge({ dateStr }) {
  if (!dateStr) return <span className="text-dark-400 text-xs">No expiry</span>;
  const days = daysUntil(dateStr);
  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger">
        <AlertCircle className="w-3 h-3" /> Expired {Math.abs(days)}d ago
      </span>
    );
  if (days <= 30)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
        <AlertTriangle className="w-3 h-3" /> Expires in {days}d
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs text-dark-400">
      <Calendar className="w-3 h-3" /> {formatDate(dateStr)}
    </span>
  );
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card p-5 border-l-4 border-l-dark-200 space-y-3 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="skeleton h-4 w-2/5 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-3/5 rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
  );
}

// ── Add/Edit Modal ─────────────────────────────────────────────────────────
function PermitModal({ permit, projects, onClose, onSave }) {
  const [form,    setForm]    = useState(permit ? { ...permit } : { ...EMPTY_FORM });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const { user } = useAuth();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Permit name is required.');
    if (!form.project_id)  return setError('Please select a project.');

    setSaving(true);
    try {
      const payload = {
        name:        form.name.trim(),
        issuer:      form.issuer.trim() || null,
        status:      form.status,
        expiry_date: form.expiry_date || null,
        project_id:  form.project_id,
        notes:       form.notes?.trim() || null,
        user_id:     user.id,
      };

      let result;
      if (permit?.id) {
        const { data, error: err } = await supabase
          .from('permits')
          .update(payload)
          .eq('id', permit.id)
          .eq('user_id', user.id)
          .select('*, projects(name)')
          .single();
        if (err) throw err;
        result = data;
      } else {
        const { data, error: err } = await supabase
          .from('permits')
          .insert(payload)
          .select('*, projects(name)')
          .single();
        if (err) throw err;
        result = data;
      }
      onSave(result, !!permit?.id);
    } catch (err) {
      setError(err.message || 'Failed to save permit.');
    } finally {
      setSaving(false);
    }
  }

  // Close on backdrop click
  function onBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay" onClick={onBackdrop}>
      <div className="modal-box">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-brand-600" />
            </div>
            <h2 className="font-display text-lg font-bold text-dark-900">
              {permit ? 'Edit Permit' : 'Add Permit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-dark-100 flex items-center justify-center text-dark-400 hover:text-dark-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-danger-light border border-danger/20 rounded-xl px-4 py-3 animate-scale-in">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-danger text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Permit name */}
          <div>
            <label className="label">Permit Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Building Permit, Electrical Permit"
              className="field"
              required
            />
          </div>

          {/* Project */}
          <div>
            <label className="label">Project *</label>
            <div className="relative">
              <select
                value={form.project_id}
                onChange={set('project_id')}
                className="field appearance-none pr-9"
                required
              >
                <option value="">— Select project —</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            </div>
          </div>

          {/* Status + Issuer row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <div className="relative">
                <select
                  value={form.status}
                  onChange={set('status')}
                  className="field appearance-none pr-9"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              </div>
            </div>
            <div>
              <label className="label">Issuing Authority</label>
              <input
                type="text"
                value={form.issuer}
                onChange={set('issuer')}
                placeholder="e.g. GHMC, HMDA"
                className="field"
              />
            </div>
          </div>

          {/* Expiry date */}
          <div>
            <label className="label">Expiry Date</label>
            <input
              type="date"
              value={form.expiry_date}
              onChange={set('expiry_date')}
              className="field"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              value={form.notes || ''}
              onChange={set('notes')}
              placeholder="Any additional details about this permit…"
              rows={3}
              className="field resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin-fast" />Saving…</>
                : <><ShieldCheck className="w-4 h-4" />{permit ? 'Update Permit' : 'Add Permit'}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────
function DeleteModal({ permit, onClose, onConfirm, deleting }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center mx-auto">
            <Trash2 className="w-7 h-7 text-danger" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-dark-900 mb-1">Delete Permit?</h3>
            <p className="text-dark-500 text-sm leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-dark-800">"{permit.name}"</span>?
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="btn-danger flex-1"
            >
              {deleting
                ? <><Loader2 className="w-4 h-4 animate-spin-fast" />Deleting…</>
                : <><Trash2 className="w-4 h-4" />Delete</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Permit Card ────────────────────────────────────────────────────────────
function PermitCard({ permit, onEdit, onDelete, idx }) {
  const meta = STATUS_META[permit.status] || STATUS_META.required;
  const Icon = meta.icon;
  const days = daysUntil(permit.expiry_date);
  const isExpiringSoon = days !== null && days >= 0 && days <= 30;
  const isExpired      = days !== null && days < 0;

  return (
    <div
      className={`card border-l-4 ${meta.card} p-5 hover:shadow-pop transition-all duration-200 animate-fade-up group`}
      style={{ animationDelay: `${idx * 0.05}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
            ${permit.status === 'approved' ? 'bg-success-light' :
              permit.status === 'pending'  ? 'bg-warning-light' : 'bg-danger-light'}`}>
            <Icon className={`w-5 h-5
              ${permit.status === 'approved' ? 'text-success' :
                permit.status === 'pending'  ? 'text-warning'  : 'text-danger'}`}
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-dark-900 text-sm leading-snug truncate">{permit.name}</h3>
            {permit.projects?.name && (
              <div className="flex items-center gap-1 mt-0.5">
                <FolderOpen className="w-3 h-3 text-dark-400 flex-shrink-0" />
                <span className="text-xs text-dark-400 truncate">{permit.projects.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right — badge + actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge text-[10px] px-2.5 py-1 rounded-full font-bold border ${meta.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} mr-1.5 inline-block`} />
            {meta.label}
          </span>
          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onEdit(permit)}
              className="w-7 h-7 rounded-lg hover:bg-brand-100 flex items-center justify-center text-dark-400 hover:text-brand-600 transition-colors"
              title="Edit permit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(permit)}
              className="w-7 h-7 rounded-lg hover:bg-danger-light flex items-center justify-center text-dark-400 hover:text-danger transition-colors"
              title="Delete permit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {permit.issuer && (
          <div className="flex items-center gap-1.5 text-xs text-dark-500">
            <Building2 className="w-3 h-3 text-dark-400" />
            {permit.issuer}
          </div>
        )}
        <div className={`flex items-center gap-1.5 ${isExpired ? 'text-danger' : isExpiringSoon ? 'text-warning' : ''}`}>
          <ExpiryBadge dateStr={permit.expiry_date} />
        </div>
      </div>

      {/* Notes */}
      {permit.notes && (
        <div className="mt-3 flex items-start gap-1.5 text-xs text-dark-400 bg-dark-50 rounded-lg px-3 py-2">
          <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">{permit.notes}</span>
        </div>
      )}

      {/* Expiry warning banner */}
      {(isExpired || isExpiringSoon) && (
        <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium
          ${isExpired ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'}`}>
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          {isExpired
            ? `This permit expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago — renewal required`
            : `Expiring in ${days} day${days !== 1 ? 's' : ''} — action needed soon`
          }
        </div>
      )}
    </div>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────
function StatsBar({ permits }) {
  const counts = {
    total:    permits.length,
    required: permits.filter(p => p.status === 'required').length,
    pending:  permits.filter(p => p.status === 'pending').length,
    approved: permits.filter(p => p.status === 'approved').length,
    expiring: permits.filter(p => {
      const d = daysUntil(p.expiry_date);
      return d !== null && d >= 0 && d <= 30;
    }).length,
    expired: permits.filter(p => {
      const d = daysUntil(p.expiry_date);
      return d !== null && d < 0;
    }).length,
  };

  const stats = [
    { label: 'Total Permits',    value: counts.total,    icon: FileText,      bg: 'bg-brand-100    text-brand-600'   },
    { label: 'Required',         value: counts.required, icon: AlertTriangle, bg: 'bg-danger-light  text-danger'      },
    { label: 'Pending Approval', value: counts.pending,  icon: Clock,         bg: 'bg-warning-light text-warning'     },
    { label: 'Approved',         value: counts.approved, icon: CheckCircle2,  bg: 'bg-success-light text-success'     },
    { label: 'Expiring Soon',    value: counts.expiring, icon: AlertCircle,   bg: 'bg-warning-light text-warning'     },
    { label: 'Expired',          value: counts.expired,  icon: AlertTriangle, bg: 'bg-danger-light  text-danger'      },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="card p-4 text-center space-y-1.5 animate-fade-up"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mx-auto`}>
            <s.icon className="w-4 h-4" />
          </div>
          <div className="font-display text-2xl font-bold text-dark-900">{s.value}</div>
          <div className="text-[10px] text-dark-400 uppercase tracking-wider leading-tight">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ filtered, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
      <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center mb-5">
        <FileText className="w-10 h-10 text-brand-500" />
      </div>
      <h3 className="font-display text-xl font-bold text-dark-900 mb-2">
        {filtered ? 'No permits match your filters' : 'No permits yet'}
      </h3>
      <p className="text-dark-500 text-sm max-w-xs leading-relaxed mb-6">
        {filtered
          ? 'Try changing your search or filter criteria.'
          : 'Start tracking building permits, their approval status, and expiry dates.'
        }
      </p>
      {!filtered && (
        <button className="btn-primary" onClick={onAdd}>
          <Plus className="w-4 h-4" /> Add First Permit
        </button>
      )}
    </div>
  );
}

// ── Main PermitsPage ───────────────────────────────────────────────────────
export default function PermitsPage() {
  const { user } = useAuth();

  const [permits,        setPermits]        = useState([]);
  const [projects,       setProjects]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [error,          setError]          = useState('');

  // UI state
  const [search,         setSearch]         = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterProject,  setFilterProject]  = useState('all');
  const [showModal,      setShowModal]      = useState(false);
  const [editingPermit,  setEditingPermit]  = useState(null);
  const [deletingPermit, setDeletingPermit] = useState(null);
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [toast,          setToast]          = useState(null);

  // ── Toast helper ──────────────────────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ── Fetch permits + projects ──────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [permitsRes, projectsRes] = await Promise.all([
        supabase
          .from('permits')
          .select('*, projects(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('projects')
          .select('id, name, color')
          .eq('user_id', user.id)
          .order('name'),
      ]);

      if (permitsRes.error)  throw permitsRes.error;
      if (projectsRes.error) throw projectsRes.error;

      setPermits(permitsRes.data   || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load permits.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CRUD handlers ─────────────────────────────────────────────────────
  function handleSave(savedPermit, isEdit) {
    if (isEdit) {
      setPermits(prev => prev.map(p => p.id === savedPermit.id ? savedPermit : p));
      showToast('Permit updated successfully.');
    } else {
      setPermits(prev => [savedPermit, ...prev]);
      showToast('Permit added successfully.');
    }
    setShowModal(false);
    setEditingPermit(null);
  }

  async function handleDelete() {
    if (!deletingPermit) return;
    setDeleteLoading(true);
    try {
      const { error: err } = await supabase
        .from('permits')
        .delete()
        .eq('id', deletingPermit.id)
        .eq('user_id', user.id);
      if (err) throw err;
      setPermits(prev => prev.filter(p => p.id !== deletingPermit.id));
      showToast('Permit deleted.');
    } catch (err) {
      showToast(err.message || 'Failed to delete permit.', 'error');
    } finally {
      setDeleteLoading(false);
      setDeletingPermit(null);
    }
  }

  function openAdd() {
    setEditingPermit(null);
    setShowModal(true);
  }
  function openEdit(permit) {
    setEditingPermit(permit);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingPermit(null);
  }

  // ── Filter + Search ───────────────────────────────────────────────────
  const filtered = permits.filter(p => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.issuer?.toLowerCase().includes(search.toLowerCase()) ||
      p.projects?.name?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      filterStatus === 'all' ||
      filterStatus === 'expiring' ? (daysUntil(p.expiry_date) !== null && daysUntil(p.expiry_date) >= 0 && daysUntil(p.expiry_date) <= 30) :
      filterStatus === 'expired'  ? (daysUntil(p.expiry_date) !== null && daysUntil(p.expiry_date) < 0) :
      p.status === filterStatus;

    const matchProject =
      filterProject === 'all' || p.project_id === filterProject;

    return matchSearch && matchStatus && matchProject;
  });

  const isFiltered = search || filterStatus !== 'all' || filterProject !== 'all';

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Toast notification ─────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-pop text-sm font-medium animate-scale-in
          ${toast.type === 'error' ? 'bg-danger text-white' : 'bg-dark-900 text-white'}`}>
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
            : <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-600" />
            </div>
            Permits
          </h1>
          <p className="text-dark-500 text-sm mt-1 ml-[52px]">
            Track building permits, approvals and expiry dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="btn-ghost"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin-fast' : ''}`} />
            Refresh
          </button>
          <button className="btn-primary" onClick={openAdd}>
            <Plus className="w-4 h-4" /> Add Permit
          </button>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-danger-light border border-danger/20 rounded-2xl px-5 py-4 animate-scale-in">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <div className="flex-1">
            <p className="text-danger font-semibold text-sm">Failed to load permits</p>
            <p className="text-danger/70 text-xs mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchData()}
            className="text-xs text-danger font-semibold hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      {!loading && permits.length > 0 && <StatsBar permits={permits} />}

      {/* ── Filters row ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search permits, issuer, project…"
            className="field pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="field pr-9 appearance-none min-w-[150px]"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
            <option value="expiring">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        </div>

        {/* Project filter */}
        {projects.length > 0 && (
          <div className="relative">
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="field pr-9 appearance-none min-w-[160px]"
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          </div>
        )}

        {/* Clear filters */}
        {isFiltered && (
          <button
            onClick={() => { setSearch(''); setFilterStatus('all'); setFilterProject('all'); }}
            className="btn-ghost text-danger border-danger/30 hover:bg-danger-light"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}

        {/* Result count */}
        {!loading && (
          <span className="text-xs text-dark-400 font-mono ml-auto">
            {filtered.length} / {permits.length} permit{permits.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filtered={!!isFiltered} onAdd={openAdd} />
      ) : (
        <>
          {/* Expiry alerts section */}
          {(() => {
            const expiring = filtered.filter(p => {
              const d = daysUntil(p.expiry_date);
              return d !== null && d >= 0 && d <= 30;
            });
            const expired = filtered.filter(p => {
              const d = daysUntil(p.expiry_date);
              return d !== null && d < 0;
            });
            if (!expiring.length && !expired.length) return null;
            return (
              <div className="space-y-2">
                {expired.length > 0 && (
                  <div className="flex items-center gap-3 bg-danger-light border border-danger/20 rounded-2xl px-5 py-3.5 animate-scale-in">
                    <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
                    <p className="text-danger text-sm font-semibold">
                      {expired.length} permit{expired.length > 1 ? 's have' : ' has'} expired — renewal required immediately
                    </p>
                  </div>
                )}
                {expiring.length > 0 && (
                  <div className="flex items-center gap-3 bg-warning-light border border-warning/20 rounded-2xl px-5 py-3.5 animate-scale-in">
                    <Clock className="w-5 h-5 text-warning flex-shrink-0" />
                    <p className="text-warning text-sm font-semibold">
                      {expiring.length} permit{expiring.length > 1 ? 's are' : ' is'} expiring within 30 days
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((permit, idx) => (
              <PermitCard
                key={permit.id}
                permit={permit}
                idx={idx}
                onEdit={openEdit}
                onDelete={setDeletingPermit}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Add/Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <PermitModal
          permit={editingPermit}
          projects={projects}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* ── Delete Confirm Modal ────────────────────────────────────────── */}
      {deletingPermit && (
        <DeleteModal
          permit={deletingPermit}
          onClose={() => setDeletingPermit(null)}
          onConfirm={handleDelete}
          deleting={deleteLoading}
        />
      )}

    </div>
  );
}
