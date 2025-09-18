// src/services/clientConverter.js
import { PDFDocument, rgb } from 'pdf-lib';

class ClientConverter {
  constructor() {
    this.supportedFormats = {
      text: ['txt', 'md', 'pdf', 'rtf'],
      image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      audio: ['mp3', 'wav', 'ogg', 'flac', 'aac'],
      video: ['mp4', 'mov', 'avi', 'webm']
    };
  }

  // Conversion de texte vers PDF
  async textToPdf(text, filename = 'document') {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { height } = page.getSize();
      
      // Diviser le texte en lignes
      const lines = text.split('\n');
      const fontSize = 12;
      const lineHeight = fontSize * 1.2;
      let y = height - 50;
      
      for (const line of lines) {
        if (y < 50) break; // Éviter le débordement
        page.drawText(line, {
          x: 50,
          y: y,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
      }
      
      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  }

  // Conversion de texte vers Markdown
  textToMarkdown(text) {
    const markdown = `# Document\n\n${text.replace(/\n/g, '\n\n')}`;
    return new Blob([markdown], { type: 'text/markdown' });
  }

  // Conversion de Markdown vers texte
  markdownToText(markdown) {
    const text = markdown
      .replace(/^#+\s+/gm, '') // Supprimer les en-têtes
      .replace(/\*\*(.*?)\*\*/g, '$1') // Supprimer le gras
      .replace(/\*(.*?)\*/g, '$1') // Supprimer l'italique
      .replace(/`(.*?)`/g, '$1') // Supprimer le code inline
      .replace(/```[\s\S]*?```/g, '') // Supprimer les blocs de code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Supprimer les liens
      .trim();
    
    return new Blob([text], { type: 'text/plain' });
  }

  // Conversion de texte vers RTF
  textToRtf(text) {
    const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;
    return new Blob([rtfContent], { type: 'application/rtf' });
  }

  // Conversion d'images (basique avec Canvas)
  async convertImage(file, targetFormat) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Image conversion failed'));
          }
        }, `image/${targetFormat}`, 0.9);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Conversion principale
  async convert(file, targetFormat, fileType) {
    try {
      switch (fileType) {
        case 'text':
          const fileBuffer = await file.arrayBuffer();
          const text = new TextDecoder('utf-8').decode(fileBuffer);
          return await this.convertText(text, targetFormat);
          
        case 'image':
          return await this.convertImage(file, targetFormat);
          
        case 'audio':
        case 'video':
          throw new Error(`Audio/Video conversion not yet implemented. File format preserved.`);
          
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  // Conversion de texte
  async convertText(text, targetFormat) {
    switch (targetFormat) {
      case 'pdf':
        return await this.textToPdf(text);
      case 'md':
        return this.textToMarkdown(text);
      case 'rtf':
        return this.textToRtf(text);
      case 'txt':
        return new Blob([text], { type: 'text/plain' });
      default:
        throw new Error(`Unsupported text format: ${targetFormat}`);
    }
  }

  // Télécharger le fichier converti
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Vérifier si un format est supporté
  isFormatSupported(fileType, format) {
    return this.supportedFormats[fileType]?.includes(format) || false;
  }
}

export default new ClientConverter();
