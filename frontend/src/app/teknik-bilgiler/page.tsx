import type { Metadata } from 'next';
import SubPageNavbar from '@/components/SubPageNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Teknik Bilgiler — Drop.tr',
  description: 'Drop.tr teknik altyapısı hakkında bilgi edinin. P2P dosya transferi, şifreleme ve güvenlik.',
};

export default function TeknikPage() {
  return (
    <>
      <SubPageNavbar />
      <div className="sub-page">
        <Link href="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Ana Sayfaya Dön
        </Link>

        <h1 className="page-title">Teknik Bilgiler</h1>
        <p className="page-desc">
          Drop.tr&apos;nin dosya transferi sırasında kullandığı teknolojiler ve güvenlik yaklaşımı hakkında genel bilgiler.
        </p>

        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Nasıl Çalışır?
        </div>

        <div className="card">
          <h3>Eşler Arası (P2P) Bağlantı</h3>
          <p>Drop.tr, dosyaları bir sunucuya yüklemek yerine doğrudan iki cihaz arasında aktarır. Sunucu yalnızca iki cihazın birbirini bulması için aracılık eder — dosya içeriği sunucu üzerinden geçmez. Bağlantı kurulduktan sonra tüm veri akışı doğrudan cihazlar arasında gerçekleşir.</p>
        </div>

        <div className="card">
          <h3>Uçtan Uca Şifreleme</h3>
          <p>Cihazlar arasındaki bağlantı, tarayıcıların sağladığı yerleşik şifreleme protokolleri (DTLS) ile korunmaktadır. Bu sayede transfer sırasında veriler şifrelenir ve üçüncü tarafların erişimi engellenir. Şifreleme anahtarları yalnızca bağlanan iki cihaz arasında paylaşılır.</p>
        </div>

        <div className="card">
          <h3>Bağlantı Kurulumu</h3>
          <p>İki cihaz arasındaki doğrudan bağlantı, tarayıcıların WebRTC teknolojisi aracılığıyla kurulur. NAT ve güvenlik duvarı arkasındaki cihazların birbirini bulabilmesi için STUN sunucuları kullanılır. Bu sunucular yalnızca bağlantı adresi keşfi için çalışır; veri iletiminde rol almaz.</p>
        </div>

        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Güvenlik Özellikleri
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="ic-label">Transfer Yöntemi</div>
            <div className="ic-value">Doğrudan P2P</div>
          </div>
          <div className="info-card">
            <div className="ic-label">Şifreleme</div>
            <div className="ic-value">DTLS (Uçtan Uca)</div>
          </div>
          <div className="info-card">
            <div className="ic-label">Sunucu Depolama</div>
            <div className="ic-value">Yok — Sıfır Veri</div>
          </div>
          <div className="info-card">
            <div className="ic-label">Kayıt Gereksinimi</div>
            <div className="ic-value">Yok</div>
          </div>
        </div>

        <div className="card">
          <h3>Dosya Güvenliği</h3>
          <p>Potansiyel olarak zararlı dosya uzantıları (çalıştırılabilir dosyalar, betik dosyaları vb.) sistem tarafından otomatik olarak engellenir. Bu kontrol hem gönderen hem de alıcı tarafında uygulanarak güvenlik katmanlı olarak sağlanır.</p>
        </div>

        <div className="card">
          <h3>Oda Sistemi</h3>
          <p>Her dosya paylaşımı için benzersiz bir oda oluşturulur. Oda bağlantısını yalnızca paylaştığınız kişiler bilir. Tüm kullanıcılar bağlantıyı kestiğinde oda otomatik olarak silinir ve geride hiçbir iz kalmaz.</p>
        </div>

        <div className="section-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Performans
        </div>

        <div className="card">
          <h3>Hız ve Verimlilik</h3>
          <p>Dosyalar doğrudan cihazlar arasında aktarıldığı için transfer hızı, sunucu hızıyla değil cihazlar arasındaki ağ bağlantısıyla belirlenir. Aynı yerel ağdaki cihazlar arasında çok yüksek hızlara ulaşılabilir. Sistem, büyük dosyaları parçalara ayırarak aktarır ve akış kontrolü uygulayarak bağlantının kararlılığını korur.</p>
        </div>

        <div className="card">
          <h3>Yerel Ağ Keşfi</h3>
          <p>Aynı ağa bağlı cihazlar otomatik olarak keşfedilir. Bu sayede link paylaşmaya gerek kalmadan yakındaki cihazlarla hızlıca dosya paylaşabilirsiniz.</p>
        </div>

        <div className="highlight-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p><strong>Uyumluluk:</strong> Drop.tr, WebRTC destekleyen tüm modern tarayıcılarda çalışır. Chrome, Firefox, Safari ve Edge&apos;in güncel sürümleri tam olarak desteklenmektedir. Uygulama kurulumu gerekmez.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
