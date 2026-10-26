# Görsel promptları (GPT ile üretilecek)

Bu belgedeki görseller GPT'nin görsel üretimiyle yapılacak; kod onları hazır yuvalara takar. Promptlar İngilizce, çünkü görsel modelleri İngilizce yönergeyle daha tutarlı sonuç verir. Kodla çizilmiş bugünkü sahneler ve harita, görseller gelene kadar yerinde kalır.

## Nasıl kullanılır
- **Stil:** Her prompta referans görseli ekle (gönderdiğin boyalı karavan resmi). Bütün görseller aynı elden çıkmış gibi dursun.
- **Boyut:** 1536×1024 yatay iste. Oyun sahneleri ortadan 16:9'a (1536×864) kırpar. Bu yüzden önemli her şey üstten ve alttan %8 içeride olmalı.
- **Kaydet:**
  - Mahalle sahneleri `public/art/sahne/<ad>.png` olarak. Adlar her başlığın yanında yazılı.
  - Koy haritası `public/art/harita.png` olarak.
- **Oyuna kendiliğinden girer:** Yuvalar hazır (`src/render/plates.js`). Dosya klasördeyse oyun onu kullanır, yoksa kodla çizilmiş hâl kalır. Geliştirme sunucusu açıksa dosyayı ekleyince sayfa kendiliğinden yenilenir.
  - Sahnede görsel; uzak denizin, evlerin, mekân çiziminin ve zeminin yerine geçer. Gök, güneş, ay, bulutlar, martılar, araba, masa, süsler ve müşteriler kodda kalır.
  - Haritada görsel; denizin, kırın, yolların ve mahalle yapılarının yerine geçer. Sis, ad etiketleri, güven çubukları, yürüyenler ve karavan kodda kalır.
  - Görsel 16:9'dan farklıysa ortadan kırpılır. Dikey telefonda zeminin alt şeridi aynalanarak aşağı uzatılır.
- **Sonra bana söyle:** Görsel gelince yerleşimi kontrol ederim. Gerekirse haritada mahalle noktalarını ve yürüyenlerin yollarını görsele göre kaydırırım.
- **Saydam gökyüzü:** Sahnelerde gökyüzü saydam olursa oyunun kendi göğü (sabah pembe, öğle, akşam mor, ay, bulutlar) görünür. GPT saydam veremezse düz açık bir gökyüzü de olur; o zaman günün saati yalnız renk tonuyla değişir.

## Ortak stil cümlesi (her promptun başına ekle)

```
Cozy hand-painted miniature illustration in the exact style of the attached reference image: soft gouache and watercolor texture, warm golden late-afternoon Aegean light, gentle soft shadows, rounded friendly shapes, rich but calm colors (mint, coral, cream, terracotta, olive green, sea teal). A small Turkish Aegean seaside town. No text, no letters, no signs with writing, no logos, no UI, no people, no animals in the foreground.
```

## Mahalle sahneleri: ortak yerleşim (her sahne promptunun sonuna ekle)

Oyunda karavan sahnenin ortasında, alt yarıda durur; müşteriler iki yanında yürür. Görselin şuna uyması gerek:

```
Composition for a side-scrolling game background, eye level slightly above the ground, straight-on 3/4 street view like the reference.
- Top 35% of the image: sky only. Make the sky fully TRANSPARENT (PNG with alpha) above the skyline; if transparency is not possible, a plain soft cream-peach sky with no sun and no clouds.
- Between 35% and 62% of the height: the backdrop described below (buildings, sea, trees), all sitting on a clear ground line at about 62% of the height.
- From 62% down to the bottom: the ground surface described below, seen in gentle perspective.
- Keep the ground in the middle of the image (from 30% to 72% of the width) completely EMPTY: no objects, no shadows of objects, nothing standing there. A food cart will be placed there by the game.
- The bottom 15% must be plain ground texture only, seamless enough to be mirrored downwards.
- Small props are allowed only at the far left and far right edges, standing at the back near the ground line.
```

### 1. İskele Boyu — Kordon · `kordon.png`
Referanstaki taş kordon ve korkuluk burada.

```
Backdrop: a waterfront promenade. Along the ground line runs a long white limestone balustrade with round balusters and a flat top rail, interrupted at the far left by a short wooden pier going out into the water. Behind the balustrade, a calm turquoise bay with two small wooden fishing boats with coral and blue stripes. Across the bay, on the far shore, a soft hillside of whitewashed houses with terracotta roofs, pink bougainvillea and a few cypress trees, slightly hazy with distance. Two old cast-iron lamp posts with glass lanterns stand on the promenade at the far left and far right.
Ground: large warm cream limestone paving slabs, slightly worn, with thin grout lines.
```

### 2. Çınaraltı Parkı · `park.png`

```
Backdrop: a shady town park. On the far left back, the trunk and huge spreading canopy of an ancient plane tree whose leaves fill the upper left of the backdrop. At the back right, a round old stone pond with a small fountain and water lilies. A low trimmed hedge with flower beds (red geraniums, yellow marigolds) runs along the ground line; two green wooden park benches against it at the far left and far right; an old park lamp. Beyond the hedge, glimpses of cream and pink town houses between trees.
Ground: packed light-brown gravel path with a few fallen leaves, edged by a thin strip of grass at the very back.
```

### 3. Okul Yokuşu · `yokus.png`

```
Backdrop: a steep old school street on a hillside. On the left, a wide stone staircase climbs up and away towards an old two-storey stone school building with arched windows, a small clock and a little red flag on its roof. Along the back, a stone wall covered with colorful posters (shapes only, no readable text) and a metal railing with three bicycles leaning on it at the far right. Terraced houses with terracotta roofs step up the hill behind.
Ground: rounded grey-beige cobblestones, slightly sloping.
```

### 4. Eski Çarşı · `carsi.png`

```
Backdrop: an old arcaded market square. Along the back, a long stone bazaar building (bedesten) with a row of round arches and three low lead domes, wooden doors inside the arches. In front of the arches at the far left and far right, two market stalls with striped awnings (coral/cream and blue/cream) and crates of fruit and spices. Strings of small colorful triangular bunting and hanging copper lanterns cross above. A few houses with wooden balconies rise behind the domes.
Ground: worn old cobblestones in warm grey and ochre.
```

### 5. Boyacılar Sokağı · `boyaci.png`

```
Backdrop: a narrow artists' lane. Along the back, a row of tall narrow two-storey houses, each painted a different pastel color (pink, sky blue, butter yellow, sage green, lilac), with painted wooden shutters and ground-floor shop shutters (kepenk) decorated with simple painted flowers and stripes. Flower pots on windowsills, a sleeping cat on one high windowsill. At the far right, a wooden easel with a canvas showing a sea painting and a few paint pots on a stool.
Ground: cobblestones with a few colorful paint splashes near the edges.
```

### 6. Köşkler Sırtı · `kosk.png`

```
Backdrop: a quiet hill of old mansions. Along the ground line, a low stone garden wall topped with an elegant black wrought-iron fence, with rose bushes behind it. Behind the fence, two large old Ottoman-era wooden mansions (köşk) painted cream and pale blue, with wide eaves, bay windows (cumba) on the upper floor and tall shuttered windows, set in gardens with tall dark cypress trees and a magnolia. Old ornate lamp posts at the far left and far right.
Ground: light gravel path with large flat stepping stones.
```

### 7. Fener Burnu · `fener.png`

```
Backdrop: a windswept headland. On the right back, a tall white lighthouse with coral-red bands and a glass lantern room, next to a small whitewashed stone keeper's cottage with a blue door. On the left back, rocks and the open sea with small white waves breaking. A single wind-bent olive tree near the far left edge. Tall grass with a few wildflowers along the ground line.
Ground: short green-gold grass with a worn sandy footpath across it.
```

## Mürekkep Koyu haritası · `harita.png`

```
A charming hand-painted bird's-eye view map of a small fictional Aegean bay town, seen from above at a gentle 3/4 angle, like a cozy illustrated board-game map. Same style as the attached reference. No text, no labels, no compass, no legend, no frame.
Layout (positions as % of width × % of height):
- The sea fills the lower-left part of the image; the coastline curves from the bottom center-right (around 75%, 100%) up to the left edge (0%, 33%).
- A small headland pokes into the sea on the left at about (15%, 52%) with a white-and-red lighthouse and a keeper's cottage: "Lighthouse Point".
- On the shore at about (40%, 64%): a stone promenade with a wooden pier, fishing boats and a row of white houses: "the Quay".
- At about (61%, 56%): a green park with a huge round plane tree and a little round pond: "Plane Tree Park".
- At about (78%, 42%): a hillside with stone steps and a two-storey school with a red flag: "School Hill".
- At about (58%, 30%): an old market square with a long arcaded stone building with small domes and striped market stalls: "Old Bazaar".
- At about (33%, 33%): a lane of tall narrow houses painted pink, blue, yellow, green and lilac: "Painters' Lane".
- At about (83%, 21%): large old mansions with gardens, cypress trees and an iron fence on a ridge: "Mansion Ridge".
- Winding sandy roads connect: Quay–Park, Quay–Painters' Lane, Quay–Lighthouse, Park–Bazaar, Park–School, Bazaar–Painters' Lane, Bazaar–Mansions, School–Mansions.
- Fill the land between them with fields, olive groves, small farmhouses, trees. Keep about 160×100 px of calm space under each neighbourhood for a name label.
- Soft late-afternoon light, small details (boats, chimneys, laundry lines) but no people.
```

## İsteğe bağlı: karavan
Araba bugün kodla çiziliyor (dört basamak). İstersen aynı stilde dört ayrı saydam PNG de üretilebilir: el arabası, kitap arabası, büyük kitap arabası, kitap karavanı. Hepsi yan görünüşlü olmalı ve raf penceresi aynı yerde açık kalmalı. Bunun için ayrı ölçüleri ayrıca yazarım. Şimdilik gerek yok.
