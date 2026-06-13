import React from 'react';

export default function Select({ label, value, onChange, options = [], placeholder, className = '' }) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label className="form-label">{label}</label>}
      <select className="form-select" value={value} onChange={onChange}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.key || opt.value || opt} value={opt.key || opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}
