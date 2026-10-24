// Pazarlık (game/haggle.js): müşterinin gizli özelliklerinin dağılımları, huylar ve konuşmalar.
// Her müşteri bu aralıklardan kendi değerlerini çeker; aynı tipten iki kişi farklı davranır.
// budget: cüzdan (₺) · greed: ilk teklifini biçtiği değerin ne kadar altında açar · patience: kaç karşı teklife dayanır
// resolve: sabrı bitince son bir teklif verme ihtimali · touchy: fiyatı çok yüksek bulunca hemen gitme ihtimali
// Tip başına taban data/archetypes.js thrift'ten gelir (tight: cebine bakan · mid · loose: fiyata bakmayan); tipin haggle alanı üstüne yazar.
export const TRAITS = {
  tight: { budget: [12, 28], greed: [0.2, 0.4], patience: [2, 4], resolve: [0.5, 0.8], touchy: [0.35, 0.65] },
  mid:   { budget: [18, 40], greed: [0.12, 0.32], patience: [2, 3], resolve: [0.4, 0.7], touchy: [0.2, 0.5] },
  loose: { budget: [36, 110], greed: [0.05, 0.2], patience: [1, 3], resolve: [0.6, 0.9], touchy: [0.1, 0.3] },
};

// Huylar: bazı müşterilere düşer, değerlerini değiştirir (Faz 2'de görünüşe ve cümlelere de yansır)
export const QUIRK_CHANCE = 0.2;
export const QUIRKS = {
  sabirsiz: { name: 'Sabırsız', patienceSet: 1, touchy: 0.2 },
  comert:   { name: 'Cömert', budgetMul: 1.3, greedMul: 0.3 },
  supheci:  { name: 'Şüpheci', touchy: 0.3, greedMul: 1.3 },
  geveze:   { name: 'Geveze', patienceAdd: 1 },
};

// Kitaba biçilen değer çarpanları: aradığı türse, önerilen kitap isteğine uyduysa
export const TASTE = { wanted: 1.15, other: 0.9, perfect: 1.35, good: 1.1, noise: [0.85, 1.2] };
// sessiz alış: etiket, ödemeye razı olduğunun (1 − pazarlık eğilimi/2) katının altındaysa pazarlıksız öder
// teklif sınırı: etiket bunun bu katından yüksekse vazgeçer (öneri isteyen yine de dener)
export const OFFER_MAX = 1.45;
// "çok pahalı": istenen fiyat ödemeye razı olduğunun bu katını aşarsa sabır iki azalır, alıngan müşteri gidebilir
export const TOO_HIGH = 1.3;
// mutlu alışveriş: ödediği, biçtiği değerin bu katının altında (ertesi gün anlatır: ağızdan ağıza)
export const HAPPY_BELOW = 0.85;
// itibar kademesi başına pazarlık eğilimi bu oranda azalır (güvenilen satıcıyla az pazarlık edilir)
export const TRUST_PER_LEVEL = 0.12;
// alışkanlık: parası yetse de pazarlık etme ihtimali = pazarlık eğilimi × bu kat. Böyle müşteri etikete razıdır;
// fiyatında durmak kazandırır. Parası yetmeyen ise gerçekten sınırdadır; zorlamak kaçırır. İlk cümlesi hangisi olduğunu söyler.
export const HABIT = 1.6;

// Konuşmalar: durum → üslup → cümleler. {p}: söylenen fiyat (₺ işaretiyle birlikte yazılır)
// open: ilk teklif, parası yeter, alışkanlıktan pazarlık eder · poor: ilk teklif, cebi gerçekten dar
// counter: teklifini yükseltir · final: son sözü · deal: istediğin fiyata razı olur
// happy: ucuza aldı, sevindi · leave: sabrı bitti · angry: fiyatı çok yüksek buldu
export const LINES = {
  open: {
    genc: ['Şuna {p} desek?', 'Pazarlıksız olmaz ama, {p}?', '{p} yapalım, anlaşalım.'],
    resmi: ['Kitap güzel. {p} uygun olur mu?', 'Size {p} teklif edebilirim.', 'Usulen soruyorum: {p}?'],
    samimi: ['Hadi canım, {p} olsun, bir çay da benden!', '{p} verip alayım, ha?', 'Pazarlıksız alışveriş mi olur? {p}!'],
    turist: ['Oh, nice! {p}, okay?', '{p}? Yes? Please?', 'Bazaar price? {p}!'],
    cocuk: ['Annem pazarlık et dedi: {p}!', '{p} olur mu? Lütfeeen…', '{p}? Hı? Hı?'],
  },
  poor: {
    genc: ['Bu çok güzelmiş ama {p} olur mu? Harçlık bu kadar…', 'Ya, {p} versem? Ay sonu da…', 'Cebimde {p} var, o kadar…'],
    resmi: ['Kusura bakmayın, {p} vermeyi düşünüyordum.', 'Bütçem biraz dar; {p} olur mu?', 'Emekli maaşı malum… {p}?'],
    samimi: ['{p} versem, bırakır mısın? Fazlası yok.', 'Ay sonu geldi çattı, {p} olsa…', 'Valla cüzdan {p} diyor.'],
    turist: ['Only {p} left, sorry… okay?', 'My wallet says {p}…', '{p}? Last coins…'],
    cocuk: ['Kumbaramda {p} var… olur mu?', '{p} verip alabilir miyim? Lütfeeen…', 'Annem {p} verdi, yeter mi?'],
  },
  counter: {
    genc: ['Tamam tamam, {p}. Daha fazla zorlama ama!', 'Of… {p} veriyorum, son.', 'Biraz artırayım: {p}?'],
    resmi: ['Peki, {p} diyelim.', 'Anlıyorum. {p} sizin için de uygun mu?', '{p} vereyim, daha fazlası zor.'],
    samimi: ['Ne inatçısın! {p}, tamam mı?', 'Hadi bakalım, {p}.', 'Senin için {p}, ama kimseye söyleme!'],
    turist: ['Hmm… {p}?', 'Okay, okay. {p}!', '{p}, deal?'],
    cocuk: ['Cebimde biraz daha buldum: {p}!', '{p} olur mu? Bak bütün bozukluklarım…', 'Tamam… {p}.'],
  },
  final: {
    genc: ['Bak, {p}. Gerçekten bu kadar.', 'Son sözüm {p}, yoksa giderim.', '{p}. Bitti, cebimde başka yok.'],
    resmi: ['Son teklifim {p}.', '{p}, daha fazlasını veremem.', 'Bütçem {p}, o kadar.'],
    samimi: ['Son sözüm {p}, sonra küserim!', '{p}, gerisi kısmet.', 'Ya {p}, ya hiç!'],
    turist: ['{p}. Final!', 'Last offer: {p}.', 'Only {p}, sorry!'],
    cocuk: ['Kumbaram bitti… {p}.', 'Hepsi bu kadar: {p}!', '{p}… başka yok, söz!'],
  },
  deal: {
    genc: ['Tamam, anlaştık!', 'Peki peki, alıyorum.', 'Oldu bu iş.'],
    resmi: ['Anlaştık, teşekkür ederim.', 'Peki, uygun.', 'Kabul ediyorum.'],
    samimi: ['Hayırlı olsun, al bakalım!', 'Tamamdır, sar bakalım.', 'Olsun, seninle pazarlık keyifli.'],
    turist: ['Deal! Thank you!', 'Okay, I take it!', 'Yes, deal!'],
    cocuk: ['Yaşasın, benim oldu!', 'Tamaaam!', 'Oley!'],
  },
  happy: {
    genc: ['Harikasın, teşekkürler!', 'Ciddi mi? Çok iyisin!', 'Bunu arkadaşlara anlatacağım!'],
    resmi: ['Çok naziksiniz, sağ olun.', 'Ne güzel, teşekkür ederim.', 'Sizden yine alışveriş yaparım.'],
    samimi: ['Eline sağlık güzelim!', 'Bereketli olsun, bir dahakine yine geleceğim.', 'Ooo, sen ne iyi satıcısın!'],
    turist: ['Wonderful, thank you!', 'So kind! Thanks!', 'Great price, thank you!'],
    cocuk: ['Yaşasııın! Teşekkürler!', 'Sen en iyisisin!', 'Hemen okuyacağım!'],
  },
  leave: {
    genc: ['Boş ver, başka zaman.', 'Yok ya, olmuyor.', 'Kalsın, sağ ol.'],
    resmi: ['Anlaşamadık, iyi günler.', 'Kusura bakmayın, vazgeçtim.', 'Başka bir zaman belki.'],
    samimi: ['Eh, nasip değilmiş.', 'Kalsın canım, kolay gelsin.', 'Ben bir dolaşayım, belki dönerim.'],
    turist: ['No, sorry. Bye!', 'Too much for me. Thank you!', 'Maybe later!'],
    cocuk: ['Peki… hoşça kal.', 'Annem kızar, gideyim.', 'Olmadı…'],
  },
  angry: {
    genc: ['Bu fiyata mı? Ciddi olamazsın!', 'Ne kazık ama!', 'Yok artık!'],
    resmi: ['Bu fiyat insafsızca.', 'Bunu kabul edemem, iyi günler.', 'Hayret bir şey.'],
    samimi: ['Vay vay vay, altın mı bu?', 'Bu fiyata çarşıdan iki tane alırım!', 'Yok canım, olmaz öyle şey!'],
    turist: ['Too expensive! No!', 'What? No, no.', 'That is crazy!'],
    cocuk: ['Çok pahalııı!', 'O kadar param yok ki!', 'Hiç adil değil!'],
  },
  // söz derdine dokundu: değer verdi, teklifini yükseltir ({p}) · söz dokunmadı: kibarca geçiştirir
  sozYes: {
    genc: ['Hıı, bunu bilmiyordum! Peki, {p}.', 'Vay, o zaman başka. {p} vereyim.', 'Tamam, ikna oldum sayılır: {p}.'],
    resmi: ['Bu önemli bir ayrıntı. {p} diyelim.', 'Haklısınız, bu değerini artırır. {p}.', 'Öyleyse {p} uygun olur.'],
    samimi: ['Aaa, öyle mi? Hadi {p} olsun!', 'Sen bilirsin işini. {p}, tamam.', 'İçim ısındı bu kitaba: {p}.'],
    turist: ['Oh! Really? Okay, {p}!', 'Ah, special! {p} then.', 'Wow. {p}, yes!'],
    cocuk: ['Gerçekten mi? O zaman {p}!', 'Ooo! Kumbarayı biraz daha sallarım: {p}!', 'Vay be! {p}!'],
  },
  sozNo: {
    genc: ['Hı hı… neyse.', 'İyi de… o pek umurumda değil.', 'Olabilir…'],
    resmi: ['Anlıyorum, fakat benim için belirleyici değil.', 'Öyle mi? Peki.', 'Bu beni pek ilgilendirmiyor.'],
    samimi: ['Eh, olsun canım.', 'Hı hı, güzel… ama yine de.', 'Neyse neyse.'],
    turist: ['Hmm, okay…', 'I see… maybe.', 'Nice, but…'],
    cocuk: ['Hı?', 'Peki…', 'Ama ben resimlerine baktım!'],
  },
  // tanıdık yine geldi: ilk cümlesinden önce ({b}: geçen sefer aldığı kitap)
  back: {
    genc: ['Yine ben! «{b}» efsaneydi.', 'Selam! Geçen seferki «{b}» bitti bile.'],
    resmi: ['Yine buradayım. «{b}» çok iyi bir seçimdi.', 'Merhaba. «{b}» için teşekkür borçluyum.'],
    samimi: ['Ooo, yine geldim! «{b}» bir solukta bitti.', 'Kim geldi bak! «{b}» için sağ ol.'],
    turist: ['Hello again! «{b}» was great!', 'Me again! Loved «{b}».'],
    cocuk: ['Yine geldim! «{b}» çok güzeldi!', 'Merhaba! Annem «{b}» kitabını bana iki kere okudu!'],
  },
};

// Müşterinin derdi: bu kitapta neye önem verdiği. İlk cümlesinden sezilir (LINES.hint); doğru söz bu derde dokunur.
export const CARES = ['konu', 'kondisyon', 'nadirlik', 'ucuzluk', 'hediye', 'tavsiye'];
// tipine göre ağırlıklar (yazılmayan tip cebine göre: thrift)
export const CARE_WEIGHTS = {
  tight: { ucuzluk: 3, konu: 2, tavsiye: 1, hediye: 1 },
  mid: { konu: 3, tavsiye: 2, hediye: 1, kondisyon: 1, ucuzluk: 1 },
  loose: { kondisyon: 2, konu: 2, hediye: 1, nadirlik: 1 },
  koleksiyoncu: { nadirlik: 4, kondisyon: 3, konu: 1 },
  sevgili: { hediye: 4, konu: 1, tavsiye: 1 },
  anne: { hediye: 2, ucuzluk: 2, konu: 1 },
  yazar: { tavsiye: 3, konu: 2, kondisyon: 1 },
  emekli: { konu: 3, kondisyon: 1, ucuzluk: 1 },
  turist: { hediye: 2, konu: 2, kondisyon: 1 },
};
// Söz kartları: hangi derde ne kadar dokunur (1 tam, 0.5 biraz). Konu sözü kişinin sevdiği etiketse ayrıca biraz dokunur.
export const SOZ = {
  konu: { konu: 1, tavsiye: 0.5, hediye: 0.5 },
  kisisel: { tavsiye: 1, konu: 0.5 },
  kondisyon: { kondisyon: 1, hediye: 1, nadirlik: 0.5 },
  nadirlik: { nadirlik: 1, kondisyon: 0.5 },
  hatira: { tavsiye: 1, konu: 0.5, hediye: 0.5 },
  hediye: { hediye: 1, tavsiye: 0.5 },   // paket köşesi (Atölye) varken
};
// biçilen değerin artışı: tam isabet, biraz, koleksiyoncuya ilk baskı. Tam isabette bütçe de esner (kararlılık)
export const SOZ_LIFT = { full: 0.35, half: 0.12, rare: 0.5, stretch: 1.25 };
export const SOZ_MAX = 3;   // şeritte en fazla bu kadar söz kartı

// Derdin ipucu: ilk teklifin ardından söylenen cümle (fiyat yok)
export const HINTS = {
  konu: {
    genc: ['Konusu tam benlik gibi duruyor ama…', 'Arka kapağı ilgimi çekti.'],
    resmi: ['Konusu dikkatimi çekti.', 'Neyi anlattığını merak ediyorum.'],
    samimi: ['Neyi anlatıyor bu, sever miyim ben bunu?', 'Konusu hoşuma gitti gibi.'],
    turist: ['What is the story? Interesting…', 'The story looks nice.'],
    cocuk: ['Bunda ne oluyor? Heyecanlı mı?', 'Kapağı çok güzel, içinde ne var?'],
  },
  kondisyon: {
    genc: ['Sayfaları sağlam mı ama?', 'Çok eskimiş olmasın.'],
    resmi: ['Kitabın durumu benim için önemli.', 'Cildi sağlam görünüyor mu?'],
    samimi: ['Sayfaları dökülmesin, bak ona göre.', 'Temiz mi bu, lekesi yok değil mi?'],
    turist: ['Is it in good condition?', 'Pages okay? Clean?'],
    cocuk: ['Yırtık yok, değil mi?', 'Bu kirli mi?'],
  },
  nadirlik: {
    genc: ['Bu eski baskılardan mı?', 'Nadir bir şey mi bu?'],
    resmi: ['Hangi baskı olduğunu merak ediyorum.', 'Baskı bilgisi var mı acaba?'],
    samimi: ['Eski baskı mı bu, değerli mi?', 'Böylesini zor bulursun, değil mi?'],
    turist: ['Old edition? Rare?', 'Is it special? Antique?'],
    cocuk: ['Bu çok mu eski? Hazine gibi mi?', 'Dedemin kitapları gibi eski mi?'],
  },
  ucuzluk: {
    genc: ['Biraz pahalı geldi açıkçası.', 'Bütçem belli, o yüzden…'],
    resmi: ['Fiyatı biraz yüksek buldum.', 'Hesaplı olsun isterim.'],
    samimi: ['Biraz tuzlu ama bu fiyat.', 'Cebime göre bir şey arıyorum.'],
    turist: ['A bit expensive…', 'Cheaper, maybe?'],
    cocuk: ['Çok mu pahalı bu?', 'Kumbaram küçük ama…'],
  },
  hediye: {
    genc: ['Arkadaşıma hediye alacağım da.', 'Doğum günü hediyesi olacak.'],
    resmi: ['Bir yakınıma hediye edeceğim.', 'Hediye olarak düşünüyorum.'],
    samimi: ['Torunuma hediye, güzel olsun.', 'Komşuma götüreceğim, yüzümü kara çıkarmasın.'],
    turist: ['A gift for my friend.', 'A souvenir, a present.'],
    cocuk: ['Anneme hediye!', 'Öğretmenime vereceğim.'],
  },
  tavsiye: {
    genc: ['Okumaya değer mi sence?', 'Sen okudun mu bunu?'],
    resmi: ['Tavsiye eder misiniz?', 'Sizin fikrinizi merak ediyorum.'],
    samimi: ['Sen ne dersin, alayım mı?', 'Sen bilirsin, okudun mu?'],
    turist: ['Do you recommend it?', 'Is it good? You read it?'],
    cocuk: ['Güzel mi bu? Sen okudun mu?', 'Bunu sever miyim?'],
  },
};
