import imageCompression from 'browser-image-compression';

// Buradaki "export const" kısmı sorunu çözecek olan kritik noktadır.
export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.2, 
    maxWidthOrHeight: 1920, 
    useWebWorker: false, // Next.js worker çakışmasını önlemek için false
    fileType: 'image/webp', 
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Görsel sıkıştırma hatası:', error);
    throw new Error('Görsel sıkıştırılırken bir problem oluştu.');
  }
};