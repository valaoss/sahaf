// Kalıcı kayıt: sabah ve akşam alınır; gün ortasında kapanan oyun o sabaha döner.
import { persist, SAVE_KEYS } from './native.js';
import { restore } from '../game/state.js';

const KEY = SAVE_KEYS[0];

export function loadGame() {
  try { return restore(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return null; }
}

export function saveGame(S) {
  const j = JSON.stringify(S);
  try { localStorage.setItem(KEY, j); } catch (e) { /* depolama yok */ }
  persist(KEY, j);
}

export function clearGame() {
  try { localStorage.removeItem(KEY); } catch (e) { /* yok */ }
  persist(KEY, null);
}
