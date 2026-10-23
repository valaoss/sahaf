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
    ogrenci: ['Sınavlar bitti, nihayet kendi kitabımı okuyabilirim.', 'Yurtta okuyacak bir şey arıyorum.', 'Hocam ödev verdi ama ben başka bir şey okumak istiyorum.', 'Kantinde arkadaşlarla kitap değiş tokuşu yapıyoruz.', 'Otobüste okuyacak bir şey lazım.', 'Burs parası yattı, kendime bir kitap alacağım.', 'Telefondan sıkıldım, kâğıt sayfa özledim.', 'Edebiyat hocam sahaflara uğrayın dedi.'],
    emekli: ['Emekli oldum, vaktim bol.', 'Kırk yıl öğrencilere kitap önerdim, şimdi sıra bende.', 'Torunlarım okusun diye kitaplık kuruyorum.', 'Sabah yürüyüşümü yaptım, şimdi sıra okumada.', 'Bahçede gölgeye bir sandalye koydum.', 'Gözüm eskisi kadar görmüyor ama bırakmam.', 'Eşimle akşamları sesli okuyoruz.', 'Gençken okuduklarımı yeniden okuyorum.'],
    balikci: ['Ağları topladım, akşama okumalık lazım.', 'Teknede dalgayı beklerken okurum.', 'Balık yok bugün, bari kitap olsun.', 'Lodos çıktı, tekne bağlı kaldı.', 'Ağ örerken radyo dinlerim, bu akşam kitap olsun.', 'Kahvede herkes aynı şeyi konuşuyor, bıktım.', 'Sabah dörtte kalkarım, akşam erken okurum.', 'Oğlum da okusun diye bakıyorum.'],
    turist: ['Tatildeyim, otelde okuyacağım.', 'İlk kez buraya geliyorum.', 'Valizime bir kitap daha sığar.', 'Rehber kitabımı bitirdim.', 'Plajda şemsiye altında okuyacağım.', 'Arkadaşım bu kasabayı çok övdü.', 'Hatıra olarak bir kitap götürmek istiyorum.', 'Akşam yemeğinden önce biraz vaktim var.'],
    anne: ['Kızım için bakıyorum.', 'Oğlumun doğum günü yaklaşıyor.', 'Çocuklar akşam masal istiyor.', 'Bebek uyudu, beş dakikam var.', 'Okulda kitap listesi verdiler.', 'Bu sefer kendime de bir şey alayım.', 'Çocuklar ekrandan biraz kalksın istiyorum.', 'Yatmadan önce birlikte okuyoruz.'],
    cocuk: ['Annem izin verdi!', 'Harçlığımı biriktirdim.', 'Okulda kitap okuma yarışması var!', 'Ödevimi bitirdim!', 'Ablam okudu, ben de istiyorum!', 'Kütüphane kartım doldu!', 'Resim yapmaktan sıkıldım.', 'Doğum günümde kitap aldılar, bir tane daha istiyorum!'],
    sevgili: ['Sevgilime hediye alacağım.', 'Yarın yıldönümümüz.', 'Birine kitap hediye etmek istiyorum, ilk kez.', 'Bankta oturup birlikte okuyacağız.', 'Sayfaların arasına bir not koyacağım.', 'Tanıştığımız gün bir kitapçıdaydık.', 'O uzak bir kasabada, kitap yollayacağım.', 'Biraz kalbim kırık açıkçası.'],
    yazar: ['Bir roman yazıyorum, ilhama ihtiyacım var.', 'Defterim boş kaldı bu hafta.', 'Yazarken başka sesler duymak istiyorum.', 'Kahvedeki masam beni bekliyor.', 'Bir karakterim var ama sesi eksik.', 'Editörüm daha çok okumamı söyledi.', 'Gece yazıyorum, gündüz okuyorum.', 'Başkalarının cümlelerine bakmak iyi geliyor.'],
    koleksiyoncu: ['Kütüphanem için bakıyorum.', 'Eski baskıların peşindeyim.', 'Rafta gözüme bir şey takılmadı ama sorayım.', 'Bu işte kırkıncı yılım.', 'Kitabın kokusundan baskısını bilirim.', 'Müzayededen eli boş döndüm.', 'Rafımda bir boşluk var, onu dolduracak bir şey.', 'Eski bir dostum için de bakıyorum.'],
    teyze: ['Akşamları çayımın yanına okurum.', 'Gözlüğümü taktım, hazırım.', 'Komşularla kitap değiş tokuşu yapıyoruz.', 'Torunlar gelecek, birlikte okuyalım dedim.', 'Komşu kızı bana bir kitap verdi, şimdi bırakamıyorum.', 'Pazardan döndüm, çantada yer var.', 'Radyodaki arkası yarın bitti, yerine kitap.', 'Gençliğimde çok okurdum, yeniden başlıyorum.'],
    sorfcu: ['Rüzgâr çıkana kadar okuyacağım.', 'Kumsala kitapsız gitmem.', 'Dalgalar sakin bugün.', 'Kumda havlu serili, eksik bir kitap.', 'Rüzgâr dönünce suya gireceğim.', 'Benim karavan da seninki gibi, yollardayım.', 'Kamp ateşinin başında okuruz.', 'Akşamüstü dalga yok, okuma vakti.'],
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
