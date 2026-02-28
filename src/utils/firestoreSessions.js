import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const sessionsCol = (uid) => collection(db, 'users', uid, 'sessions');
const sessionDoc = (uid, chatId) => doc(db, 'users', uid, 'sessions', chatId);
const versionsCol = (uid, chatId) => collection(db, 'users', uid, 'sessions', chatId, 'versions');
const versionDoc = (uid, chatId, versionId) => doc(db, 'users', uid, 'sessions', chatId, 'versions', versionId);

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

/** Delete a session + all its version documents */
export const deleteSessionFromFirestore = async (uid, chatId) => {
  // Delete all version docs first (Firestore doesn't auto-delete subcollections)
  try {
    const vSnap = await getDocs(versionsCol(uid, chatId));
    const deletes = [];
    vSnap.forEach(d => deletes.push(deleteDoc(d.ref)));
    await Promise.all(deletes);
  } catch { /* ignore if no versions */ }
  await deleteDoc(sessionDoc(uid, chatId));
};

// ── Version Snapshots (per-file, stored as individual documents) ──

/** Save a batch of per-file version snapshots after a generation.
 *  @param {Object} fileVersions - { [fileName]: { code, label, timestamp } }
 */
export const saveVersionSnapshots = async (uid, chatId, fileVersions) => {
  const writes = Object.entries(fileVersions).map(([fileName, snap]) => {
    const id = `${fileName}_${snap.timestamp}`;
    return setDoc(versionDoc(uid, chatId, id), {
      fileName,
      code: snap.code,
      label: snap.label,
      timestamp: snap.timestamp,
    });
  });
  await Promise.all(writes);
};

/** Load all version snapshots for a session.
 *  Returns: { [fileName]: [{ code, label, timestamp }] } sorted by timestamp
 */
export const loadVersionSnapshots = async (uid, chatId) => {
  const snap = await getDocs(versionsCol(uid, chatId));
  const all = [];
  snap.forEach(d => all.push(d.data()));
  all.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  const result = {};
  all.forEach(v => {
    if (!result[v.fileName]) result[v.fileName] = [];
    result[v.fileName].push({ code: v.code, label: v.label, timestamp: v.timestamp });
  });
  // Keep only last 20 per file
  Object.keys(result).forEach(f => { result[f] = result[f].slice(-20); });
  return result;
};

/** Load version snapshots for admin — returns flat array with all metadata */
export const loadVersionSnapshotsAdmin = async (uid, chatId) => {
  const snap = await getDocs(versionsCol(uid, chatId));
  const versions = [];
  snap.forEach(d => versions.push({ id: d.id, ...d.data() }));
  return versions.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
};
