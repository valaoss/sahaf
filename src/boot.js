// Giriş: uygulamada kayıtlar kalıcı kopyadan geri yüklendikten sonra oyun başlar.
// İngilizcede önce içerik ve arayüz sözlüğü yerleşir (i18n/en), sonra oyun açılır.
import { restoreSaves } from './core/native.js';
import { LANG } from './i18n/i18n.js';

restoreSaves().catch(() => {}).finally(async () => {
  if (LANG === 'en') {
    document.documentElement.lang = 'en';
    (await import('./i18n/en/index.js')).applyEnglish();
  }
  import('./main.js');
});
