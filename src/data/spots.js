import { DISTRICTS } from './districts.js';

// Kasaba içi mekânlar: sabah karavanı nereye kuracağını seçersin (ücretsiz). Mahallelerin tek mekânı data/districts.js'te.
// scene: sahil | carsi | tepe (sahne görünümü) · traffic: kalabalık çarpanı · ask: öneri isteme çarpanı
// demand: tür çarpanları · tags: öneri isteklerinde öne çıkan konular
export const SPOTS = {
  ayvalik: {
    iskele: { name: 'İskele', scene: 'sahil', traffic: 1, ask: 1, demand: { siir: 1.3, roman: 1.2 }, tags: ['deniz', 'huzun'],
      desc: 'Balıkçı tekneleri, martılar. Şiir ve roman okuru çok.' },
    carsi: { name: 'Çarşı', scene: 'carsi', traffic: 1.25, ask: 0.8, demand: { cocuk: 1.4, polisiye: 1.3 }, tags: ['aile', 'komik'],
      desc: 'Kalabalık ve aceleci. Aileler, çocuklar; öneri isteyen az.' },
  },
  cunda: {
    liman: { name: 'Liman', scene: 'sahil', traffic: 1, ask: 1, demand: { siir: 1.3, roman: 1.2 }, tags: ['deniz', 'yolculuk'],
      desc: 'Adaya gelen teknelerin indiği yer.' },
    tepe: { name: 'Ada tepesi', scene: 'tepe', traffic: 0.8, ask: 1.6, demand: { fantastik: 1.5, tarih: 1.3 }, tags: ['buyu', 'felsefe'],
      desc: 'Sessiz ve rüzgârlı. Az kişi gelir ama çoğu sohbet edip öneri ister.' },
  },
  foca: {
    kale: { name: 'Kale önü', scene: 'tepe', traffic: 1, ask: 1.1, demand: { tarih: 1.6 }, tags: ['savas', 'macera'],
      desc: 'Eski surların gölgesi. Tarih meraklıları buradan geçer.' },
    kayalik: { name: 'Siren kayalıkları', scene: 'sahil', traffic: 0.9, ask: 1.3, demand: { cocuk: 1.3, fantastik: 1.3 }, tags: ['deniz', 'buyu'],
      desc: 'Fok görmeye gelen aileler ve masal sevenler.' },
  },
  alacati: {
    carsi: { name: 'Çarşı', scene: 'carsi', traffic: 1.25, ask: 0.8, demand: { polisiye: 1.3, roman: 1.2 }, tags: ['sehir', 'ask'],
      desc: 'Tatilciler, kafeler, kalabalık. Çok satış, az sohbet.' },
    degirmen: { name: 'Değirmenler', scene: 'tepe', traffic: 0.85, ask: 1.5, demand: { fantastik: 1.3, siir: 1.3 }, tags: ['doga', 'felsefe'],
      desc: 'Yel değirmenlerinin altında sakin bir köşe. Öneri isteyen çok.' },
    plaj: { name: 'Plaj', scene: 'sahil', traffic: 1.1, ask: 1, demand: { cocuk: 1.4, polisiye: 1.2 }, tags: ['macera', 'komik'],
      desc: 'Şezlonglar ve dondurmacılar. Hafif, eğlenceli kitaplar satar.' },
  },
  bozcaada: {
    liman: { name: 'Kale limanı', scene: 'sahil', traffic: 1, ask: 1.1, demand: { siir: 1.3, tarih: 1.2 }, tags: ['deniz', 'savas'],
      desc: 'Kalenin gölgesinde balıkçı tekneleri. Tarih ve deniz hikâyeleri sorulur.' },
    bag: { name: 'Bağ evleri', scene: 'tepe', traffic: 0.85, ask: 1.5, demand: { siir: 1.4, roman: 1.3 }, tags: ['doga', 'ask'],
      desc: 'Asmaların arasında sakin bir köşe. Şiir okuyan, sohbet eden çok.' },
  },
  sirince: {
    carsi: { name: 'Köy çarşısı', scene: 'carsi', traffic: 1.2, ask: 0.9, demand: { cocuk: 1.3, fantastik: 1.3 }, tags: ['buyu', 'cocukluk'],
      desc: 'Reçel tezgâhları ve el yapımı oyuncaklar. Masal kitapları satılır.' },
    tepe: { name: 'Kilise yokuşu', scene: 'tepe', traffic: 0.8, ask: 1.6, demand: { tarih: 1.5, siir: 1.2 }, tags: ['felsefe', 'gizem'],
      desc: 'Taş merdivenlerin sonunda eski bir kilise. Az kişi, derin sohbetler.' },
  },
  dikili: {
    kumsal: { name: 'Geniş kumsal', scene: 'sahil', traffic: 1.1, ask: 1, demand: { cocuk: 1.4, polisiye: 1.2 }, tags: ['aile', 'komik'],
      desc: 'Şemsiyeler, kumdan kaleler, gölgede kitap okuyan büyükanneler.' },
    kordon: { name: 'Kordon', scene: 'carsi', traffic: 1.15, ask: 0.9, demand: { polisiye: 1.4, roman: 1.2 }, tags: ['gizem', 'sehir'],
      desc: 'Akşamüstü yürüyüşü, dondurmacılar. Polisiye meraklıları buradan geçer.' },
  },
  urla: {
    iskele: { name: 'Urla iskelesi', scene: 'sahil', traffic: 1, ask: 1.2, demand: { siir: 1.3, roman: 1.2 }, tags: ['deniz', 'felsefe'],
      desc: 'Ahşap iskele, balıkçı kahvesi. Uzun sohbetler, derin sorular.' },
    bag: { name: 'Bağ yolu', scene: 'tepe', traffic: 0.85, ask: 1.5, demand: { roman: 1.3, fantastik: 1.3 }, tags: ['doga', 'ask'],
      desc: 'Asmalar ve rüzgârgülleri arasında atölyelere giden yol.' },
  },
  assos: {
    liman: { name: 'Antik liman', scene: 'sahil', traffic: 0.95, ask: 1.3, demand: { tarih: 1.4, siir: 1.2 }, tags: ['deniz', 'yolculuk'],
      desc: 'Taş evler suyun kıyısında. Midilli feribotunu bekleyenler kitap arar.' },
    tapinak: { name: 'Tapınak tepesi', scene: 'tepe', traffic: 0.75, ask: 1.7, demand: { tarih: 1.5, siir: 1.3 }, tags: ['felsefe', 'savas'],
      desc: 'Aristoteles\'in yürüdüğü yamaç. Az kişi gelir, gelen de uzun konuşur.' },
  },
  bodrum: {
    marina: { name: 'Marina', scene: 'sahil', traffic: 1.15, ask: 0.9, demand: { polisiye: 1.4, roman: 1.2 }, tags: ['deniz', 'macera'],
      desc: 'Yatlar, guletler, kumsala inen tatilciler. Kalabalık ama acele.' },
    carsi: { name: 'Bodrum çarşısı', scene: 'carsi', traffic: 1.2, ask: 1, demand: { fantastik: 1.3, cocuk: 1.2 }, tags: ['komik', 'yolculuk'],
      desc: 'Begonvilli sokaklar, sandalet ustaları, dondurmacılar.' },
  },
  antalya: {
    kaleici: { name: 'Kaleiçi', scene: 'carsi', traffic: 1.2, ask: 1.1, demand: { tarih: 1.4, roman: 1.2 }, tags: ['sehir', 'gizem'],
      desc: 'Hadrian Kapısı\'ndan girilen eski şehir. Konaklar, avlular, rehberli gruplar.' },
    konyaalti: { name: 'Konyaaltı', scene: 'sahil', traffic: 1.1, ask: 0.9, demand: { cocuk: 1.4, polisiye: 1.2 }, tags: ['aile', 'deniz'],
      desc: 'Uzun çakıl kumsal, arkada Toroslar. Aileler ve şemsiyeler.' },
  },
  istanbul: {
    sahaflar: { name: 'Sahaflar Çarşısı', scene: 'carsi', traffic: 1.25, ask: 1.4, demand: { tarih: 1.5, siir: 1.3 }, tags: ['sehir', 'felsefe'],
      desc: 'Beyazıt\'ta asırlık sahaflar. Burada kitap soran kitabı bilir.' },
    karakoy: { name: 'Karaköy iskelesi', scene: 'sahil', traffic: 1.3, ask: 0.9, demand: { roman: 1.3, polisiye: 1.3 }, tags: ['deniz', 'yolculuk'],
      desc: 'Vapur bekleyenler, simitçiler, martılar. Kısa yolculuğa kısa kitap.' },
  },
  kapadokya: {
    goreme: { name: 'Göreme çarşısı', scene: 'carsi', traffic: 1.15, ask: 1, demand: { fantastik: 1.4, cocuk: 1.3 }, tags: ['buyu', 'cocukluk'],
      desc: 'Kaya evler arasında halıcılar, çömlekçiler, sabahın erken saatinde balon yolcuları.' },
    peribacalari: { name: 'Peribacaları', scene: 'tepe', traffic: 0.85, ask: 1.6, demand: { fantastik: 1.5, tarih: 1.3 }, tags: ['buyu', 'gizem'],
      desc: 'Rüzgârın oyduğu kayalar. Az kişi gelir, gelen masal sorar.' },
  },
  midilli: {
    liman: { name: 'Mitilini limanı', scene: 'sahil', traffic: 1, ask: 1.2, demand: { siir: 1.3, tarih: 1.2 }, tags: ['deniz', 'yolculuk'],
      desc: 'Ayvalık feribotunun yanaştığı rıhtım. Yolcular ve balıkçılar.' },
    zeytinlik: { name: 'Zeytinlikler', scene: 'tepe', traffic: 0.85, ask: 1.5, demand: { roman: 1.3, siir: 1.3 }, tags: ['doga', 'aile'],
      desc: 'Asırlık zeytin ağaçları arasında taş bir köy yolu.' },
    ada: { name: 'Kayıkla karşı adacık', scene: 'sahil', island: true, traffic: 1.45, ask: 0.9, demand: { roman: 1.3, siir: 1.2 }, tags: ['deniz', 'yolculuk'],
      desc: 'Balıkçı kayığıyla yarım saat: tek taverna, bir şapel, gezginler. Adada toptancı yok.' },
  },
  atina: {
    plaka: { name: 'Plaka', scene: 'carsi', traffic: 1.3, ask: 0.9, demand: { tarih: 1.3, polisiye: 1.2 }, tags: ['sehir', 'gizem'],
      desc: 'Akropolis\'in eteğinde dar sokaklar, tavernalar, turist kalabalığı.' },
    akropolis: { name: 'Akropolis eteği', scene: 'tepe', traffic: 0.9, ask: 1.6, demand: { tarih: 1.6, siir: 1.2 }, tags: ['felsefe', 'savas'],
      desc: 'Parthenon tepede. Felsefe öğrencileri tartışmaya hazır.' },
    ada: { name: 'Egina kayığı', scene: 'sahil', island: true, traffic: 1.45, ask: 0.9, demand: { tarih: 1.3, cocuk: 1.2 }, tags: ['deniz', 'aile'],
      desc: 'Pire\'den kayıkla Egina: fıstık bahçeleri, liman kahveleri, günübirlikçiler. Adada toptancı yok.' },
  },
  selanik: {
    kordon: { name: 'Beyaz Kule önü', scene: 'sahil', traffic: 1.1, ask: 1, demand: { roman: 1.3, siir: 1.2 }, tags: ['deniz', 'sehir'],
      desc: 'Kordon boyunca yürüyenler, simitçiler, akşamüstü ışığı.' },
    modiano: { name: 'Modiano çarşısı', scene: 'carsi', traffic: 1.25, ask: 0.9, demand: { polisiye: 1.3, cocuk: 1.2 }, tags: ['aile', 'komik'],
      desc: 'Balık, peynir, baharat… ve bir köşede eski kitap tezgâhları.' },
    ada: { name: 'Kayıkla koy', scene: 'sahil', island: true, traffic: 1.4, ask: 1, demand: { roman: 1.3, polisiye: 1.2 }, tags: ['deniz', 'macera'],
      desc: 'Körfezin karşı kıyısına kayık: çam ağaçları, kumsal, yazlıkçılar. Orada toptancı yok.' },
  },
  santorini: {
    oia: { name: 'Oia yamacı', scene: 'tepe', traffic: 1, ask: 1.4, demand: { siir: 1.5, fantastik: 1.2 }, tags: ['ask', 'deniz'],
      desc: 'Uçurum kenarında beyaz evler. Gün batımını bekleyen herkes bir kitap ister.' },
    fira: { name: 'Fira sokakları', scene: 'carsi', traffic: 1.2, ask: 1, demand: { fantastik: 1.3, roman: 1.2 }, tags: ['buyu', 'yolculuk'],
      desc: 'Basamaklı sokaklar, eşek kervanları, gemiden inen yolcular.' },
    ada: { name: 'Thirasia kayığı', scene: 'sahil', island: true, traffic: 1.5, ask: 0.9, demand: { siir: 1.3, fantastik: 1.2 }, tags: ['deniz', 'ask'],
      desc: 'Kalderanın öbür yakası: sessiz bir köy, gün batımına gelen gezginler. Adada toptancı yok.' },
  },
  venedik: {
    kanal: { name: 'Büyük Kanal', scene: 'sahil', traffic: 1.1, ask: 1, demand: { roman: 1.3, siir: 1.2 }, tags: ['ask', 'deniz'],
      desc: 'Gondollar, vaporettolar, rıhtımda bekleşen turistler.' },
    sanmarco: { name: 'San Marco', scene: 'carsi', traffic: 1.3, ask: 0.9, demand: { tarih: 1.3, polisiye: 1.2 }, tags: ['sehir', 'gizem'],
      desc: 'Güvercinler, kafeler, maske dükkânları. Kalabalık ama büyülü.' },
  },
  roma: {
    trastevere: { name: 'Trastevere', scene: 'carsi', traffic: 1.25, ask: 1, demand: { roman: 1.3, polisiye: 1.2 }, tags: ['sehir', 'komik'],
      desc: 'Sarmaşıklı duvarlar, trattoriler, gece geç saate kadar sohbet.' },
    forum: { name: 'Forum yamacı', scene: 'tepe', traffic: 0.9, ask: 1.6, demand: { tarih: 1.6, siir: 1.2 }, tags: ['savas', 'felsefe'],
      desc: 'Antik sütunların arasında, Kolezyum\'a bakan çimenler.' },
  },
  napoli: {
    liman: { name: 'Napoli limanı', scene: 'sahil', traffic: 1.15, ask: 0.9, demand: { polisiye: 1.4, cocuk: 1.2 }, tags: ['deniz', 'macera'],
      desc: 'Capri feribotları, balıkçılar, karşıda Vezüv.' },
    spaccanapoli: { name: 'Spaccanapoli', scene: 'carsi', traffic: 1.3, ask: 1, demand: { cocuk: 1.3, roman: 1.2 }, tags: ['aile', 'komik'],
      desc: 'Şehri ikiye bölen dar sokak: pizzacılar, minyatür ustaları, çocuklar.' },
  },
  palermo: {
    mondello: { name: 'Mondello', scene: 'sahil', traffic: 1.1, ask: 1, demand: { fantastik: 1.3, siir: 1.2 }, tags: ['deniz', 'buyu'],
      desc: 'Turkuaz koy, eski bir iskele, dondurmalı akşamüstleri.' },
    ballaro: { name: 'Ballarò pazarı', scene: 'carsi', traffic: 1.25, ask: 1.1, demand: { fantastik: 1.4, cocuk: 1.2 }, tags: ['buyu', 'cocukluk'],
      desc: 'Bağıran satıcılar, limon yığınları, köşede kukla tiyatrosu.' },
  },
  marsilya: {
    vieuxport: { name: 'Eski Liman', scene: 'sahil', traffic: 1.2, ask: 0.9, demand: { polisiye: 1.4, roman: 1.2 }, tags: ['deniz', 'gizem'],
      desc: 'Balıkçı tezgâhları, tekneler, sabah erkenden kalabalık.' },
    panier: { name: 'Le Panier', scene: 'carsi', traffic: 1.15, ask: 1.1, demand: { roman: 1.3, tarih: 1.2 }, tags: ['sehir', 'yalniz'],
      desc: 'Sabun dükkânları, duvar resimleri, yokuşlu dar sokaklar.' },
  },
  nis: {
    promenade: { name: 'İngilizler Yolu', scene: 'sahil', traffic: 1.15, ask: 1, demand: { siir: 1.4, roman: 1.2 }, tags: ['deniz', 'ask'],
      desc: 'Mavi sandalyelerde güneşlenenler, paten kayan çocuklar.' },
    cours: { name: 'Çiçek pazarı', scene: 'carsi', traffic: 1.2, ask: 1, demand: { fantastik: 1.3, siir: 1.2 }, tags: ['doga', 'umut'],
      desc: 'Cours Saleya: çiçekler, mimozalar, eski kitap tezgâhları.' },
  },
  barselona: {
    ramblas: { name: 'Las Ramblas', scene: 'carsi', traffic: 1.35, ask: 0.9, demand: { roman: 1.3, fantastik: 1.2 }, tags: ['sehir', 'macera'],
      desc: 'Sokak sanatçıları, kitap ve çiçek tezgâhları, durmayan bir kalabalık.' },
    barceloneta: { name: 'Barceloneta', scene: 'sahil', traffic: 1.15, ask: 1, demand: { polisiye: 1.3, cocuk: 1.2 }, tags: ['deniz', 'komik'],
      desc: 'Şehrin kumsalı: voleybol, paella, gün batımı.' },
  },
  valensiya: {
    bahce: { name: 'Turia bahçeleri', scene: 'tepe', traffic: 0.95, ask: 1.4, demand: { cocuk: 1.4, fantastik: 1.3 }, tags: ['aile', 'doga'],
      desc: 'Kuru nehir yatağında kilometrelerce park; dev Gulliver oyun alanı.' },
    mercado: { name: 'Merkez pazarı', scene: 'carsi', traffic: 1.25, ask: 1, demand: { roman: 1.2, cocuk: 1.3 }, tags: ['komik', 'aile'],
      desc: 'Portakal, safran, cam kubbenin altında bağıran satıcılar.' },
  },
  malaga: {
    alcazaba: { name: 'Alcazaba yokuşu', scene: 'tepe', traffic: 0.9, ask: 1.6, demand: { tarih: 1.5, siir: 1.3 }, tags: ['savas', 'felsefe'],
      desc: 'Mağribi surların altında, şehre bakan bahçeler.' },
    malagueta: { name: 'Malagueta', scene: 'sahil', traffic: 1.1, ask: 1, demand: { siir: 1.3, roman: 1.2 }, tags: ['deniz', 'huzun'],
      desc: 'Şehrin kumsalı, sardalya ızgaraları, akşam gezintisi.' },
  },
  iskenderiye: {
    kordon: { name: 'Kordon', scene: 'sahil', traffic: 1.2, ask: 1.1, demand: { tarih: 1.3, siir: 1.3 }, tags: ['deniz', 'huzun'],
      desc: 'Kilometrelerce kıyı, kahvehaneler, Kayıtbay\'a bakan dalgakıran.' },
    attarin: { name: 'Attarin pazarı', scene: 'carsi', traffic: 1.2, ask: 1.2, demand: { tarih: 1.4, polisiye: 1.2 }, tags: ['gizem', 'sehir'],
      desc: 'Antikacılar, eski haritalar, tozlu kitap yığınları.' },
  },
  kahire: {
    hanhalili: { name: 'Han el-Halili', scene: 'carsi', traffic: 1.35, ask: 1, demand: { fantastik: 1.3, polisiye: 1.3 }, tags: ['buyu', 'sehir'],
      desc: 'Fenerler, baharat, bakırcılar; kahvehanelerde nargile ve hikâye.' },
    piramitler: { name: 'Piramit tepesi', scene: 'tepe', traffic: 0.9, ask: 1.5, demand: { tarih: 1.6, fantastik: 1.2 }, tags: ['gizem', 'yolculuk'],
      desc: 'Çölün kıyısı. Turistler, develer ve dört bin yıllık sorular.' },
  },
};

for (const k in DISTRICTS) SPOTS[k] = DISTRICTS[k].spot;

export const firstSpot = town => Object.keys(SPOTS[town])[0];
