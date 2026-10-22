# Yol haritası

Hedef: Tiny Bookshop'un oyun düzeni, şehirler arası gezi, aynı sıcaklıkta 2D görüntü. iPhone/iPad (yatay), Capacitor.

## Faz 0 — oynanabilir döngü ✅
- Sabah: toptancı (6 tür, 5'lik koliler, 30 kitaplık raf), harita ile 4 kasaba (Ayvalık, Cunda, Foça, Alaçatı)
- Gün: saat, hızlandırma, kasabanın zevkine göre müşteriler, raflar satıldıkça boşalır
- Akşam: özet, kaçan talep, ipucu; sabah/akşam kaydı; iflas koruması
- Testler (`npm test`) ve denge simülasyonu (`npm run sim`)

## Faz 1 — derinlik
- Öneri oyunu: bazı müşteriler tarif verir ("denizi anlatan, hüzünlü bir şey"), oyuncu raftan gerçek kitap seçer
- Kitap verisi: tür içinde başlık + etiketler (konu, ruh hali); satış fiyatı kitaba göre
- Süs eşyaları ve etkileri (bitki → şiir okuru artar, fener → akşam müşterisi vb.)
- Para harcanacak yer: raf kapasitesi yükseltmesi, karavan boyası, yeni mekânlar
- Kasaba içinde 2–3 mekân (iskele, pazar, kale önü), her biri farklı kalabalık
- Not: simülasyonda her gün gezmek tek kasabada kalmaktan biraz kötü; yolculuğun ödülü (yeni müşteri, etkinlik) Faz 1'de artırılmalı

## Faz 2 — dünya
- İsimli karakterler ve dostluk, kasabaların hikâyesi, sabah gazetesi ve etkinlik takvimi (atlanabilir)
- Mevsim görünümleri, pul koleksiyonu, keşif

## Faz 3 — içerik ve cila
- Elle çizilmiş illüstrasyonlar (kod çizimlerinin yerine), müzik ve ses, Türkçe + İngilizce, 200+ kitap

## Faz 4 — yayın
- "İlk günler ücretsiz, tam oyun tek seferlik" satın alma — mağazada baştan açıkça yazılacak
- TestFlight, mağaza görselleri, inceleme
