# Yol haritası

Hedef: Tiny Bookshop'un oyun düzeni, şehirler arası gezi, aynı sıcaklıkta 2D görüntü. iPhone/iPad (yatay), Capacitor.

## Faz 0 — oynanabilir döngü ✅
- Sabah: toptancı (6 tür, 5'lik koliler, 30 kitaplık raf), harita ile 4 kasaba (Ayvalık, Cunda, Foça, Alaçatı)
- Gün: saat, hızlandırma, kasabanın zevkine göre müşteriler, raflar satıldıkça boşalır
- Akşam: özet, kaçan talep, ipucu; sabah/akşam kaydı; iflas koruması
- Testler (`npm test`) ve denge simülasyonu (`npm run sim`)

## Faz 1 — derinlik ✅ (ilk tur)
- Öneri oyunu: müşterilerin %20'si tarif verir ("Gizemli ve kısa bir şey arıyorum"), oyuncu raftan gerçek kitap seçer;
  tam isabet = fiyat + ₺5 bahşiş, kısmen = + ₺1, uymayan kitabı almaz. Beklerken saat durmaz, panel açıkken durur.
- 60 gerçek kitap (türde 10), 19 etiket; raf artık kitap kitap tutuluyor (kayıt v1 → v2 göçü)
- İsteklerin %60'ı raftaki bir kitaptan doğar: çeşitli raf ödüllendirilir
- Süsler: çatı / masa / kaldırım yuvaları, 12 eşya (tür talebi, ziyaretçi, bahşiş, sabır etkileri)
- Atölye: raf 30 → 40 → 50; karavan boyası (5 renk)
- Yolculuk ödülü: yeni gelinen kasabada +5 ziyaretçi; simülasyonda her gün gezmek artık biraz kârlı

Sırada (Faz 1, ikinci tur):
- Kasaba içinde 2–3 mekân (iskele, pazar, kale önü), her biri farklı kalabalık
- Müdavim müşteriler: aynı kişi tekrar gelir, zevkini hatırlar
- Kitap listesini büyütmek (türde 20+), etiketleri dengelemek

## Faz 2 — dünya
- İsimli karakterler ve dostluk, kasabaların hikâyesi, sabah gazetesi ve etkinlik takvimi (atlanabilir)
- Mevsim görünümleri, pul koleksiyonu, keşif

## Faz 3 — içerik ve cila
- Elle çizilmiş illüstrasyonlar (kod çizimlerinin yerine), müzik ve ses, Türkçe + İngilizce, 200+ kitap

## Faz 4 — yayın
- "İlk günler ücretsiz, tam oyun tek seferlik" satın alma — mağazada baştan açıkça yazılacak
- TestFlight, mağaza görselleri, inceleme
