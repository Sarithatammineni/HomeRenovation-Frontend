// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Loader2, Home } from 'lucide-react';

import Layout           from './components/layout/Layout';
import LoginPage        from './components/pages/LoginPage';
import SignupPage       from './components/pages/SignupPage';
import Dashboard        from './components/pages/Dashboard';
import ProjectsPage     from './components/pages/ProjectsPage';
import TasksPage        from './components/pages/TasksPage';
import BudgetPage       from './components/pages/BudgetPage';
import ShoppingPage     from './components/pages/ShoppingPage';
import ContractorsPage  from './components/pages/ContractorsPage';
import InventoryPage    from './components/pages/InventoryPage';
import PermitsPage      from './components/pages/PermitsPage';
import MaintenancePage  from './components/pages/MaintenancePage';
import TemplatesPage    from './components/pages/TemplatesPage';
import InspirationPage  from './components/pages/InspirationPage';

function AppLoader() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-5">
      <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow">
        <Home className="w-8 h-8 text-white" />
      </div>
      <div className="flex items-center gap-2 text-dark-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin-fast text-brand-400" />
        Loading RenovateIQ…
      </div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;

  return (
    <Routes>
      <Route path="/login"  element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index                element={<Dashboard />} />
        <Route path="projects"      element={<ProjectsPage />} />
        <Route path="tasks"         element={<TasksPage />} />
        <Route path="budget"        element={<BudgetPage />} />
        <Route path="shopping"      element={<ShoppingPage />} />
        <Route path="contractors"   element={<ContractorsPage />} />
        <Route path="inventory"     element={<InventoryPage />} />
        <Route path="permits"       element={<PermitsPage />} />
        <Route path="maintenance"   element={<MaintenancePage />} />
        <Route path="templates"     element={<TemplatesPage />} />
        <Route path="inspiration"   element={<InspirationPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
