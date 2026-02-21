import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Layout, Code, Wand2,
  Send, Box, Edit2, LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// ==========================================
// COMPONENT: Landing Page
// ==========================================
const LandingPage = () => {
  const { user, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/studio');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
  <div className="relative overflow-x-hidden min-h-screen">
    <div className="mesh-bg">
      <div className="mesh-blob bg-[#A78BFA] w-[600px] h-[600px] top-[-100px] left-[-100px]"></div>
      <div className="mesh-blob bg-blue-300 w-[500px] h-[500px] top-[40%] right-[-100px] animation-delay-2000"></div>
      <div className="mesh-blob bg-pink-200 w-[400px] h-[400px] bottom-[-100px] left-[20%] animation-delay-4000"></div>
    </div>
    <nav className="fixed w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
            <Box className="w-6 h-6 text-[#A78BFA]" /> AI Architect<span className="text-[#A78BFA]">.</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Features</a>
          <a href="#templates" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Design DNA</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/studio" className="px-5 py-2.5 text-sm font-medium text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-full shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                Open Studio <Sparkles className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2">
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                <button onClick={logout} className="p-2 text-slate-500 hover:text-slate-700 transition-colors" title="Sign Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button onClick={handleGoogleLogin} className="px-5 py-2.5 text-sm font-medium text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-full shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
              Sign in with Google <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
    <section className="pt-40 md:pt-48 pb-20 md:pb-32 px-6 relative z-10 flex flex-col items-center">
      <div className="text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-white/40 shadow-sm backdrop-blur-md mb-8 animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A78BFA] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A78BFA]"></span>
          </span>
          <span className="uppercase font-semibold text-slate-600 text-xs tracking-wide">Gemini Multi-File Powered</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold text-slate-900 tracking-tight mb-6 animate-fade-in delay-100 leading-[1.1]">
          Architect Prototypes <br className="hidden md:block" /> at the <span className="blur-text-reveal">Speed of Thought</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-fade-in delay-200">
          Transform vague ideas into complete, multi-page HTML prototypes. Structured roadmaps, technical specs, and design systems generated in seconds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in delay-300">
          {user ? (
            <Link to="/studio" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-full shadow-lg transition-all transform hover:scale-[1.02]">
              Start Generating
            </Link>
          ) : (
            <button onClick={handleGoogleLogin} className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-full shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </section>

    {/* Bento Grid Features */}
    <section className="py-24 px-6 relative z-10" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="block text-[#A78BFA] font-semibold tracking-wider text-sm uppercase mb-3">
            Comprehensive Toolkit
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Everything you need to build faster
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(180px,auto)] gap-6">
          {/* Big Card 1 */}
          <div className="md:col-span-2 glass-card rounded-3xl p-8 md:p-10 group hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] mb-6">
              <Layout className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Atomic Design Generation</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              Our AI generates complete projects organized by Atomic Design principles (atoms → molecules → organisms → pages), ensuring consistent UI across your entire application.
            </p>
            <div className="flex gap-3 mt-4">
              <div className="flex-1 bg-white/50 border border-white/60 p-4 rounded-xl">
                <div className="text-xs font-semibold text-slate-500 mb-2">Atoms</div>
                <div className="h-2 bg-slate-200 rounded-full w-3/4 mb-2"></div>
                <div className="h-2 bg-slate-200 rounded-full w-1/2"></div>
              </div>
              <div className="flex-1 bg-white/50 border border-white/60 p-4 rounded-xl">
                <div className="text-xs font-semibold text-slate-500 mb-2">Molecules</div>
                <div className="h-8 bg-slate-200 rounded-md w-full mb-2"></div>
              </div>
            </div>
          </div>

          {/* Tall Card */}
          <div className="md:row-span-2 glass-card rounded-3xl p-8 group hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 mb-6">
                <Edit2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Live Visual Editing</h3>
              <p className="text-slate-600 mb-6">
                Click any element in the generated preview to select and edit it. Use natural language to tweak styles, spacing, or content.
              </p>
              <div className="bg-white/60 rounded-2xl p-4 border border-white/50 backdrop-blur-sm mt-4">
                <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
                  <span>Selected: &lt;button&gt;</span>
                  <span className="w-2 h-2 rounded-full bg-green-400"></span>
                </div>
                <div className="p-2 border-2 border-[#A78BFA] rounded-md text-center bg-[#A78BFA] text-white font-medium text-sm">
                  Submit Form
                </div>
                <div className="mt-4 flex gap-2">
                  <input type="text" value="Make corners rounded" readOnly className="text-xs w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none" />
                  <button className="bg-slate-900 text-white p-1 rounded"><Send className="w-3 h-3"/></button>
                </div>
              </div>
            </div>
          </div>

          {/* Small Card 1 */}
          <div className="glass-card rounded-3xl p-8 group hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Clean Export</h3>
            <p className="text-sm text-slate-600">
              Download individual HTML/Tailwind files, React components, or full ZIP archives ready for production.
            </p>
          </div>

          {/* Small Card 2 */}
          <div className="glass-card rounded-3xl p-8 group hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 mb-4">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Design DNA Templates</h3>
            <p className="text-sm text-slate-600">
              Start with pre-built visual systems or upload custom HTML/CSS as your own DNA.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default LandingPage;
