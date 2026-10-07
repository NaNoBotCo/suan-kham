// A headless look at the app: opens a page in Chrome, runs steps, saves screenshots, prints console errors.
//   node tools/cdp.mjs <url> <out-prefix> [w] [h] '<js step>' '<js step>' …
// Each step is evaluated in the page, then a screenshot <out-prefix>-<n>.png is taken.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [url, out, W = '412', H = '915', ...steps] = process.argv.slice(2);
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required',
  `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'td-'))}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const wait = {}, errs = [];
for (let k = 0; k < 50; k++) { try { const r = await fetch(`http://127.0.0.1:${port}/json`); const t = (await r.json()).find(x => x.type === 'page'); ws = new WebSocket(t.webSocketDebuggerUrl); break; } catch { await sleep(200); } }
await new Promise(r => ws.onopen = r);
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d); delete wait[d.id]; } if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errs.push(d.params.args.map(a => a.value || a.description).join(' ')); if (d.method === 'Log.entryAdded' && d.params.entry.level === 'error') errs.push(d.params.entry.text + ' ' + (d.params.entry.url || '')); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable'); await send('Log.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 2, mobile: +W < 600 });
await send('Page.navigate', { url }); await sleep(2500);
async function shot(n) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${out}-${n}.png`, Buffer.from(r.result.data, 'base64')); }
await shot(0);
for (let k = 0; k < steps.length; k++) {
  const r = await send('Runtime.evaluate', { expression: steps[k], awaitPromise: true, returnByValue: true });
  if (r.result?.result?.value !== undefined) console.log('step', k + 1, '→', JSON.stringify(r.result.result.value).slice(0, 600));
  if (r.result?.exceptionDetails) errs.push('step ' + (k + 1) + ': ' + (r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text));
  await sleep(1400); await shot(k + 1);
}
console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
ws.close(); chrome.kill();
