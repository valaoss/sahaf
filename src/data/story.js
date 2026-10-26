// Ana hikâye: Kostas Efendi'nin kayıp kütüphanesi. Sayfalar sırayla açılır; her birinin koşulu ve bir sonrakinin ipucu var.
// need: koşul türü ve eşiği (game/story.js) · hint: oyuncuya gösterilen ipucu (bu sayfayı açmak için)
export const PAGES = [
  { id: 'miras', title: 'Teyzemin mektubu', need: { start: 1 }, hint: '',
    text: 'Sevgili yeğenim, bu karavan artık senin. Kırk yıl Ege\'nin kasabalarını onunla dolaştım. Bir de şunu bil: Ben gençken bu mesleği Kostas Efendi adında yaşlı bir sahaftan öğrendim. Onun bir kütüphanesi vardı; "deniz görmeyen kitaplar" derdi onlara. Bir gün kütüphane ortadan kayboldu. Defterinin sayfalarını kasabalara dağıttığını söylerlerdi. Belki sen bulursun. — Nermin Teyzen' },
  { id: 'dostlar', title: 'Kahvedeki yaşlı adam', need: { towns: 4 }, hint: 'Dört mahallede dükkân aç.',
    text: 'Kordondaki kahvede yaşlı bir adam, Kostas\'ın her mahallede bir dostu olduğunu anlattı: "Kitabı doğru kişiye veren sahafa defterini emanet ederler," dedi. Elinde sararmış bir sayfa vardı: "Kitaplar okunmak için yazılır, saklanmak için değil. — K."' },
  { id: 'liste', title: 'Kitabın arasındaki liste', need: { perfect: 10 }, hint: 'Önerilerde 10 kez tam isabet yakala.',
    text: 'Bir müşteri, önerdiğin kitabın arasından bir kâğıt çıkardı: Kostas\'ın el yazısıyla bir liste. "İskele: martı. Çınaraltı: yaprak. Okul Yokuşu: merdiven. Eski Çarşı: kemer." Altında tek satır: "Anahtar dostluktadır."' },
  { id: 'fener', title: 'Kapıdaki fener', need: { hearts: 3 }, hint: 'Bir müdavimle 3 kalbe ulaş.',
    text: 'Müdavimlerinden biri sana bir sır verdi: büyükannesi Kostas\'ın kütüphanesine gidermiş. "Kapısında bir fener yanardı," demiş, "gece gündüz." Bir festival gününü beklemeni öğütledi: "O gün herkes sokakta olur, eski hikâyeler de."' },
  { id: 'zarf', title: 'Festivaldeki zarf', need: { festival: 1 }, hint: 'Bir mahallenin şenlik ya da olay gününde orada dükkân aç.',
    text: 'Festival kalabalığında yaşlı bir kadın karavanına yaklaştı ve bir zarf bıraktı. İçinde bir harita parçası vardı: bir burun, bir fener, küçük bir haç işareti. Kimden olduğunu sormaya kalmadan kalabalığa karıştı.' },
  { id: 'iz', title: 'Silik cümle', need: { carry: { book: 'yasliadam', town: 'foca', koy: 'carsi' } },
    hint: 'Rafında «Yaşlı Adam ve Deniz» varken Eski Çarşı\'da dükkân aç. Kitap yoksa toptancıdan sipariş edebilirsin.',
    text: 'Kordondaki kahvenin yaşlı adamı bu kez Eski Çarşı\'nın kemerleri altındaydı. Rafında «Yaşlı Adam ve Deniz»i görünce gülümsedi: "Kostas bu kitabı herkese okuturdu." Harita parçasını ışığa tuttu; arkasında silik bir cümle belirdi: "Rafların dolu olsun, sonra gel."' },
  { id: 'gizligoz', title: 'Karavanın gizli gözü', need: { shelfLv: 3 }, hint: 'Kitap karavanına geç (50 kitap).',
    text: 'Raflar genişlerken bir tahta yerinden oynadı. Altında Nermin Teyzenin son mektubu: "Kostas\'ın kütüphanesi Fener Burnu\'ndaydı, eski fener bekçisinin evinin altında. Kapıyı ancak dolu bir sahaf karavanı açar derdi; şaka sanırdım."' },
  { id: 'kutuphane', title: 'Kayıp kütüphane', need: { finale: 1 }, hint: 'Fener Burnu\'nda dükkân aç.',
    text: 'Akşam, fener bekçisinin evinin yanındaki eski taş kapı karavanın ışıklarıyla aralandı. İçeride tozlu ama sapasağlam raflar: yüzlerce kitap, her birinin arasında bir not. "Bu kitapları mahallelere geri götür. — K." Kütüphane artık kayıp değil; senin karavanında yaşıyor.' },
];

export const FINALE_REWARD = { decor: 'kostas', coins: 150 };
