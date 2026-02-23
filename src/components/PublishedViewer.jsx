import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { loadPublishedSite } from '../utils/publishSite';

const PublishedViewer = () => {
  const { slug } = useParams();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFile, setActiveFile] = useState('');
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
        if (files.includes(target)) { setActiveFile(target); return; }
        const baseName = target.replace(/\.(page|organism|molecule|atom)\.html$/, '');
        const match = files.find(f => f.replace(/\.(page|organism|molecule|atom)\.html$/, '') === baseName);
        if (match) setActiveFile(match);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [site]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
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

  return (
    <iframe
      ref={iframeRef}
      title="Published Site"
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height: '100vh', border: 'none', display: 'block' }}
    />
  );
};

export default PublishedViewer;
