import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function Card({ 
  children, 
  className = '', 
  header, 
  footer, 
  interactive = false, 
  onClick, 
  style 
}: CardProps) {
  const cardClass = `card ${interactive ? 'card-interactive cursor-pointer hover:bg-zinc-900/50' : ''} ${className}`.trim();

  return (
    <div className={cardClass} onClick={onClick} style={style}>
      {header && <div className="card-header border-b border-zinc-800 p-4 font-semibold text-zinc-200">{header}</div>}
      <div className="card-body p-4">{children}</div>
      {footer && <div className="card-footer border-t border-zinc-800 p-4 text-xs text-zinc-500">{footer}</div>}
    </div>
  );
}
