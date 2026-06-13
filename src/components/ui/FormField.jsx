import React from 'react';

export default function FormField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  options = [], 
  rows = 3,
  className = '' 
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label className="form-label">{label}</label>}
      {type === 'textarea' ? (
        <textarea
          className="form-textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
        />
      ) : type === 'select' ? (
        <select className="form-select" value={value} onChange={onChange}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.key || opt.value || opt} value={opt.key || opt.value || opt}>
              {opt.label || opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="form-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
