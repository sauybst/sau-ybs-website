// ============================================================
// Basit In-Memory Rate Limiter
// Brute-force saldırılarını engellemek için kullanılır.
// NOT: Sunucu yeniden başlatıldığında sıfırlanır.
//      Çoklu instance'larda Redis gibi bir çözüm gerekir.
// ============================================================

type RateLimitEntry = {
    count: number
    resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Periyodik olarak süresi dolmuş kayıtları temizle (bellek sızıntısını önler)
const CLEANUP_INTERVAL = 60 * 1000 // 1 dakika
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key)
        }
    }
}, CLEANUP_INTERVAL)

interface RateLimitOptions {
    /** Zaman penceresi içinde izin verilen maksimum istek sayısı */
    maxAttempts: number
    /** Zaman penceresi (milisaniye cinsinden) */
    windowMs: number
}

interface RateLimitResult {
    allowed: boolean
    remainingAttempts: number
    retryAfterMs: number
}

/**
 * Belirtilen anahtar için rate limit kontrolü yapar.
 *
 * @param key - Benzersiz tanımlayıcı (ör: IP adresi veya e-posta)
 * @param options - Rate limit ayarları
 * @returns İsteğin kabul edilip edilmediği bilgisi
 *
 * @example
 * const result = checkRateLimit('login:user@email.com', {
 *     maxAttempts: 5,
 *     windowMs: 15 * 60 * 1000, // 15 dakika
 * })
 * if (!result.allowed) return { error: 'Çok fazla deneme...' }
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
    const { maxAttempts, windowMs } = options
    const now = Date.now()

    const entry = rateLimitStore.get(key)

    // Kayıt yoksa veya süresi dolmuşsa yeni pencere başlat
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowMs,
        })
        return {
            allowed: true,
            remainingAttempts: maxAttempts - 1,
            retryAfterMs: 0,
        }
    }

    // Limit aşıldıysa reddet
    if (entry.count >= maxAttempts) {
        return {
            allowed: false,
            remainingAttempts: 0,
            retryAfterMs: entry.resetTime - now,
        }
    }

    // Sayacı artır ve izin ver
    entry.count++
    return {
        allowed: true,
        remainingAttempts: maxAttempts - entry.count,
        retryAfterMs: 0,
    }
}
