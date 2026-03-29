import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drop.tr — Ücretsiz & Güvenli Dosya Paylaşımı | Kayıtsız, Sunucusuz',
  description: 'Drop.tr ile dosyalarınızı anında, ücretsiz ve güvenli şekilde paylaşın. Kayıt gerekmez, sunucuya yüklenmez — dosya doğrudan cihazdan cihaza gider. Tamamen ücretsiz, reklamsız.',
  authors: [{ name: 'Drop.tr' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://www.drop.tr',
    siteName: 'Drop.tr',
    title: 'Drop.tr — Ücretsiz & Güvenli Dosya Paylaşımı',
    description: 'Kayıt yok, sunucu yok, reklam yok. Dosyanız doğrudan cihazdan cihaza gider. Tamamen ücretsiz, kar amacı gütmez.',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary',
    title: 'Drop.tr — Ücretsiz & Güvenli Dosya Paylaşımı',
    description: 'Kayıt yok, sunucu yok, reklam yok. Dosyanız doğrudan cihazdan cihaza gider. Tamamen ücretsiz.',
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
                'Ücretsiz, güvenli ve kayıtsız dosya paylaşımı. Dosyalar doğrudan cihazdan cihaza aktarılır, hiçbir sunucuya yüklenmez.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
              inLanguage: 'tr',
              isAccessibleForFree: true,
              keywords: 'dosya paylaşımı, güvenli transfer, p2p, ücretsiz',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
