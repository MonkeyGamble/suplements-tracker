// Генератор PWA-іконок без зовнішніх залежностей.
// Мотив: зелене кільце (--accent) на темному тлі (--bg). Фон заливає весь холст — безпечно для maskable.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'icons')
mkdirSync(OUT, { recursive: true })

const BG = [0x14, 0x1b, 0x17] // #141B17
const ACCENT = [0x7b, 0xd8, 0xa0] // #7BD8A0

// CRC32 для PNG-чанків.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function makePNG(size) {
  const center = (size - 1) / 2
  // радіуси кільця (у частках розміру) — у межах maskable safe-zone
  const rOuter = size * 0.36
  const rInner = size * 0.255
  const aa = 1.2 // згладжування країв

  // RGBA scanlines з фільтр-байтом 0 на початку кожного рядка
  const raw = Buffer.alloc((size * 4 + 1) * size)
  let p = 0
  for (let y = 0; y < size; y++) {
    raw[p++] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const dx = x - center
      const dy = y - center
      const d = Math.sqrt(dx * dx + dy * dy)
      // міра належності до кільця (0..1) зі згладжуванням країв
      const inner = Math.min(1, Math.max(0, (d - rInner) / aa + 0.5))
      const outer = Math.min(1, Math.max(0, (rOuter - d) / aa + 0.5))
      const ring = inner * outer
      const r = Math.round(BG[0] + (ACCENT[0] - BG[0]) * ring)
      const g = Math.round(BG[1] + (ACCENT[1] - BG[1]) * ring)
      const b = Math.round(BG[2] + (ACCENT[2] - BG[2]) * ring)
      raw[p++] = r
      raw[p++] = g
      raw[p++] = b
      raw[p++] = 255
    }
  }

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const png = makePNG(size)
  const file = join(OUT, `icon-${size}.png`)
  writeFileSync(file, png)
  console.log(`✓ ${file} (${png.length} bytes)`)
}
