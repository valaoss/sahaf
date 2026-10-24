# Sahaf v3: kitapçı olmanın kendisi

Bu belge oyunun yeni tasarım yönünü ve onu aşama aşama kurma planını anlatır. Önce yeni özellik eklenmez; temel döngü yeniden kurulur. Çalışan kod gereksiz yere atılmaz: kaldırılan sistemler silinmez, oyundan çekilip kenara konur.

**Yeni döngü:** Kitap al → rafa elinle diz → müşteri gelir → konuş, pazarlık et → sat → para → arabanı büyüt → yeni mahalle aç → daha iyi müşteriler.

**Hedef:**
- İlk 5 dakikada ilk pazarlıklar ve ilk kâr.
- İlk 30 dakikada ilk büyük alışveriş (rafa yeni modül) ve ikinci mahalle.
- Birkaç saat sonra bile "bir sonraki araba / dükkân" isteği.

---

## 1. Teşhis: bugün oyun nerede takılıyor

Teşhis kod ve canlı sürüm üzerinden yapıldı (valaoss.github.io/sahaf, 24.10.2026).

| Gözlem | Kanıt | Sonuç |
|---|---|---|
| Satışların çoğunda oyuncu yok | `makeCustomer`: öneri isteme ihtimali `askChance 0.2`; geri kalan %80'i `resolveCustomer` kendi kendine çözüyor. Bir gün ~2 dakikada akıp geçiyor. | Oyuncu satış yaptığını hissetmiyor. Asıl iş (satmak) ekranda kendiliğinden oluyor. |
| Fiyat kararı bölüm etiketinde kalıyor | Ucuz / normal / pahalı etiketi raf bölümüne konuyor, müşteriyle hiç konuşulmuyor. | Pazarlık yok; fiyat yalnız bir olasılık çarpanı. |
| İlk ekran kalabalık | Oyun Defter açık başlıyor: 6 sekme (Defter, Pul albümü, Mektuplar, İstatistik, Pasaport, Kitap bilgisi). Altta 6 düğme (İskele, Toptancı, Süsle, Harita, Defter, Dükkânı aç). | Oyuncu ne yapacağını anlamadan menülerde dolaşıyor. |
| Çok sayıda kopuk sistem | Ülkeler, feribot, pasaport, 5 ülkeye özgü mekanik (ada, müzayede, bukinist, gül, onarım), ilanlar, gazete, sponsorluk, bağış, festival takvimi, pul albümü, okuma köşesi, mektuplar, hikâye sayfaları. | Hiçbiri ana döngüyü beslemiyor. Denge ölçümlerinde ülke mekaniklerinin çoğu kazancı %0–2 oynatıyor; bazıları zarar ettiriyor. |
| Paranın amacı zayıf | Başlıca harcamalar: koli, 2 raf büyütme (₺120, ₺260), 3 geliştirme, boya, süs. Arabada görünen değişiklik az. | "Bu parayla ne alırım?" sorusunun cevabı kısa. |
| Harita ruhsuz | Gerçek Ege kıyısı, ??? noktalar ve kilit simgeleri. | Dünya yaşanmıyor; ilerleme yalnızca yeni nokta açmak gibi duruyor. |

**Sağlam olanlar (kalacak):**
- Kitap verisi: 240 kitap, tanıtım yazıları, etiketler.
- 11 müşteri tipinin konuşma üslupları.
- Müdavimler ve hikâyeleri.
- Raf modu: kamera yaklaşır, sürükle-bırak çalışır (`shelf-stage.js`, `shelf-drag.js`).
- Prosedürel ses.
- Kayıt şeması ve göçler.
- İngilizce altyapısı.
- Test ve simülasyon düzeni.

## 2. Ne kalır, ne sadeleşir, ne kenara konur

Kenara konan kod silinmez; `LEGACY` bayrağıyla oyundan çekilir. Kayıtlardaki verisi korunur.

| Sistem | Karar | Neden / yeni hâli |
|---|---|---|
| Ülkeler, feribot, pasaport, Akdeniz haritası | **Kenara** | Tek kasaba, mahalleler. Ülke ülke ilerleme istenmiyor. |
| Ülke mekanikleri (ada, müzayede, bukinist, gül, onarım), büyük final | **Kenara** | Bunların içinden iki fikir yeni yerinde yaşar: *nadir kitap alım-satımı* ve *kondisyon*. |
| Pul albümü, istatistik, pasaport sekmesi | **Kaldır** (arayüzden) | Gösterilecek tek ilerleme arabanın ve mahallenin kendisi. |
| İlanlar, gazete, sponsorluk, bağış | **Kaldır** | Yerini mahalle olayları alır: haritada tek satır ("Okul Yokuşu'nda dönem başı: öğrenci akını"). |
| Festival takvimi | **Sadeleş** | Mahalle olayının bir türü olur; ayrı panel yok. |
| Defter | **Sadeleş**: 6 sekme → 2 | **Müşteriler:** tanıdığın kişilerin kartları ve keşfedilen özellikleri. **Hikâye:** teyzenin mektupları, kısa. |
| Hikâye (Nermin Teyze, Kostas'ın kütüphanesi) | **Sadeleş** | Uzun vadeli hedefin anlatısı olur: teyzenin eski dükkânını yeniden açmak. 6–8 mektup, yalnız büyük adımlarda gelir. |
| Öneri isteyen müşteri, etiket öğrenme, tanıtım yazıları | **Kalır, merkeze taşınır** | Pazarlığın içindeki "söz" mekaniği bunlardan beslenir (bkz. 3.4). |
| Okuma köşesi | **Sadeleş** | Sabah kitabın kartına dokunup "Göz at" demek; ayrı geliştirme ve sayaç yok. |
| Müdavimler, kalpler, rica, hediye | **Kalır, sadeleşir** | Kalp iyi alışverişle gelir. Rica = müdavimin özel siparişi. Hediyeler araba süsü olur. |
| Bölüm fiyat etiketi (ucuz/normal/pahalı) | **Değişir** | Her kitabın bir fiyat kartı olur; bölüm etiketi yalnız "bu raftaki kartların varsayılanı". |
| Tür doygunluğu, ağızdan ağıza | **Kalır, görünür olur** | Doygunluk mahalle talebinde görünür ("Okul Yokuşu fantastiğe doydu"). Ağızdan ağıza → **Güven** (bkz. 3.6). |
| Park ücreti, bakım gideri | **Birleşir** | Tek gider: mahallenin günlük **tezgâh kirası**. Zengin mahalle pahalı ama cüzdanlar dolu. |
| Toptancı, pazar tezgâhı, koli | **Kalır** | Stok alma yeri. Tür kilitleri ve nadir kitap vitrini eklenir. |

**Uncommitted denge işi:**
- Gerçekçi oyuncu botu (`balance-sim.mjs`) korunur; pazarlık botlarının temeli olur.
- Adanın günübirlik düzeltmesi ve ülke işleri ölçümü Akdeniz'le birlikte kenara gider.

---

## 3. Satış ve pazarlık: "Söz ve Fiyat"

Pazarlık oyunlarında genelde tek kol sayıdır: teklif ver, karşı teklif al. Sahaf'ın farkı şu: **bir kitabı pahalıya satmanın yolu onu doğru anlatmaktır.** Oyuncunun iki aracı var: **fiyat** ve **söz**. Söz, o kitap hakkında bildiğin bir şeydir. Doğru kişiye doğru söz, pazarlığı rakamdan daha çok değiştirir. Bu, oyunun zaten var olan kitap bilgisi sistemini (etiketler, tanıtımlar, kondisyon, ilk baskı) satışın tam ortasına koyar.

### 3.1 Bir müşterinin akışı (10–25 saniye)

1. **Yaklaşır ve göz atar** (2–4 sn, oyuncu izler)
   - **Yapar:** Bekler ya da başka işine bakar.
   - **Görür:**
     - Müşteri arabaya yürür ve raflara bakar; gözü bir bölüme takılır.
     - Kafasının üstünde küçük bir düşünce balonu çıkar: tür simgesi ya da "?".
     - Görünüşü kim olduğunu söyler. Öğrencinin sırt çantası ve atkısı vardır. Koleksiyoncunun gözlüğü, ceketi ve deri çantası. Sabırsız müşteri saatine bakar.
2. **Ya kitabı alıp tezgâha gelir, ya da sorar**
   - **(a) Kitabı seçti:**
     - Kitap raftan uçup tezgâha gelir. Müşteri ilk sözünü söyler: «Güzelmiş… 8'e olur mu?»
     - Ekranın alt üçte biri pazarlık şeridi olur: kitabın kapağı, fiyat kartı (₺10) ve müşterinin teklifi (₺8).
   - **(b) Soruyor:** «Denizi anlatan bir şey var mı? Ama cebim biraz dar.» Bu bugünkü öneri sistemidir.
     - Oyuncu raf moduna geçer ve bir kitap seçer.
     - Seçimin isteğe uyumu, müşterinin kitaba biçtiği değeri artırır. Uymazsa müşteri kibarca geri çevirir ya da düşük teklif verir.
     - Sonra (a)'daki pazarlığa geçilir.
3. **Pazarlık** (1–3 tur)
   - **Seçenekler:** Şeritte en fazla 5 düğme olur:
     - `Kabul (₺8)`
     - `Orta yol (₺9)`
     - `Fiyatım bu (₺10)`
     - en fazla 2 **söz kartı**
     - küçük bir `Vazgeç`
   - **Söz kuralı:** Her pazarlıkta yalnız **bir söz** söylenir.
   - **Tepki:** Müşteri her hamleye yüzü ve cümlesiyle cevap verir: kabul eder, düşünür ("hmm…" ve kısa bekleme), karşı teklif verir ya da gider.
4. **Sonuç**
   - **Satış:**
     - Kitap kâğıda sarılır (0,3 sn) ve müşteriye uzanır.
     - Para kasaya düşer: "+₺9", kasa sesi.
     - Müşterinin yüzü durumu söyler: memnun, nötr ya da "kazıklandım" ifadesi. Bunu Güven'e işler.
   - **Anlaşma yok:** Müşteri omuz silker ya da söylenerek gider. Kitap rafa geri döner.

**İlerlemeye katkı:**
- Her satış para getirir.
- Her mutlu satış mahallede **Güven** biriktirir.
- Bazı mutlu müşteriler müdavim olur.

### 3.2 Müşterinin gizli özellikleri

Her müşteri, tipinin dağılımından kendi değerlerini çeker. Aynı tipten iki kişi farklı davranır.

| Özellik | Ne yapar | Nasıl sezilir |
|---|---|---|
| **Bütçe** | Ödeyebileceği en fazla para. | Giyim ve çanta. Cümleler: «harçlığım bu hafta bitti», «fiyat önemli değil». |
| **Pazarlık eğilimi** | İlk teklif biçtiği değerin ne kadar altında olur (%0–35). | İlk teklifin ne kadar düşük olduğu; «Bırak şunu 8'e». |
| **Sabır** | Kaç tura dayanır (1–4). | Saatine bakma, ayak vurma, iç çekme. Her tur görünür biçimde azalır. |
| **Zevk** | Hangi tür ve konulara değer biçer. | Konuşması; baktığı raf. |
| **Kararlılık** | Kitabı ne kadar istiyor; pazarlık bozulunca gider mi, dönüp gelir mi. | Kitaba sarılması, «Bunu yıllardır arıyorum». |
| **Fiyat hassasiyeti** | Fiyat kartı biçtiği değerin ne kadar üstündeyse o kadar soğur. | Fiyata bakınca kaşının kalkması. |
| **Derdi** (asıl yenilik) | Bu kitapta neye önem veriyor: *konu*, *kondisyon*, *nadirlik*, *ucuzluk*, *hediye*, *tavsiye*. Doğru söz bu derde dokunur. | İlk cümlesindeki ipucu: «Kızıma hediye…», «Sayfaları sağlam mı?», «İlk baskısı var mı?» |

**Müşteri tipleri** (mevcut 11 tip korunur; tabloda en belirgin 5'i):

| Tip | Bütçe | Pazarlık | Sabır | Kararlılık | Derdi (en sık) | Kişiliği |
|---|---|---|---|---|---|---|
| Öğrenci | düşük | yüksek | orta | sevdiği türde yüksek | ucuzluk, konu | İndirim ister ama sevdiği kitap için biraz zorlar. İyi davranılırsa en sadık müdavim olur. |
| Koleksiyoncu | çok yüksek | düşük | düşük | nadir kitapta çok yüksek | nadirlik, kondisyon | Yıpranmış kitaba bakmaz, ilk baskıya servet öder. Yanlış söze sabrı yoktur. |
| Sabırsız (her tipte %15 ihtimalle bir huy) | – | düşük | 1 | düşük | – | İlk teklifini kabul etmezsen gider. Ama hızlı ve dürüst bir fiyata tek seferde evet der. |
| Kitap tutkunu (yazar adayı, emekli öğretmen) | orta | düşük | yüksek | sevdiği konuda çok yüksek | konu, tavsiye | «Ben de okudum» sözüne erir; değer biçtiğinin üstünü öder. |
| Pazarlıkçı (balıkçı, teyze; çarşıda sık) | orta | çok yüksek | yüksek | orta | ucuzluk | Hep düşürmeye çalışır. Orta yolu ikinci turda kabul eder; fiyatı inatla korursan saygı duyar ama bir dahaki sefere daha düşük açar. |

Tipler kesin kural değildir. Her özellik bir dağılımdan çekilir, ayrıca her kişiye bir **huy** düşebilir: sabırsız, cömert, şüpheci, geveze. Huy görünüşte ve cümlelerde belli olur.

### 3.3 Pazarlık kuralları (sayısal çekirdek)

`game/haggle.js` yeni, saf kural modülü olur ve testlenir.

**Biçilen değer ve sınır:**
- **Piyasa değeri:** `V = tür fiyatı × kondisyon × (ilk baskı ? nadirlik : 1)`.
- **Müşterinin biçtiği değer:** `W = V × zevk uyumu (0.7–1.4) × derdi uyumu × gün/mahalle çarpanı`.
- **Ödeyebileceği en fazla:** `R = min(bütçe, W)`.

**Açılış:**
- Fiyat kartı `P ≤ R × (1 − eğilim/2)` ise sessizce öder; pazarlık şeridi açılmaz (bkz. 3.8).
- Değilse açılış teklifi `O = round(R × (1 − eğilim))` olur.

**Hamleler:**
- **Kabul:** O fiyattan satılır. Müşteri memnun; Güven +.
- **Orta yol** (`(O+P)/2`) veya **Fiyatım bu** (`P`): istenen ≤ R ise kabul eder. İstenen R'nin biraz üstündeyse karşı teklif verir, teklifini R'ye doğru yükseltir ve sabır −1 olur.
  - İstenen çok yüksekse (`> R × 1.3`) sabır −2 olur, fiyat hassasiyeti yüksek müşteri doğrudan gider.
- **Söz:** derde dokunursa W %15–35 artar (ilk baskı / koleksiyoncu eşleşmesinde daha fazla) ve sabır +1. Müşteri yeni bir teklif verir.
  - Dokunmazsa «Hı hı…» der, değer değişmez. Ceza yok, yalnız tur harcanır.
- **Sabır 0:** gider. Kararlılığı yüksekse kapıda dönüp son teklifini söyler: «Peki, 9. Son sözüm.»

**Güven çarpanı:** Güven yükseldikçe mahallenin müşterileri daha az pazarlık eder (eğilim × 0.7'ye kadar) ve daha kalabalık gelir.

**Sonuç her zaman tek kelimeyle görünür:**
- 😊 **İyi alışveriş:** ödenen ≤ W.
- 😐 **Fena değil.**
- 😒 **Pahalıya aldım:** ödenen > W. Bu yalnız söz sayesinde olur ve Güven'i azaltmaz. Kazık fiyat ise müşteriyi kaçırır.

### 3.4 Söz kartları: neden özgün, nereden gelir

Söz kartları senin bildiklerinden üretilir. Bilgi bir mekanik olur:

| Söz | Nereden açılır | Kime işler |
|---|---|---|
| **Konu sözü** — «Fırtınada bir fener bekçisinin hikâyesi.» | Kitabın o etiketini biliyorsun (satarak, öneriyle, göz atarak öğrenilir). | Derdi *konu* olan; zevkine uyan. |
| **Kondisyon sözü** — «Sayfaları tertemiz, sırtı kırılmamış.» | Kitap temiz kondisyonda. | Koleksiyoncu, hediye alan. |
| **Nadirlik sözü** — «Bu ilk baskı; kolofonuna bakın.» | Kitap ilk baskı. | Koleksiyoncu (çok güçlü). |
| **Kişisel söz** — «Bunu ben de okudum, son sayfası yıllarca aklımdan çıkmadı.» | Kitabın tüm etiketlerini biliyorsun. | Kitap tutkunu, tavsiye isteyen. |
| **Hatıra sözü** — «Geçen ay aldığın Deniz Feneri'ni sevdiysen…» | Müdavimin geçmiş alışverişi. | Müdavimler (bkz. 3.7). |
| **Hediye sözü** — «Güzel paketlerim, içine not da koyarım.» | Araba geliştirmesi: *paket köşesi*. | Derdi *hediye* olan. |

Kitap tanımak böylece doğrudan para olur. Yeni oyuncu yalnız fiyatla oynar; zamanla söz desteği büyür. Ustalaşma budur.

### 3.5 Tepkiler: rastgele değil, karakterli

- Her tip için her tepkiye 3–4 cümle yazılır: açılış, karşı teklif, düşünme, kabul, mutlu kabul, gitme, dönüp gelme, söze olumlu/olumsuz. Mevcut `voice` üsluplarıyla uyumlu olur.
- Toplam yaklaşık 11 tip × 9 tepki × 3 cümle ≈ 300 cümle. Türkçe ve İngilizce yazılır.
- Yüz ifadeleri:
  - 6 temel ifade: meraklı, düşünceli, sıkılmış, mutlu, kızgın, şaşkın.
  - Ayrıca beden dili: saat, ayak vurma, kitaba sarılma, omuz silkme.
  - Bugünkü `render/figure.js` / `rig.js` iskeletine eklenir.
- **Sabır görünür:** müşterinin yanında küçük bir kum saati değil, *beden dili* gösterir. İlk müşterilerde bir ipucu balonu bir kez açıklar.

### 3.6 Güven (mahalle başına, 0–100)

- **Yapar:** Adil fiyat ve iyi öneri.
- **Görür:** Haritada mahallenin yanında bir kalp çubuğu; günün sonunda tek satır, örneğin «Okul Yokuşu sana ısındı (+6)».
- **Tepki:**
  - Güven yükseldikçe kalabalık artar ve pazarlık yumuşar.
  - Kazık fiyat ve kaba ret (sabrı biten müşteriye inat) Güven'i düşürür.
  - Rafta piyasa değerinin 1,5 katından pahalı kartlar, göz atan müşterilerde kaş kaldırma olarak görünür.
- **İlerlemeye katkı:** Yeni mahallelerin kilidi kısmen Güven'e bağlıdır (bkz. 4). Yüksek kâr ile müşteri kazanma arasındaki seçim burada anlam bulur.

### 3.7 Müdavimler

- Mutlu satıştan sonra kişi bazen kartını bırakır: «Haftaya yine uğrarım.» Böylece bir müdavim olur. Mevcut müdavim verisi (adlar, hikâyeler, zevkler) mahallelere dağıtılır.
- **Hafıza:**
  - Müdavim son alışverişlerini hatırlar ve ona göre konuşur.
  - Senin verdiğin indirimleri hatırlar; bir dahaki sefere o fiyattan açar. Bu, ucuz satmanın gizli bedelidir.
- **Kalp:** İyi alışveriş ve tam isabet öneriyle artar.
  - 3 kalpte bir **özel sipariş** verir: «Bana Kayıp Mektuplar'ı bulursan iyi öderim.» Bu, eski rica sisteminin aynısıdır.
  - 5 kalpte arabana bir süs hediye eder.
- **Defter > Müşteriler:** Her müdavimin kartında keşfettiğin özellikler görünür: «Bütçe: orta · Sabır: yüksek · Derdi: kondisyon». Bunlar ancak gözlemle dolar; öğrenmek ustalaşmanın parçasıdır.

### 3.8 Akış: oyun yorucu olmasın

- **Sessiz alıcılar:** Fiyat kartı biçtiği değerin rahatça altındaysa müşteri pazarlık etmeden öder. Ekranda yalnız para düşer ve kitap uçar. Günde ~8–14 kişi tezgâha gelir, ~5–10 kişi sessiz alır.
- **Saat:** Pazarlık sırasında saat durur. Günün uzunluğu müşteri sayısıyla belirlenir; hedef ~3–4 dakikalık satış.
- **Çırak** (geliştirme, oyunun ortası): Belirlediğin eşiğin (ör. kartın %90'ı) üstündeki teklifleri senin yerine kabul eder. Böylece sen yalnız ilginç pazarlıklara girersin. Hem para harcanacak bir yer, hem de ileri oyunda tempo ayarı olur.

---

## 4. Para ve ilerleme

### 4.1 Paranın gittiği yerler

| Alan | Örnekler | Ekranda görünen | Risk / karar |
|---|---|---|---|
| **Stok** | Toptancıdan tür kolisi; pazar tezgâhından tek tek kitap (kondisyon, ilk baskı şansı); **müdavim siparişi**. | Koli arabanın önüne gelir, depoda kapaklar belirir. | Pahalı koli satılmazsa elde kalır. Mahallenin talebini doğru tahmin et. |
| **Tür kilitleri** | Başta Roman, Polisiye, Çocuk. Şiir, Tarih, Fantastik, sonra Sanat, Yemek, Gezi. | Toptancıda yeni raf rafı; arabaya o türün bölüm etiketi. | Hangi tür hangi mahallede satar? |
| **Nadir kitap vitrini** | Haftada bir sahaf mezatı: ilk baskılar, imzalı kopyalar (₺60–300). | Kitap camlı bir kutuda gelir. | Koleksiyoncu gelmezse bekler; doğru mahallede çok kazandırır. |
| **Araba modülleri** | Yeni raf katı, yan kanat raf, sergi standı, ön tezgâh, depo sandığı (depo kapasitesi). | Parça arabaya **gerçekten takılır** (yapım animasyonu); yeni rafa kitap dizilebilir. | Kapasite mi, vitrin mi, depo mu? |
| **Satış araçları** | Paket köşesi (hediye sözü), çay demliği (sabır +1), fener (akşam satışı +1 saat), çırak. | Her biri arabada görünür bir nesne. | Her biri bir oyun tarzını güçlendirir. |
| **Kişiselleştirme** | Tente deseni, ahşap rengi, boya, lambalar, tabela, bitkiler, küçük objeler (kedi minderi, gramofon). | Doğrudan arabada görünür. | Tamamen keyif; bazıları ufak bir Güven bonusu verir (güzel araba daha çok bakılır). |
| **Mahalle** | Yeni mahallenin açılışı (tek seferlik) ve günlük tezgâh kirası. | Haritada mahalle canlanır, yol açılır. | Zengin mahalle pahalı ama cüzdanlar dolu; her gün nerede açacağın bir karar. |
| **Büyük adımlar** | Araba seviyesi 2 ve 3, dükkân. | Kamera geri çekilir, yeni araç sahneye gelir. | Uzun vadeli birikim hedefi. |

### 4.2 İlerleme merdiveni

1. **Kitap el arabası** (başlangıç): 2 raf, ~16 kitap, yalnız İskele. Pazarlık ve dizme öğrenilir.
2. **Kitap arabası** (~₺400, ~30. dakika civarı): 3 raf + sergi standı yeri, ~30 kitap, modül yuvaları açılır. Arabanın asıl tasarımı burada (referans görsel bekleniyor).
3. **Kitap karavanı** (~₺1500, ~2. saat): iki yan kanat açılır, ~50 kitap, okuma basamağı, akşam satışı.
4. **Teyzenin dükkânı** (~₺5000 + 3 mahallede yüksek Güven, ~5–6. saat): Eski Çarşı'daki kapalı dükkân yeniden açılır. Hikâye burada düğümlenir. İç mekân: duvar rafları, tezgâh, vitrin camı.
5. **Dükkânı genişlet**: arka oda, okuma köşesi, kafe tezgâhı, nadir kitap dolabı, kendi tarzında dekor. Kapanış hikâyesi olur ama oyun sürer.

Her basamak bir öncekinden gözle görülür biçimde büyüktür. Kamera da buna göre açılır.

### 4.3 Ekonomi kararları

- Tüm fiyatlar ~2 katına çıkar (₺7'lik roman → ₺14). Böylece pazarlıkta ₺1 adım %15 değil %7 olur.
- Kötü karar zarar ettirir ama batırmaz: para ₺0'a düşünce toptancı bir koliyi veresiye verir. `rescue` mantığı korunur.
- Denge simülasyonuna **pazarlık botları** eklenir: hep kabul eden, hep fiyatı koruyan, orta yolcu, söz kullanan. Hedefler:
  - Söz kullanan, hep kabul edenden %30–45 fazla kazanır.
  - Hep fiyatı koruyan müşteri kaçırır ve Güven'i düşer; orta yolcunun gerisinde kalır.
  - Basamak 2'ye ortalama oyuncu 25–35. dakikada ulaşır; basamak 4'e 5–7 saatte.

### 4.4 Oyuncunun zaman çizelgesi

| Zaman | Oyuncu ne yaşar |
|---|---|
| 0–1 dk | Sabah, el arabası İskele'de. Teyzenin tek satırlık notu. İlk koli zaten açık: 6 kitabı rafa sürükle. |
| 1–5 dk | İlk 4 müşteri. Öğrenci 8'e ister → orta yol → 9'a satış. Koleksiyoncu yıpranmış kitabı beğenmez. Teyze konuşmasından ipucu verir → doğru kitap → mutlu satış, **ilk söz kartı** açılır. Gün sonu: «+₺62, İskele sana ısındı.» |
| 5–30 dk | Yeni tür (Şiir) kilidi. İlk modül (raf katı) arabaya takılır. İkinci mahalle (Çınaraltı Parkı) açılır. İlk müdavim kartını bırakır. Kitap arabasına (seviye 2) yaklaşıldığını gösteren çubuk. |
| 30 dk–3 sa | Kitap arabası. Mahalleler arasında seçim (kira / müşteri). Nadir kitap mezatı ve ilk büyük kumar. Çırak, paket köşesi. Müdavim siparişleri. Karavan hedefi. |
| 3–8 sa | Karavan, zengin mahalle, koleksiyoncular. Teyzenin dükkânının anahtarı. Dükkânı açma ve büyütme. |

---

## 5. Raflar ve depo: kitapları elinle diz

Bugünkü raf modu (kamera yaklaşır, sürükle-bırak, dokun-seç, otomatik kaydırma) temeldir. Eksikleri tamamlanır.

1. **Arabaya dokun:** Kamera 0,45 sn'de yumuşakça yaklaşır. Üst gösterge ve alt düğmeler solar.
2. **Raf kapakları açılır:** Brandalar/camlı kapaklar 0,35 sn'de açılır, tahta tıkırtısı duyulur.
3. **Sağda depo paneli:** Satın alınmış kitaplar kapakları ve "×3" adet rozetiyle görünür; tür ve kondisyon filtreleri vardır. Telefonda alttan çekmece olur.
4. **Basılı tut ve sürükle:**
   - Kitap %8 büyür, 6 px yükselir, altına yumuşak gölge düşer.
   - Bırakılabilecek raf aralığı ince bir ışıkla belirir; kitaplar yana kayıp yer açar.
5. **Bırak:** Kitap hafif esneme ile yerine oturur (0,94 → 1,03 → 1; 180 ms), "tok" sesi gelir.
6. Raftaki kitap yine tutulup başka rafa taşınabilir ya da depoya geri atılabilir.
7. **Fiyat kartı:** Rafta kitabın sırtının altında küçük bir kart vardır. Dokununca ± düğmeleriyle fiyat değişir; piyasa değeri ince bir çizgiyle gösterilir.
8. **Hızlı yerleştirme:** «Boşlukları doldur» düğmesi depodaki kitapları tür bölümlerine dağıtır. Oyuncunun düzenine dokunmaz. Yorgun anlar için vardır; ana yol el ile dizmektir.
9. **Satışta:** Satılan kitap rafta tam yerinden kalkar, tezgâha uçar ve paketlenip uzatılır. Raftaki boşluk görünür kalır; ertesi sabah doldurma isteği doğar.

Yerleşimin oyuna etkisi:
- Bölümler türe göre düzenlenince göz atanlar aradığını daha çabuk bulur: tezgâha gelme ihtimali artar. Bu mevcut "düzen bonusu"dur.
- Sergi standındaki kitap daha çok bakılır.
- Göz hizasındaki raf daha çok satar.

---

## 6. Kitap arabası (yeni referans görsel bekleniyor)

**Referans gelmeden arabanın son tasarımına başlanmayacak.** Şimdiden kararlaştırılabilen ve tasarımdan bağımsız olanlar:

- **Kamera:** Hafif yandan (üç çeyrek) bakış. Raflar ve kitap sırtları okunur; kapak yüzü sergi standında görünür.
- **Veri güdümlü araba:**
  - Her araba seviyesi bir veri tanımıdır: raf yuvaları (konum, genişlik, kapasite), modül yuvaları, kamera noktaları.
  - Raf etkileşimi bu veriden çalışır. Yeni çizim gelince yalnız görsel ve koordinatlar değişir; kurallar ve testler aynı kalır.
- **Modüller:** Satın alınan her parça bir yuvaya takılır ve yapım animasyonuyla görünür: parça yukarıdan iner, vidalanır, toz kalkar; 0,6 sn, atlanabilir.
- **Malzeme dili:** Sıcak ahşap, keten ve kanvas tente, pirinç küçük parçalar, kâğıt etiketler. Pastel ama soluk olmayan renkler.

Referans gelince bu bölüm görselin çözümlemesiyle genişletilecek: oranlar, yuva sayısı, boyalar, modüller.

---

## 7. Bölge haritası: Mürekkep Koyu

Gönderilen görsel **havası** için referanstır: elle boyanmış, minyatür, canlı bir kıyı kasabası. Yerleşimi, adları ve parçaları kopyalanmaz. Sahaf'ın kendi kasabası:

| Mahalle | Hava | Müşteri karışımı | Talep | Kira | Açılış |
|---|---|---|---|---|---|
| **İskele Boyu** | Ahşap iskele, martılar, balıkçı tekneleri | Turist, aile, balıkçı | Polisiye, çocuk, macera | düşük | başlangıç |
| **Çınaraltı Parkı** | Dev çınar, havuz, banklar, uçuşan yapraklar | Emekli, anne-çocuk, âşıklar | Şiir, çocuk, roman | düşük | ₺150 + İskele Güveni 20 |
| **Okul Yokuşu** | Taş merdivenler, bisikletler, afişler | Öğrenci, genç yazar | Fantastik, felsefe, şiir; ucuz ve hacimli | orta | ₺300 |
| **Eski Çarşı** | Kemerli meydan, tezgâhlar, kalabalık | Karışık, bol pazarlıkçı | Her şey, yüksek hacim | orta | ₺500 + 2 mahallede Güven 40 |
| **Boyacılar Sokağı** | Renkli kepenkler, ressam şövalesi, kediler | Sanatçı, yazar, tutkun | Sanat, şiir, ilk baskı | orta | Kitap arabası (seviye 2) |
| **Köşkler Sırtı** | Bahçeli köşkler, fener direkleri, sessizlik | Koleksiyoncu, varlıklı okur | Tarih, nadir, temiz kondisyon | yüksek | ₺1200 + Eski Çarşı Güveni 50 |
| **Fener Burnu** | Deniz feneri, rüzgâr | Haftada bir **sahaf fuarı**: nadir alım-satım | – | – | Karavan |

**Harita ekranı:**
- **Yapar:** Sabah haritayı açar, bir mahalleye dokunur. Kart açılır: bugünkü kalabalık, aranan türler, kira, Güven ve varsa olay. «Buraya git» der.
- **Görür:**
  - Masalsı, eğik bakışlı bir minyatür kasaba.
  - Kilitli mahalleler sisle örtülüdür.
  - Açılınca sis kalkar, yol çizilir, evlerin ışıkları yanar.
- **Canlılık:**
  - Yürüyen küçük insanlar, salınan ağaçlar, uçuşan yapraklar.
  - Martı ve güvercinler, dalgalanan su, bacadan duman, akşam yanan lambalar.
  - Hepsi hafif, döngülü animasyonlar; telefonda kare hızını düşürmeyecek kadar.
- **Ana mekanik değildir:** Gün içinde görünmez; yalnız sabah yer seçerken ve yeni mahalle açılırken açılır.

**Görsel üretim yolu (karar senin):**

Referanstaki dünya elle boyanmış 3B görüntüdür. Bugün oyundaki her şey kodla çizilen SVG/canvas.

- **(A) Kodla çizilen 2.5B minyatür kasaba**
  - Gölgeli evler, dokulu çatılar, katmanlı ağaçlar, animasyonlu su ve insanlar.
  - Bugünkünden çok daha zengin olur ve tamamen benim elimde.
  - Ama referansın ressam elinden çıkma dokusuna ulaşmaz.
- **(B) Boyanmış katmanlar**
  - Bir ressamın ya da senin üreteceğin görseller (zemin, mahalle parçaları, sis katmanları) gelir.
  - Ben bunları oyuna bağlarım: tıklanabilir alanlar, animasyonlu katmanlar (insanlar, kuşlar, su ışıltısı, sis), açılış geçişleri.
  - Referansa en yakın sonuç budur.
- **Öneri:** Harita kodu katmanlı kurulur; önce (A) ile oynanır hâle gelir, (B) görselleri geldiğinde katmanlar yer değiştirir. Aynı yol araba için de geçerli.

---

## 8. Sade arayüz

Ekranda yalnız o anın işi görünür:

| An | Görünen | Gizli |
|---|---|---|
| **Sabah** | Para, gün, mahalle adı · 3 düğme: 📦 Toptancı, 🗺️ Harita, ☀️ Dükkânı aç · arabaya dokunma ipucu | Defter (küçük simge, sağ üst), ayarlar |
| **Satış** | Para, saat çubuğu · pazarlık şeridi (yalnız müşteri tezgâhtayken) · hız düğmesi | Her şey |
| **Raf modu** | Raflar, depo paneli, «Bitti», «Boşlukları doldur» | Diğer her şey |
| **Akşam** | Tek kart: kazanç, en iyi satış, Güven değişimi, yaklaşılan hedef çubuğu · «Atölye» (geliştirmeler) · «Yarın» | – |

**Atölye:** Tek bir geliştirme ekranı; bugünkü Süsle, Raf büyüt ve Geliştirme menülerinin birleşimi. Arabanın kendisi üstünde gösterilir: yuvaya dokun → seçenekler → al → yerine takılır.

**İlk 5 dakikanın öğreticisi:** Metin yığını yok. 4 kısa vurgu yeter: arabaya dokun, kitabı rafa sürükle, ilk pazarlık, akşam kartı.

## 9. Animasyon ve ses

**Kural:** Hiçbir animasyon kontrolü bekletmez. Her biri ≤ 0,6 sn'dir ve dokununca atlanır.

| Eylem | Animasyon | Ses |
|---|---|---|
| Kitabı tut / bırak | Büyü + yüksel + gölge / esne ve otur | kâğıt hışırtısı / tok |
| Raf kapağı | Yumuşak açılma, hafif sekme | ahşap gıcırtı |
| Müşteri teklifi | Konuşma balonu pıt diye açılır, yüz ifadesi değişir | kısa mırıltı (tipe göre ton) |
| Satış | Kitap raftan uçar → kâğıda sarılır → uzanır → paralar kasaya düşer, "+₺9" süzülür | kasa çıngırağı |
| Mutlu satış | Müşterinin üstünde küçük kalp/nota | tatlı akor |
| Müşteri gider | Omuz silkme, yürüyüş | – |
| Modül satın alma | Parça iner ve oturur, toz bulutu, araba hafifçe sallanır | çekiç tık tık + çan |
| Mahalle açılışı | Sis dağılır, yol çizilir, ışıklar yanar | rüzgâr + müzik motifi |
| Basamak atlama (yeni araba) | Kamera geri çekilir, yeni araç gelir, konfeti | kısa fanfar |

---

## 10. Aşamalı geliştirme planı

Her faz ayrı commit ve yayın olur.
- Yayından önce: `npm test` ("test geçti"), denge simülasyonu, başsız Chrome ekran görüntüleri.
- Yayından sonra: Actions sonucu ve canlı paket kontrolü.
- Her fazın sonunda oyun oynanır kalır.

### Faz 0 — Sadeleştirme (yeni özellik yok)
- **Kenara alma:** `LEGACY` bayrağı ile Akdeniz kenara alınır: ülkeler, feribot, pasaport, ülke mekanikleri, büyük final.
- **Arayüzden kaldırılanlar:** ilanlar, gazete, sponsorluk, bağış, pul albümü, istatistik.
- **Düğmeler:**
  - Alt çubuk 6 düğmeden 3 düğmeye iner.
  - Defter 2 sekmeye iner.
  - Oyun Defter açık başlamaz.
- **Kayıt şeması v4:** Mevcut kayıtlar taşınır. Para, kitaplar, süsler ve müdavimler korunur. Yabancı ülkedeki oyuncu Ayvalık'a döner; bukinist kutusundaki ve müzayededeki kitaplar koliye gelir.
- **Türkiye kasabaları geçici olarak kalır:** hikâye ve müdavimler onlara bağlı. Faz 6'da Mürekkep Koyu mahallelerine dönüşürler.
- **Simülasyon:** Gerçekçi oyuncu botu korunur, ülke ölçümleri kaldırılır.
- **Bitiş ölçütü:** Testler geçer. Eski kayıt yeni sürümde açılır. İlk ekranda en fazla 3 düğme vardır.
- **Durum (24.10.2026): yapıldı.**
  - Bayraklar `data/features.js`'te (`LEGACY` yerine sistem başına bir bayrak).
  - Mekân üstteki konum hapında; süs ve Defter sağ üstte.
  - Sabah gazetesi yerine tek satır.
  - Defter: Hikâye + Müşteriler.
  - `npm run ui-check`: 31 panel, Türkçe ve İngilizce; CI'da.
  - Mektup, ilan ve pul ödülleri kalkınca gerçekçi oyuncunun 60. gün parası ₺6,0k'dan ₺5,3k'ya indi. Ekonomi Faz 1 ve Faz 3'te yeniden ayarlanacak.

### Faz 1 — Pazarlık çekirdeği (öncelik 1)
- **Kurallar:** `game/haggle.js`:
  - müşteri özellikleri (dağılımlar, huylar)
  - V / W / R hesabı, hamleler, sabır, sonuç, Güven
  - sessiz alıcılar
- **Fiyat ölçeği:** ×2.
- **Bağlantı:** `resolveCustomer` yerini "göz at → sessiz al / tezgâha gel / sor" akışına bırakır. Öneri akışı pazarlığa bağlanır.
- **Arayüz:** pazarlık şeridi (3 fiyat düğmesi + Vazgeç), müşterinin cümleleri, temel yüz ifadeleri. Pazarlıkta saat durur.
- **Testler:** her hamlenin sonucu, sabır sınırları, bütçe aşılmaz, aynı tohumla aynı sonuç.
- **Simülasyon:** pazarlık botları; 4.3'teki hedefler.
- **Bitiş ölçütü:**
  - Bir pazarlık ≤ 25 sn sürer.
  - Akıllı oynayan, hep kabul edenden %30+ fazla kazanır.
  - Kendi oynayışımın ekran kaydıyla gösterilir.
- **Durum (24.10.2026): yapıldı, bir ölçüt eksik.**
  - Kurallar `game/haggle.js` ve `data/haggle.js`'te. Akış `game/shop.js`'te: `resolveCustomer`, `recommend`, `haggleMove`. Pazarlık sırasında kitap müşterinin elindedir; anlaşma olmazsa aynı yerine döner. Arayüz `ui/panels/haggle.js`: telefonda alttan şerit, geniş ekranda sağ alt köşede.
  - **Ölçümle gelen bir tasarım düzeltmesi:**
    - İlk modelde yalnız parası yetmeyenler pazarlık ediyordu. Onları zorlamak riskliydi, kabul etmek hep doğruydu; "hep kabul" en çok kazanıyordu.
    - Şimdi bir kısım müşteri parası yettiği hâlde alışkanlıktan pazarlık eder ve etikete razıdır. Bunlar «Pazarlıksız olmaz ama…» gibi konuşur; cebi dar olanlar «Harçlık bu kadar…» der.
    - Beceri bu cümleyi okumaktır.
  - **Ağızdan ağıza:** Pazarlıkta ucuza alan müşteri ertesi güne yalnız %0,5 kalabalık getirir (`dealWord`). Ucuz etiketle ikna olan müşteride bu %3'tür.
  - **Fiyat ölçeği:** Kitap fiyatları, başlangıç parası, bahşiş, park, yakıt ve karavan eşyaları ×2. Olay ödülleri aynı kaldı.
  - **Ölçüm** (`npm run sim -- pazarlik`; gerçekçi oyuncu, 30 oyun × 60 gün):

    | Tavır | 7. gün | 30. gün | 60. gün |
    |---|---|---|---|
    | Hep kabul | ₺907 | ₺3713 | ₺9279 |
    | Cümleyi okuyan (alışkanlıkla açana fiyatında dur, cebi dara orta yol) | +%22 | +%10 | +%2 |
    | Hep fiyatında | | | −%46 (müşterilerin %47'si gider) |

  - **Eksik ölçüt:** "%30+ fazla kazanır" tutmadı. Pazarlık, etiketin %68'i yerine %82'sini aldırıyor. Ama uzun vadede kâr raf kapasitesiyle sınırlı ve fark kapanıyor. Söz kartları (Faz 2) farkı büyütecek yer.

### Faz 2 — Söz kartları ve müşteri karakterleri (öncelik 1)
- **Söz kartları:** konu, kondisyon, nadirlik, kişisel, hatıra; müşterinin "derdi" ve ilk cümledeki ipucu.
- **Tepki cümleleri:** ~300 cümle, TR + EN.
- **Görünüm:** 6 yüz ifadesi ve beden dili; tip ve huyun görünüşe yansıması.
- **Müdavimler:**
  - pazarlıktan doğan müdavimler, hafıza ve özel siparişler
  - Defter > Müşteriler kartları ve keşfedilen özellikler
- **Bitiş ölçütü:** 4.3'teki söz hedefi tutar. Aynı tipten iki müşteri gözle görülür farklı davranır. Tepki cümleleri tekrar etmez (`memory.js` pencereleri).

### Faz 3 — Para ve ilerleme (öncelik 2)
- **Atölye:** tek geliştirme ekranı.
- **Ekonomi:** tür kilitleri, nadir kitap mezatı, satış araçları (çay, paket köşesi, fener, çırak).
- **Araba basamakları:** seviye 1 → 2 → 3 veri olarak tanımlanır. Geçici görsel bugünkü karavanın büyüyen hâli olur; son görsel Faz 5'te gelir.
- **Kira ve hedef:** günlük tezgâh kirası; akşam kartında "sıradaki hedef" çubuğu.
- **Ayar:** simülasyonla zaman çizelgesi 4.4'e oturtulur.
- **Bitiş ölçütü:** İlk modül ~10. dk'da, seviye 2 ~30. dk'da alınabilir. Her harcama sahnede bir şey değiştirir.

### Faz 4 — Raf ve depo etkileşimi (öncelik 3)
- **Depo paneli:** kapaklar ve adetler; telefonda çekmece.
- **Raf hareketleri:** raf kapakları; kitap kaldırma, gölge, yer açma, esneme ve oturma animasyonları; rafa geri koyma.
- **Fiyat kartları ve hızlı yerleştirme:** raftaki fiyat kartı; «Boşlukları doldur».
- **Satış animasyonu:** kitap raftaki yerinden kalkar ve paketlenip uzatılır.
- **Ses:** efektler prosedürel sese eklenir.
- **Veri güdümlü yuvalar:** raf yuvaları veriden gelir; araba değişince kod değişmez.
- **Bitiş ölçütü:** CDP ile sürükle-bırak testleri. Telefonda 60 kare (iPhone profili, başsız ölçüm). Dizme elle ve hızlı yoldan yapılabilir.

### Faz 5 — Yeni kitap arabası (öncelik 4; **referans görsel gelince**)
- **Görsel:** referansa göre üç çeyrek bakışlı araba; seviye 1–3.
- **Modüller:** modül yuvaları ve yapım animasyonu.
- **Kişiselleştirme:** tente, ahşap, boya, lamba, tabela, bitki, objeler.
- **Bitiş ölçütü:** Her satın alma arabada görünür. Kitap sırtları ve kapakları telefonda ayırt edilir.

### Faz 6 — Mürekkep Koyu haritası (öncelik 5)
- **Mahalleler:** 7 mahalle; veride mahalle başına müşteri karışımı, talep, kira, açılış koşulu ve olaylar.
- **Harita:** katmanlı harita; canlılık animasyonları; sis kalkma ve yol açılma.
- **Eski sahne:** Mahalle sahnelerinin arka planı mevcut `spot-art` / `atmos` çizimlerinden türetilir.
- **Bitiş ölçütü:** Mahalle seçimi kazancı ölçülebilir biçimde değiştirir (simülasyonda mahalleler arası anlamlı fark). Harita telefonda akıcıdır.

### Faz 7 — Teyzenin dükkânı ve cila (öncelik 6)
- **Dükkân:** Dükkân basamağı; iç mekân rafları (aynı veri güdümlü raf sistemi); genişletmeler.
- **Hikâye:** hikâyenin kısaltılmış mektupları.
- **Yeni oyuncu deneyimi:** ilk 5 dakikanın öğreticisi ve akışın uçtan uca cilası.
- **Çeviri:** İngilizce metinlerin tamamlanması.

**Sıra:** 0 → 1 → 2 → 3 → 4 → (referans gelince 5) → 6 → 7.
- Faz 4 bugünkü araba üzerinde, veri güdümlü kurulur. Böylece referans gecikse de iş durmaz.
- Referans erken gelirse Faz 5, Faz 3'ün hemen ardından alınabilir.

## 11. Dürüst sınırlar ve açık sorular

- **Görsel kalite:**
  - Kodla çizerek sıcak, detaylı ve canlı bir minyatür dünya kurabilirim. Referanstaki boyanmış 3B dokuya birebir ulaşamam. Bunun yolu boyanmış görsellerdir (7. bölüm, yol B).
  - Görsel dosya üretemiyorum ve izinsiz indirme yapmıyorum. Gelecek görselleri oyuna bağlarım.
- **Ses:** Efektler prosedürel üretilir. Gerçek kayıt istenirse dosyaların sağlanması gerekir.
- **Metin yükü:** ~300 tepki cümlesi, mahalle metinleri, hikâye mektupları. Türkçe ve İngilizce yazılacak; fazlara bölündü.
- **Kenara alınan sistemler:** Akdeniz turu (Faz 5 işinin büyük kısmı) oyundan çekilir. Kod ve kayıt verisi durur; ileride "tatil gezisi" gibi bir son oyun içeriği olarak dönebilir.
- **Açık sorular:**
  1. Harita ve araba görselleri için yol A mı, B mi (ya da önce A, sonra B)?
  2. Kasaba adı «Mürekkep Koyu» ve mahalle adları uygun mu?
  3. Başlangıç bir el arabası mı olsun, yoksa gönderilecek referanstaki araba mı başlangıç olsun?
