import React, { useState, useEffect } from 'react';
import { Search, Sparkles, FileCode, MessageSquare, Clock, ChevronDown, ChevronUp, Eye, X } from 'lucide-react';
import { loadAllGenerations } from '../../utils/firestoreAdmin';

const AdminGenerations = () => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);

  useEffect(() => {
    loadAllGenerations()
      .then(g => { setGenerations(g); setLoading(false); })
      .catch(e => { console.error('Load generations failed:', e); setLoading(false); });
  }, []);

  const formatTime = (ts) => {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filtered = generations.filter(g =>
    g.userName?.toLowerCase().includes(search.toLowerCase()) ||
    g.title?.toLowerCase().includes(search.toLowerCase()) ||
    g.prompt?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Generations</h1>
          <p className="text-sm text-slate-500 mt-1">{generations.length} total generations across all users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by user, title, or prompt..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/10 transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">{search ? 'No matching generations' : 'No generations yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(g => {
            const isExpanded = expandedId === g.id;
            return (
              <div key={g.uid + g.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-sm transition-shadow">
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : g.id)}
                >
                  {/* User avatar */}
                  {g.userPhoto ? (
                    <img src={g.userPhoto} alt="" className="w-8 h-8 rounded-full shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] text-xs font-bold shrink-0">
                      {(g.userName || '?')[0].toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800 truncate">{g.title}</span>
                      {g.template && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-[#A78BFA]/10 text-[#A78BFA]">
                          {g.template.name}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {g.userName} — {g.prompt.substring(0, 80)}{g.prompt.length > 80 ? '...' : ''}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-1 text-slate-400" title="Messages">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="text-xs">{g.messageCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400" title="Generated files">
                      <FileCode className="w-3.5 h-3.5" />
                      <span className="text-xs">{g.fileCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400" title="Created">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{formatTime(g.createdAt)}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prompt</div>
                    <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                      {g.prompt}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400">
                      <span>Created: {formatTime(g.createdAt)}</span>
                      <span>Updated: {formatTime(g.updatedAt)}</span>
                      <span>User prompts: {g.messageCount}</span>
                      <span>Files: {g.fileCount}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* HTML Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">Preview</span>
              <button onClick={() => setPreviewHtml(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <iframe srcDoc={previewHtml} className="flex-1 w-full" sandbox="allow-scripts allow-same-origin" title="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerations;
