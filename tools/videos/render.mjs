/**
 * Renders the PSB case films in the pause menu's look, in Russian and English:
 *
 *   node tools/videos/render.mjs interviews <interviews.ru.mp4 of the main site>
 *   node tools/videos/render.mjs review <review.ru.mp4 of the main site>
 *
 * The source is the main site's finished film (cybertatar/Portfolio,
 * public/assets/cases/psb/{interviews,review}.ru.mp4): the same takes on the same timeline, so
 * its footage is cropped from inside its cards, its audio is kept as is, and only the dressing
 * around them changes (../pause.css).
 * 1. Crops the footage into <name>/frames/, frame numbers on the source's timeline.
 * 2. Interviews: loudness per frame into frames/level.json, for the audio-only waveform.
 * 3. Steps <name>/<name>.html through every frame in Chromium, pipes the screenshots to ffmpeg
 *    with the source's audio → sketches/img/psb/<name>.{ru,en}.mp4 and <name>-poster.{ru,en}.webp.
 * Needs ffmpeg and Playwright. Add --frames-only to stop after step 2 (for ?t= previews).
 */
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../..');
const out = join(root, 'sketches/img/psb');
const [name, source, flag] = process.argv.slice(2);

// Where the footage sits in the main site's frame: inside each card, clear of its stepped
// corners and of the label that rides the card's bottom edge
const FILMS = {
  interviews: {
    duration: 63.4,
    poster: 2.4,
    crops: { h: '1224:620:348:72', v: '530:620:695:72' },
    level: true,
  },
  review: {
    duration: 127.5,
    poster: 10,
    crops: { f: '646:620:637:72' },
  },
};
const film = FILMS[name];
if (!film || !source) throw new Error('Usage: node tools/videos/render.mjs interviews|review <source.mp4> [--frames-only]');
const FPS = 30;
const dir = join(here, name);
const frames = join(dir, 'frames');
mkdirSync(frames, { recursive: true });
mkdirSync(out, { recursive: true });

// 1. Footage
for (const [kind, crop] of Object.entries(film.crops)) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', source, '-vf', `crop=${crop}`, '-q:v', '2', '-start_number', '0', join(frames, `${kind}%04d.jpg`)]);
}

// 2. Loudness per video frame, normalised to the 97th percentile, for the waveform bars
if (film.level) {
  const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', source, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
  const hop = 16000 / FPS;
  const rms = [];
  for (let i = 0; (i + 1) * hop <= samples.length; i++) {
    const [a, b] = [Math.floor(i * hop), Math.floor((i + 1) * hop)];
    let sum = 0;
    for (let j = a; j < b; j++) sum += (samples[j] / 32768) ** 2;
    rms.push(Math.sqrt(sum / (b - a)));
  }
  const p97 = [...rms].sort((a, b) => a - b)[Math.floor(rms.length * 0.97)];
  writeFileSync(join(frames, 'level.json'), JSON.stringify(rms.map((r) => +(Math.min(1, r / p97) ** 0.7).toFixed(3))));
}
if (flag === '--frames-only') process.exit(0);

// 3. Render: a tiny static server over the repository, since the page fetches its JSON and its
// stylesheet reaches the case cover in sketches/
const types = { '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const server = createServer((req, res) => {
  const path = normalize(join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  try {
    if (!path.startsWith(root)) throw new Error('outside');
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(readFileSync(path));
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const port = server.address().port;

// Through require, as the other tools: it finds the Playwright installed globally too
const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
for (const lang of ['ru', 'en']) {
  await page.goto(`http://localhost:${port}/tools/videos/${name}/${name}.html?lang=${lang}`);
  await page.evaluate(() => document.fonts.ready);
  // prettier-ignore
  const ff = spawn('ffmpeg', [
    '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-i', source,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p',
    '-tune', 'stillimage', '-c:a', 'copy', '-movflags', '+faststart', '-shortest', join(out, `${name}.${lang}.mp4`),
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = Math.round(film.duration * FPS);
  for (let f = 0; f < total; f++) {
    await page.evaluate((t) => window.render(t), f / FPS);
    const shot = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(shot)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 300 === 0) process.stdout.write(`${name} ${lang} ${f}/${total}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  // Poster: a take mid-sentence
  await page.evaluate((t) => window.render(t), film.poster);
  const png = join(frames, `poster.${lang}.png`);
  await page.screenshot({ path: png });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-vf', 'scale=1280:-1', '-quality', '85', join(out, `${name}-poster.${lang}.webp`)]);
}
await browser.close();
server.close();
