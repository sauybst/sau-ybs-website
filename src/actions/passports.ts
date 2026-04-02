'use server'

import * as jwt from 'jsonwebtoken';
import { sendOTPEmail } from '@/utils/mail';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { checkRateLimit } from '@/utils/rate-limit';
import { maskName } from '@/utils/masking';
import { hashData, verifyData, generateOTP, generatePassportPin, generateRecoveryKey, hashEmailForLookup } from '@/utils/crypto';
import { signPassportToken } from '@/utils/jwt';
import { cookies } from 'next/headers';

// 1. OTP Gönderme İsteği
export async function requestPassportCreation(email: string, fullName: string) {
    if (!email.endsWith('@ogr.sakarya.edu.tr')) {
        return { error: 'Sadece @ogr.sakarya.edu.tr uzantılı öğrenci mailleri kabul edilmektedir.' };
    }

    const rateLimit = checkRateLimit(`otp:${email}`, { maxAttempts: 3, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
        return { error: 'Çok fazla deneme yaptınız. Lütfen 15 dakika bekleyin.' };
    }

    await supabaseAdmin.from('email_verifications').delete().lt('expires_at', new Date().toISOString());

    const otp = generateOTP();
    const otpHash = await hashData(otp);
    
    // ARAMA YAPABİLMEK İÇİN SHA-256 KULLANILIYOR
    const emailHash = hashEmailForLookup(email); 

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error } = await supabaseAdmin.from('email_verifications').insert({
        email_hash: emailHash,
        otp_hash: otpHash,
        expires_at: expiresAt
    });

    if (error) {
        console.error("🔴 SUPABASE OTP KAYIT HATASI:", error);
        return { error: 'Geçici doğrulama kodu oluşturulamadı.' };
    }

    await supabaseAdmin.from('email_verifications').delete().lt('expires_at', new Date().toISOString());

    // GERÇEK E-POSTA GÖNDERİMİ
    const mailResult = await sendOTPEmail(email, otp);
    
    if (mailResult.error) {
        // Mail atılamadıysa (şifre yanlışsa vs.), veritabanına attığımız kodu geri silip hata döndürüyoruz.
        await supabaseAdmin.from('email_verifications').delete().eq('email_hash', emailHash);
        return { error: 'Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.' };
    }

    return { success: true, message: 'Doğrulama kodu e-posta adresinize gönderildi.' };
}

// 2. OTP Doğrulama ve Pasaport Üretimi
export async function verifyAndCreatePassport(email: string, otp: string, keyword: string, fullName: string) {
    // EŞLEŞTİRME YAPABİLMEK İÇİN SHA-256 KULLANILIYOR
    const emailHash = hashEmailForLookup(email); 

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

    const isOtpValid = await verifyData(otp, verificationData.otp_hash);
    if (!isOtpValid) return { error: 'Hatalı doğrulama kodu.' };

    const pinCode = generatePassportPin();
    const recoveryKey = generateRecoveryKey();
    const keywordHash = await hashData(keyword);
    const recoveryHash = await hashData(recoveryKey);
    const nameMask = maskName(fullName);

    const { error: insertError } = await supabaseAdmin.from('passports').insert({
        pin_code: pinCode,
        keyword_hash: keywordHash,
        recovery_hash: recoveryHash,
        name_mask: nameMask
    });

    if (insertError) {
        console.error("🔴 PASAPORT OLUŞTURMA HATASI:", insertError);
        return { error: 'Pasaport oluşturulurken sistemsel bir hata oluştu.' };
    }

    await supabaseAdmin.from('email_verifications').delete().eq('id', verificationData.id);

    console.log(`[TEST ORTAMI] Kurtarma Kodu (KAYBETMEYİN): ${recoveryKey}`);

    const token = signPassportToken({ pin_code: pinCode });
    (await cookies()).set('zaferops_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
    });

    return { 
        success: true, 
        passport: { pinCode, nameMask, recoveryKey } 
    };
}

// 3. Mevcut Pasaporta Giriş (Login)
export async function loginPassport(pinCode: string, keyword: string) {
    const rateLimit = checkRateLimit(`login:${pinCode}`, { maxAttempts: 5, windowMs: 30 * 60 * 1000 });
    if (!rateLimit.allowed) return { error: 'Çok fazla hatalı giriş. 30 dakika bekleyin.' };

    const { data: passport } = await supabaseAdmin
        .from('passports')
        .select('*')
        .eq('pin_code', pinCode.toUpperCase())
        .single();

    if (!passport) return { error: 'Pasaport bulunamadı veya anahtar kelime hatalı.' };

    const isValid = await verifyData(keyword, passport.keyword_hash);
    if (!isValid) return { error: 'Pasaport bulunamadı veya anahtar kelime hatalı.' };

    await supabaseAdmin.from('passports').update({ last_active_at: new Date().toISOString() }).eq('pin_code', pinCode);

    const token = signPassportToken({ pin_code: passport.pin_code });
    (await cookies()).set('zaferops_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
    });

    return { success: true, nameMask: passport.name_mask };
}

export async function logoutPassport() {
    (await cookies()).delete('zaferops_session');
    return { success: true };
}

// 5. Portaldaki Öğrenci Verisini Getir (Oturum Kontrolü)
export async function getCurrentPassport() {
    const token = (await cookies()).get('zaferops_session')?.value;
    if (!token) return null;

    try {
        // JWT'yi çözümlüyoruz (Secret key senin sistemine göre değişebilir, JWT_SECRET genelde kullanılır)
        const secret = process.env.JWT_SECRET || 'zaferops-gizli-anahtar'; 
        const decoded = jwt.verify(token, secret) as { pin_code: string };
        
        // Pin kodu ile veritabanından en güncel bilgiyi çekiyoruz
        const { data: passport } = await supabaseAdmin
            .from('passports')
            .select('*')
            .eq('pin_code', decoded.pin_code)
            .single();
            
        return passport;
    } catch (error) {
        console.error("Geçersiz veya süresi dolmuş oturum.");
        return null;
    }
}