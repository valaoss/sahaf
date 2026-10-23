// Akdeniz defteri: her ülkenin kendine özgü bir işi (game/voyage.js) ve üç sayfalık yan hikâyesi.
// Sayfalar sırayla açılır: ilki o ülkede ilk dükkânı açınca, sonrakiler ülkenin işinde need eşiğine varınca.
// Beş hikâyenin sonunda karavanda kütüphanenin beş parçası toplanır; Cunda tepesinde açılış töreni yapılır (GRAND).
export const VOYAGE = {
  gr: {
    title: 'Midilli\'deki matbaa', mech: 'Ada günü', icon: '⛵', stat: 'islandDays', unit: 'ada günü', need: [0, 1, 3],
    how: 'Yunan kasabalarında mekânlardan biri kayıkla geçilen bir ada: turist çok, kayık ücretli, adada toptancı yok. Kitaplarını karşıda alıp öyle geç.',
    piece: 'Kostas Matbaası\'nın harf kasası',
    pages: [
      { title: 'Liman kahvesindeki dizgici', text: 'Midilli\'de, liman kahvesinde yaşlı bir dizgici Kostas\'ı hatırladı: "Burada, babasının matbaasında büyüdü. Kurşun harfleri dizip deniz kokan kitaplar basarlardı." Matbaa çoktan kapanmış; ama adalarda onun bastığı kitapları saklayan evler varmış.' },
      { title: 'Solgun künye', text: 'Karşı adanın iskelesinde bir kadın, dedesinin rafından solgun bir kitap çıkardı. Künyesinde "Basıldığı yer: Kostas Matbaası, Mitilini" yazıyordu. Sayfaların arasında bir not: "Kitap, denizi geçince değerlenir."' },
      { title: 'Şapeldeki sandık', text: 'Üçüncü adada şapelin bekçisi seni bekliyormuş gibiydi. Ahşap bir sandıkta Kostas\'ın matbaasından kalan son harf kasası duruyordu. "Kütüphanesi için," dedi, "bir gün biri gelir de götürür diye saklıyordum." Harf kasası artık karavanında.' },
    ],
  },
  it: {
    title: 'Venedik\'teki iz', mech: 'Müzayede', icon: '🔨', stat: 'auctions', unit: 'müzayede', need: [0, 1, 2],
    how: 'İtalyan kasabalarında sabah bir ilk baskıyı müzayedeye verirsin; akşam açık artırmada satılır. Fiyat şansa bağlı ama çoğu zaman koleksiyoncudan iyi.',
    piece: 'Murano\'daki ceviz raf',
    pages: [
      { title: 'Antikacının hatırası', text: 'Venedik\'te bir antikacı, Kostas\'ın adını duyunca dükkânın arkasına geçti. "Gençliğinde buraya gelirdi; eski baskıların peşinde, cebinde tek kuruş olmadan," dedi. "Müzayedelerde hep izler, hiç almazdı."' },
      { title: 'Salonun dibindeki kadın', text: 'Açık artırmada senin kitabın el değiştirirken salonun dibindeki yaşlı bir kadın gülümsedi: "Kostas da bir kez buraya kitap getirmişti. Parasıyla bir raf aldı, kendi kütüphanesi için." Rafın Murano\'da bir depoda durduğunu söyledi.' },
      { title: 'Ceviz raf', text: 'Murano\'daki depoda, cam ustalarının arasında, üstü toz bağlamış ceviz bir raf: arkasına oyulmuş tek kelime, "Kostas". Usta rafı karavanına yüklerken "Kitapsız raf, şarkısız gondol gibidir," dedi.' },
    ],
  },
  fr: {
    title: 'Marsilya\'daki sandık', mech: 'Bukinist kutusu', icon: '📦', stat: 'bqSold', unit: 'kutudan satış', need: [0, 5, 15],
    how: 'Fransız kasabalarında bir haftalığına yeşil bir bukinist kutusu kiralarsın. Kolideki kitapları içine koy; sen nerede olursan ol her gece birkaç tanesi satılır.',
    piece: 'Kostas\'ın mektup sandığı',
    pages: [
      { title: 'Yeşil kutular', text: 'Marsilya\'da bukinistler yeşil kutularını açarken birinin elinde Nermin Teyzenin fotoğrafını gördün. "Bu kadın her yaz gelirdi," dedi adam. "Kostas\'ın sandığını o bıraktı bize; gümrükte kalmıştı."' },
      { title: 'Mektuplar', text: 'Bukinistler seni aralarına aldıkça anlattılar: sandık kırk yıl önce bir gemiyle gelmiş, sahibi bulunamamış. İçinde kitaplar değil mektuplar varmış: Kostas\'ın ülke ülke sahaflara yazdığı mektuplar.' },
      { title: 'Son mektup', text: 'Son satıştan sonra bukinistlerin en yaşlısı sandığı karavanına taşıdı. Mektupların sonuncusu sana yazılmış gibiydi: "Kim bu sandığı açarsa, kütüphanem onun rafında yeniden doğsun." Sandık artık karavanında.' },
    ],
  },
  es: {
    title: 'Barselona\'daki defter', mech: 'Gül ve kitap', icon: '🌹', stat: 'roseSold', unit: 'gülle satış', need: [0, 6, 20],
    how: 'İspanyol kasabalarında sabah gül alırsın; gülle satılan her kitap bahşiş getirir, satılmayan güller akşam solar. Haftada bir Gül ve Kitap Günü sokaklar dolar.',
    piece: 'Kütüphanenin katalog defteri',
    pages: [
      { title: 'Gül ve kitap', text: 'Barselona\'da kitapçılar sana Sant Jordi\'yi anlattı: o gün herkes sevdiğine bir gül ve bir kitap verir. "Kostas bu günü çok severdi," dedi bir çiçekçi. "Yazdığı bir şeyi burada bir dostuna emanet etmişti."' },
      { title: 'Yaşlı yayıncı', text: 'Güllerin kokusu arasında yaşlı bir yayıncı seni tanıdı: "Kostas\'ın defteri bende. Kütüphanesindeki her kitabın neden orada olduğunu yazmış." Ama defteri ancak kitabı gülle satmayı bilen birine verecekmiş.' },
      { title: 'İlk sayfa', text: 'Yayıncı sonunda defteri getirdi. İlk sayfada Kostas\'ın el yazısı: "Bir kütüphane, kitapların listesi değil; onları verdiğin insanların listesidir." Kütüphanenin katalog defteri artık karavanında.' },
    ],
  },
  eg: {
    title: 'İskenderiye\'nin rüyası', mech: 'El yazması onarımı', icon: '🪶', stat: 'restored', unit: 'onarım', need: [0, 4, 10],
    how: 'Mısır kasabalarında kâğıt ustasının atölyesinde yıpranmış ya da iyi bir kopyayı temize çevirirsin (raf modunda kitabı seç, "Onar"). Temiz kitap daha pahalı satılır.',
    piece: 'Kütüphane Defteri, Cilt I',
    pages: [
      { title: 'Kordondaki usta', text: 'İskenderiye\'nin kordonunda bir kâğıt ustası, Kostas\'ın gençken buraya geldiğini anlattı: "Antik kütüphanenin yandığı yerde durup ağlamış. Bir kütüphane bir daha kaybolmasın diye yemin etmiş."' },
      { title: 'Yarım kalan onarım', text: 'Atölyede yıpranmış sayfaları yeniden bağlarken usta rafın üstündeki eski bir kutuyu gösterdi. İçinde Kostas\'ın yarım bıraktığı bir onarım vardı: deniz suyuna batmış bir kitap, adı okunmuyor.' },
      { title: 'Cilt I', text: 'Yarım kalan onarımı birlikte bitirdiniz. Kapakta silik harfler belirdi: "Deniz Görmeyen Kitaplar — Kütüphane Defteri, Cilt I." Usta kitabı sana uzattı: "Kütüphane artık tamam. Onu evine götür."' },
    ],
  },
};
export const VOYAGE_KEYS = Object.keys(VOYAGE);

// Açılış töreni: beş hikâye bitince (ve ana hikâye tamamsa) Cunda tepesinde dükkân aç
export const GRAND = {
  title: 'Kütüphanenin açılışı', coins: 500,
  hint: 'Beş ülkenin parçası karavanında: Cunda\'da, Ada tepesinde dükkân aç.',
  text: 'Cunda tepesinde, şapelin yanında kütüphanenin kapısı bu sefer ardına kadar açık. Midilli\'nin harf kasası, Murano\'nun ceviz rafı, Marsilya\'nın sandığı, Barselona\'nın katalog defteri ve İskenderiye\'nin onarılmış cildi yerlerini buldu. Kasabalardan dostların geldi; kimi ağlarını bırakıp, kimi öğrencilerini alıp. Kostas\'ın "deniz görmeyen kitapları" artık her gün denizi görüyor: kütüphane açık, karavan yine yolda.',
};
