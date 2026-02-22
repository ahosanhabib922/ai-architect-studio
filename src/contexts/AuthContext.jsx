import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext(null);
const ADMIN_EMAIL = 'ahosanhabib922@gmail.com';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userRef);
          const profile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            lastLoginAt: Date.now(),
          };
          if (!snap.exists()) {
            profile.createdAt = Date.now();
            // Auto-assign default plan for new users
            try {
              const plansSnap = await getDoc(doc(db, 'config', 'plans'));
              if (plansSnap.exists()) {
                const defaultPlan = (plansSnap.data().plans || []).find(p => p.isDefault);
                if (defaultPlan) {
                  profile.planId = defaultPlan.id;
                  profile.tokenLimit = defaultPlan.tokenLimit;
                }
              }
            } catch {}
          }
          await setDoc(userRef, profile, { merge: true });
        } catch (e) { console.error('Profile save failed:', e); }
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
