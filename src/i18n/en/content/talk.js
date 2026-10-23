// English overlay: letters, happenings, road encounters, notice-board visitors, replies, small talk and the request grammar.
// Placeholders stay as in Turkish: {book} {ago} {where} {tag} {genre} {n} {town} {days} {g} {a} {b}.

const LETTERS = {
  g1: { text: "{ago}, over near {where}, you recommended “{book}” to me. I finished it in one night, then started all over again." },
  g2: { text: "I'm the one who stopped by your camper {ago}, remember? “{book}” is still on my bedside table. I couldn't not say thank you." },
  g3: { text: "I passed “{book}” on to a friend, and she passed it on to someone else. The chain started with you, just so you know." },
  g4: { text: "I always thought I didn't much like books. “{book}”, which you gave me {ago}, changed my mind." },
  g5: { text: "{where}... If I hadn't wandered by that day, I'd never have met “{book}”. So glad I did." },
  g6: { text: "Just a quick note: I've finished “{book}”, so you pick the next one too. I'll drop by soon." },

  deniz1: { text: "I read “{book}” on a boat, to the sound of the waves. The edges got a little salty, sorry about that." },
  deniz2: { text: "Thanks to “{book}”, which you recommended {ago}, I spent the whole summer staring at the sea. Should I thank you or complain?" },
  huzun1: { text: "“{book}” made me cry, but the good kind of crying. Turns out I needed that." },
  huzun2: { text: "I was going through a hard time. “{book}” made me feel I wasn't alone." },
  ask1: { text: "I read “{book}” out loud to the person I love. And then... well, I'll tell you the rest another time." },
  ask2: { text: "I'd go as far as saying “{book}” saved a relationship. I'm not exaggerating!" },
  macera1: { text: "When I finished “{book}”, I packed my rucksack. I'm writing this from a mountain hut." },
  macera2: { text: "After “{book}”, my son drew his own map. Now he's digging for treasure in the garden." },
  gizem1: { text: "I knew who the killer was by page thirty of “{book}”! ...I was wrong. It was wonderful." },
  gizem2: { text: "“{book}” cost me three nights' sleep. I'm sending you the bill." },
  komik1: { text: "I burst out laughing reading “{book}” on the bus, and everyone turned to look. Worth it." },
  komik2: { text: "My mum was in hospital, so I read her bits of “{book}”. The nurses came to listen too." },
  aile1: { text: "Thanks to “{book}”, my dad and I had a long talk for the first time in years." },
  aile2: { text: "My sister and I are taking turns reading “{book}”. We leave each other notes in the margins." },
  savas1: { text: "When my grandad read “{book}”, he told me about his own youth. Stories I'd never heard before." },
  savas2: { text: "“{book}” was a heavy one, but I finished it. It reminded me all over again what peace is worth." },
  doga1: { text: "When I finished “{book}”, I planted three saplings in the garden. You can name them, if you like." },
  doga2: { text: "I read “{book}” in the shade of the olive grove. The cicadas kept me company." },
  buyu1: { text: "After “{book}”, my daughter decided to become a witch. For now she's practising flying on the broom." },
  buyu2: { text: "I didn't want to leave the world of “{book}”. I was a little sad when I closed the cover." },
  yolculuk1: { text: "I was reading “{book}” on the train and missed my stop. Discovered a whole new town that way." },
  yolculuk2: { text: "I'm writing this from a faraway harbour. The only thing in my bag is “{book}”." },
  kisa1: { text: "I finished “{book}” in the time it takes a pot of tea to brew, but it's been on my mind for a week." },
  kisa2: { text: "I read “{book}” over my lunch break. I went back to work a different person." },
  umut1: { text: "“{book}” found its way to me on a hard day. The next morning I got up earlier." },
  umut2: { text: "I took “{book}” to my neighbour in hospital. She says the first thing she'll do when she's discharged is ask about you." },
  yalniz1: { text: "“{book}” kept me company on my lonely evenings. I'm not so lonely any more." },
  yalniz2: { text: "The hero of “{book}” was me, exactly. Strange, but comforting." },
  cocukluk1: { text: "“{book}” took me back to the street I grew up on. I called my mum and we talked for ages." },
  cocukluk2: { text: "I'm reading “{book}” to my grandchild, a chapter every night. There's always haggling for \"just one more\"." },
  korku1: { text: "Because of “{book}”, I slept with the lights on for a week. I'm waiting for the next one!" },
  korku2: { text: "I read “{book}” aloud at camp one night. My friends still aren't speaking to me." },
  sehir1: { text: "Since reading “{book}”, I see the streets of my own city with different eyes." },
  sehir2: { text: "I went to the city in the book with “{book}” in my hand. I recognised every corner." },
  hayvan1: { text: "After “{book}”, we adopted a dog from the shelter. We named him after the book." },
  hayvan2: { text: "My cat sleeps on top of “{book}”. I think she liked it too." },
  felsefe1: { text: "“{book}” scrambled my head so thoroughly I still haven't put it back together. Thanks (I think)." },
  felsefe2: { text: "We argued about “{book}” in the café for two hours. Nobody won, but a lot of tea was drunk." },
};

const HAPPENINGS = {
  kedi_raf: { title: "The cat knocked over a shelf",
    text: "Chasing a butterfly, the camper's cat dived into the bottom shelf. Books spilled all over the pavement.",
    choices: [
      { label: "Pick them all up", result: "You wiped the books and put them back. The cat couldn't have cared less." },
      { label: "Pet the cat first", result: "One cover ended up in the mud, but the children who came to pet the cat crowded round the shop." },
    ] },
  marti: { title: "Gull thief!",
    text: "A gull snatched a book off the table and flew off towards the pier.",
    choices: [
      { label: "Chase it", result: "The chase had the whole seafront laughing.", failResult: "The gull won. The book is at the bottom of the sea now; maybe a fish will read it." },
      { label: "Let it go", result: "The gull dropped the book on a rooftop. Maybe someone will find it." },
    ] },
  imza: { title: "An author dropped by",
    text: "A shy woman in glasses smiles at her own book on your shelf. Turns out she wrote it!",
    choices: [
      { label: "Hold a signing tomorrow", result: "She said yes! Word is already spreading through town; tomorrow will be busy." },
      { label: "Ask her to sign a copy", result: "A signed copy: just the thing collectors keep an eye out for." },
    ] },
  ruzgar_sayfa: { title: "Pages in the wind",
    text: "A strong gust blew the pages of an open book out into the street.",
    choices: [
      { label: "Run and gather them", result: "People in the street rushed to help. Every page was saved, and two of them bought books too." },
      { label: "Watch them fly", result: "The pages flew out to sea like gulls. Lovely, but the book's gone." },
    ] },
  kayip_cocuk: { title: "A lost child",
    text: "A little boy is crying in front of the camper: he's lost his mum in the crowd.",
    choices: [
      { label: "Find his mum", result: "His mum came running, hugged him, and bought two books as a thank-you." },
      { label: "Read him a story", result: "His mum turned up before the story was over, and a little audience had gathered around." },
    ] },
  eski_mektup: { title: "A letter between the pages",
    text: "Leafing through a book, a yellowed envelope fell out: \"Dear Nesrin, remember me when you read this book. 1974.\"",
    choices: [
      { label: "Find its owner", result: "A friend of yours in town knew Mrs Nesrin. She took her the news, and Nesrin's eyes filled with tears." },
      { label: "Leave it in the book", result: "You slipped the letter back between the pages. Let the next reader find it too." },
    ] },
  muzisyen: { title: "Street musician",
    text: "A young man with a violin asks if he can play beside the camper.",
    choices: [
      { label: "Go ahead, play", result: "Everyone who heard the tune stopped. Even the books seemed to sway along." },
      { label: "Not today", result: "He thanked you and went off to play by the fountain up the road." },
    ] },
  yagmur_siginma: { title: "Sheltering under the awning",
    text: "The rain came pouring down, and a few people ducked under the camper's awning.",
    choices: [
      { label: "Offer them tea", result: "The tea ran out, the rain stopped, and most of them left with a book in hand." },
      { label: "Let them browse", result: "As long as the rain kept up, the shelves kept getting browsed." },
    ] },
  bagis: { title: "A request from the school",
    text: "The village schoolteacher asks if you could donate a few books to the class library.",
    choices: [
      { label: "Donate three books", result: "Word got round town. Tomorrow people will come to see the \"kind-hearted bookseller\"." },
      { label: "Politely decline", result: "She understood, and said she'd ask the town hall too." },
    ] },
  eskici: { title: "The junk dealer's here",
    text: "A junk dealer stopped with a crate of old books on his handcart: \"Twenty lira the lot, no haggling.\"",
    choices: [
      { label: "Buy it (₺20)", result: "A first edition turned up at the bottom of the crate!", failResult: "Four books joined the shelves; a bit dusty, but sound." },
      { label: "No need", result: "The junk dealer shrugged and went on his way." },
    ] },
  film: { title: "Film crew",
    text: "A TV crew wants to rent your camper for a \"romantic bookshop scene\".",
    choices: [
      { label: "Accept (+₺30)", result: "Filming's done; tomorrow curious people will come to see the camper." },
      { label: "Keep things quiet", result: "They went off to find another corner." },
    ] },
  kopek: { title: "A dog comes to visit",
    text: "A fluffy dog with a collar curled up in the camper's shade.",
    choices: [
      { label: "Give it water", result: "The dog drank its water and lay down next to the cat. Both look very pleased." },
      { label: "Find its owner", result: "The owner thanked you and bought a crime novel." },
    ] },
  sair: { title: "The old poet",
    text: "A man with a walking stick asks if he may read a poem he wrote in his youth.",
    choices: [
      { label: "Listen", result: "When the poem was over, he took a signed first edition from his bag and gave it to you.", failResult: "When he finished, the people who'd applauded stayed on by the camper." },
      { label: "Ask about his book", result: "He gave you a copy of his own book; you put it on the shelf." },
    ] },
  dondurma: { title: "The ice-cream neighbour", when: { season: "Yaz" }, // logic key, kept Turkish
    text: "The ice-cream seller wants to park his cart next to the camper: \"People who read want ice cream too.\"",
    choices: [
      { label: "Sure, come on over", result: "The ice-cream queue stretched all the way to the books." },
      { label: "There's no room", result: "He parked a little further down." },
    ] },
  iade: { title: "A customer wants a refund",
    text: "Someone who bought a book yesterday is back: \"This book just isn't for me.\"",
    choices: [
      { label: "Give the money back", result: "The book went back on the shelf; the customer left with a light heart." },
      { label: "Suggest another book", result: "Your new pick hit the spot, and they left a tip on top.", failResult: "No luck; you gave the money back." },
    ] },
  rehber: { title: "Tour group", when: { season: "Yaz" }, // logic key, kept Turkish
    text: "A guide with a little flag stopped in front of the camper, twenty people trailing behind.",
    choices: [
      { label: "Give the group a discount", result: "The group spread out among the shelves; the till didn't stop ringing." },
      { label: "Regular price", result: "A few bought something; the rest took photos." },
    ] },
  gelin: { title: "Bride and groom", when: { season: "İlkbahar" }, // logic key, kept Turkish
    text: "A newly married couple would like their wedding photos taken in front of the camper.",
    choices: [
      { label: "Of course, go ahead", result: "The photos got shared; tomorrow people will come to see the camper." },
      { label: "Gift them a poetry book", result: "The bride held the book to her heart. The whole town will be talking about this." },
    ] },
  gazeteci: { title: "A reporter from the Aegean Post",
    text: "A reporter from the Aegean Post wants to interview \"the travelling bookseller of the coastal towns\".",
    choices: [
      { label: "Do the interview", result: "Your photo will be in tomorrow's paper!" },
      { label: "Too shy", result: "The reporter took a photo anyway, from a distance." },
    ] },
  damgali: { title: "A library stamp",
    text: "One of the books on your shelf has the town library's stamp inside. Who knows how it got mixed in.",
    choices: [
      { label: "Take it to the library", result: "The librarian was delighted and treated you to a tea." },
      { label: "No one will notice", result: "The book sold. You don't feel quite right about it." },
    ] },
  resim: { title: "A child's drawing",
    text: "A child has drawn a picture of the camper, cat and all, and gives it to you.",
    choices: [
      { label: "Hang it on the sign", result: "People who saw the picture smiled and wandered over." },
      { label: "Say thanks and keep it", result: "The drawing went between the pages of your notebook. Another memory." },
    ] },
  corba: { title: "Hot soup", when: { season: "Kış" }, // logic key, kept Turkish
    text: "The auntie next door brought you a bowl of hot soup: \"Standing outside in this cold? Here, drink up.\"",
    choices: [
      { label: "Enjoy it", result: "It warmed you right through. She asked for a romance novel, and of course you gave it to her." },
    ] },
  balikci_kova: { title: "A bucket of fish",
    text: "A fisherman brought a bucket of fresh fish to trade for a book.",
    choices: [
      { label: "Trade", result: "You sold the fish to the restaurant on the corner; the fisherman hugged his book." },
      { label: "Give him the book", result: "The fisherman was a little embarrassed. \"I owe you one,\" he said." },
    ] },
  paket: { title: "The wrong parcel",
    text: "The postman dropped off a parcel in a hurry: it says \"To the bookseller\", but the address is in another town.",
    choices: [
      { label: "Get it to its owner", result: "The owner thanked you warmly over the phone and posted you a reward." },
      { label: "Take a peek inside", result: "Inside was a single book and a note: \"Finders keepers.\"" },
    ] },
  tente: { title: "The awning's about to fly!",
    text: "The wind is about to rip the awning right off.",
    choices: [
      { label: "Tie it down tight", result: "Done. The awning is flapping, but it's staying put." },
      { label: "Bring the books inside", result: "The books are safe, but for a while nobody could browse the shelves." },
    ] },
  kostum: { title: "Children in costume",
    text: "An army of children in festival costumes descended on the camper.",
    choices: [
      { label: "Hand out sweets", result: "The sweets ran out, and the parents turned to the books." },
      { label: "Set up a story corner", result: "The costumed audience sat down in a circle." },
    ] },
  cuzdan: { title: "A wallet on the ground",
    text: "Someone has dropped their wallet in front of the camper.",
    choices: [
      { label: "Wait for the owner", result: "The owner came rushing back and bought a collector's book as a thank-you." },
      { label: "Take it to the police station", result: "The officer at the station turned out to be a bookworm; he'll drop by tomorrow." },
    ] },
  yavrular: { title: "Surprise kittens",
    text: "Tiny mews are coming from under the camper: three kittens beside the cat!",
    choices: [
      { label: "Tell the town", result: "Children came in turns to cuddle the kittens. Every one of them found a home." },
    ] },
  rakip: { title: "A rival bookseller",
    text: "Another travelling bookseller has set up on the opposite corner. An old man, waving at you.",
    choices: [
      { label: "Swap some books", result: "He knew your Aunt Nermin! When the swapping was done, he left you a first edition." },
      { label: "Take him on", result: "The price war had the town in stitches; in the evening you had tea together." },
    ] },
  kuyruklu: { title: "A shooting star",
    text: "As the sun went down, a shooting star crossed the sky. Everyone around shouted, \"Make a wish!\"",
    choices: [
      { label: "Make a wish", result: "You didn't tell anyone what you wished for. We'll see tomorrow." },
    ] },
  bisiklet: { title: "Cyclists who read",
    text: "A group of cyclists climbing the hill stopped in front of the camper to catch their breath.",
    choices: [
      { label: "Offer them water", result: "Bottles refilled, and a slim book slipped into every backpack." },
      { label: "Put the short books out front", result: "The light reads went fast." },
    ] },
  ogretmen_doktor: { title: "School trip",
    text: "Teacher Melis is out on a trip with her class, and Doctor Selim happens by. The children are asking him detective riddles.",
    choices: [
      { label: "Introduce them", result: "Doctor Selim promised to send the class a riddle book every month. Teacher Melis's eyes lit up." },
    ] },
  kaptan_sorfcu: { title: "Storm warning",
    text: "Captain Nuri heard on the radio that a storm is coming. Zeynep the surfer's students are still out at sea!",
    choices: [
      { label: "Raise the alarm", result: "The captain took his boat out and Zeynep rounded up her students. Everyone's safe on shore. The town will be talking about it tomorrow." },
    ] },
  ortak_sergi: { title: "A joint exhibition",
    text: "Rüya the painter and İnci the photographer both applied to the same gallery. The gallery is offering them a single room.",
    choices: [
      { label: "Suggest a joint show", result: "\"Paint and Photo: The Light of the Aegean.\" They put your camper on the poster, and paid you a thank-you fee too." },
    ] },
  masal_yarisi: { title: "Story contest",
    text: "Granny Storyteller and little Ela are arguing about whose story is better. They've picked you as the judge!",
    choices: [
      { label: "Call it a draw", result: "They both burst out laughing, and decided to combine their stories into one." },
      { label: "Let Ela win", result: "Granny smiled: \"Someone let me win with my first story, too.\" Ela is over the moon." },
    ] },
  cay_ocagi: { title: "An invitation from the tea house",
    text: "The owner of the tea house across the way waves you over: \"Come have a tea, the shop won't run off.\"",
    choices: [
      { label: "Have a tea", result: "At the tea house you caught up on all the town gossip." },
      { label: "Stay by the shelves", result: "Just then a customer came by; good thing you stayed." },
    ] },
};

const ROAD = {
  pazar: { title: "Village market",
    text: "There's a village market by the roadside. Next to the tomatoes, an old lady is selling a crate of old books.",
    choices: [
      { label: "Buy the crate (₺8)", result: "Four books came out of the crate. A bit worn, but readable; she slipped in a tomato as well." },
      { label: "Say hello and drive on", result: "She waved after you: \"Stop by again on the way back!\"" },
    ] },
  otostop: { title: "Hitchhiker",
    text: "A student with a backpack is waving by the roadside. There's a book in her hand.",
    choices: [
      { label: "Give her a lift", result: "You talked books the whole way. As she got out, she took a spotless book from her bag and left it for you." },
      { label: "Drive past", result: "She grew smaller in the rear-view mirror. Maybe someone else will stop." },
    ] },
  lastik: { title: "Flat tyre",
    text: "After a bump in the road, the camper lurched to the left. The back tyre has burst.",
    choices: [
      { label: "Call the mechanic (₺7)", result: "The village mechanic arrived within half an hour, and bought you a tea too." },
      { label: "Change it yourself", result: "It took all morning, but you managed. The shop will open a little late today." },
    ] },
  kamp: { title: "Campfire",
    text: "Travellers have set up camp along the coast road. They're swapping books around the fire.",
    choices: [
      { label: "Swap two books", result: "Two books left your shelf and two came out of their backpacks. One of them looks rather old." },
      { label: "Listen to a song and move on", result: "Someone played the guitar. You drove on feeling lighter." },
    ] },
  bag: { title: "By the vineyard",
    text: "The vineyard owner's grandchild is crying by the road: she's lost her storybook.",
    choices: [
      { label: "Read her a story", result: "The little girl laughed, and her grandad gave you a basket of grapes and ₺5. The news reached town before you did." },
      { label: "Keep going", result: "It stayed with you a little." },
    ] },
  sahaf: { title: "A bookshop closing down",
    text: "In a village by the road, an old bookseller is closing his shop. \"My last books,\" he says. \"Let them go to good hands.\"",
    choices: [
      { label: "Buy a first edition (₺22)", result: "He wrapped the book in paper and handed it over: \"I got this one from Kostas.\" His hand trembled." },
      { label: "Just have a chat", result: "He told you forty years' worth of stories. Your name will be spoken kindly in town." },
    ] },
  manzara: { title: "Sea from the hilltop",
    text: "The road rounded a hill and suddenly the whole bay lay spread out before you.",
    choices: [
      { label: "Stop and take it in", result: "You sat for half an hour. It cleared your head; the shop will open a little late, but it was worth it." },
      { label: "Snap a photo, drive on", result: "The photo doesn't capture any of it, but never mind." },
    ] },
  koyun: { title: "A flock of sheep",
    text: "A flock of sheep has blocked the road. The shepherd is in no hurry at all.",
    choices: [
      { label: "Wait and read", result: "You finished a chapter. As he passed, the shepherd said, \"Happy reading.\"" },
      { label: "Honk the horn", result: "The sheep scattered, and one of them broke the camper's mirror. ₺2 in repairs." },
    ] },
};

const VISITORS = {
  gezgin: { name: "Leyla the traveller",
    text: "Leyla the traveller is on her way to {town}. If she can find “{book}” there within {days} days, she'll leave you a keepsake." },
  profesor: { name: "Professor Ahmet",
    text: "Retired Professor Ahmet is starting a reading group: he needs {n} books on {tag} within {days} days. He'll come wherever the camper is." },
  okul: { name: "Village school",
    text: "The village school in {town} would like {n} {genre} within {days} days. The teacher will be waiting for the camper on delivery day." },
  kaptan: { name: "Old captain",
    text: "An old captain wants to read “{book}” before his last voyage. He'll be at {town} harbour within {days} days." },
  tiyatro: { name: "Travelling theatre",
    text: "The travelling theatre is looking for inspiration for its new play: {n} {tag} books within {days} days." },
  nisanli: { name: "Engaged couple",
    text: "A couple want books for their wedding tables: {n} books about {tag}, around {town}, within {days} days." },
  kutuphaneci: { name: "Sevim the librarian",
    text: "The town library is opening a new shelf: they're looking for {n} books on {genre} within {days} days." },
  kucukyazar: { name: "Little author Ada",
    text: "Ten-year-old Ada is writing her first novel and wants “{book}” for inspiration. In {town}, within {days} days." },
  gozluk: { name: "A reader with tired eyes",
    text: "A reader whose eyes tire quickly is looking for {n} {tag} books within {days} days. They'll come wherever the camper is." },
  fotografci: { name: "Deniz the photographer",
    text: "Deniz the photographer wants {n} books about {tag} for an exhibition. In {town}, within {days} days." },
};

const REPLIES = {
  perfect: [
    "Exactly what I was looking for! How did you know?",
    "“{book}”… Yes, yes, this is the one!",
    "I'll finish this tonight, promise.",
    "You really know your stuff. Thank you!",
    "The moment I saw the cover, my heart warmed.",
    "I've been meaning to read this for years, it just never crossed my mind.",
    "Wonderful choice. I'll be asking you again next time.",
    "I'll come back and tell you all about it!",
  ],
  tag: {
    deniz: ["I'll read this on the boat; the waves can turn the pages.", "It's like the smell of the sea is spilling off the pages."],
    huzun: ["Better get my hanky ready, then.", "A little sadness does you good sometimes, doesn't it?"],
    ask: ["My heart's already racing!", "I'm going to read this with the person I love."],
    macera: ["I want to hit the road right now!", "A sleepless night awaits me."],
    gizem: ["I'll catch the killer, you'll see.", "Ooh, I'll read this one with the lights off."],
    komik: ["If I laugh out loud on the bus, it's your fault!", "Just what I needed: a good laugh."],
    aile: ["My mum and I will read it together.", "This reminds me of my grandad."],
    savas: ["It brought back my grandad's stories.", "A heavy book, but an important one, I know."],
    doga: ["I'll read this in the shade of the olive grove.", "I can almost hear leaves rustling as I turn the pages."],
    buyu: ["No wand, but I've got a book!", "One more spell, please!"],
    yolculuk: ["Perfect for the train. Spot on.", "I've already made room in my suitcase."],
    kisa: ["Done before the tea's brewed. Lovely.", "Short and sweet, just my style."],
    umut: ["I feel brighter already.", "Exactly what I needed today."],
    yalniz: ["A good friend for my quiet evenings.", "I have a feeling I'll understand this hero."],
    cocukluk: ["I feel like I'm going back to my childhood.", "I'll read this to my grandchild too."],
    korku: ["I think I'll be sleeping with the lights on.", "I've got goosebumps already!"],
    sehir: ["I can hear the city's bustle already.", "I'll wander this book street by street."],
    hayvan: ["My cat will listen too, I'm sure.", "I adore books with animals in them!"],
    felsefe: ["It'll muddle my head, but in a good way.", "We'll argue about this one for hours at the café."],
  },
  voice: {
    cocuk: ["Yay! Mum and I are going to read it right away!", "I'm going to show this to my friends too!"],
    turist: ["Teşekkürler! Thank you, very nice!", "Perfect! Mükemmel!"],
    resmi: ["A truly fitting recommendation, thank you.", "I must say, I admire your taste."],
  },
  good: [
    "Not bad… I'll give it a try.",
    "Not quite what I had in mind, but I'm curious.",
    "Hmm, could be. I'll take it.",
    "A bit different, but maybe that's a good thing.",
    "All right, I'll trust you this time.",
  ],
  miss: [
    "Hmm, this isn't really me.",
    "I don't think this is what I was after.",
    "I think we got our wires crossed.",
    "Not this time; maybe another day.",
    "It's a lovely book, just not for today.",
  ],
  none: [
    "Never mind, maybe next time.",
    "I see. I'll stop by another time.",
    "I'll be back when the shelves are full!",
    "No problem, thanks anyway.",
  ],
};

const TALK = {
  genre: {
    samimi: [
      "Honestly, I mostly read {g}, just so you know.",
      "If you ask me, you can never go wrong with {g}.",
      "I finished some lovely {g} just last month. Adored it.",
      "If you've got {g} on the shelf, I'd start there.",
    ],
    resmi: [
      "My preference generally leans towards {g}.",
      "I confess most of my library is {g}.",
      "Lately I've come to enjoy {g} more and more.",
    ],
    genc: [
      "Honestly, I'm kind of obsessed with {g}.",
      "Something gripping from the {g} shelf would be amazing.",
      "My friends keep recommending {g}, so now I'm curious.",
    ],
    cocuk: [
      "I like {g} the most!",
      "Mum said I could get {g}!",
      "It doesn't need pictures, as long as it's {g}!",
    ],
    turist: [
      "I like… {g}? Evet, {g}!",
      "In my country I read {g}… here also, evet!",
    ],
  },
  tag: [
    "Oh, and a little {tag} wouldn't hurt…",
    "And {tag}, if you've got it. That'd be perfect.",
    "Bonus points for {tag}, honestly.",
  ],
  tea: [
    "Tea? How lovely, thank you!",
    "Ooh, nice and strong? Just how I like it.",
    "Tea and a book, what more could you want?",
    "Bless your hands, it smells wonderful.",
  ],
};

const GREET = {
  resmi: ["Good day.", "Hello, hope business is good.", "Good morning.", "I hope I'm not interrupting."],
  samimi: ["Hello there!", "Hi!", "How's business?", "Hello, dear."],
  genc: ["Hey!", "Hi!", "Hey, hi.", "Hiya!"],
  cocuk: ["Hellooo!", "Excuse me?", "Psst, hello!"],
  turist: ["Merhaba! Hello, pardon!", "Merhaba! My Turkish… çok az!", "Hi! Merhaba!"],
};

const CLOSE = {
  resmi: ["Thank you kindly.", "If it's no trouble.", "I'll trust your taste."],
  samimi: ["You know best!", "I trust you.", "Go on, surprise me."],
  genc: ["What do you reckon?", "If you find something, that'd be awesome.", "Surprise me."],
  cocuk: ["Pleeease!", "Mum gave me money!", "Come on, come on!"],
  turist: ["Teşekkürler… thank you!", "Very nice town, çok güzel!", "Please! Lütfen!"],
};

const CONTEXT = {
  arch: {
    ogrenci: ["Exams are over, I can finally read something of my own.", "I need something to read in the dorm.", "My teacher set us homework, but I want to read something else.", "We swap books with friends in the canteen.", "I need something to read on the bus.", "My grant just came through, so I'm treating myself to a book.", "I'm bored of my phone. I miss real paper pages.", "My literature teacher told us to visit second-hand bookshops."],
    emekli: ["I've retired, so I've got plenty of time.", "I spent forty years recommending books to students; now it's my turn.", "I'm putting together a bookcase for my grandchildren.", "I've had my morning walk, now it's reading time.", "I've put a chair in the shade in the garden.", "My eyes aren't what they used to be, but I won't give up.", "My wife and I read aloud to each other in the evenings.", "I'm rereading the books I loved when I was young."],
    balikci: ["Nets are in, now I need something for the evening.", "I read on the boat while I wait for the waves.", "No fish today, so a book will have to do.", "The south wind's up, the boat's stuck at the mooring.", "I listen to the radio while I mend nets; tonight, a book instead.", "Everyone at the coffee house talks about the same thing. I'm sick of it.", "I'm up at four, so I read early in the evening.", "I'm looking for something my son might read too."],
    turist: ["I'm on holiday; I'll read at the hotel.", "It's my first time here.", "One more book will fit in my suitcase.", "I've finished my guidebook.", "I'll read under a parasol on the beach.", "A friend couldn't stop praising this town.", "I'd like to take a book home as a souvenir.", "I've got a little time before dinner."],
    anne: ["I'm looking for something for my daughter.", "My son's birthday is coming up.", "The kids want a bedtime story.", "The baby's asleep, I've got five minutes.", "The school sent home a reading list.", "This time I'll get something for myself too.", "I'd like the kids off their screens for a bit.", "We read together before bed."],
    cocuk: ["My mum said I could!", "I saved up my pocket money.", "There's a reading contest at school!", "I finished my homework!", "My big sister read it, now I want to!", "My library card is full!", "I'm bored of drawing.", "I got books for my birthday, and I want one more!"],
    sevgili: ["I'm getting a present for my sweetheart.", "It's our anniversary tomorrow.", "I want to give someone a book, for the first time.", "We're going to sit on a bench and read together.", "I'm going to tuck a note between the pages.", "We met in a bookshop.", "They're in a faraway town; I'm going to post them a book.", "Honestly, my heart's a little broken."],
    yazar: ["I'm writing a novel and I need inspiration.", "My notebook stayed empty this week.", "I want to hear other voices while I write.", "My table at the café is waiting for me.", "I've got a character, but their voice is missing.", "My editor says I should read more.", "I write at night and read by day.", "Looking at other people's sentences does me good."],
    koleksiyoncu: ["I'm looking for something for my library.", "I'm hunting for old editions.", "Nothing on the shelf caught my eye, but I thought I'd ask.", "This is my fortieth year at it.", "I can tell an edition by the smell of the book.", "I came back from the auction empty-handed.", "There's a gap on my shelf, and I need something to fill it.", "I'm also looking on behalf of an old friend."],
    teyze: ["I read in the evenings with my tea.", "I've got my glasses on, I'm ready.", "We swap books with the neighbours.", "The grandchildren are coming, so I thought we'd read together.", "The neighbour's girl gave me a book, and now I can't put it down.", "I'm back from the market, there's room in my bag.", "My radio serial just ended, so a book will take its place.", "I used to read a lot when I was young; I'm starting again."],
    sorfcu: ["I'll read until the wind picks up.", "I never go to the beach without a book.", "The waves are calm today.", "Towel's on the sand; all that's missing is a book.", "When the wind turns, I'll get in the water.", "My camper's just like yours; I live on the road.", "We read around the campfire.", "No waves in the late afternoon, so it's reading time."],
  },
  weather: {
    yagmurlu: ["It's started raining; I'll grab a book before heading home.", "I'm staying in in this rain, so I need something to read."],
    ruzgarli: ["I need something to read until the wind dies down.", "No beach in this wind."],
    bulutlu: ["It's overcast. Proper reading weather."],
  },
  season: {
    "İlkbahar": ["Spring is here, and I'm all aflutter."],
    "Yaz": ["I'm after something to read in the shade in this heat.", "I need a book for the summer holidays."],
    "Sonbahar": ["Something to read while the leaves fall."],
    "Kış": ["I need a book for the long winter evenings.", "I'll read by the stove."],
  },
  scene: {
    sahil: ["There's nothing like reading by the sea."],
    carsi: ["I spotted your camper while wandering the market."],
    tepe: ["I climbed all the way up here; I'm not going back empty-handed."],
  },
};

const REQ_TWO = {
  any: [
    "I'm looking for something {a} and {b}.", "Could you recommend a book {a} and {b}?", "Do you have a book {a}, but also something {b}?",
    "I'd like something {a} and {b} at the same time.", "I want a book {a}, something {b} as well.", "I've got something {a} and {b} in mind.",
  ],
  cocuk: ["Do you have a book {a} and {b}? Pleeease!"],
  turist: ["Merhaba… a book {a} and {b}? You have, evet?"],
  resmi: ["I'm looking for a work {a} and {b}, if you would."],
};

const REQ_ONE = {
  any: [
    "Do you have a book {a}?", "Could you find me a book {a}?", "I'd like something {a}.",
    "Just something {a}, nothing else matters.", "I'm in the mood for something {a}.",
  ],
  cocuk: ["I want a book {a}!"],
  turist: ["Merhaba! A book {a}… you have? Var mı?"],
  resmi: ["Could you recommend a work {a}?"],
};

const RARE_REQ = [
  "Do you have a first edition of a book {a}?", "I'm after something rare: one {a}, in an old edition.",
  "A book {a}… but a first edition, please. Price is no object.",
];

export default { LETTERS, HAPPENINGS, ROAD, VISITORS, REPLIES, TALK, GREET, CLOSE, CONTEXT, REQ_ONE, REQ_TWO, RARE_REQ };
