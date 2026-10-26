import { defineConfig } from 'vite';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// virtual:art: public/art'ta hangi boyalı görsellerin olduğu (render/plates.js). Dosya eklenip silinince sayfa yenilenir.
const ART = fileURLToPath(new URL('./public/art/', import.meta.url)), ART_ID = '\0virtual:art';
function artList() {
  const pngs = dir => existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)) : [];
  return {
    name: 'art-list',
    resolveId: id => id === 'virtual:art' ? ART_ID : null,
    load: id => id === ART_ID ? `export const SCENES = ${JSON.stringify(pngs(ART + 'sahne'))};\nexport const MAP = ${existsSync(ART + 'harita.png')};\n` : null,
    configureServer(server) {
      server.watcher.add(ART);
      const bump = f => {
        if (!f.replace(/\\/g, '/').includes('/public/art/')) return;
        const m = server.moduleGraph.getModuleById(ART_ID);
        if (m) server.moduleGraph.invalidateModule(m);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', bump);
      server.watcher.on('unlink', bump);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [artList()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
  server: { host: true, port: 8770, strictPort: true },
});
