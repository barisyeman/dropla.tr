'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SubPageNavbar() {
  useEffect(() => {
    const sunIcon = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
    const moonIcon = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';

    function applyDark(dark: boolean) {
      document.documentElement.classList.toggle('dark', dark);
      const icon = document.getElementById('darkIcon');
      if (icon) icon.innerHTML = dark ? sunIcon : moonIcon;
    }

    const stored = localStorage.getItem('dark');
    const savedDark = stored === '1' || (stored === null && window.matchMedia('(prefers-color-scheme:dark)').matches);
    applyDark(savedDark);

    (window as any).__toggleDark = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const next = !isDark;
      localStorage.setItem('dark', next ? '1' : '0');
      applyDark(next);
    };
  }, []);

  return (
    <nav className="navbar">
      <Link href="/" className="nav-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="nav-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
        <span className="nav-title">Dropla.tr</span>
      </Link>
      <div className="nav-right">
        <button className="dark-toggle" id="darkToggle" onClick={() => (window as any).__toggleDark()} aria-label="Karanlık mod">
          <svg id="darkIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></svg>
        </button>
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
