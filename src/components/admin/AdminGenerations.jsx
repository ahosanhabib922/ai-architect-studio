import React, { useState, useEffect } from 'react';
import { Search, Sparkles, FileCode, MessageSquare, Clock, ChevronDown, ChevronUp, Eye, X, Download, FolderDown, Code, Layout, Loader, Smartphone } from 'lucide-react';
import { loadAllGenerations } from '../../utils/firestoreAdmin';
import { loadJSZip } from '../../utils/loadJSZip';
import { generateAIResponse } from '../../utils/generateAIResponse';

const AdminGenerations = () => {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [exportingReact, setExportingReact] = useState(null); // fileName being converted
  const [exportingFlutter, setExportingFlutter] = useState(null); // fileName being converted

  const downloadFile = (fileName, content) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadZip = async (files, projectTitle) => {
    try {
      const JSZip = await loadJSZip();
      const zip = new JSZip();
      Object.entries(files).forEach(([name, content]) => {
        zip.file(name, content.replace(/<script id="ai-architect-injected">[\s\S]*?<\/script>/, ''));
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(projectTitle || 'project').replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('ZIP export failed: ' + err.message);
    }
  };

  const exportReact = async (fileName, html) => {
    setExportingReact(fileName);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('script').forEach(s => s.remove());
      const cleanHTML = doc.body.innerHTML;
      const compName = fileName.replace(/\..+$/, '').replace(/^\w/, c => c.toUpperCase());

      const prompt = `Convert the following HTML into a clean, valid functional React component using Tailwind CSS.
      Rules:
      1. Export default a functional component named '${compName}'. Include import React.
      2. Convert all 'class' attributes to 'className'.
      3. Convert SVG attributes to camelCase JSX equivalents.
      4. Fix self-closing tags.
      5. Return ONLY the raw file string. Do NOT wrap in \`\`\`jsx.

      HTML TO CONVERT:
      ${cleanHTML}`;

      const { text: response } = await generateAIResponse(prompt, 'You are an expert React developer specializing in HTML-to-JSX conversion.');
      let content = response.replace(/^```(jsx|react|javascript|js)?\n?/, '').replace(/\n?```$/, '').trim();
      const blob = new Blob([content], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\..+$/, '')}.jsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('React export failed: ' + err.message);
    } finally {
      setExportingReact(null);
    }
  };

  const exportFlutter = async (fileName, html) => {
    setExportingFlutter(fileName);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      doc.querySelectorAll('script').forEach(s => s.remove());
      const cleanHTML = doc.body.innerHTML;
      const widgetName = fileName.replace(/\..+$/, '').replace(/(^|[_\-. ])(\w)/g, (_, _s, c) => c.toUpperCase());

      const prompt = `Convert the following HTML into a single-file Flutter widget using Material Design.
        Rules:
        1. Create a StatelessWidget named '${widgetName}'.
        2. Include all necessary imports (material.dart only).
        3. Include a main() function with runApp() that wraps the widget in MaterialApp(home: Scaffold(body: ${widgetName}())).
        4. Convert all CSS styles to Flutter equivalents (Container, Padding, Row, Column, Text, etc.).
        5. Use const constructors where possible.
        6. Convert colors from hex to Color(0xFF______) format.
        7. Convert font sizes, padding, margin to double values.
        8. Use ListView for scrollable content.
        9. Handle images with Image.network() or placeholder Icon widgets.
        10. Return ONLY the raw Dart code. Do NOT wrap in \`\`\`dart.

        HTML TO CONVERT:
        ${cleanHTML}`;

      const { text: response } = await generateAIResponse(prompt, 'You are an expert Flutter/Dart developer specializing in HTML-to-Flutter conversion. You write clean, single-file Dart code compatible with DartPad.');
      let content = response.replace(/^```(dart|flutter)?\n?/, '').replace(/\n?```$/, '').trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName.replace(/\..+$/, '')}.dart`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Flutter export failed: ' + err.message);
    } finally {
      setExportingFlutter(null);
    }
  };

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
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prompt</div>
                      <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                        {g.prompt}
                      </div>
                    </div>

                    {/* Generated Files */}
                    {g.fileCount > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Generated Files</div>
                          {/* Bulk export */}
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadZip(g.generatedFiles, g.title); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[11px] font-semibold transition-colors"
                          >
                            <FolderDown className="w-3.5 h-3.5" /> Download All ZIP
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {Object.entries(g.generatedFiles).map(([fileName, html]) => (
                            <div key={fileName} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg group hover:border-slate-300 transition-colors">
                              <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-xs font-medium text-slate-600 flex-1 truncate">{fileName}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setPreviewHtml({ title: `${g.userName} — ${fileName}`, html }); }}
                                  className="p-1.5 text-slate-400 hover:text-[#A78BFA] hover:bg-[#A78BFA]/10 rounded-md transition-colors" title="Preview"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); downloadFile(fileName, html); }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Download HTML"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(html); }}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" title="Copy HTML"
                                >
                                  <Code className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); exportReact(fileName, html); }}
                                  disabled={exportingReact === fileName}
                                  className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50" title="Export as React JSX"
                                >
                                  {exportingReact === fileName ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Layout className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); exportFlutter(fileName, html); }}
                                  disabled={exportingFlutter === fileName}
                                  className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors disabled:opacity-50" title="Export as Flutter/Dart"
                                >
                                  {exportingFlutter === fileName ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white w-full h-full flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-sm font-semibold text-slate-700">{previewHtml.title}</span>
              <button onClick={() => setPreviewHtml(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <iframe srcDoc={previewHtml.html} className="flex-1 w-full" sandbox="allow-scripts allow-same-origin" title="Preview" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerations;
