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
};
for (const id in STYLES) REGULARS[id].style = STYLES[id];
REGULARS.ela.voice = 'cocuk';

export const REGULAR_KEYS = Object.keys(REGULARS);
export const GIFT_COINS = 40;
