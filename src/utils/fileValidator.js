import { FILE_TYPES } from "../constants/FileTypes";

export const isFileTypeValid = (file, tabType) => {
  if (!file || !tabType || !FILE_TYPES[tabType]) return false;
  
  // Verification per type MIME
  const validMimeTypes = FILE_TYPES[tabType].mimeTypes;
  if (validMimeTypes.some(type => file.type.includes(type))) {
    return true;
  }
  
  // Verification per extension if MIME type is not valid
  const fileName = file.name.toLowerCase();
  const extensions = FILE_TYPES[tabType].extensions.split(',');
  return extensions.some(ext => fileName.endsWith(ext.replace('.', '')));
};