// İstek dilbilgisi: cümle [selam] + [bağlam] + [istek] + [kapanış] parçalarından kurulur.
// {a}/{b}: etiketlerin söyleyişleri (data/books.js TAGS.say). Her parça kendi başına bir cümledir.

export const GREET = {
  resmi:  ['İyi günler.', 'Merhaba, kolay gelsin.', 'Günaydın.', 'Rahatsız etmiyorum umarım.'],
  samimi: ['Kolay gelsin!', 'Selam!', 'Hayırlı işler!', 'Merhaba canım.'],
  genc:   ['Selam!', 'Merhaba!', 'Hey, selam.', 'Selamlar!'],
  cocuk:  ['Merhabaaa!', 'Bakar mısın?', 'Pişt, merhaba!'],
  turist: ['Hello! Pardon, merhaba!', 'Merhaba! Türkçem biraz kötü…', 'Hi! Merhaba!'],
};

export const CLOSE = {
  resmi:  ['Teşekkür ederim.', 'Zahmet olmazsa.', 'Sizin zevkinize güveniyorum.'],
  samimi: ['Sen bilirsin!', 'Sana güveniyorum.', 'Hadi bakalım, şaşırt beni.'],
  genc:   ['Ne dersin?', 'Bir şey bulursan süper olur.', 'Bana bir sürpriz yap.'],
  cocuk:  ['Lütfeeen!', 'Annem para verdi!', 'Hadi hadi!'],
  turist: ['Teşekkürler… thank you!', 'Çok güzel kasaba!', 'Please!'],
};

// Bağlam: kim olduğundan, havadan, mevsimden ya da mekândan bir cümle (hepsi isteğe bağlı)
export const CONTEXT = {
  arch: {
    ogrenci: ['Sınavlar bitti, nihayet kendi kitabımı okuyabilirim.', 'Yurtta okuyacak bir şey arıyorum.', 'Hocam ödev verdi ama ben başka bir şey okumak istiyorum.'],
    emekli: ['Emekli oldum, vaktim bol.', 'Kırk yıl öğrencilere kitap önerdim, şimdi sıra bende.', 'Torunlarım okusun diye kitaplık kuruyorum.'],
    balikci: ['Ağları topladım, akşama okumalık lazım.', 'Teknede dalgayı beklerken okurum.', 'Balık yok bugün, bari kitap olsun.'],
    turist: ['Tatildeyim, otelde okuyacağım.', 'İlk kez buraya geliyorum.', 'Valizime bir kitap daha sığar.'],
    anne: ['Kızım için bakıyorum.', 'Oğlumun doğum günü yaklaşıyor.', 'Çocuklar akşam masal istiyor.'],
    cocuk: ['Annem izin verdi!', 'Harçlığımı biriktirdim.', 'Okulda kitap okuma yarışması var!'],
    sevgili: ['Sevgilime hediye alacağım.', 'Yarın yıldönümümüz.', 'Birine kitap hediye etmek istiyorum, ilk kez.'],
    yazar: ['Bir roman yazıyorum, ilhama ihtiyacım var.', 'Defterim boş kaldı bu hafta.', 'Yazarken başka sesler duymak istiyorum.'],
    koleksiyoncu: ['Kütüphanem için bakıyorum.', 'Eski baskıların peşindeyim.', 'Rafta gözüme bir şey takılmadı ama sorayım.'],
    teyze: ['Akşamları çayımın yanına okurum.', 'Gözlüğümü taktım, hazırım.', 'Komşularla kitap değiş tokuşu yapıyoruz.'],
    sorfcu: ['Rüzgâr çıkana kadar okuyacağım.', 'Kumsala kitapsız gitmem.', 'Dalgalar sakin bugün.'],
  },
  weather: {
    yagmurlu: ['Yağmur başladı, eve dönmeden bir kitap alayım.', 'Bu yağmurda eve kapanacağım, okuyacak bir şey lazım.'],
    ruzgarli: ['Rüzgâr dinene kadar okuyacak bir şey lazım.', 'Bu rüzgârda kumsal olmaz.'],
    bulutlu: ['Hava kapalı, kitap havası.'],
  },
  season: {
    'İlkbahar': ['Bahar geldi, içim kıpır kıpır.'],
    'Yaz': ['Bu sıcakta gölgede okumalık arıyorum.', 'Yaz tatili için bir kitap lazım.'],
    'Sonbahar': ['Yapraklar dökülürken okunacak bir şey olsun.'],
    'Kış': ['Uzun kış akşamları için bir kitap lazım.', 'Soba başında okuyacağım.'],
  },
  scene: {
    sahil: ['Deniz kenarında okumak gibisi yok.'],
    carsi: ['Çarşıda dolaşırken karavanını gördüm.'],
    tepe: ['Buraya kadar tırmandım, boş dönmeyeyim.'],
  },
};

// İstek: iki ya da tek etiketli kalıplar; voice'e özgü olanlar ortak olanlara eklenir
export const REQ_TWO = {
  any: [
    '{A} ve {b} bir şey arıyorum.', 'Bana {a}, {b} bir kitap önerir misin?', '{A} ama aynı zamanda {b} bir kitap var mı?',
    'Hem {a} hem {b} bir şey olsun.', '{A}, biraz da {b} bir kitap istiyorum.', 'Aklımda {a} ve {b} bir şey var.',
  ],
  cocuk: ['{A} ve {b} bir kitap var mı? Lütfen!'],
  turist: ['{A}… ve {b}? Öyle bir kitap?'],
  resmi: ['{A} ve {b} bir eser arıyorum.'],
};
export const REQ_ONE = {
  any: [
    '{A} bir kitap var mı?', 'Bana {a} bir kitap bulur musun?', '{A} bir şey olsun.',
    'Sadece {a} olsun, gerisi fark etmez.', 'Canım {a} bir şey çekiyor.',
  ],
  cocuk: ['{A} bir kitap istiyorum!'],
  turist: ['{A} kitap? Var mı?'],
  resmi: ['{A} bir eser önerebilir misiniz?'],
};

// Koleksiyoncu: ilk baskı arar
export const RARE_REQ = [
  '{A} bir kitabın ilk baskısı var mı?', 'Nadir bir şey arıyorum: {a}, eski bir baskı.',
  '{A} bir kitap… ama ilk baskısı olsun, parası önemli değil.',
];
