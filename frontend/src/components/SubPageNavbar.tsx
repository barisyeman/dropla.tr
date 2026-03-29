'use client';

import Link from 'next/link';

export default function SubPageNavbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="nav-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
        <span className="nav-title">Drop.tr</span>
      </Link>
      <div className="nav-right">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="nav-device" style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"/></svg>
            <span>Ana Sayfa</span>
          </div>
        </Link>
      </div>
    </nav>
  );
}
