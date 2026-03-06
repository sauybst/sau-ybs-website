import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <main className="min-h-[100dvh] bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100">
        <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Ana Sayfaya Dön
        </Link>
        
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-6">Çerez (Cookie) Politikası</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-sm text-slate-400">Son güncellenme tarihi: 6 Mart 2026</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">1. Çerez Nedir?</h2>
          <p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınız aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">2. Hangi Çerezleri Kullanıyoruz?</h2>
          <p>Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu web sitesinde, sitenin düzgün çalışması için <strong>zorunlu çerezler</strong> ve ziyaretçi trafiğini anonim olarak analiz etmek için <strong>performans ve analitik çerezleri</strong> kullanılmaktadır.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">3. Çerezleri Neden Kullanıyoruz?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Web sitesinin temel işlevlerini (menüler, sayfa geçişleri) yerine getirebilmesi.</li>
            <li>Ziyaretçilerin siteyi nasıl kullandığını analiz ederek performansı artırmak.</li>
            <li>Gelecekteki güncellemeler için kullanıcı deneyimini iyileştirmek.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">4. Çerez Yönetimi</h2>
          <p>Çerez kullanımını tercih etmiyorsanız tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda sitemizin bazı özelliklerinin tam kapasiteyle çalışmayabileceğini hatırlatmak isteriz.</p>
        </div>
      </div>
    </main>
  );
}