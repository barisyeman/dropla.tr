import type { Metadata } from 'next';
import SubPageNavbar from '@/components/SubPageNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası — Dropla.tr',
  description: 'Dropla.tr gizlilik politikası. Hiçbir veri toplanmaz, saklanmaz veya üçüncü taraflarla paylaşılmaz.',
};

export default function GizlilikPage() {
  return (
    <>
      <SubPageNavbar />
      <div className="sub-page">
        <Link href="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Ana Sayfaya Dön
        </Link>

        <h1 className="page-title">Gizlilik Politikası</h1>
        <p className="page-desc">
          Dropla.tr, gizliliğinizi en üst düzeyde korumak amacıyla tasarlanmıştır. Bu sayfa, verilerinizin nasıl işlendiğini (veya işlenmediğini) açıklamaktadır.
        </p>

        <div className="highlight-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <p><strong>Özet:</strong> Dropla.tr hiçbir kişisel veri toplamaz, saklamaz, satmaz veya üçüncü taraflarla paylaşmaz. Dosyalarınız sunucularımıza asla yüklenmez.</p>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Toplanan Veriler
          </h3>
          <p>Dropla.tr <strong>hiçbir kişisel veri toplamaz.</strong> Detaylı olarak:</p>
          <ul>
            <li>Hesap oluşturma veya kayıt işlemi yoktur</li>
            <li>E-posta, isim, telefon veya kimlik bilgisi istenmez</li>
            <li>Kullanıcı davranışları izlenmez ve analitik araçları kullanılmaz</li>
            <li>IP adresleri yalnızca bağlantı sırasında geçici olarak kullanılır, hiçbir yere kaydedilmez</li>
            <li>Dosya adları, içerikleri veya boyutları sunucuda tutulmaz</li>
          </ul>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            Çerezler (Cookies)
          </h3>
          <p>Dropla.tr <strong>hiçbir çerez kullanmaz.</strong> Ne birinci taraf ne de üçüncü taraf çerezleri oluşturulmaktadır. Tarayıcınızda Dropla.tr&apos;ye ait herhangi bir çerez bulunmayacaktır.</p>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Dosya Transferi
          </h3>
          <p>Gönderdiğiniz dosyalar:</p>
          <ul>
            <li>Sunucumuza asla yüklenmez — doğrudan cihazdan cihaza aktarılır</li>
            <li>Transfer sırasında uçtan uca şifrelenir</li>
            <li>Sunucuda hiçbir dosya kaydı, geçmişi veya logu tutulmaz</li>
            <li>Transfer tamamlandığında bağlantı kapanır ve tüm geçici bilgiler silinir</li>
          </ul>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
            Yerel Depolama
          </h3>
          <p>Dropla.tr, tarayıcınızın yerel depolama alanını (localStorage, sessionStorage veya IndexedDB) <strong>kullanmaz.</strong> Sayfayı kapattığınızda cihazınızda Dropla.tr&apos;ye ait hiçbir veri kalmaz.</p>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Üçüncü Taraf Hizmetleri
          </h3>
          <p>Dropla.tr, Google Fonts dışında herhangi bir üçüncü taraf servisi kullanmaz. Reklam ağları, analitik araçları veya izleme pikselleri bulunmamaktadır.</p>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Güvenlik
          </h3>
          <p>Dosya transferleri, tarayıcıların yerleşik güvenlik protokolleri ile şifrelenmektedir. Sunucu yalnızca iki cihaz arasındaki bağlantıyı kurar; dosya içeriğine hiçbir şekilde erişimi yoktur.</p>
        </div>

        <div className="policy-section">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Değişiklikler
          </h3>
          <p>Bu gizlilik politikası güncellenebilir. Değişiklikler bu sayfada yayınlanacaktır. Son güncelleme: Mart 2026.</p>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <p>Sorularınız için bize ulaşabilirsiniz:</p>
          <a href="mailto:info@dropla.tr" className="mail-link" style={{ marginTop: 12, display: 'inline-flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            info@dropla.tr
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
}
