import React from 'react';

export default function Card({ children, className = '', header, footer, interactive = false, onClick, style }) {
  const cardClass = `card ${interactive ? 'card-interactive' : ''} ${className}`.trim();

  return (
    <div className={cardClass} onClick={onClick} style={style}>
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
