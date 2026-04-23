'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-free-card">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <div>
          <h4>Dropla.tr tamamen ücretsizdir</h4>
          <p>Hiçbir ticari kaygı, reklam veya gizli ücret yoktur. Dropla.tr, dosya paylaşımının herkes için erişilebilir, hızlı ve güvenli olması gerektiğine inanan gönüllüler tarafından geliştirilmektedir.</p>
        </div>
      </div>
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg></div>
            <span className="footer-logo-name">Dropla.tr</span>
          </div>
          <p className="footer-tagline">Sunucusuz, kayıtsız, reklamsız. Dosyanız sadece sizinle alıcı arasında uçtan uca şifreli bir şekilde gider.</p>
          <div className="footer-free-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Tamamen Ücretsiz · Kar Amacı Gütmez
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-links-title">Bağlantılar</div>
          <Link href="/iletisim" className="footer-link">
            <div className="footer-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
            İletişim
          </Link>
          <Link href="/destek" className="footer-link">
            <div className="footer-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
            Projeyi Destekle
          </Link>
          <Link href="/gizlilik-politikasi" className="footer-link">
            <div className="footer-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
            Gizlilik Politikası
          </Link>
          <Link href="/teknik-bilgiler" className="footer-link">
            <div className="footer-link-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
            Teknik Bilgiler
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span>&copy; 2026 Dropla.tr — MIT Lisansı ile lisanslanmıştır.</span>
          <a href="https://github.com/barisyeman/dropla.tr" target="_blank" rel="noopener noreferrer" className="footer-github-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            GitHub'da Görüntüle
          </a>
        </div>
        <span className="footer-bottom-right">Türkiye 🇹🇷</span>
      </div>
    </footer>
  );
}
