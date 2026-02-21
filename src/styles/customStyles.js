// --- Custom Styles for Glassmorphism & Animations ---
export const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  body {
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #F8F8F7;
    color: #1e293b;
    margin: 0;
  }
  h1, h2, h3, h4, h5, h6 { font-family: 'DM Sans', sans-serif; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #52525b; }

  .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .dark-scrollbar::-webkit-scrollbar-thumb { background: #2e2e2e; }
  .dark-scrollbar::-webkit-scrollbar-thumb:hover { background: #4a4a4a; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .delay-100 { animation-delay: 100ms; }
  .delay-200 { animation-delay: 200ms; }

  .glass-card {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  }
  .glass-nav {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .blur-text-reveal {
    background: linear-gradient(90deg, #A78BFA 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mesh-bg {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    z-index: 0;
    overflow: hidden;
    background-color: #F8F8F7;
  }
  .mesh-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.45;
    animation: blobFloat 8s ease-in-out infinite alternate;
  }
  .animation-delay-2000 { animation-delay: -2s; }
  .animation-delay-4000 { animation-delay: -4s; }
  @keyframes blobFloat {
    0%   { transform: translate(0, 0) scale(1); }
    100% { transform: translate(30px, -20px) scale(1.05); }
  }
`;
