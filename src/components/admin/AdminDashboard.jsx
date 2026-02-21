import React, { useState, useEffect } from 'react';
import { Users, Layout, Clock, Zap, Save, Check } from 'lucide-react';
import { loadAllUsers, loadInstructionsFromFirestore, loadSettingsFromFirestore, saveSettingsToFirestore } from '../../utils/firestoreAdmin';
import { TEMPLATES } from '../../config/templates';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, templates: TEMPLATES.length, lastUpdate: null, totalTokens: 0 });
  const [loading, setLoading] = useState(true);
  const [tokenLimit, setTokenLimit] = useState('');
  const [limitSaved, setLimitSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      loadAllUsers().catch(() => []),
      loadInstructionsFromFirestore().catch(() => null),
      loadSettingsFromFirestore().catch(() => ({})),
    ]).then(([users, instructions, settings]) => {
      const totalTokens = users.reduce((sum, u) => sum + (u.tokenUsage?.totalTokens || 0), 0);
      setStats({
        users: users.length,
        templates: TEMPLATES.length,
        lastUpdate: instructions?.updatedAt || null,
        totalTokens,
      });
      if (settings?.tokenLimit) setTokenLimit(String(settings.tokenLimit));
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

  const formatTokens = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleSaveLimit = async () => {
    setSaving(true);
    const value = parseInt(tokenLimit) || 0;
    await saveSettingsToFirestore({ tokenLimit: value });
    setLimitSaved(true);
    setSaving(false);
    setTimeout(() => setLimitSaved(false), 2000);
  };

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Templates', value: stats.templates, icon: Layout, color: 'bg-purple-50 text-[#A78BFA]' },
    { label: 'Total Tokens Used', value: formatTokens(stats.totalTokens), icon: Zap, color: 'bg-amber-50 text-amber-600' },
    { label: 'Instructions Updated', value: formatTime(stats.lastUpdate), icon: Clock, color: 'bg-slate-50 text-slate-600' },
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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

          {/* Token Limit Setting */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#A78BFA]" />
              <h2 className="text-sm font-semibold text-slate-800">Token Usage Limit</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Set the maximum tokens each user can consume. Set to 0 for unlimited.</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={tokenLimit}
                onChange={e => { setTokenLimit(e.target.value); setLimitSaved(false); }}
                placeholder="e.g. 500000"
                className="w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#A78BFA]"
              />
              <button
                onClick={handleSaveLimit}
                disabled={saving}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${limitSaved ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-[#A78BFA] hover:bg-[#9061F9] text-white'}`}
              >
                {limitSaved ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save</>}
              </button>
              {tokenLimit && parseInt(tokenLimit) > 0 && (
                <span className="text-xs text-slate-400">= {formatTokens(parseInt(tokenLimit))} tokens per user</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
