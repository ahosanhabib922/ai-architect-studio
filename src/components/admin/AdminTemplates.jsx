import React, { useState, useRef } from 'react';
import { Plus, Upload, Code, Palette, Type, FileText, Check, Eye, Copy, Download, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { TEMPLATES } from '../../config/templates';

const COLOR_PRESETS = [
  { label: 'White', value: 'bg-white' },
  { label: 'Slate 50', value: 'bg-slate-50' },
  { label: 'Slate 100', value: 'bg-slate-100' },
  { label: 'Slate 900', value: 'bg-slate-900' },
  { label: 'Slate 950', value: 'bg-slate-950' },
  { label: 'Neutral 950', value: 'bg-neutral-950' },
  { label: 'Black', value: 'bg-black' },
  { label: 'Stone 50', value: 'bg-stone-50' },
  { label: 'Amber 50', value: 'bg-amber-50' },
  { label: 'Emerald 50', value: 'bg-emerald-50' },
  { label: 'Violet 600', value: 'bg-violet-600' },
  { label: 'Red 950', value: 'bg-red-950' },
  { label: 'Zinc 900', value: 'bg-zinc-900' },
  { label: 'Gray 100', value: 'bg-gray-100' },
];

const colorMap = {
  'bg-white': '#ffffff', 'bg-slate-50': '#f8fafc', 'bg-slate-100': '#f1f5f9',
  'bg-slate-900': '#0f172a', 'bg-slate-950': '#020617', 'bg-neutral-950': '#0a0a0a',
  'bg-black': '#000000', 'bg-stone-50': '#fafaf9', 'bg-amber-50': '#fffbeb',
  'bg-emerald-50': '#ecfdf5', 'bg-violet-600': '#7c3aed', 'bg-red-950': '#450a0a',
  'bg-zinc-900': '#18181b', 'bg-gray-100': '#f3f4f6',
};

const analyzeHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const lower = html.toLowerCase();
  const title = doc.querySelector('title')?.textContent?.trim() || '';
  const bodyClasses = doc.body?.className || '';
  const bodyStyle = doc.body?.getAttribute('style') || '';
  const darkSignals = ['bg-black', 'bg-slate-900', 'bg-slate-950', 'bg-neutral-950', 'bg-zinc-900', 'bg-gray-900', 'bg-[#0', 'bg-[#1', 'dark', 'background-color: #0', 'background-color: #1', 'background: #0', 'background: #1'];
  const isDark = darkSignals.some(s => bodyClasses.includes(s) || bodyStyle.includes(s) || lower.slice(0, 2000).includes(s));
  const theme = isDark ? 'Dark' : 'Light';
  const colorWords = [];
  if (/purple|violet/i.test(lower)) colorWords.push('purple');
  if (/emerald|green/i.test(lower.slice(0, 3000))) colorWords.push('green');
  if (/blue|indigo/i.test(lower.slice(0, 3000))) colorWords.push('blue');
  if (/orange|amber/i.test(lower.slice(0, 3000))) colorWords.push('warm');
  if (/red|rose|crimson/i.test(lower.slice(0, 3000))) colorWords.push('red');
  if (/neon|lime/i.test(lower.slice(0, 3000))) colorWords.push('neon');
  const categories = [];
  if (/dashboard|analytics|metrics/i.test(lower)) categories.push('dashboard');
  if (/portfolio|gallery/i.test(lower)) categories.push('portfolio');
  if (/landing|hero|cta/i.test(lower)) categories.push('landing');
  if (/saas|pricing|subscription/i.test(lower)) categories.push('SaaS');
  if (/e-?commerce|shop|cart/i.test(lower)) categories.push('e-commerce');
  if (/finance|bank|trading/i.test(lower)) categories.push('finance');
  if (/health|medical|wellness/i.test(lower)) categories.push('health');
  if (/gaming|game|esport/i.test(lower)) categories.push('gaming');
  if (/agency|creative|studio/i.test(lower)) categories.push('agency');
  const styles = [];
  if (/glassmorphism|backdrop-blur/i.test(lower)) styles.push('glassmorphism');
  if (/gradient/i.test(lower)) styles.push('gradient');
  if (/minimal|clean/i.test(lower)) styles.push('minimal');
  if (/animate|animation|gsap/i.test(lower)) styles.push('animated');
  let detectedColor = 'bg-white';
  if (bodyClasses.includes('bg-black') || bodyStyle.includes('#000')) detectedColor = 'bg-black';
  else if (bodyClasses.includes('bg-slate-950')) detectedColor = 'bg-slate-950';
  else if (bodyClasses.includes('bg-neutral-950')) detectedColor = 'bg-neutral-950';
  else if (bodyClasses.includes('bg-slate-900')) detectedColor = 'bg-slate-900';
  else if (bodyClasses.includes('bg-zinc-900')) detectedColor = 'bg-zinc-900';
  else if (bodyClasses.includes('bg-slate-50')) detectedColor = 'bg-slate-50';
  else if (bodyClasses.includes('bg-slate-100')) detectedColor = 'bg-slate-100';
  else if (bodyClasses.includes('bg-gray-100')) detectedColor = 'bg-gray-100';
  else if (bodyClasses.includes('bg-stone-50')) detectedColor = 'bg-stone-50';
  else if (bodyClasses.includes('bg-amber-50')) detectedColor = 'bg-amber-50';
  else if (bodyClasses.includes('bg-emerald-50')) detectedColor = 'bg-emerald-50';
  else if (isDark) detectedColor = 'bg-slate-950';
  const parts = [theme];
  if (styles.length) parts.push(styles[0]);
  if (colorWords.length) parts.push(colorWords[0] + '-accented');
  if (categories.length) parts.push(categories[0]);
  else parts.push('website');
  return { desc: parts.join(' '), detectedColor, title };
};

const AdminTemplates = () => {
  const [search, setSearch] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);

  // Generator state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('bg-white');
  const [formHtml, setFormHtml] = useState('');
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const fileInputRef = useRef(null);

  const filtered = TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    if (!formName.trim() || !formHtml.trim()) return;
    const id = formName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const fileName = formName.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') + '.html';
    const configLine = `  { id: '${id}', name: '${formName.trim()}', desc: '${formDesc.trim()}', color: '${formColor}', file: '${fileName}' },`;
    setOutput({ configLine, fileName, id });
    setCopied(false);
    setDownloaded(false);
  };

  const handleCopyConfig = () => {
    if (!output) return;
    navigator.clipboard.writeText(output.configLine);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!output || !formHtml) return;
    const blob = new Blob([formHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = output.fileName;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleHtmlChange = (html) => {
    setFormHtml(html);
    setOutput(null);
    if (html.length > 100) {
      const { desc, detectedColor, title } = analyzeHtml(html);
      setFormDesc(desc);
      setFormColor(detectedColor);
      if (!formName && title) setFormName(title);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const html = ev.target.result;
      setFormHtml(html);
      setOutput(null);
      const { desc, detectedColor, title } = analyzeHtml(html);
      setFormDesc(desc);
      setFormColor(detectedColor);
      if (!formName) {
        const name = title || file.name.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ');
        setFormName(name.charAt(0).toUpperCase() + name.slice(1));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetGenerator = () => {
    setFormName(''); setFormDesc(''); setFormColor('bg-white'); setFormHtml('');
    setOutput(null); setCopied(false); setDownloaded(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Templates</h1>
          <p className="text-sm text-slate-500 mt-1">{TEMPLATES.length} design DNA templates</p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="px-4 py-2 text-sm font-medium text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-xl transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>

      {/* Template Generator (collapsible) */}
      {showGenerator && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-700">Template Generator</h2>
            <button onClick={() => { setShowGenerator(false); resetGenerator(); }} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Type className="w-3.5 h-3.5" /> Name
                </label>
                <input type="text" value={formName} onChange={e => { setFormName(e.target.value); setOutput(null); }}
                  placeholder="e.g. Luxury Interior" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#A78BFA]" />
              </div>
              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5" /> Description <span className="text-[10px] text-slate-400 font-normal normal-case">(auto)</span>
                </label>
                <input type="text" value={formDesc} onChange={e => { setFormDesc(e.target.value); setOutput(null); }}
                  placeholder="Auto-generated from HTML" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#A78BFA]" />
              </div>
              {/* Color */}
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                  <Palette className="w-3.5 h-3.5" /> Color <span className="text-[10px] text-slate-400 font-normal normal-case">(auto)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map(c => (
                    <button key={c.value} onClick={() => { setFormColor(c.value); setOutput(null); }}
                      className={`w-7 h-7 rounded-lg border-2 transition-all ${formColor === c.value ? 'border-[#A78BFA] scale-110' : 'border-slate-200 hover:border-slate-300'}`}
                      style={{ backgroundColor: colorMap[c.value] }} title={c.label} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* HTML */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" /> HTML
                  </label>
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload
                    </button>
                  </div>
                </div>
                <textarea value={formHtml} onChange={e => handleHtmlChange(e.target.value)}
                  placeholder="Paste HTML here..." rows={8}
                  className="w-full px-3 py-2 bg-slate-950 text-emerald-400 border border-slate-700 rounded-lg text-xs font-mono outline-none focus:border-[#A78BFA] resize-y"
                  spellCheck={false} />
                {formHtml && <div className="text-[10px] text-slate-400 mt-1">{(formHtml.length / 1024).toFixed(1)} KB</div>}
              </div>

              {/* Preview */}
              {formHtml && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <iframe srcDoc={formHtml} className="w-full h-[160px]" sandbox="allow-same-origin allow-scripts" title="Preview" />
                </div>
              )}
            </div>
          </div>

          {/* Generate + Output */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <button onClick={handleGenerate} disabled={!formName.trim() || !formHtml.trim()}
              className="px-5 py-2 text-sm font-medium text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-4 h-4" /> Generate Config
            </button>

            {output && (
              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">1. Copy config line → templates.js</span>
                    <button onClick={handleCopyConfig}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 ${copied ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'}`}>
                      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="bg-slate-950 text-emerald-400 text-xs font-mono p-3 rounded-lg overflow-x-auto">{output.configLine}</pre>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">2. Download HTML → public/templates/</span>
                    <button onClick={handleDownloadHtml}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 ${downloaded ? 'bg-emerald-50 text-emerald-600' : 'bg-[#A78BFA] hover:bg-[#9061F9] text-white'}`}>
                      {downloaded ? <><Check className="w-3 h-3" /> Done</> : <><Download className="w-3 h-3" /> {output.fileName}</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/10 transition-all" />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-md transition-all">
            <div className="h-32 relative overflow-hidden" style={{ backgroundColor: colorMap[t.color] || '#ffffff' }}>
              <iframe
                src={`/templates/${t.file}`}
                className="w-[200%] h-[200%] origin-top-left pointer-events-none absolute top-0 left-0"
                style={{ transform: 'scale(0.5)' }}
                sandbox="allow-same-origin allow-scripts"
                title={t.name}
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: colorMap[t.color] || '#fff' }} />
                <h3 className="font-semibold text-sm text-slate-800">{t.name}</h3>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{t.desc}</p>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">{t.file}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTemplates;
