// src/services/clientConverter.js
import { PDFDocument, rgb } from 'pdf-lib';
import lamejs from 'lamejs';

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
      console.log(`🔍 Converting: fileType=${fileType}, targetFormat=${targetFormat}, fileName=${file.name}`);
      
      switch (fileType) {
        case 'text':
          const fileBuffer = await file.arrayBuffer();
          const text = new TextDecoder('utf-8').decode(fileBuffer);
          return await this.convertText(text, targetFormat);
          
        case 'image':
          return await this.convertImage(file, targetFormat);
          
        case 'audio':
          return await this.convertAudio(file, targetFormat);
        case 'video':
          throw new Error(`Video conversion not yet implemented. File format preserved.`);
          
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error(`❌ Conversion error:`, error);
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

  // Conversion audio
  async convertAudio(file, targetFormat) {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          switch (targetFormat) {
            case 'wav':
              resolve(this.audioBufferToWav(audioBuffer));
              break;
            case 'mp3':
              resolve(await this.audioBufferToMp3(audioBuffer));
              break;
            case 'ogg':
              resolve(await this.audioBufferToOgg(audioBuffer));
              break;
            default:
              reject(new Error(`Unsupported audio format: ${targetFormat}`));
          }
        } catch (error) {
          reject(new Error(`Audio conversion failed: ${error.message}`));
        }
      };
      
      fileReader.onerror = () => reject(new Error('Failed to read audio file'));
      fileReader.readAsArrayBuffer(file);
    });
  }

  // Convertir AudioBuffer en WAV
  audioBufferToWav(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  // Convertir AudioBuffer en MP3
  async audioBufferToMp3(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;
    
    // Convertir en format PCM 16-bit
    const pcmData = new Int16Array(length * numberOfChannels);
    let offset = 0;
    
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        pcmData[offset] = Math.max(-32768, Math.min(32767, sample * 32768));
        offset++;
      }
    }
    
    // Encoder en MP3 avec lamejs
    const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, 128);
    const mp3Data = [];
    
    const blockSize = 1152;
    for (let i = 0; i < pcmData.length; i += blockSize * numberOfChannels) {
      const left = pcmData.subarray(i, i + blockSize);
      const right = numberOfChannels > 1 ? pcmData.subarray(i + blockSize, i + blockSize * 2) : left;
      const mp3buf = mp3encoder.encodeBuffer(left, right);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data, { type: 'audio/mp3' });
  }

  // Convertir AudioBuffer en OGG (simplifié - retourne WAV pour l'instant)
  async audioBufferToOgg(audioBuffer) {
    // Pour l'instant, on retourne du WAV car l'encodage OGG est complexe
    // Dans une version future, on pourrait utiliser ogg.js
    return this.audioBufferToWav(audioBuffer);
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
