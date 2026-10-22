# Sahaf

Ege kasabalarında seyyar bir kitapçı işlettiğin, sıcak ve sakin bir 2D yönetim oyunu.
Mekanikleri Tiny Bookshop'tan ilham alıyor; çizimler, karakterler, kasabalar ve metinler tamamen bize ait.

## Çalıştırma

```bash
npm install
npm run dev      # http://localhost:8770
npm test         # başsız oyun testleri
npm run sim      # 30 günlük denge simülasyonu
```

iOS için Mac'te `npm run ios` ve ardından `npx cap add ios` (ilk sefer) / `npx cap open ios`. Kurulum Fall'daki düzenle aynı.

## Yapı

- `src/data/` — türler, kasabalar, denge ayarları (sayılar yalnızca burada)
- `src/game/` — DOM'suz oyun mantığı: durum, toptancı ve müşteri kararı, gün döngüsü
- `src/render/` — SVG sahne ve yürüyen müşteriler
- `src/ui/` — üst bilgi, toptancı, harita ve gün sonu panelleri
- `src/core/` — tohumlu RNG, kayıt (localStorage + iOS Preferences yedeği), Capacitor köprüsü

## Gün döngüsü (Faz 0)

Sabah: toptancıdan koli al, istersen haritadan başka kasabaya git (₺6, günde bir kez) → **Dükkânı aç** →
09:00–18:00 arası müşteriler gelir, aradıkları tür raftaysa alır, yoksa eli boş döner →
akşam özeti (satılanlar, aranıp bulunamayanlar, öneri) → ertesi sabah. Oyun sabah ve akşam kaydedilir.

Yol haritası: `docs/yol-haritasi.md`.
