import React, { useRef, useCallback } from 'react';
import useFileStore from '../../stores/FileStore';
import useTabStore from '../../stores/TabStore';
import FileDropper from '../features/FileDropper/FileDropper';
import { FILE_TYPES } from '../../constants/FileTypes'; // Importez vos constantes de types de fichiers

export function FileDropperContainer() {
  const fileInputRef = useRef(null);
  
  // States of the FileStore
  const selectedFile = useFileStore(state => state.selectedFile);
  const setSelectedFile = useFileStore(state => state.setSelectedFile);
  const isDragging = useFileStore(state => state.isDragging);
  const setIsDragging = useFileStore(state => state.setIsDragging);
  
  // States of the TabStore
  const activeTab = useTabStore(state => state.activeTab);
  const setActiveTab = useTabStore(state => state.setActiveTab);
  
  // Determine what's the good tab for the file we want to convert
  const getTabForFile = useCallback((file) => {
    const fileName = file.name.toLowerCase();
    const mimeType = file.type;
    
    // Vérifier d'abord par MIME type
    for (const [tabType, typeInfo] of Object.entries(FILE_TYPES)) {
      if (typeInfo.mimeTypes.some(type => mimeType.includes(type))) {
        return tabType;
      }
    }
    
    // Si aucun MIME type ne correspond, vérifier par extension
    for (const [tabType, typeInfo] of Object.entries(FILE_TYPES)) {
      const extensions = typeInfo.extensions.split(',');
      if (extensions.some(ext => fileName.endsWith(ext.replace('.', '')))) {
        return tabType;
      }
    }
    
    // Si aucune correspondance n'est trouvée, retourner null
    return null;
  }, []);
  
  // Manage selection of files
  const handleFileSelection = useCallback((file) => {
    // good tabs
    const appropriateTab = getTabForFile(file);
    
    // If no tab => TODO error management 
    if (!appropriateTab) {
      console.error("Unsupported file type");
      return;
    }
    
    // If file is valid but need to change tab
    if (appropriateTab !== activeTab) {
      // 1. Change tab
      setActiveTab(appropriateTab);
      
      // set file
      setTimeout(() => {
        setSelectedFile(file, appropriateTab);
      }, 50);
    } else {
      // if already good tab juste select file management to display it
      setSelectedFile(file, activeTab);
    }
  }, [activeTab, setActiveTab, setSelectedFile, getTabForFile]);
  
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, [setIsDragging]);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, [setIsDragging]);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, [setIsDragging, handleFileSelection]);
  
  const handleFileInputChange = useCallback((e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  }, [handleFileSelection]);
  
  // Handler for the click into the zone
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  return (
    <FileDropper 
      isDragging={isDragging}
      selectedFile={selectedFile}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      inputRef={fileInputRef}
      onFileInputChange={handleFileInputChange}
    />
  );
}

export default FileDropperContainer;