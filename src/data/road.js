// Yol üstü karşılaşmalar: kasabalar arası yolculukta arada bir karavanın önüne çıkan küçük anlar.
// choices[].fx: cost (ödeme), coins (kazanç), crate { n, cond, rare } (koliye kitap), swap (raftan n kitap ver, n kitap al),
//   late (bugün dükkân geç açılır: kalabalık çarpanı), heart (kasabadaki bir müdavime kalp)
export const ROAD = [
  { id: 'pazar', icon: '🧺', title: 'Köy pazarı',
    text: 'Yol kenarında bir köy pazarı kurulmuş. Domatesin yanında bir teyze bir kasa eski kitap satıyor.',
    choices: [
      { label: 'Kasayı al (₺8)', fx: { cost: 8, crate: { n: 4, cond: 'yipranmis' } }, result: 'Kasadan dört kitap çıktı. Biraz yıpranmışlar ama okunur; teyze bir de domates sıkıştırdı.' },
      { label: 'Selam verip geç', fx: {}, result: 'Teyze arkandan el salladı: "Dönüşte yine uğra!"' },
    ] },
  { id: 'otostop', icon: '🎒', title: 'Otostopçu',
    text: 'Sırt çantalı bir öğrenci yol kenarında el sallıyor. Elinde de bir kitap var.',
    choices: [
      { label: 'Arabaya al', fx: { crate: { n: 1, cond: 'temiz' } }, result: 'Yol boyunca kitap konuştunuz. İnerken çantasından tertemiz bir kitap çıkarıp sana bıraktı.' },
      { label: 'Durmadan geç', fx: {}, result: 'Dikiz aynasında küçüldü. Belki bir başkası alır.' },
    ] },
  { id: 'lastik', icon: '🛞', title: 'Lastik patladı',
    text: 'Bir tümseğin ardından karavan sola yattı. Arka lastik patlamış.',
    choices: [
      { label: 'Tamirciyi çağır (₺7)', fx: { cost: 7 }, result: 'Köyün tamircisi yarım saatte geldi, çay da ısmarladı.' },
      { label: 'Kendin değiştir', fx: { late: 0.8 }, result: 'Bütün sabahın gitti ama becerdin. Bugün dükkân biraz geç açılacak.' },
    ] },
  { id: 'kamp', icon: '🔥', title: 'Kamp ateşi',
    text: 'Sahil yolunda gezginler kamp kurmuş. Ateşin başında kitap takası yapıyorlar.',
    choices: [
      { label: 'İki kitap takas et', fx: { swap: 2 }, result: 'Rafından iki kitap gitti, sırt çantalardan iki kitap geldi. Biri epey eski görünüyor.' },
      { label: 'Bir şarkı dinleyip geç', fx: {}, result: 'Biri gitar çaldı. Yola daha hafif devam ettin.' },
    ] },
  { id: 'bag', icon: '🍇', title: 'Bağ kenarı',
    text: 'Bağ sahibinin torunu yol kenarında ağlıyor: masal kitabını kaybetmiş.',
    choices: [
      { label: 'Ona bir masal oku', fx: { coins: 5, heart: true }, result: 'Çocuk güldü, dedesi bir sepet üzüm ve ₺5 verdi. Haberi kasabaya senden önce varmış.' },
      { label: 'Yoluna devam et', fx: {}, result: 'Biraz içinde kaldı.' },
    ] },
  { id: 'sahaf', icon: '📚', title: 'Kapanan bir sahaf',
    text: 'Yolun kenarındaki köyde yaşlı bir sahaf dükkânını kapatıyor. "Son kitaplarım," diyor, "iyi ellere gitsin."',
    choices: [
      { label: 'Bir ilk baskı al (₺22)', fx: { cost: 22, crate: { n: 1, cond: 'temiz', rare: true } }, result: 'Kitabı kâğıda sarıp verdi: "Bunu Kostas\'tan almıştım." Eli titredi.' },
      { label: 'Sadece sohbet et', fx: { heart: true }, result: 'Kırk yılın hikâyesini anlattı. Kasabada adın iyi anılacak.' },
    ] },
  { id: 'manzara', icon: '🌅', title: 'Tepeden deniz',
    text: 'Yol bir tepeyi döndü ve birden bütün körfez önüne serildi.',
    choices: [
      { label: 'Dur ve seyret', fx: { late: 0.9, coins: 0 }, result: 'Yarım saat oturdun. İçin ferahladı; dükkân biraz geç açılacak ama değdi.' },
      { label: 'Fotoğraf çek, devam et', fx: {}, result: 'Fotoğraf hiçbir şeyi anlatmıyor ama olsun.' },
    ] },
  { id: 'koyun', icon: '🐑', title: 'Koyun sürüsü',
    text: 'Yolu bir koyun sürüsü kapattı. Çoban hiç acele etmiyor.',
    choices: [
      { label: 'Bekle, kitap oku', fx: { late: 0.9 }, result: 'Bir bölüm bitirdin. Çoban giderken "hayırlı okumalar" dedi.' },
      { label: 'Korna çal', fx: { coins: -2 }, result: 'Koyunlar dağıldı, biri karavanın aynasını kırdı. ₺2 masraf.' },
    ] },
];
