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
        
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-6">Çerez Politikası</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-sm text-slate-400">Son güncellenme tarihi: 6 Nisan 2026</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">1. Çerez Nedir?</h2>
          <p>Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınız aracılığıyla cihazınıza veya ağ sunucusuna depolanan küçük metin dosyalarıdır.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">2. Hangi Çerezleri Kullanıyoruz?</h2>
          <p>Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu (SAÜ YBST) web sitesinde, yalnızca sitenin düzgün ve güvenli bir şekilde çalışması için gerekli olan <strong>zorunlu çerezler</strong> kullanılmaktadır. Sitemizde ziyaretçileri takip eden, analiz eden veya reklam profili oluşturan herhangi bir üçüncü taraf takip çerezi <strong>bulunmamaktadır.</strong></p>

          <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3">Çerez / Veri Adı</th>
                  <th scope="col" className="px-4 py-3">Kullanım Amacı</th>
                  <th scope="col" className="px-4 py-3">Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">zaferops_session</td>
                  <td className="px-4 py-3">Öğrenci (Pasaport) portalına güvenli girişi ve oturumun devamlılığını sağlamak için kullanılır.</td>
                  <td className="px-4 py-3 whitespace-nowrap">30 Gün</td>
                </tr>
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">sb-[...]-auth-token</td>
                  <td className="px-4 py-3">Sistem yöneticilerinin yönetim paneline güvenli erişimi ve yetki kontrolü için kullanılır.</td>
                  <td className="px-4 py-3 whitespace-nowrap">Oturum Süresince</td>
                </tr>
                <tr className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">cookieAcknowledged</td>
                  <td className="px-4 py-3">Çerez bilgilendirme çubuğunu kapatma tercihinizi hatırlar (Tarayıcı yerel depolamasında tutulur).</td>
                  <td className="px-4 py-3 whitespace-nowrap">Kalıcı</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">3. Çerezleri Neden Kullanıyoruz?</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Web sitesinin temel işlevlerini sorunsuz bir şekilde yerine getirebilmesi.</li>
            <li>Sistemin güvenliğinin sağlanması, yetkisiz erişimlerin engellenmesi ve olası hataların önlenmesi.</li>
            <li>Çerez bilgilendirme uyarısını okuyup kapattığınızda, bu tercihinizin hatırlanması (böylece her girişinizde aynı uyarıyı tekrar görmezsiniz).</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">4. Çerez Yönetimi</h2>
          <p>Tarayıcınızın ayarlarını değiştirerek sitemizin kullandığı bu zorunlu çerezleri silebilir veya engelleyebilirsiniz. Ancak bu durumda çerez bilgilendirme çubuğu her girişinizde tekrar karşınıza çıkabilir veya "Pasaport" girişleri gibi sitemizin kimlik doğrulama gerektiren özellikleri beklediğiniz gibi çalışmayabilir.</p>
        </div>
      </div>
    </main>
  );
}