# Drop.tr

Ücretsiz, güvenli ve kayıtsız dosya paylaşım platformu. Dosyalar doğrudan cihazdan cihaza aktarılır — hiçbir sunucuya yüklenmez.

🔗 **[www.drop.tr](https://www.dropla.tr)**

---

## Özellikler

- **P2P Transfer** — Dosyalar sunucuya yüklenmez, doğrudan cihazlar arasında gider
- **Uçtan Uca Şifreleme** — WebRTC DTLS ile tüm transferler şifrelenir
- **Kayıt Yok** — Hesap oluşturma, e-posta veya kişisel bilgi gerekmez
- **Yerel Ağ Keşfi** — Aynı ağdaki cihazlar otomatik olarak bulunur
- **Dosya Güvenliği** — Zararlı dosya uzantıları otomatik engellenir
- **Sıfır Veri** — Çerez yok, analitik yok, log yok

## Proje Yapısı

```
dropla.tr/
├── backend/          # Express + Socket.IO sunucusu
│   ├── server.js     # Sinyal sunucusu ve oda yönetimi
│   └── package.json
│
└── frontend/         # Next.js 15 uygulaması
    ├── src/
    │   ├── app/      # Sayfalar (Ana sayfa, İletişim, Gizlilik, Teknik, Destek)
    │   └── components/
    └── package.json
```

## Kurulum

### Gereksinimler

- Node.js 18+

### Backend

```bash
cd backend
npm install
npm start
# http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Ortam Değişkenleri

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

**Backend** (opsiyonel):
```
PORT=3001
CORS_ORIGIN=*
```

## Production

- **Frontend**: Vercel üzerinde deploy edilir (`frontend/` root directory)
- **Backend**: VPS üzerinde çalışır (PM2 + Nginx)

| Servis | Domain |
|--------|--------|
| Frontend | `www.dropla.tr` |
| Backend (Socket.IO) | `wss.dropla.tr` |

## Teknolojiler

| | |
|---|---|
| **Frontend** | Next.js 15, React 19, TypeScript, Socket.IO Client |
| **Backend** | Node.js, Express, Socket.IO |
| **Transfer** | WebRTC DataChannel |
| **Şifreleme** | DTLS (tarayıcı yerleşik) |

## Lisans
MIT
