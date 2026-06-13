import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'default', 
  icon: Icon, 
  onClick, 
  className = '', 
  disabled = false, 
  type = 'button' 
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== 'default' ? `btn-${size}` : '';
  const buttonClass = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button 
      type={type} 
      className={buttonClass} 
      onClick={onClick} 
      disabled={disabled}
    >
      {Icon && <Icon className="w-4 h-4 mr-1.5 flex-shrink-0" />}
      {children}
    </button>
  );
}
