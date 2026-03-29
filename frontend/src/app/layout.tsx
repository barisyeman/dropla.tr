import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drop.tr — Ücretsiz Dosya Gönder | Şifreli Dosya Transferi',
  description: 'Dosya gönder, hızlı ve güvenli. Drop.tr ile telefondan bilgisayara veya bilgisayardan telefona ücretsiz dosya transferi yapın. Uçtan uca şifreli, doğrudan cihazdan cihaza.',
  keywords: ['dosya gönder', 'dosya transferi', 'dosya paylaş', 'telefondan bilgisayara dosya gönder', 'bilgisayardan telefona dosya gönder', 'ücretsiz dosya gönder', 'şifreli dosya transferi', 'dosya aktarma', 'online dosya gönder'],
  authors: [{ name: 'Drop.tr' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://www.drop.tr',
    siteName: 'Drop.tr',
    title: 'Drop.tr — Ücretsiz Dosya Gönder | Şifreli Dosya Transferi',
    description: 'Dosya gönder, hızlı ve güvenli. Telefondan bilgisayara, bilgisayardan telefona ücretsiz dosya transferi. Uçtan uca şifreli.',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary',
    title: 'Drop.tr — Ücretsiz Dosya Gönder',
    description: 'Dosya gönder, hızlı ve güvenli. Ücretsiz, uçtan uca şifreli dosya transferi.',
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
                'Ücretsiz dosya gönder. Telefondan bilgisayara, bilgisayardan telefona hızlı ve şifreli dosya transferi.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
              inLanguage: 'tr',
              isAccessibleForFree: true,
              keywords: 'dosya gönder, dosya transferi, dosya paylaş, ücretsiz dosya gönder, şifreli dosya transferi, online dosya gönder',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
