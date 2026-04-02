import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SALT_ROUNDS = 10;

/**
 * Veriyi (Şifre, Kurtarma Kodu vs.) tek yönlü özetler (Hash).
 */
export async function hashData(data: string): Promise<string> {
    return await bcrypt.hash(data, SALT_ROUNDS);
}

/**
 * Kullanıcının girdiği açık metnin, veritabanındaki hash ile eşleşip eşleşmediğini doğrular.
 */
export async function verifyData(data: string, hashedData: string): Promise<boolean> {
    return await bcrypt.compare(data, hashedData);
}

/**
 * Öğrenciye gösterilecek 12 haneli kurtarma anahtarını üretir. (Örn: SAU-REC-9A8B-C7D6)
 * Kriptografik olarak güvenli rastgele byte'lar kullanır.
 */
export function generateRecoveryKey(): string {
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `SAU-REC-${part1}-${part2}`;
}

/**
 * @ogr.sakarya.edu.tr mailine gönderilecek 6 haneli geçici OTP'yi üretir.
 * Math.random() yerine, tahmin edilemez crypto.randomInt kullanılmıştır.
 */
export function generateOTP(): string {
    return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Sistemin kalbi olan anonim Pasaport PIN'ini üretir. (Örn: SAU-99X2)
 */
export function generatePassportPin(): string {
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `SAU-${randomPart}`;
}

/**
 * Biletlerin içine gömülecek tahmin edilemez 8 haneli bilet PIN'ini üretir. (Örn: YBS-4X9A)
 */
export function generateTicketPin(): string {
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `YBS-${randomPart}`;
}

/**
 * E-posta adreslerini veritabanında arayabilmek için (Bcrypt yerine)
 * her zaman aynı sonucu veren (Deterministic) SHA-256 algoritmasıyla özetler.
 */
export function hashEmailForLookup(email: string): string {
    return crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}