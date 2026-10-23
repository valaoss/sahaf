# iOS paketleme (Mac'te)

Oyun web için hazır; iOS uygulaması Capacitor 8 ile aynı `dist/` klasöründen üretilir. `ios/` klasörü henüz yok, ilk kez Mac'te oluşturulur.

## Bir kez

1. Xcode (App Store'dan) ve Node 22 kur. Apple geliştirici hesabıyla Xcode'da oturum aç.
2. Depoyu çek: `git clone https://github.com/valaoss/sahaf && cd sahaf && npm ci`
3. iOS projesini oluştur: `npm run build && npx cap add ios`
4. Xcode'da aç: `npx cap open ios`
   - **Signing & Capabilities:** Team = kendi hesabın; Bundle Identifier `com.baranbulduk.sahaf` (capacitor.config.json).
   - **App Icon:** `ios/App/App/Assets.xcassets/AppIcon.appiconset` içine `resources/icon-1024.png`'yi sürükle (Xcode 15+ tek boy 1024 simge yeter).
   - **Açılış ekranı:** `Assets.xcassets/Splash.imageset` içindeki üç görseli `resources/splash-2732.png` ile değiştir (Capacitor'ın LaunchScreen'i bunu ortalar).
   - **Info.plist:**
     - Desteklenen yönler: Portrait, Landscape Left, Landscape Right (oyun ikisini de destekler).
     - `UIRequiresFullScreen` = YES (bölünmüş ekranda çerçeve küçülmesin).
     - `ITSAppUsesNonExemptEncryption` = NO (şifreleme yok; App Store sorusu kalkar).
     - `UIStatusBarHidden` = YES ve `UIViewControllerBasedStatusBarAppearance` = NO (oyun tam ekran).

## Her sürümde

1. `npm test` (iki test dosyası da "test geçti" demeli) ve `npm run ios` (= `vite build && cap sync ios`).
2. Xcode'da sürüm/derleme numarasını artır (General → Version / Build).
3. Gerçek cihazda dene (aşağıdaki liste), sonra Product → Archive → Distribute App → TestFlight.

## Gerçek cihazda bakılacaklar

Bunların hiçbiri Windows'ta denenemedi; ilk iPhone denemesinde tek tek bakılmalı:

- **Ekran:** dikeyde sahne ekranı dolduruyor mu, çentik/Dynamic Island ve alt çubuk düğmeleri örtüyor mu (safe-area payları `style.css`'te).
- **Ses:** ilk dokunuşta müzik başlıyor mu; telefon araması ya da başka bir uygulamadan dönünce ses geri geliyor mu (`audio.js` unlock, 'interrupted').
- **Kayıt:** oyunu sabah kapatıp aç → aynı sabah; gün ortasında kapatıp aç → o sabaha döner; uygulamayı silmeden iOS depolamayı temizlese bile Preferences'tan geri gelir (`core/native.js`).
- **Arka plana alma:** ana ekrana dön → geri gel; kayıt `pagehide`/`visibilitychange` ile alınır.
- **Dil:** Ayarlar → Dil → English; oyun yeniden açılır, içerik ve arayüz İngilizce.
- **Performans:** uzun bir günde ısınma ve kare hızı; gerekirse ⚙️ Boyanmış doku kapatılır.
- **Dokunma:** raf modunda sürükle-bırak ve dokun-seç, haritada iki parmakla yakınlaştırma.

## Simgeyi değiştirmek

`resources/icon.svg`'yi düzenle, sonra `npm run icons` (başsız Chrome ile `resources/icon-1024.png`, `resources/splash-2732.png` ve web için `public/apple-touch-icon.png` üretir).
