# KirimDrop

Kirim file langsung antar perangkat lewat browser. Seperti AirDrop, tapi lintas platform (iPhone, Android, Windows, macOS, Linux) tanpa install aplikasi.

## Fitur

- Transfer P2P via WebRTC DataChannel, berkas tidak melewati server
- Room berbasis kode + QR code untuk menyandingkan perangkat
- Multi-file dengan progress bar dan indikator kecepatan
- Pesan teks dua arah (chat terpisah dari daftar file)
- Tombol putus koneksi per perangkat
- Dark/light mode mengikuti pengaturan sistem
- Tanpa akun, tanpa database, tanpa pelacakan

## Stack

- Node.js + [`ws`](https://www.npmjs.com/package/ws) untuk signaling WebSocket (`/ws`)
- WebRTC DataChannel untuk transfer P2P
- Frontend vanilla satu file (`public/index.html`)
- `public/qrcode.min.js` dari paket [qrcode-generator](https://www.npmjs.com/package/qrcode-generator) (MIT)
- `DESIGN.md` berisi arah desain UI (palet, motif, dial)

## Menjalankan lokal

```bash
npm install --omit=dev
PORT=3777 HOST=127.0.0.1 node server.js
# buka http://localhost:3777
```

## Deploy produksi (systemd + nginx + TLS)

Unit systemd (`/etc/systemd/system/kirimdrop.service`):

```ini
[Unit]
Description=KirimDrop, P2P file share web app
After=network.target

[Service]
Type=simple
User=openclaw-user
WorkingDirectory=/path/ke/kirimdrop
ExecStart=/usr/bin/node server.js
Environment=PORT=3777
Environment=HOST=127.0.0.1
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Vhost nginx (intinya: proxy + WebSocket upgrade di `/ws`):

```nginx
server {
    listen 443 ssl http2;
    server_name share.example.com;

    ssl_certificate     /etc/letsencrypt/live/share.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/share.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3777;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        proxy_buffering off;
    }
}
```

Sertifikat via `certbot certonly --webroot -w /tmp/acme-challenge -d share.example.com`.

## Test signaling

```bash
node ws-test.js                          # lokal
WS_URL=wss://host/ws node ws-test.js     # lewat nginx
```

Enam assertion: join, roster, notifikasi peer join, relay sinyal dua arah, dan peer leave.
