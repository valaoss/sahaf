// Ana hikâye: Kostas Efendi'nin kayıp kütüphanesi. Sayfalar sırayla açılır; her birinin koşulu ve bir sonrakinin ipucu var.
// need: koşul türü ve eşiği (game/story.js) · hint: oyuncuya gösterilen ipucu (bu sayfayı açmak için)
export const PAGES = [
  { id: 'miras', title: 'Teyzemin mektubu', need: { start: 1 }, hint: '',
    text: 'Sevgili yeğenim, bu karavan artık senin. Kırk yıl Ege\'nin kasabalarını onunla dolaştım. Bir de şunu bil: Ben gençken bu mesleği Kostas Efendi adında yaşlı bir sahaftan öğrendim. Onun bir kütüphanesi vardı; "deniz görmeyen kitaplar" derdi onlara. Bir gün kütüphane ortadan kayboldu. Defterinin sayfalarını kasabalara dağıttığını söylerlerdi. Belki sen bulursun. — Nermin Teyzen' },
  { id: 'dostlar', title: 'Kahvedeki yaşlı adam', need: { towns: 4 }, hint: 'Dört kasabanın hepsinde dükkân aç.',
    text: 'Foça\'daki kahvede yaşlı bir adam, Kostas\'ın her kasabada bir dostu olduğunu anlattı: "Kitabı doğru kişiye veren sahafa defterini emanet ederler," dedi. Elinde sararmış bir sayfa vardı: "Kitaplar okunmak için yazılır, saklanmak için değil. — K."' },
  { id: 'liste', title: 'Kitabın arasındaki liste', need: { perfect: 10 }, hint: 'Önerilerde 10 kez tam isabet yakala.',
    text: 'Bir müşteri, önerdiğin kitabın arasından bir kâğıt çıkardı: Kostas\'ın el yazısıyla bir liste. "Ayvalık: zeytin. Cunda: rüzgâr. Foça: fok. Alaçatı: değirmen." Altında tek satır: "Anahtar dostluktadır."' },
  { id: 'fener', title: 'Kapıdaki fener', need: { hearts: 3 }, hint: 'Bir müdavimle 3 kalbe ulaş.',
    text: 'Müdavimlerinden biri sana bir sır verdi: büyükannesi Kostas\'ın kütüphanesine gidermiş. "Kapısında bir fener yanardı," demiş, "gece gündüz." Bir festival gününü beklemeni öğütledi: "O gün herkes sokakta olur, eski hikâyeler de."' },
  { id: 'zarf', title: 'Festivaldeki zarf', need: { festival: 1 }, hint: 'Bir festival günü o kasabada dükkân aç.',
    text: 'Festival kalabalığında yaşlı bir kadın karavanına yaklaştı ve bir zarf bıraktı. İçinde bir harita parçası vardı: bir ada, bir tepe, küçük bir haç işareti. Kimden olduğunu sormaya kalmadan kalabalığa karıştı.' },
  { id: 'iz', title: 'Silik cümle', need: { carry: { book: 'yasliadam', town: 'foca' } },
    hint: 'Rafında «Yaşlı Adam ve Deniz» varken Foça\'da dükkân aç. Kitap yoksa toptancıdan sipariş edebilirsin.',
    text: 'Foça\'daki kahvenin yaşlı adamı rafında «Yaşlı Adam ve Deniz»i görünce gülümsedi: "Kostas bu kitabı herkese okuturdu." Harita parçasını ışığa tuttu; arkasında silik bir cümle belirdi: "Rafların dolu olsun, sonra gel."' },
  { id: 'gizligoz', title: 'Karavanın gizli gözü', need: { shelfLv: 3 }, hint: 'Kitap karavanına geç (50 kitap).',
    text: 'Raflar genişlerken bir tahta yerinden oynadı. Altında Nermin Teyzenin son mektubu: "Kostas\'ın kütüphanesi Cunda\'daki tepede, şapelin altındaydı. Kapıyı ancak dolu bir sahaf karavanı açar derdi; şaka sanırdım."' },
  { id: 'kutuphane', title: 'Kayıp kütüphane', need: { finale: 1 }, hint: 'Cunda\'da, Ada tepesinde dükkân aç.',
    text: 'Akşam, şapelin yanındaki eski taş kapı karavanın ışıklarıyla aralandı. İçeride tozlu ama sapasağlam raflar: yüzlerce kitap, her birinin arasında bir not. "Bu kitapları kasabalara geri götür. — K." Kütüphane artık kayıp değil; senin karavanında yaşıyor.' },
];

export const FINALE_REWARD = { decor: 'kostas', coins: 150 };
