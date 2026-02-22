import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

/** Load instructions from Firestore config/instructions */
export const loadInstructionsFromFirestore = async () => {
  const snap = await getDoc(doc(db, 'config', 'instructions'));
  return snap.exists() ? snap.data() : null;
};

/** Save instructions to Firestore */
export const saveInstructionsToFirestore = async (data) => {
  await setDoc(doc(db, 'config', 'instructions'), {
    ...data,
    updatedAt: Date.now(),
  }, { merge: true });
};

/** Reset a user's token usage */
export const resetUserTokens = async (uid) => {
  await setDoc(doc(db, 'users', uid), {
    tokenUsage: { promptTokens: 0, outputTokens: 0, totalTokens: 0, requestCount: 0 },
  }, { merge: true });
};

/** Set per-user token limit (0 = unlimited) */
export const setUserTokenLimit = async (uid, limit) => {
  await setDoc(doc(db, 'users', uid), { tokenLimit: limit }, { merge: true });
};

/** Load all user profiles for admin view */
export const loadAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  const users = [];
  snap.forEach(d => {
    const data = d.data();
    if (data.email) users.push({ id: d.id, ...data });
  });
  return users.sort((a, b) => (b.lastLoginAt || 0) - (a.lastLoginAt || 0));
};

/** Load all generations (sessions) across all users for admin view */
export const loadAllGenerations = async () => {
  const users = await loadAllUsers();
  const generations = [];
  for (const user of users) {
    const sessSnap = await getDocs(collection(db, 'users', user.id, 'sessions'));
    sessSnap.forEach(d => {
      const data = d.data();
      const msgs = data.messages || [];
      const firstUserMsg = msgs.find(m => m.role === 'user');
      if (!firstUserMsg) return; // skip empty sessions
      generations.push({
        id: d.id,
        uid: user.id,
        userName: user.displayName || user.email || '—',
        userPhoto: user.photoURL || null,
        title: data.title || 'Untitled',
        prompt: firstUserMsg.content || '',
        template: firstUserMsg.template || null,
        messageCount: msgs.filter(m => m.role === 'user').length,
        generatedFiles: data.generatedFiles || {},
        fileCount: Object.keys(data.generatedFiles || {}).length,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      });
    });
  }
  return generations.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
};
