// İlanlar: gazetede çıkan, birkaç gün süren küçük görevler. Teslimat gün sonunda, rafta yeterli kitap varsa olur.
// kind: book (belirli bir kitap) | tag (etiketli n kitap) | genre (türden n kitap)
// town: true → rastgele bir kasabada teslim; false → nerede olursan ol
// {book} {tag} {genre} {n} {town} {days} yer tutucuları
export const VISITORS = [
  { id: 'gezgin', name: 'Gezgin Leyla', icon: '🎒', kind: 'book', pool: { tag: 'yolculuk' }, town: true, days: 4, coins: 55, rare: true,
    text: 'Gezgin Leyla {town} yolunda. {days} gün içinde orada «{book}» kitabını bulabilirse bir hatıra bırakacak.' },
  { id: 'profesor', name: 'Profesör Ahmet', icon: '🎓', kind: 'tag', tag: 'felsefe', n: 3, town: false, days: 5, coins: 60,
    text: 'Emekli Profesör Ahmet okuma grubu kuruyor: {days} gün içinde {n} tane {tag} kitabı lazım. Karavan nerede olursa gelir.' },
  { id: 'okul', name: 'Köy okulu', icon: '🏫', kind: 'genre', genre: 'cocuk', n: 4, town: true, days: 5, coins: 50,
    text: '{town} köy okulu, {days} gün içinde {n} {genre} kitabı istiyor. Öğretmen teslim günü karavanı bekleyecek.' },
  { id: 'kaptan', name: 'Yaşlı kaptan', icon: '⚓', kind: 'book', pool: { tag: 'deniz' }, town: true, days: 4, coins: 50,
    text: 'Yaşlı bir kaptan son seferinden önce «{book}» kitabını okumak istiyor. {days} gün içinde {town} limanında olacak.' },
  { id: 'tiyatro', name: 'Gezici tiyatro', icon: '🎭', kind: 'tag', tag: 'komik', n: 3, town: false, days: 4, coins: 45,
    text: 'Gezici tiyatro yeni oyununa ilham arıyor: {days} gün içinde {n} tane {tag} kitap.' },
  { id: 'nisanli', name: 'Nişanlı çift', icon: '💍', kind: 'tag', tag: 'ask', n: 2, town: true, days: 3, coins: 40,
    text: 'Bir çift düğün masalarına kitap koymak istiyor: {days} gün içinde {town} tarafında {n} {tag} kitabı.' },
  { id: 'kutuphaneci', name: 'Kütüphaneci Sevim', icon: '📚', kind: 'genre', genre: 'tarih', n: 3, town: false, days: 6, coins: 55,
    text: 'Belediye kütüphanesi yeni bir raf açıyor: {days} gün içinde {n} {genre} kitabı arıyorlar.' },
  { id: 'kucukyazar', name: 'Küçük yazar Ada', icon: '✏️', kind: 'book', pool: { genre: 'fantastik' }, town: true, days: 5, coins: 45, rare: true,
    text: 'On yaşındaki Ada ilk romanını yazıyor; ilham için «{book}» istiyor. {days} gün içinde {town} kasabasında.' },
  { id: 'gozluk', name: 'Gözleri yorgun bir okur', icon: '👓', kind: 'tag', tag: 'kisa', n: 3, town: false, days: 4, coins: 40,
    text: 'Gözleri çabuk yorulan bir okur {days} gün içinde {n} tane {tag} kitap arıyor. Karavan nerede olursa uğrayacak.' },
  { id: 'fotografci', name: 'Fotoğrafçı Deniz', icon: '📷', kind: 'tag', tag: 'doga', n: 2, town: true, days: 4, coins: 45,
    text: 'Fotoğrafçı Deniz sergisi için {n} tane {tag} kitabı istiyor. {days} gün içinde {town} kasabasında.' },
];
