import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { maskName } from '@/utils/masking'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit' // ÖZEL FONT MOTORU
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import QRCode from 'qrcode' 
import { TICKET_STATUS } from '@/types/tickets'

export async function POST(request: Request) {
    try {
        const { pinCode, requestedName } = await request.json()

        if (!pinCode || !requestedName) {
            return NextResponse.json({ error: 'PIN kodu ve isim gereklidir.' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. GÜVENLİK KATMAMI
        const { data: passport, error: passportError } = await supabase
            .from('passports')
            .select('name_mask') 
            .eq('pin_code', pinCode)
            .single()

        if (passportError || !passport) {
            return NextResponse.json({ error: 'Geçersiz pasaport PIN kodu.' }, { status: 404 })
        }

        const generatedMask = maskName(requestedName)
        if (generatedMask !== passport.name_mask) {
            return NextResponse.json({ 
                error: `Güvenlik İhlali: Girdiğiniz isim sisteme uymuyor. (${generatedMask})` 
            }, { status: 403 })
        }

        // 2. VERİ KATMAMI (Etkinlik Sayısı)
        const { data: tickets } = await supabase
            .from('tickets')
            .select('event_id')
            .eq('pin_code', pinCode)
            .eq('status', TICKET_STATUS.SCANNED)
        
        const uniqueEvents = new Set(tickets?.map(t => t.event_id))
        const eventCount = uniqueEvents.size

        if (eventCount === 0) {
             return NextResponse.json({ error: 'Henüz hiçbir etkinliğe katılımınız bulunmuyor.' }, { status: 403 })
        }

        // 3. İŞ KATMAMI (Sertifika Hash)
        let certificateHash = ''
        const { data: existingCert } = await supabase.from('certificates').select('hash').eq('passport_pin', pinCode).single()

        if (existingCert) {
            certificateHash = existingCert.hash
            await supabase.from('certificates').update({ event_count: eventCount }).eq('hash', certificateHash)
        } else {
            certificateHash = 'SAU-' + crypto.randomBytes(4).toString('hex').toUpperCase()
            await supabase.from('certificates').insert({ hash: certificateHash, passport_pin: pinCode, event_count: eventCount })
        }

        // 4. ÜRETİM VE ÇİZİM KATMAMI (PDF GENERATION)
        const templatePath = path.join(process.cwd(), 'public', 'certificate-template.pdf')
        if (!fs.existsSync(templatePath)) return NextResponse.json({ error: 'Şablon bulunamadı!' }, { status: 500 })

        const existingPdfBytes = fs.readFileSync(templatePath)
        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        
        pdfDoc.registerFontkit(fontkit)

        const youngestFontBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'TheYoungestScript.ttf'))
        const roxboroughFontBytes = fs.readFileSync(path.join(process.cwd(), 'public', 'fonts', 'RoxboroughCF.ttf'))

        const youngestFont = await pdfDoc.embedFont(youngestFontBytes)
        const roxboroughFont = await pdfDoc.embedFont(roxboroughFontBytes)

        const pages = pdfDoc.getPages()
        const firstPage = pages[0]
        const { width, height } = firstPage.getSize()

        // ----------------------------------------------------
        // 4.1. İSİM YAZDIRMA (The Youngest Script)
        // ----------------------------------------------------
        // DÜZELTME: İsim otomatik olarak Türkçe kurallarına göre BÜYÜK HARF yapılıyor.
        const nameText = requestedName.toLocaleUpperCase('tr-TR')
        
        let nameFontSize = 44 // Varsayılan en büyük font boyutu
        const minFontSize = 24 // Düşebileceği en küçük font boyutu
        
        // İsmin yazılabileceği maksimum genişliği belirliyoruz (Sayfanın sağında pay bırakacak şekilde)
        // Başlangıç x: width * 0.38, Bitiş x: width * 0.95 (Yani kağıdın sağ ucuna yakın bir yer)
        const maxAvailableWidth = (width * 0.95) - (width * 0.38) 

        let nameTextWidth = youngestFont.widthOfTextAtSize(nameText, nameFontSize)

        // AKILLI DÖNGÜ: İsim ayrılan alandan büyükse ve font hala min boyuttan büyükse küçült
        while (nameTextWidth > maxAvailableWidth && nameFontSize > minFontSize) {
            nameFontSize -= 1 // Fontu 1 punto küçült
            nameTextWidth = youngestFont.widthOfTextAtSize(nameText, nameFontSize) // Genişliği tekrar ölç
        }
        
        firstPage.drawText(nameText, {
            // DÜZELTME: "Sn." yazısının yanına gelmesi için X koordinatını sabitledik. 
            // Eğer isim çok sağdaysa 0.38'i küçült (Örn: 0.35), çok soldaysa büyüt.
            x: width * 0.34, 
            y: height * 0.55, // "Sn." yazısının yüksekliği
            size: nameFontSize,
            font: youngestFont,
            color: rgb(50/255, 58/255, 118/255),
        })

        // ----------------------------------------------------
        // 4.2. ETKİNLİK SAYISI YAZDIRMA (Roxborough CF)
        // ----------------------------------------------------
        const countText = eventCount.toString()
        const countFontSize = 42 
        const countTextWidth = roxboroughFont.widthOfTextAtSize(countText, countFontSize)

        firstPage.drawText(countText, {
            // DÜZELTME: Çizgiye ortalamak için kendi genişliğinin yarısı kadar geri çektik.
            // Sola kaydırmak için 0.23'ü küçültün, sağa kaydırmak için büyütün.
            x: (width * 0.30) - (countTextWidth / 2), 
            y: height * 0.22, // Çizginin hemen üstüne oturması için yüksekliği ayarladık
            size: countFontSize,
            font: roxboroughFont,
            color: rgb(203/255, 165/255, 52/255), 
        })

        // ----------------------------------------------------
        // 4.3. DİNAMİK QR KOD ÜRETİMİ VE YERLEŞTİRME
        // ----------------------------------------------------
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const validationUrl = `${baseUrl}/check-certificates?code=${certificateHash}`
        
        const qrCodeDataUri = await QRCode.toDataURL(validationUrl, { margin: 1, width: 200, color: { dark: '#000000', light: '#ffffff' } })
        const qrImageBytes = Buffer.from(qrCodeDataUri.split(',')[1], 'base64')
        const qrImage = await pdfDoc.embedPng(qrImageBytes)
        
        // DÜZELTME: QR Kodu 0.5'ten 0.35'e çekerek daha şık ve küçük bir hale getirdik
        const qrDims = qrImage.scale(0.35) 

        firstPage.drawImage(qrImage, {
            x: (width * 0.70) - (qrDims.width / 2), // Doğrulama adresi metninin üstüne ortalama
            y: height * 0.23, 
            width: qrDims.width,
            height: qrDims.height,
        })

        // QR Kodun Altındaki Hash Kodu
        const defaultFont = await pdfDoc.embedFont('Helvetica-Bold') 
        firstPage.drawText(`KOD: ${certificateHash}`, {
            x: (width * 0.70) - 40, // QR'ın altına ortalandı
            y: height * 0.21, 
            size: 8, // Font boyutu küçültüldü
            font: defaultFont,
            color: rgb(0.2, 0.2, 0.2), // Çok hafif gri
        })

        const pdfBytes = await pdfDoc.save()

        // 5. SUNUM KATMAMI (Zero-Storage İndirme)
        // ----------------------------------------------------
        // 5. SUNUM KATMAMI (Zero-Storage İndirme)
        // ----------------------------------------------------
        
        // HTTP Header kısıtlamaları (ByteString > 255) nedeniyle dosya ismini İngilizceye çeviriyoruz:
        const safeFileName = requestedName
            .replace(/Ğ/g, 'G').replace(/ğ/g, 'g')
            .replace(/Ü/g, 'U').replace(/ü/g, 'u')
            .replace(/Ş/g, 'S').replace(/ş/g, 's')
            .replace(/İ/g, 'I').replace(/ı/g, 'i')
            .replace(/Ö/g, 'O').replace(/ö/g, 'o')
            .replace(/Ç/g, 'C').replace(/ç/g, 'c')
            .replace(/\s+/g, '-');

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="zaferOPS-Sertifika-${safeFileName}.pdf"`,
            },
        })

    } catch (error) {
        console.error('[Sertifika Üretim Hatası]:', error)
        return NextResponse.json({ error: 'Sunucuda sertifika üretilirken bir hata oluştu.' }, { status: 500 })
    }
}