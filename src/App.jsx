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
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading...</span>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
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
