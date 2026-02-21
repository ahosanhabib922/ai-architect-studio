import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Plus, ArrowLeft, Upload, Code, Palette, Type, FileText, Check, Eye, Copy, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

/** Analyze HTML and auto-generate description + detect color */
const analyzeHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const lower = html.toLowerCase();

  const title = doc.querySelector('title')?.textContent?.trim() || '';

  const bodyClasses = doc.body?.className || '';
  const bodyStyle = doc.body?.getAttribute('style') || '';
  const darkSignals = ['bg-black', 'bg-slate-900', 'bg-slate-950', 'bg-neutral-950', 'bg-zinc-900', 'bg-gray-900',
    'bg-[#0', 'bg-[#1', 'dark', 'background-color: #0', 'background-color: #1', 'background: #0', 'background: #1'];
  const isDark = darkSignals.some(s => bodyClasses.includes(s) || bodyStyle.includes(s) || lower.slice(0, 2000).includes(s));
  const theme = isDark ? 'Dark' : 'Light';

  const colorWords = [];
  if (/purple|violet|#[89a-f][0-9a-f]*[89a-f]f/i.test(lower)) colorWords.push('purple');
  if (/emerald|green|#[0-4][0-9a-f]*[8-f][0-9a-f]/i.test(lower.slice(0, 3000))) colorWords.push('green');
  if (/blue|indigo|#[0-3][0-9a-f]*[8-f][8-f]/i.test(lower.slice(0, 3000))) colorWords.push('blue');
  if (/orange|amber/i.test(lower.slice(0, 3000))) colorWords.push('warm');
  if (/red|rose|crimson/i.test(lower.slice(0, 3000))) colorWords.push('red');
  if (/gold|yellow/i.test(lower.slice(0, 3000))) colorWords.push('gold');
  if (/neon|lime|#[89a-f][0-9a-f]*ff/i.test(lower.slice(0, 3000))) colorWords.push('neon');

  const categories = [];
  if (/dashboard|analytics|metrics|chart|stats/i.test(lower)) categories.push('dashboard');
  if (/portfolio|gallery|showcase/i.test(lower)) categories.push('portfolio');
  if (/landing|hero|cta|call.to.action/i.test(lower)) categories.push('landing');
  if (/saas|pricing|subscription|plan/i.test(lower)) categories.push('SaaS');
  if (/e-?commerce|shop|cart|product/i.test(lower)) categories.push('e-commerce');
  if (/blog|article|post|author/i.test(lower)) categories.push('blog');
  if (/finance|bank|trading|crypto|fintech/i.test(lower)) categories.push('finance');
  if (/health|medical|wellness|fitness/i.test(lower)) categories.push('health');
  if (/real.estate|property|listing/i.test(lower)) categories.push('real estate');
  if (/gaming|game|esport/i.test(lower)) categories.push('gaming');
  if (/restaurant|food|recipe|menu/i.test(lower)) categories.push('food');
  if (/agency|creative|studio|design/i.test(lower)) categories.push('agency');
  if (/login|auth|sign.?in|register/i.test(lower)) categories.push('auth');
  if (/mobile|app.store|ios|android/i.test(lower)) categories.push('mobile app');

  const styles = [];
  if (/glassmorphism|backdrop-blur|glass/i.test(lower)) styles.push('glassmorphism');
  if (/gradient/i.test(lower)) styles.push('gradient');
  if (/minimal|minimalist|clean/i.test(lower)) styles.push('minimal');
  if (/bold|brutalist|heavy/i.test(lower)) styles.push('bold');
  if (/rounded-3xl|rounded-\[2|pill/i.test(lower)) styles.push('rounded');
  if (/animate|animation|gsap|motion/i.test(lower)) styles.push('animated');
  if (/3d|perspective|rotateX|rotateY/i.test(lower)) styles.push('3D');

  let detectedColor = 'bg-white';
  if (bodyClasses.includes('bg-black') || bodyStyle.includes('#000')) detectedColor = 'bg-black';
  else if (bodyClasses.includes('bg-slate-950') || bodyClasses.includes('bg-[#020617]')) detectedColor = 'bg-slate-950';
  else if (bodyClasses.includes('bg-neutral-950') || bodyClasses.includes('bg-[#0a0a0a]')) detectedColor = 'bg-neutral-950';
  else if (bodyClasses.includes('bg-slate-900') || bodyClasses.includes('bg-[#0f172a]')) detectedColor = 'bg-slate-900';
  else if (bodyClasses.includes('bg-zinc-900') || bodyClasses.includes('bg-[#18181b]')) detectedColor = 'bg-zinc-900';
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

  const desc = parts.join(' ');
  return { desc, detectedColor, title };
};

const AdminTemplates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formColor, setFormColor] = useState('bg-white');
  const [formHtml, setFormHtml] = useState('');
  const fileInputRef = useRef(null);

  // Output state
  const [output, setOutput] = useState(null); // { configLine, fileName, id }
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const generateId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '').replace(/^-+/, '');

  const generateFileName = (name) => {
    const cleaned = name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
    return cleaned + '.html';
  };

  const handleGenerate = () => {
    if (!formName.trim() || !formHtml.trim()) return;
    const id = generateId(formName.trim());
    const fileName = generateFileName(formName.trim());
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
    a.href = url;
    a.download = output.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleReset = () => {
    setFormName(''); setFormDesc(''); setFormColor('bg-white'); setFormHtml('');
    setOutput(null); setCopied(false); setDownloaded(false);
  };

  const runAnalysis = (html) => {
    const { desc, detectedColor, title } = analyzeHtml(html);
    setFormDesc(desc);
    setFormColor(detectedColor);
    if (!formName && title) setFormName(title);
  };

  const handleHtmlChange = (html) => {
    setFormHtml(html);
    setOutput(null);
    if (html.length > 100) runAnalysis(html);
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-[#A78BFA]" />
              <span className="font-semibold text-slate-800">Template Generator</span>
            </div>
            <span className="text-xs bg-[#A78BFA]/10 text-[#A78BFA] px-2 py-0.5 rounded-full font-medium">Admin</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-[#A78BFA]/5 border border-[#A78BFA]/20 rounded-xl p-4 mb-8">
          <p className="text-sm text-slate-600">
            Paste your template HTML below. This tool will generate the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-[#A78BFA]">templates.js</code> config entry and download the HTML file for <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-[#A78BFA]">public/templates/</code>.
          </p>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Type className="w-3.5 h-3.5" /> Template Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={e => { setFormName(e.target.value); setOutput(null); }}
              placeholder="e.g. Luxury Interior"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/10"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <FileText className="w-3.5 h-3.5" /> Description
              <span className="text-[10px] text-slate-400 font-normal normal-case ml-1">(auto-generated from HTML)</span>
            </label>
            <input
              type="text"
              value={formDesc}
              onChange={e => { setFormDesc(e.target.value); setOutput(null); }}
              placeholder="e.g. Elegant bespoke interior design"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/10"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5" /> Background Color
              <span className="text-[10px] text-slate-400 font-normal normal-case ml-1">(auto-detected from HTML)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.value}
                  onClick={() => { setFormColor(c.value); setOutput(null); }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${formColor === c.value ? 'border-[#A78BFA] scale-110 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                  style={{ backgroundColor: colorMap[c.value] }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* HTML Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> HTML Code
              </label>
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3 h-3" /> Upload .html
                </button>
              </div>
            </div>
            <textarea
              value={formHtml}
              onChange={e => handleHtmlChange(e.target.value)}
              placeholder="Paste your full HTML template code here..."
              rows={12}
              className="w-full px-4 py-3 bg-slate-950 text-emerald-400 border border-slate-700 rounded-xl text-xs font-mono outline-none focus:border-[#A78BFA] focus:ring-2 focus:ring-[#A78BFA]/10 resize-y"
              spellCheck={false}
            />
            {formHtml && (
              <div className="mt-2 text-xs text-slate-400">
                {(formHtml.length / 1024).toFixed(1)} KB
              </div>
            )}
          </div>

          {/* Preview */}
          {formHtml && (
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" /> Preview
              </label>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <iframe
                  srcDoc={formHtml}
                  className="w-full h-[300px]"
                  sandbox="allow-same-origin allow-scripts"
                  title="Template Preview"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={!formName.trim() || !formHtml.trim()}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Generate Config
            </button>
            {output && (
              <button onClick={handleReset} className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Reset
              </button>
            )}
          </div>

          {/* Output Section */}
          {output && (
            <div className="space-y-4 pt-2">
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Step 1 — Copy config line to templates.js</span>
                  <button
                    onClick={handleCopyConfig}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${copied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <div className="p-4">
                  <pre className="bg-slate-950 text-emerald-400 text-xs font-mono p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">{output.configLine}</pre>
                  <p className="text-xs text-slate-500 mt-3">
                    Add this line inside the <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">TEMPLATES</code> array in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">src/config/templates.js</code>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Step 2 — Download HTML file</span>
                  <button
                    onClick={handleDownloadHtml}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${downloaded ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-[#A78BFA] hover:bg-[#9061F9] text-white'}`}
                  >
                    {downloaded ? <><Check className="w-3 h-3" /> Downloaded!</> : <><Download className="w-3 h-3" /> Download {output.fileName}</>}
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500">
                    Place the downloaded <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">{output.fileName}</code> file into <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">public/templates/</code> folder, then deploy.
                  </p>
                </div>
              </div>

              {copied && downloaded && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-sm text-emerald-700">
                    All done! Add the config line to <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-xs">templates.js</code>, drop the HTML file in <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-xs">public/templates/</code>, and deploy to Vercel.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTemplates;
