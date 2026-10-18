# KirimDrop — DESIGN.md

Standing direction untuk UI KirimDrop (share.radja.id). Setiap keputusan visual harus bisa trace ke file ini atau rule antislop.

## Identity (satu baris)

Sinyal langsung antar dua perangkat: tool transfer file yang terasa seperti lampu suar, bukan dashboard.

## Design Read

Reading this as: utility P2P file transfer untuk pengguna HP (iPhone ke Xiaomi dsb.), dalam bahasa visual "sinyal/suar" yang hangat dan tenang.

Dial: **ENERGY 2 / RHYTHM 2 / MOTION 2**

- ENERGY 2: rapi dan yakin seperti tool bayaran, bukan hero landing page yang teriak.
- RHYTHM 2: sedikit section, satu momen hero (kartu sambung: QR + kode room), sisanya mendukung.
- MOTION 2: satu animasi bermakna (busur sinyal berdenyut hanya saat menunggu perangkat), progress bar halus, feedback tap. Tidak ada loop tanpa henti setelah peer terhubung.

## Palet (2 inti + 1 aksen, dua tema)

| Token | Dark | Light | Alasan |
|---|---|---|---|
| --bg | #0B0E14 | #F5F4F0 | Netral gelap hangat / kertas hangat, bukan navy default AI |
| --surface | #141926 | #FFFFFF | Satu level di atas bg, pemisah halus |
| --surface2 | #1B2233 | #EFEEE9 | Nested (hover, baris peer), tanpa elevasi bayangan |
| --line | #273042 | #DFDDD5 | Border tipis, kontras cukup buat struktur bukan teks |
| --text | #E9EDF5 | #1A1E28 | Teks utama, 17:1+ di kedua tema |
| --muted | #9AA6BC | #5C6577 | Teks sekunder, lolos 4.5:1 di surface & bg kedua tema |
| --accent | #FFA050 | #FF9E4A | Amber "sinyal/suar"; beda dari default biru-ungu AI (R-01) |
| --accent-text | #FFA050 | #9A4E00 | Amber terang utk teks di dark; amber gelap utk teks di light (R-25) |
| --ok | #3DDC97 | #0E7C4F | Status sukses (fungsional, bukan anggota palet) |
| --err | #FF7A6B | #C2321E | Status gagal (fungsional) |

Alasan aksen amber: membedakan dari keluarga gradien biru-ungu yang jadi default AI (R-01), nyaman di dua tema, dan cocok dengan identitas "sinyal/suar". Dipakai hemat: tombol utama, arc motif, progress fill, fokus.

## Motif identitas (satu)

**Busur sinyal**: lingkaran konsentris amber tipis yang memancar dari QR code. Muncul di satu tempat saja (kartu sambung). Berdenyut pelan hanya saat belum ada perangkat lain (state "menunggu"), diam saat sudah terhubung. Alasan: menghubungkan visual dengan fungsi (mencari perangkat), sekaligus signature visual produk.

## Tipografi

- System font stack (SF Pro / Roboto / Segoe): zero external request, load instan, alasan tercatat di workflow skill.
- Body 16px minimum (iOS Safari auto-zoom di input <16px).
- Kode room: monospace, ukuran besar (clamp 24-30px), alasan fungsional: disambiguasi karakter (0 vs O, 1 vs l) bukan estetika terminal (R-06).
- Tidak ada label uppercase letter-spacing lebar (R-06). Heading section: normal case, 13-14px semibold.

## Radius

20px kartu, 12px kontrol (tombol/input), 8px elemen kecil (bar). Satu pill saja: toast. Alasan: radius sebagai hierarki, bukan semua bulat (R-11).

## Tema

Auto mengikuti `prefers-color-scheme`. Alasan: tool HP yang dipakai berulang; user sudah punya pilihan via setting OS, tanpa noise tombol toggle. Kedua tema diverifikasi penuh (R-34).

## Layout

Satu kolom mobile-first, max-width 640px. Alasan: alurnya linear (sambung → pilih perangkat → kirim → hasil), tidak butuh grid. QR + kode berdampingan di ≥520px, stack di bawahnya. Tap target min 44px, gap antar target. Fokus keyboard terlihat (outline accent, R-32).

## Copy

Bahasa Indonesia santai, spesifik, tanpa buzzword (R-16), tanpa em dash (R-02), tanpa emoji dekoratif di UI (R-04). CTA spesifik: "Salin kode", "Salin link", "Pilih file". Empty state menyebut penyebab + langkah berikutnya (R-27).
