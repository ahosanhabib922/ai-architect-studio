import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

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
