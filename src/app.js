/* สวนคำ · The Word Garden — 180 filed Thai heads from the wichaa lexicon, each a fractal tree.
   Routes: #/ · #/w/<slug>[/<sense>] · #/k/<thai> · #/net · #/beds · #/bed/<d> · #/seeds · #/seed/<o>
   #/grafts · #/via/<kind> · #/shapes · #/shape/<pattern> · #/weeds · #/notes[/<slug>] · #/play · #/trail */
(function () {
'use strict';
var IDX = null, HEADS = {}, BY = {}, NOTES = null, CACHE = {};
var main = document.getElementById('main'), foot = document.getElementById('foot');
var VIA = window.MDTREE.VIA;
var ORIGIN = {
  tai: ['ไทแท้', 'inherited Tai'], sanskrit: ['สันสกฤต', 'Sanskrit'], pali: ['บาลี', 'Pali'], khmer: ['เขมร', 'Khmer'],
  chinese: ['จีน', 'Chinese'], english: ['อังกฤษ', 'English'], mon: ['มอญ', 'Mon'], vietnamese: ['เวียดนาม', 'Vietnamese'],
  other: ['อื่น ๆ', 'other'], unknown: ['ไม่ทราบ', 'not recorded']
};
var USE = { 'false-split': ['คำพ้องรูป', 'lookalike'], 'spelling-variant': ['ตัวสะกดอื่น', 'other spelling'], toponym: ['ชื่อสถานที่', 'place name'],
  biological: ['ชื่อสิ่งมีชีวิต', 'living thing'], 'personal-name': ['ชื่อคน', 'personal name'] };
var FRAME = { entity: ['สิ่ง', 'a thing'], quality: ['ลักษณะ', 'a quality'], act: ['การกระทำ', 'an act'], state: ['สภาพ', 'a state'], trait: ['นิสัย', 'a trait'] };
var POS = { 'N': 'noun', 'V': 'verb', 'ADJ': 'adjective', 'PROP': 'name', 'PREP': 'preposition', 'ADV': 'adverb', 'NUM': 'number', 'CLF': 'classifier' };

/* ---------------------------------------------------------------- small things */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function enc(s) { return encodeURIComponent(s); }
function pick(a, r) { return a[Math.floor((r || Math.random)() * a.length)]; }
function rnd(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('suankham:' + k) || 'null'); localStorage.setItem('suankham:' + k, JSON.stringify(v)); } catch (e) { return null; } }
function J(u) { if (!CACHE[u]) CACHE[u] = fetch(u).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); }); return CACHE[u]; }
function head(s) { return HEADS[s] ? Promise.resolve(HEADS[s]) : J('data/heads/' + s + '.json').then(function (h) { HEADS[s] = h; return h; }); }
function dom(d) { return (IDX.domains[d] || { th: d, en: d }); }
function viaCol(v) { return (VIA[v || ''] || VIA['']).col; }
function chip(th, r, en, href, cls) { return '<a class="chip ' + (cls || '') + '" href="' + href + '"><b>' + esc(th) + '</b>' + (r ? '<i>' + esc(r) + '</i>' : '') + (en ? '<span>' + esc(en) + '</span>' : '') + '</a>'; }
function hlink(s) { var h = BY[s]; return h ? '<a class="thai-link" href="#/w/' + s + '">' + esc(h.th) + '</a>' : esc(s); }
function wordHref(th) { if (IDX.byTh[th]) return '#/w/' + IDX.byTh[th]; if (IDX.words[th]) return '#/k/' + enc(th); return null; }
function thLink(th) { var h = wordHref(th); return h ? '<a class="thai-link" href="' + h + '">' + esc(th) + '</a>' : esc(th); }
function linkifyThai(text) { return esc(text).replace(/[฀-๿]+/g, function (w) { return wordHref(w) ? thLink(w) : w; }); }
function md(text) {
  if (/^\|/.test(text) || /^ {4}/m.test(text)) return '<pre>' + linkifyThai(text) + '</pre>';
  return '<p>' + linkifyThai(text).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, ' ') + '</p>';
}
function section(title, sub, mark) { return '<h2>' + (mark ? '<canvas data-mark="' + mark + '"></canvas>' : '') + '<span>' + title + (sub ? ' <small>' + sub + '</small>' : '') + '</span></h2>'; }

/* ---------------------------------------------------------------- the pictures: one loop draws what is on screen */
var PICS = [], seen = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._vis = e.isIntersecting; }); }) : null;
function pic(cv, draw) {
  cv._draw = draw; cv._vis = !seen; if (seen) seen.observe(cv);
  PICS.push(cv); return cv;
}
function sizeOf(cv) {
  var dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth || cv.width, h = cv.clientHeight || cv.height;
  if (cv._w !== w || cv._h !== h || cv._dpr !== dpr) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv._w = w; cv._h = h; cv._dpr = dpr; }
  return [w, h, dpr];
}
var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(t) {
  PICS = PICS.filter(function (cv) { return cv.isConnected; });
  PICS.forEach(function (cv) {
    if (!cv._vis || (still && cv._done)) return;
    var s = sizeOf(cv), c = cv.getContext('2d');
    c.setTransform(s[2], 0, 0, s[2], 0, 0); c.clearRect(0, 0, s[0], s[1]);
    try { cv._hits = cv._draw(c, s[0], s[1], t) || cv._hits; } catch (e) { if (!cv._err) { cv._err = 1; console.error(e); } }
    cv._done = 1;
  });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
function markDraw(key) {
  return function (c, W, H, t) {
    var s = Math.min(W, H) * 0.42, ok = false;
    if (window.MDKHAMMARKS) ok = MDKHAMMARKS.draw(key, c, W / 2, H / 2, s, t);
    if (!ok && window.MDKHAMHEADS) ok = MDKHAMHEADS.draw(key, c, W / 2, H / 2, s, t);
    if (!ok) { c.fillStyle = '#d99a22'; c.beginPath(); c.arc(W / 2, H / 2, s * 0.7, 0, 6.283); c.fill(); }
  };
}
function headDraw(h) {
  return function (c, W, H, t) {
    var s = Math.min(W, H) * 0.42;
    if (window.MDKHAMHEADS && MDKHAMHEADS.draw(h.s, c, W / 2, H / 2, s, t)) return;
    var d = (h.d && h.d[0]) || 'd:plant';
    if (window.MDKHAMMARKS && MDKHAMMARKS.draw(d, c, W / 2, H / 2, s, t)) return;
    markDraw('x:garden')(c, W, H, t);
  };
}
function hasPic(s) { return !!(window.MDKHAMHEADS && MDKHAMHEADS.keys && MDKHAMHEADS.keys.indexOf(s) >= 0); }
function wire(root) {
  (root || document).querySelectorAll('canvas[data-mark]').forEach(function (cv) { if (!cv._draw) pic(cv, markDraw(cv.getAttribute('data-mark'))); });
  (root || document).querySelectorAll('canvas[data-head]').forEach(function (cv) { if (!cv._draw) pic(cv, headDraw(BY[cv.getAttribute('data-head')] || { s: cv.getAttribute('data-head') })); });
  (root || document).querySelectorAll('canvas[data-tree]').forEach(function (cv) { if (!cv._draw) { var h = BY[cv.getAttribute('data-tree')]; pic(cv, function (c, W, H, t) { return MDTREE.draw(c, W, H, t, h, { mini: true }); }); } });
}
/* a tap on a canvas finds the nearest hit within its radius */
function hitAt(cv, ev) {
  var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = null, bd = 1e9;
  (cv._hits || []).forEach(function (h) { var d = Math.hypot(h.x - x, h.y - y); if (d < h.r && d < bd) { bd = d; best = h; } });
  return best;
}

/* ---------------------------------------------------------------- trail */
function trail() { return store('trail') || []; }
function step(href, label) {
  var t = trail().filter(function (x) { return x[0] !== href; }); t.push([href, label]); if (t.length > 60) t = t.slice(-60); store('trail', t); drawFoot();
}
function drawFoot() {
  var t = trail().slice(-12);
  foot.innerHTML = (t.length ? '<div class="trail" aria-label="รอยเท้า trail">' + t.map(function (x) { return '<a href="' + x[0] + '">' + esc(x[1]) + '</a>'; }).join('') + '</div>' : '') +
    '<p>' + IDX.counts.heads + ' คำ · ' + IDX.counts.senses + ' ความหมาย · ' + IDX.counts.compounds + ' คำประสม — from the wichaa lexicon (manuscript-wiki), its filing tables and the compound filer\'s notebook. Thai glosses: the Royal Institute dictionary and Wiktionary, as the lexicon records them. English the lexicon lacked was written for this garden: 4,584 glosses by DeepSeek V4 Flash, 135 by Claude. Roots: the lexicon\'s etymologies and the ThaiRoots inventory. Pictures: the motdang doodler.</p>';
}

/* ---------------------------------------------------------------- search */
function fold(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s\-·.,;]+/g, ''); }
var q = document.getElementById('q'), hitsEl = document.getElementById('hits'), hitSel = 0;
function search(v) {
  var f = fold(v), th = /[฀-๿]/.test(v), out = [];
  if (!f) return out;
  IDX.heads.forEach(function (h) {
    var sc = th ? (h.th === v ? 100 : h.th.indexOf(v) === 0 ? 60 : h.th.indexOf(v) >= 0 ? 30 : 0)
      : (fold(h.r) === f ? 90 : fold(h.r).indexOf(f) === 0 ? 50 : 0) + (fold(h.en).indexOf(f) >= 0 ? 40 : 0) + (fold(h.p) === f ? 60 : 0);
    if (sc) out.push([sc + 5, h.th, h.r, h.en, '#/w/' + h.s]);
  });
  IDX.compounds.forEach(function (c) {
    var sc = th ? (c[0] === v ? 80 : c[0].indexOf(v) === 0 ? 40 : c[0].indexOf(v) >= 0 ? 18 : 0)
      : (fold(c[1]) === f ? 70 : fold(c[1]).indexOf(f) === 0 ? 30 : 0) + (fold(c[2]).indexOf(f) >= 0 ? (fold(c[2]) === f ? 50 : 20) : 0);
    if (sc) out.push([sc, c[0], c[1], c[2], '#/k/' + enc(c[0])]);
  });
  var seenK = {};
  return out.sort(function (a, b) { return b[0] - a[0] || a[1].length - b[1].length; }).filter(function (x) { if (seenK[x[4]]) return false; seenK[x[4]] = 1; return true; }).slice(0, 30);
}
q.addEventListener('input', function () {
  var r = search(q.value.trim()); hitSel = 0;
  hitsEl.hidden = !r.length;
  hitsEl.innerHTML = r.map(function (x, i) { return '<a href="' + x[4] + '"' + (i ? '' : ' class="on"') + '><span class="t">' + esc(x[1]) + '</span><span class="r">' + esc(x[2]) + '</span><span class="e">' + esc(x[3]) + '</span></a>'; }).join('');
});
q.addEventListener('keydown', function (e) {
  var as = hitsEl.querySelectorAll('a'); if (!as.length) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); as[hitSel].classList.remove('on'); hitSel = (hitSel + (e.key === 'ArrowDown' ? 1 : as.length - 1)) % as.length; as[hitSel].classList.add('on'); }
  if (e.key === 'Enter') { e.preventDefault(); location.hash = as[hitSel].getAttribute('href'); }
  if (e.key === 'Escape') { hitsEl.hidden = true; }
});
hitsEl.addEventListener('click', function () { hitsEl.hidden = true; q.value = ''; q.blur(); });
document.addEventListener('click', function (e) { if (!e.target.closest('.find')) hitsEl.hidden = true; });

/* ---------------------------------------------------------------- speech: the phone's own Thai voice, where it has one */
function thaiVoice() { if (!window.speechSynthesis) return null; var v = speechSynthesis.getVoices().filter(function (x) { return /^th/i.test(x.lang); }); return v[0] || null; }
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = function () { document.querySelectorAll('.speak[data-say]').forEach(function (b) { b.hidden = !(window.SKAndroid || thaiVoice()); }); };
function speak(th) { if (window.SKAndroid) { try { SKAndroid.speak(th); } catch (e) { } return; } var v = thaiVoice(); if (!v) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(th); u.voice = v; u.lang = v.lang; u.rate = 0.8; speechSynthesis.speak(u); }
document.addEventListener('click', function (e) { var b = e.target.closest('.speak'); if (b) speak(b.getAttribute('data-say')); });
function speakBtn(th) { return '<button class="speak" data-say="' + esc(th) + '"' + (window.SKAndroid || thaiVoice() ? '' : ' hidden') + '><canvas data-mark="x:speak"></canvas>ฟัง · hear it</button>'; }

/* ---------------------------------------------------------------- wander */
var here = { kind: 'home' };
document.getElementById('wander').addEventListener('click', function () {
  var go = null;
  if (here.kind === 'head' && HEADS[here.s]) {
    var h = HEADS[here.s], opts = [];
    h.senses.forEach(function (sn) { sn.c.forEach(function (c) { opts.push('#/k/' + enc(c.th)); }); });
    IDX.edges.forEach(function (e) { if (e[0] === here.s) opts.push('#/w/' + e[1]); if (e[1] === here.s) opts.push('#/w/' + e[0]); });
    go = opts.length ? pick(opts) : null;
  } else if (here.kind === 'word' && here.w) {
    var w = IDX.words[here.w] || {}, o2 = [];
    (w.a || []).forEach(function (a) { o2.push('#/w/' + a[0]); });
    (here.parts || []).forEach(function (p) { var hr = wordHref(p); if (hr) o2.push(hr); });
    (w.i || []).forEach(function (i) { o2.push('#/k/' + enc(i[0])); });
    go = o2.length ? pick(o2) : null;
  }
  location.hash = go || '#/w/' + pick(IDX.heads).s;
});

/* ---------------------------------------------------------------- pages */
function setTab(t) { document.querySelectorAll('#tabs a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-t') === t); }); }
function put(html, tab) { main.innerHTML = html; setTab(tab); wire(main); window.scrollTo(0, 0); }

function todays() { var d = new Date(), k = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); var big = IDX.heads.filter(function (h) { return h.nc >= 15; }); return big[rnd(k)() * big.length | 0]; }

function pageHome() {
  var h = todays(), byDom = {};
  IDX.heads.forEach(function (x) { var d = x.d[0] || 'd:plant'; (byDom[d] = byDom[d] || []).push(x); });
  var doms = Object.keys(byDom).sort(function (a, b) { return byDom[b].length - byDom[a].length; });
  put(
    '<section class="hero-home">' +
      '<div class="stage"><canvas id="today"></canvas><div class="tag">ต้นไม้วันนี้ · today\'s tree<b>' + esc(h.th) + '</b>' + esc(h.r) + ' · ' + esc(h.en) + '</div></div>' +
      '<div class="intro card"><h1>สวนคำ<small>The Word Garden</small></h1>' +
        '<p>' + IDX.counts.heads + ' Thai words, each grown as a fractal tree. A <b>branch</b> is one sense. It grows out of the sense it came from. A <b>leaf</b> is one compound word filed under that sense. A <b>weed</b> at the foot is a word that only looks like it contains the head.</p>' +
        '<p class="muted">คำไทย ' + IDX.counts.heads + ' คำ ปลูกเป็นต้นไม้ กิ่งคือความหมาย ใบคือคำประสม วัชพืชคือคำที่หน้าตาเหมือนแต่ไม่ใช่</p>' +
        '<div class="stats"><div><span class="num">' + IDX.counts.senses + '</span><small>กิ่ง · senses</small></div><div><span class="num">' + IDX.counts.compounds + '</span><small>ใบ · compounds</small></div><div><span class="num">' + IDX.counts.lookalikes + '</span><small>วัชพืช · lookalikes</small></div><div><span class="num">' + IDX.edges.length + '</span><small>กิ่งทาบ · links</small></div></div>' +
        '<div class="legend">' + Object.keys(VIA).map(function (k) { return '<span><i style="background:' + VIA[k].col + '"></i>' + VIA[k].th + ' ' + VIA[k].en + '</span>'; }).join('') + '</div>' +
      '</div>' +
    '</section>' +
    section('แปลงในสวน', 'the beds, by what the words are about', 'x:garden') +
    '<div class="beds">' + doms.map(function (d) {
      var hs = byDom[d].sort(function (a, b) { return b.nc - a.nc; });
      return '<div class="bed"><a href="#/bed/' + enc(d) + '"><header><canvas data-mark="' + d + '"></canvas><div><b>' + esc(dom(d).th) + '</b><span>' + esc(dom(d).en) + ' · ' + hs.length + '</span></div></header></a><canvas class="plot" data-bed="' + d + '"></canvas></div>';
    }).join('') + '</div>', 'home');
  var cv = document.getElementById('today');
  pic(cv, function (c, W, H, t) { return MDTREE.draw(c, W, H, t, h, { sky: true, sign: false }); });
  cv.addEventListener('click', function () { location.hash = '#/w/' + h.s; });
  main.querySelectorAll('canvas.plot').forEach(function (p) { plot(p, byDom[p.getAttribute('data-bed')].slice(0, 9)); });
}

/* a row of small trees; a tap opens the one under the finger */
function plot(cv, hs) {
  pic(cv, function (c, W, H, t) {
    var n = hs.length, w = W / Math.max(n, 4), hits = [];
    c.fillStyle = '#e6d6b0'; c.fillRect(0, H * 0.82, W, H);
    hs.forEach(function (h, i) {
      var x = (i + 0.5) * w - w / 2;
      c.save(); c.translate(x, 0); c.beginPath(); c.rect(0, 0, w, H); c.clip();
      MDTREE.draw(c, w, H * 0.86, t + i * 500, h, { mini: true }); c.restore();
      c.fillStyle = '#3a2a18'; c.font = '500 ' + Math.round(Math.min(18, w * 0.28)) + 'px Mitr, sans-serif'; c.textAlign = 'center'; c.fillText(h.th, x + w / 2, H - 6);
      hits.push({ x: x + w / 2, y: H / 2, r: w / 1.6, s: h.s });
    });
    return hits;
  });
  cv.addEventListener('click', function (e) { var h = hitAt(cv, e); if (h) location.hash = '#/w/' + h.s; });
}

function pageHead(s, hiN) {
  var x = BY[s]; if (!x) return pageMissing();
  here = { kind: 'head', s: s };
  head(s).then(function (h) {
    step('#/w/' + s, h.th);
    var inside = ((IDX.words[h.th] || {}).i || []).filter(function (i) { return i[1] !== s; });
    var grafts = IDX.edges.filter(function (e) { return e[0] === s || e[1] === s; });
    var bySense = {}; h.senses.forEach(function (sn) { bySense[sn.n] = sn; });
    function chain(sn) { var p = [], guard = 0, cur = sn; while (cur && guard++ < 12) { p.unshift(cur.n); cur = cur.ext != null ? bySense[cur.ext] : null; if (cur && p.indexOf(cur.n) >= 0) break; } return p; }
    put(
      '<section class="word-top">' +
        '<div class="tree-stage' + (rootsHave(h) ? ' roots' : '') + '"><canvas class="tree" id="tree"></canvas><div class="hint">ใบหนึ่ง = คำหนึ่ง · one leaf, one word</div>' +
          '<div class="badge"><canvas data-head="' + s + '"></canvas></div><div class="peek" id="peek"></div></div>' +
        '<div class="word-id card"><p class="th">' + esc(h.th) + '</p>' +
          '<div class="say"><span class="rtgs">' + esc(h.r) + '</span><span class="pb">' + esc(h.p) + '</span><span class="ipa">' + esc(h.ipa) + '</span></div>' +
          (h.resp ? '<div class="muted">อ่านว่า ' + esc(h.resp) + '</div>' : '') +
          (h.en ? '<div class="en">' + esc(h.en) + '</div>' : '') + speakBtn(h.th) +
          '<div class="stats"><div><span class="num">' + h.senses.length + '</span><small>กิ่ง · senses</small></div><div><span class="num">' + x.nc + '</span><small>ใบ · compounds</small></div><div><span class="num">' + h.look.length + '</span><small>วัชพืช · weeds</small></div></div>' +
          '<div class="chips" style="margin-top:8px"><a class="pill" href="#/seed/' + h.o + '"><canvas data-mark="o:' + h.o + '"></canvas>' + ORIGIN[h.o][0] + ' · ' + ORIGIN[h.o][1] + '</a>' +
          h.d.map(function (d) { return '<a class="pill" href="#/bed/' + enc(d) + '"><canvas data-mark="' + d + '"></canvas>' + esc(dom(d).th) + ' · ' + esc(dom(d).en) + '</a>'; }).join('') + '</div>' +
          (h.ety ? '<p class="muted" style="font-size:15px;margin-top:10px">' + linkifyThai(h.ety.slice(0, 260)) + (h.ety.length > 260 ? '…' : '') + '</p>' : '') +
        '</div>' +
      '</section>' +
      (h.rule ? '<div class="card rule" style="margin-top:16px"><h3>กฎของผู้จัด · how the filer divided it' + (h.filed ? ' · ' + h.filed : '') + '</h3><p>' + linkifyThai(h.rule) + '</p></div>' : '') +
      rootsHtml(h) +
      section('กิ่ง', 'senses, and the leaves on each', 'v:metaphor') +
      '<div class="senses">' + h.senses.map(function (sn) {
        var p = chain(sn), par = sn.ext != null ? bySense[sn.ext] : null;
        return '<article class="sense" id="s' + sn.n + '" style="--c:' + viaCol(sn.via) + '"><div class="hd"><div class="n">' + sn.n + '</div><div>' +
          '<div class="en">' + esc(sn.en || '—') + '</div><div class="gth">' + esc(sn.th) + '</div>' +
          (sn.pos ? '<div class="path">' + esc(sn.posth || '') + ' · ' + esc(sn.pos) + (p.length > 1 ? ' · ' + p.join(' → ') : '') + '</div>' : '') + '</div></div>' +
          (par ? '<div class="grew">' + VIA[sn.via || ''].th + ' · <a href="#/via/' + (sn.via || '') + '">' + VIA[sn.via || ''].en + '</a> from <a href="#/w/' + s + '/' + par.n + '">sense ' + par.n + '</a>' + (par.en ? ' (' + esc(par.en) + ')' : '') + (sn.vn ? ': ' + esc(sn.vn) : '') + '</div>' : '') +
          (sn.c.length ? '<div class="chips">' + sn.c.map(function (c) { return chip(c.th, c.r, c.en, '#/k/' + enc(c.th), 'sm'); }).join('') + '</div>' : '<div class="muted" style="margin-top:6px">ยังไม่มีใบ · no compound filed here</div>') +
          '</article>';
      }).join('') + '</div>' +
      (inside.length ? section('อยู่ในต้นอื่น', 'this word inside compounds of other trees', 'x:net') + '<div class="chips">' + inside.slice(0, 60).map(function (i) { return chip(i[0], BY[i[1]] ? BY[i[1]].th + ' ' + i[2] : '', '', '#/k/' + enc(i[0]), 'sm'); }).join('') + '</div>' : '') +
      (grafts.length ? section('กิ่งทาบ', 'trees joined to this one by a shared word', 'x:net') + '<div class="chips">' + grafts.map(function (e) { var o = e[0] === s ? e[1] : e[0]; return '<a class="chip" href="#/w/' + o + '"><b>' + esc(BY[o].th) + '</b><i>' + esc(BY[o].r) + '</i><span>' + e[3].map(esc).join(' · ') + '</span></a>'; }).join('') + '</div>' : '') +
      (h.look.length ? section('วัชพืช', 'they look like ' + esc(h.th) + ' but are something else', 'x:mask') + '<div class="grid">' + h.look.map(function (l) { return '<div class="card"><b style="font:500 24px var(--th)">' + esc(l.th) + '</b> <span class="muted">' + esc(l.r) + '</span><div class="muted" style="font-size:14px">' + (USE[l.use] || [l.use, l.use]).join(' · ') + '</div><div style="font-size:15px">' + linkifyThai(l.note) + '</div></div>'; }).join('') + '</div>' : '') +
      (h.left.length ? section('เมล็ดที่ยังไม่ปลูก', 'left unfiled: no sense of ' + esc(h.th) + ' fits them', 'd:plant') + '<div class="chips">' + h.left.map(function (l) { return '<span class="chip sm"><b>' + esc(l.th) + '</b><i>' + esc(l.r) + '</i><span>' + esc(l.gth.slice(0, 60)) + '</span></span>'; }).join('') + '</div>' : '') +
      (h.notes.length ? section('สมุดของผู้จัด', 'the compound filer\'s notebook on ' + esc(h.th), 'x:notebook') + '<div class="card notes">' + h.notes.map(function (n) { return '<div class="note"><div class="d">' + esc(n.date) + ' · ' + esc(n.h3 || n.h2) + '</div>' + md(n.text) + '</div>'; }).join('') + '</div>' : '') +
      (h.mentions.length ? '<p class="muted" style="margin-top:14px">ในสมุดหน้าเดียวกัน · on the same notebook pages: ' + h.mentions.map(hlink).join(' · ') + '</p>' : ''),
      ''
    );
    var cv = document.getElementById('tree'), peek = document.getElementById('peek'), lit = hiN != null ? +hiN : null;
    pic(cv, function (c, W, H, t) { return MDTREE.draw(c, W, H, t, h, { sky: true, hi: lit, roots: rootsHave(h) }); });
    function light(n, scroll) {
      lit = n; main.querySelectorAll('.sense').forEach(function (a) { a.classList.toggle('lit', a.id === 's' + n); });
      if (scroll) { var a = document.getElementById('s' + n); if (a) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
    if (lit != null) setTimeout(function () { light(lit, true); }, 60);
    cv.addEventListener('click', function (e) {
      var hit = hitAt(cv, e); if (!hit) { peek.classList.remove('on'); return; }
      if (hit.k === 'sense') { light(hit.n, true); peek.classList.remove('on'); return; }
      if (hit.k === 'root' || hit.k === 'word') {
        var hr = hit.th ? wordHref(hit.th) : null;
        peek.innerHTML = (hr ? '<a href="' + hr + '" style="text-decoration:none">' : '<div>') + '<div style="font-size:18px">' + esc(hit.say) + '</div>' + (hr ? '<div class="muted" style="font-size:13px">แตะเพื่อเปิด · tap to open</div></a>' : '</div>');
        peek.classList.add('on'); return;
      }
      var c = null; h.senses.forEach(function (sn) { sn.c.forEach(function (x) { if (x.th === hit.th) c = x; }); });
      light(hit.n, false);
      peek.innerHTML = '<a href="#/k/' + enc(hit.th) + '" style="text-decoration:none"><b>' + esc(hit.th) + '</b> <span class="muted">' + esc(c ? c.r : '') + '</span><div>' + esc(c ? c.en || c.gth.slice(0, 80) : '') + '</div><div class="muted" style="font-size:13px">แตะเพื่อเปิด · tap to open</div></a>';
      peek.classList.add('on');
    });
  }).catch(pageMissing);
}

function rootsHave(h) { var R = h.roots || {}; return !!((R.from || []).length || (R.cog || []).length || (R.tr || []).length); }
function rootsHtml(h) {
  if (!rootsHave(h)) return '';
  var R = h.roots;
  function row(g) { return '<span class="f">' + esc(g[2]) + '</span><span>' + (g[3] ? esc(g[3]) + ' · ' : '') + esc(g[1] || g[0]) + ' <span class="muted">' + esc(g[0]) + '</span>' + (g[4] ? ' “' + esc(g[4]) + '”' : '') + '</span>'; }
  return section('ราก', 'roots: where ' + esc(h.th) + ' comes from, its cousins, and its ThaiRoots family', 'd:plant') +
    '<div class="roots-list">' +
      ((R.from || []).length ? '<div class="card"><h3>รากแก้ว · taproot, newest to oldest</h3><div class="cog">' + R.from.map(function (g) { return row(g.slice(0, 5)); }).join('') + '</div>' + ((R.cf || []).length ? '<h3 style="margin-top:10px">เทียบ · compare</h3><div class="cog">' + R.cf.map(row).join('') + '</div>' : '') + '</div>' : '') +
      ((R.cog || []).length ? '<div class="card"><h3>รากแขนง · cognates in sister languages</h3><div class="cog">' + R.cog.map(row).join('') + '</div></div>' : '') +
      (R.tr || []).map(function (f) {
        return '<div class="card tr-knot"><h3>ThaiRoots ' + esc(f.id) + (f.rel === 'root' ? ' · this word is the root' : ' · grown from this root') + '</h3><div style="font:600 30px var(--th);color:var(--red)">' + esc(f.root) + '</div><div>' + esc(f.gloss) + (f.gth ? ' · ' + esc(f.gth) : '') + (f.pali ? ' · Pali ' + esc(f.pali) : '') + '</div>' +
          (f.note ? '<p>' + linkifyThai(f.note) + '</p>' : '') + (f.noteT ? '<p class="muted">' + linkifyThai(f.noteT) + '</p>' : '') +
          '<div class="chips">' + f.der.slice(0, 30).map(function (d) { var hr = wordHref(d[0]); return hr ? chip(d[0], d[1], d[2], hr, 'sm') : '<span class="chip sm"><b>' + esc(d[0]) + '</b><i>' + esc(d[1]) + '</i><span>' + esc(d[2]) + '</span></span>'; }).join('') + '</div></div>';
      }).join('') +
    '</div>';
}
function pageWord(th) {
  var w = IDX.words[th]; if (!w) return pageMissing();
  if (IDX.byTh[th]) { location.replace('#/w/' + IDX.byTh[th]); return; }
  var at = (w.a || []).filter(function (a) { return a[1] > 0; }), weed = (w.a || []).filter(function (a) { return a[1] === 0; });
  var first = at[0] || weed[0] || null;
  if (!first) {   /* a part only: a word that appears inside compounds but is not filed as one */
    step('#/k/' + enc(th), th); here = { kind: 'word', w: th, parts: [] };
    put('<div class="card"><p class="th" style="font:500 60px var(--th);color:var(--red);margin:0">' + esc(th) + '</p>' + speakBtn(th) + '</div>' +
      section('อยู่ในคำเหล่านี้', 'built into these compounds', 'x:net') + '<div class="chips">' + (w.i || []).map(function (i) { return chip(i[0], BY[i[1]].th + ' ' + i[2], '', '#/k/' + enc(i[0]), 'sm'); }).join('') + '</div>', '');
    return;
  }
  head(first[0]).then(function (h) {
    var sn = null, c = null, look = null;
    h.senses.forEach(function (s) { s.c.forEach(function (x) { if (x.th === th && !c) { c = x; sn = s; } }); });
    if (!c) h.look.forEach(function (l) { if (l.th === th) look = l; });
    step('#/k/' + enc(th), th);
    here = { kind: 'word', w: th, parts: c ? c.parts : [] };
    if (look) {
      put('<div class="k-top"><div class="k-pic"><canvas data-mark="x:mask" style="height:260px"></canvas></div><div class="card"><p style="font:500 64px var(--th);color:var(--red);margin:0">' + esc(th) + '</p><div class="rtgs" style="font-size:24px;font-weight:600">' + esc(look.r) + '</div>' + speakBtn(th) +
        '<p><b>' + (USE[look.use] || [look.use, look.use]).join(' · ') + '</b> — it looks like a compound of ' + hlink(h.s) + ', and it is not.</p><p>' + linkifyThai(look.note) + '</p>' + (look.gth ? '<p class="muted">' + esc(look.gth) + '</p>' : '') + '</div></div>', 'weeds');
      return;
    }
    var others = (c.parts || []).filter(function (p) { return p !== h.th; });
    var kin = [];
    others.forEach(function (p) { ((IDX.words[p] || {}).i || []).forEach(function (i) { if (i[0] !== th) kin.push(i); }); });
    var sibs = sn.c.filter(function (x) { return x.th !== th; });
    put(
      '<div class="k-top">' +
        '<div class="k-pic"><canvas id="ktree"></canvas></div>' +
        '<div class="card"><p style="font:500 64px/1.1 var(--th);color:var(--red);margin:0;word-break:break-word">' + esc(th) + '</p>' +
          '<div class="say" style="display:flex;gap:12px;flex-wrap:wrap;align-items:baseline"><span style="font:600 24px var(--body)">' + esc(c.r) + '</span><span class="muted">' + esc(c.ipa) + '</span></div>' +
          (c.en ? '<div style="font-size:22px;margin:6px 0">' + esc(c.en) + '</div>' : '') + speakBtn(th) +
          (c.parts && c.parts.length ? '<div class="equation">' + c.parts.map(function (p, i) { return (i ? '<span class="op">+</span>' : '') + (wordHref(p) ? chip(p, BY[IDX.byTh[p]] ? BY[IDX.byTh[p]].r : '', '', wordHref(p)) : '<span class="chip"><b>' + esc(p) + '</b></span>'); }).join('') + '<span class="op">=</span><span class="chip"><b>' + esc(th) + '</b></span></div>' : '') +
          (c.lit ? '<p>ตามตัว · literally: <b>' + esc(c.lit) + '</b></p>' : '') +
          '<p class="muted">' + esc(c.gth) + '</p>' +
          '<div class="chips">' +
            '<a class="pill" href="#/w/' + h.s + '/' + sn.n + '" style="padding-left:12px"><b style="color:' + viaCol(sn.via) + '">●</b> ' + esc(h.th) + ' กิ่ง ' + sn.n + (sn.en ? ' · ' + esc(sn.en) : '') + '</a>' +
            (c.pat ? '<a class="pill" href="#/shape/' + enc(c.pat) + '" style="padding-left:12px">' + esc(c.pat) + '</a>' : '') +
            (c.fr && FRAME[c.fr] ? '<a class="pill" href="#/shape/' + enc(c.pat || 'N+N') + '" style="padding-left:12px">' + FRAME[c.fr].join(' · ') + '</a>' : '') +
            (c.x || []).map(function (x) { return IDX.byTh[x] ? '<a class="pill" href="#/w/' + IDX.byTh[x] + '" style="padding-left:12px">also on ' + esc(x) + '</a>' : ''; }).join('') +
          '</div>' +
        '</div>' +
      '</div>' +
      (sibs.length ? section('ใบบนกิ่งเดียวกัน', 'on the same branch: ' + esc(h.th) + ' sense ' + sn.n, 'd:plant') + '<div class="chips">' + sibs.map(function (x) { return chip(x.th, x.r, x.en, '#/k/' + enc(x.th), 'sm'); }).join('') + '</div>' : '') +
      (kin.length ? section('ญาติทางคำ', 'other words built from ' + others.map(esc).join(' + '), 'd:kinship') + '<div class="chips">' + kin.slice(0, 60).map(function (i) { return chip(i[0], BY[i[1]].th + ' ' + i[2], '', '#/k/' + enc(i[0]), 'sm'); }).join('') + '</div>' : '') +
      ((w.a || []).length > 1 ? '<p class="muted" style="margin-top:14px">also filed on: ' + w.a.filter(function (a) { return a[0] !== h.s && a[1] >= 0; }).map(function (a) { return hlink(a[0]); }).join(' · ') + '</p>' : ''),
      ''
    );
    var cv = document.getElementById('ktree');
    pic(cv, function (cc, W, H, t) { return MDTREE.draw(cc, W, H, t, h, { sky: true, hi: sn.n, sign: true }); });
    cv.addEventListener('click', function () { location.hash = '#/w/' + h.s + '/' + sn.n; });
  }).catch(pageMissing);
}

/* the net: every tree a knot, every shared compound a thread */
var NET = null;
function netLayout() {
  if (NET) return NET;
  var nodes = IDX.heads.map(function (h, i) { var a = i * 2.39996, r = 20 * Math.sqrt(i); return { s: h.s, h: h, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, deg: 0 }; });
  var at = {}; nodes.forEach(function (n, i) { at[n.s] = i; });
  var E = IDX.edges.map(function (e) { nodes[at[e[0]]].deg++; nodes[at[e[1]]].deg++; return [at[e[0]], at[e[1]], e[2]]; });
  for (var it = 0; it < 320; it++) {
    var cool = 1 - it / 320;
    for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
      var a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01, f = 900 / d2;
      a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
    }
    E.forEach(function (e) { var a = nodes[e[0]], b = nodes[e[1]], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, f = (d - 60) * 0.02; a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f; });
    nodes.forEach(function (n) { n.vx -= n.x * 0.004; n.vy -= n.y * 0.004; var v = Math.sqrt(n.vx * n.vx + n.vy * n.vy), m = 12 * cool + 0.5; if (v > m) { n.vx *= m / v; n.vy *= m / v; } n.x += n.vx; n.y += n.vy; n.vx *= 0.5; n.vy *= 0.5; });
  }
  var R = 1; nodes.forEach(function (n) { R = Math.max(R, Math.abs(n.x), Math.abs(n.y)); });
  NET = { nodes: nodes, E: E, at: at, R: R }; return NET;
}
var DCOL = ['#9a2a1f', '#24507a', '#2f7a46', '#c8642a', '#7a3a6e', '#b08a1a', '#1f6a6a', '#b04870', '#5a6a2a', '#6b4426'];
function pageNet() {
  put('<div class="net-tools" id="nt"></div><div class="net-stage" id="ns"><canvas id="net"></canvas></div><p class="muted">ปมหนึ่งคือต้นไม้หนึ่งต้น เส้นคือคำที่สองต้นใช้ร่วมกัน · a knot is a tree; a thread is a compound two trees share. Drag to move, pinch or wheel to zoom, tap a knot.</p>', 'net');
  var N = netLayout(), cv = document.getElementById('net'), view = { x: 0, y: 0, k: 1.3 }, sel = null, domList = Object.keys(IDX.domains), dsel = null;
  var tools = document.getElementById('nt');
  tools.innerHTML = '<button data-d="" class="on">ทั้งหมด · all</button>' + domList.filter(function (d) { return IDX.heads.some(function (h) { return h.d[0] === d; }); }).map(function (d) { return '<button data-d="' + d + '">' + esc(dom(d).th) + '</button>'; }).join('');
  tools.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; dsel = b.getAttribute('data-d') || null; tools.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); });
  function col(h) { var i = domList.indexOf(h.d[0]); return DCOL[(i < 0 ? 9 : i) % DCOL.length]; }
  pic(cv, function (c, W, H, t) {
    var k = view.k * Math.min(W, H) / (N.R * 2.2), ox = W / 2 + view.x, oy = H / 2 + view.y, hits = [];
    c.fillStyle = getComputedStyle(document.body).getPropertyValue('--card') || '#fffaf0'; c.fillRect(0, 0, W, H);
    N.E.forEach(function (e) {
      var a = N.nodes[e[0]], b = N.nodes[e[1]], on = sel != null && (e[0] === sel || e[1] === sel);
      var dim = dsel && a.h.d[0] !== dsel && b.h.d[0] !== dsel;
      c.strokeStyle = on ? '#d99a22' : dim ? 'rgba(120,100,80,.08)' : 'rgba(120,90,60,.28)'; c.lineWidth = on ? 3 : Math.min(3, e[2]);
      c.beginPath(); c.moveTo(ox + a.x * k, oy + a.y * k);
      var mx = (a.x + b.x) / 2 * k + ox + Math.sin(t / 1500 + e[0]) * 4, my = (a.y + b.y) / 2 * k + oy;
      c.quadraticCurveTo(mx, my, ox + b.x * k, oy + b.y * k); c.stroke();
    });
    N.nodes.forEach(function (n, i) {
      var x = ox + n.x * k, y = oy + n.y * k, r = (4 + Math.sqrt(n.h.nc) * 1.3) * Math.max(0.7, Math.min(1.8, view.k)), dim = dsel && n.h.d[0] !== dsel;
      if (x < -40 || y < -40 || x > W + 40 || y > H + 40) return;
      var glint = 0.5 + 0.5 * Math.sin(t / 700 + i);
      c.globalAlpha = dim ? 0.18 : 1;
      MDSKY.paper(c, function (q) { q.beginPath(); q.arc(x, y, r, 0, 6.283); }, i === sel ? '#d99a22' : col(n.h), 0.6);
      c.fillStyle = 'rgba(255,250,230,' + (0.25 + glint * 0.35) + ')'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.28, 0, 6.283); c.fill();
      if (view.k > 1.6 || n.h.nc > 45 || i === sel || (sel != null && N.E.some(function (e) { return (e[0] === sel && e[1] === i) || (e[1] === sel && e[0] === i); }))) { c.fillStyle = getComputedStyle(document.body).getPropertyValue('--ink') || '#23180f'; c.font = '500 ' + Math.round(13 + Math.min(6, view.k * 3)) + 'px Mitr, sans-serif'; c.textAlign = 'center'; c.fillText(n.h.th, x, y + r + 15); }
      c.globalAlpha = 1;
      hits.push({ x: x, y: y, r: Math.max(14, r + 4), i: i });
    });
    return hits;
  });
  /* hands: drag, wheel, pinch, tap */
  var pts = {}, last = null, moved = 0;
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; moved = 0; });
  cv.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return; var ids = Object.keys(pts), p = pts[e.pointerId];
    if (ids.length === 1) { view.x += e.clientX - p[0]; view.y += e.clientY - p[1]; moved += Math.abs(e.clientX - p[0]) + Math.abs(e.clientY - p[1]); }
    else if (ids.length === 2) { var o = pts[ids[0] == e.pointerId ? ids[1] : ids[0]], d0 = Math.hypot(p[0] - o[0], p[1] - o[1]), d1 = Math.hypot(e.clientX - o[0], e.clientY - o[1]); if (d0 > 0) view.k = Math.max(0.3, Math.min(5, view.k * d1 / d0)); moved += 20; }
    pts[e.pointerId] = [e.clientX, e.clientY];
  });
  function up(e) {
    if (pts[e.pointerId] && moved < 6) {
      var h = hitAt(cv, e);
      if (h) { if (sel === h.i) location.hash = '#/w/' + N.nodes[h.i].s; else sel = h.i; } else sel = null;
    }
    delete pts[e.pointerId];
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); view.k = Math.max(0.3, Math.min(5, view.k * (e.deltaY < 0 ? 1.12 : 0.89))); }, { passive: false });
}

function pageBeds() {
  var cnt = {}; IDX.heads.forEach(function (h) { h.d.forEach(function (d) { cnt[d] = (cnt[d] || 0) + 1; }); });
  put(section('แปลง', 'twenty-two beds; a tree stands in every bed its senses reach', 'x:garden') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (d) {
      return '<a class="tile" href="#/bed/' + enc(d) + '"><canvas data-mark="' + d + '"></canvas><div class="cap"><b>' + esc(dom(d).th) + '</b><span>' + esc(dom(d).en) + ' · ' + cnt[d] + ' trees</span></div></a>';
    }).join('') + '</div>', 'beds');
}
function pageBed(d) {
  var hs = IDX.heads.filter(function (h) { return h.d.indexOf(d) >= 0; }).sort(function (a, b) { return b.nc - a.nc; });
  put(section(esc(dom(d).th), esc(dom(d).en) + ' · ' + hs.length + ' trees', d) + treeGrid(hs), 'beds');
}
function treeGrid(hs, sub) {
  return '<div class="grid">' + hs.map(function (h) {
    return '<a class="tile" href="#/w/' + h.s + '"><canvas data-tree="' + h.s + '"></canvas><div class="cap"><b>' + esc(h.th) + '</b><span>' + esc(h.r) + ' · ' + esc(h.en) + '</span>' + (sub ? '<div class="muted" style="font-size:14px">' + sub(h) + '</div>' : '') + '</div></a>';
  }).join('') + '</div>';
}
function pageSeeds() {
  var cnt = {}; IDX.heads.forEach(function (h) { cnt[h.o] = (cnt[h.o] || 0) + 1; });
  put(section('เมล็ด', 'where each word\'s seed came from, as its etymology says', 'o:tai') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (o) {
      return '<a class="tile" href="#/seed/' + o + '"><canvas data-mark="o:' + o + '"></canvas><div class="cap"><b>' + ORIGIN[o][0] + '</b><span>' + ORIGIN[o][1] + ' · ' + cnt[o] + ' trees</span></div></a>';
    }).join('') + '</div>', 'seeds');
}
function pageSeed(o) {
  var hs = IDX.heads.filter(function (h) { return h.o === o; }).sort(function (a, b) { return b.nc - a.nc; });
  put(section(ORIGIN[o] ? ORIGIN[o][0] : o, (ORIGIN[o] ? ORIGIN[o][1] : '') + ' · ' + hs.length + ' trees', 'o:' + o) + treeGrid(hs, function (h) { return esc((h.ety || '').slice(0, 90)); }), 'seeds');
}
function pageGrafts() {
  var cnt = {}; IDX.heads.forEach(function (h) { h.sen.forEach(function (r) { if (r[2] != null && r[3]) cnt[r[3]] = (cnt[r[3]] || 0) + 1; }); });
  put(section('กิ่ง', 'how one sense grows out of another', 'v:metaphor') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (v) {
      return '<a class="tile" href="#/via/' + v + '"><canvas data-mark="v:' + v + '"></canvas><div class="cap"><b style="color:' + viaCol(v) + '">' + VIA[v].th + '</b><span>' + VIA[v].en + ' · ' + cnt[v] + ' branches</span></div></a>';
    }).join('') + '</div>', 'grafts');
}
function pageVia(v) {
  var rows = [];
  IDX.heads.forEach(function (h) { var by = {}; h.sen.forEach(function (r) { by[r[0]] = r; }); h.sen.forEach(function (r) { if (r[3] === v && r[2] != null && by[r[2]]) rows.push([h, by[r[2]], r]); }); });
  rows.sort(function () { return Math.random() - 0.5; });
  put(section(VIA[v] ? VIA[v].th : v, (VIA[v] ? VIA[v].en : '') + ' · ' + rows.length + ' branches', 'v:' + v) +
    '<div class="grid">' + rows.map(function (x) {
      return '<a class="card" style="text-decoration:none;border-left:6px solid ' + viaCol(v) + '" href="#/w/' + x[0].s + '/' + x[2][0] + '"><b style="font:500 28px var(--th);color:var(--red)">' + esc(x[0].th) + '</b> <span class="muted">' + esc(x[0].r) + '</span>' +
        '<div style="font-size:16px;margin:4px 0"><b>' + x[1][0] + '</b> ' + esc(x[1][1] || '—') + ' → <b>' + x[2][0] + '</b> ' + esc(x[2][1] || '—') + '</div><div class="muted" style="font-size:15px">' + esc(x[2][5] || '') + '</div></a>';
    }).join('') + '</div>', 'grafts');
}
function pageShapes() {
  var cnt = {}; IDX.compounds.forEach(function (c) { if (c[5]) cnt[c[5]] = (cnt[c[5]] || 0) + 1; });
  put(section('รูปคำ', 'how compounds are put together: N noun, V verb, ADJ adjective', 'd:speech') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (p) {
      var ex = IDX.compounds.filter(function (c) { return c[5] === p; }).slice(0, 4).map(function (c) { return c[0]; }).join(' · ');
      return '<a class="card" style="text-decoration:none" href="#/shape/' + enc(p) + '"><b style="font:600 30px var(--th);color:var(--red)">' + esc(p) + '</b> <span class="muted">' + cnt[p] + '</span><div class="muted">' + esc(p.split('+').map(function (x) { return POS[x] || x; }).join(' + ')) + '</div><div style="font:500 18px var(--th)">' + esc(ex) + '</div></a>';
    }).join('') + '</div>', 'shapes');
}
function pageShape(p) {
  var cs = IDX.compounds.filter(function (c) { return c[5] === p; }), byF = {};
  cs.forEach(function (c) { (byF[c[6] || ''] = byF[c[6] || ''] || []).push(c); });
  put(section(esc(p), esc(p.split('+').map(function (x) { return POS[x] || x; }).join(' + ')) + ' · ' + cs.length, 'd:speech') +
    Object.keys(byF).map(function (f) { return '<h3 style="margin:16px 0 8px">' + (FRAME[f] ? FRAME[f].join(' · ') : 'other') + ' <small class="muted">' + byF[f].length + '</small></h3><div class="chips">' + byF[f].slice(0, 300).map(function (c) { return chip(c[0], c[1], c[2], '#/k/' + enc(c[0]), 'sm'); }).join('') + '</div>'; }).join(''), 'shapes');
}
function pageWeeds() {
  var by = {}; IDX.look.forEach(function (l) { (by[l[2]] = by[l[2]] || []).push(l); });
  var ks = Object.keys(by).sort(function (a, b) { return by[b].length - by[a].length; });
  put(section('วัชพืช', IDX.look.length + ' words that look like compounds of a head and are not: borrowings, place names, other spellings', 'x:mask') +
    '<p class="muted">ตา sits inside เมตตา only by spelling: เมตตา is Pali mettā, loving-kindness. The filer pulled each of these out and wrote down why.</p>' +
    ks.map(function (s) { return '<h3 style="margin:18px 0 8px"><a class="thai-link" href="#/w/' + s + '">' + esc(BY[s].th) + '</a> <small class="muted">' + esc(BY[s].r) + ' · ' + by[s].length + '</small></h3><div class="chips">' + by[s].map(function (l) { return '<a class="chip sm" href="#/k/' + enc(l[0]) + '" title="' + esc(l[4]) + '"><b>' + esc(l[0]) + '</b><i>' + esc(l[1]) + '</i><span>' + (USE[l[3]] || [l[3], l[3]])[1] + '</span></a>'; }).join('') + '</div>'; }).join(''), 'weeds');
}
function pageNotes(s) {
  J('data/notes.json').then(function (N) {
    NOTES = N;
    var list = s ? N.filter(function (n) { return n.a.indexOf(s) >= 0; }) : N, out = [], cur = '';
    list.forEach(function (n) {
      if (/^Build\b|DEFECT|concurrency|collision|^Addendum/i.test(n.h3) && !s) return;
      if (n.h2 !== cur) { cur = n.h2; out.push('<h3 style="margin:22px 0 6px">' + linkifyThai(n.h2) + '</h3>'); }
      out.push('<div class="note">' + (n.h3 ? '<div class="d">' + linkifyThai(n.h3) + '</div>' : '') + md(n.t) + (n.a.length ? '<div class="d">' + n.a.map(hlink).join(' · ') + '</div>' : '') + '</div>');
    });
    put(section('สมุดของผู้จัด', 'the compound filer\'s notebook, ' + (s ? 'on ' + esc(BY[s].th) : 'from the first six by hand on 31 Aug 2026 to today'), 'x:notebook') +
      '<div class="card notes">' + out.join('') + '</div>', 'notes');
  });
}
function pageTrail() {
  var t = trail().slice().reverse();
  put(section('รอยเท้า', 'where you have wandered, newest first', 'x:trail') +
    (t.length ? '<div class="chips">' + t.map(function (x) { return '<a class="chip" href="' + x[0] + '"><b>' + esc(x[1]) + '</b></a>'; }).join('') + '</div><p><button class="speak" id="clr" style="padding-left:14px">ลบรอยเท้า · clear the trail</button></p>' : '<p class="muted">ยังไม่มีรอยเท้า · no steps yet. Press เดินเล่น.</p>'), 'trail');
  var b = document.getElementById('clr'); if (b) b.addEventListener('click', function () { store('trail', []); drawFoot(); pageTrail(); });
}

/* play: the filer's own job, as a game */
function pagePlay() {
  var sc = store('score') || { r: 0, n: 0 };
  put(section('เล่น', 'file the word yourself', 'x:wander') + '<div class="card" id="game"></div>', 'play');
  var g = document.getElementById('game');
  function round() {
    var mode = Math.random() < 0.3 ? 'weed' : 'branch';
    var pool = IDX.heads.filter(function (h) { return mode === 'weed' ? h.nl >= 2 && h.nc >= 4 : h.sen.filter(function (r) { return r[4] > 0 && r[1]; }).length >= 2; });
    var h = pick(pool);
    head(h.s).then(function (H) {
      if (mode === 'weed') {
        var isWeed = Math.random() < 0.5, w;
        if (isWeed) w = pick(H.look); else { var all = []; H.senses.forEach(function (s) { s.c.forEach(function (c) { all.push(c); }); }); w = pick(all); }
        g.innerHTML = '<div class="muted">คำนี้เป็นคำประสมของ <b>' + esc(H.th) + '</b> จริงไหม · is this a compound of ' + esc(H.th) + ' (' + esc(H.r) + ')?</div><div class="q">' + esc(w.th) + '</div><div class="muted">' + esc(w.r) + '</div>' +
          '<div class="answers"><button data-a="1"><span class="n" style="background:#2f7a46">ใ</span>ใบ · a leaf: it is built on ' + esc(H.th) + '</button><button data-a="0"><span class="n" style="background:#7a3a6e">ว</span>วัชพืช · a weed: it only looks that way</button></div><div id="why"></div><p class="score">' + sc.r + ' / ' + sc.n + '</p>';
        g.querySelectorAll('.answers button').forEach(function (b) { b.addEventListener('click', function () {
          var ok = (b.getAttribute('data-a') === '0') === isWeed; sc.n++; if (ok) sc.r++; store('score', sc);
          g.querySelectorAll('.answers button').forEach(function (x) { x.disabled = true; x.classList.add((x.getAttribute('data-a') === '0') === isWeed ? 'right' : 'wrong'); });
          document.getElementById('why').innerHTML = '<p>' + (isWeed ? linkifyThai(w.note) : (w.en ? esc(w.en) + ' · ' : '') + (w.lit ? 'literally ' + esc(w.lit) : '')) + '</p><p><a class="thai-link" href="#/k/' + enc(w.th) + '">' + esc(w.th) + '</a> · <button class="speak" id="next" style="padding-left:14px">ต่อ · next</button></p>';
          document.getElementById('next').addEventListener('click', round);
        }); });
        return;
      }
      var withC = H.senses.filter(function (s) { return s.c.length && s.en; }), right = pick(withC), c = pick(right.c);
      var opts = [right].concat(withC.filter(function (s) { return s !== right; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3)).sort(function (a, b) { return a.n - b.n; });
      g.innerHTML = '<div class="muted">คำนี้อยู่กิ่งไหนของ <b>' + esc(H.th) + '</b> · which branch of ' + esc(H.th) + ' (' + esc(H.r) + ') does it grow on?</div><div class="q">' + esc(c.th) + '</div><div class="muted">' + esc(c.r) + (c.en ? ' · ' + esc(c.en) : '') + '</div>' +
        '<div class="answers">' + opts.map(function (s) { return '<button data-n="' + s.n + '"><span class="n" style="background:' + viaCol(s.via) + '">' + s.n + '</span>' + esc(s.en) + '</button>'; }).join('') + '</div><div id="why"></div><p class="score">' + sc.r + ' / ' + sc.n + '</p>';
      g.querySelectorAll('.answers button').forEach(function (b) { b.addEventListener('click', function () {
        var ok = +b.getAttribute('data-n') === right.n; sc.n++; if (ok) sc.r++; store('score', sc);
        g.querySelectorAll('.answers button').forEach(function (x) { x.disabled = true; x.classList.add(+x.getAttribute('data-n') === right.n ? 'right' : 'wrong'); });
        document.getElementById('why').innerHTML = (H.rule ? '<p class="muted">กฎของผู้จัด · the filer\'s rule: ' + linkifyThai(H.rule) + '</p>' : '') + '<p><a class="thai-link" href="#/w/' + H.s + '/' + right.n + '">' + esc(H.th) + ' ' + right.n + '</a> · <button class="speak" id="next" style="padding-left:14px">ต่อ · next</button></p>';
        document.getElementById('next').addEventListener('click', round);
      }); });
    });
  }
  round();
}
function pageMissing() { put('<div class="card"><p>ไม่พบ · not found.</p><p><a href="#/">สวน · the garden</a></p></div>', ''); }

function route() {
  var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), p = h.split('/');
  here = { kind: 'page' };
  if (!h) { here = { kind: 'home' }; return pageHome(); }
  switch (p[0]) {
    case 'w': return pageHead(p[1], p[2]);
    case 'k': return pageWord(p.slice(1).join('/'));
    case 'net': return pageNet();
    case 'beds': return pageBeds();
    case 'bed': return pageBed(p[1]);
    case 'seeds': return pageSeeds();
    case 'seed': return pageSeed(p[1]);
    case 'grafts': return pageGrafts();
    case 'via': return pageVia(p[1]);
    case 'shapes': return pageShapes();
    case 'shape': return pageShape(p.slice(1).join('/'));
    case 'weeds': return pageWeeds();
    case 'notes': return pageNotes(p[1]);
    case 'play': return pagePlay();
    case 'trail': return pageTrail();
  }
  pageMissing();
}

J('data/index.json').then(function (idx) {
  IDX = idx; IDX.byTh = {};
  idx.heads.forEach(function (h) { BY[h.s] = h; IDX.byTh[h.th] = h.s; });
  drawFoot(); wire(document); window.addEventListener('hashchange', route); route();
}).catch(function (e) { main.innerHTML = '<div class="card"><p>โหลดไม่ได้ · could not load the garden.</p></div>'; console.error(e); });
})();
