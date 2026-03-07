import imageCompression from 'browser-image-compression';

/**
 * Kullanıcıdan alınan ham resim dosyasını web için optimize eder.
 * @param file - Orijinal File nesnesi
 * @returns Sıkıştırılmış ve WebP formatına dönüştürülmüş File nesnesi
 */
export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.2, // Hedeflenen maksimum boyut (200 KB)
    maxWidthOrHeight: 1920, // Maksimum genişlik/yükseklik (Full HD)
    useWebWorker: true, // Tarayıcıyı dondurmamak için işlemi arka planda yapar
    fileType: 'image/webp', // Modern ve çok hafif bir web formatı
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    // Blob'u tekrar File nesnesine çeviriyoruz ki form işlemlerinde kolayca kullanabilelim
    return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".webp"), {
      type: 'image/webp',
    });
  } catch (error) {
    console.error('Görsel sıkıştırma hatası:', error);
    throw new Error('Görsel sıkıştırılırken bir problem oluştu.');
  }
};