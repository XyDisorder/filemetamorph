// src/services/apiService.js
import clientConverter from './clientConverter';

class ApiService {
  constructor() {
    // Utiliser les conversions côté client
    this.useClientSide = true;
  }

  async convertFile(file, toFormat, fileType) {
    try {
      if (this.useClientSide) {
        // Conversion côté client
        const convertedBlob = await clientConverter.convert(file, toFormat, fileType);
        
        // Créer un objet File à partir du blob
        const fileName = `${file.name.split('.')[0]}.${toFormat}`;
        const convertedFile = new File([convertedBlob], fileName, {
          type: convertedBlob.type,
          lastModified: Date.now()
        });

        return {
          success: true,
          file: convertedFile,
          originalSize: file.size,
          convertedSize: convertedBlob.size
        };
      } else {
        // Fallback vers l'API serveur (si nécessaire)
        return await this.serverSideConvert(file, toFormat, fileType);
      }

    } catch (error) {
      console.error('Conversion error:', error);
      return {
        success: false,
        error: error.message || 'Conversion failed'
      };
    }
  }

  // Méthode de fallback pour l'API serveur
  async serverSideConvert(file, toFormat, fileType) {
    const baseUrl = import.meta.env.DEV 
      ? 'http://localhost:8888/.netlify/functions/convert'
      : '/.netlify/functions/convert';

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('toFormat', toFormat);
      formData.append('fileType', fileType);

      const response = await fetch(baseUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                      `${file.name.split('.')[0]}.${toFormat}`;

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
      throw new Error(`Server conversion failed: ${error.message}`);
    }
  }

  // Méthode pour vérifier si le service est disponible
  async healthCheck() {
    return true; // Les conversions côté client sont toujours disponibles
  }
}

export default new ApiService();
