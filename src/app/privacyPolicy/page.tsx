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
        
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-6">Aydınlatma Metni ve Gizlilik Politikası</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-sm text-slate-400">Son güncellenme tarihi: 6 Mart 2026</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">1. Veri Sorumlusu ve Amacımız</h2>
          <p>Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu (SAÜ YBS) olarak, ziyaretçilerimizin gizliliğine saygı duyuyoruz. Bu web sitesi, topluluğumuzun vizyonunu, etkinliklerini ve projelerini tanıtmak amacıyla <strong>yalnızca bilgilendirme statüsünde</strong> faaliyet göstermektedir.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">2. Kişisel Veri Toplama Durumu</h2>
          <p>Web sitemiz üzerinden ziyaretçilerimize ait ad, soyad, e-posta adresi, telefon numarası veya öğrenci numarası gibi <strong>hiçbir kişisel veri toplanmamakta, kaydedilmemekte ve işlenmemektedir.</strong> Sitemizde herhangi bir üyelik sistemi veya doğrudan veri girişi yapılan bir form bulunmamaktadır.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">3. Dış Bağlantılar ve Üçüncü Taraf Formlar</h2>
          <p>Sitemiz üzerinde yer alan "Topluluğumuza Katılın", "Etkinlik Kayıtları" veya iletişim amaçlı butonlar, sizleri üniversitemizin resmi sistemlerine (SABİS) veya üçüncü taraf platformlara (örneğin Google Formlar) yönlendirebilir. Bu dış platformlarda paylaştığınız veriler, ilgili platformların kendi gizlilik ve güvenlik politikalarına tabidir.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">4. İletişim</h2>
          <p>Sitemiz altyapısında tarafınıza ait herhangi bir kişisel veri barındırılmadığı için sistemimiz üzerinde silinecek veya güncellenecek bir veri kaydı bulunmamaktadır. Ancak her türlü soru, görüş ve öneriniz için bize e-posta adresimiz (sauybst@gmail.com) üzerinden her zaman ulaşabilirsiniz.</p>
        </div>
      </div>
    </main>
  );
}