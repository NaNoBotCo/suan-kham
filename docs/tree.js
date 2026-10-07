/* A head word drawn as a paper-cut tree: its senses are the branches, each growing out of the
   sense it EXTENDS (by metaphor, metonymy …), its compounds the leaves at that branch's tip, its
   lookalikes the weeds at the foot, its unfiled words seeds on the ground.

   MDTREE.draw(c, W, H, t, h, o)  → hit list [{k:'sense'|'leaf', n, th, x, y, r}]
     h: a head from index.json (sen = [[n, en, ext, via, count, note]…], nl, nu) or its full file
     o: {hi: sense n to light, mini: true for the garden, sky: true for a backdrop, seed} */
(function () {
'use strict';
var SKY = window.MDSKY; if (!SKY || window.MDTREE) return;
var paper = SKY.paper, jag = SKY.jag, TAU = 6.2832;
var VIA = {
  '': { col: '#7a4a2a', th: 'ความหมายแรก', en: 'first sense' },
  metaphor: { col: '#c8642a', th: 'อุปมา', en: 'metaphor' },
  metonymy: { col: '#2f5f8f', th: 'นามนัย', en: 'metonymy' },
  specialisation: { col: '#2f7a46', th: 'แคบลง', en: 'narrowing' },
  generalisation: { col: '#8a3a7a', th: 'กว้างขึ้น', en: 'widening' },
  euphemism: { col: '#c0507a', th: 'คำสุภาพ', en: 'euphemism' }
};
function rnd(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/* senses from either shape: index rows or a head file */
function senses(h) {
  if (h.senses) return h.senses.map(function (s) { return { n: s.n, en: s.en, ext: s.ext, via: s.via || '', nc: s.c.length, c: s.c }; });
  return (h.sen || []).map(function (r) { return { n: r[0], en: r[1], ext: r[2], via: r[3] || '', nc: r[4], c: null }; });
}

function layout(h) {
  var S = senses(h), by = {}, roots = [];
  S.forEach(function (s) { by[s.n] = s; s.kids = []; });
  S.forEach(function (s) { if (s.ext != null && by[s.ext] && s.ext !== s.n) by[s.ext].kids.push(s); else roots.push(s); });
  /* a chain that loops back on itself has no root: cut it at its lowest number */
  var seen = {};
  function mark(s) { if (seen[s.n]) return; seen[s.n] = 1; s.kids.forEach(mark); }
  roots.forEach(mark);
  S.forEach(function (s) { if (!seen[s.n]) { roots.push(s); if (s.ext != null && by[s.ext]) by[s.ext].kids = by[s.ext].kids.filter(function (k) { return k !== s; }); mark(s); } });
  function weigh(s, d) { s.d = d; s.w = 1 + Math.min(s.nc, 30) / 5; s.kids.forEach(function (k) { s.w += weigh(k, d + 1); }); return s.w; }
  var tot = 0; roots.forEach(function (r) { tot += weigh(r, 0); });
  return { S: S, roots: roots, tot: tot || 1 };
}

/* one branch: a tapered curve from a to b, bent by its kind of growth */
function branch(c, a, b, w0, w1, via, sway) {
  var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / L, ny = dx / L;
  var bend = via === 'metaphor' ? 0.32 : via === 'euphemism' ? -0.22 : via === 'generalisation' ? 0.12 : via === 'metonymy' ? 0.04 : 0.1;
  bend += sway * 0.4;
  var m1 = [a[0] + dx * 0.33 + nx * L * bend, a[1] + dy * 0.33 + ny * L * bend], m2 = [a[0] + dx * 0.66 - nx * L * bend * (via === 'metaphor' ? 0.8 : 0.3), a[1] + dy * 0.66 - ny * L * bend * (via === 'metaphor' ? 0.8 : 0.3)];
  var N = 14, left = [], right = [];
  for (var i = 0; i <= N; i++) {
    var u = i / N, v = 1 - u;
    var x = v * v * v * a[0] + 3 * v * v * u * m1[0] + 3 * v * u * u * m2[0] + u * u * u * b[0];
    var y = v * v * v * a[1] + 3 * v * v * u * m1[1] + 3 * v * u * u * m2[1] + u * u * u * b[1];
    var tx = 3 * v * v * (m1[0] - a[0]) + 6 * v * u * (m2[0] - m1[0]) + 3 * u * u * (b[0] - m2[0]);
    var ty = 3 * v * v * (m1[1] - a[1]) + 6 * v * u * (m2[1] - m1[1]) + 3 * u * u * (b[1] - m2[1]);
    var tl = Math.sqrt(tx * tx + ty * ty) || 1, w = (w0 + (w1 - w0) * (via === 'specialisation' ? Math.sqrt(u) : u)) / 2;
    left.push([x - ty / tl * w, y + tx / tl * w]); right.unshift([x + ty / tl * w, y - tx / tl * w]);
  }
  return left.concat(right);
}
function polyPath(pts) { return function (q) { q.beginPath(); pts.forEach(function (p, i) { i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1]); }); q.closePath(); }; }

function leaf(c, x, y, len, ang, col, lift) {
  paper(c, function (q) {
    q.beginPath(); q.moveTo(x, y);
    var ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, px = -Math.sin(ang) * len * 0.32, py = Math.cos(ang) * len * 0.32;
    q.quadraticCurveTo((x + ex) / 2 + px, (y + ey) / 2 + py, ex, ey);
    q.quadraticCurveTo((x + ex) / 2 - px, (y + ey) / 2 - py, x, y); q.closePath();
  }, col, lift);
}

function sky(c, W, H, t) {
  var hr = new Date().getHours() + new Date().getMinutes() / 60, night = hr < 6 || hr >= 19, dusk = (hr >= 17 && hr < 19) || (hr >= 6 && hr < 7);
  var g = c.createLinearGradient(0, 0, 0, H);
  if (night) { g.addColorStop(0, '#16163a'); g.addColorStop(1, '#3a2f5a'); }
  else if (dusk) { g.addColorStop(0, '#6f8fc0'); g.addColorStop(1, '#f2b07a'); }
  else { g.addColorStop(0, '#8fc3dc'); g.addColorStop(1, '#f4ead2'); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  var r = rnd(7);
  if (night) { for (var i = 0; i < 50; i++) { c.fillStyle = 'rgba(255,246,214,' + (0.3 + 0.5 * Math.abs(Math.sin(t / 900 + i))) + ')'; c.fillRect(r() * W, r() * H * 0.6, 1.8, 1.8); } paper(c, function (q) { q.beginPath(); q.arc(W * 0.84, H * 0.16, H * 0.05, 0, TAU); q.arc(W * 0.84 + H * 0.02, H * 0.15, H * 0.045, 0, TAU, true); }, '#f6ecc4', 0.6); }
  else { paper(c, function (q) { q.beginPath(); q.arc(W * 0.85, H * 0.15, H * 0.055, 0, TAU); }, dusk ? '#f28a4a' : '#f6d25a', 0.5);
    for (var k = 0; k < 3; k++) { var cx = ((k * 0.37 + t / 90000) % 1.3 - 0.15) * W, cy = H * (0.12 + k * 0.08); paper(c, function (q) { q.beginPath(); q.ellipse(cx, cy, H * 0.08, H * 0.025, 0, 0, TAU); q.ellipse(cx + H * 0.05, cy - H * 0.015, H * 0.05, H * 0.025, 0, 0, TAU); }, 'rgba(255,255,255,.85)', 0.3); } }
  /* far hills, the north's ridge line */
  paper(c, function (q) { q.beginPath(); q.moveTo(0, H); for (var x = 0; x <= W; x += 8) q.lineTo(x, H * 0.7 - Math.sin(x / W * 5.1 + 1) * H * 0.05 - Math.sin(x / W * 13) * H * 0.015); q.lineTo(W, H); q.closePath(); }, night ? '#2a3550' : '#7fa6a0', 0.4);
  return night;
}


/* the roots: below the ground line, a cut through the soil. The taproot carries the forms the word
   descends or is borrowed from, oldest deepest; side roots carry its cognates in the sister
   languages; a gold knot carries its ThaiRoots family, whose rootlets are the sister words. */
var SCRIPT = '"Sarabun","Noto Sans Thai","Noto Sans Lao","Noto Sans Tai Tham","Noto Sans Tai Viet","Noto Sans New Tai Lue","Noto Sans Myanmar","Noto Sans Tai Le","Noto Sans Ahom","Noto Sans Devanagari","Noto Sans Khmer","Noto Sans SC",sans-serif';
function tag(c, x, y, big, small, col, ink, fs, hits, hit, glow) {
  c.font = '600 ' + fs + 'px ' + SCRIPT; var w1 = c.measureText(big).width;
  c.font = (fs * 0.62 | 0) + 'px "Sarabun",sans-serif'; var w2 = small ? c.measureText(small).width : 0;
  var w = Math.max(w1, w2) + fs * 0.8, h = fs * (small ? 1.9 : 1.3), x0 = x - w / 2, y0 = y - h / 2;
  paper(c, function (q) { q.beginPath(); if (q.roundRect) q.roundRect(x0, y0, w, h, fs * 0.3); else q.rect(x0, y0, w, h); }, col, 0.7);
  c.fillStyle = ink; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '600 ' + fs + 'px ' + SCRIPT; c.fillText(big, x, y0 + fs * 0.68);
  if (small) { c.font = (fs * 0.62 | 0) + 'px "Sarabun",sans-serif'; c.globalAlpha = 0.8; c.fillText(small, x, y0 + fs * 1.42); c.globalAlpha = 1; }
  if (hits && hit) { hit.x = x; hit.y = y; hit.r = Math.max(w, h) / 2; hits.push(hit); }
  return [w, h];
}
function rootLine(c, a, b, w0, w1, col, wig, t, k) {
  var pts = [], N = 16;
  for (var i = 0; i <= N; i++) { var u = i / N; pts.push([a[0] + (b[0] - a[0]) * u + Math.sin(u * 7 + k) * wig * Math.sin(u * Math.PI), a[1] + (b[1] - a[1]) * (u * u * 0.4 + u * 0.6) + Math.cos(u * 5 + k + t / 3000) * wig * 0.3 * u]); }
  var L = [], R = [];
  pts.forEach(function (p, i) { var q = pts[Math.min(N, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.sqrt(dx * dx + dy * dy) || 1, w = (w0 + (w1 - w0) * i / N) / 2; L.push([p[0] - dy / d * w, p[1] + dx / d * w]); R.unshift([p[0] + dy / d * w, p[1] - dx / d * w]); });
  paper(c, polyPath(L.concat(R)), col, 0.5);
  return pts;
}
function drawRoots(c, W, H, t, h, cx, gy, tw, hits, night) {
  var R = h.roots || {}, depth = H - gy, fs = Math.max(12, Math.min(19, W / 38));
  /* soil, in layers */
  [['#7a5232', 0], ['#664226', 0.3], ['#553620', 0.62], ['#452c1a', 0.86]].forEach(function (L, i) {
    paper(c, function (q) { q.beginPath(); q.moveTo(0, H); var y = gy + depth * L[1]; for (var x = 0; x <= W; x += 10) q.lineTo(x, y + (i ? Math.sin(x / 70 + i * 2) * 5 : 0)); q.lineTo(W, H); q.closePath(); }, night ? ['#3a2818', '#302014', '#281a10', '#20140c'][i] : L[0], 0.3);
  });
  var r = rnd(hash(h.th) + 5);
  for (var st = 0; st < 22; st++) { var sx = r() * W, sy = gy + depth * (0.08 + r() * 0.9), sr = 2 + r() * 6; paper(c, function (q) { q.beginPath(); q.ellipse(sx, sy, sr * 1.4, sr, r() * 3, 0, TAU); }, ['#8a7a68', '#a09080', '#6e6052'][st % 3], 0.3); }
  var root = night ? '#b89a72' : '#d8bc8e', TQ = [];
  function T() { TQ.push(arguments); }
  /* taproot: ancestors, oldest deepest */
  var from = R.from || [], tapEnd = [cx + Math.sin(t / 4000) * 3, gy + depth * (from.length ? 0.9 : 0.5)];
  rootLine(c, [cx, gy - 2], tapEnd, tw * 1.1, 2, root, 8, t, 1);
  /* side roots: cognates */
  var cog = (R.cog || []).slice(0, W < 520 ? 8 : 12), nL = Math.ceil(cog.length / 2);
  cog.forEach(function (g, i) {
    var side = i % 2 ? 1 : -1, row = i >> 1, yy = gy + depth * (0.16 + 0.68 * (row + 0.5) / Math.max(nL, 1)), xx = cx + side * W * (0.25 + 0.16 * ((row + (i % 2)) % 2));
    var st0 = [cx + side * tw * 0.3, gy + depth * (0.04 + row * 0.07)];
    rootLine(c, st0, [xx, yy], Math.max(2, tw * 0.45 - row), 1.5, root, 10, t, i + 2);
    T(c, xx, yy, g[2], (g[3] ? g[3] + ' · ' : '') + (g[1] || g[0]), '#f4e8cc', '#3a2410', fs, hits, { k: 'root', say: g[2] + (g[3] ? ' (' + g[3] + ')' : '') + ' — ' + (g[1] || '') + ' ' + g[0] });
  });
  /* comparisons: fainter roots off to the edges */
  (R.cf || []).slice(0, 3).forEach(function (g, i) {
    var side = i % 2 ? -1 : 1, yy = gy + depth * (0.92 - i * 0.05), xx = side > 0 ? W * 0.9 : W * 0.1;
    c.save(); c.globalAlpha = 0.6; rootLine(c, [cx, gy + depth * 0.7], [xx, yy], 3, 1, root, 6, t, 9 + i); c.restore();
    T(c, xx, yy - fs, g[2], 'เทียบ · compare ' + (g[1] || g[0]), '#e6dcc8', '#4a3a28', fs * 0.85, hits, { k: 'root', say: 'compare ' + (g[1] || g[0]) + ' ' + g[2] });
  });
  /* ThaiRoots: the gold knot and its rootlets */
  (R.tr || []).slice(0, 1).forEach(function (f) {
    var ky = gy + depth * (from.length > 1 ? 0.56 : 0.62), kx = cx + (cog.length ? 0 : 0);
    var ders = (f.der || []).slice(0, W < 520 ? 4 : 7);
    ders.forEach(function (d, j) {
      var a = Math.PI * (0.08 + 0.84 * (j + 0.5) / ders.length), far = j % 2 ? 1.35 : 0.85, dx = kx + Math.cos(a) * W * 0.3 * far, dy = ky + depth * (0.1 + 0.2 * (j % 2 ? 1 : 0.35)) * (0.6 + 0.4 * Math.sin(a));
      rootLine(c, [kx, ky], [dx, dy], 3, 1, '#e8b84a', 5, t, 20 + j);
      T(c, dx, dy, d[0], d[2] ? d[2].slice(0, 28) : '', '#fbe7b0', '#5a3a08', fs * 0.9, hits, { k: 'word', th: d[0], say: d[0] + ' ' + (d[1] || '') + ' — ' + (d[2] || '') });
    });
    T(c, kx, ky, f.root, 'ThaiRoots ' + (f.id || '') + (f.gloss ? ' · ' + f.gloss.slice(0, 26) : ''), '#e8b84a', '#3a2008', fs * 1.1, hits, { k: 'root', say: 'ThaiRoots ' + f.id + ': ' + f.root + ' — ' + f.gloss + (f.note ? '. ' + f.note : '') }, 1);
  });
  /* the ancestors on the taproot, drawn last so they sit on top */
  from.forEach(function (g, i) {
    var yy = gy + depth * (0.3 + 0.55 * (from.length > 1 ? i / (from.length - 1) : 0.5) * (R.tr && R.tr.length ? 0.45 : 1)) + (R.tr && R.tr.length && i ? -depth * 0.02 : 0);
    if (R.tr && R.tr.length) yy = gy + depth * (0.24 + 0.2 * i);
    T(c, cx, yy, g[2], (g[5] === 'loan' ? 'ยืมจาก · from ' : 'สืบจาก · from ') + (g[1] || g[0]) + (g[4] ? ' “' + g[4].slice(0, 18) + '”' : ''), g[5] === 'loan' ? '#cfe0f0' : '#f6d8c0', '#2a1a10', fs * 1.08, hits, { k: 'root', say: g[2] + ' — ' + (g[1] || '') + ' ' + g[0] });
  });
  TQ.forEach(function (a) { if (a[10]) { c.save(); c.shadowColor = 'rgba(255,210,90,.8)'; c.shadowBlur = 16; } tag.apply(null, a); if (a[10]) c.restore(); });
  if (!from.length && !cog.length && !(R.tr || []).length) { c.fillStyle = 'rgba(255,240,210,.6)'; c.font = fs + 'px "Sarabun",sans-serif'; c.textAlign = 'center'; c.fillText('ไม่มีบันทึกรากศัพท์ · no etymology recorded', cx, gy + depth * 0.5); }
}

function draw(c, W, H, t, h, o) {
  o = o || {};
  var mini = !!o.mini, hits = [], seed = o.seed != null ? o.seed : hash(h.s || h.th || ''), r = rnd(seed), night = false;
  var withRoots = !mini && o.roots && h.roots, FH = withRoots ? H * (W < 520 ? 0.52 : 0.58) : H;
  if (o.sky) night = sky(c, W, FH, t);
  var L = layout(h), gy = withRoots ? FH : FH * (mini ? 0.9 : 0.86), cx = W / 2, sc = Math.min(W * 0.95, FH * 1.25);
  if (withRoots) gy = FH;
  /* ground */
  paper(c, function (q) { q.beginPath(); q.moveTo(cx - sc * 0.5, gy + FH); q.lineTo(cx - sc * 0.5, gy); for (var x = -0.5; x <= 0.5; x += 0.05) q.lineTo(cx + x * sc, gy - Math.cos(x * Math.PI) * sc * 0.035); q.lineTo(cx + sc * 0.5, gy + FH); q.closePath(); }, night ? '#3d5a34' : '#6fa04e', 0.8);
  if (withRoots) drawRoots(c, W, H, t, h, cx, gy, sc * (0.035 + Math.min(L.tot, 80) / 2600), hits, night);
  /* seeds: words still waiting to be filed */
  for (var u = 0; u < Math.min(h.nu || (h.left ? h.left.length : 0), 14); u++) { c.fillStyle = '#5a3a1a'; c.beginPath(); c.ellipse(cx + (r() - 0.5) * sc * 0.7, gy + sc * 0.01 + r() * sc * 0.03, sc * 0.006, sc * 0.004, r() * 3, 0, TAU); c.fill(); }
  /* trunk */
  var trunkH = FH * (mini ? 0.26 : 0.2) * (0.85 + Math.min(L.tot, 60) / 400), tw = sc * (0.035 + Math.min(L.tot, 80) / 2600);
  var top = [cx + Math.sin(t / 2100) * sc * 0.004, gy - trunkH];
  var tp = branch(c, [cx, gy + 2], top, tw * 1.25, tw * 0.8, '', 0);
  paper(c, polyPath(tp), '#6b4426', 1.4);
  if (!mini) { c.save(); c.strokeStyle = 'rgba(40,20,10,.25)'; c.lineWidth = 1; for (var k = 0; k < 5; k++) { c.beginPath(); c.moveTo(cx - tw * 0.3 + k * tw * 0.15, gy); c.quadraticCurveTo(cx - tw * 0.2 + k * tw * 0.1, gy - trunkH * 0.5, top[0] - tw * 0.2 + k * tw * 0.1, top[1] + 4); c.stroke(); } c.restore(); }
  /* roots spread at the foot */
  [-1, 1].forEach(function (sg) { paper(c, polyPath(branch(c, [cx + sg * tw * 0.3, gy - tw * 0.2], [cx + sg * tw * 2.2, gy + tw * 0.25], tw * 0.6, tw * 0.1, '', 0)), '#5e3b20', 0.6); });

  var lightN = o.hi, tips = [], segs = [], ONE = null;
  /* pass 1: the shape in unit lengths, trunk top at 0,0 */
  function grow(s, from, ang, a0, a1, fromW, asTrunk) {
    var sway = Math.sin(t / 1700 + s.n * 1.3) * 0.025 * (s.d + 1), to;
    if (asTrunk) to = from;
    else {
      ang += sway;
      var len = Math.pow(0.8, s.d) * (0.45 + 0.4 * Math.sqrt(s.w / L.tot));
      to = [from[0] + Math.cos(ang) * len, from[1] + Math.sin(ang) * len];
      segs.push({ s: s, a: from, b: to, w0: fromW, w1: Math.max(0.012, fromW * 0.7) });
    }
    var w = asTrunk ? fromW : Math.max(0.012, fromW * 0.7);
    tips.push({ s: s, x: to[0], y: to[1], lit: lightN === s.n, w: w, ang: asTrunk ? -Math.PI / 2 : ang });
    if (s.kids.length) {
      var tw2 = 0; s.kids.forEach(function (k) { tw2 += k.w; });
      var spread = asTrunk ? Math.min(3.0, 1.2 + s.kids.length * 0.28) : Math.max(0.7, Math.min(1.9, 0.45 + s.kids.length * 0.32)), x = (asTrunk ? -Math.PI / 2 : ang) - spread / 2;
      s.kids.forEach(function (k) { var sh = spread * k.w / tw2; grow(k, to, x + sh / 2, x, x + sh, w, false); x += sh; });
    }
  }
  var tw0 = 0.075;
  if (L.roots.length === 1) grow(L.roots[0], [0, 0], -Math.PI / 2, 0, 0, tw0, true);
  else { var span = Math.min(3.0, 1.1 + L.roots.length * 0.32), ax = -Math.PI / 2 - span / 2;
    L.roots.forEach(function (rt) { var sh = span * rt.w / L.tot; grow(rt, [0, 0], ax + sh / 2, ax, ax + sh, tw0, false); ax += sh; }); }
  /* pass 2: fit it over the trunk, inside the frame */
  function depthOf(n) { return n > 1 ? Math.ceil(Math.log(n) / Math.LN2) : 0; }
  function twig0(n) { return (mini ? 0.17 : 0.16) * (0.45 + 0.55 * Math.min(1, depthOf(n) / 5)); }
  function reach(n) { var d = depthOf(Math.min(n, mini ? 16 : 40)); return twig0(n) * (1 - Math.pow(0.74, d + 1)) / 0.26; }
  var leafU = mini ? 0.13 : 0.11, x0 = -0.2, x1 = 0.2, y0 = -0.1;
  tips.forEach(function (p) { var rr = reach(p.s.nc) + leafU * 0.3; x0 = Math.min(x0, p.x - rr); x1 = Math.max(x1, p.x + rr); y0 = Math.min(y0, p.y - rr); });
  var availW = W * 0.94, availH = gy - trunkH * 0.35 - FH * 0.05, k = Math.min(availW / (x1 - x0), (availH - trunkH * 0.6) / (-y0), FH * 0.6);
  /* the crown centres on the trunk unless that would push it out of the frame */
  var oy = top[1], ox = Math.max(W * 0.03 - x0 * k, Math.min(W * 0.97 - x1 * k, cx));
  function P(p) { return [ox + p[0] * k, oy + p[1] * k]; }
  segs.forEach(function (g) {
    var lit = lightN === g.s.n, A = P(g.a), B = P(g.b);
    if (g.a[0] === 0 && g.a[1] === 0) A = [top[0] + (A[0] - ox), top[1]];
    paper(c, polyPath(branch(c, A, B, Math.max(2.5, Math.min(FH * 0.04, g.w0 * k)), Math.max(2, Math.min(FH * 0.03, g.w1 * k)), g.s.via, Math.sin(t / 1900 + g.s.n) * 0.05)), lit ? '#9a5a2a' : '#6b4426', 1 + (2 - Math.min(2, g.s.d)) * 0.3);
  });
  tips.forEach(function (p) { var q = P([p.x, p.y]); if (p.x === 0 && p.y === 0) q = [top[0], top[1]]; p.x = q[0]; p.y = q[1]; });
  /* weeds: the lookalikes that only pretend to contain the head */
  var nl = Math.min(h.nl || (h.look ? h.look.length : 0), 16);
  /* places a guide can point at; r 0 so a tap never lands on them */
  hits.push({ k: 'trunk', x: cx, y: gy - trunkH * 0.45, r: 0 });
  if (nl) hits.push({ k: 'weed', x: cx - tw * 2.6 - sc * 0.01, y: gy - sc * 0.02, r: 0 });
  for (var wv = 0; wv < nl; wv++) {
    var wx = cx + (wv % 2 ? 1 : -1) * (tw * 2.6 + (wv >> 1) * sc * 0.03 + r() * sc * 0.01), wh = sc * (0.025 + r() * 0.02);
    paper(c, function (q) { q.beginPath(); q.moveTo(wx - wh * 0.4, gy); for (var j = 0; j < 5; j++) { var jx = wx - wh * 0.4 + j * wh * 0.2; q.lineTo(jx + wh * 0.1 + Math.sin(t / 700 + wv + j) * wh * 0.08, gy - wh * (0.6 + 0.4 * Math.sin(j * 2.1 + wv))); q.lineTo(jx + wh * 0.2, gy); } q.closePath(); }, '#4a6a2a', 0.4);
    if (!mini && wv < 6) { var mxx = wx + Math.sin(t / 700 + wv) * wh * 0.1, myy = gy - wh * 1.05; paper(c, function (q) { q.beginPath(); q.ellipse(mxx, myy, wh * 0.28, wh * 0.2, 0, 0, TAU); }, '#f2e6c9', 0.3); c.fillStyle = '#1b1410'; c.beginPath(); c.arc(mxx - wh * 0.1, myy - wh * 0.02, wh * 0.045, 0, TAU); c.arc(mxx + wh * 0.1, myy - wh * 0.02, wh * 0.045, 0, TAU); c.fill(); }
  }
  /* every sense ends in a fractal: its twigs split in two until each holds one compound, so a leaf is a word */
  tips.forEach(function (p) {
    var s = p.s, n = Math.min(s.nc, mini ? 16 : 40), via = VIA[s.via] || VIA[''], lr = rnd(seed + s.n * 31);
    var ll = Math.max(mini ? 3 : 7, Math.min(FH * 0.04, k * 0.05)) * (p.lit ? 1.15 : 1), leaves = [];
    var bark = p.lit ? '#a8642a' : night ? '#4a3020' : '#6b4426';
    function frac(x, y, a, len, w, lo, hi, d) {
      if (hi - lo <= 1) { leaves.push([x, y, a, lo]); return; }
      var mid = lo + Math.ceil((hi - lo) / 2), th = 0.38 + 0.12 * Math.sin(s.n + d * 1.7) + Math.sin(t / 1100 + d + lo * 0.3) * 0.05;
      [[lo, mid, -th], [mid, hi, th]].forEach(function (g) {
        if (g[1] <= g[0]) return;
        var a2 = a + g[2] * (1 + (g[1] - g[0] === 1 ? 0.2 : 0)), x2 = x + Math.cos(a2) * len, y2 = y + Math.sin(a2) * len;
        c.strokeStyle = bark; c.lineWidth = Math.max(0.8, w); c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
        frac(x2, y2, a2, len * 0.74, w * 0.68, g[0], g[1], d + 1);
      });
    }
    c.save(); c.lineCap = 'round';
    if (n > 1) frac(p.x, p.y, p.ang, twig0(s.nc) * k, Math.max(1.2, Math.min(FH * 0.012, p.w * k * 0.6)), 0, n, 0);
    else if (n === 1) leaves.push([p.x, p.y, p.ang, 0]);
    c.restore();
    leaves.forEach(function (L2, i) {
      var sw = Math.sin(t / 900 + i * 0.7 + s.n) * 0.3, col = p.lit ? ['#f2b83a', '#e8a02a', '#f6cc5a'][i % 3] : night ? ['#2f6a3a', '#3a7a44', '#24583a'][i % 3] : ['#3f8f4a', '#5aa24e', '#2f7a46', '#7ab04e'][(i + s.n) % 4];
      var cw = s.c && s.c[L2[3]], one = !!(o.leaf && cw && cw.th === o.leaf), lsz = ll * (0.85 + lr() * 0.3);
      if (one) ONE = [L2[0], L2[1], L2[2], sw];   /* drawn last, over the badges */
      else leaf(c, L2[0], L2[1], lsz, L2[2] + sw, col, 0.5);
      if (!mini && cw) hits.push({ k: 'leaf', n: s.n, th: s.c[L2[3]].th, x: L2[0] + Math.cos(L2[2]) * ll * 0.5, y: L2[1] + Math.sin(L2[2]) * ll * 0.5, r: Math.max(9, ll * 0.7) });
    });
    if (!n) { leaf(c, p.x, p.y, ll * 0.8, -2.2 + Math.sin(t / 800 + s.n) * 0.2, '#9cc25a', 0.4); leaf(c, p.x, p.y, ll * 0.8, -0.9 - Math.sin(t / 800 + s.n) * 0.2, '#9cc25a', 0.4); }
    if (!mini) {
      var br = Math.max(11, Math.min(20, k * 0.05)) * (p.lit ? 1.2 : 1);
      paper(c, function (q) { q.beginPath(); q.arc(p.x, p.y, br, 0, TAU); }, via.col, p.lit ? 1.6 : 0.9);
      c.fillStyle = '#fffaf0'; c.font = '700 ' + Math.round(br * 1.1) + 'px "Mitr","Sarabun",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(s.n), p.x, p.y + 1);
      if (p.lit) { c.save(); c.strokeStyle = 'rgba(255,240,180,' + (0.5 + 0.4 * Math.sin(t / 300)) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, br + 5 + 2 * Math.sin(t / 300), 0, TAU); c.stroke(); c.restore(); }
      hits.push({ k: 'sense', n: s.n, x: p.x, y: p.y, r: br + 6 });
    }
  });
  /* the one leaf a word page is about: bigger, red, ringed, pushed out past its branch's badge */
  if (ONE) {
    var ol = Math.max(10, Math.min(FH * 0.045, k * 0.06)), ox2 = ONE[0] + Math.cos(ONE[2]) * ol * 1.4, oy2 = ONE[1] + Math.sin(ONE[2]) * ol * 1.4, pu = 0.5 + 0.5 * Math.sin(t / 260);
    c.save(); c.strokeStyle = '#d9342b'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ONE[0], ONE[1]); c.lineTo(ox2, oy2); c.stroke(); c.restore();
    leaf(c, ox2, oy2, ol * 2.2, ONE[2] + ONE[3] * 0.4, '#d9342b', 1.4);
    var cx2 = ox2 + Math.cos(ONE[2]) * ol * 1.1, cy2 = oy2 + Math.sin(ONE[2]) * ol * 1.1;
    c.save(); c.strokeStyle = 'rgba(255,236,170,' + (0.55 + 0.45 * pu) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(cx2, cy2, ol * (1.9 + pu * 0.4), 0, TAU); c.stroke(); c.restore();
    hits.push({ k: 'here', x: cx2, y: cy2, r: 0 });
  }
  /* the head's name on a board at the foot */
  if (!mini && o.sign !== false) {
    var fs = Math.round(Math.max(18, sc * 0.05)); c.font = '600 ' + fs + 'px "Mitr","Sarabun",sans-serif';
    var bw = c.measureText(h.th).width + fs * 1.1, bx = cx - bw / 2, by = gy + fs * 0.25;
    if (by + fs * 1.3 < FH) {
      paper(c, function (q) { q.beginPath(); q.rect(bx, by, bw, fs * 1.3); }, '#e8c890', 1);
      c.fillStyle = '#5a2a12'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(h.th, cx, by + fs * 0.68);
    }
  }
  return hits;
}

window.MDTREE = { draw: draw, VIA: VIA, layout: layout, sky: sky, hash: hash };
})();
