import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Check, Crown, Star } from 'lucide-react';
import { loadPlans, savePlans } from '../../utils/firestoreAdmin';

const PLAN_ICONS = { crown: Crown, star: Star };

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPlans().then(p => {
      if (p.length === 0) {
        // Default starter plans
        setPlans([
          { id: 'free', name: 'Free', tokenLimit: 50000, isDefault: true, color: '#64748b' },
          { id: 'pro', name: 'Pro', tokenLimit: 500000, isDefault: false, color: '#A78BFA' },
        ]);
      } else {
        setPlans(p);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatTokens = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePlans(plans);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Save plans failed:', e);
    }
    setSaving(false);
  };

  const updatePlan = (index, field, value) => {
    setPlans(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const setDefault = (index) => {
    setPlans(prev => prev.map((p, i) => ({ ...p, isDefault: i === index })));
  };

  const addPlan = () => {
    const id = 'plan_' + Date.now();
    setPlans(prev => [...prev, { id, name: '', tokenLimit: 100000, isDefault: false, color: '#A78BFA' }]);
  };

  const removePlan = (index) => {
    if (plans[index].isDefault) return;
    setPlans(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage subscription plans and token limits</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            saved ? 'bg-emerald-50 text-emerald-600' : 'bg-[#A78BFA] hover:bg-[#9061F9] text-white'
          }`}
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : saved ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saved ? 'Saved' : 'Save Plans'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((plan, i) => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border-2 transition-all p-6 relative"
                style={{ borderColor: plan.isDefault ? plan.color || '#A78BFA' : '#e2e8f0' }}
              >
                {plan.isDefault && (
                  <div
                    className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-white"
                    style={{ backgroundColor: plan.color || '#A78BFA' }}
                  >
                    Default
                  </div>
                )}

                {!plan.isDefault && (
                  <button
                    onClick={() => removePlan(i)}
                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-4 mt-2">
                  {/* Plan Name */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      value={plan.name}
                      onChange={e => updatePlan(i, 'name', e.target.value)}
                      placeholder="Plan name"
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#A78BFA]"
                    />
                  </div>

                  {/* Token Limit */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Token Limit</label>
                    <input
                      type="number"
                      value={plan.tokenLimit}
                      onChange={e => updatePlan(i, 'tokenLimit', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#A78BFA]"
                    />
                    <div className="text-[10px] text-slate-400 mt-1">{formatTokens(plan.tokenLimit)} tokens</div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="color"
                        value={plan.color || '#A78BFA'}
                        onChange={e => updatePlan(i, 'color', e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <span className="text-xs text-slate-500">{plan.color || '#A78BFA'}</span>
                    </div>
                  </div>

                  {/* Set as Default */}
                  {!plan.isDefault && (
                    <button
                      onClick={() => setDefault(i)}
                      className="w-full py-2 text-xs font-medium text-slate-500 hover:text-[#A78BFA] hover:bg-[#A78BFA]/5 rounded-xl border border-slate-200 hover:border-[#A78BFA]/30 transition-all"
                    >
                      Set as Default
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Plan Card */}
            <button
              onClick={addPlan}
              className="flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#A78BFA] hover:bg-[#A78BFA]/5 p-6 transition-all min-h-[280px]"
            >
              <Plus className="w-8 h-8 text-slate-300" />
              <span className="text-sm font-medium text-slate-400">Add Plan</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPlans;
