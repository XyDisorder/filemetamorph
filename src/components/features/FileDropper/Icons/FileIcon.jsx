import React from 'react';

const FileIcon = ({ className }) => {
  return (
    <div className={className}>
      <svg viewBox="0 0 64 64" className="w-full h-full">
        <path 
          d="M48 24L36 12H16C13.8 12 12 13.8 12 16v32c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V24z" 
          fill="#2d3748" 
          stroke="currentColor" 
          strokeWidth="2"
        />
        <path 
          d="M36 12v12h12" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
        />
        <path 
          d="M32 38l-8-8M32 38l8-8" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default FileIcon;