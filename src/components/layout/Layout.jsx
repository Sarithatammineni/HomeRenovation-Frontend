// frontend/src/components/layout/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, FolderKanban, CheckSquare, DollarSign, ShoppingCart,
  HardHat, Package, FileText, Wrench, Sparkles, LayoutTemplate,
  LogOut, ChevronRight, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    links: [
      { to: '/',            icon: Home,          label: 'Dashboard',   end: true },
    ],
  },
  {
    label: 'Projects',
    links: [
      { to: '/projects',    icon: FolderKanban,  label: 'Projects' },
      { to: '/tasks',       icon: CheckSquare,   label: 'Tasks' },
      { to: '/templates',   icon: LayoutTemplate,label: 'Templates' },
    ],
  },
  {
    label: 'Finance',
    links: [
      { to: '/budget',      icon: DollarSign,    label: 'Budget & Expenses' },
      { to: '/shopping',    icon: ShoppingCart,  label: 'Shopping List' },
    ],
  },
  {
    label: 'Manage',
    links: [
      { to: '/contractors', icon: HardHat,       label: 'Contractors' },
      { to: '/inventory',   icon: Package,       label: 'Inventory' },
      { to: '/permits',     icon: FileText,      label: 'Permits' },
      { to: '/maintenance', icon: Wrench,        label: 'Maintenance' },
    ],
  },
  {
    label: 'Discover',
    links: [
      { to: '/inspiration', icon: Sparkles,      label: 'Inspiration' },
    ],
  },
];

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const initials = (name) =>
    (name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-dark-800">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display text-brand-400 font-semibold text-base leading-none">RenovateIQ</div>
          <div className="text-[10px] text-dark-600 uppercase tracking-widest mt-0.5">Home Tracker</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-dark-600 uppercase tracking-widest px-3 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <link.icon className="w-4 h-4 flex-shrink-0" />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User / sign out */}
      <div className="px-3 py-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials(displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-dark-200 text-sm font-semibold truncate">{displayName}</p>
            <p className="text-dark-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="nav-link w-full mt-1 text-danger hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex w-60 xl:w-64 bg-dark-900 flex-col flex-shrink-0 border-r border-dark-800">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 bg-dark-900 flex-col flex">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-dark-900 border-b border-dark-800">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-dark-400 hover:text-dark-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="font-display text-brand-400 font-semibold">RenovateIQ</div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
