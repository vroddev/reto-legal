// Compilador del cliente SOLO para el despliegue externo (Render).
//
// El client/build.mjs del proyecto usa buildClient() del SDK de Muse,
// que está protegido para ejecutarse únicamente dentro de la plataforma
// (sin esa protección, Render fallaría al compilar). Este script reproduce
// la misma configuración de Bun.build (entrada HTML, minificado, nombres
// de assets con hash, plugin de Tailwind y re-prefijo de URLs de assets)
// sin pasar por esa función, para que el Dockerfile pueda compilar el
// cliente desde el código fuente en cualquier servidor.

import { readFile, rm } from "node:fs/promises";
import { basename } from "node:path";
import tailwindPlugin from "bun-plugin-tailwind";

const ENTRY = "./client/index.html";
const OUTDIR = "./client/dist";

await rm(OUTDIR, { force: true, recursive: true });

const platformVersion = await readFile("./space.json", "utf8")
  .then((text) => JSON.parse(text).platformVersion)
  .catch(() => undefined);

const result = await Bun.build({
  entrypoints: [ENTRY],
  outdir: OUTDIR,
  minify: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    __HATCH_SPACE_PLATFORM_VERSION__: JSON.stringify(
      typeof platformVersion === "number" ? platformVersion : 0,
    ),
  },
  naming: {
    asset: "assets/[name]-[hash].[ext]",
    chunk: "assets/[name]-[hash].[ext]",
    entry: "[name].[ext]",
  },
  plugins: [tailwindPlugin],
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  throw new Error("La compilación del cliente para Render falló.");
}

// Bun escribe los assets importados en assets/<nombre>-<hash>.<ext> pero
// emite su URL como ./<nombre>-<hash>.<ext>; se re-prefija a ./assets/…
// igual que en la compilación de la plataforma, para que el navegador
// encuentre imágenes, audios y video.
const assetFiles = result.outputs
  .filter((output) => output.kind === "asset")
  .map((output) => basename(output.path));

for (const output of result.outputs) {
  if (!/\.(js|css|html)$/.test(output.path)) continue;
  let text = await output.text();
  let changed = false;
  for (const name of assetFiles) {
    const bare = `./${name}`;
    if (text.includes(bare)) {
      text = text.split(bare).join(`./assets/${name}`);
      changed = true;
    }
  }
  if (changed) await Bun.write(output.path, text);
}

console.log(`Cliente compilado en ${OUTDIR} (${result.outputs.length} salidas).`);
