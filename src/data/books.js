// Gerçek kitaplar: yalnızca başlık ve yazar (kapak görseli yok). Etiketler öneri oyununda eşleşme için.
// `say`: müşterinin cümlesinde "… bir kitap" kalıbına oturan sıfat öbeği.
export const TAGS = {
  deniz:    { icon: '🌊', name: 'deniz',     say: 'denizi anlatan' },
  huzun:    { icon: '💧', name: 'hüzün',     say: 'biraz hüzünlü' },
  ask:      { icon: '💗', name: 'aşk',       say: 'içinde aşk olan' },
  macera:   { icon: '🧭', name: 'macera',    say: 'macera dolu' },
  gizem:    { icon: '🕵️', name: 'gizem',     say: 'gizemli' },
  komik:    { icon: '😄', name: 'komik',     say: 'güldüren' },
  aile:     { icon: '🏡', name: 'aile',      say: 'aile üzerine' },
  savas:    { icon: '⚔️', name: 'savaş',     say: 'savaşı anlatan' },
  doga:     { icon: '🌿', name: 'doğa',      say: 'doğayla iç içe' },
  buyu:     { icon: '✨', name: 'büyü',      say: 'büyülü' },
  yolculuk: { icon: '🚂', name: 'yolculuk',  say: 'yolculukta geçen' },
  kisa:     { icon: '📄', name: 'kısa',      say: 'kısa' },
  umut:     { icon: '🌅', name: 'umut',      say: 'umut veren' },
  yalniz:   { icon: '🌙', name: 'yalnızlık', say: 'yalnızlığı anlatan' },
  cocukluk: { icon: '🧒', name: 'çocukluk',  say: 'çocukluğu hatırlatan' },
  korku:    { icon: '👻', name: 'korku',     say: 'ürperten' },
  sehir:    { icon: '🏙️', name: 'şehir',     say: 'şehirde geçen' },
  hayvan:   { icon: '🐾', name: 'hayvan',    say: 'hayvanların olduğu' },
  felsefe:  { icon: '💭', name: 'felsefe',   say: 'düşündüren' },
};

const B = (id, genre, title, author, tags) => ({ id, genre, title, author, tags });

export const BOOKS = [
  B('kurk', 'roman', 'Kürk Mantolu Madonna', 'Sabahattin Ali', ['ask', 'huzun', 'yalniz']),
  B('saatler', 'roman', 'Saatleri Ayarlama Enstitüsü', 'Ahmet Hamdi Tanpınar', ['komik', 'felsefe', 'sehir']),
  B('incememed', 'roman', 'İnce Memed', 'Yaşar Kemal', ['macera', 'doga', 'umut']),
  B('yasliadam', 'roman', 'Yaşlı Adam ve Deniz', 'Ernest Hemingway', ['deniz', 'yalniz', 'kisa']),
  B('sucveceza', 'roman', 'Suç ve Ceza', 'Fyodor Dostoyevski', ['felsefe', 'sehir', 'huzun']),
  B('askgurur', 'roman', 'Aşk ve Gurur', 'Jane Austen', ['ask', 'komik', 'aile']),
  B('simyaci', 'roman', 'Simyacı', 'Paulo Coelho', ['yolculuk', 'umut', 'felsefe']),
  B('bulbul', 'roman', 'Bülbülü Öldürmek', 'Harper Lee', ['aile', 'cocukluk']),
  B('marti', 'roman', 'Martı', 'Richard Bach', ['kisa', 'umut', 'felsefe']),
  B('ugultulu', 'roman', 'Uğultulu Tepeler', 'Emily Brontë', ['ask', 'huzun', 'doga']),

  B('ekspres', 'polisiye', 'Doğu Ekspresinde Cinayet', 'Agatha Christie', ['gizem', 'yolculuk']),
  B('hickalmadi', 'polisiye', 'Ve Sonra Hiç Kalmadı', 'Agatha Christie', ['gizem', 'korku', 'deniz']),
  B('baskerville', 'polisiye', 'Baskervillerin Köpeği', 'Arthur Conan Doyle', ['gizem', 'korku', 'hayvan']),
  B('gulunadi', 'polisiye', 'Gülün Adı', 'Umberto Eco', ['gizem', 'felsefe']),
  B('nil', 'polisiye', "Nil'de Ölüm", 'Agatha Christie', ['gizem', 'yolculuk', 'ask']),
  B('lupen', 'polisiye', 'Arsen Lüpen: Kibar Hırsız', 'Maurice Leblanc', ['macera', 'komik', 'gizem']),
  B('kuzular', 'polisiye', 'Kuzuların Sessizliği', 'Thomas Harris', ['korku', 'gizem']),
  B('beyoglu', 'polisiye', 'Beyoğlu Rapsodisi', 'Ahmet Ümit', ['sehir', 'gizem']),
  B('kizildosya', 'polisiye', 'Kızıl Dosya', 'Arthur Conan Doyle', ['gizem', 'sehir', 'kisa']),
  B('rebecca', 'polisiye', 'Rebecca', 'Daphne du Maurier', ['gizem', 'ask', 'deniz']),

  B('hobbit', 'fantastik', 'Hobbit', 'J. R. R. Tolkien', ['macera', 'yolculuk', 'buyu']),
  B('potter', 'fantastik', 'Harry Potter ve Felsefe Taşı', 'J. K. Rowling', ['buyu', 'cocukluk', 'macera']),
  B('narnia', 'fantastik', 'Aslan, Cadı ve Dolap', 'C. S. Lewis', ['buyu', 'cocukluk']),
  B('yuzukler', 'fantastik', 'Yüzüklerin Efendisi', 'J. R. R. Tolkien', ['macera', 'savas', 'buyu']),
  B('yerdeniz', 'fantastik', 'Yerdeniz Büyücüsü', 'Ursula K. Le Guin', ['buyu', 'deniz', 'yolculuk']),
  B('alice', 'fantastik', 'Alice Harikalar Diyarında', 'Lewis Carroll', ['buyu', 'komik', 'cocukluk']),
  B('otostopcu', 'fantastik', 'Otostopçunun Galaksi Rehberi', 'Douglas Adams', ['komik', 'yolculuk', 'felsefe']),
  B('dune', 'fantastik', 'Dune', 'Frank Herbert', ['savas', 'doga']),
  B('frankenstein', 'fantastik', 'Frankenstein', 'Mary Shelley', ['korku', 'yalniz', 'felsefe']),
  B('momo', 'fantastik', 'Momo', 'Michael Ende', ['umut', 'sehir', 'cocukluk']),

  B('manzaralar', 'siir', 'Memleketimden İnsan Manzaraları', 'Nâzım Hikmet', ['yolculuk', 'umut', 'savas']),
  B('otuzbes', 'siir', 'Otuz Beş Yaş', 'Cahit Sıtkı Tarancı', ['huzun', 'felsefe', 'kisa']),
  B('garip', 'siir', 'Garip', 'Orhan Veli', ['komik', 'sehir', 'kisa']),
  B('gokkubbe', 'siir', 'Kendi Gök Kubbemiz', 'Yahya Kemal', ['deniz', 'huzun']),
  B('uvercinka', 'siir', 'Üvercinka', 'Cemal Süreya', ['ask', 'sehir']),
  B('mecburum', 'siir', 'Ben Sana Mecburum', 'Attilâ İlhan', ['ask', 'yalniz']),
  B('neruda', 'siir', 'Yirmi Aşk Şiiri ve Umutsuz Bir Şarkı', 'Pablo Neruda', ['ask', 'deniz', 'huzun']),
  B('karanfil', 'siir', 'Yerçekimli Karanfil', 'Edip Cansever', ['felsefe', 'yalniz']),
  B('yunus', 'siir', 'Yunus Emre Divanı', 'Yunus Emre', ['felsefe', 'umut']),
  B('dickinson', 'siir', 'Seçme Şiirler', 'Emily Dickinson', ['doga', 'yalniz', 'kisa']),

  B('kucukprens', 'cocuk', 'Küçük Prens', 'Antoine de Saint-Exupéry', ['yolculuk', 'felsefe', 'yalniz']),
  B('palsokagi', 'cocuk', 'Pal Sokağı Çocukları', 'Ferenc Molnár', ['cocukluk', 'savas', 'huzun']),
  B('sekerportakali', 'cocuk', 'Şeker Portakalı', 'José Mauro de Vasconcelos', ['cocukluk', 'huzun', 'aile']),
  B('cikolata', 'cocuk', 'Charlie\'nin Çikolata Fabrikası', 'Roald Dahl', ['komik', 'buyu', 'cocukluk']),
  B('pinokyo', 'cocuk', 'Pinokyo', 'Carlo Collodi', ['macera', 'buyu']),
  B('heidi', 'cocuk', 'Heidi', 'Johanna Spyri', ['doga', 'aile']),
  B('defne', 'cocuk', 'Define Adası', 'Robert Louis Stevenson', ['deniz', 'macera']),
  B('pollyanna', 'cocuk', 'Pollyanna', 'Eleanor H. Porter', ['umut', 'aile']),
  B('kasagi', 'cocuk', 'Kaşağı', 'Ömer Seyfettin', ['kisa', 'aile', 'cocukluk']),
  B('beyazdis', 'cocuk', 'Beyaz Diş', 'Jack London', ['hayvan', 'doga', 'macera']),

  B('nutuk', 'tarih', 'Nutuk', 'Mustafa Kemal Atatürk', ['savas', 'umut']),
  B('sapiens', 'tarih', 'Hayvanlardan Tanrılara: Sapiens', 'Yuval Noah Harari', ['felsefe', 'doga']),
  B('klasikcag', 'tarih', 'Osmanlı İmparatorluğu: Klasik Çağ', 'Halil İnalcık', ['savas', 'sehir']),
  B('annefrank', 'tarih', 'Anne Frank\'ın Hatıra Defteri', 'Anne Frank', ['savas', 'yalniz', 'umut']),
  B('mavisurgun', 'tarih', 'Mavi Sürgün', 'Halikarnas Balıkçısı', ['deniz', 'yolculuk', 'yalniz']),
  B('istanbul', 'tarih', 'İstanbul: Hatıralar ve Şehir', 'Orhan Pamuk', ['sehir', 'huzun', 'cocukluk']),
  B('tufek', 'tarih', 'Tüfek, Mikrop ve Çelik', 'Jared Diamond', ['felsefe', 'doga']),
  B('marcopolo', 'tarih', 'Marco Polo\'nun Seyahatleri', 'Marco Polo', ['yolculuk', 'macera']),
  B('savasbaris', 'tarih', 'Savaş ve Barış', 'Lev Tolstoy', ['savas', 'ask', 'aile']),
  B('ilyada', 'tarih', 'İlyada', 'Homeros', ['savas', 'macera', 'deniz']),
];

export const BOOK = Object.fromEntries(BOOKS.map(b => [b.id, b]));
export const booksOf = genre => BOOKS.filter(b => b.genre === genre);

// Müşteri cümleleri: {a} ve {b} etiketlerin `say` öbekleri
export const ASK_TWO = [
  '{A} ve {b} bir şey arıyorum.',
  'Bana {a}, {b} bir kitap önerir misin?',
  'Canım {a} ve {b} bir şey okumak istiyor.',
  '{A} ama aynı zamanda {b} bir kitap var mı?',
];
export const ASK_ONE = [
  '{A} bir kitap var mı?',
  'Bu aralar {a} bir şeyler okumak istiyorum.',
  'Bana {a} bir kitap bulur musun?',
];
