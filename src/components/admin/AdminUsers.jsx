import React, { useState, useEffect } from 'react';
import { Search, Users, Zap, RotateCcw, Check, Save } from 'lucide-react';
import { loadAllUsers, resetUserTokens, setUserTokenLimit } from '../../utils/firestoreAdmin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resetting, setResetting] = useState(null);
  const [editingLimit, setEditingLimit] = useState({}); // { [uid]: inputValue }
  const [savingLimit, setSavingLimit] = useState(null);
  const [savedLimit, setSavedLimit] = useState(null);

  useEffect(() => {
    loadAllUsers().then(u => { setUsers(u); setLoading(false); }).catch(e => { console.error('Load users failed:', e); setLoading(false); });
  }, []);

  const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (ts) => {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return formatDate(ts);
  };

  const formatTokens = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleResetTokens = async (uid) => {
    if (!confirm('Reset this user\'s token usage to 0?')) return;
    setResetting(uid);
    try {
      await resetUserTokens(uid);
      setUsers(prev => prev.map(u =>
        u.id === uid ? { ...u, tokenUsage: { promptTokens: 0, outputTokens: 0, totalTokens: 0, requestCount: 0 } } : u
      ));
    } catch (e) {
      console.error('Reset tokens failed:', e);
    }
    setResetting(null);
  };

  const handleSaveLimit = async (uid) => {
    const value = parseInt(editingLimit[uid]) || 0;
    setSavingLimit(uid);
    try {
      await setUserTokenLimit(uid, value);
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, tokenLimit: value } : u));
      setSavedLimit(uid);
      setTimeout(() => setSavedLimit(null), 2000);
      setEditingLimit(prev => { const n = { ...prev }; delete n[uid]; return n; });
    } catch (e) {
      console.error('Set token limit failed:', e);
    }
    setSavingLimit(null);
  };

  const totalTokensAll = users.reduce((sum, u) => sum + (u.tokenUsage?.totalTokens || 0), 0);

  const filtered = users.filter(u =>
    u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} registered users</p>
        </div>
        {totalTokensAll > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#A78BFA]/10 rounded-xl">
            <Zap className="w-4 h-4 text-[#A78BFA]" />
            <span className="text-sm font-semibold text-[#A78BFA]">{formatTokens(totalTokensAll)} total tokens</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/10 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">{search ? 'No matching users' : 'No users yet'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tokens Used</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Token Limit</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requests</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Active</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const tokens = u.tokenUsage?.totalTokens || 0;
                const requests = u.tokenUsage?.requestCount || 0;
                const currentLimit = u.tokenLimit || 0;
                const isEditing = editingLimit[u.id] !== undefined;
                const limitExceeded = currentLimit > 0 && tokens >= currentLimit;
                return (
                  <tr key={u.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${limitExceeded ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] text-sm font-bold">
                            {(u.displayName || u.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">{u.displayName || '—'}</div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        {tokens > 0 && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        <span className={`text-sm font-medium ${limitExceeded ? 'text-red-600' : tokens > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                          {formatTokens(tokens)}
                        </span>
                        {currentLimit > 0 && (
                          <span className="text-[10px] text-slate-400">/ {formatTokens(currentLimit)}</span>
                        )}
                      </div>
                      {tokens > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatTokens(u.tokenUsage?.promptTokens || 0)} in / {formatTokens(u.tokenUsage?.outputTokens || 0)} out
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={isEditing ? editingLimit[u.id] : (currentLimit || '')}
                          onChange={e => setEditingLimit(prev => ({ ...prev, [u.id]: e.target.value }))}
                          onFocus={() => { if (!isEditing) setEditingLimit(prev => ({ ...prev, [u.id]: String(currentLimit || '') })); }}
                          placeholder="0"
                          className="w-24 px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md outline-none focus:border-[#A78BFA]"
                        />
                        {isEditing && (
                          <button
                            onClick={() => handleSaveLimit(u.id)}
                            disabled={savingLimit === u.id}
                            className={`p-1 rounded-md transition-colors ${savedLimit === u.id ? 'text-emerald-600 bg-emerald-50' : 'text-[#A78BFA] hover:bg-[#A78BFA]/10'}`}
                            title="Save limit"
                          >
                            {savingLimit === u.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
                            ) : savedLimit === u.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                      {currentLimit > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {currentLimit === 0 ? 'Unlimited' : formatTokens(currentLimit) + ' max'}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{requests || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatTime(u.lastUsageAt || u.lastLoginAt)}</td>
                    <td className="px-5 py-4">
                      {tokens > 0 && (
                        <button
                          onClick={() => handleResetTokens(u.id)}
                          disabled={resetting === u.id}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                          title="Reset token usage to 0"
                        >
                          {resetting === u.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
