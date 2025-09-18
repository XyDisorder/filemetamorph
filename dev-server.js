// Serveur de développement local pour simuler les fonctions Netlify
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import mammoth from 'mammoth';
import rtfParser from 'rtf-parser';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurer FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Fonction pour extraire le texte d'un fichier
const extractTextFromFile = async (fileBuffer, fromFormat) => {
  switch (fromFormat) {
    case 'txt':
    case 'md':
      return fileBuffer.toString('utf8');
    
    case 'docx':
      const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
      return docxResult.value;
    
    case 'rtf':
      return new Promise((resolve, reject) => {
        rtfParser.string(fileBuffer.toString('utf8'), (err, doc) => {
          if (err) reject(err);
          else resolve(doc.content.map(p => p.content).join('\n'));
        });
      });
    
    case 'pdf':
      return 'PDF content extraction not implemented in this demo';
    
    default:
      return fileBuffer.toString('utf8');
  }
};

// Fonction pour convertir les fichiers texte
const convertTextFile = async (fileBuffer, fromFormat, toFormat) => {
  try {
    const text = await extractTextFromFile(fileBuffer, fromFormat);
    
    switch (toFormat) {
      case 'txt':
        return Buffer.from(text, 'utf8');
      
      case 'md':
        const markdown = `# Document\n\n${text.replace(/\n/g, '\n\n')}`;
        return Buffer.from(markdown, 'utf8');
      
      case 'pdf':
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        
        const lines = text.split('\n');
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;
        let y = height - 50;
        
        for (const line of lines) {
          if (y < 50) break;
          page.drawText(line, {
            x: 50,
            y: y,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }
        
        return Buffer.from(await pdfDoc.save());
      
      case 'docx':
        const doc = new Document({
          sections: [{
            properties: {},
            children: text.split('\n').map(line => 
              new Paragraph({
                children: [new TextRun(line)]
              })
            )
          }]
        });
        
        return Buffer.from(await Packer.toBuffer(doc));
      
      case 'rtf':
        const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}} \\f0\\fs24 ${text.replace(/\n/g, '\\par ')}}`;
        return Buffer.from(rtfContent, 'utf8');
      
      default:
        return Buffer.from(text, 'utf8');
    }
  } catch (error) {
    throw new Error(`Text conversion failed: ${error.message}`);
  }
};

// Fonction pour convertir les images
const convertImageFile = async (fileBuffer, fromFormat, toFormat) => {
  try {
    let image = sharp(fileBuffer);
    
    const options = {};
    
    switch (toFormat) {
      case 'jpg':
      case 'jpeg':
        options.quality = 90;
        options.mozjpeg = true;
        break;
      
      case 'png':
        options.compressionLevel = 9;
        options.adaptiveFiltering = true;
        break;
      
      case 'webp':
        options.quality = 80;
        options.lossless = false;
        break;
      
      case 'gif':
        options.colours = 256;
        break;
      
      case 'svg':
        throw new Error('SVG conversion not supported in this implementation');
    }
    
    const convertedBuffer = await image
      .toFormat(toFormat, options)
      .toBuffer();
    
    return convertedBuffer;
    
  } catch (error) {
    throw new Error(`Image conversion failed: ${error.message}`);
  }
};

// Fonction pour convertir les fichiers audio
const convertAudioFile = async (fileBuffer, fromFormat, toFormat) => {
  return new Promise((resolve, reject) => {
    const outputChunks = [];
    
    let command = ffmpeg()
      .input(fileBuffer)
      .toFormat(toFormat);
    
    switch (toFormat) {
      case 'mp3':
        command = command.audioBitrate('192k')
                        .audioChannels(2)
                        .audioFrequency(44100);
        break;
      
      case 'wav':
        command = command.audioCodec('pcm_s16le')
                        .audioChannels(2)
                        .audioFrequency(44100);
        break;
      
      case 'ogg':
        command = command.audioCodec('libvorbis')
                        .audioBitrate('128k');
        break;
      
      case 'flac':
        command = command.audioCodec('flac')
                        .audioChannels(2)
                        .audioFrequency(44100);
        break;
      
      case 'aac':
        command = command.audioCodec('aac')
                        .audioBitrate('128k')
                        .audioChannels(2);
        break;
    }
    
    command
      .on('error', (err) => {
        reject(new Error(`Audio conversion failed: ${err.message}`));
      })
      .on('end', () => {
        resolve(Buffer.concat(outputChunks));
      })
      .pipe()
      .on('data', (chunk) => {
        outputChunks.push(chunk);
      });
  });
};

// Fonction pour convertir les vidéos
const convertVideoFile = async (fileBuffer, fromFormat, toFormat) => {
  return new Promise((resolve, reject) => {
    const outputChunks = [];
    
    let command = ffmpeg()
      .input(fileBuffer)
      .toFormat(toFormat);
    
    switch (toFormat) {
      case 'mp4':
        command = command
          .videoCodec('libx264')
          .audioCodec('aac')
          .videoBitrate('1000k')
          .audioBitrate('128k')
          .size('1280x720')
          .fps(30);
        break;
      
      case 'mov':
        command = command
          .videoCodec('libx264')
          .audioCodec('aac')
          .videoBitrate('1000k')
          .audioBitrate('128k')
          .size('1280x720')
          .fps(30);
        break;
      
      case 'avi':
        command = command
          .videoCodec('libx264')
          .audioCodec('mp3')
          .videoBitrate('1000k')
          .audioBitrate('128k');
        break;
      
      case 'webm':
        command = command
          .videoCodec('libvpx')
          .audioCodec('libvorbis')
          .videoBitrate('800k')
          .audioBitrate('128k');
        break;
    }
    
    command
      .on('error', (err) => {
        reject(new Error(`Video conversion failed: ${err.message}`));
      })
      .on('end', () => {
        resolve(Buffer.concat(outputChunks));
      })
      .pipe()
      .on('data', (chunk) => {
        outputChunks.push(chunk);
      });
  });
};

// Fonction helper pour obtenir le MIME type
const getMimeType = (format) => {
  const mimeTypes = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'rtf': 'application/rtf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime'
  };
  
  return mimeTypes[format] || 'application/octet-stream';
};

// Route de conversion
app.post('/.netlify/functions/convert', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const toFormat = req.body.toFormat;
    const fileType = req.body.fileType;
    
    if (!file || !toFormat || !fileType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    const fileBuffer = file.buffer;
    const fromFormat = file.originalname.split('.').pop().toLowerCase();
    
    let convertedBuffer;
    
    switch (fileType) {
      case 'text':
        convertedBuffer = await convertTextFile(fileBuffer, fromFormat, toFormat);
        break;
      case 'image':
        convertedBuffer = await convertImageFile(fileBuffer, fromFormat, toFormat);
        break;
      case 'audio':
        convertedBuffer = await convertAudioFile(fileBuffer, fromFormat, toFormat);
        break;
      case 'video':
        convertedBuffer = await convertVideoFile(fileBuffer, fromFormat, toFormat);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }
    
    const fileName = file.originalname.split('.')[0] + '.' + toFormat;
    const mimeType = getMimeType(toFormat);
    
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': convertedBuffer.length.toString()
    });
    
    res.send(convertedBuffer);
    
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

// Route de test
app.get('/.netlify/functions/convert', (req, res) => {
  res.json({ message: 'Conversion service is running!' });
});

const PORT = 8888;
app.listen(PORT, () => {
  console.log(`🚀 Serveur de développement démarré sur http://localhost:${PORT}`);
  console.log(`📡 API de conversion disponible sur http://localhost:${PORT}/.netlify/functions/convert`);
  console.log(`🎯 Testez avec: curl http://localhost:${PORT}/.netlify/functions/convert`);
});
