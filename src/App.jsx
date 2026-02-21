import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StudioWorkspace from './components/StudioWorkspace';
import AdminPortal from './components/admin/AdminPortal';
import { customStyles } from './styles/customStyles';
import { generateChatId } from './config/constants';
import { useAuth } from './contexts/AuthContext';

const ADMIN_HOST = 'dashboard.expritor.com';
const isAdminDomain = window.location.hostname === ADMIN_HOST;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin, loginWithGoogle } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    </div>
  );
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-14 h-14 bg-[#A78BFA]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-[#A78BFA]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Admin Portal</h2>
        <p className="text-sm text-slate-500 mb-5">Sign in to access the dashboard</p>
        <button
          onClick={() => loginWithGoogle()}
          className="px-6 py-2.5 bg-[#A78BFA] hover:bg-[#9061F9] text-white text-sm font-medium rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Access Denied</h2>
        <p className="text-sm text-slate-500 mb-4">You don't have admin access.</p>
        <a href="https://expritor.com" className="text-sm text-[#A78BFA] hover:underline">Go to Expritor</a>
      </div>
    </div>
  );
  return children;
}

export default function App() {
  return (
    <>
      <style>{customStyles}</style>
      <Routes>
        {isAdminDomain ? (
          <>
            <Route path="/" element={
              <AdminRoute>
                <AdminPortal />
              </AdminRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/studio" element={
              <ProtectedRoute>
                <Navigate to={`/studio/${generateChatId()}`} replace />
              </ProtectedRoute>
            } />
            <Route path="/studio/:chatId" element={
              <ProtectedRoute>
                <StudioWorkspace />
              </ProtectedRoute>
            } />
          </>
        )}
      </Routes>
    </>
  );
}
