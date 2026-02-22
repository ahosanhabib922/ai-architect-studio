import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

/** Load user's current token usage + limit + plan from Firestore */
export const getUserTokenInfo = async (uid) => {
  if (!uid) return { used: 0, limit: 0, planId: null };
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return { used: 0, limit: 0, planId: null };
    const data = snap.data();
    return {
      used: data?.tokenUsage?.totalTokens || 0,
      limit: data?.tokenLimit || 0,
      planId: data?.planId || null,
    };
  } catch { return { used: 0, limit: 0, planId: null }; }
};

/** Atomically add token usage to user's profile in Firestore */
export const trackTokenUsage = async (uid, usage) => {
  if (!uid || !usage?.totalTokens) return;
  try {
    await setDoc(doc(db, 'users', uid), {
      tokenUsage: {
        promptTokens: increment(usage.promptTokens || 0),
        outputTokens: increment(usage.outputTokens || 0),
        totalTokens: increment(usage.totalTokens || 0),
        requestCount: increment(1),
      },
      lastUsageAt: Date.now(),
    }, { merge: true });
  } catch (e) {
    console.error('Token tracking failed:', e);
  }
};
