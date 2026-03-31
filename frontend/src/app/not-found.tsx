'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubPageNavbar from '@/components/SubPageNavbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  const router = useRouter();
  const [count, setCount] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(interval);
          router.push('/');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <>
      <SubPageNavbar />
      <div className="sub-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, color: 'var(--blue)', marginBottom: 8 }}>404</div>
        <h1 className="page-title" style={{ marginBottom: 12 }}>Sayfa Bulunamadı</h1>
        <p className="page-desc" style={{ maxWidth: 360, margin: '0 auto 32px' }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.<br />
          <span style={{ fontSize: 13, color: 'var(--g6)' }}>{count} saniye sonra ana sayfaya yönlendirileceksiniz.</span>
        </p>
        <Link href="/" className="mail-link" style={{ display: 'inline-flex' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><polyline points="15 18 9 12 15 6"/></svg>
          Ana Sayfaya Dön
        </Link>
      </div>
      <Footer />
    </>
  );
}
