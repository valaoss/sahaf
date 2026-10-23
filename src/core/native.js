// iOS (Capacitor) köprüsü: web'de hiçbir şey yapmaz, eklentiler yalnızca uygulamada yüklenir.
import { Capacitor } from '@capacitor/core';

export const isNative = Capacitor.isNativePlatform();

// Kayıtlar: localStorage hızlı önbellek, Preferences (UserDefaults) kalıcı kopya; iOS depolamayı temizlerse geri yüklenir
export const SAVE_KEYS = ['sahaf.save.v1', 'sahaf.settings.v1', 'sahaf.save.bak'];
// eklenti nesnesi bir sözün sonucu olamaz (vekil nesne then() sorusuna yerel çağrıyla cevap verir): modülü döndür
const prefs = () => import('@capacitor/preferences');

export async function restoreSaves() {
  if (!isNative) return;
  try {
    const { Preferences: P } = await prefs();
    for (const key of SAVE_KEYS) {
      if (localStorage.getItem(key) != null) continue;
      const { value } = await P.get({ key });
      if (value != null) localStorage.setItem(key, value);
    }
  } catch (e) { /* yok */ }
}

// Söz döner: yeniden yüklemeden önce (sıfırlama, yedek) kalıcı kopyanın yazılması beklenebilir
export function persist(key, value) {
  if (!isNative) return Promise.resolve();
  return prefs().then(({ Preferences: P }) => value == null ? P.remove({ key }) : P.set({ key, value })).catch(() => {});
}

let haptics = null;
export function tap(style = 'LIGHT') {
  if (!isNative) return;
  (haptics || (haptics = import('@capacitor/haptics')))
    .then(({ Haptics }) => Haptics.impact({ style })).catch(() => {});
}
