import React from 'react';

const OutputFormatSelector = ({outputFormat, handleFormatChange, availableFormats }) => {
  return (
    <div className="flex items-center">
      
      <div
       className="relative w-28">
        <select
          id="output-format"
          value={outputFormat}
          onChange={handleFormatChange}
          className="w-full appearance-none bg-gray-700/60 text-white text-sm rounded-md border border-gray-600 py-1.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400"
        >
          {availableFormats.map(format => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
        {/* Flèche customisée pour le select */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default OutputFormatSelector;