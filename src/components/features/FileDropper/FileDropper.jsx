// src/components/FileDropper.jsx
import React from 'react';
import FileIcon from './Icons/FileIcon';

const FileDropper = ({ 
  isDragging, 
  selectedFile, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onClick,
  inputRef,
  onFileInputChange, // Utilisez ce handler
}) => {
  
  // Classes pour le style
  const dropzoneClasses = `
    w-full border-2 border-dashed rounded-lg
    p-16 flex flex-col items-center justify-center 
    cursor-pointer transition-colors
    ${isDragging ? 'border-[#41D0A8] bg-opacity-10 bg-[#41D0A8]' : 'border-gray-600 bg-[#1A202C] bg-opacity-50'}
  `;

  return (
    <div 
      className={dropzoneClasses}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <input 
        type="file" 
        ref={inputRef} 
        className="hidden" 
        onChange={onFileInputChange} // Utilisez le handler ici
      />
      
      {selectedFile ? (
        <>
    <div className="text-center">
      <FileIcon className="w-16 h-16 mb-4 text-[#41D0A8] mx-auto" />
      <p className="text-[#41D0A8] font-medium text-lg mb-1">
        {selectedFile.name} {/* Vérifiez cette ligne */}
      </p>
      <p className="text-gray-400 text-sm">
        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
      </p>
    </div>
  </>
) : (
  // Affichage lorsqu'aucun fichier n'est sélectionn
        // Afficher l'interface de dépôt
        <>
          <FileIcon className="w-16 h-16 mb-4 text-[#41D0A8]" />
          <p className="text-gray-300 text-lg">
            Drag and drop your file here or click to select
          </p>
        </>
      )}
    </div>
  );
};

export default FileDropper;