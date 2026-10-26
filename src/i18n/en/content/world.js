// English overlay: towns, spots, countries, calendar, decor, stamps, story, voyage, Kostas notes, tutorial.

const TOWNS = {
  iskele: { name: "The Quay", blurb: "A stone promenade, a wooden pier, gulls. Tourists, families and fishermen; crime and children's books sell.",
    koy: { ev: { name: "Fishermen's Fête", note: "The boats are dressed with flags; the promenade is packed and the children are out on the pier." } } },
  park: { name: "Plane Tree Park", blurb: "A pond and benches in the shade of a giant plane tree. Pensioners, parents, lovers; poetry, novels and children's books.",
    koy: { ev: { name: "Concert under the Plane Tree", note: "A quartet is playing under the plane tree this afternoon; the benches are full and everyone lingers." } } },
  okul: { name: "School Hill", blurb: "Stone steps, bicycles, posters. Students and young writers: short on money, long on numbers.",
    koy: { ev: { name: "Start of term", note: "Schools are back: the hill is full of students clutching reading lists." } } },
  carsi: { name: "Old Bazaar", blurb: "An arcaded square, stalls, crowds. Everything sells, but everyone haggles.",
    koy: { ev: { name: "Market day", note: "The weekly market fills the square: baskets, shouting, bargaining. Big crowds, short tempers." } } },
  boyaci: { name: "Painters' Lane", blurb: "Colourful shutters, easels, cats in the windows. Artists and devoted readers; poetry and first editions.",
    koy: { ev: { name: "Street exhibition", note: "The shutters have become canvases; painters are out in the lane and everyone wants to chat." } } },
  kosk: { name: "Mansion Ridge", blurb: "Mansions with gardens, lamp posts, quiet. Collectors and wealthy readers: few people, full wallets.",
    koy: { ev: { name: "Book tea in a mansion garden", note: "A mansion is holding a book tea in its garden; the guests stop by your stall on the way home." } } },
  fener: { name: "Lighthouse Point", blurb: "A lighthouse and the wind. Once a week a booksellers' fair sets up: collectors hunting first editions.",
    koy: { ev: { name: "Booksellers' fair", note: "A booksellers' fair at the foot of the lighthouse: collectors are after first editions, wallets open." } } },
  ayvalik: { name: "Ayvalık", blurb: "Olive groves and old stone houses. Readers here love novels and history." },
  cunda: { name: "Cunda", blurb: "A little island with quiet streets. Plenty of poetry lovers, not many crowds." },
  foca: { name: "Foça", blurb: "Seal rocks and a castle. History buffs and mystery fans gather here." },
  alacati: { name: "Alaçatı", blurb: "Stone streets, wind and holidaymakers. Busy; fantasy and crime sell well." },
  bozcaada: { name: "Bozcaada", blurb: "A wind-swept island: vineyards, a castle and a sleepy harbour. Lots of poetry and history readers." },
  sirince: { name: "Şirince", blurb: "A stone mountain village among olive and fig orchards. Fairy tales and old stories live here." },
  dikili: { name: "Dikili", blurb: "A wide beach, warm water, a calm seafront. Lots of retirees and families; they ask for mysteries and children's books." },
  urla: { name: "Urla", blurb: "Vineyards, artichoke fields and artists' studios. Curious readers who ask for poetry and thoughtful novels." },
  assos: { name: "Assos", blurb: "A stone village in the shadow of the Temple of Athena, with Lesbos across the water. The last stop for history and philosophy readers." },
  bodrum: { name: "Bodrum", blurb: "White houses, bougainvillea and a mighty castle by the sea. Holidaymakers want a mystery for the beach." },
  antalya: { name: "Antalya", blurb: "The narrow lanes of Kaleiçi, the Fluted Minaret, the snowy Taurus behind. Even winter is mild; readers come all year round." },
  istanbul: { name: "Istanbul", blurb: "The Old Book Bazaar, ferries, gulls, Galata. Kostas Efendi learned the trade here; every bookseller passes through one day." },
  kapadokya: { name: "Cappadocia", blurb: "A fairy tale far from the sea: fairy chimneys, rock-cut churches, balloons filling the sky every morning." },
  midilli: { name: "Lesbos", blurb: "Right across from Ayvalık: olive groves, a stone castle, fishermen at dawn. Books from both shores meet here." },
  atina: { name: "Athens", blurb: "A bustling city in the shadow of the Acropolis. Philosophy students, tourists, actors; everyone is looking for something." },
  selanik: { name: "Thessaloniki", blurb: "The White Tower, a long seafront, old markets. Atatürk's birthplace is here too; many people speak Turkish." },
  santorini: { name: "Santorini", blurb: "The half-moon rim of a volcano: white houses on the cliffs, blue domes, the world's most famous sunset." },
  venedik: { name: "Venice", blurb: "Canals instead of streets, gondolas instead of cars. A reader on every bridge, a secret in every palazzo." },
  roma: { name: "Rome", blurb: "Coffee, cats and two-thousand-year-old stones in the shadow of the Colosseum. History readers feel at home." },
  napoli: { name: "Naples", blurb: "Loud, warm streets hung with laundry at the foot of Vesuvius. Everyone talks, and everyone knows a story." },
  palermo: { name: "Palermo", blurb: "Red domes, lemon groves, puppet theatres. Arab, Norman, Sicilian; a different tale on every corner." },
  marsilya: { name: "Marseille", blurb: "The Old Port, the fish market, a basilica with a golden Madonna on the hill. France's oldest and noisiest city." },
  nis: { name: "Nice", blurb: "Palm trees along the Promenade des Anglais, blue chairs, a turquoise sea. The shore of painters and poets." },
  barselona: { name: "Barcelona", blurb: "Gaudí's city: wavy roofs, mosaics, a church that's never finished. Book stalls on Las Ramblas every day." },
  valensiya: { name: "Valencia", blurb: "Orange groves, parks in an old dry riverbed, a gleaming white city of science. Families come looking for books." },
  malaga: { name: "Málaga", blurb: "Picasso's birthplace: the Alcazaba on the hill, beaches and palm trees below. The gateway to Andalusia." },
  iskenderiye: { name: "Alexandria", blurb: "City of the ancient world's great library. Cafés along the Corniche, the Citadel of Qaitbay on the horizon." },
  kahire: { name: "Cairo", blurb: "A giant city on the Nile; bazaars, minarets and the pyramids at its edge. Its book market is centuries old." },
};

const SPOTS = {
  iskele: { kordon: { name: "Promenade", desc: "A stone promenade and balustrade; the bay's houses behind." } },
  park: { cinar: { name: "Under the plane tree", desc: "By the pond, in the shade, birdsong. Lots of people ask for recommendations." } },
  okul: { yokus: { name: "Top of the steps", desc: "Busy at the end of school: hurried and curious." } },
  carsi: { meydan: { name: "Arcaded square", desc: "A corner between the stalls. Lots of sales, lots of haggling." } },
  boyaci: { kepenk: { name: "The shutters", desc: "In front of the studios. Few customers, but curious ones." } },
  kosk: { bahce: { name: "Mansion gardens", desc: "Iron railings, rose gardens. Clean and rare books are sought after." } },
  fener: { burun: { name: "Below the lighthouse", desc: "A windy headland. Quiet except on fair day." } },
  ayvalik: {
    iskele: { name: "The Pier", desc: "Fishing boats and gulls. Lots of poetry and novel readers." },
    carsi: { name: "Bazaar", desc: "Busy and in a hurry. Families and kids; few ask for recommendations." },
  },
  cunda: {
    liman: { name: "Harbour", desc: "Where the boats to the island come ashore." },
    tepe: { name: "Island hilltop", desc: "Quiet and windy. Few people come, but most of them stay to chat and ask for a recommendation." },
  },
  foca: {
    kale: { name: "By the castle", desc: "In the shade of the old walls. History lovers pass by here." },
    kayalik: { name: "Siren Rocks", desc: "Families who come to see the seals, and lovers of fairy tales." },
  },
  alacati: {
    carsi: { name: "Bazaar", desc: "Holidaymakers, cafés, crowds. Lots of sales, little chatter." },
    degirmen: { name: "Windmills", desc: "A quiet corner beneath the windmills. Many ask for recommendations." },
    plaj: { name: "Beach", desc: "Sun loungers and ice-cream sellers. Light, fun books sell well." },
  },
  bozcaada: {
    liman: { name: "Castle harbour", desc: "Fishing boats in the castle's shadow. People ask for history and sea stories." },
    bag: { name: "Vineyard houses", desc: "A quiet corner among the vines. Lots of poetry readers and long chats." },
  },
  sirince: {
    carsi: { name: "Village market", desc: "Jam stalls and handmade toys. Fairy-tale books sell here." },
    tepe: { name: "Church lane", desc: "An old church at the top of the stone steps. Few people, deep conversations." },
  },
  dikili: {
    kumsal: { name: "The wide beach", desc: "Umbrellas, sandcastles, grandmothers reading in the shade." },
    kordon: { name: "Seafront", desc: "Evening strolls and ice-cream sellers. Mystery fans pass by here." },
  },
  urla: {
    iskele: { name: "Urla pier", desc: "A wooden pier and a fishermen's café. Long talks, deep questions." },
    bag: { name: "Vineyard road", desc: "The road to the studios, among vines and wind turbines." },
  },
  assos: {
    liman: { name: "Ancient harbour", desc: "Stone houses at the water's edge. People waiting for the Lesbos ferry look for books." },
    tapinak: { name: "Temple hill", desc: "The slope where Aristotle walked. Few come, but those who do talk for a long time." },
  },
  bodrum: {
    marina: { name: "Marina", desc: "Yachts, gulets, holidaymakers heading to the beach. Busy but hurried." },
    carsi: { name: "Bodrum bazaar", desc: "Bougainvillea lanes, sandal makers, ice-cream sellers." },
  },
  antalya: {
    kaleici: { name: "Kaleiçi", desc: "The old town, entered through Hadrian's Gate. Mansions, courtyards, guided groups." },
    konyaalti: { name: "Konyaaltı", desc: "A long pebble beach with the Taurus behind. Families and umbrellas." },
  },
  istanbul: {
    sahaflar: { name: "Old Book Bazaar", desc: "Centuries-old booksellers in Beyazıt. Whoever asks for a book here knows their books." },
    karakoy: { name: "Karaköy pier", desc: "Ferry commuters, simit sellers, gulls. A short book for a short crossing." },
  },
  kapadokya: {
    goreme: { name: "Göreme market", desc: "Carpet sellers and potters among the cave houses, and balloon passengers at dawn." },
    peribacalari: { name: "Fairy Chimneys", desc: "Rocks carved by the wind. Few come, and those who do ask for fairy tales." },
  },
  midilli: {
    liman: { name: "Mytilene harbour", desc: "The quay where the Ayvalık ferry docks. Travellers and fishermen." },
    zeytinlik: { name: "Olive groves", desc: "A stone village path among centuries-old olive trees." },
    ada: { name: "Boat to the islet", desc: "Half an hour by fishing boat: one taverna, a chapel, wanderers. No wholesaler on the island." },
  },
  atina: {
    plaka: { name: "Plaka", desc: "Narrow lanes, tavernas and tourist crowds at the foot of the Acropolis." },
    akropolis: { name: "Below the Acropolis", desc: "The Parthenon up above. Philosophy students ready to debate." },
    ada: { name: "Boat to Aegina", desc: "By boat from Piraeus to Aegina: pistachio orchards, harbour cafés, day-trippers. No wholesaler on the island." },
  },
  selanik: {
    kordon: { name: "By the White Tower", desc: "Strollers along the seafront, simit sellers, evening light." },
    modiano: { name: "Modiano market", desc: "Fish, cheese, spices… and old book stalls in a corner." },
    ada: { name: "Boat to the cove", desc: "A boat across the gulf: pine trees, a beach, summer folk. No wholesaler over there." },
  },
  santorini: {
    oia: { name: "Oia slope", desc: "White houses on the cliff edge. Everyone waiting for the sunset wants a book." },
    fira: { name: "Fira lanes", desc: "Stepped lanes, donkey caravans, passengers off the cruise ships." },
    ada: { name: "Boat to Thirasia", desc: "The far side of the caldera: a quiet village, wanderers who come for the sunset. No wholesaler on the island." },
  },
  venedik: {
    kanal: { name: "Grand Canal", desc: "Gondolas, vaporettos, tourists lingering on the quay." },
    sanmarco: { name: "San Marco", desc: "Pigeons, cafés, mask shops. Crowded but magical." },
  },
  roma: {
    trastevere: { name: "Trastevere", desc: "Ivy-covered walls, trattorias, conversations late into the night." },
    forum: { name: "Forum slope", desc: "Grass among the ancient columns, looking out at the Colosseum." },
  },
  napoli: {
    liman: { name: "Port of Naples", desc: "Capri ferries, fishermen, Vesuvius across the bay." },
    spaccanapoli: { name: "Spaccanapoli", desc: "The narrow street that splits the city in two: pizzerias, nativity craftsmen, children." },
  },
  palermo: {
    mondello: { name: "Mondello", desc: "A turquoise bay, an old pier, evenings with gelato." },
    ballaro: { name: "Ballarò market", desc: "Shouting vendors, heaps of lemons, a puppet theatre in the corner." },
  },
  marsilya: {
    vieuxport: { name: "Old Port", desc: "Fish stalls, boats, crowds from early morning." },
    panier: { name: "Le Panier", desc: "Soap shops, murals, steep narrow lanes." },
  },
  nis: {
    promenade: { name: "Promenade des Anglais", desc: "Sunbathers on blue chairs, children on roller skates." },
    cours: { name: "Flower market", desc: "Cours Saleya: flowers, mimosa, old book stalls." },
  },
  barselona: {
    ramblas: { name: "Las Ramblas", desc: "Street performers, book and flower stalls, a crowd that never stops." },
    barceloneta: { name: "Barceloneta", desc: "The city beach: volleyball, paella, sunsets." },
  },
  valensiya: {
    bahce: { name: "Turia Gardens", desc: "Miles of park in a dry riverbed, with a giant Gulliver playground." },
    mercado: { name: "Central Market", desc: "Oranges, saffron, vendors calling out beneath the glass dome." },
  },
  malaga: {
    alcazaba: { name: "Alcazaba slope", desc: "Gardens looking over the city beneath the Moorish walls." },
    malagueta: { name: "Malagueta", desc: "The city beach, sardines on the grill, evening strolls." },
  },
  iskenderiye: {
    kordon: { name: "Corniche", desc: "Miles of shoreline, cafés, a breakwater facing Qaitbay." },
    attarin: { name: "Attarine market", desc: "Antique dealers, old maps, dusty piles of books." },
  },
  kahire: {
    hanhalili: { name: "Khan el-Khalili", desc: "Lanterns, spices, coppersmiths; hookahs and stories in the cafés." },
    piramitler: { name: "Pyramid plateau", desc: "The edge of the desert. Tourists, camels and four-thousand-year-old questions." },
  },
};

const COUNTRIES = {
  tr: { name: "Türkiye", greet: "Merhaba" },
  gr: { name: "Greece", greet: "Kalimera", hint: "You can see the far shore from Assos. The ferry route opens once the notebook is complete." },
  it: { name: "Italy", greet: "Ciao", hint: "Visit three cities in Greece to open the ferry to Italy." },
  fr: { name: "France", greet: "Bonjour", hint: "Visit three cities in Italy to open the road to France and Spain." },
  es: { name: "Spain", greet: "¡Hola!", hint: "Visit three cities in Italy to open the road to France and Spain." },
  eg: { name: "Egypt", greet: "Marhaba", hint: "Once your passport holds stamps from five countries, the Alexandria ferry sets sail." },
};

const PAPER = { tr: "The Aegean Post", gr: "The Kalimera Gazette", it: "La Gazzetta", fr: "Le Petit Journal", es: "El Diario", eg: "The Nile Post" };
const PAPER_TOWN = { istanbul: "The Bosphorus Post", antalya: "The Mediterranean Post", kapadokya: "The Anatolian Post" };

const WEATHER = {
  gunesli: { name: "Sunny", note: "The streets fill up." },
  bulutlu: { name: "Cloudy", note: "A cool day; people linger a little longer." },
  yagmurlu: { name: "Rainy", note: "Few people go out, but those who do want a chat." },
  ruzgarli: { name: "Windy", note: "The beaches empty out and poetry readers multiply." },
};

const SEASON = {
  "İlkbahar": { note: "The bougainvillea is in bloom." },
  "Yaz": { note: "The holidaymakers have arrived; the towns are bustling." },
  "Sonbahar": { note: "The leaves are turning yellow: reading season." },
  "Kış": { note: "Quiet streets; those who come stay for long chats." },
};

const SPECIAL = {
  "İlkbahar": {
    3: { name: "April 23rd Children's Day", note: "It's a holiday! Kids are out in the streets and fairy-tale books are flying off the shelves." },
    6: { name: "Hıdırellez", note: "Wishes are tied to rose branches; sweethearts are looking for poetry." },
  },
  "Yaz": {
    4: { name: "Aegean Book Fair", note: "Fair week: collectors are in town, and first editions are three times as likely to turn up in your crates." },
  },
  "Sonbahar": {
    2: { name: "Back to school", note: "Notebooks, pencils and, of course, books: the students are on their way." },
  },
  "Kış": {
    7: { name: "New Year's Eve", note: "The gift rush! A book is the loveliest present, and tips are generous too." },
  },
};

const EVENTS = {
  zeytin: { name: "Olive Oil Festival", note: "The whole region comes for olive tastings. Huge crowds; classic novels and history books draw attention." },
  sergi: { name: "Island Art Show", note: "The painters take to the streets. Lots of poetry readers, and everyone's up for a chat." },
  fokgunu: { name: "Seal Watching Day", note: "Schools have organised trips to Foça. Children's books get snapped up." },
  kumsal: { name: "Beach Book Fest", note: "Umbrellas and book baskets line the beach. Families and children are pouring in." },
  bagbozumu: { name: "Grape Harvest", note: "Grapes are being picked in the vineyards and the studios open their doors. Poetry and novel readers are out." },
  tapinak: { name: "Sunset at the Temple", note: "Everyone climbs to the Temple of Athena to watch the sun set behind Lesbos." },
  sahaflar: { name: "Booksellers' Festival", note: "The booksellers of Beyazıt have moved their stalls into the street. Signing tables and old-book hunters." },
  balon: { name: "Balloon Festival", note: "Hundreds of balloons take off on the same morning. The valleys are full of tourists." },
  karnaval: { name: "Venice Carnival", note: "Masks, cloaks, decorated gondolas on the canals. Everyone wants a book to become someone else." },
  lavanta: { name: "Mimosa and Book Days", note: "The flower market has joined forces with the book stalls. Poetry readings scented with mimosa." },
  santjordi: { name: "Sant Jordi (Day of the Rose and the Book)", note: "The whole city gives a rose and a book to someone they love. The loveliest day for booksellers!" },
  kahirefuar: { name: "Cairo Book Fair", note: "The biggest book fair in the Arab world. Millions of readers, thousands of stalls." },
  kitapfuari_gr: { name: "Athens Book Fair", note: "Hundreds of book stalls in the Zappeion gardens. Every reader in Athens is out on the street." },
  otfest: { name: "Herb Festival", note: "Stalls, music, crowds. Holidaymakers are after something light to read." },
};

const GOSSIP = [
  "The gulls raided the simit seller's stall on the pier again.",
  "Pamuk, the town's oldest cat, received an \"honorary resident\" certificate from the council.",
  "Backgammon tournament at the café: the champion is once again Ramiz Bey, the retired postman.",
  "The figs ripened early this year, and prices at the market have dropped.",
  "Word is that Mehmet the baker sneaks a look at a book cover every morning as he passes the bookshop.",
  "The windsurfers in Alaçatı have opened a new school.",
  "A painter in Cunda has put the bookshop van on canvas.",
  "The fishermen of Foça say there are more seals than usual this year.",
  "Ayvalık's toastie makers still can't agree on who makes \"the best toastie\".",
  "The town library is holding story time for children at weekends.",
];

const SLOTS = {
  roof: { name: "Roof" },
  table: { name: "Display table" },
  ground: { name: "Pavement" },
};

const DECOR = {
  kaktus: { name: "Cactus", desc: "The van's very first decoration." },
  bayrak: { name: "Bunting", desc: "Visible from afar: +2 visitors a day." },
  firildak: { name: "Wind spinner", desc: "+3 visitors, and customers are a little more patient." },
  bos: { name: "Bare table", desc: "A plain table." },
  ayicik: { name: "Teddy bear", desc: "More people come looking for children's books." },
  buyutec: { name: "Magnifier and hat", desc: "Mystery fans drop by." },
  ejderha: { name: "Dragon figurine", desc: "Draws in fantasy readers." },
  harita: { name: "Old map", desc: "Catches the eye of history lovers." },
  mum: { name: "Candle and rose", desc: "More people come looking for novels and poetry." },
  demlik: { name: "Teapot", desc: "Customers waiting for a recommendation are more patient, tips +₺2." },
  zeytin: { name: "Olive branch wreath", desc: "A gift from Master Hasan: +2 visitors, more people looking for novels." },
  degirmen: { name: "Tiny windmill", desc: "A gift from Zeynep: +3 visitors, patient customers." },
  kabuk: { name: "Jar of seashells", desc: "A gift from Rüya: tips +₺2, more people looking for poetry." },
  kostas: { name: "Kostas's lantern", desc: "The lantern from the lost library's door: +3 visitors, tips +₺2, patient customers." },
  fok: { name: "Seal figurine", desc: "A gift from Captain Nuri: +2 visitors, families with kids drop by." },
  saksi: { name: "Daisy pot", desc: "A cheerful flowerpot on the pavement." },
  askida: { name: "Pay-it-forward book box", desc: "+2 visitors, tips +₺1." },
  lamba: { name: "Street lamp", desc: "People drop by in the evening too: +3 visitors." },
};

const UPGRADES = {
  paket: { name: "Gift-wrap corner", desc: "Wrap the book in paper and tuck in a note: unlocks a 🎁 word for gift buyers." },
  fener: { name: "Evening lantern", desc: "The shop closes an hour later: evening strollers drop by too (+15% visitors)." },
  cirak: { name: "Apprentice", desc: "Accepts offers above your threshold for you, so you only handle the interesting haggles." },
  cay: { name: "Tea corner", desc: "Waiting customers are more patient (×1.3); now and then someone buys a tea (₺3)." },
  koltuk: { name: "Reading armchair", desc: "Read one more book each morning (3 a day): unlocks their tags." },
  plak: { name: "Record player", desc: "Unlocks music themes: Acoustic, Jazz, Lullaby (⚙️ Settings)." },
};

const SHELF_LEVELS = [
  { name: "Book handcart" },
  { name: "Book cart" },
  { name: "Big book cart" },
  { name: "Book caravan" },
];

const AWNINGS = {
  mercan: { name: "Coral" },
  deniz: { name: "Sea blue" },
  limon: { name: "Lemon" },
  zeytin: { name: "Olive" },
  lavanta: { name: "Lavender" },
};

const PAINTS = {
  nane: { name: "Mint" },
  pembe: { name: "Pink" },
  limon: { name: "Lemon" },
  deniz: { name: "Sea blue" },
  lavanta: { name: "Lavender" },
};

const STAMPS = {
  ilkgun: { name: "First day", desc: "Finish your first day." },
  isabet: { name: "First bullseye", desc: "Make a perfect recommendation." },
  elli: { name: "Fifty books", desc: "Sell 50 books in total." },
  kurt: { name: "Bookworm", desc: "Sell 300 books in total." },
  falci: { name: "Book fortune-teller", desc: "Make 25 perfect recommendations." },
  ege: { name: "Aegean tour", desc: "Open shop in all four towns." },
  kose: { name: "Every corner", desc: "Open shop at all nine spots." },
  festival: { name: "Festival spirit", desc: "Be in town on a festival day." },
  takvim: { name: "Festival calendar", desc: "Join all four different festivals." },
  yagmur: { name: "Bookseller in the rain", desc: "Open shop on a rainy day." },
  dost: { name: "True friend", desc: "Reach 5 hearts with a regular." },
  hediyeler: { name: "Gift box", desc: "Receive gifts from four regulars." },
  susler: { name: "Decor lover", desc: "Own 8 decorations." },
  raflar: { name: "Full shelves", desc: "Upgrade your shelves to the largest size." },
  gokkusagi: { name: "Rainbow van", desc: "Buy all five paints." },
  bagis: { name: "Reading corners", desc: "Donate reading corners to three towns." },
  sahafi: { name: "The town's bookseller", desc: "Reach the highest reputation in a town." },
  akdeniz: { name: "Mediterranean notebook", desc: "Complete the stories of five countries." },
  acilis: { name: "The library opens", desc: "Reopen the library on the hill in Cunda." },
  nadir: { name: "First edition", desc: "Sell a first edition to a collector." },
  nadir5: { name: "Rare book hunter", desc: "Sell five first editions." },
  mektup: { name: "First letter", desc: "Receive a letter about a book you recommended." },
  postaci: { name: "Postman's friend", desc: "Collect ten letters." },
  ilan: { name: "Notice board", desc: "Deliver three requests on time." },
  anlar: { name: "Good old days", desc: "Experience 15 different daytime happenings." },
  butunege: { name: "The whole Aegean", desc: "Learn the way to all nine Aegean towns." },
  kostas12: { name: "Kostas's shelf", desc: "Chapter 2: find Kostas's 12 books." },
  kasa: { name: "Full till", desc: "Save up ₺1000 in the till." },
  yil: { name: "One year", desc: "Complete all four seasons (28 days)." },
  kutuphane: { name: "The lost library", desc: "Complete Kostas Efendi's notebook." },
};

const PAGES = {
  miras: {
    title: "My aunt's letter",
    hint: "Start your journey.",
    text: "My dear niece or nephew, this van is yours now. For forty years I travelled the towns of the Aegean in it. And there is something you should know: when I was young, I learned this trade from an old bookseller called Kostas Efendi. He had a library; he called them \"the books that never saw the sea\". One day the library vanished. People used to say he scattered the pages of his notebook across the towns. Perhaps you will find them. — Your Aunt Nermin",
  },
  dostlar: {
    title: "The old man at the café",
    hint: "Open shop in four neighbourhoods.",
    text: "At the café on the promenade, an old man told you that Kostas had a friend in every neighbourhood: \"They entrust his notebook to the bookseller who gives the right book to the right person,\" he said. He was holding a yellowed page: \"Books are written to be read, not to be hoarded. — K.\"",
  },
  liste: {
    title: "The list inside the book",
    hint: "Make 10 perfect recommendations.",
    text: "A customer pulled a slip of paper from the book you recommended: a list in Kostas's handwriting. \"The Quay: gulls. Plane Tree: leaves. School Hill: steps. Old Bazaar: arches.\" Below it, a single line: \"The key is friendship.\"",
  },
  fener: {
    title: "The lantern at the door",
    hint: "Reach 3 hearts with a regular.",
    text: "One of your regulars shared a secret: their grandmother used to visit Kostas's library. \"A lantern burned at its door,\" she'd said, \"day and night.\" They told you to wait for a festival day: \"That's when everyone's out in the street, and the old stories come out too.\"",
  },
  zarf: {
    title: "The envelope at the festival",
    hint: "Open shop in a neighbourhood on its fête or event day.",
    text: "In the festival crowd, an old woman came up to your van and left an envelope. Inside was a scrap of a map: a headland, a lighthouse, a tiny cross. Before you could ask who it was from, she had vanished into the crowd.",
  },
  iz: {
    title: "The faded sentence",
    hint: "Open shop in the Old Bazaar with «The Old Man and the Sea» on your shelf. If you don't have it, you can order it from the wholesaler.",
    text: "This time the old man from the promenade café was under the arches of the Old Bazaar. When he saw «The Old Man and the Sea» on your shelf, he smiled: \"Kostas made everyone read this one.\" He held the map scrap up to the light; a faded sentence appeared on the back: \"Fill your shelves, then come back.\"",
  },
  gizligoz: {
    title: "The van's secret compartment",
    hint: "Upgrade your shelves to the largest size (50 books).",
    text: "As the shelves grew, a floorboard came loose. Beneath it lay Aunt Nermin's last letter: \"Kostas's library was on Lighthouse Point, beneath the old keeper's house. He used to say only a full bookshop van could open the door; I thought he was joking.\"",
  },
  kutuphane: {
    title: "The lost library",
    hint: "Open shop on Lighthouse Point.",
    text: "That evening, the old stone door beside the keeper's house swung open in the glow of your van's lights. Inside stood dusty but sturdy shelves: hundreds of books, each with a note tucked between its pages. \"Take these books back to the neighbourhoods. — K.\" The library is lost no longer; it lives in your van now.",
  },
};

const VOYAGE = {
  gr: {
    title: "The print shop on Lesbos",
    mech: "Island day",
    unit: "island days",
    how: "In Greek towns, one of the spots is an island reached by boat: lots of tourists, a paid boat ride, and no wholesaler on the island. Stock up on the near shore before you cross.",
    piece: "The type case from Kostas's Print Shop",
    pages: [
      { title: "The typesetter at the harbour café", text: "At a harbour café on Lesbos, an old typesetter remembered Kostas: \"He grew up here, in his father's print shop. They set lead type by hand and printed books that smelled of the sea.\" The print shop closed long ago, but there were said to be houses on the islands that still kept the books he printed." },
      { title: "The faded imprint", text: "On the pier of the island across the water, a woman took a faded book from her grandfather's shelf. Its imprint read \"Printed by: Kostas Print Shop, Mytilene.\" Tucked between the pages was a note: \"A book grows in value once it crosses the sea.\"" },
      { title: "The chest in the chapel", text: "On the third island, the chapel keeper seemed to have been expecting you. In a wooden chest lay the last type case left from Kostas's print shop. \"For his library,\" he said. \"I kept it in case someone came for it one day.\" The type case is in your van now." },
    ],
  },
  it: {
    title: "A trail in Venice",
    mech: "Auction",
    unit: "auctions",
    how: "In Italian towns, you can put a first edition up for auction in the morning; it sells at the evening sale. The price is down to luck, but it usually beats what a collector would pay.",
    piece: "The walnut shelf in Murano",
    pages: [
      { title: "The antique dealer's memory", text: "In Venice, an antique dealer heard Kostas's name and slipped into the back of his shop. \"He used to come here as a young man, chasing old editions without a penny in his pocket,\" he said. \"He always watched the auctions and never bought a thing.\"" },
      { title: "The woman at the back of the hall", text: "As your book changed hands at the auction, an old woman at the back of the hall smiled: \"Kostas brought a book here once too. With the money he bought a shelf for his own library.\" She told you the shelf was sitting in a storeroom on Murano." },
      { title: "The walnut shelf", text: "In a Murano storeroom, among the glassmakers, stood a dusty walnut shelf with a single word carved into its back: \"Kostas\". As the craftsman loaded it into your van, he said, \"A shelf without books is like a gondola without a song.\"" },
    ],
  },
  fr: {
    title: "The chest in Marseille",
    mech: "Bouquiniste box",
    unit: "box sales",
    how: "In French towns, you can rent a green bouquiniste box for a week. Fill it with books from your crates; wherever you are, a few will sell every night.",
    piece: "Kostas's chest of letters",
    pages: [
      { title: "The green boxes", text: "In Marseille, as the bouquinistes opened their green boxes, you spotted Aunt Nermin's photo in one man's hand. \"This woman came every summer,\" he said. \"She was the one who left Kostas's chest with us; it had been stuck at customs.\"" },
      { title: "The letters", text: "As the bouquinistes welcomed you into their circle, they told you more: the chest arrived on a ship forty years ago, and its owner was never found. It held no books, only letters: letters Kostas wrote to booksellers in country after country." },
      { title: "The last letter", text: "After the final sale, the oldest of the bouquinistes carried the chest to your van. The last letter seemed to be written to you: \"Whoever opens this chest, may my library be born again on their shelves.\" The chest is in your van now." },
    ],
  },
  es: {
    title: "The notebook in Barcelona",
    mech: "Rose and book",
    unit: "sales with a rose",
    how: "In Spanish towns, you buy roses in the morning; every book sold with a rose earns a tip, and unsold roses wilt by evening. Once a week, the Day of the Rose and the Book fills the streets.",
    piece: "The library's catalogue notebook",
    pages: [
      { title: "A rose and a book", text: "In Barcelona, the booksellers told you about Sant Jordi: on that day everyone gives a rose and a book to someone they love. \"Kostas adored this day,\" said a florist. \"He left something he'd written with a friend here.\"" },
      { title: "The old publisher", text: "Among the scent of roses, an old publisher recognised you: \"I have Kostas's notebook. He wrote down why every book in his library was there.\" But he would only give it to someone who knew how to sell a book with a rose." },
      { title: "The first page", text: "At last the publisher brought out the notebook. On the first page, in Kostas's handwriting: \"A library isn't a list of books; it's a list of the people you gave them to.\" The library's catalogue notebook is in your van now." },
    ],
  },
  eg: {
    title: "The dream of Alexandria",
    mech: "Manuscript repair",
    unit: "repairs",
    how: "In Egyptian towns, at the paper master's workshop, you can restore a worn or good copy to clean condition (select the book in shelf mode, then \"Repair\"). A clean book sells for more.",
    piece: "The Library Notebook, Volume I",
    pages: [
      { title: "The master on the Corniche", text: "On the Corniche in Alexandria, a paper master told you Kostas came here as a young man: \"He stood where the ancient library burned and wept. He swore that no library would ever be lost again.\"" },
      { title: "The unfinished repair", text: "As you rebound worn pages in the workshop, the master pointed to an old box on the shelf. Inside was a repair Kostas had left unfinished: a book soaked in seawater, its title no longer legible." },
      { title: "Volume I", text: "Together you finished the repair. Faded letters appeared on the cover: \"The Books That Never Saw the Sea — Library Notebook, Volume I.\" The master handed you the book: \"The library is complete now. Take it home.\"" },
    ],
  },
};

const GRAND = {
  title: "The library opens",
  hint: "The pieces from all five countries are in your van: open shop on the Island hilltop in Cunda.",
  text: "On the hill in Cunda, beside the chapel, the library door stands wide open this time. The type case from Lesbos, the walnut shelf from Murano, the chest from Marseille, the catalogue notebook from Barcelona and the restored volume from Alexandria have all found their places. Friends came from every town; some left their nets behind, some brought their students along. Kostas's \"books that never saw the sea\" now see the sea every day: the library is open, and the van is back on the road.",
};

const KOSTAS = [
  { note: "I was thirty when I first read this book, and I was afraid of the sea. Then I wasn't. — K." },
  { note: "Olive trees live a thousand years. So do books, if they're read. — K." },
  { note: "On my first night on the island I read these poems aloud. The wind listened too. — K." },
  { note: "Wizards read books too. In fact, they read the most. — K." },
  { note: "Sometimes going home takes twenty years. Don't rush. — K." },
  { note: "I gave this book to a little boy; now he's a captain. His name is Nuri. — K." },
  { note: "Don't panic. Take your towel and a book with you. — K." },
  { note: "The treasure you seek was where you started looking. Being a bookseller is like that too. — K." },
  { note: "A bay, an island, a book. What else does a person need? — K." },
  { note: "You could see Troy from here, on the far shore. The war ended; the poetry remained. — K." },
  { note: "Nermin borrowed this book from me when she was ten. She never brought it back. Just as well. — K." },
  { note: "Come, whoever you are, come again. May the door of this van always be open too. — K." },
];

const TUT_STEPS = [
  { text: "Good morning! First, buy a crate from the 📦 Wholesaler." },
  { text: "The books are in your stock! 📚 Shelve them: hold a cover and drag it onto a shelf, or tap “Fill the gaps”. A section that matches its genre draws more customers." },
  { text: "Shelves are ready. Now 🔔 Open shop." },
  { text: "A customer brought a book to the counter: accept their offer, meet them halfway or stick to your price. Their patience has limits!" },
  { text: "When a customer with a ❓ bubble arrives, tap them and pick the book that best fits what they say." },
  { text: "The day is done! Read the summary, then ☀️ Next morning." },
  { text: "Tap your location at the top: change your 📍 spot and meet other customers." },
  { text: "Once there's money in the till, open the 🔨 Workshop at the top right: new carts, sales tools and decorations are there." },
  { text: "One last tip: the 📜 Notebook keeps your aunt's letters and the customers you've met. Happy reading!" },
];

export default { TOWNS, SPOTS, COUNTRIES, PAPER, PAPER_TOWN, EVENTS, WEATHER, SEASON, SPECIAL, GOSSIP, DECOR, UPGRADES, SHELF_LEVELS, PAINTS, AWNINGS, SLOTS, STAMPS, PAGES, VOYAGE, GRAND, KOSTAS, TUT_STEPS };
