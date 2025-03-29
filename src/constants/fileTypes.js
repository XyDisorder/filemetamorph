export const FILE_TYPES = {
  text: {
    extensions: '.txt,.doc,.docx,.pdf,.rtf,.odt,.md',
    mimeTypes: [
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'text/markdown'
    ]
  },
  audio: {
    extensions: '.mp3,.wav,.ogg,.flac,.aac,.m4a',
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/flac',
      'audio/aac',
      'audio/mp4'
    ]
  },
  image: {
    extensions: '.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/svg+xml',
      'image/webp'
    ]
  }
};

export const OUTPUT_FORMATS = {
  text: [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'DOCX' },
    { value: 'txt', label: 'TXT' },
    { value: 'rtf', label: 'RTF' },
    { value: 'md', label: 'Markdown' }
  ],
  audio: [
    { value: 'mp3', label: 'MP3' },
    { value: 'wav', label: 'WAV' },
    { value: 'ogg', label: 'OGG' },
    { value: 'flac', label: 'FLAC' },
    { value: 'aac', label: 'AAC' }
  ],
  image: [
    { value: 'png', label: 'PNG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'webp', label: 'WEBP' },
    { value: 'svg', label: 'SVG' },
    { value: 'gif', label: 'GIF' }
  ]
};

