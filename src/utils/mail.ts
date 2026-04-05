import nodemailer from 'nodemailer';

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('FATAL ERROR: EMAIL_USER veya EMAIL_PASS ortam değişkenleri (.env) bulunamadı!');
}

// Nodemailer taşıyıcısını (Transporter) oluşturuyoruz
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Öğrenciye OTP kodunu şık bir HTML formatında gönderir.
 */
export async function sendOTPEmail(toEmail: string, otpCode: string) {
    const mailOptions = {
        from: `"SAÜ YBS Öğrenci Topluluğu" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Pasaport Doğrulama Kodunuz 🎫',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 450px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #0f172a; margin-bottom: 5px;">zaferOPS Pasaport İşlemleri</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 0;">Anonim kimliğinizi oluşturmak için son bir adım.</p>
                </div>

                <div style="background-color: white; padding: 30px; border-radius: 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <p style="color: #334155; font-size: 15px; margin-bottom: 15px;">Geçici doğrulama kodunuz (OTP):</p>
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; color: #2563eb; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
                        ${otpCode}
                    </div>
                    <p style="color: #ef4444; font-size: 12px; margin-top: 0;">Bu kod 10 dakika içinde geçerliliğini yitirecektir.</p>
                </div>

                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #94a3b8; font-size: 12px;">Eğer bu işlemi siz başlatmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("🔴 E-POSTA GÖNDERİM HATASI:", error);
        return { error: 'E-posta gönderilirken sunucu tarafında bir sorun oluştu.' };
    }
}