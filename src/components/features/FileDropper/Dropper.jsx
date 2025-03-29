import React from "react";
import FileIcon from "./Icons/FileIcon";

export function Dropper() {
const isDragging = false;
  
const dropzoneClasses = `
border-2 border-dashed rounded-lg p-16 
flex flex-col items-center justify-center 
cursor-pointer transition-colors
${isDragging ? 'border-teal-400 bg-opacity-10 bg-teal-400' : 'border-gray-600 bg-gray-800 bg-opacity-50'}
`;

  return(
      <div 
        className={dropzoneClasses}
        onDragOver={"handleDragOver"}
        onDragLeave={"handleDragLeave"}
        onDrop={"handleDrop"}
        onClick={"handleClick"}
        data-testid="file-dropzone"
      >
        <input 
          type="file" 
          //ref={"fileInputRef"} 
          className="hidden" 
          onChange={"handleFileInputChange"}
          accept={""}
          data-testid="file-input"
        />
        
        {/* Icon at the center of the drag and drip*/}
        <FileIcon className="w-16 h-16 mb-4 text-teal-400" />
        
        <p className="text-gray-300 text-lg">
          Drag and drop your file here or click to select
        </p>
      </div>
    );
  };
  