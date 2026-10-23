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
### Faz C — dünyanın büyümesi ✅
- Bozcaada (4. sayfada) ve Şirince (7. sayfada) açılır; haritada önce "?" olarak görünürler; her birinde 2 mekân, 2 müdavim, kendi motifi
- 12 müdavim; müdavimler arası 4 bir kerelik olay (iki taraf da 3+ kalpteyken)
- 2. bölüm: final sonrası Kostas'ın 12 kitabı doğru kasabada doğru türden kolide çıkar, her biri bir not; hepsi ₺300
- Karavan: çay köşesi (sabır ×1.3, çay satışı), plak çalar (Akustik / Caz / Ninni temaları)
- Plandan sapma: müdavim kalpleri 5'te kaldı (6–10 aralığı yerine müdavimler arası olaylar yazıldı); ikinci sergi masası yapılmadı
### Faz E — kolaylık ✅
- İlk günlerin rehberi (7 adım, düğme parlar, × ile kapanır; eski kayıtlarda gösterilmez)
- Öneri ipuçları: müşterinin cümlesindeki anahtar kelimeler işaretlenir, dokununca kitaplar o etikete göre süzülür (⚙️ ile kapatılabilir)
- Defterde 📊 İstatistik: türlere göre satış, en çok satanlar, en iyi gün, en sevilen kasaba
- ⚙️ Yazı boyutu (Normal / Büyük / Çok büyük)
### Canlılık turu ✅ (2.5D harita ve gerçekçi insanlar sonrası, sırayla 7 madde)
1. Yürürken yan profil: insanlar yürürken yandan görünür, bacak ve kollar adım atar; durunca öne döner
2. Boyalı görünüm: kâğıt dokusu, suluboya kenarları, uzak katmanlarda pus, vinyet (kodla; gerçek çizer işi değil)
3. Karavanın içi: raflarda sırtında adı yazan kitaplar; dokununca vitrine (en fazla 3) girer, vitrindekiler daha çok sorulur ve satılır
4. Müşteri karşılıkları: öneriden sonra portreli konuşma kartı; kitabın konusuna ve müşterinin üslubuna göre cümle, tekrar bekçili
5. Hava ve gece: yağmurda şemsiyeler, akşam fenerler, rüzgârda tente ve etekler dalgalanır
6. Ortam sesleri (tamamen sentez): dalga, martı, rüzgâr, kalabalık mırıltısı (kişi sayısıyla), tepede kuşlar, akşam cırcır böceği
7. Telefon: dikey düzen (üstte gösterge, ortada sahne, altta 3×2 düğme, tam genişlikte paneller); haritada kıstırma/tekerlek/çift dokunuşla yakınlaştırma

### Sahaf 3.0 ✅ (yeni çizim motoru, elle raf, seçimler, büyük dünya)
- Akıcılık: sahne katmanlara ayrıldı, insanlar ayrı; sonra yeni canvas motoru (render2/): SVG çizimler bantlara pişirilir,
  hareketli parçalar ve insanlar (eklemli iskelet) canvas'ta canlanır. Yerleşim/stil yükü 200–330 ms/sn'den ~5 ms/sn'ye indi.
  ⚙️ Basit görünüm ile eski SVG motoru seçilebilir
- Atmosfer: saate göre gökyüzü, hareket eden güneş, ay ve yıldızlar, canlı deniz ve kıyı köpüğü, bulut gölgeleri,
  güneşe göre uzayan gölgeler, yağmur halkaları, rüzgârda yapraklar, fener ve karavan ışık havuzları
- Raflar elle dizilir: koli, 3 raf × 2 bölüm, tür etiketleri, sürükle-bırak ve dokun-seç, vitrin, düzen bonusu (%15'e kadar)
- Seçimler: pazar tezgâhı (tek tek kitap, yıpranmış/iyi/temiz, ilk baskı), bölüm fiyat etiketi (ucuz/normal/pahalı),
  sohbet (Biraz daha anlat, Çay ikram et), uymayan öneriyi indirimle satma
- Canlanma: tente açılıp kapanır, ışıklar sırayla yanar, raflarda kamera yakınlaşır, ödeme/sevinç pozları, uçan kitap
- Dünya: Dikili, Urla, Assos (ikişer mekân ve müdavim, festival, müzik); 8 çeşit yol üstü karşılaşma
- Konuşma balonu konuşanın başının üstünde (ekranı kapatmıyor)

Sırada: telefonda deneme ve geri bildirim, İngilizce, iOS paketleme (Mac).

## Faz 3 — içerik ve cila
- Elle çizilmiş illüstrasyonlar (kod çizimlerinin yerine), müzik ve ses, Türkçe + İngilizce, 200+ kitap

## Faz 4 — yayın
- "İlk günler ücretsiz, tam oyun tek seferlik" satın alma — mağazada baştan açıkça yazılacak
- TestFlight, mağaza görselleri, inceleme
