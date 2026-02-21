import React from 'react';

const Input = ({ placeholder, value, onChange, type = "text", className="" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded text-white text-xs px-2 py-1 outline-none focus:border-[#A78BFA] transition-colors ${className}`}
  />
);

export default Input;
