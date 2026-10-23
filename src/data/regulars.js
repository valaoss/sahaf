// Müdavimler: her kasabada iki tanıdık yüz. Kendi zevklerine göre öneri isterler.
// Tam isabet her öneri bir kalp (en fazla 5). 3 kalpte bahşişleri artar, 5 kalpte hediye verirler.
// look: görünüm tohumu (render/people.js) — hep aynı kıyafet
export const HEARTS_MAX = 5;
export const HEARTS_TIP = 3;       // bu kalpten sonra her alışverişte ek bahşiş
export const REGULAR_TIP = 3;
export const VISIT_CHANCE = 0.45;  // kasabasında açık olan bir günde uğrama ihtimali

export const REGULARS = {
  hasan: { name: 'Hasan Usta', town: 'ayvalik', look: 31, genre: 'roman', likes: ['deniz', 'yalniz', 'macera'],
    hello: 'Kırk yıldır bu iskeleden ağ atarım. Akşamları da kitap… Bana denizi seven bir şey bul bakalım.',
    thanks: 'Eline sağlık evladım. Bu kitap tam teknede okunacak cinsten.',
    gift: 'zeytin', giftNote: 'Bahçemdeki ağaçtan bir dal ördüm sana. Karavanın çatısına yakışır.' },
  melis: { name: 'Melis Öğretmen', town: 'ayvalik', look: 58, genre: 'cocuk', likes: ['cocukluk', 'aile', 'umut'],
    hello: 'Sınıfım için kitap topluyorum. Çocukların içini ısıtacak bir şey arıyorum.',
    thanks: 'Öğrencilerim buna bayılacak! Teşekkür ederim.',
    gift: null, giftNote: 'Öğrencilerim senin için kart yaptı, bir de küçük bir katkı: kasana ₺40 bıraktım.' },
  ruya: { name: 'Ressam Rüya', town: 'cunda', look: 77, genre: 'siir', likes: ['ask', 'huzun', 'doga'],
    hello: 'Adanın ışığını boyuyorum. Resim yaparken şiir okurum, bana bir şiir kitabı lazım.',
    thanks: 'Bu kitabı okurken bir tablo çıkacak, biliyorum.',
    gift: 'kabuk', giftNote: 'Kumsalda topladığım kabukları bir kavanoza koydum. Senin masana.' },
  selim: { name: 'Doktor Selim', town: 'cunda', look: 104, genre: 'polisiye', likes: ['gizem', 'felsefe', 'sehir'],
    hello: 'Emekli oldum, adaya yerleştim. Akşamları bir bilmece çözmeden uyuyamam.',
    thanks: 'Hah! Katili ilk elli sayfada bulacağım, görürsün.',
    gift: null, giftNote: 'Sana borçluyum. Şu ₺40 kasanda dursun, yeni kitaplara.' },
  nuri: { name: 'Kaptan Nuri', town: 'foca', look: 140, genre: 'tarih', likes: ['deniz', 'savas', 'macera'],
    hello: 'Tekneyle turist gezdiririm ama asıl merakım eski denizciler, eski savaşlar.',
    thanks: 'Bu kitap güverteye çıkar, söz.',
    gift: 'fok', giftNote: 'Tekneme fok resmi yapan çocuk bunu da oymuş. Senin kaldırımına yakışır.' },
  ela: { name: 'Küçük Ela', town: 'foca', look: 9, genre: 'fantastik', likes: ['buyu', 'hayvan', 'komik'],
    hello: 'Ben dokuz yaşındayım! Ejderhalı, büyülü, hayvanlı kitaplar seviyorum.',
    thanks: 'Yaşasın! Annem bu gece erken yatmama izin vermeyecek artık!',
    gift: null, giftNote: 'Kumbaramı kırdım, sana ₺40 getirdim! Yeni kitaplar al, olur mu?' },
  zeynep: { name: 'Sörfçü Zeynep', town: 'alacati', look: 211, genre: 'fantastik', likes: ['macera', 'yolculuk', 'umut'],
    hello: 'Rüzgâr dinince kumsalda okurum. Beni uzaklara götürecek bir kitap ver.',
    thanks: 'Harika! Rüzgâr çıkana kadar bitiririm herhalde.',
    gift: 'degirmen', giftNote: 'Bu minik değirmeni rüzgâr sörfü tahtamın kırığından yaptım. Çatına tak!' },
  bora: { name: 'Kafeci Bora', town: 'alacati', look: 260, genre: 'polisiye', likes: ['komik', 'sehir', 'gizem'],
    hello: 'Kafemde müşterilere kitap ödünç veriyorum. Hafif, eğlenceli, biraz da gizemli olsun.',
    thanks: 'Bunu tezgâhın üstüne koyacağım, herkes soracak.',
    gift: null, giftNote: 'Kafemdeki kitap köşesi senin sayende doldu. Al şu ₺40, benden.' },
  // hikâye ilerledikçe açılan kasabaların müdavimleri
  mustafa: { name: 'Bağcı Mustafa', town: 'bozcaada', look: 333, genre: 'roman', likes: ['doga', 'aile', 'umut'],
    hello: 'Üç kuşaktır bu adada bağ bozarız. Hasat bitti, şimdi okuma zamanı.',
    thanks: 'Bunu bağ evinin verandasında okuyacağım, üzüm kokusuyla.',
    gift: null, giftNote: 'Bu yılın ilk şişe şırası ve ₺40: bağdan selam olsun.' },
  inci: { name: 'Fotoğrafçı İnci', town: 'bozcaada', look: 412, genre: 'siir', likes: ['deniz', 'ask', 'huzun'],
    hello: 'Adanın ışığını fotoğraflıyorum. Gün batımını beklerken şiir okurum.',
    thanks: 'Bu kitaptaki bir dizeyi fotoğraf sergimin adı yapacağım.',
    gift: null, giftNote: 'Karavanının gün batımındaki fotoğrafını çerçeveledim, bir de ₺40 bıraktım.' },
  nine: { name: 'Masalcı Nine', town: 'sirince', look: 501, genre: 'cocuk', likes: ['buyu', 'cocukluk', 'komik'],
    hello: 'Köyün çocuklarına her akşam masal anlatırım. Yeni masallar lazım bana, yavrum.',
    thanks: 'Bu masalı bu akşam anlatacağım; çocuklar uyumadan bitirebilirsem.',
    gift: null, giftNote: 'Kendi elimle yaptığım incir reçeli ve ₺40. Masallara katkın için.' },
  cem: { name: 'Arkeolog Cem', town: 'sirince', look: 617, genre: 'tarih', likes: ['savas', 'gizem', 'felsefe'],
    hello: 'Efes kazısından dönüyorum. Toprağın altındakiler kadar kitapların içindekiler de ilgimi çekiyor.',
    thanks: 'Kazı çadırında okunacak tam kitap.',
    gift: null, giftNote: 'Kazıda bulduğumuz bir sikkenin kopyası (aslı müzede!) ve ₺40.' },
  // dünyanın büyümesiyle açılanlar
  riza: { name: 'Emekli Komiser Rıza', town: 'dikili', look: 702, genre: 'polisiye', likes: ['gizem', 'sehir', 'yalniz'],
    hello: 'Otuz yıl İzmir emniyetinde çalıştım. Şimdi katilleri yalnızca kitaplarda kovalıyorum.',
    thanks: 'Hah, kokusundan anladım: bu kitapta sağlam bir dava var.',
    gift: null, giftNote: 'Eski rozetimi veremem ama şu ₺40 kasanda dursun. Dosya kapandı.' },
  deniz: { name: 'Cankurtaran Deniz', town: 'dikili', look: 744, genre: 'cocuk', likes: ['macera', 'hayvan', 'komik'],
    hello: 'Yaz boyu kumsalda nöbetteyim. Kuleden çocuklara sesli kitap okuyorum, inanır mısın?',
    thanks: 'Bunu kulede okuyacağım; dalga sesi fon müziği olur.',
    gift: null, giftNote: 'Çocuklar senin için kumdan bir karavan yaptı, fotoğrafı burada. Bir de ₺40.' },
  leyla: { name: 'Seramikçi Leyla', town: 'urla', look: 818, genre: 'siir', likes: ['doga', 'umut', 'ask'],
    hello: 'Atölyede çamurla uğraşırken biri bana şiir okusun isterim. Şimdilik kendim okuyorum.',
    thanks: 'Bu dizeleri bir vazonun üstüne kazıyacağım.',
    gift: null, giftNote: 'Fırından yeni çıktı: üstünde senin karavanın olan bir kâse. Bir de ₺40.' },
  orhan: { name: 'Orhan Hoca', town: 'urla', look: 866, genre: 'roman', likes: ['felsefe', 'yalniz', 'sehir'],
    hello: 'Kırk yıl felsefe öğrettim, şimdi enginar yetiştiriyorum. İkisi de sabır ister.',
    thanks: 'Güzel seçim. Bu kitabın üstüne uzun bir yürüyüş yapmam gerek.',
    gift: null, giftNote: 'Bahçemin ilk enginarları ve ₺40. Sorular bitmesin.' },
  atlas: { name: 'Kaptan Atlas', town: 'assos', look: 921, genre: 'tarih', likes: ['deniz', 'yolculuk', 'savas'],
    hello: 'Midilli\'ye günde iki sefer yaparım. Karşı kıyının hikâyesi bitmez.',
    thanks: 'Bu kitap beni güverteden Midilli\'ye kadar götürür.',
    gift: null, giftNote: 'Feribotun eski dümen çarkından bir parça ve ₺40. Rüzgârın bol olsun.' },
  yorgos: { name: 'Sahaf Yorgos', town: 'midilli', look: 1033, genre: 'roman', likes: ['yolculuk', 'deniz', 'aile'],
    hello: 'Kaptan Atlas\'ın bahsettiği sahaf sensin demek! Ben de karşı kıyının sahafıyım. Hoş geldin, meslektaş.',
    thanks: 'Bunu rafıma değil, başucuma koyacağım. Meslek sırrı.',
    gift: null, giftNote: 'Dükkânımın eski tabelası: "ΒΙΒΛΙΑ". Bir de ₺40, kıyılar arası ticaretin şerefine.' },
  maria: { name: 'Zeytinci Maria', town: 'midilli', look: 1077, genre: 'siir', likes: ['doga', 'umut', 'huzun'],
    hello: 'Hasat zamanı ağaçların altında şiir okurum. Zeytin sabırlı ağaçtır, şiir de öyle.',
    thanks: 'Ağaçlarım bu şiirleri sevecek, eminim.',
    gift: null, giftNote: 'Bu yılın ilk sıkım zeytinyağı ve ₺40. Ayvalık\'takilere de selam söyle.' },
  nikos: { name: 'Öğrenci Nikos', town: 'atina', look: 1121, genre: 'tarih', likes: ['felsefe', 'savas', 'sehir'],
    hello: 'Felsefe bölümündeyim. Hocam "Sokrates gibi sor" diyor, ben de sana soruyorum: hangi kitap?',
    thanks: 'Bu kitabı derste tartışmaya açacağım. Hocam şaşıracak!',
    gift: null, giftNote: 'Tezimin teşekkür sayfasının bir kopyası (adın orada) ve ₺40.' },
  despina: { name: 'Tiyatrocu Despina', town: 'atina', look: 1169, genre: 'roman', likes: ['ask', 'huzun', 'komik'],
    hello: 'Antik tiyatroda Antigone oynuyorum. Rol dışında da başka hayatlar okumak isterim.',
    thanks: 'Bunu kuliste okuyacağım; perde arası tam bir bölüm.',
    gift: null, giftNote: 'Galamıza iki bilet ve ₺40. Ön sıra senin.' },
  aleko: { name: 'Rebetikocu Aleko', town: 'selanik', look: 1213, genre: 'siir', likes: ['huzun', 'yalniz', 'sehir'],
    hello: 'Buzukim ve ben her gece bir tavernadayız. Şarkı sözlerim tükendi, bana şiir lazım.',
    thanks: 'Bu dizelerden bir şarkı çıkar, sana ithaf ederim.',
    gift: null, giftNote: 'Yeni şarkımın notaları; adı "Karavan". Bir de ₺40.' },
  sofia: { name: 'Mimar Sofia', town: 'selanik', look: 1261, genre: 'polisiye', likes: ['gizem', 'sehir', 'savas'],
    hello: 'Eski binaları restore ediyorum. Her duvarın içinden bir hikâye çıkıyor, bazen bir sır.',
    thanks: 'Bunu şantiyede öğle arasında bitiririm.',
    gift: null, giftNote: 'Restore ettiğimiz konağın bir tuğlası (hatıra!) ve ₺40.' },
  ioanna: { name: 'Ressam Ioanna', town: 'santorini', look: 1305, genre: 'fantastik', likes: ['buyu', 'ask', 'deniz'],
    hello: 'Her akşam aynı gün batımını boyuyorum ve hiç aynı olmuyor. Bana başka dünyalar anlatan bir kitap ver.',
    thanks: 'Bu kitabın renklerini tuvale taşıyacağım.',
    gift: null, giftNote: 'Karavanının gün batımındaki resmi ve ₺40. Kubbeler mavi, karavan nane yeşili.' },
  pavlo: { name: 'Balıkçı Pavlo', town: 'santorini', look: 1349, genre: 'cocuk', likes: ['deniz', 'hayvan', 'macera'],
    hello: 'Torunlarım adaya her yaz gelir. Akşamları onlara kitap okurum ama Yunanca kitaplar bitti!',
    thanks: 'Türkçesini ben çeviririm, onlar resimlere bakar. Teşekkürler!',
    gift: null, giftNote: 'Teknemde oyduğum küçük bir balık ve ₺40. Torunlar selam yolladı.' },
  eleni: { name: 'Eleni Hanım', town: 'assos', look: 977, genre: 'siir', likes: ['huzun', 'aile', 'yolculuk'],
    hello: 'Anneannem karşı kıyıdan gelmiş. Ben burada doğdum, iki dilde rüya görürüm.',
    thanks: 'Çok güzel. Bunu anneannemin sandığına, onun kitaplarının yanına koyacağım.',
    gift: null, giftNote: 'Anneannemin sandığından bir dantel ve ₺40. Artık sen de bu kıyıdansın.' },
};
// Hikâyeler: kalp sayısı arttıkça müdavim biraz daha açılır (story[n-1], n kalpteyken söylenir)
const STORIES = {
  hasan: [
    'Rahmetli hanım da okurdu. Ben onun kitaplarını teknede bir bir bitiriyorum şimdi.',
    'Oğlum İzmir\'de mühendis oldu. Denize çıkmaz, ama telefonda ona okuduklarımı anlatıyorum.',
    'Bu sabah yunuslar teknenin yanında yüzdü. Kırk yılda üçüncü kez. İyiye işaret, dedim.',
    'Torunum yazın gelecek. Ona ilk kitabını senden alacağım, şimdiden söyleyeyim.',
    'Sen bu kasabaya iyi geldin evladım. İskele eskisi gibi sessiz değil artık.',
  ],
  melis: [
    'Sınıfta bir okuma köşesi kurdum. Minderleri annelerden topladık!',
    'Arka sıradaki Emir hiç okumazdı. Dün teneffüste kitabını bırakmadı.',
    'Öğrencilere "en sevdiğin kitabı anlat" ödevi verdim. Yarısı senden aldıklarımızı anlattı.',
    'Okul müdürü kütüphane için bütçe ayırdı. Listeyi seninle yapmak istiyorum.',
    'Çocuklar sana "kitap amca" ya da "kitap abla" diyor. Hangisi olduğuna karar veremediler.',
  ],
  ruya: [
    'Adaya üç yaz önce bir haftalığına gelmiştim. Hâlâ buradayım.',
    'Bugün denizi boyamaya çalıştım, olmadı. Deniz her saat başka renk.',
    'Bir galeri resimlerimi İstanbul\'da sergilemek istiyor. Biraz korkuyorum.',
    'Sergiye bir resim de karavanından koyacağım, izin verirsen.',
    'Sergi çok güzel geçti. En çok soru sorulan resim seninkiydi.',
  ],
  selim: [
    'Otuz yıl şehir hastanesinde çalıştım. Ada bana ilk kez gerçekten tatil gibi geliyor.',
    'Katili tahmin etme oyunumda bu ay yedide beş tuttum. Fena değil, değil mi?',
    'Komşular hastalanınca hâlâ bana geliyor. Emeklilik dediğin böyle bir şey herhalde.',
    'Kendi polisiye romanımı yazmaya başladım. Kurban bir sahaf olacak, alınma.',
    'Romanın ilk bölümü bitti. Dedektif de sahaf çıktı, sen kurtardın kendini.',
  ],
  nuri: [
    'Teknemin adı "Fokçu". Babamdan kaldı, ben de oğluma bırakacağım.',
    'Turistler hep aynı şeyi sorar: "Foklar ısırır mı?" Isırmaz, ama kitap da okumaz.',
    'Eski denizcilerin seyir defterlerini topluyorum. Birini sende bulursam haber ver.',
    'Geçen fırtınada küçük bir tekneyi kurtardık. Gazete yazdı, gördün mü?',
    'Tekneye bir kitap rafı yaptırdım. Turistler bekleşirken okusun diye.',
  ],
  ela: [
    'Kedim Kömür senin kedine âşık oldu galiba. Hep karavana bakıyor.',
    'Okulda masal yazma yarışması var! Ejderhalı bir masal yazıyorum.',
    'Masalım sınıfta birinci oldu!!! Öğretmenim çok güzel dedi.',
    'Büyüyünce sahaf olacağım. Ya da ejderha bakıcısı. Belki ikisi birden.',
    'Bu resmi senin için çizdim: karavan, kedin ve ben. Ejderhayı da ekledim.',
  ],
  zeynep: [
    'Kış aylarında Avustralya\'da sörf hocalığı yapıyorum. Yazları buradayım.',
    'Bugün ilk kez bir öğrencim tahtada ayakta kaldı! Gün güzel geçti.',
    'Okuduğun bir kitap seni uzak bir yere götürüyorsa, bir gün oraya gerçekten gidersin. Ben öyle yaptım.',
    'Sörf okulumuzda bir kitap köşesi açtık. Tabii ki senden doldurdum.',
    'Bu kışı burada geçirmeye karar verdim. Alaçatı artık evim gibi.',
  ],
  bora: [
    'Kafeyi babamdan devraldım. Tek değişiklik: her masada bir kitap var artık.',
    'Bir müşteri kitabı bitirmek için üç kahve daha içti. Ciro arttı, sağ ol!',
    'Kafede ayda bir kitap kulübü yapıyoruz. Gelsene bir akşam.',
    'Kitap kulübü o kadar kalabalık oldu ki sandalye yetmedi.',
    'Menüye yeni bir kahve ekledim: "Sahaf usulü". Ne içinde olduğunu sorma.',
  ],
};
STORIES.mustafa = [
  'Dedem bu bağları dikerken yanında hep bir kitap taşırmış. Ben de öyle yapıyorum artık.',
  'Bu yıl dolu yağdı, üzümler yarı yarıya. Kitaplar olmasa bu kış zor geçerdi.',
  'Oğlum şehirden döndü, bağda çalışacak. Akşamları beraber okuyoruz.',
  'Bağ evini küçük bir okuma odasına çevirdim. Gelen geçen oturup okuyabilsin diye.',
  'Bu yılki şaraba değil, şıraya senin adını verdik: "Sahaf şırası". Gülme!',
];
STORIES.inci = [
  'İstanbul\'da reklam fotoğrafçısıydım. Bir gün makineyi aldım, buraya geldim, dönmedim.',
  'Kale duvarının dibinde bir kedi var, her gün aynı saatte aynı taşta oturuyor. Fotoğrafını yüz kere çektim.',
  'Fotoğraflarımla şiirleri yan yana koyuyorum. Galerici "bu bir kitap olur" dedi.',
  'Kitabın kapağına karavanının fotoğrafını koymak istiyorum. İzin verir misin?',
  'Kitap basıldı! İlk nüshası senin rafında olsun.',
];
STORIES.nine = [
  'Altmış yıldır masal anlatırım. Bazılarını ben uydurdum, kimse bilmez.',
  'Torunumun torunu bu yaz ilk kez masal dinledi. Gözleri tıpkı benimki gibi parladı.',
  'Kostas Efendi\'yi tanırdım, biliyor musun? Bana ilk masal kitabımı o vermişti.',
  'Masallarımı biri yazıya geçirsin istiyorum. Belki sen tanırsın birini?',
  'Ela adında bir kız masallarımı defterine yazıyormuş. Foça\'dan mektup yazdı bana!',
];
STORIES.cem = [
  'Kazıda bir mühürlü kutu bulduk. İçinde... şimdilik söyleyemem.',
  'Antik kentte bir kütüphane kalıntısı var. Celsus Kütüphanesi. Taşları hâlâ kitap kokuyor sanki.',
  'Mühürlü kutudan bir parşömen çıktı: eski bir kitap listesi. İnsanlar hep aynı şeyleri okumuş: aşk, savaş, deniz.',
  'Bir makale yazıyorum: "Seyyar kitapçıların kısa tarihi". Seni de yazacağım.',
  'Makale yayımlandı! Dipnotta adın var: "Ege\'nin son seyyar sahafı."',
];
STORIES.riza = [
  'İlk davamı bir sahafta çözmüştüm, biliyor musun? Kayıp bir kitabın sayfa arasına saklanmış bir makbuz.',
  'Hanım "bu kadar polisiye okuma, gece kâbus görüyorsun" diyor. Haklı da. Ama bırakamıyorum.',
  'Kordonda her akşam aynı bankta oturan bir adam var. Otuz yıllık alışkanlık işte, onu izliyorum. Sadece kitap okuyormuş.',
  'Torunum dedektif olmak istiyormuş. Ona ilk polisiyesini senden alalım, ne dersin?',
  'Anılarımı yazıyorum: "Bir Komiserin Kütüphanesi." Son bölüm senin karavanında geçiyor.',
];
STORIES.deniz = [
  'Bu yaz kimse boğulmadı. Kitap okuyan çocuk denize dalmıyor, onu fark ettim.',
  'Kuleye bir kaplumbağa geldi dün gece. Caretta! Çocuklar ona isim koydu: Kitap.',
  'Kış gelince İzmir\'de yüzme öğretmenliği yapıyorum. Soyunma odasına küçük bir kütüphane kurdum.',
  'Bir çocuk bugün "abla, okuduğun kitabın sonu ne oldu?" diye sordu. Kendi okusun diye söylemedim.',
  'Belediye kumsala kitap kulübesi kuracakmış. Fikir benden, kitaplar senden olacak!',
];
STORIES.leyla = [
  'Bir vazo kırıldığında atmam. Parçalarını altınla birleştiririm. Kitapların da öyle bir yanı var.',
  'Atölyeme bir kedi geldi, rafın en üstünde uyuyor. Adını Melih Cevdet koydum.',
  'Bağbozumunda sergi açacağım. Her eserin yanında bir dize olacak, çoğunu senin kitaplarından seçtim.',
  'Sergide bir çocuk bir kâseye bakıp ağladı. "Annem gibi" dedi. Daha ne isterim.',
  'Karavanın için bir tabela yaptım: seramik, mavi harfler. Assos\'a giderken asarsın.',
];
STORIES.orhan = [
  'Öğrencilerime hep "kitabı bitirmek değil, kitabın sizi bitirmesi önemli" derdim.',
  'Enginar bahçesinde Sokrates gibi dolaşıyorum. Enginarlar pek cevap vermiyor.',
  'Eski bir öğrencim yazar olmuş. Kitabının teşekkür kısmında adım geçiyor. Utandım, sevindim.',
  'Köy kahvesinde akşamları felsefe sohbeti başlattık. İlk hafta üç kişiydik, şimdi on iki.',
  'Sohbetlerimize "Karavan Akademisi" adını verdik. Kurucu üye sensin, itiraz istemem.',
];
STORIES.atlas = [
  'Babam da kaptandı, dedem de. Bu boğaz bizim ailenin mahallesi gibi.',
  'Fırtınalı bir gecede bir kitap okuyarak sabahı ettim. Gemi sallandıkça satırlar dans etti.',
  'Karşı kıyıda bir kitapçı var, Yorgos. Sana selamı var, seni duymuş.',
  'Yorgos\'la bir anlaşma yaptık: her sefer bir kitap götürüyorum, bir kitap getiriyorum. Kıyılar arası kütüphane.',
  'Feribotun salonuna bir raf astık. Yolcular okuyor, inerken bırakıyor. Adını "Sahaf\'ın Rafı" koyduk.',
];
STORIES.eleni = [
  'Anneannem 1923\'te gelmiş. Yanında sadece bir sandık, sandıkta üç kitap varmış.',
  'O üç kitabın biri şiir, biri yemek tarifi, biri incil. Hepsi bende, sayfaları sararmış.',
  'Karşı kıyıya hiç gitmedim. Atlas beni bir gün götürecek, söz verdi.',
  'Gittim! Anneannemin köyünü buldum. Kilisenin yanında yaşlı bir kadın onun adını hatırladı.',
  'Oradan bir kitap getirdim, anneannemin köyünden. Senin rafında dursun; iki kıyı bir arada.',
];
STORIES.yorgos = [
  'Babam bu dükkânı 1960\'ta açtı. Rafların yarısı Türkçe kitaptı, karşı kıyıdan gelenler için.',
  'Kostas Efendi\'yi tanırdım! Bir kış buraya gelip bir hafta kaldı. Kitaplarını sandıklarla taşıyordu.',
  'Atlas\'la kurduğumuz feribot rafı doldu taştı. Şimdi bir de geri dönüş rafı lazım.',
  'Kostas\'ın bıraktığı bir not buldum: "Bir gün biri gelip bu kitapları iki kıyıya birden dağıtacak." Sensin galiba.',
  'İki kıyının sahafları olarak bir kulüp kurduk: "Ege Kitap Kardeşliği". İlk üye sen ol.',
];
STORIES.maria = [
  'Babaannem zeytin toplarken türkü söylerdi. Hem Rumca hem Türkçe. Ben de iki dilde şiir okurum.',
  'Bu yıl ağaçlar çok verdi. Fazlasıyla bir okuma köşesi yaptırdım köyün meydanına.',
  'Köyün çocukları şiir ezberleme yarışması yaptı. Biri senin sattığın kitaptan okudu!',
  'Ayvalık\'tan bir kadın zeytinliğime geldi. Ninelerimiz aynı köydenmiş. Ağladık, güldük.',
  'Zeytinliğin en yaşlı ağacına bir isim verdik: "Okuyan Ağaç". Altında her pazar kitap okunuyor.',
];
STORIES.nikos = [
  'Annem "felsefeyle ekmek yenmez" diyor. Ben de "Sokrates de ekmek yemiyordu herhalde" diyorum.',
  'Akropolis\'te gece bekçiliği yapıyorum, okumak için en sessiz yer.',
  'Hocam bir makalemi dergide yayınlattı. Konusu: "Bir kitap sizi seçer mi?"',
  'Bursla bir dönem İstanbul\'a gideceğim. Orada da senin gibi bir sahaf bulur muyum?',
  'Tezimi bitirdim! Teşekkür kısmında yazıyor: "Doğru kitabı doğru anda veren seyyar sahafa."',
];
STORIES.despina = [
  'İlk rolüm bir ağaçtı. Bir cümlem bile yoktu. Şimdi Antigone\'yim, cümlelerim bitmiyor.',
  'Seyirciden biri oyundan sonra kuliste ağladı. "Babamı anlattınız" dedi.',
  'Bir oyun yazıyorum, bir sahaf ile bir aktrisin dostluğu üzerine. Tanıdık geldi mi?',
  'Oyunu bir festivale kabul ettiler! Karavanı sahneye koyabilir miyiz?',
  'Prömiyer olağanüstüydü. Sahnede senin karavanının maketi vardı; perde kapanınca alkış ona gitti.',
];
STORIES.aleko = [
  'Dedem İzmirliymiş. Rebetiko onunla gelmiş buraya, bir de bir sandık plak.',
  'Bu gece tavernada senin sattığın kitaptan bir şiiri bestelemeye çalıştım. Herkes sustu.',
  'Bir İzmirli kadın şarkımı dinleyip "bunu ninem söylerdi" dedi. Aynı şarkıymış!',
  'Kayıt yapıyoruz. Albümün adı "İki Liman". Kapak fotoğrafı için karavanını isteyeceğim.',
  'Albüm çıktı. Arka kapakta küçük bir not var: "Şiirleri bulan sahafa."',
];
STORIES.sofia = [
  'Restore ettiğim bir konağın duvarında 1912\'den kalma bir mektup bulduk.',
  'Mektup bir Türk kadına yazılmış. Torununu arıyorum, bir romandan çıkmış gibi.',
  'Bir ipucu buldum: kadın Ayvalık\'a göçmüş. Senin kasabanın oralara!',
  'Torunu bulduk! Melis Öğretmen diye biri... Ayvalık\'ta öğretmenmiş, tanıyor musun?',
  'Mektubu Melis Hanım\'a teslim ettik. Konağa da bir oda ayırdık: "Mektup Odası". Raflarını sen dolduracaksın.',
];
STORIES.ioanna = [
  'Adaya bir yazlığına gelmiştim, yirmi yıl oldu. Gün batımı insanı bırakmıyor.',
  'Turistler resimlerimi değil, onları boyarken beni fotoğraflıyor. Komik.',
  'Bir galerici Paris\'te sergi teklif etti. Korkuyorum, burayı hiç bırakmadım.',
  'Sergi için seçtiğim resimlerin her birinin yanına bir kitap koyacağım. Hepsi senden.',
  'Paris\'teki sergi bitti, döndüm. En çok satan resim: "Kitap karavanı ve mavi kubbe".',
];
STORIES.pavlo = [
  'Elli yıldır bu kalderada balık tutarım. Volkan uyuyor, ben de uyumam.',
  'Torunum ilk balığını tuttu, sonra bıraktı. "Kitapta öyle yapıyorlardı" dedi.',
  'Torunlarım için teknenin kamarasına bir raf yaptım. Yüzen kütüphane!',
  'En küçük torunum Türkçe öğrenmeye başladı, senin kitaplarınla. "Merhaba dede" diyor.',
  'Teknemin adını değiştirdim: "Sahaf". Limanda herkes soruyor, ben de anlatıyorum.',
];
for (const id in STORIES) REGULARS[id].story = STORIES[id];

// Sabit görünüşler (render/people.js personSVG): kim olduklarına uysun
const STYLES = {
  hasan:  { hair: '#dcdcdc', beard: true, hat: 1, hatC: '#5b8bd0', coat: '#6fb1d6', skin: '#d9a07a', long: false },
  melis:  { hair: '#a0643c', long: true, glasses: true, hat: 0, coat: '#b98ad6', skin: '#f6d2b4' },
  ruya:   { hair: '#c4572e', long: true, hat: 1, hatC: '#f2c45a', coat: '#f09a5e', skin: '#f6d2b4' },
  selim:  { hair: '#9a9a9a', glasses: true, hat: 0, coat: '#fff1d6', skin: '#eec09c', long: false },
  nuri:   { hair: '#3d2b24', beard: true, hat: 1, hatC: '#fff4e0', coat: '#4d5d82', skin: '#d9a07a', long: false },
  ela:    { hair: '#e2b56a', long: true, hat: 0, coat: '#e57f73', skin: '#f6d2b4', tall: 0.84 },
  zeynep: { hair: '#3d2b24', long: true, hat: 2, hatC: '#8bc49a', coat: '#6fb1d6', skin: '#b97d58' },
  bora:   { hair: '#6a4434', beard: true, hat: 0, coat: '#8bc49a', skin: '#eec09c', long: false },
  mustafa: { hair: '#5a4a42', beard: true, hat: 2, hatC: '#f2c45a', coat: '#7f9c5a', skin: '#d9a07a', long: false },
  inci:   { hair: '#2e2422', long: true, hat: 1, hatC: '#3d2b24', coat: '#fff1d6', skin: '#f6d2b4' },
  nine:   { hair: '#ececec', long: true, hat: 0, coat: '#c96f5a', skin: '#eec09c', glasses: true, tall: 0.9 },
  cem:    { hair: '#a0643c', glasses: true, hat: 2, hatC: '#c9a676', coat: '#c9a676', skin: '#d9a07a', long: false },
  yorgos: { hair: '#c8c8c8', beard: true, glasses: true, hat: 0, coat: '#5a4a42', skin: '#e2b08a', long: false },
  maria:  { hair: '#3d2b24', long: true, hat: 2, hatC: '#f2c45a', coat: '#7f9c5a', skin: '#c48a62' },
  nikos:  { hair: '#2e2422', glasses: true, hat: 0, coat: '#5b8bd0', skin: '#e2b08a', long: false },
  despina: { hair: '#6a4434', long: true, hat: 0, coat: '#b98ad6', skin: '#eec09c' },
  aleko:  { hair: '#2e2422', beard: true, hat: 1, hatC: '#2e2422', coat: '#3e4a5e', skin: '#d9a07a', long: false },
  sofia:  { hair: '#a0643c', long: true, glasses: true, hat: 0, coat: '#c96f5a', skin: '#f6d2b4' },
  ioanna: { hair: '#c4572e', long: true, hat: 2, hatC: '#fff4e0', coat: '#6fb1d6', skin: '#eec09c' },
  pavlo:  { hair: '#ececec', beard: true, hat: 1, hatC: '#4d5d82', coat: '#4d5d82', skin: '#c48a62', long: false },
  riza:   { hair: '#c8c8c8', hat: 1, hatC: '#3d2b24', coat: '#5a4a42', skin: '#eec09c', long: false },
  deniz:  { hair: '#e2b56a', long: true, hat: 2, hatC: '#e57f73', coat: '#e57f73', skin: '#c48a62' },
  leyla:  { hair: '#2e2422', long: true, hat: 0, coat: '#8bc49a', skin: '#e2b08a' },
  orhan:  { hair: '#dcdcdc', beard: true, glasses: true, hat: 0, coat: '#c9a676', skin: '#eec09c', long: false },
  atlas:  { hair: '#3d2b24', beard: true, hat: 1, hatC: '#4d5d82', coat: '#4d5d82', skin: '#c48a62', long: false },
  eleni:  { hair: '#ececec', long: true, hat: 0, coat: '#5b8bd0', skin: '#f6d2b4', glasses: true },
};
for (const id in STYLES) REGULARS[id].style = STYLES[id];
REGULARS.ela.voice = 'cocuk';

export const REGULAR_KEYS = Object.keys(REGULARS);
export const GIFT_COINS = 40;
