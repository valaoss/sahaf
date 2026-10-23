# Sahaf v2 planı

Tarih: 23 Ekim 2026. Sahaf 4.0'dan (raflar karavanda, Akdeniz) sonra oyunun bütünüyle incelenmesi ve v2 yol haritası.

## Nasıl incelendi

- **Kod:** `src/` altındaki ~8.800 satırın tamamı. Kural, kayıt, çizim, ses ve arayüz katmanları okundu; şüpheli hatalar küçük node denemeleriyle doğrulandı.
- **Oyun tasarımı:** kurallar ve içerik dosyaları okundu. Denge simülasyonuna ek olarak iki ölçüm yapıldı: 60 günlük harcama ve hikâye temposu, festivale erişim.
- **Ekranlar:** canlı sürüm yatay telefonda (844×390) baştan oynandı. Panellerin hepsi dikey (390×844) ve yatay telefon boyutunda çekildi.
- **Karşılaştırma:** Tiny Bookshop'un sistemleri ve oyuncu eleştirileri incelendi.

## Hemen düzeltilen

**Raf büyütme düğmesi çöküyordu (81ac627).** Süsle panelindeki düğme raf düzenleyicinin hamle dalına düşüp hata veriyordu, raf hiç büyütülemiyordu. Bunun sonuçları:
- 7. sayfa açılmıyordu (koşulu en büyük raf).
- Hikâye bitmiyordu.
- Yunanistan, İtalya, Fransa, İspanya ve Mısır gerçek oyunda hiç açılmıyordu.

Testler ve simülasyon raf yükseltmesini doğrudan çağırdığı için bu hata yakalanmamıştı (Faz 0'daki "komut testi" bunun içindir).

## Oyunun bugünkü hali

**Güçlü yanlar**
- **Yazılmış içerik bol ve iyi:** 240 gerçek kitap, 56 müdavim (her biri 5 satırlık hikâyeli), 44 mektup şablonu, 35 gün içi olay, 14 festival.
- **Mektuplar:** iyi bir öneri günler sonra mektupla geri dönüyor. Tiny Bookshop'ta olmayan, duygusal açıdan güçlü bir bağ.
- **Canlı müşteri cümleleri:** istekler parçalardan kuruluyor (selam + bağlam + istek + kapanış), tekrar bekçisi aynı cümlenin dönmesini önlüyor.
- **Yolculuk fantezisi:** feribot, pasaport, yabancı selamlar; kasabaya göre değişen müzik.
- **Görsel ve ses:** canvas motoru, gün ışığı, hava, kalabalık animasyonları; kodla sentezlenen müzik.
- **Mühendislik:** kurallar test edilebilir saf fonksiyonlar (58 test), ayrıca denge simülasyonu var.

**Zayıf yanlar**

- **Para 10. günde anlamını yitiriyor.**
  - Satın alınabilir her şeyin toplamı ₺1.325: süsler, raflar, çay köşesi, plak ve boyalar.
  - Akıllı oyuncu bunların hepsini 9–11. günde bitiriyor; 60. günde kasada ~₺11.700 birikiyor.
  - Gider yok. Müdavim hediyelerinin 52/56'sı ₺40 nakit.
- **Kararların çoğu gerçek bir seçim değil.**
  - "Pahalı" fiyat etiketi her zaman kazandırıyor: beklenen değer 1,3 × 0,8 = 1,04, "normal" 1, "ucuz" 0,92.
  - "Hepsini diz" düzen bonusunu otomatik veriyor; elle dizmenin bir anlamı yok.
  - Hep roman alan tembel oyuncu, akıllı oyuncudan yalnızca %12 geride kalıyor.
- **Öneri bulmacası çip eşleştirmeye dönüşmüş.** Müşterinin cümlesindeki vurgulu sözcük ("çocuk gözünden"), kitap kartındaki etiket çipiyle ("çocukluk") birebir eşleşiyor. Kitapların tanıtımı yok; okuyup sezme yerine eşleştirme yapılıyor.
- **Sabahlar tekrar ediyor.** Koli kapasitesi 10 olduğu için iyi bir sabah üç tur al-diz-al-diz demek.
- **Hikâyenin temposu dengesiz.**
  - 6. ve 7. sayfaların koşulu kendiliğinden tutuyor.
  - Festival sayfası şansa bağlı: festivali kovalamayan oyuncu ortalama 46. günde açıyor. Simülasyondaki "festival peşinde" oyuncusu da aslında hiçbir festivale gidemiyor, çünkü yolu kapalı.
- **Oyun sonu boş.** Mısır'dan sonra hedef yok. Yeni ülkeler yalnızca talep tablosunu, selamı ve festivali değiştiriyor, yeni bir şey oynatmıyor.
- **Telefonda ekran israfı.**
  - Dikey telefonda sahne ekranın yalnızca üst yarısını kaplıyor; altta büyük, boş bir bej alan kalıyor.
  - Geniş telefonlarda (19,5:9) yatayda iki yanda siyah şerit var.
  - Raf modunda kitap sırtlarındaki yazılar okunmuyor.

## v2'nin hedefi

Üç cümle:
1. **Her sabahın bir kararı olsun.** Para, fiyat ve raf düzeni gerçek seçimler olsun.
2. **Öneri vermek okumak ve sezmek olsun**, çip eşleştirmek değil.
3. **Akdeniz'in her köşesinde yapılacak yeni bir şey olsun**, oyun sonu da dahil.

Bunların altında iki zemin var: kayıtlar asla kaybolmasın, oyun telefonda ekranın tamamını kullansın.

---

## Faz 0: Sağlamlık ✅ (23 Ekim 2026)

Yapıldı: kayıt doğrulama ve yedek (Ayarlar'dan geri yükleme), dükkân açıkken kayıt yazılmaz, akşam açılışında sayfa verilmez, pişirme hatasında basit görünüme geçiş ve en geç 6 sn'de kalkan perde, dolu koliye Kostas kitabı girmez, feribot sabahı (gazete, mektup, ilan, kaçan günün etkisi), mekân adı önbelleği, harita gözlemcisi, iOS ses kilidi, sıfırlamada kalıcı kopyanın beklenmesi. 9 yeni test (toplam 67): kayıt gidiş-dönüşü, bozuk ve yeni sürüm kayıt, gün ortası kayıt, feribot sabahı, Kostas kolisi, arayüz komutlarının karşılığı, Mısır'a kadar ilerleme.


Kod incelemesinde doğrulanan hatalar. Her biri ayrı commit, her birine bir test.

| # | Sorun | Etki | Düzeltme |
|---|---|---|---|
| 1 | Okunamayan ya da yeni sürüm kayıt sessizce siliniyor (`state.js` restore → yeni oyun → hemen üstüne yazılıyor) | Oyuncunun bütün ilerlemesi gidebilir | Ham kaydı `sahaf.save.bak`'a yedekle; alanları tek tek doğrula (kasaba, mekân, raf seviyesi sınırı, nesne tipleri) |
| 2 | Dükkân açıkken kayıt yazılıyor (müdavim hediyesi, raf hamlesi); geri yüklemede gün sabaha dönüyor ama kazanılan para kalıyor | Uygulamayı kapatıp açarak yarım gün bedava kazanılır; istatistikler tutarsızlaşır | Açık fazda kaydetme ya da sabahın anlık görüntüsünü sakla |
| 3 | Oyun akşam fazında açılınca yeni sayfa özet panelinin yerine geçiyor | "Ertesi sabah" düğmesi kayboluyor, oyuncu takılı kalıyor | Açılışta sayfa kontrolünü yalnızca sabah yap |
| 4 | Çizim (pişirme) başarısız olursa açılış perdesi hiç kalkmıyor | Safari'de boş ekran riski | Hata yakala, eski motora geç, perdeyi en geç birkaç saniyede kaldır |
| 5 | Kostas kitabı dolu koliye de ekleniyor (11/10) | Koli ve tezgâh kilitlenir | Koli doluysa ertesi güne ya da posta kutusuna |
| 6 | Feribot günü sabah işlerini atlıyor (mektup, ilan, kurtarma) | Mektup ve ilanlar kaçıyor, dünkü posta tekrar görünüyor | Varışta sabah akışını çalıştır |
| 7 | Alt çubukta eski mekân adı kalıyor | Yanlış bilgi | Önbellek anahtarına kasabayı ekle |
| 8 | Harita her açılışta yeni bir ResizeObserver kuruyor; iOS ses kilidi yalnızca `pointerdown` ile açılıyor; "Baştan başla" kaydın silinmesini beklemiyor | Sızıntı, sessiz oyun, geri gelen eski kayıt | Paneller kapanırken temizlik yapsın; ses kilidi `touchend`/`click` ile de açılsın; silme beklensin |

**Testler**
- **Komut testi:** `act` yönlendirmesi; 81ac627'deki hatayı yakalardı.
- **JSON üzerinden kaydet-yükle:** koli, düzen, pasaport, tezgâh.
- **Gün ortası geri yükleme.**
- **Feribot günü.**
- **Bütünleşik ilerleme testi:** simülasyon arayüzle aynı komutları kullanarak Mısır'a kadar gidebiliyor mu?

**Bitti tanımı:** hepsinin testi var; bozuk kayıtla açılış yedeği koruyor; simülasyon oyunu baştan sona oynayabiliyor.

## Faz 1: Telefon önce ✅ (23 Ekim 2026)

Yapıldı: yatayda çerçeve ekranı dolduruyor (4:3 ile 2.4:1 arası, siyah şerit yok, fazlası gökten kırpılır, çentik güvenli alanı); dikeyde canvas sahnesi ekranın tamamını kaplıyor (gök göstergenin arkasına, zemin aynalanarak düğmelerin altına uzar, kamera karavana ~1,4 kat yakın). Raf modu: yatayda koli karavanın sağında, kamera 2,6 kata kadar yaklaşıyor; dikeyde raflar ekranı enine dolduruyor, koli büyük; seçilen kitabın adı, yazarı, durumu üst çubukta, sürüklerken parmağın üstünde. Performans: raftaki ve masadaki kitaplar ayrı küçük bantta (satışta zemin yerine o pişer, alan 6 kat küçük, ölçülen süre ~22 → ~12 ms), yazısız parçalara gömülü yazı tipi eklenmez, panel açıkken sahne 15 kare/sn, tam ekran haritanın arkasında hiç çizilmez. Genç tiplere yaşlı yüz çıkmaz, ilk sabahın çift ipucu kalktı, gazete adı ülkeye/şehre göre. Basit görünüm (eski SVG motoru) dikeyde eski düzenini korur.


En çok oynanacak yer telefon; şu an ekranın yarısı boş.

- **Dikey düzen:** sahne ekranın büyük kısmını kaplasın. Kamera karavana daha yakın dursun (motor zaten odak ve yakınlaştırma destekliyor), müşteriler büyüsün. Düğmeler başparmak bölgesinde iki sıra kalsın.
- **Geniş yatay telefonlar:** siyah şeritler yerine sahne yanlara uzasın (gökyüzü, deniz ve kıyı bantları zaten yatay döşenebilir).
- **Raf modu telefonda:** kamera daha yakına gelsin. Seçilen kitabın adı ve durumu büyük bir kartta görünsün. Etiket ve fiyat düğmeleri parmak boyunda olsun.
- **Performans (iPhone):**
  - Her satışta bütün zemin bandı yeniden pişiriliyor (SVG'yi seri hale getirme + yeni canvas). Raftaki kitaplar ayrı, hafif bir katmanda çizilsin.
  - Panel açıkken ve boşta kare hızı düşsün (pil ve ısınma).
- **Küçük görsel hatalar:**
  - "Genç âşık", "Öğrenci" gibi genç tipler %12 olasılıkla yaşlı yüzle çıkıyor; bu tiplerde yaş sabitlensin.
  - İlk sabah aynı ipucu iki kez çıkıyor (toast + rehber).
  - Gazete her ülkede "Ege Postası"; ülkeye göre adı olsun (Akdeniz Postası, La Gazzetta…).

**Bitti tanımı:**
- 390×844 ve 844×390'da sahne ekranın en az %80'ini kaplıyor.
- Raf modunda kitap adı okunuyor.
- Uzun oturumda kare süresi ve bellek sabit kalıyor (CDP ile ölçülür).

## Faz 2: Para ve kararlar ✅ (23 Ekim 2026)

Yapıldı:
- Giderler: park ücreti (kasabanın ve mekânın kalabalığına göre ₺8–25), süs bakımı (fiyatının 1/30'u), çay köşesi ₺2/gün. Gün sonunda satış, park, bakım ve net kâr.
- Müşteriye göre fiyat etiketi: öğrenci, anne, çocuk, teyze ve emekli pahalıdan kaçar, ucuz rafta çoğu zaman iki kitap alır. Turist ve koleksiyoncu ucuza güvenmez, pahalıyı sever. Fiyatı yüzünden vazgeçenler ertesi gün o kasabada konuşur (kalabalık azalır), ikna olanlar artırır.
- Tür doygunluğu: bir kasabada çok satılan türü arayan azalır, her sabah toparlanır; başka kasabaları etkilemez.
- "Rafı tamamla": etiketli bölümlerin boşluklarını kendi türünden kolilerle tek dokunuşta doldurup dizer.
- Para harcanacak yerler: kasabaya okuma köşesi bağışı (₺250; park ücretsiz, kalabalık kalıcı +%12, 3 bağışta pul), festival sponsorluğu (₺60; o gün orada kalabalık ×1,6).
- Gün sonu teşhisi: bölüm başına satış ısısı ve etiketleri, fiyattan vazgeçen/ikna olan sayısı ve yarına etkisi, doymuş türler.

Ölçülenler (denge simülasyonu, 60 gün, 30 oyun):
- Fiyat etiketi: ortalamada pahalı ile normal başa baş (₺6.978 / ₺6.889), hepsi ucuz %18 geride. Bağlam belirleyici: yaz çarşısında ve kış tepesinde çocuk rafını ucuz bırakmak, bahar kalesinde normal fiyat en iyisi.
- Tembel oyuncu (hep roman) akıllı oyuncudan %31 geride (önce %12). Hedef %35'ti; kalan farkın çoğu öneri bahşişi, çünkü öneriler raftaki kitaplardan doğuyor.
- 60. günde kasa ₺6,9–8,5 bin (önce ₺11,7 bin). Hedef ₺4–6 bindi; tutmadı, ama artık bağış (28 kasaba × ₺250) ve sponsorluk gibi isteğe bağlı harcama yerleri var.
- Sponsorluk ve bağış kendini aşağı yukarı ödüyor: kazandırmıyor ama kaybettirmiyor da; oyuncunun tercihi.
- Yurt dışı ile Türkiye 30. günde yine başa baş (₺4,6 bin / ₺4,7 bin).


Paranın her gün bir anlamı olsun; baskın stratejiler kırılsın.

- **Giderler:** mekân park ücreti (kalabalık mekân pahalı), süslerin günlük bakımı. Gün sonu özetinde brüt ve net kâr.
- **Fiyat etiketi müşteriye göre:** turist ve koleksiyoncu pahalıya, öğrenci ve teyze ucuza duyarlı olsun. Doğru etiket kasabaya ve mekâna göre değişir.
- **Tür doygunluğu:** aynı kasabada aynı türü günlerce satınca talep düşsün, başka kasabada toparlansın. Gezmeye ve çeşitliliğe gerçek bir sebep.
- **Raf düzeninin anlamı:** göz hizasındaki raf daha çok satsın. Aynı etiketi paylaşan 4+ kitaplık "tema bölümü" o etiketi seven müşteri tipini çeksin.
- **Sabah rutini:** "Dünkü rafı tamamla" tek düğmesi (eksilenleri aynı türden alıp dizer), daha büyük koli.
- **Paranın gideceği yerler:** kasabaya okuma köşesi bağışı (kalıcı talep artışı), festival sponsorluğu, ikinci sergi masası.
- **Gün sonu teşhisi:** bölüm başına satış ısısı, etiketin etkisi, kaçan müşterinin nedeni.

**Bitti tanımı:**
- Denge simülasyonunda tembel oyuncu akıllı oyuncudan en az %35 geride.
- Hiçbir fiyat etiketi her durumda baskın değil.
- 60. günde kasa ₺4–6 bin bandında, harcanacak anlamlı bir şey var.

## Faz 3: Öneri bulmacası ve kitap bilgisi ✅ (23 Ekim 2026)

Yapıldı:
- 240 kitabın her birine tek satırlık tanıtım (src/data/blurbs.js). Tanıtımlar etiketleri sezdirir ama adlarını anmaz; bir test bunu ve uzunluğu denetler.
- Kitap bilgisi (game/knowledge.js): kartlarda yalnız bilinen etiketler görünür, bilinmeyenler ❔. Teyzenin bıraktığı başlangıç kitapları bilinir. Satınca (%35 ihtimalle) bir etiket, önerince isteğe uyanlar, okuyunca ve mektup gelince hepsi öğrenilir. Eski kayıtlarda eldeki ve satılmış kitaplar bilinir.
- Okuma köşesi: raf modunda seçili kitabı sabahları oku (günde 2; yeni Okuma koltuğu ₺150 ile 3), bütün etiketleri açılır.
- Dolaylı istekler: her etikete dört imge ("martı sesleri duyulan", "çantama sığacak"…); ilk günler %15, her gün biraz daha, en çok %65. İpucu işaretleri bunları da gösterir.
- Her müşteri tipinin bağlam cümlesi 3'ten 8'e çıktı.
- Defterde 📚 Kitap bilgim sekmesi; ⚙️ kolay mod: bütün etiketler baştan görünür.

Ölçülen (tanıtımları okumayan, yalnız öğrendiği etiketlere bakan bot; gerçek oyuncu tanıtımı da okur, bu bir alt sınırdır):
- Tam isabet: her şeyi bilen %78–84; öğrendikleriyle 1–5. gün %33 → 31–60. gün %58, okuyarak %68.
- 60. günde ~140 kitap (okumayla ~205) tam tanınıyor.


Öneri, oyunun kalbi. Eşleştirmeden okumaya dönsün.

- **Kitap tanıtımları:** 240 kitabın her birine bir satır tanıtım (konu ve ton).
- **Etiketler öğrenilsin:** kart başta yalnızca tanıtımı göstersin. Bir kitabın etiketleri sattıkça, okudukça ya da mektup geldikçe "Kitap bilgim" defterinde açılsın.
- **Müşteri cümleleri dolaylılaşsın:** "çocuk gözünden" gibi doğrudan karşılıklar yerine bağlamdan sezilen istekler ("torunum ilk kez kendi başına okuyacak"). Bağlam cümleleri her müşteri tipi için 3'ten 8'e çıksın.
- **Okuma köşesi:** sakin bir günde raftan bir kitabı "oku"; etiketleri açılır, o kitapla tam isabet ihtimali artar.

**Bitti tanımı:**
- Bir öneriyi ilk görüşte doğru bilme oranı yeni oyuncuda düşük, bilgi biriktikçe artıyor (simülasyonda bilgi seviyesine göre ölçülür).
- 240 tanıtımın hepsi yazılmış.

## Faz 4: İlişkiler ve hikâye ✅ (23 Ekim 2026)

Yapıldı (game/bonds.js):
- Müdavim ricası: 3 kalpte müdavim zevkine uyan belirli bir kitabı ister; getirilmeden 4. kalp gelmez. Öneri panelinde "Ricasını ver"; kitap ricası ödenir (satış fiyatının 3 katı), kalp ve itibar getirir.
- Kitap siparişi: ricası bekleyen ya da hikâyenin istediği kitap toptancıdan sipariş edilir, ertesi sabah kolide.
- Hatıralar: süs hediyesi olmayan 52 müdavim 5 kalpte ₺40 yerine kendine özgü bir eşya bırakır (data/keepsakes.js); her biri kendi kasabasında +1 ziyaretçi, Süsle panelinde Hatıralar rafı.
- Kasaba itibarı: dükkân açılan her gün, müdavime tam isabet, rica ve bağış artırır. Tanıdık (8): tezgâh %20 ucuz · Sevilen (20): müdavimler 1,5 kat sık · Kasabanın sahafı (40): park ücretsiz, kalabalık +%8, pul.
- Hikâye: 6. sayfa artık görev: rafında «Yaşlı Adam ve Deniz» varken Foça'da dükkân aç (sipariş edilebilir). Gazetede haftalık festival takvimi.
- İlanların yarısı üretiliyor: tanışılan müdavimin zevkinden (o kasabada etiketli kitaplar) ya da 2–5 gün sonraki festivalden (festival günü teslim).

Ölçülen: 60. günde kasa akıllı oyuncu ₺7,7 bin (Faz 2'de ₺6,9 bin; itibar ve hatıralar bir kasabaya bağlılığı ödüllendiriyor), tembel oyuncu %27 geride. İlerleme testi yeni 6. sayfayla da Mısır'a ulaşıyor.


- **Müdavim görev zincirleri:** 3 ve 5 kalpte, o kişinin 5 satırlık hikâyesine bağlı küçük görevler. Örnekler: kayıp bir kitabı bul, bir festivalde buluş, bir mektubu ilet. Ödül süs ya da hikâye.
- **Hediyeler eşya olsun:** ₺40 yerine süs, nadir kitap ya da tarif. Hepsi karavanda görünür.
- **Kasaba itibarı:** dönüp gelinen kasabada itibar artsın. Yeni mekân, indirimli tezgâh ve müdavim görevleri açılsın. Gezmek ile kalmak arasında gerçek bir seçim.
- **Hikâye sayfaları aktif görev olsun:**
  - 6. ve 7. sayfa belirli bir kitabı bulma ya da teslim etme istesin.
  - Festival sayfası için gazetede haftalık festival takvimi olsun, festival öngörülebilsin.
- **İlanlar üretilsin:** 10 sabit ilan yerine müdavim zevklerinden ve festivallerden üretilen ilanlar.

## Faz 5: Akdeniz'in derinliği ve oyun sonu

Her ülke yeni bir şey oynatsın:

| Ülke | Yeni mekanik | Yan hikâye (3–4 sayfa) |
|---|---|---|
| Yunanistan | Ada atlama: küçük feribotla günlük adalar, az stok çok turist | Kostas'ın gençliği, Midilli'deki eski matbaa |
| İtalya | İlk baskı müzayedesi: koleksiyon kitaplarını açık artırmayla sat | Venedik'teki kayıp kütüphanenin izi |
| Fransa | Bukinist ruhsatı: Seine kıyısı gibi sabit tezgâh, haftalık kira | Marsilya limanındaki sandık |
| İspanya | Sant Jordi: gül ve kitap günü, çift satış | Barselona'da bir yazarın el yazması |
| Mısır | El yazması restorasyonu: yıpranmış kitabı onarıp değerini artır | İskenderiye Kütüphanesi efsanesi, büyük final |

- **Oyun sonu:** "Deniz görmeyen kitaplar" kütüphanesinin yeniden kurulması. Her ülkeden toplanan kitaplarla dolan bir kütüphane, açılış töreni, sonrasında serbest oyun.
- **Ülkelerin açılması sabitlensin:** "festival peşinde" simülasyonu ve bütünleşik ilerleme testi her ülkenin oyun içi yollarla açıldığını kanıtlasın.

## Faz 6: Mimari, İngilizce, iOS

- **Komut katmanı:** `main.js`'deki `act` zinciri bir komut tablosuna dönüşsün. Faz kontrolleri kurallarda olsun. Testler ve simülasyon arayüzle aynı komutları kullansın.
- **`ui.js` (779 satır) panel modüllerine bölünsün.** Her panelin açılış ve kapanışı olsun; dinleyici ve gözlemci temizliği orada yapılsın.
- **Kayıt katmanı:** sürümlü şema, adım adım geçişler, doğrulama, yedek; yalnızca faz sınırlarında yazma.
- **Tek motor:** canvas motoru asıl motor olsun, SVG yalnızca pişirme kaynağı kalsın. "Basit görünüm" ayrı bir yol taşımasın.
- **İngilizce:** kurallar metin yerine kod dönsün (`NO_MONEY`). Metinler `t(anahtar)` ile dil dosyalarında, içerik dile göre ayrı dosyalarda tutulsun. Ayarlardan dil seçimi.
- **iOS paketleme:** Mac'te Capacitor ile derleme; ses kilidi, `pagehide`'da kayıt, güvenli alanlar, TestFlight.

---

## Sıra ve büyüklük

| Faz | Büyüklük | Neden bu sırada |
|---|---|---|
| 0 Sağlamlık | küçük (1–2 oturum) | Kayıt kaybı ve kilitlenme her şeyden önce gelir |
| 1 Telefon önce | orta | Oyuncunun her saniye gördüğü şey; sonraki fazların arayüzü de buna göre çizilir |
| 2 Para ve kararlar | orta | En az içerikle en çok derinlik; denge simülasyonuyla ölçülür |
| 3 Öneri bulmacası | büyük (240 tanıtım) | Oyunun kalbi; içerik yazımı fazlara bölünür |
| 4 İlişkiler ve hikâye | büyük | Faz 2–3'ün sistemleri üstüne kurulur |
| 5 Akdeniz ve oyun sonu | büyük | Ülke ülke yayınlanır |
| 6 Mimari, İngilizce, iOS | orta–büyük | Komut katmanı Faz 0'da başlar; İngilizce içerik oturunca |

Her faz ayrı commit'lerle ilerler. Her commit'ten önce testler ("test geçti"), her fazın sonunda denge simülasyonu, telefon boyutlarında ekran görüntüleri ve canlı paket kontrolü yapılır.

## Dürüst sınırlar

- Görseller kodla çiziliyor. Faz 1 ekranı daha iyi kullanır ama gerçek bir çizerin işi kadar ayrıntılı olmaz.
- Faz 3'ün 240 tanıtımı ve Faz 4–5'in yan hikâyeleri yüzlerce satır yazı demek; ülke ülke, parça parça gelir.
- Oyun gerçek bir telefonda ve Safari'de hâlâ denenmedi. Faz 0 ve 1'in iOS maddeleri gerçek cihazda doğrulanmalı.
