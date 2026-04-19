'use server'

import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import { sendOTPEmail } from '@/utils/mail';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { checkRateLimit } from '@/utils/rate-limit';
import { maskName } from '@/utils/masking';
import { hashData, verifyData, generateOTP, generatePassportPin, generateRecoveryKey, hashEmailForLookup } from '@/utils/crypto';
import { signPassportToken } from '@/utils/jwt';
import { cookies } from 'next/headers';
import { headers } from 'next/headers'

const ALLOWED_EMAIL_DOMAIN = '@ogr.sakarya.edu.tr';
const OTP_EXPIRE_MINUTES = 10;
const SESSION_COOKIE_NAME = 'zaferops_session';
const SESSION_MAX_AGE_SEC = 24 * 60 * 60; 

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const, 
    maxAge: SESSION_MAX_AGE_SEC,
    path: '/'
};

const RATE_LIMITS = {
    OTP_REQUEST: { attempts: 3, windowMs: 15 * 60 * 1000 },
    OTP_VERIFY: { attempts: 5, windowMs: 10 * 60 * 1000 },
    LOGIN: { attempts: 5, windowMs: 30 * 60 * 1000 }
};

// --- GİRDİ DOĞRULAMA ŞEMALARI ---
const EmailSchema = z.string().email().endsWith(ALLOWED_EMAIL_DOMAIN, `Sadece ${ALLOWED_EMAIL_DOMAIN} uzantılı mailler kabul edilmektedir.`);
const OtpSchema = z.string().min(6).max(8); 


const DENY_LIST = ['123456', 'password', 'sauybs', 'sakarya', 'zaferops', 'admin'];

const KeywordSchema = z.string()
    .min(10, 'Şifreniz en az 10 karakter uzunluğunda olmalıdır.')
    .max(50, 'Şifreniz çok uzun.')
    .regex(/[A-Z]/, 'Şifreniz en az bir büyük harf içermelidir.')
    .regex(/[a-z]/, 'Şifreniz en az bir küçük harf içermelidir.')
    .regex(/[0-9]/, 'Şifreniz en az bir rakam içermelidir.')
    .regex(/[^A-Za-z0-9]/, 'Şifreniz en az bir özel karakter (örn: @, !, ?, *, #) içermelidir.')
    .refine((val) => !DENY_LIST.some(word => val.toLowerCase().includes(word)), {
        message: 'Şifreniz çok yaygın, tahmin edilebilir veya kurumsal kelimeler içeremez.'
    });
const PinSchema = z.string().length(12); 

// 1. OTP Gönderme İsteği
export async function requestPassportCreation(email: string, fullName: string) {
    const emailValidation = EmailSchema.safeParse(email);
        if (!emailValidation.success) {
            return { error: emailValidation.error.issues[0].message };
        }

    const cleanEmail = emailValidation.data;
    
    // 1. İsteği yapanın IP adresini yakala
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1'
    
    // 2. Anahtarı IP + Email kombinasyonu yap
    const rateLimitKey = `otp_req:${ip}:${cleanEmail}`

    // 3. Güncellenmiş anahtar ile kontrol et
    const rateLimit = checkRateLimit(rateLimitKey, { 
        maxAttempts: RATE_LIMITS.OTP_REQUEST.attempts, 
        windowMs: RATE_LIMITS.OTP_REQUEST.windowMs 
    });

    if (!rateLimit.allowed) {
        return { error: 'Çok fazla kod talep ettiniz. Lütfen biraz bekleyin.' }
    }
    // Temizlik işlemi
    await supabaseAdmin.from('email_verifications').delete().lt('expires_at', new Date().toISOString());

    const otp = generateOTP();
    const otpHash = await hashData(otp);
    const emailHash = hashEmailForLookup(cleanEmail); 

    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin.from('email_verifications').insert({
        email_hash: emailHash,
        otp_hash: otpHash,
        expires_at: expiresAt
    });

    if (error) {
        console.error("[Passport Error] OTP Kayıt:", error.message);
        return { error: 'Geçici doğrulama kodu oluşturulamadı.' };
    }

    const mailResult = await sendOTPEmail(cleanEmail, otp);
    
    if (mailResult.error) {
        await supabaseAdmin.from('email_verifications').delete().eq('email_hash', emailHash);
        return { error: 'Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.' };
    }

    return { success: true, message: 'Doğrulama kodu e-posta adresinize gönderildi.' };
}

// 2. OTP Doğrulama ve Pasaport Üretimi
export async function verifyAndCreatePassport(email: string, otp: string, keyword: string, fullName: string) {
    const emailHash = hashEmailForLookup(email); 

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';
    
    const rateLimit = checkRateLimit(`otp_verify:${ip}:${emailHash}`, { 
        maxAttempts: RATE_LIMITS.OTP_VERIFY.attempts, 
        windowMs: RATE_LIMITS.OTP_VERIFY.windowMs 
    });

    if (!rateLimit.allowed) {
        return { error: 'Çok fazla hatalı kod girdiniz. Lütfen daha sonra tekrar OTP isteyin.' };
    }

    const otpValidation = OtpSchema.safeParse(otp);
    if (!otpValidation.success) {
        return { error: otpValidation.error.issues[0].message || 'Geçersiz OTP formatı.' };
    }

    const keywordValidation = KeywordSchema.safeParse(keyword);
    if (!keywordValidation.success) {
        return { error: keywordValidation.error.issues[0].message };
    }

    const { data: verificationData, error: fetchError } = await supabaseAdmin
        .from('email_verifications')
        .select('*')
        .eq('email_hash', emailHash)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (fetchError || !verificationData) {
        return { error: 'Doğrulama kodu bulunamadı veya süresi dolmuş.' };
    }

    const isOtpValid = await verifyData(otpValidation.data, verificationData.otp_hash);
    if (!isOtpValid) return { error: 'Hatalı doğrulama kodu.' };

    const pinCode = generatePassportPin();
    const recoveryKey = generateRecoveryKey();
    const keywordHash = await hashData(keywordValidation.data);
    const recoveryHash = await hashData(recoveryKey);
    const nameMask = maskName(fullName);

    const { error: insertError } = await supabaseAdmin.from('passports').insert({
        pin_code: pinCode,
        keyword_hash: keywordHash,
        recovery_hash: recoveryHash,
        name_mask: nameMask
    });

    if (insertError) {
        console.error("[Passport Error] Pasaport Oluşturma:", insertError.message);
        return { error: 'Pasaport oluşturulurken sistemsel bir hata oluştu.' };
    }

    await supabaseAdmin.from('email_verifications').delete().eq('id', verificationData.id);

    const token = signPassportToken({ pin_code: pinCode });
    (await cookies()).set(SESSION_COOKIE_NAME, token, cookieOptions);

    return { 
        success: true, 
        passport: { pinCode, nameMask, recoveryKey } 
    };
}

// 3. Mevcut Pasaporta Giriş (Login)
export async function loginPassport(pinCode: string, keyword: string) {

    const normalizedPin = pinCode.trim().toUpperCase();

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    const rateLimit = checkRateLimit(`login:${ip}:${normalizedPin}`, { 
        maxAttempts: RATE_LIMITS.LOGIN.attempts, 
        windowMs: RATE_LIMITS.LOGIN.windowMs 
    });
    
    if (!rateLimit.allowed) return { error: 'Çok fazla hatalı giriş. 30 dakika bekleyin.' };

    const pinValidation = PinSchema.safeParse(pinCode.toUpperCase());
    if (!pinValidation.success) return { error: 'Geçersiz pasaport formatı.' };

    const { data: passport } = await supabaseAdmin
        .from('passports')
        .select('*')
        .eq('pin_code', pinValidation.data)
        .single();

    if (!passport) return { error: 'Pasaport bulunamadı veya anahtar kelime hatalı.' };

    const isValid = await verifyData(keyword, passport.keyword_hash);
    if (!isValid) return { error: 'Pasaport bulunamadı veya anahtar kelime hatalı.' };

    await supabaseAdmin.from('passports').update({ last_active_at: new Date().toISOString() }).eq('pin_code', pinValidation.data);

    const token = signPassportToken({ pin_code: passport.pin_code });
    (await cookies()).set(SESSION_COOKIE_NAME, token, cookieOptions);

    return { success: true, nameMask: passport.name_mask };
}

export async function logoutPassport() {
    (await cookies()).delete(SESSION_COOKIE_NAME);
    return { success: true };
}

// 5. Portaldaki Öğrenci Verisini Getir (Oturum Kontrolü)
export async function getCurrentPassport() {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const secret = process.env.JWT_SECRET; 
    if (!secret) {
        console.error("[CRITICAL SECURITY ERROR] JWT_SECRET is not defined in environment variables!");
        return null; 
    }

    try {
        const decoded = jwt.verify(token, secret) as { pin_code: string };
        
        const { data: passport, error } = await supabaseAdmin
            .from('passports')
            .select('*')
            .eq('pin_code', decoded.pin_code)
            .single();
            
        if (error || !passport) return null;

        return passport;
    } catch (error) {
        return null;
    }
}

// 6. Kurtarma Anahtarı ile Şifre Sıfırlama
export async function recoverPassportKeyword(pinCode: string, recoveryKey: string, newKeyword: string) {

    const normalizedPin = pinCode.trim().toUpperCase();

    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1';

    const rateLimit = checkRateLimit(`recover:${ip}:${normalizedPin}`, { 
        maxAttempts: 3, 
        windowMs: 60 * 60 * 1000 
    });
    
    if (!rateLimit.allowed) {
        return { error: 'Çok fazla hatalı deneme. Güvenlik gereği 1 saat bekleyiniz.' };
    }

    const pinValidation = PinSchema.safeParse(pinCode.toUpperCase());
    const keywordValidation = KeywordSchema.safeParse(newKeyword);

    if (!pinValidation.success) return { error: 'Geçersiz pasaport formatı.' };
    if (!keywordValidation.success) {
        return { error: keywordValidation.error.issues[0].message };
    }
    if (!recoveryKey || recoveryKey.trim() === '') return { error: 'Kurtarma kodu boş bırakılamaz.' };

    // 1. Pasaportu PIN ile bul
    const { data: passport } = await supabaseAdmin
        .from('passports')
        .select('*')
        .eq('pin_code', pinValidation.data)
        .single();

    if (!passport) return { error: 'Pasaport bulunamadı veya kurtarma anahtarı hatalı.' };

    // 2. Kurtarma Anahtarını Doğrula (Hash karşılaştırması)
    const isValidRecovery = await verifyData(recoveryKey.trim(), passport.recovery_hash);
    if (!isValidRecovery) return { error: 'Pasaport bulunamadı veya kurtarma anahtarı hatalı.' };

    // 3. Yeni Şifreyi (Anahtar Kelime) Hashle ve Kaydet
    const newKeywordHash = await hashData(keywordValidation.data);
    
    const { error: updateError } = await supabaseAdmin
        .from('passports')
        .update({ 
            keyword_hash: newKeywordHash, 
            last_active_at: new Date().toISOString() 
        })
        .eq('pin_code', pinValidation.data);

    if (updateError) {
        console.error("[Passport Error] Şifre Sıfırlama:", updateError.message);
        return { error: 'Şifre güncellenirken sistemsel bir hata oluştu.' };
    }

    // 4. İşlem başarılıysa kullanıcıyı otomatik olarak içeri al (Oturum aç)
    const token = signPassportToken({ pin_code: passport.pin_code });
    (await cookies()).set(SESSION_COOKIE_NAME, token, cookieOptions);

    return { success: true, nameMask: passport.name_mask };
}