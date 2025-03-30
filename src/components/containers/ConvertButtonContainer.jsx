// src/containers/ConvertButtonContainer.jsx
import React, { useCallback } from 'react';
import useFileStore from '../../stores/FileStore';
import ConvertButton from '../features/Convert/ConvertButton';

export function ConvertButtonContainer() {
  // États et actions du FileStore
  const selectedFile = useFileStore(state => state.selectedFile);
  const isConverting = useFileStore(state => state.isConverting);
  const startConversion = useFileStore(state => state.startConversion);
  
  // Handler pour le clic sur le bouton
  const handleClick = useCallback(() => {
    if (selectedFile && !isConverting) {
      startConversion();
    }
  }, [selectedFile, isConverting, startConversion]);
  
// Modifiez ConvertButtonContainer.jsx
return (
  <ConvertButton 
    selectedFile={selectedFile}
    isConverting={isConverting}
    onClick={handleClick}
    className="flex items-center" // Ajoutez cette classe
  />
);
}

export default ConvertButtonContainer;