import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Check, FileText } from 'lucide-react';
import { loadInstructionsFromFirestore, saveInstructionsToFirestore } from '../../utils/firestoreAdmin';
import { SYSTEM_INSTRUCTION, PRD_ANALYSIS_INSTRUCTION } from '../../config/api';

const AdminInstructions = () => {
  const [systemInst, setSystemInst] = useState('');
  const [prdInst, setPrdInst] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // 'system' | 'prd' | null
  const [saved, setSaved] = useState(null); // 'system' | 'prd' | null
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadInstructionsFromFirestore().then(data => {
      setSystemInst(data?.systemInstruction || SYSTEM_INSTRUCTION);
      setPrdInst(data?.prdAnalysisInstruction || PRD_ANALYSIS_INSTRUCTION);
      setLastUpdate(data?.updatedAt || null);
      setLoading(false);
    }).catch(() => {
      setSystemInst(SYSTEM_INSTRUCTION);
      setPrdInst(PRD_ANALYSIS_INSTRUCTION);
      setLoading(false);
    });
  }, []);

  const handleSaveSystem = async () => {
    setSaving('system');
    await saveInstructionsToFirestore({ systemInstruction: systemInst });
    setSaving(null);
    setSaved('system');
    setLastUpdate(Date.now());
    setTimeout(() => setSaved(null), 2000);
  };

  const handleSavePrd = async () => {
    setSaving('prd');
    await saveInstructionsToFirestore({ prdAnalysisInstruction: prdInst });
    setSaving(null);
    setSaved('prd');
    setLastUpdate(Date.now());
    setTimeout(() => setSaved(null), 2000);
  };

  const formatTime = (ts) => {
    if (!ts) return 'Never saved';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Instructions</h1>
          <p className="text-sm text-slate-500 mt-1">Edit AI system instructions — changes take effect for new sessions</p>
        </div>
        <span className="text-xs text-slate-400">Last saved: {formatTime(lastUpdate)}</span>
      </div>

      <div className="space-y-8">
        {/* SYSTEM INSTRUCTION */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#A78BFA]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">SYSTEM_INSTRUCTION</h2>
                <p className="text-[11px] text-slate-400">Main AI prompt for generating HTML templates</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">{systemInst.length.toLocaleString()} chars</span>
              <button
                onClick={() => setSystemInst(SYSTEM_INSTRUCTION)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset to hardcoded default"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={handleSaveSystem}
                disabled={saving === 'system'}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  saved === 'system'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-[#A78BFA] hover:bg-[#9061F9] text-white'
                }`}
              >
                {saving === 'system' ? (
                  <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving</>
                ) : saved === 'system' ? (
                  <><Check className="w-3 h-3" /> Saved</>
                ) : (
                  <><Save className="w-3 h-3" /> Save</>
                )}
              </button>
            </div>
          </div>
          <textarea
            value={systemInst}
            onChange={e => setSystemInst(e.target.value)}
            className="w-full px-6 py-4 bg-slate-950 text-slate-300 text-xs font-mono outline-none resize-y min-h-[400px] leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* PRD ANALYSIS INSTRUCTION */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">PRD_ANALYSIS_INSTRUCTION</h2>
                <p className="text-[11px] text-slate-400">Prompt for analyzing user requests and determining pages to build</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">{prdInst.length.toLocaleString()} chars</span>
              <button
                onClick={() => setPrdInst(PRD_ANALYSIS_INSTRUCTION)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button
                onClick={handleSavePrd}
                disabled={saving === 'prd'}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  saved === 'prd'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-[#A78BFA] hover:bg-[#9061F9] text-white'
                }`}
              >
                {saving === 'prd' ? (
                  <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving</>
                ) : saved === 'prd' ? (
                  <><Check className="w-3 h-3" /> Saved</>
                ) : (
                  <><Save className="w-3 h-3" /> Save</>
                )}
              </button>
            </div>
          </div>
          <textarea
            value={prdInst}
            onChange={e => setPrdInst(e.target.value)}
            className="w-full px-6 py-4 bg-slate-950 text-slate-300 text-xs font-mono outline-none resize-y min-h-[300px] leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminInstructions;
