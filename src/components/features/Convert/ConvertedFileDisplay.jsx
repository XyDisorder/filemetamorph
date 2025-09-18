// src/components/features/Convert/ConvertedFileDisplay.jsx
import React from 'react';
import useFileStore from '../../../stores/FileStore';

const ConvertedFileDisplay = () => {
  const convertedFile = useFileStore(state => state.convertedFile);
  const conversionProgress = useFileStore(state => state.conversionProgress);
  const isConverting = useFileStore(state => state.isConverting);
  const downloadConvertedFile = useFileStore(state => state.downloadConvertedFile);
  const clearConvertedFile = useFileStore(state => state.clearConvertedFile);

  if (isConverting) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
        </div>
        <div className="text-center">
          <p className="text-white mb-2">Converting your file...</p>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-teal-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${conversionProgress}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">{conversionProgress}%</p>
        </div>
      </div>
    );
  }

  if (!convertedFile) {
    return null;
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">File Converted Successfully!</h3>
        <button
          onClick={clearConvertedFile}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {convertedFile.name}
            </p>
            <p className="text-sm text-gray-400">
              {formatFileSize(convertedFile.size)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={downloadConvertedFile}
          className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download</span>
        </button>
        
        <button
          onClick={clearConvertedFile}
          className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-md transition-colors"
        >
          Convert Another
        </button>
      </div>
    </div>
  );
};

export default ConvertedFileDisplay;
