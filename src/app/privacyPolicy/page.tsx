import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-[100dvh] bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100">
        <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Ana Sayfaya Dön
        </Link>
        
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-6">Aydınlatma Metni</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-sm text-slate-400">Son güncellenme tarihi: 6 Nisan 2026</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">1. Veri Sorumlusu ve Amacımız</h2>
          <p>Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu (SAÜ YBST) olarak, veri mahremiyetinize en üst düzeyde önem veriyoruz. Sitemizde yer alan "zaferOPS Pasaport ve e-Yoklama Sistemi", "Tasarımda Gizlilik" (Privacy by Design) ve "Veri Minimizasyonu" ilkeleri merkeze alınarak geliştirilmiştir.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">2. Kayıt (Pasaport) İşlemleri ve E-Posta Güvenliği</h2>
          <p>Sisteme kayıt (Pasaport oluşturma) esnasında gönderdiğiniz "ogr.sakarya.edu.tr" uzantılı e-posta adresiniz, sistemlerimiz tarafından geri döndürülemez şekilde şifrelenerek geçici bir koda dönüştürülür. Bu geçici doğrulama kodları veritabanımızda <strong>en fazla 10 dakika</strong> boyunca tutulur. Doğrulama gerçekleştiğinde veya süre dolduğunda, e-postanıza dair hiçbir iz veritabanımızda kalıcı olarak barındırılmaz.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">3. Sertifika Üretimi ve Maskeleme</h2>
          <p>Sistemde oluşturduğunuz profillerde ad ve soyadınız açık bir şekilde tutulmaz. Bunun yerine K-Anonimlik algoritmaları ile maskelenerek kaydedilir. Etkinlik sertifikalarınızı oluşturduğunuz esnada girdiğiniz Ad-Soyad bilgisi ise yalnızca o an PDF belgesinin üretilmesi için bellekte anlık olarak işlenir ve hiçbir veritabanına kaydedilmeden imha edilir.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">4. Sistem Kayıtları ve Loglar</h2>
          <p>Sistem güvenliğini sağlamak, siber saldırıları önlemek ve çoklu istekleri kontrol altına almak amacıyla, siteye yapılan erişimlerde IP adresleri ve tarayıcı bilgileri bulut altyapısı sağlayıcılarımız tarafından yasal yükümlülükler çerçevesinde standart güvenlik logları olarak geçici süreyle kayıt altına alınmaktadır.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">5. İletişim ve Haklarınız</h2>
          <p>Sistemimizin "Zero-Storage" mimarisi gereği, kullanıcı (öğrenci) tarafında şahsınızla doğrudan ilişkilendirilebilecek kalıcı bir kişisel veri barındırılmamaktadır. Sistemin işleyişi veya politikalarımız hakkında her türlü soru, görüş ve öneriniz için bize e-posta adresimiz (sauybst@gmail.com) üzerinden ulaşabilirsiniz.</p>
        </div>
      </div>
    </main>
  );
}