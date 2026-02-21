import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// --- Sub-components for Floating Editor ---
const Accordion = ({ title, defaultOpen = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2e2e2e]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        {title}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-3 pt-0 space-y-3">{children}</div>}
    </div>
  );
};

export default Accordion;
