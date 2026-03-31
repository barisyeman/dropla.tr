import type { Metadata } from 'next';
import SubPageNavbar from '@/components/SubPageNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'İletişim — Dropla.tr',
  description: 'Dropla.tr ile iletişime geçin.',
};

export default function IletisimPage() {
  return (
    <>
      <SubPageNavbar />
      <div className="sub-page">
        <Link href="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Ana Sayfaya Dön
        </Link>

        <h1 className="page-title">İletişim</h1>
        <p className="page-desc">
          Dropla.tr ile ilgili soru, öneri veya geri bildirimleriniz için bize ulaşabilirsiniz.
        </p>

        <div className="card">
          <div className="card-icon" style={{ background: 'linear-gradient(145deg, rgba(0,122,255,.12), rgba(90,200,250,.12))' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h3>E-posta</h3>
          <p>Bize her konuda e-posta ile ulaşabilirsiniz. En kısa sürede dönüş yapılacaktır.</p>
          <a href="mailto:info@dropla.tr" className="mail-link" style={{ marginTop: 16, display: 'inline-flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            info@dropla.tr
          </a>
        </div>

        <div className="highlight-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p><strong>Not:</strong> Dropla.tr gönüllüler tarafından geliştirilen, kar amacı gütmeyen bir projedir. Yanıt süreleri değişkenlik gösterebilir.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
