import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <main className="min-h-[100dvh] bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-100">
        <Link href="/" className="inline-flex items-center text-brand-600 hover:text-brand-700 font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Ana Sayfaya Dön
        </Link>
        
        <h1 className="text-3xl font-heading font-bold text-slate-900 mb-6">Kullanıcı Sözleşmesi ve Kullanım Koşulları</h1>
        
        <div className="space-y-6 text-slate-600 leading-relaxed">
          <p className="text-sm text-slate-400">Son güncellenme tarihi: 6 Nisan 2026</p>
          
          <h2 className="text-xl font-semibold text-slate-800 mt-8">1. Taraflar ve Tanımlar</h2>
          <p>Bu sözleşme, Sakarya Üniversitesi Yönetim Bilişim Sistemleri Öğrenci Topluluğu (Bundan sonra "Topluluk" olarak anılacaktır) ile zaferOPS platformuna kayıt olan kullanıcı (Bundan sonra "Öğrenci/Kullanıcı" olarak anılacaktır) arasında akdedilmiştir.</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Platform:</strong> Topluluk etkinliklerinin yönetildiği zaferOPS sistemini ifade eder.</li>
            <li><strong>Pasaport:</strong> Kullanıcının platform üzerinde bilet almasını, yoklama vermesini ve sertifika üretmesini sağlayan, PIN kodu ve Anahtar Kelime ile korunan anonim dijital kimliği ifade eder.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">2. Hizmetin Kapsamı</h2>
          <p>Platform; öğrencilerin topluluk etkinliklerine dijital bilet almasını, etkinlik girişlerinde QR kod ile e-yoklama vermesini ve katılım sağladığı etkinlikler neticesinde dijital doğrulama kodlu sertifikalar oluşturmasını sağlar. Hizmetlerin kullanımı tamamen ücretsizdir.</p>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">3. Hesap Güvenliği ve Pasaport Kullanımı</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Kullanıcı, hesabını oluştururken sistem tarafından üretilen <strong>PIN Kodu</strong> ve <strong>Kurtarma Anahtarı </strong> bilgilerini güvenli bir şekilde saklamakla yükümlüdür.</li>
            <li>Oluşturulan Pasaport kişiye özeldir. Bir kullanıcının kendi Pasaportunu başkasına kullandırması, başkası adına bilet alması veya yoklama vermesi (QR kod paylaşımı vb. yollarla) kesinlikle yasaktır.</li>
            <li>Kullanıcı bilgilerinin kaybedilmesi veya üçüncü şahısların eline geçmesi durumunda doğabilecek aksaklıklardan Topluluk sorumlu tutulamaz.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">4. Etkinlik Biletleri ve Yoklama Kuralları</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Etkinlik biletleri stoklarla sınırlıdır. Kullanıcı, katılım sağlayamayacağı etkinlikler için aldığı biletleri sistem üzerinden iptal ederek kontenjanı diğer öğrencilere devretmekle yükümlüdür.</li>
            <li>Sürekli olarak bilet alıp etkinliklere mazeretsiz katılmayan kullanıcıların Pasaportları, sistem tarafından otomatik veya manuel olarak askıya alınabilir veya gelecekteki bilet alımları kısıtlanabilir.</li>
            <li>Etkinliklerde yoklama verilebilmesi için fiziksel katılım şarttır. Otomasyon, bot sistemleri veya sahte QR okutma girişimleri sistemin güvenlik loglarına yansır ve tespiti halinde kullanıcının platform erişimi kalıcı olarak sonlandırılır.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">5. Hizmet Sürekliliği ve Feragatname</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Topluluk, platformun kesintisiz çalışması için azami gayreti gösterir. Ancak sunucu bakımları, siber saldırılar veya elde olmayan teknik arızalar nedeniyle yaşanabilecek veri kayıplarından (bilet kayıpları vb.) veya erişim kesintilerinden sorumlu tutulamaz.</li>
            <li>Topluluk, önceden haber vermeksizin etkinliklerin tarihlerinde, yerlerinde veya kontenjanlarında değişiklik yapma veya etkinlikleri tamamen iptal etme hakkını saklı tutar.</li>
          </ul>

          <h2 className="text-xl font-semibold text-slate-800 mt-8">6. Yürürlük ve Kabul</h2>
          <p>Kullanıcı, kayıt ekranında bu sözleşmeyi onayladığı andan itibaren tüm maddeleri okuduğunu, anladığını ve kurallara uyacağını kabul ve beyan etmiş sayılır. Topluluk, gerekli gördüğü durumlarda bu sözleşme maddelerinde güncelleme yapma hakkını saklı tutar. Güncellemeler platform üzerinden duyurulur.</p>
        </div>
      </div>
    </main>
  );
}