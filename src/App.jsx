import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import StudioWorkspace from './components/StudioWorkspace';
import AdminTemplates from './components/AdminTemplates';
import { customStyles } from './styles/customStyles';
import { generateChatId } from './config/constants';
import { useAuth } from './contexts/AuthContext';

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

export default function App() {
  return (
    <>
      <style>{customStyles}</style>
      <Routes>
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
        <Route path="/admin/templates" element={
          <ProtectedRoute>
            <AdminTemplates />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}
