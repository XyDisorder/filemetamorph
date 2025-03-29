// src/stores/fileStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OUTPUT_FORMATS } from '../constants/FileTypes';

// Store principal pour la gestion des fichiers
const useFileStore = create(
  persist(
    (set, get) => ({
      // État
      activeTab: 'text',
      selectedFile: null,
      convertedFile: null,
      outputFormat: 'pdf',
      isDragging: false,
      isConverting: false,
      conversionProgress: 0,
      errorMessage: null,
      conversionHistory: [],
      
      // Actions - Tab et format
      setActiveTab: (tab) => {
        const defaultFormat = OUTPUT_FORMATS[tab][0].value;
        set({ 
          activeTab: tab, 
          selectedFile: null, 
          outputFormat: defaultFormat,
          errorMessage: null 
        });
      },
      
      setOutputFormat: (format) => set({ 
        outputFormat: format,
        errorMessage: null
      }),
      
      // Actions - Gestion des fichiers
      setIsDragging: (isDragging) => set({ isDragging }),
      
      setSelectedFile: (file) => {
        const { activeTab } = get();
        
        if (!file) {
          set({ selectedFile: null, errorMessage: null });
          return;
        }
        
        if (!isFileTypeValid(file, activeTab)) {
          set({ 
            errorMessage: `Invalid file type. Please select a ${activeTab} file.`,
            selectedFile: null
          });
          return;
        }
        
        set({ 
          selectedFile: file,
          errorMessage: null,
          convertedFile: null
        });
      },
      
      clearSelectedFile: () => set({ 
        selectedFile: null,
        convertedFile: null,
        errorMessage: null
      }),
      
      // Actions - Conversion
      startConversion: async () => {
        const { selectedFile, outputFormat, activeTab } = get();
        
        if (!selectedFile) {
          set({ errorMessage: 'Please select a file first' });
          return;
        }
        
        set({ isConverting: true, conversionProgress: 0, errorMessage: null });
        
        try {
          // Simuler la progression de la conversion
          for (let i = 1; i <= 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            set({ conversionProgress: i * 10 });
          }
          
          // Dans une application réelle, vous appelleriez ici votre API de conversion
          // const response = await api.convertFile(selectedFile, outputFormat);
          // const convertedUrl = response.data.url;
          
          // Générer un objet "faux" pour représenter le fichier converti
          const originalName = selectedFile.name.split('.')[0];
          const convertedFile = {
            name: `${originalName}.${outputFormat}`,
            size: selectedFile.size, // En pratique, la taille pourrait changer
            type: `application/${outputFormat}`, // Simplification, en réalité dépend du format
            lastModified: new Date().getTime(),
            url: URL.createObjectURL(selectedFile) // En pratique, ce serait l'URL du fichier converti
          };
          
          // Ajouter à l'historique
          const historyEntry = {
            id: Date.now().toString(),
            originalName: selectedFile.name,
            convertedName: convertedFile.name,
            fileType: activeTab,
            fromFormat: selectedFile.name.split('.').pop(),
            toFormat: outputFormat,
            timestamp: new Date().toISOString(),
            size: convertedFile.size
          };
          
          set(state => ({ 
            convertedFile,
            isConverting: false,
            conversionProgress: 100,
            conversionHistory: [historyEntry, ...state.conversionHistory.slice(0, 9)] // Garder les 10 dernières conversions
          }));
          
        } catch (error) {
          console.error('Conversion error:', error);
          set({ 
            isConverting: false,
            errorMessage: 'Error during conversion. Please try again.',
            conversionProgress: 0
          });
        }
      },
      
      clearConvertedFile: () => set({ 
        convertedFile: null,
        conversionProgress: 0
      }),
      
      clearError: () => set({ errorMessage: null }),
      
      clearHistory: () => set({ conversionHistory: [] }),
      
      // Getters utiles
      getAcceptedFileTypes: () => {
        const { activeTab } = get();
        return FILE_TYPES[activeTab]?.extensions || '';
      },
      
      getOutputFormats: (activeTab) => {
        return OUTPUT_FORMATS[activeTab] || [];
      },
      
      // Drag and Drop handlers
      handleDragOver: (e) => {
        e.preventDefault();
        set({ isDragging: true });
      },
      
      handleDragLeave: () => {
        set({ isDragging: false });
      },
      
      handleDrop: (e) => {
        e.preventDefault();
        set({ isDragging: false });
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          get().setSelectedFile(e.dataTransfer.files[0]);
        }
      },
      
      handleFileInputChange: (e) => {
        if (e.target.files && e.target.files.length > 0) {
          get().setSelectedFile(e.target.files[0]);
        }
      }
    }),
    {
      name: 'file-metamorph-storage',
      partialize: (state) => ({
        conversionHistory: state.conversionHistory,
        activeTab: state.activeTab
      }),
    }
  )
);

export default useFileStore;