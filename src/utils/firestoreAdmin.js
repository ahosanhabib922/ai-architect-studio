import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
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

/** Load settings (token limit etc.) from config/settings */
export const loadSettingsFromFirestore = async () => {
  const snap = await getDoc(doc(db, 'config', 'settings'));
  return snap.exists() ? snap.data() : {};
};

/** Save settings to Firestore */
export const saveSettingsToFirestore = async (data) => {
  await setDoc(doc(db, 'config', 'settings'), { ...data, updatedAt: Date.now() }, { merge: true });
};

/** Reset a user's token usage */
export const resetUserTokens = async (uid) => {
  await setDoc(doc(db, 'users', uid), {
    tokenUsage: { promptTokens: 0, outputTokens: 0, totalTokens: 0, requestCount: 0 },
  }, { merge: true });
};

/** Load all user profiles for admin view */
export const loadAllUsers = async () => {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('lastLoginAt', 'desc')));
  const users = [];
  snap.forEach(d => {
    const data = d.data();
    if (data.email) users.push({ id: d.id, ...data });
  });
  return users;
};
