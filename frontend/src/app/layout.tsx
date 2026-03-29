import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drop.tr — Ücretsiz Uçtan Uca Dosya Gönderimi',
  description: 'Drop.tr ile cihazlar arasında ücretsiz, şifreli ve doğrudan dosya gönderin. Uçtan uca P2P dosya transferi — hızlı, güvenli, kayıt gerektirmez.',
  keywords: ['dosya gönder', 'dosya transferi', 'dosya paylaş', 'p2p dosya gönderimi', 'ücretsiz dosya transferi', 'uçtan uca şifreli dosya gönderimi', 'cihazlar arası dosya aktarımı', 'drop.tr'],
  authors: [{ name: 'Drop.tr' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://www.drop.tr',
    siteName: 'Drop.tr',
    title: 'Drop.tr — Ücretsiz Uçtan Uca Dosya Gönderimi',
    description: 'Cihazlar arasında ücretsiz, şifreli ve doğrudan dosya gönderin. P2P uçtan uca dosya transferi.',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary',
    title: 'Drop.tr — Ücretsiz Uçtan Uca Dosya Gönderimi',
    description: 'Cihazlar arasında ücretsiz, şifreli ve doğrudan dosya gönderin. P2P uçtan uca dosya transferi.',
    site: '@droptrapp',
  },
  other: {
    'theme-color': '#007aff',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="canonical" href="https://www.drop.tr" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Drop.tr',
              url: 'https://www.drop.tr',
              description:
                'Cihazlar arasında ücretsiz, şifreli ve doğrudan dosya gönderin. Uçtan uca P2P dosya transferi.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
              inLanguage: 'tr',
              isAccessibleForFree: true,
              keywords: 'dosya gönder, dosya transferi, p2p dosya gönderimi, ücretsiz dosya transferi, uçtan uca şifreli dosya',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
