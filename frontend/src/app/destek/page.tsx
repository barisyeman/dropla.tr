import type { Metadata } from 'next';
import SubPageNavbar from '@/components/SubPageNavbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projeyi Destekle — Dropla.tr',
  description: 'Dropla.tr projesini destekleyin. Tamamen ücretsiz ve kar amacı gütmeyen bu projeye katkıda bulunun.',
};

export default function DestekPage() {
  return (
    <>
      <SubPageNavbar />
      <div className="sub-page">
        <Link href="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Ana Sayfaya Dön
        </Link>

        <h1 className="page-title">Projeyi Destekle</h1>
        <p className="page-desc">
          Dropla.tr tamamen ücretsiz ve kar amacı gütmeyen bir projedir. Projeye destek olmanın birçok yolu var.
        </p>

        <div className="card">
          <div className="card-icon" style={{ background: 'linear-gradient(145deg, rgba(255,149,0,.12), rgba(255,103,35,.12))' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--orange)' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h3>Paylaşarak Destekle</h3>
          <p>Dropla.tr&apos;yi arkadaşlarınıza ve çevrenize tanıtın. Daha fazla kişinin güvenli dosya paylaşımına erişmesini sağlayın. Projenin büyümesi için en değerli katkı budur.</p>
        </div>

        <div className="card">
          <div className="card-icon" style={{ background: 'linear-gradient(145deg, rgba(52,199,89,.12), rgba(48,209,88,.12))' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <h3>Geri Bildirim Gönder</h3>
          <p>Kullanım sırasında karşılaştığınız sorunları veya önerilerinizi <a href="mailto:info@dropla.tr">info@dropla.tr</a> adresine iletebilirsiniz. Her geri bildirim projeyi daha iyi hale getirmemize yardımcı olur.</p>
        </div>

        <div className="card">
          <div className="card-icon" style={{ background: 'linear-gradient(145deg, rgba(0,122,255,.12), rgba(90,200,250,.12))' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--blue)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
          <h3>Sunucu Desteği</h3>
          <p>Dropla.tr&apos;nin daha hızlı ve stabil çalışması için sunucu kaynaklarına ihtiyaç duyulmaktadır. Sunucu sponsorluğu için <a href="mailto:info@dropla.tr">info@dropla.tr</a> adresiyle iletişime geçebilirsiniz.</p>
        </div>

        <div className="highlight-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <p><strong>Teşekkürler!</strong> Dropla.tr&apos;yi kullanan ve paylaşan herkes bu projenin bir parçasıdır.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
