// Müşteriyle sohbet: "Biraz daha anlatır mısın?" sorusuna cevaplar (tür ipucu verir) ve çay ikramına teşekkürler.
// {g}: türün adı (küçük harf), {tag}: aradığı şeyin bir başka yönü. Üsluba göre (data/archetypes.js voice).
export const TALK = {
  genre: {
    samimi: [
      'Aslında en çok {g} okurum, bilesin.',
      'Bana sorarsan {g} hep iyi gider.',
      'Geçen ay da bir {g} bitirdim, bayıldım.',
      'Rafta {g} varsa oradan başla bence.',
    ],
    resmi: [
      'Tercihim genellikle {g} türünden yana.',
      'Kütüphanemin çoğu {g}, itiraf edeyim.',
      'Bu aralar {g} okumayı daha çok seviyorum.',
    ],
    genc: [
      'Ya ben {g} manyağıyım aslında.',
      'Şöyle sürükleyici bir {g} olsa süper olur.',
      'Arkadaşlar hep {g} öneriyor, ben de merak ettim.',
    ],
    cocuk: [
      'Ben en çok {g} seviyorum!',
      'Annem {g} alabilirsin dedi!',
      'Resimli olmasa da olur, {g} olsun yeter!',
    ],
    turist: [
      'I like… {g}? Evet, {g}!',
      'In my country I read {g}… burada da olur!',
    ],
  },
  // etiket ipucu: aradığı şeyin bir yönünü de söyler
  tag: [
    'Bir de içinde biraz {tag} olsa…',
    'Ha, {tag} de olursa tadından yenmez.',
    'Hatta {tag} varsa hiç düşünmem.',
  ],
  tea: [
    'Çay mı? Ne hoş, teşekkür ederim!',
    'Ooo, demli mi? Tam istediğim.',
    'Çayla kitap, daha ne olsun.',
    'Ellerine sağlık, mis gibi kokuyor.',
  ],
};
