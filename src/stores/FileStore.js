// src/stores/fileStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FILE_TYPES, OUTPUT_FORMATS } from '../constants/FileTypes';


const getTabForFile = (file) => {
  // Déterminer l'onglet approprié en fonction du type de fichier
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
};

// Puis modifiez la fonction setSelectedFile dans votre store

// Fonction helper pour vérifier si un fichier correspond au type attendu
const isFileTypeValid = (file, tabType) => {
  if (!file || !tabType || !FILE_TYPES[tabType]) return false;
  
  // Vérifier par le type MIME
  const validMimeTypes = FILE_TYPES[tabType].mimeTypes;
  if (validMimeTypes.some(type => file.type.includes(type))) {
    return true;
  }
  
  // Vérifier par l'extension si le MIME type n'est pas concluant
  const fileName = file.name.toLowerCase();
  const extensions = FILE_TYPES[tabType].extensions.split(',');
  return extensions.some(ext => fileName.endsWith(ext.replace('.', '')));
};

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
      
      setSelectedFile: (file, activeTab = null) => {
        if (!file) {
          set({ selectedFile: null, errorMessage: null });
          return;
        }
        
        // Déterminer l'onglet approprié pour ce fichier
        const appropriateTab = getTabForFile(file);
        
        // Si aucun onglet approprié n'est trouvé, afficher une erreur
        if (!appropriateTab) {
          set({ 
            errorMessage: `Unsupported file type.`,
            selectedFile: null
          });
          return;
        }
        
        // Si nous sommes déjà dans le bon onglet ou si aucun onglet spécifique n'est requis
        const tabToUse = activeTab || get().activeTab;
        
        // Si le fichier est pris en charge mais pas dans l'onglet actuel, changer d'onglet
        if (appropriateTab !== tabToUse) {
          // Utiliser la fonction setActiveTab pour changer d'onglet
          get().setActiveTab(appropriateTab);
          // La fonction setActiveTab définit déjà outputFormat par défaut pour cet onglet
        }
        
        // Définir le fichier sélectionné
        set({ 
          selectedFile: file,
          errorMessage: null
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
      
      getOutputFormats: (tab = null) => {
        // Utiliser le tab passé en paramètre ou récupérer celui du state
        const tabToUse = tab || get().activeTab;
        return OUTPUT_FORMATS[tabToUse] || [];
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