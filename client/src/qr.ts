// Codificador QR mínimo y autocontenido (modo byte, nivel de corrección M,
// versiones 1–10, máscara 0). Genera la matriz de módulos para dibujarla como
// SVG; se usa para el código QR de la sala, que codifica el enlace de unión
// a la sala (la dirección del juego con el código en el fragmento #sala=).
// Las versiones 5–10 son necesarias porque un enlace no cabe en la versión 4.
// Implementación estándar: tablas GF(256) con polinomio primitivo 0x11D,
// Reed-Solomon por bloques e información de formato y de versión con BCH
// (como en la especificación ISO/IEC 18004 y los tutoriales públicos de
// referencia).

const GF_EXP = new Array<number>(512).fill(0);
const GF_LOG = new Array<number>(256).fill(0);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255] as number;
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[(GF_LOG[a] as number) + (GF_LOG[b] as number)] as number;
}

function rsGeneratorPoly(nsym: number): number[] {
  let g = [1];
  for (let i = 0; i < nsym; i++) {
    const next = new Array<number>(g.length + 1).fill(0);
    const ai = GF_EXP[i] as number; // α^i
    for (let j = 0; j < g.length; j++) {
      const gj = g[j] as number;
      next[j] = (next[j] as number) ^ gfMul(gj, 1);
      next[j + 1] = (next[j + 1] as number) ^ gfMul(gj, ai);
    }
    g = next;
  }
  return g;
}

function rsEncode(data: number[], nsym: number): number[] {
  const gen = rsGeneratorPoly(nsym);
  const out = [...data, ...new Array<number>(nsym).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = out[i] as number;
    if (coef !== 0) {
      for (let j = 1; j < gen.length; j++) {
        out[i + j] = (out[i + j] as number) ^ gfMul(gen[j] as number, coef);
      }
    }
  }
  return out.slice(data.length);
}

type VersionSpec = {
  total: number;
  ecPerBlock: number;
  blocks: number[]; // data codewords per block
  alignment: number[];
};

// Bloques de datos por versión (nivel M). Cada entrada suma, junto con
// blocks.length * ecPerBlock, el total de codewords de la versión.
const VERSIONS: VersionSpec[] = [
  { total: 26, ecPerBlock: 10, blocks: [16], alignment: [] },
  { total: 44, ecPerBlock: 16, blocks: [28], alignment: [6, 18] },
  { total: 70, ecPerBlock: 26, blocks: [44], alignment: [6, 22] },
  { total: 100, ecPerBlock: 18, blocks: [32, 32], alignment: [6, 26] },
  { total: 134, ecPerBlock: 24, blocks: [43, 43], alignment: [6, 30] },
  { total: 172, ecPerBlock: 16, blocks: [27, 27, 27, 27], alignment: [6, 34] },
  { total: 196, ecPerBlock: 18, blocks: [31, 31, 31, 31], alignment: [6, 22, 38] },
  { total: 242, ecPerBlock: 22, blocks: [38, 38, 39, 39], alignment: [6, 24, 42] },
  { total: 292, ecPerBlock: 22, blocks: [36, 36, 36, 37, 37], alignment: [6, 26, 46] },
  { total: 346, ecPerBlock: 26, blocks: [43, 43, 43, 43, 44], alignment: [6, 28, 50] },
];

// El indicador de longitud en modo byte usa 8 bits en las versiones 1–9
// y 16 bits a partir de la versión 10.
function lengthBits(version: number): number {
  return version >= 10 ? 16 : 8;
}

function byteCapacity(spec: VersionSpec, version: number): number {
  const cap = spec.blocks.reduce((a, b) => a + b, 0);
  return Math.floor((cap * 8 - 4 - lengthBits(version)) / 8);
}

function encodeDataCodewords(
  bytes: number[],
  spec: VersionSpec,
  version: number,
): number[] {
  const capacity = spec.blocks.reduce((a, b) => a + b, 0);
  const bits: number[] = [];
  const push = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  };
  push(0b0100, 4); // modo byte
  push(bytes.length, lengthBits(version));
  for (const b of bytes) push(b, 8);
  const capBits = capacity * 8;
  const terminator = Math.min(4, capBits - bits.length);
  for (let i = 0; i < terminator; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const out: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] as number);
    out.push(byte);
  }
  const pads = [0xec, 0x11];
  let pi = 0;
  while (out.length < capacity) {
    out.push(pads[pi % 2] as number);
    pi++;
  }
  return out;
}

function formatBits(mask: number): number {
  const data = (0 << 3) | mask; // nivel M = 0
  let rem = data;
  for (let i = 0; i < 10; i++) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  return ((data << 10) | rem) ^ 0x5412;
}

// Información de versión (18 bits, BCH con generador 0x1F25); solo se
// dibuja en las versiones 7–10. Verificado contra los valores publicados
// en la especificación para las versiones 7, 8, 9 y 10.
function versionBits(version: number): number {
  let rem = version;
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  }
  return ((version << 12) | rem) >>> 0;
}

/** Devuelve la matriz de módulos (true = oscuro), sin zona de silencio. */
export function qrMatrix(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  let version = 0;
  let spec = VERSIONS[0] as VersionSpec;
  for (let v = 0; v < VERSIONS.length; v++) {
    const s = VERSIONS[v] as VersionSpec;
    if (bytes.length <= byteCapacity(s, v + 1)) {
      version = v + 1;
      spec = s;
      break;
    }
    if (v === VERSIONS.length - 1) {
      version = v + 1;
      spec = s;
    }
  }
  const size = 17 + 4 * version;

  // Bloques de datos y corrección, intercalados.
  const dataCw = encodeDataCodewords(bytes, spec, version);
  const blocks: { data: number[]; ec: number[] }[] = [];
  let offset = 0;
  for (const len of spec.blocks) {
    const data = dataCw.slice(offset, offset + len);
    offset += len;
    blocks.push({ data, ec: rsEncode(data, spec.ecPerBlock) });
  }
  const codewords: number[] = [];
  const maxData = Math.max(...spec.blocks);
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) {
      if (i < b.data.length) codewords.push(b.data[i] as number);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const b of blocks) codewords.push(b.ec[i] as number);
  }

  // Matriz base y mapa de módulos de función.
  const modules: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  const isFunc: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  const setFunc = (x: number, y: number, dark: boolean) => {
    if (x >= 0 && x < size && y >= 0 && y < size) {
      modules[y]![x] = dark;
      isFunc[y]![x] = true;
    }
  };

  // Patrones de posición (finders).
  const drawFinder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFunc(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // Patrones de alineación.
  const centers = spec.alignment;
  for (let i = 0; i < centers.length; i++) {
    for (let j = 0; j < centers.length; j++) {
      const isCorner =
        (i === 0 && j === 0) ||
        (i === 0 && j === centers.length - 1) ||
        (i === centers.length - 1 && j === 0);
      if (isCorner) continue;
      const cx = centers[j] as number;
      const cy = centers[i] as number;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setFunc(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }

  // Timing.
  for (let i = 0; i < size; i++) {
    setFunc(i, 6, i % 2 === 0);
    setFunc(6, i, i % 2 === 0);
  }
  // Re-dibuja finders para que pisen el timing en las esquinas.
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  // Información de formato (máscara 0) y módulo oscuro.
  const bits = formatBits(0);
  const getBit = (b: number, i: number) => ((b >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) setFunc(8, i, getBit(bits, i));
  setFunc(8, 7, getBit(bits, 6));
  setFunc(8, 8, getBit(bits, 7));
  setFunc(7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i++) setFunc(14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i++) setFunc(size - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i++) setFunc(8, size - 15 + i, getBit(bits, i));
  setFunc(8, size - 8, true);

  // Información de versión (versiones 7–10): dos bloques de 3×6 junto a
  // los patrones de posición superior derecho e inferior izquierdo.
  if (version >= 7) {
    const vbits = versionBits(version);
    for (let i = 0; i < 18; i++) {
      const bit = getBit(vbits, i);
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      setFunc(a, b, bit);
      setFunc(b, a, bit);
    }
  }

  // Colocación de datos en zigzag.
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  const getDataBit = (idx: number) =>
    ((codewords[idx >>> 3] as number) >>> (7 - (idx & 7))) & 1;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!(isFunc[y] as boolean[])[x]) {
          let dark = false;
          if (bitIdx < totalBits) {
            dark = getDataBit(bitIdx) === 1;
            bitIdx++;
          }
          // Máscara 0: invertir cuando (x + y) es par.
          if ((x + y) % 2 === 0) dark = !dark;
          modules[y]![x] = dark;
        }
      }
    }
  }
  return modules;
}
