import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dropla.tr — Ücretsiz Uçtan Uca Şifreli Dosya Gönderimi',
  description: 'Dropla.tr ile dosyalarınızı cihazlar arasında anında gönderin. Dosyalar herhangi bir sunucuya yüklenmez, doğrudan karşı cihaza uçtan uca şifreli olarak iletilir. Telefon, tablet ve bilgisayar arasında çalışır.',
  authors: [{ name: 'Dropla.tr' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://www.dropla.tr',
    siteName: 'Dropla.tr',
    title: 'Dropla.tr — Ücretsiz Uçtan Uca Şifreli Dosya Gönderimi',
    description: 'Dosyalarınızı cihazlar arasında anında gönderin. Sunucuya yüklenmez, doğrudan karşı cihaza uçtan uca şifreli olarak iletilir.',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary',
    title: 'Dropla.tr — Ücretsiz Uçtan Uca Şifreli Dosya Gönderimi',
    description: 'Dosyalarınızı cihazlar arasında anında gönderin. Sunucuya yüklenmez, doğrudan karşı cihaza uçtan uca şifreli olarak iletilir.',
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
        <link rel="canonical" href="https://www.dropla.tr" />
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
              name: 'Dropla.tr',
              url: 'https://www.dropla.tr',
              description:
                'Dosyalarınızı cihazlar arasında anında gönderin. Sunucuya yüklenmez, uçtan uca şifreli olarak iletilir.',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'TRY' },
              inLanguage: 'tr',
              isAccessibleForFree: true,
              keywords: 'dosya gönder, dosya transferi, ücretsiz dosya gönderimi, uçtan uca şifreli dosya',
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
