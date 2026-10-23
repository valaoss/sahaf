// Kasaba içi mekânlar: sabah karavanı nereye kuracağını seçersin (ücretsiz).
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
};

export const firstSpot = town => Object.keys(SPOTS[town])[0];
