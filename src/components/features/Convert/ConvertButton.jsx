// src/components/ConvertButton.jsx
import React from 'react';

const ConvertButton = ({ 
  selectedFile, 
  isConverting, 
  onClick,
  className = "" 
}) => {
  // Classes conditionnelles pour le bouton
  const buttonClasses = `
    py-2 px-8 rounded-md font-medium transition-colors
    ${selectedFile 
      ? 'bg-teal-500 hover:bg-teal-600 text-white cursor-pointer' 
      : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-70'
    }
    ${isConverting ? 'opacity-70 pointer-events-none' : ''}
    ${className}
  `;

  return (
    <button
      onClick={onClick}
      disabled={!selectedFile || isConverting}
      className={buttonClasses}
      aria-busy={isConverting}
      data-testid="convert-button"
    >
      {isConverting ? 'Converting...' : 'Convert'}
    </button>
  );
};

export default ConvertButton;