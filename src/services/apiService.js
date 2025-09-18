// src/services/apiService.js
class ApiService {
  constructor() {
    // Utiliser le serveur de développement local en mode dev
    this.baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888/.netlify/functions/convert'
      : '/.netlify/functions/convert';
  }

  async convertFile(file, toFormat, fileType) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('toFormat', toFormat);
      formData.append('fileType', fileType);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Récupérer le fichier converti
      const blob = await response.blob();
      const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                      `${file.name.split('.')[0]}.${toFormat}`;

      // Créer un objet File à partir du blob
      const convertedFile = new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now()
      });

      return {
        success: true,
        file: convertedFile,
        originalSize: file.size,
        convertedSize: blob.size
      };

    } catch (error) {
      console.error('API conversion error:', error);
      return {
        success: false,
        error: error.message || 'Conversion failed'
      };
    }
  }

  // Méthode pour vérifier si le service est disponible
  async healthCheck() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();
