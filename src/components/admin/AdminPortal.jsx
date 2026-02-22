import React, { useState } from 'react';
import { LayoutDashboard, Users, Layout, FileText, ArrowLeft, Box, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminTemplates from './AdminTemplates';
import AdminInstructions from './AdminInstructions';
import AdminGenerations from './AdminGenerations';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'generations', label: 'Generations', icon: Sparkles },
  { id: 'templates', label: 'Templates', icon: Layout },
  { id: 'instructions', label: 'Instructions', icon: FileText },
];

const AdminPortal = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user || !isAdmin) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'users': return <AdminUsers />;
      case 'generations': return <AdminGenerations />;
      case 'templates': return <AdminTemplates />;
      case 'instructions': return <AdminInstructions />;
      default: return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#A78BFA]/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <div className="font-semibold text-slate-800 text-sm">Admin Portal</div>
              <div className="text-[10px] text-slate-400">AI Architect Studio</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#A78BFA]/10 text-[#A78BFA] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-100 space-y-1">
          <a
            href="https://expritor.com/studio"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Box className="w-4.5 h-4.5" />
            Open Studio
          </a>
          <a
            href="https://expritor.com"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Home
          </a>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
          {user.photoURL && <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />}
          <div className="min-w-0">
            <div className="text-xs font-medium text-slate-700 truncate">{user.displayName}</div>
            <div className="text-[10px] text-[#A78BFA]">Admin</div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-h-screen">
        {renderTab()}
      </main>
    </div>
  );
};

export default AdminPortal;
