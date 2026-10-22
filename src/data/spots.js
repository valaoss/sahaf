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
};

export const firstSpot = town => Object.keys(SPOTS[town])[0];
