import React, { useState, useEffect } from 'react';
import { Users, Layout, FileText, Clock } from 'lucide-react';
import { loadAllUsers, loadInstructionsFromFirestore } from '../../utils/firestoreAdmin';
import { TEMPLATES } from '../../config/templates';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, templates: TEMPLATES.length, lastUpdate: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadAllUsers().catch(() => []),
      loadInstructionsFromFirestore().catch(() => null),
    ]).then(([users, instructions]) => {
      setStats({
        users: users.length,
        templates: TEMPLATES.length,
        lastUpdate: instructions?.updatedAt || null,
      });
      setLoading(false);
    });
  }, []);

  const formatTime = (ts) => {
    if (!ts) return 'Never';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Templates', value: stats.templates, icon: Layout, color: 'bg-purple-50 text-[#A78BFA]' },
    { label: 'Instructions Updated', value: formatTime(stats.lastUpdate), icon: Clock, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your AI Architect Studio</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800">{card.value}</div>
                <div className="text-xs text-slate-500 mt-1">{card.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
