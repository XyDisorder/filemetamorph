// src/components/Logo.jsx
import React from 'react';

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    className="w-16 h-16"  // Ajustez la taille via Tailwind CSS (ici 64x64 px)
  >
    {/* Fond circulaire */}
    <circle cx="32" cy="32" r="32" fill="#1abc9c" />
    {/* Icône de fichier */}
    <path
      d="M18 14h20l12 12v18c0 2.209-1.791 4-4 4H14c-2.209 0-4-1.791-4-4V14c0-2.209 1.791-4 4-4h4"
      fill="#ffffff"
    />
    {/* Coin replié */}
    <polygon points="38,14 38,26 50,26" fill="#1abc9c" />
    {/* Flèche symbolique (chevron) indiquant la transformation */}
    <path
      d="M26 34l6 6 6-6"
      fill="none"
      stroke="#1abc9c"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Logo;
