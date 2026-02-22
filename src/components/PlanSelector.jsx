import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Crown } from 'lucide-react';
import { loadPlans, enrollUserInPlan } from '../utils/firestoreAdmin';

const PlanSelector = ({ user, currentPlanId, onClose, onPlanChanged }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    loadPlans().then(p => { setPlans(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const formatTokens = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const handleEnroll = async (plan) => {
    if (plan.id === currentPlanId) return;
    setEnrolling(plan.id);
    try {
      await enrollUserInPlan(user.uid, plan.id, plan.tokenLimit);
      onPlanChanged(plan);
    } catch (e) {
      console.error('Enroll failed:', e);
    }
    setEnrolling(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Choose Your Plan</h2>
            <p className="text-xs text-slate-400 mt-0.5">Select a plan that fits your needs</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No plans available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plans.map(plan => {
                const isCurrent = plan.id === currentPlanId;
                const color = plan.color || '#A78BFA';
                return (
                  <div
                    key={plan.id}
                    className="relative rounded-2xl border-2 p-5 transition-all"
                    style={{ borderColor: isCurrent ? color : '#e2e8f0' }}
                  >
                    {isCurrent && (
                      <div
                        className="absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md text-white"
                        style={{ backgroundColor: color }}
                      >
                        Current
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3 mt-1">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                        <Crown className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="text-base font-bold text-slate-800">{plan.name}</span>
                    </div>

                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-2xl font-bold text-slate-800">{formatTokens(plan.tokenLimit)}</span>
                      <span className="text-xs text-slate-400">tokens</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                      <Zap className="w-3.5 h-3.5" style={{ color }} />
                      <span>{formatTokens(plan.tokenLimit)} token generation limit</span>
                    </div>

                    <button
                      onClick={() => handleEnroll(plan)}
                      disabled={isCurrent || enrolling === plan.id}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={
                        isCurrent
                          ? { backgroundColor: color + '10', color, cursor: 'default' }
                          : { backgroundColor: color, color: 'white' }
                      }
                    >
                      {enrolling === plan.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : isCurrent ? (
                        <span className="flex items-center justify-center gap-1.5"><Check className="w-4 h-4" /> Active</span>
                      ) : (
                        'Select Plan'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
