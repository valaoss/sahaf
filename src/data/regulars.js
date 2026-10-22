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
};
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
};
for (const id in STYLES) REGULARS[id].style = STYLES[id];

export const REGULAR_KEYS = Object.keys(REGULARS);
export const GIFT_COINS = 40;
