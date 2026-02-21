import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const sessionsCol = (uid) => collection(db, 'users', uid, 'sessions');
const sessionDoc = (uid, chatId) => doc(db, 'users', uid, 'sessions', chatId);

/** Load all sessions for a user. Returns { [chatId]: sessionData } */
export const loadSessionsFromFirestore = async (uid) => {
  const snap = await getDocs(query(sessionsCol(uid), orderBy('createdAt', 'desc')));
  const sessions = {};
  snap.forEach(d => { sessions[d.id] = { id: d.id, ...d.data() }; });
  return sessions;
};

/** Load a single session */
export const loadSessionFromFirestore = async (uid, chatId) => {
  const snap = await getDoc(sessionDoc(uid, chatId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/** Save (create or overwrite) a session */
export const saveSessionToFirestore = async (uid, chatId, data) => {
  await setDoc(sessionDoc(uid, chatId), {
    ...data,
    updatedAt: Date.now()
  }, { merge: true });
};

/** Delete a session */
export const deleteSessionFromFirestore = async (uid, chatId) => {
  await deleteDoc(sessionDoc(uid, chatId));
};
