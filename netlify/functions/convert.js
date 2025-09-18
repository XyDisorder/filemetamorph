const { Hono } = require('hono');
const { cors } = require('hono/cors');
const sharp = require('sharp');
const { PDFDocument, rgb } = require('pdf-lib');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const mammoth = require('mammoth');
const rtfParser = require('rtf-parser');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

// Configurer le chemin FFmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const app = new Hono();

app.use('*', cors());

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
      // Pour PDF, on utilise une approche simplifiée
      // Dans un environnement de production, utilisez pdf-parse
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
        // Conversion vers Markdown avec formatage basique
        const markdown = `# Document\n\n${text.replace(/\n/g, '\n\n')}`;
        return Buffer.from(markdown, 'utf8');
      
      case 'pdf':
        // Créer un PDF avec pdf-lib
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);
        const { width, height } = page.getSize();
        
        // Diviser le texte en lignes et les afficher
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
        
        return Buffer.from(await pdfDoc.save());
      
      case 'docx':
        // Créer un document DOCX
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
        // Créer un fichier RTF basique
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
    
    // Obtenir les métadonnées de l'image
    const metadata = await image.metadata();
    
    // Options de conversion selon le format de sortie
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
        // Pour GIF, on limite la palette de couleurs
        options.colours = 256;
        break;
      
      case 'svg':
        // SVG nécessite une approche différente
        // Pour l'instant, on retourne une erreur
        throw new Error('SVG conversion not supported in this implementation');
    }
    
    // Appliquer les options et convertir
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
    
    // Options de conversion selon le format de sortie
    let command = ffmpeg()
      .input(fileBuffer)
      .toFormat(toFormat);
    
    // Configurer les options selon le format
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
    
    // Options de conversion selon le format de sortie
    let command = ffmpeg()
      .input(fileBuffer)
      .toFormat(toFormat);
    
    // Configurer les options selon le format
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

app.post('/api/convert', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const toFormat = formData.get('toFormat');
    const fileType = formData.get('fileType');
    
    if (!file || !toFormat || !fileType) {
      return c.json({ error: 'Missing required parameters' }, 400);
    }
    
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fromFormat = file.name.split('.').pop().toLowerCase();
    
    let convertedBuffer;
    
    // Router vers la fonction de conversion appropriée
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
        return c.json({ error: 'Unsupported file type' }, 400);
    }
    
    // Retourner le fichier converti
    const fileName = file.name.split('.')[0] + '.' + toFormat;
    const mimeType = getMimeType(toFormat);
    
    return new Response(convertedBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': convertedBuffer.length.toString()
      }
    });
    
  } catch (error) {
    console.error('Conversion error:', error);
    return c.json({ error: 'Conversion failed' }, 500);
  }
});

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

export default app;
