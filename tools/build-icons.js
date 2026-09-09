/* ============================================================
   build-icons.js — the PNG/ICO icon set, from two 512px masters.

   WHY THIS EXISTS: headless Chrome cannot render a window narrower than
   about 500px on Windows. Ask it for --window-size=32,32 and it renders the
   page at the minimum width and hands back the top-left 32x32 CROP — which,
   for a centred hexagon, is a fully transparent tile. It exits 0 and reports
   bytes written, so nothing looks wrong. The old icons hid this: they were a
   full-bleed navy square, and a crop of a solid square is still a solid
   square. The moment the mark became a hexagon the bug became visible.

   So: Chrome renders ONE 512px master per variant (a size it is happy with),
   and this script box-filters it down. That also gives better small sizes
   than Chrome's own 32px rasterisation of the same SVG.

   Render the masters first (server on :8080):

     chrome --headless=new --window-size=512,512 --default-background-color=00000000 \
            --run-all-compositor-stages-before-draw \
            --screenshot=images/icon-512.png \
            http://localhost:8080/tools/icon-source.html
     chrome ... --screenshot=<tmp>/apple-master.png \
            http://localhost:8080/tools/icon-source.html?v=solid

   Then:  node tools/build-icons.js <tmp>/apple-master.png

   Emits images/favicon-32.png, images/icon-192.png, images/apple-touch-icon.png,
   images/favicon.ico and the root copy favicon.ico.
   ============================================================ */

const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

/* --- PNG decode ------------------------------------------------------- */

function decodePng(file) {
  const d = fs.readFileSync(file);
  let pos = 8, w = 0, h = 0, colourType = 0;
  const idat = [];
  while (pos < d.length) {
    const len = d.readUInt32BE(pos);
    const type = d.toString('ascii', pos + 4, pos + 8);
    if (type === 'IHDR') {
      w = d.readUInt32BE(pos + 8);
      h = d.readUInt32BE(pos + 12);
      const depth = d[pos + 16];
      colourType = d[pos + 17];
      if (depth !== 8) throw new Error(`${file}: only 8-bit PNGs supported`);
      if (colourType !== 2 && colourType !== 6) throw new Error(`${file}: unsupported colour type ${colourType}`);
    } else if (type === 'IDAT') {
      idat.push(d.subarray(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const ch = colourType === 6 ? 4 : 3;
  const stride = w * ch;

  /* Undo the per-scanline filters. */
  const out = Buffer.alloc(w * h * 4, 255);
  let prev = Buffer.alloc(stride);
  let i = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[i++];
    const line = Buffer.from(raw.subarray(i, i + stride));
    i += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? line[x - ch] : 0;
      const b = prev[x];
      const c = x >= ch ? prev[x - ch] : 0;
      if (f === 1) line[x] = (line[x] + a) & 255;
      else if (f === 2) line[x] = (line[x] + b) & 255;
      else if (f === 3) line[x] = (line[x] + ((a + b) >> 1)) & 255;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        line[x] = (line[x] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
    }
    for (let x = 0; x < w; x++) {
      const s = x * ch, o = (y * w + x) * 4;
      out[o] = line[s]; out[o + 1] = line[s + 1]; out[o + 2] = line[s + 2];
      out[o + 3] = ch === 4 ? line[s + 3] : 255;
    }
    prev = line;
  }
  return { width: w, height: h, data: out };
}

/* --- PNG encode (RGBA, filter 0) -------------------------------------- */

function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(td) >>> 0 : crc32(td));
  return Buffer.concat([len, td, crc]);
}

/* Node < 22 has no zlib.crc32. */
let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function encodePng({ width, height, data }) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0;
    data.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* --- Box downscale, alpha-correct ------------------------------------- */

/* RGB has to be premultiplied by alpha before averaging. Averaging straight
   RGB pulls the colour of fully transparent pixels (which Chrome leaves as
   black) into the edge, and the hexagon gets a dark fringe. */
function downscale(src, size) {
  const { width: sw, height: sh, data: sd } = src;
  const out = Buffer.alloc(size * size * 4);
  const bx = sw / size, by = sh / size;
  for (let y = 0; y < size; y++) {
    const y0 = Math.floor(y * by), y1 = Math.max(y0 + 1, Math.floor((y + 1) * by));
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * bx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * bx));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const o = (sy * sw + sx) * 4, al = sd[o + 3] / 255;
          r += sd[o] * al; g += sd[o + 1] * al; b += sd[o + 2] * al; a += sd[o + 3];
          n++;
        }
      }
      const o = (y * size + x) * 4;
      const am = a / n;
      const un = am > 0 ? (n * 255) / a : 0;
      out[o] = Math.round(Math.min(255, (r / n) * un));
      out[o + 1] = Math.round(Math.min(255, (g / n) * un));
      out[o + 2] = Math.round(Math.min(255, (b / n) * un));
      out[o + 3] = Math.round(am);
    }
  }
  return { width: size, height: size, data: out };
}

/* --- ICO: a 6-byte header, one 16-byte directory entry, the PNG ------- */

function pngToIco(png, side) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = side; entry[1] = side; entry[2] = 0; entry[3] = 0;
  entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

/* --- Run -------------------------------------------------------------- */

const root = path.join(__dirname, '..');
const p = (...a) => path.join(root, ...a);

const appleMaster = process.argv[2];
if (!appleMaster) {
  console.error('usage: node tools/build-icons.js <path to the ?v=solid 512px master>');
  process.exit(1);
}

const flat = decodePng(p('images', 'icon-512.png'));
if (flat.width !== 512) throw new Error('images/icon-512.png must be the 512px master');

/* A correctly rendered hexagon covers exactly 75% of its box (four corner
   triangles of 16x32 removed from 64x64). Chrome's crop bug yields a few
   percent. Refuse to build the set from a bad master. */
let painted = 0;
for (let i = 3; i < flat.data.length; i += 4) if (flat.data[i] > 10) painted++;
const pct = (100 * painted) / (flat.width * flat.height);
if (pct < 60 || pct > 85) {
  throw new Error(`icon-512.png is ${pct.toFixed(1)}% painted; a full hexagon is ~75%. ` +
    'Chrome probably returned a crop — re-render the master at --window-size=512,512.');
}

const outputs = [
  ['images/favicon-32.png', downscale(flat, 32)],
  ['images/icon-192.png', downscale(flat, 192)],
  ['images/apple-touch-icon.png', downscale(decodePng(appleMaster), 180)],
];

for (const [rel, img] of outputs) {
  const buf = encodePng(img);
  fs.writeFileSync(p(rel), buf);
  console.log(`written  ${rel}  ${img.width}x${img.height}  ${buf.length} B`);
}

const ico = pngToIco(fs.readFileSync(p('images', 'favicon-32.png')), 32);
fs.writeFileSync(p('images', 'favicon.ico'), ico);
/* Google's favicon crawler falls back to /favicon.ico when it misses the
   declared path, so the root copy is not optional. */
fs.writeFileSync(p('favicon.ico'), ico);
console.log(`written  images/favicon.ico + favicon.ico  ${ico.length} B`);
console.log(`\nmaster ${pct.toFixed(1)}% painted — hexagon intact`);
