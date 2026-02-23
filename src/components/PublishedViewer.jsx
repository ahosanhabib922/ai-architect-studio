import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, Monitor, Smartphone, ChevronDown } from 'lucide-react';
import { loadPublishedSite } from '../utils/publishSite';

const PublishedViewer = () => {
  const { slug } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFile, setActiveFile] = useState('');
  const [viewMode, setViewMode] = useState('desktop');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!slug) return;
    loadPublishedSite(slug)
      .then(data => {
        if (!data) { setError('Site not found'); setLoading(false); return; }
        setSite(data);
        setActiveFile(data.mainFile || Object.keys(data.fileContents)[0]);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load site'); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!site || !activeFile || !iframeRef.current) return;
    const html = site.fileContents[activeFile];
    if (!html) return;

    // Inject navigation script for multi-page support
    const navScript = `<script>
      document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        e.preventDefault();
        const fileName = href.split('/').pop().split('?')[0].split('#')[0];
        if (fileName && fileName.endsWith('.html')) {
          window.parent.postMessage({ type: 'VIEWER_NAVIGATE', fileName: fileName }, '*');
        }
      }, true);
    </script>`;

    const injected = html.replace('</body>', `${navScript}</body>`);
    const blob = new Blob([injected], { type: 'text/html' });
    iframeRef.current.src = URL.createObjectURL(blob);
  }, [site, activeFile]);

  // Listen for navigation messages from iframe
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'VIEWER_NAVIGATE' && site) {
        const target = e.data.fileName;
        const files = Object.keys(site.fileContents);
        // Exact match
        if (files.includes(target)) { setActiveFile(target); return; }
        // Fuzzy match
        const baseName = target.replace(/\.(page|organism|molecule|atom)\.html$/, '');
        const match = files.find(f => f.replace(/\.(page|organism|molecule|atom)\.html$/, '') === baseName);
        if (match) setActiveFile(match);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [site]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading site...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">{error}</h2>
        <p className="text-sm text-slate-500">This site may have been unpublished or doesn't exist.</p>
        <a href="/" className="inline-block mt-4 text-sm text-[#A78BFA] hover:underline">Go to Expritor</a>
      </div>
    </div>
  );

  const fileNames = Object.keys(site.fileContents);
  const iframeWidth = viewMode === 'mobile' ? '402px' : '100%';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#A78BFA] transition-colors">
            <div className="w-6 h-6 bg-[#A78BFA]/10 rounded-lg flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-[#A78BFA]" />
            </div>
            Expritor
          </a>
          <div className="w-px h-5 bg-slate-200" />
          <span className="text-sm text-slate-500 truncate max-w-[200px]">{site.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* File selector for multi-page */}
          {fileNames.length > 1 && (
            <div className="relative">
              <button onClick={() => setShowFileMenu(!showFileMenu)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                {activeFile} <ChevronDown className="w-3 h-3" />
              </button>
              {showFileMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                  {fileNames.map(f => (
                    <button key={f} onClick={() => { setActiveFile(f); setShowFileMenu(false); }} className={`w-full text-left px-4 py-2 text-xs transition-colors ${f === activeFile ? 'bg-[#A78BFA]/10 text-[#A78BFA] font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Viewport toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('desktop')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
              <Monitor className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Iframe */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-auto">
        <iframe
          ref={iframeRef}
          title="Published Site"
          sandbox="allow-scripts allow-same-origin"
          className="bg-white shadow-lg rounded-lg border border-slate-200"
          style={{ width: iframeWidth, height: 'calc(100vh - 80px)', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};

export default PublishedViewer;
