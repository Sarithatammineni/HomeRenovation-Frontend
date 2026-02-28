// frontend/src/lib/api.js
// All data requests go through the Express backend (not Supabase directly).
// The backend validates the user's JWT before touching the database.
import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
  };
}

async function req(path, opts = {}) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...headers, ...opts.headers },
  });
  const json = await res.json().catch(() => ({ error: 'Invalid server response' }));
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// Generic REST helper for a given table/route
const r = (route) => ({
  list:   (params = {}) => req(`/${route}?${new URLSearchParams(params)}`),
  get:    (id)          => req(`/${route}/${id}`),
  create: (body)        => req(`/${route}`, { method: 'POST',   body: JSON.stringify(body) }),
  update: (id, body)    => req(`/${route}/${id}`, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (id)          => req(`/${route}/${id}`, { method: 'DELETE' }),
});

export const api = {
  projects:    r('projects'),
  tasks:       r('tasks'),
  expenses: {
    ...r('expenses'),
    summary: () => req('/expenses/summary'),
  },
  shopping:    r('shopping'),
  contractors: r('contractors'),
  inventory:   r('inventory'),
  permits:     r('permits'),
  maintenance: r('maintenance'),
  templates: {
    list:  ()     => req('/templates'),
    apply: (body) => req('/templates/apply', { method: 'POST', body: JSON.stringify(body) }),
  },
};
