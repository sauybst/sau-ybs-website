/**
 * Verilen Ad-Soyad bilgisini geri döndürülemez şekilde maskeler.
 * K-Anonymity (K-Anonimlik) kısıtlarını sağlamak için kullanılır.
 */

export function maskName(fullName: string): string {
    if (!fullName) return '';
    
    return fullName
        .trim()
        .split(/\s+/) // Boşluklara göre kelimeleri ayır
        .map(word => {
            // Eğer kelime tek harfliyse direkt büyük harfini döndür
            if (word.length <= 1) return word.toLocaleUpperCase('tr-TR');
            
            // İlk harfi al (büyük harf yap) ve yanına kalan harf sayısını yaz
            const firstLetter = word.charAt(0).toLocaleUpperCase('tr-TR');
            const remainingLength = word.length - 1;
            
            return `${firstLetter}${remainingLength}`;
        })
        .join(' ');
}