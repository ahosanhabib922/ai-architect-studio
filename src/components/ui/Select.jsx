import React from 'react';

const Select = ({ options, value, onChange }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded text-white text-xs px-2 py-1 outline-none focus:border-[#A78BFA] appearance-none"
  >
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);

export default Select;
