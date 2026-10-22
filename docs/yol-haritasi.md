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

### Faz 1 — ikinci tur ✅
- Kasaba içi mekânlar (9): iskele, çarşı, liman, ada tepesi, kale önü, kayalıklar, değirmenler, plaj; her biri kendi
  kalabalığı, öneri sıklığı, tür zevki ve istek konularıyla. Üç sahne tipi: sahil (kum, iskele, şemsiye), çarşı
  (tezgâhlar, flamalar), tepe (Foça'da kale, Alaçatı'da yel değirmenleri, Cunda'da şapel)
- Müdavimler (8, kasaba başına 2): sabit görünüş ve kişilik, 💌 balonuyla gelir, zevkine göre öneri ister;
  tam isabet = 1 kalp, 3 kalpte ek bahşiş, 5 kalpte hediye (4 özel süs ya da ₺40 ve bir not)
- Kitaplar 120'ye çıktı (türde 20)
- Geliştirme: `?sahne=foca/kale&panel=spot|decor|gift|rec&kim=hasan&susler=...` önizleme parametreleri (yalnız dev)

### Faz 2 başlangıcı ✅
- Sabah gazetesi (Ege Postası): günün havası, bugünün ve yarının etkinliği, kasabadan haber; her sabah açılır,
  üstteki konum hapına dokununca tekrar açılır
- Hava (güneşli / bulutlu / yağmurlu / rüzgârlı): kalabalığı ve öneri isteğini değiştirir; yağmur ve rüzgâr sahnede görünür
- Etkinlikler (Zeytinyağı Festivali, Ada Resim Sergisi, Fok Gözlem Günü, Ot Festivali): günlerin ~%35'inde bir kasabada;
  kalabalık ×1.4–1.6, festival balonları. Atlanabilir: gitmezsen ceza yok, simülasyonda festivali kovalamak en kârlısı
- Müdavim hikâyeleri: her kalpte yeni bir konuşma (8 × 5 satır)

### Faz 2 — ana hikâye ve mevsimler ✅
- Ana hikâye "Kostas Efendi'nin kayıp kütüphanesi": 8 defter sayfası, sırayla açılır (dört kasaba, 10 tam isabet,
  3 kalp, festival, 150 satış, en büyük raf, Cunda tepesinde final). İlk sayfa (teyzenin mektubu) oyun başında açılır.
  Final ödülü: Kostas'ın feneri (çatı süsü) + ₺150. 📜 Defter panelinde sayfalar, sıradaki ipucu ve ilerleme (x/y)
- Mevsimler (7 gün): yaz kalabalık, kış sakin ama sohbet bol; yağmur kışın 9 kat sık. Ağaç rengi, ilkbaharda
  çiçek, sonbaharda yaprak düşer, kışın serin ton. Gazetede mevsim notu

### Ses ve müzik ✅
- Hiç ses dosyası yok: Web Audio ile üretiliyor (src/audio). Müzik: mevsime göre akor ve tempo değişen, gitar
  tıngırtısı + bas + yumuşak pad + ara sıra çan melodisi (compose.js saf ve test edilebilir)
- Efektler: düğme, kasa, kalp, üzgün, sayfa, koli, zil, yolculuk; yağmurlu günlerde yağmur sesi
- ⚙️ Ayarlar: müzik ve efektler ayrı ayrı, "Baştan başla" (iki adımlı onay); ayarlar kayıtla birlikte saklanır

### Pul albümü ve kapanış ✅
- 18 pul (başarım): satış, isabet, gezi, dokuz mekân, festival türleri, yağmur, dostluk, hediyeler, süsler, raflar,
  boyalar, kasa, bir yıl, hikâye; her biri ₺15. Defter panelinde "Pul albümü" sekmesi, kalanların ilerlemesiyle
- Gün sonu özetinde ve sabah alışverişlerinden sonra yeni pul bildirimi
- Hikâye bitince kapanış ekranı (istatistikler, en yakın dost), sonra oyun sürüyor

## Sahaf 2.0 (plan: tekrar etmeyen, şaşırtan içerik)
### Faz A — çeşitlilik çekirdeği ✅
- 240 kitap (türde 40), her etiket en az 12 kitapta; her etiketin 3 söyleyişi
- 11 müşteri tipi (öğrenci, emekli öğretmen, balıkçı, turist, anne, çocuk, genç âşık, yazar adayı, koleksiyoncu,
  yaşlı teyze, sörfçü): kendi zevki, üslubu, görünüşü, ismi; mekâna ve mevsime göre gelme ağırlığı
- İstek dilbilgisi: selam + bağlam (tip, hava, mevsim, mekân) + istek + kapanış; 1000+ istekte %85+ benzersiz
- Tekrar bekçisi (game/memory.js): son 40 cümle, 20 hedef kitap, 4 müşteri tipi penceresi
- İlk baskılar: kolide %5, rafta altın sırt; normal müşteriye satılmaz, koleksiyoncu 5 katına alır; 2 yeni pul
### Faz B — sürprizler ✅
- 30 gün içi olay (kedi rafı devirir, martı kitap kapar, yazar uğrar, eskici, film ekibi, rakip sahaf…): koşullu
  (mekân, mevsim, hava, gün, festival), seçimli, bazıları şanslı; 6 gün bekleme, bir kerelikler; günde ~0.7 olay
- Mektuplar: tam isabetli öneriler 5+ gün sonra mektupla döner (44 şablon, kitabın etiketine göre); bazen para
- İlanlar: 10 tür çok günlü görev (belirli kitap / etiketli n kitap / türden n kitap, kasabada ya da her yerde)
- Özel günler: 23 Nisan, Hıdırellez, Kitap Fuarı (ilk baskı ×3), Okullar açıldı, Yılbaşı
- Defterde Mektuplar sekmesi; gazetede mektup, ilan, özel gün; gün sonunda yaşananlar ve ilan sonucu; 4 yeni pul
### Faz D — görsel ve ses cilası ✅
- Gün ışığı: sabah pembe, öğleden sonra altın, akşam mor; akşamüstü pencereler sarı yanar, ışık zinciri parlar
- Canlı arka plan (render/ambient.js): martılar, ufukta geçen tekneler, ilkbahar/yaz kelebekleri
- Oyun hissi: satışta para kasaya uçar, pul/hediye/sayfa/ilan teslimde konfeti, defter sayfası çevrilir
- Müzik: her kasabanın 4 notalık motifi, festival/özel günde daha canlı, akşamüstü yumuşak; mektup ve olay jingleları
- Sıradaki: Faz C (yeni kasabalar, müdavimler, 2. bölüm, karavan büyümesi)

## Faz 2 başlangıcı ✅
- Sabah gazetesi (Ege Postası): günün havası, bugünün ve yarının etkinliği, kasabadan haber; her sabah açılır,
  üstteki konum hapına dokununca tekrar açılır
- Hava (güneşli / bulutlu / yağmurlu / rüzgârlı): kalabalığı ve öneri isteğini değiştirir; yağmur ve rüzgâr sahnede görünür
- Etkinlikler (Zeytinyağı Festivali, Ada Resim Sergisi, Fok Gözlem Günü, Ot Festivali): günlerin ~%35'inde bir kasabada;
  kalabalık ×1.4–1.6, festival balonları. Atlanabilir: gitmezsen ceza yok, simülasyonda festivali kovalamak en kârlısı
- Müdavim hikâyeleri: her kalpte yeni bir konuşma (8 × 5 satır)

### Faz 2 — ana hikâye ve mevsimler ✅
- Ana hikâye "Kostas Efendi'nin kayıp kütüphanesi": 8 defter sayfası, sırayla açılır (dört kasaba, 10 tam isabet,
  3 kalp, festival, 150 satış, en büyük raf, Cunda tepesinde final). İlk sayfa (teyzenin mektubu) oyun başında açılır.
  Final ödülü: Kostas'ın feneri (çatı süsü) + ₺150. 📜 Defter panelinde sayfalar, sıradaki ipucu ve ilerleme (x/y)
- Mevsimler (7 gün): yaz kalabalık, kış sakin ama sohbet bol; yağmur kışın 9 kat sık. Ağaç rengi, ilkbaharda
  çiçek, sonbaharda yaprak düşer, kışın serin ton. Gazetede mevsim notu

### Ses ve müzik ✅
- Hiç ses dosyası yok: Web Audio ile üretiliyor (src/audio). Müzik: mevsime göre akor ve tempo değişen, gitar
  tıngırtısı + bas + yumuşak pad + ara sıra çan melodisi (compose.js saf ve test edilebilir)
- Efektler: düğme, kasa, kalp, üzgün, sayfa, koli, zil, yolculuk; yağmurlu günlerde yağmur sesi
- ⚙️ Ayarlar: müzik ve efektler ayrı ayrı, "Baştan başla" (iki adımlı onay); ayarlar kayıtla birlikte saklanır

### Pul albümü ve kapanış ✅
- 18 pul (başarım): satış, isabet, gezi, dokuz mekân, festival türleri, yağmur, dostluk, hediyeler, süsler, raflar,
  boyalar, kasa, bir yıl, hikâye; her biri ₺15. Defter panelinde "Pul albümü" sekmesi, kalanların ilerlemesiyle
- Gün sonu özetinde ve sabah alışverişlerinden sonra yeni pul bildirimi
- Hikâye bitince kapanış ekranı (istatistikler, en yakın dost), sonra oyun sürüyor

Sırada:
- Telefonda geri bildirime göre dokunma ve yazı boyutu ayarları
- İngilizce dil desteği, iOS paketleme (Mac'te)

## Faz 2 başlangıcı ✅
- Sabah gazetesi (Ege Postası): günün havası, bugünün ve yarının etkinliği, kasabadan haber; her sabah açılır,
  üstteki konum hapına dokununca tekrar açılır
- Hava (güneşli / bulutlu / yağmurlu / rüzgârlı): kalabalığı ve öneri isteğini değiştirir; yağmur ve rüzgâr sahnede görünür
- Etkinlikler (Zeytinyağı Festivali, Ada Resim Sergisi, Fok Gözlem Günü, Ot Festivali): günlerin ~%35'inde bir kasabada;
  kalabalık ×1.4–1.6, festival balonları. Atlanabilir: gitmezsen ceza yok, simülasyonda festivali kovalamak en kârlısı
- Müdavim hikâyeleri: her kalpte yeni bir konuşma (8 × 5 satır)

### Faz 2 — ana hikâye ve mevsimler ✅
- Ana hikâye "Kostas Efendi'nin kayıp kütüphanesi": 8 defter sayfası, sırayla açılır (dört kasaba, 10 tam isabet,
  3 kalp, festival, 150 satış, en büyük raf, Cunda tepesinde final). İlk sayfa (teyzenin mektubu) oyun başında açılır.
  Final ödülü: Kostas'ın feneri (çatı süsü) + ₺150. 📜 Defter panelinde sayfalar, sıradaki ipucu ve ilerleme (x/y)
- Mevsimler (7 gün): yaz kalabalık, kış sakin ama sohbet bol; yağmur kışın 9 kat sık. Ağaç rengi, ilkbaharda
  çiçek, sonbaharda yaprak düşer, kışın serin ton. Gazetede mevsim notu

### Ses ve müzik ✅
- Hiç ses dosyası yok: Web Audio ile üretiliyor (src/audio). Müzik: mevsime göre akor ve tempo değişen, gitar
  tıngırtısı + bas + yumuşak pad + ara sıra çan melodisi (compose.js saf ve test edilebilir)
- Efektler: düğme, kasa, kalp, üzgün, sayfa, koli, zil, yolculuk; yağmurlu günlerde yağmur sesi
- ⚙️ Ayarlar: müzik ve efektler ayrı ayrı, "Baştan başla" (iki adımlı onay); ayarlar kayıtla birlikte saklanır

Sırada:
- Başarımlar / pul koleksiyonu, hikâye bitince kapanış ekranı
- Telefonda geri bildirime göre dokunma ve yazı boyutu ayarları

## Faz 2 başlangıcı ✅
- Sabah gazetesi (Ege Postası): günün havası, bugünün ve yarının etkinliği, kasabadan haber; her sabah açılır,
  üstteki konum hapına dokununca tekrar açılır
- Hava (güneşli / bulutlu / yağmurlu / rüzgârlı): kalabalığı ve öneri isteğini değiştirir; yağmur ve rüzgâr sahnede görünür
- Etkinlikler (Zeytinyağı Festivali, Ada Resim Sergisi, Fok Gözlem Günü, Ot Festivali): günlerin ~%35'inde bir kasabada;
  kalabalık ×1.4–1.6, festival balonları. Atlanabilir: gitmezsen ceza yok, simülasyonda festivali kovalamak en kârlısı
- Müdavim hikâyeleri: her kalpte yeni bir konuşma (8 × 5 satır)

### Faz 2 — ana hikâye ve mevsimler ✅
- Ana hikâye "Kostas Efendi'nin kayıp kütüphanesi": 8 defter sayfası, sırayla açılır (dört kasaba, 10 tam isabet,
  3 kalp, festival, 150 satış, en büyük raf, Cunda tepesinde final). İlk sayfa (teyzenin mektubu) oyun başında açılır.
  Final ödülü: Kostas'ın feneri (çatı süsü) + ₺150. 📜 Defter panelinde sayfalar, sıradaki ipucu ve ilerleme (x/y)
- Mevsimler (7 gün): yaz kalabalık, kış sakin ama sohbet bol; yağmur kışın 9 kat sık. Ağaç rengi, ilkbaharda
  çiçek, sonbaharda yaprak düşer, kışın serin ton. Gazetede mevsim notu

Sırada:
- Ses ve müzik (sakin akustik döngü, sayfa çevirme, kasa sesi)
- Pul koleksiyonu / başarımlar, son ekran (defter tamamlanınca)
- Telefonda geri bildirime göre dokunma ve yazı boyutu ayarları

## Faz 2 başlangıcı ✅
- Sabah gazetesi (Ege Postası): günün havası, bugünün ve yarının etkinliği, kasabadan haber; her sabah açılır,
  üstteki konum hapına dokununca tekrar açılır
- Hava (güneşli / bulutlu / yağmurlu / rüzgârlı): kalabalığı ve öneri isteğini değiştirir; yağmur ve rüzgâr sahnede görünür
- Etkinlikler (Zeytinyağı Festivali, Ada Resim Sergisi, Fok Gözlem Günü, Ot Festivali): günlerin ~%35'inde bir kasabada;
  kalabalık ×1.4–1.6, festival balonları. Atlanabilir: gitmezsen ceza yok, simülasyonda festivali kovalamak en kârlısı
- Müdavim hikâyeleri: her kalpte yeni bir konuşma (8 × 5 satır)

Sırada:
- Kasabaların sırrı / ana hikâye (St. Bookston benzeri yerel bir efsane)
- Mevsim görünümleri (kış, yaz renkleri), pul koleksiyonu

## Faz 2 — dünya
- İsimli karakterler ve dostluk, kasabaların hikâyesi, sabah gazetesi ve etkinlik takvimi (atlanabilir)
- Mevsim görünümleri, pul koleksiyonu, keşif

## Faz 3 — içerik ve cila
- Elle çizilmiş illüstrasyonlar (kod çizimlerinin yerine), müzik ve ses, Türkçe + İngilizce, 200+ kitap

## Faz 4 — yayın
- "İlk günler ücretsiz, tam oyun tek seferlik" satın alma — mağazada baştan açıkça yazılacak
- TestFlight, mağaza görselleri, inceleme
