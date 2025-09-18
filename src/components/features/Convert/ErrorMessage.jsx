// src/components/features/Convert/ErrorMessage.jsx
import React from 'react';
import useFileStore from '../../../stores/FileStore';

const ErrorMessage = () => {
  const errorMessage = useFileStore(state => state.errorMessage);
  const clearError = useFileStore(state => state.clearError);

  if (!errorMessage) {
    return null;
  }

  return (
    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-400">Error</h3>
          <p className="text-sm text-red-300 mt-1">{errorMessage}</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-300 transition-colors"
            aria-label="Close error"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
