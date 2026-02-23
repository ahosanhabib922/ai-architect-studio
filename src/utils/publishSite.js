import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate a short random slug
const generateSlug = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return slug;
};

/**
 * Publish generated files — stores HTML directly in Firestore (no Storage needed)
 * @param {string} uid - User ID
 * @param {string} sessionId - Chat session ID
 * @param {Object} files - { "index.html": "<html>...", "about.html": "<html>..." }
 * @param {string} title - Project title
 * @returns {{ slug: string, url: string }}
 */
export const publishSite = async (uid, sessionId, files, title) => {
  // Check if this session is already published
  const existingDoc = await getDoc(doc(db, 'published', sessionId));
  let slug;
  if (existingDoc.exists()) {
    slug = existingDoc.data().slug;
  } else {
    slug = generateSlug();
    // Ensure slug uniqueness
    const slugCheck = await getDocs(query(collection(db, 'published'), where('slug', '==', slug)));
    if (!slugCheck.empty) slug = generateSlug() + Math.floor(Math.random() * 100);
  }

  const fileNames = Object.keys(files);

  // Save everything to Firestore (HTML content included)
  await setDoc(doc(db, 'published', sessionId), {
    slug,
    uid,
    sessionId,
    title: title || 'Untitled',
    files: fileNames,
    fileContents: files,
    mainFile: fileNames.find(f => f.includes('index')) || fileNames[0],
    publishedAt: existingDoc.exists() ? existingDoc.data().publishedAt : Date.now(),
    updatedAt: Date.now(),
  });

  const url = `${window.location.origin}/view/${slug}`;
  return { slug, url };
};

/**
 * Unpublish: delete Firestore doc
 */
export const unpublishSite = async (sessionId) => {
  await deleteDoc(doc(db, 'published', sessionId));
};

/**
 * Get publish info for a session
 */
export const getPublishInfo = async (sessionId) => {
  const docSnap = await getDoc(doc(db, 'published', sessionId));
  if (!docSnap.exists()) return null;
  return docSnap.data();
};

/**
 * Load published site by slug (for viewer)
 */
export const loadPublishedSite = async (slug) => {
  const q = query(collection(db, 'published'), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data();
};
