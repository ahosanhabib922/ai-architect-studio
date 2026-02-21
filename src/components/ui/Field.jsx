import React from 'react';

const Field = ({ label, children }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-zinc-500 w-1/3">{label}</span>
    <div className="w-2/3">{children}</div>
  </div>
);

export default Field;
