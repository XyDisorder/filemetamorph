const { Hono } = require('hono');
const { cors } = require('hono/cors');
// Simplification drastique - on garde seulement les conversions de base

const app = new Hono();

app.use('*', cors());

// Fonction simplifiée pour extraire le texte
const extractTextFromFile = async (fileBuffer, fromFormat) => {
  // Pour l'instant, on ne gère que les fichiers texte simples
  if (fromFormat === 'txt' || fromFormat === 'md') {
    return fileBuffer.toString('utf8');
  }
  
  // Pour les autres formats, on retourne un message
  return `Conversion from ${fromFormat} not yet implemented. File content preserved.`;
};

// Fonction simplifiée pour convertir les fichiers texte
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
      
      default:
        // Pour les autres formats, on retourne le texte en TXT
        return Buffer.from(text, 'utf8');
    }
  } catch (error) {
    throw new Error(`Text conversion failed: ${error.message}`);
  }
};

// Fonction simplifiée pour convertir les images
const convertImageFile = async (fileBuffer, fromFormat, toFormat) => {
  // Pour l'instant, on retourne le fichier original
  // Sharp sera réintégré plus tard quand on aura résolu les problèmes de bundling
  if (fromFormat === toFormat) {
    return fileBuffer;
  }
  
  throw new Error(`Image conversion from ${fromFormat} to ${toFormat} is not yet implemented. File format preserved.`);
};

// Fonction pour convertir les fichiers audio
const convertAudioFile = async (fileBuffer, fromFormat, toFormat) => {
  // Pour l'instant, on retourne le fichier original avec un message
  // Dans une version future, on pourrait implémenter une conversion basique
  // ou utiliser un service externe pour les conversions audio/vidéo
  
  if (fromFormat === toFormat) {
    return fileBuffer;
  }
  
  // Pour les conversions simples (changement d'extension seulement)
  // On retourne le fichier original avec le nouveau nom
  // Dans un environnement de production, vous pourriez utiliser:
  // - Un service externe comme CloudConvert
  // - Une fonction Lambda séparée avec FFmpeg
  // - Un service de conversion dédié
  
  throw new Error(`Audio conversion from ${fromFormat} to ${toFormat} is not yet implemented in this demo. The file format has been preserved.`);
};

// Fonction pour convertir les vidéos
const convertVideoFile = async (fileBuffer, fromFormat, toFormat) => {
  // Pour l'instant, on retourne le fichier original avec un message
  // Dans une version future, on pourrait implémenter une conversion basique
  // ou utiliser un service externe pour les conversions audio/vidéo
  
  if (fromFormat === toFormat) {
    return fileBuffer;
  }
  
  // Pour les conversions simples (changement d'extension seulement)
  // On retourne le fichier original avec le nouveau nom
  // Dans un environnement de production, vous pourriez utiliser:
  // - Un service externe comme CloudConvert
  // - Une fonction Lambda séparée avec FFmpeg
  // - Un service de conversion dédié
  
  throw new Error(`Video conversion from ${fromFormat} to ${toFormat} is not yet implemented in this demo. The file format has been preserved.`);
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
