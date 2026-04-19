import jwt from 'jsonwebtoken';

// FAIL-FAST: Ortam değişkeni yoksa uygulama ayağa kalkmaz, anında çöker.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET ortam değişkeni (.env) bulunamadı! Uygulama güvenliği için bu değer zorunludur.');
}

const JWT_SECRET_VERIFIED: string = JWT_SECRET;

export interface PassportJwtPayload {
    pin_code: string;
}

/**
 * Pasaport PIN'ini güvenli bir JWT token'ına dönüştürür.
 */
export function signPassportToken(payload: PassportJwtPayload): string {
    return jwt.sign(payload, JWT_SECRET_VERIFIED, {
        expiresIn: '1d', 
    });
}

/**
 * Tarayıcıdan gelen JWT token'ını çözer ve doğrular. Oynanmışsa null döner.
 */
export function verifyPassportToken(token: string): PassportJwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET_VERIFIED) as PassportJwtPayload;
        return decoded;
    } catch (error) {
        return null; 
    }
}