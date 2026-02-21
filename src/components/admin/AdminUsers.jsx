import React, { useState, useEffect } from 'react';
import { Search, Users, Zap } from 'lucide-react';
import { loadAllUsers } from '../../utils/firestoreAdmin';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tokens Used</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Requests</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Signed Up</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const tokens = u.tokenUsage?.totalTokens || 0;
                const requests = u.tokenUsage?.requestCount || 0;
                return (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] text-sm font-bold">
                            {(u.displayName || u.email || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-sm font-medium text-slate-800">{u.displayName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {tokens > 0 && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        <span className={`text-sm font-medium ${tokens > 0 ? 'text-slate-800' : 'text-slate-400'}`}>
                          {formatTokens(tokens)}
                        </span>
                      </div>
                      {tokens > 0 && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatTokens(u.tokenUsage?.promptTokens || 0)} in / {formatTokens(u.tokenUsage?.outputTokens || 0)} out
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{requests || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatTime(u.lastUsageAt || u.lastLoginAt)}</td>
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
