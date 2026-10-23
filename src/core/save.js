// Kalıcı kayıt: sabah ve akşam alınır. Dükkân açıkken yazılmaz: gün ortasında kapanan oyun o sabaha döner.
// Okunamayan ya da daha yeni bir sürümden kalan kayıt silinmez, yedeğe alınır; ayarlardan geri yüklenebilir.
import { persist, SAVE_KEYS } from './native.js';
import { restore, SAVE_V } from '../game/state.js';

const KEY = SAVE_KEYS[0], BAK = SAVE_KEYS[2];

const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const put = (k, v) => {
  try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* depolama yok */ }
  return persist(k, v);
};

// Ham kayıt metnini okur: { S, problem }. problem: null | 'bozuk' (okunamadı) | 'yeni' (oyunun daha yeni bir sürümünden)
export function readSave(raw) {
  if (raw == null) return { S: null, problem: null };
  let saved;
  try { saved = JSON.parse(raw); } catch (e) { return { S: null, problem: 'bozuk' }; }
  if (saved == null) return { S: null, problem: null };
  if (saved.v > SAVE_V) return { S: null, problem: 'yeni' };
  try {
    const S = restore(saved);
    return S ? { S, problem: null } : { S: null, problem: 'bozuk' };
  } catch (e) { return { S: null, problem: 'bozuk' }; }
}

// açılışta okunamayan kayıt olduysa nedeni (main.js oyuncuya söyler)
export let loadProblem = null;

export function loadGame() {
  const raw = get(KEY);
  const { S, problem } = readSave(raw);
  if (problem) { loadProblem = problem; put(BAK, raw); }
  return S;
}

export function saveGame(S) {
  if (S.phase === 'open') return false;
  const j = JSON.stringify(S);
  put(KEY, j);
  return true;
}

// Baştan başla: son kayıt yedeğe alınır, sonra silinir. Söz, (iOS'ta) kalıcı kopya da silinince tamamlanır.
export function clearGame() {
  const raw = get(KEY);
  return Promise.all([raw != null ? put(BAK, raw) : null, put(KEY, null)]);
}

export const hasBackup = () => get(BAK) != null;

// Yedeği asıl kayda geri koyar (bir sonraki açılışta yüklenir)
export function restoreBackup() {
  const raw = get(BAK);
  if (raw == null) return Promise.resolve(false);
  return put(KEY, raw).then(() => true);
}
