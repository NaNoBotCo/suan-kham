/* สวนคำ · The Word Garden — 180 filed Thai heads from the wichaa lexicon, each a fractal tree.
   Routes: #/ · #/w/<slug>[/<sense>[/<leaf>]] · #/k/<thai> · #/explore · #/net · #/beds · #/bed/<d>
   #/seeds · #/seed/<o> · #/grafts · #/via/<kind> · #/shapes · #/shape/<pattern> · #/weeds · #/notes[/<slug>]
   #/play · #/trail */
(function () {
'use strict';
var IDX = null, HEADS = {}, BY = {}, CACHE = {};
var main = document.getElementById('main'), foot = document.getElementById('foot');
var sheet = document.getElementById('sheet'), guideEl = document.getElementById('guide');
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
var VIA_SAY = {
  metaphor: 'one thing seen as another', metonymy: 'a thing named for its neighbour', specialisation: 'the meaning narrowed',
  generalisation: 'the meaning widened', euphemism: 'a softer way to say it', '': 'the first meaning'
};
var STARTERS = ['nam', 'hua', 'ta', 'luk', 'ban', 'fai', 'khao', 'chang', 'mue', 'pak'];

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
/* compounds everywhere show how they are built: the whole word, its parts (the head word quieter), the literal
   reading, the meaning */
var CM = null, COLL = (window.Intl && Intl.Collator) ? new Intl.Collator('th') : null;
function thCmp(a, b) { return COLL ? COLL.compare(a, b) : (a < b ? -1 : a > b ? 1 : 0); }
function cinfo(th) { if (!CM) { CM = {}; IDX.compounds.forEach(function (c) { if (!CM[c[0]]) CM[c[0]] = c; }); } return CM[th]; }
function glossOf(p) { var s = IDX.byTh[p]; if (s) return BY[s].en.split(',')[0]; var c = cinfo(p); return c && c[2] ? c[2].split(/[;,]/)[0] : ''; }
function litOf(parts, lit) { if (lit) return lit; var g = parts.map(glossOf); return g.length > 1 && g.every(Boolean) ? g.join(' + ') : ''; }
function crow(th, r, en, parts, lit, headTh, badge) {
  parts = parts && parts.length ? parts : [th];
  var split = parts.map(function (p) { return '<span class="' + (p === headTh ? 'hp' : 'xp') + '">' + esc(p) + '</span>'; }).join('<i>+</i>');
  var l = litOf(parts, lit);
  return '<a class="crow" href="#/k/' + enc(th) + '">' + (badge || '') + '<span class="cw"><b>' + esc(th) + '</b><small>' + esc(r) + '</small></span>' +
    '<span class="cs"><span class="split">' + split + '</span>' + (l ? '<small>' + esc(l) + '</small>' : '') + '</span><span class="ce">' + esc(en || '') + '</span></a>';
}
function crowC(c, headTh, badge) { return crow(c[0], c[1], c[2], c[7] ? c[7].split('+') : null, c[8], headTh || (BY[c[3]] ? BY[c[3]].th : ''), badge); }
function crowT(th, headTh) { var c = cinfo(th); return c ? crowC(c, headTh) : chip(th, '', '', wordHref(th) || '#/'); }
function crows(html) { return '<div class="crows">' + html + '</div>'; }
function nbadge(n, via) { return '<span class="nb" style="--c:' + viaCol(via) + '" title="meaning ' + n + '">' + n + '</span>'; }
function hlink(s) { var h = BY[s]; return h ? '<a class="thai-link" href="#/w/' + s + '">' + esc(h.th) + '</a>' : esc(s); }
function wordHref(th) { if (IDX.byTh[th]) return '#/w/' + IDX.byTh[th]; if (IDX.words[th]) return '#/k/' + enc(th); return null; }
function thLink(th) { var h = wordHref(th); return h ? '<a class="thai-link" href="' + h + '">' + esc(th) + '</a>' : esc(th); }
function linkifyThai(text) { return esc(text).replace(/[฀-๿]+/g, function (w) { return wordHref(w) ? thLink(w) : w; }); }
function rich(text) { return linkifyThai(text).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>'); }
function md(text) {
  if (/^\|/.test(text) || /^ {4}/m.test(text)) return '<pre>' + linkifyThai(text) + '</pre>';
  return '<p>' + linkifyThai(text).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, ' ') + '</p>';
}
function section(th, en, mark, n) { return '<h2>' + (mark ? '<canvas data-mark="' + mark + '"></canvas>' : '') + '<span>' + th + (en ? ' <small>' + en + (n != null ? ' · ' + n : '') + '</small>' : '') + '</span></h2>'; }
/* a folded section: the heading says what is inside and how many */
function fold(th, en, n, body, open, mark, id) {
  return '<details class="fold"' + (id ? ' id="' + id + '"' : '') + (open ? ' open' : '') + '><summary>' + (mark ? '<canvas data-mark="' + mark + '"></canvas>' : '') + '<span><b>' + th + '</b> <small>' + en + '</small></span>' + (n != null ? '<em>' + n + '</em>' : '') + '</summary><div class="fold-in">' + body + '</div></details>';
}

/* ---------------------------------------------------------------- the pictures: one loop draws what is on screen */
var PICS = [], seen = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(function (es) { es.forEach(function (e) { e.target._vis = e.isIntersecting; }); }) : null;
function pic(cv, draw) {
  cv._draw = draw; cv._vis = !seen; cv._done = 0; if (seen) seen.observe(cv);
  if (PICS.indexOf(cv) < 0) PICS.push(cv); return cv;
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
    if (!cv._vis || (still && cv._done && !cv._dirty)) return;
    var s = sizeOf(cv), c = cv.getContext('2d');
    c.setTransform(s[2], 0, 0, s[2], 0, 0); c.clearRect(0, 0, s[0], s[1]);
    try { cv._hits = cv._draw(c, s[0], s[1], t) || cv._hits; } catch (e) { if (!cv._err) { cv._err = 1; console.error(e); } }
    cv._done = 1; cv._dirty = 0;
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
function wire(root) {
  (root || document).querySelectorAll('canvas[data-mark]').forEach(function (cv) { if (!cv._draw) pic(cv, markDraw(cv.getAttribute('data-mark'))); });
  (root || document).querySelectorAll('canvas[data-head]').forEach(function (cv) { if (!cv._draw) pic(cv, headDraw(BY[cv.getAttribute('data-head')] || { s: cv.getAttribute('data-head') })); });
  (root || document).querySelectorAll('canvas[data-tree]').forEach(function (cv) { if (!cv._draw) { var h = BY[cv.getAttribute('data-tree')]; pic(cv, function (c, W, H, t) { return MDTREE.draw(c, W, H, t, h, { mini: true }); }); } });
}
/* a tap on a canvas finds the nearest hit within its radius; a near miss on a branch still counts */
function hitAt(cv, ev, slack) {
  var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = null, bd = 1e9;
  (cv._hits || []).forEach(function (h) { var d = Math.hypot(h.x - x, h.y - y); if (h.r && d < h.r * (slack || 1) && d < bd) { bd = d; best = h; } });
  return best;
}

/* ---------------------------------------------------------------- trail and scroll memory */
function trail() { return store('trail') || []; }
function step(href, label, en) {
  var t = trail().filter(function (x) { return x[0] !== href; }); t.push([href, label, en || '']); if (t.length > 80) t = t.slice(-80); store('trail', t);
}
function drawFoot() {
  foot.innerHTML = '<p>' + IDX.counts.heads + ' คำ · ' + IDX.counts.senses + ' ความหมาย · ' + IDX.counts.compounds + ' คำประสม — from the wichaa lexicon (manuscript-wiki), its filing tables and the compound filer\'s notebook. Thai glosses: the Royal Institute dictionary and Wiktionary, as the lexicon records them. English the lexicon lacked was written for this garden: 4,584 glosses by DeepSeek V4 Flash, 135 by Claude. Roots: the lexicon\'s etymologies and the ThaiRoots inventory. Pictures: the motdang doodler. <a href="privacy.html">Privacy</a></p>';
}
var SCROLL = {}, lastY = 0, curHash = location.hash;
window.addEventListener('scroll', function () { lastY = window.scrollY; }, { passive: true });
function restoreScroll() { var y = SCROLL[location.hash]; if (y) requestAnimationFrame(function () { window.scrollTo(0, y); }); }

/* ---------------------------------------------------------------- search (top bar and the home page share it) */
function foldS(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s\-·.,;]+/g, ''); }
function search(v) {
  var f = foldS(v), th = /[฀-๿]/.test(v), out = [];
  if (!f) return out;
  IDX.heads.forEach(function (h) {
    var sc = th ? (h.th === v ? 100 : h.th.indexOf(v) === 0 ? 60 : h.th.indexOf(v) >= 0 ? 30 : 0)
      : (foldS(h.r) === f ? 90 : foldS(h.r).indexOf(f) === 0 ? 50 : 0) + (foldS(h.en).indexOf(f) >= 0 ? 40 : 0) + (foldS(h.p) === f ? 60 : 0);
    if (sc) out.push([sc + 5, h.th, h.r, h.en, '#/w/' + h.s, 'tree', h.s]);
  });
  IDX.compounds.forEach(function (c) {
    var sc = th ? (c[0] === v ? 80 : c[0].indexOf(v) === 0 ? 40 : c[0].indexOf(v) >= 0 ? 18 : 0)
      : (foldS(c[1]) === f ? 70 : foldS(c[1]).indexOf(f) === 0 ? 30 : 0) + (foldS(c[2]).indexOf(f) >= 0 ? (foldS(c[2]) === f ? 50 : 20) : 0);
    if (sc) out.push([sc, c[0], c[1], c[2], '#/k/' + enc(c[0]), 'leaf', c[3]]);
  });
  var seenK = {};
  return out.sort(function (a, b) { return b[0] - a[0] || a[1].length - b[1].length; }).filter(function (x) { if (seenK[x[4]]) return false; seenK[x[4]] = 1; return true; }).slice(0, 30);
}
function hitRow(x, i) {
  var tag = x[5] === 'tree' ? '<span class="kind tree">คำหลัก · head word</span>' : '<span class="kind leaf">คำจาก ' + esc(BY[x[6]] ? BY[x[6]].th : '') + '</span>';
  return '<a href="' + x[4] + '"' + (i ? '' : ' class="on"') + '><span class="t">' + esc(x[1]) + '</span><span class="r">' + esc(x[2]) + '</span><span class="e">' + esc(x[3]) + '</span>' + tag + '</a>';
}
function attachSearch(input, box) {
  var sel = 0;
  function show() {
    var v = input.value.trim(), r = search(v); sel = 0;
    if (!v) {
      box.innerHTML = '<div class="hits-head">ลองคำเหล่านี้ · try one of these</div>' + STARTERS.slice(0, 6).map(function (s, i) { var h = BY[s]; return hitRow([0, h.th, h.r, h.en, '#/w/' + s, 'tree', s], i); }).join('');
    } else if (!r.length) {
      box.innerHTML = '<div class="hits-none"><b>ไม่พบ “' + esc(v) + '”</b><br>No match. Type Thai script (น้ำ), a romanised spelling (nam) or English (water). The garden holds 180 head words and the 4,415 compounds built on them.</div>';
    } else box.innerHTML = r.map(hitRow).join('');
    box.hidden = false;
  }
  input.addEventListener('input', show);
  input.addEventListener('focus', show);
  input.addEventListener('keydown', function (e) {
    var as = box.querySelectorAll('a'); if (!as.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); as[sel].classList.remove('on'); sel = (sel + (e.key === 'ArrowDown' ? 1 : as.length - 1)) % as.length; as[sel].classList.add('on'); as[sel].scrollIntoView({ block: 'nearest' }); }
    if (e.key === 'Enter') { e.preventDefault(); location.hash = as[sel].getAttribute('href'); box.hidden = true; input.value = ''; input.blur(); }
    if (e.key === 'Escape') { box.hidden = true; input.blur(); }
  });
  box.addEventListener('click', function (e) { if (e.target.closest('a')) { box.hidden = true; input.value = ''; input.blur(); } });
  document.addEventListener('click', function (e) { if (!box.contains(e.target) && e.target !== input) box.hidden = true; });
}
attachSearch(document.getElementById('q'), document.getElementById('hits'));

/* ---------------------------------------------------------------- speech: the phone's own Thai voice, where it has one */
function thaiVoice() { if (!window.speechSynthesis) return null; var v = speechSynthesis.getVoices().filter(function (x) { return /^th/i.test(x.lang); }); return v[0] || null; }
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = function () { document.querySelectorAll('.speak[data-say]').forEach(function (b) { b.hidden = !(window.SKAndroid || thaiVoice()); }); };
function speak(th) { if (window.SKAndroid) { try { SKAndroid.speak(th); } catch (e) { } return; } var v = thaiVoice(); if (!v) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(th); u.voice = v; u.lang = v.lang; u.rate = 0.8; speechSynthesis.speak(u); }
document.addEventListener('click', function (e) { var b = e.target.closest('.speak[data-say]'); if (b) { e.preventDefault(); speak(b.getAttribute('data-say')); } });
function speakBtn(th, small) { return '<button class="speak' + (small ? ' sm' : '') + '" data-say="' + esc(th) + '"' + (window.SKAndroid || thaiVoice() ? '' : ' hidden') + ' aria-label="ฟัง ' + esc(th) + ' · hear it"><canvas data-mark="x:speak"></canvas>' + (small ? '' : 'ฟัง · hear it') + '</button>'; }

/* ---------------------------------------------------------------- wander, back, help */
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
document.getElementById('help').addEventListener('click', function () { guide(); });

/* ---------------------------------------------------------------- the path bar: where you are, how you got here, the way back */
document.getElementById('crumbs').addEventListener('click', function (e) { if (e.target.closest('.mapto')) document.getElementById('mapbtn').click(); });
var crumbsEl = document.getElementById('crumbs'), hintEl = document.getElementById('hintbar'), HOME = ['#/', 'สวน · home'];
var PATH = (function () { try { return JSON.parse(sessionStorage.getItem('suankham:path')) || [HOME]; } catch (e) { return [HOME]; } })();
function savePath() { try { sessionStorage.setItem('suankham:path', JSON.stringify(PATH)); } catch (e) { } }
function pathVisit(hash, label) {
  if (!hash || hash === '#' || hash === '#/') PATH = [HOME];
  else {
    var i = -1; PATH.forEach(function (p, j) { if (p[0] === hash) i = j; });
    if (i >= 0) PATH = PATH.slice(0, i + 1); else PATH.push([hash, label || '…']);
    if (PATH[0][0] !== '#/') PATH.unshift(HOME);
    if (PATH.length > 12) PATH = [HOME].concat(PATH.slice(-11));
  }
  savePath(); drawCrumbs();
}
function crumbLabel(label) { if (PATH.length) { PATH[PATH.length - 1][1] = label; savePath(); drawCrumbs(); } }
function drawCrumbs() {
  if (PATH.length <= 1) { crumbsEl.hidden = true; crumbsEl.innerHTML = ''; return; }
  var prev = PATH[PATH.length - 2], show = PATH.length > 5 ? [PATH[0], null].concat(PATH.slice(-3)) : PATH;
  crumbsEl.innerHTML = '<div class="crumb-row"><a class="backto" href="' + prev[0] + '"><span aria-hidden="true">‹</span> กลับไป · back to <b>' + esc(prev[1]) + '</b></a><button class="mapto" type="button">แผนที่ · map</button></div>' +
    '<ol>' + show.map(function (p, i) {
      if (!p) return '<li class="gap" aria-hidden="true">…</li>';
      var last = i === show.length - 1;
      return '<li>' + (last ? '<b aria-current="page">' + esc(p[1]) + '</b>' : '<a href="' + p[0] + '">' + esc(p[1]) + '</a>') + '</li>';
    }).join('') + '</ol>';
  crumbsEl.hidden = false;
}
function hint(text) { if (!text) { hintEl.hidden = true; return; } hintEl.innerHTML = '<span class="i" aria-hidden="true">i</span><span>' + text + '</span>'; hintEl.hidden = false; }
var LABEL = {
  explore: 'สำรวจ · explore', all: 'คำทั้งหมด · all words', net: 'ตาข่าย · net', play: 'เล่น · play', trail: 'ประวัติ · history', beds: 'หมวด · topics',
  seeds: 'ที่มา · origins', grafts: 'ความหมายงอก · how meanings grow', shapes: 'รูปคำ · word shapes', weeds: 'คำหน้าเหมือน · lookalikes', notes: 'สมุด · notebook'
};

/* ---------------------------------------------------------------- pages */
var TABOF = { '': 'home', explore: 'explore', all: 'explore', beds: 'explore', bed: 'explore', seeds: 'explore', seed: 'explore', grafts: 'explore', via: 'explore', shapes: 'explore', shape: 'explore', weeds: 'explore', notes: 'explore', net: 'net', play: 'play', trail: 'trail' };
function setTab(t) { document.querySelectorAll('#nav a').forEach(function (a) { var on = a.getAttribute('data-t') === t; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); }
function put(html) { closeSheet(); main.innerHTML = html; wire(main); window.scrollTo(0, 0); }

function todays() { var d = new Date(), k = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate(); var big = IDX.heads.filter(function (h) { return h.nc >= 15; }); return big[rnd(k)() * big.length | 0]; }

function pageHome() {
  var h = todays(), cnt = {}, last = trail().slice(-1)[0];
  IDX.heads.forEach(function (x) { x.d.forEach(function (d) { cnt[d] = (cnt[d] || 0) + 1; }); });
  var doms = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
  put(
    '<section class="home-hero">' +
      '<div class="hh-text">' +
        '<h1>สวนคำ <small>The Word Garden</small></h1>' +
        '<p class="lede">พจนานุกรมคำไทยที่เดินเข้าไปดูได้ · A Thai dictionary of 180 everyday words. Look one up to see its meanings, the longer words built from it, and where it came from.</p>' +
        '<div class="bigfind"><input id="q2" type="search" autocomplete="off" placeholder="พิมพ์คำ · type น้ำ, nam or water" aria-label="หาคำ · find a word"><div id="hits2" class="hits" hidden></div></div>' +
        '<div class="starter-h">เริ่มจากคำนี้ · or start with one of these</div>' +
        '<div class="starters">' + STARTERS.map(function (s) { var x = BY[s]; return '<a class="starter" href="#/w/' + s + '"><canvas data-head="' + s + '"></canvas><b>' + esc(x.th) + '</b><span>' + esc(x.en.split(',')[0]) + '</span></a>'; }).join('') + '</div>' +
        '<p><a class="btn ghost" href="#/all">ดูทั้ง ' + IDX.heads.length + ' คำ · see all ' + IDX.heads.length + ' words, sorted ›</a></p>' +
      '</div>' +
      '<a class="today" href="#/w/' + h.s + '"><canvas id="today"></canvas><div class="tag"><small>ต้นไม้วันนี้ · today\'s tree</small><b>' + esc(h.th) + '</b><span>' + esc(h.r) + ' · ' + esc(h.en) + '</span></div></a>' +
    '</section>' +
    (store('guided') ? '' : '<div class="invite card"><canvas data-mark="x:garden"></canvas><div><b>ครั้งแรกใช่ไหม · new here?</b><p>Each tree is one Thai word. A one-minute tour shows how to read it.</p></div><button class="btn" id="tour">ดูวิธีอ่าน · show me</button></div>') +
    (last ? '<a class="continue card" href="' + last[0] + '"><small>ต่อจากที่ค้างไว้ · carry on from</small><b>' + esc(last[1]) + '</b>' + (last[2] ? '<span>' + esc(last[2]) + '</span>' : '') + '<em>›</em></a>' : '') +
    section('หมวด', 'browse by topic', 'd:plant') +
    '<div class="topics">' + doms.map(function (d) {
      return '<a class="topic" href="#/bed/' + enc(d) + '"><canvas data-mark="' + d + '"></canvas><b>' + esc(dom(d).th) + '</b><span>' + esc(dom(d).en) + '</span><em>' + cnt[d] + '</em></a>';
    }).join('') + '</div>' +
    section('ทางเข้าอื่น', 'more ways in', 'x:search') + exploreCards()
  );
  setTab('home'); hint('Type a word in the box, or tap one of the pictures. Once you move on, a path bar under the search leads back, and <b>แผนที่ · map</b> shows where you are and where you can go next.');
  attachSearch(document.getElementById('q2'), document.getElementById('hits2'));
  var cv = document.getElementById('today');
  pic(cv, function (c, W, H, t) { return MDTREE.draw(c, W, H, t, h, { sky: true, sign: false }); });
  var tb = document.getElementById('tour'); if (tb) tb.addEventListener('click', function () { guide(); });
}

function exploreCards() {
  var cards = [
    ['#/all', 'x:garden', 'คำทั้งหมด', 'All 180 words', 'One table, sortable by most words built, most meanings, Thai or English order.'],
    ['#/beds', 'd:plant', 'หมวด', 'Topics', 'Words grouped by what they are about: the body, water, kinship, money…'],
    ['#/seeds', 'o:sanskrit', 'ที่มา', 'Origins', 'Native Tai words, and words borrowed from Sanskrit, Pali, Khmer, Chinese and English.'],
    ['#/grafts', 'v:metaphor', 'ความหมายงอก', 'How meanings grow', 'One meaning grows from another by metaphor, by naming a neighbour, by narrowing or widening.'],
    ['#/net', 'x:net', 'ตาข่าย', 'The net', 'Head words joined by the compound words they share.'],
    ['#/shapes', 'd:speech', 'รูปคำ', 'Word shapes', 'How compounds are built: noun + noun, verb + noun and more.'],
    ['#/weeds', 'x:mask', 'คำหน้าเหมือน', 'Lookalikes', 'Words that look like they contain a head word and do not: เมตตา has ตา only in its spelling.'],
    ['#/notes', 'x:notebook', 'สมุด', 'Filer\'s notebook', 'Why each word\'s meanings were divided the way they are.']
  ];
  return '<div class="ways">' + cards.map(function (c) { return '<a class="way" href="' + c[0] + '"><canvas data-mark="' + c[1] + '"></canvas><div><b>' + c[2] + ' <small>' + c[3] + '</small></b><p>' + c[4] + '</p></div></a>'; }).join('') + '</div>';
}
function pageExplore() {
  put(section('สำรวจ', 'explore the garden', 'x:search') + exploreCards());
  setTab('explore'); hint('Pick a way to browse. The path bar above leads back.');
}

/* ---------------------------------------------------------------- a head: the tree, its meanings, its roots */
function pageHead(s, hiN, leafTh) {
  var x = BY[s]; if (!x) return pageMissing();
  here = { kind: 'head', s: s };
  main.innerHTML = '<div class="loading"><canvas width="120" height="120" data-head="' + s + '"></canvas><p>' + esc(x.th) + '</p></div>'; wire(main);
  head(s).then(function (h) {
    step('#/w/' + s, h.th, h.en);
    var bySense = {}; h.senses.forEach(function (sn) { bySense[sn.n] = sn; });
    var inside = ((IDX.words[h.th] || {}).i || []).filter(function (i) { return i[1] !== s; });
    var grafts = IDX.edges.filter(function (e) { return e[0] === s || e[1] === s; });
    var hasRoots = rootsHave(h), viaUsed = {};
    h.senses.forEach(function (sn) { viaUsed[sn.ext != null ? (sn.via || '') : ''] = 1; });
    put(
      '<section class="word-head card">' +
        '<div class="wh-pic"><canvas data-head="' + s + '"></canvas></div>' +
        '<div class="wh-id"><h1 class="th">' + esc(h.th) + '</h1>' +
          '<div class="say"><span class="rtgs">' + esc(h.r) + '</span><span class="pb">' + esc(h.p) + '</span><span class="ipa">' + esc(h.ipa) + '</span>' + (h.resp ? '<span class="pb">อ่านว่า ' + esc(h.resp) + '</span>' : '') + '</div>' +
          (h.en ? '<div class="en">' + esc(h.en) + '</div>' : '') +
          '<div class="wh-row">' + speakBtn(h.th) +
            '<a class="pill" href="#/seed/' + h.o + '"><canvas data-mark="o:' + h.o + '"></canvas>' + ORIGIN[h.o][0] + ' · ' + ORIGIN[h.o][1] + '</a>' +
            h.d.slice(0, 2).map(function (d) { return '<a class="pill" href="#/bed/' + enc(d) + '"><canvas data-mark="' + d + '"></canvas>' + esc(dom(d).th) + '</a>'; }).join('') + '</div>' +
        '</div>' +
      '</section>' +
      '<p class="summary">' + esc(h.th) + (h.en ? ' (' + esc(h.en.split(',')[0]) + ')' : '') + ' has <b>' + h.senses.length + (h.senses.length === 1 ? ' meaning' : ' meanings') + '</b>, and <b>' + x.nc + (x.nc === 1 ? ' word is' : ' words are') + '</b> built from it.' + (h.look.length ? ' ' + h.look.length + (h.look.length === 1 ? ' word looks' : ' words look') + ' like it and ' + (h.look.length === 1 ? 'is' : 'are') + ' not.' : '') + ' ' + esc(originLine(h)) + '</p>' +
      '<nav class="jump" aria-label="ไปที่ · jump to"><span>ไปที่ · jump to</span>' +
        '<button data-to="sec-pic">ภาพ · picture</button><button data-to="sec-origin">ที่มา · origin</button><button data-to="sec-words">คำที่สร้าง · words built <em>' + x.nc + '</em></button>' +
        (h.look.length ? '<button data-to="sec-look">หน้าเหมือน · lookalikes <em>' + h.look.length + '</em></button>' : '') +
        (h.rule ? '<button data-to="sec-rule">วิธีแบ่ง · how it was divided</button>' : '') +
        (h.notes.length ? '<button data-to="sec-notes">บันทึก · notes</button>' : '') + '</nav>' +
      '<section class="stage-wrap" id="sec-pic">' +
        (hasRoots ? '<div class="seg" role="tablist" aria-label="มุมมอง · view"><button role="tab" aria-selected="true" data-v="tree">ต้นไม้ · the tree</button><button role="tab" aria-selected="false" data-v="roots">ราก · the roots</button></div>' : '') +
        '<div class="tree-stage"><canvas class="tree" id="tree" aria-label="ต้นไม้ของ ' + esc(h.th) + ': ' + h.senses.length + ' branches, ' + x.nc + ' leaves"></canvas>' +
          '<div class="hint" id="hint">แตะตัวเลขเพื่ออ่านความหมาย · tap a number to read that meaning</div></div>' +
        '<p class="key"><span><i class="kn">1</i> a meaning</span><span><i class="kl"></i> a word built on it</span>' + (h.look.length ? '<span><i class="kw"></i> a lookalike</span>' : '') + '</p><div class="legend">' + Object.keys(viaUsed).map(function (k) { return '<span><i style="background:' + VIA[k].col + '"></i>' + VIA[k].th + ' · ' + VIA_SAY[k] + '</span>'; }).join('') + '</div>' +
      '</section>' +
      '<section id="sec-origin" class="origin">' + section('ที่มา', 'where ' + esc(h.th) + ' comes from', 'o:' + h.o) +
        '<p class="lede">' + (esc(originLine(h)) || 'The lexicon records no etymology for ' + esc(h.th) + '.') + '</p>' +
        (hasRoots ? '<p><button class="btn ghost" id="showroots">ดูรากในภาพ · show the roots in the picture</button></p>' + rootsHtml(h) : '') +
        (h.ety ? '<details class="ety"><summary>ข้อความเต็ม · the full etymology, as the lexicon records it</summary><p>' + linkifyThai(h.ety) + '</p></details>' : '') +
      '</section>' +
      '<div id="sec-words"></div>' +
      section('คำที่สร้างจาก ' + esc(h.th), 'words built from ' + esc(h.th), 'd:plant', x.nc) +
      '<div class="seg wgroup" role="tablist" aria-label="จัดกลุ่ม · group the words">' +
        '<button role="tab" data-g="meaning">ตามความหมาย · by meaning</button><button role="tab" data-g="place">' + esc(h.th) + ' หน้า/หลัง · first or last</button><button role="tab" data-g="az">ก–ฮ · A–Z</button></div>' +
      '<div id="wlist"></div>' +
      (h.rule ? fold('วิธีแบ่ง', 'how the filer divided its meanings', null, '<p class="rule">' + rich(h.rule) + '</p>' + (h.filed ? '<p class="muted">' + h.filed + '</p>' : ''), false, 'x:notebook', 'sec-rule') : '') +
      (h.look.length ? fold('คำหน้าเหมือน', 'lookalikes: they look built from ' + esc(h.th) + ' and are not', h.look.length, '<div class="grid">' + h.look.map(function (l) { return '<a class="card weed" href="#/k/' + enc(l.th) + '"><b>' + esc(l.th) + '</b> <span class="muted">' + esc(l.r) + '</span><div class="muted">' + (USE[l.use] || [l.use, l.use]).join(' · ') + '</div><div>' + esc(l.note) + '</div></a>'; }).join('') + '</div>', false, 'x:mask', 'sec-look') : '') +
      (grafts.length || inside.length ? fold('คำหลักที่เกี่ยวข้อง', 'other head words sharing a compound with ' + esc(h.th), grafts.length + inside.length,
        (grafts.length ? '<div class="chips">' + grafts.map(function (e) { var o = e[0] === s ? e[1] : e[0]; return '<a class="chip" href="#/w/' + o + '"><b>' + esc(BY[o].th) + '</b><i>' + esc(BY[o].en) + '</i><span>' + e[3].map(esc).join(' · ') + '</span></a>'; }).join('') + '</div>' : '') +
        (inside.length ? '<h3>' + esc(h.th) + ' inside words filed under other head words</h3>' + crows(inside.slice(0, 80).map(function (i) { return i[0]; }).sort(thCmp).map(function (t) { return crowT(t, h.th); }).join('')) : ''), false, 'x:net') : '') +
      (h.notes.length ? fold('สมุด', 'the filer\'s notes on ' + esc(h.th), h.notes.length, '<div class="notes">' + h.notes.map(function (n) { return '<div class="note"><div class="d">' + esc(n.date) + (n.h3 ? ' · ' + esc(n.h3) : '') + '</div>' + md(n.text) + '</div>'; }).join('') + '</div>', false, 'x:notebook', 'sec-notes') : '') +
      (h.left.length ? fold('เมล็ดที่ยังไม่ปลูก', 'words no meaning of ' + esc(h.th) + ' fits yet', h.left.length, '<div class="chips">' + h.left.map(function (l) { return '<span class="chip sm"><b>' + esc(l.th) + '</b><i>' + esc(l.r) + '</i><span>' + esc(l.gth.slice(0, 60)) + '</span></span>'; }).join('') + '</div>', false, 'd:plant') : '')
    );
    setTab('');
    crumbLabel(h.th + (h.en ? ' · ' + h.en.split(',')[0] : '') + (hiN ? ' · meaning ' + hiN : ''));
    hint('The word ' + esc(h.th) + '. Use <b>ไปที่ · jump to</b> to reach its picture, its origin or the words built from it. Tap a number on the picture to read that meaning. <b>แผนที่ · map</b> shows everything linked to ' + esc(h.th) + ' and where you came from.');
    main.querySelectorAll('.jump [data-to]').forEach(function (b) { b.addEventListener('click', function () {
      var el = document.getElementById(b.getAttribute('data-to')); if (!el) return;
      if (el.tagName === 'DETAILS') el.open = true;
      el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    }); });
    restoreScroll();
    var cv = document.getElementById('tree'), view = 'tree', lit = hiN != null ? +hiN : null, leaf = leafTh || null;
    pic(cv, function (c, W, H, t) {
      if (view === 'roots') {   /* the same drawing, lifted so the ground sits near the top and the roots fill the frame */
        var VH = H * 1.7, lift = VH * (W < 520 ? 0.52 : 0.58) - H * 0.22;
        c.save(); c.translate(0, -lift);
        var hs = MDTREE.draw(c, W, VH, t, h, { sky: true, hi: lit, leaf: leaf, roots: true });
        c.restore();
        return hs.map(function (q) { return { k: q.k, n: q.n, th: q.th, say: q.say, x: q.x, y: q.y - lift, r: q.r }; });
      }
      return MDTREE.draw(c, W, H, t, h, { sky: true, hi: lit, leaf: leaf });
    });
    main.querySelectorAll('.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        view = b.getAttribute('data-v');
        main.querySelectorAll('.seg button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        document.getElementById('hint').textContent = view === 'roots' ? 'แตะป้ายเพื่ออ่าน · tap a label to read it' : 'แตะตัวเลขเพื่ออ่านความหมาย · tap a number to read that meaning';
        cv._dirty = 1;
      });
    });
    var sr = document.getElementById('showroots');
    if (sr) sr.addEventListener('click', function () { var b = main.querySelector('.seg button[data-v=roots]'); if (b) b.click(); document.getElementById('sec-pic').scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' }); });
    function openSense(n, th, fromList) {
      if (fromList) { var sw = main.querySelector('.stage-wrap'); if (sw) sw.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' }); }
      lit = n; leaf = th || null; cv._dirty = 1; senseSheet(h, n, th, function (n2, th2) { lit = n2; leaf = th2; cv._dirty = 1; }); }
    var wl = document.getElementById('wlist'), group = store('group') || 'meaning';
    function renderWords() {
      main.querySelectorAll('.wgroup button').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-g') === group ? 'true' : 'false'); });
      var all = []; h.senses.forEach(function (sn) { sn.c.forEach(function (c) { all.push({ c: c, sn: sn }); }); });
      function row(o, withBadge) { return crow(o.c.th, o.c.r, o.c.en, o.c.parts, o.c.lit, h.th, withBadge ? nbadge(o.sn.n, o.sn.via) : ''); }
      function byTh(a, b) { return thCmp(a.c.th, b.c.th); }
      var html = '';
      if (group === 'meaning') {
        html = h.senses.map(function (sn) {
          var par = sn.ext != null ? bySense[sn.ext] : null, list = sn.c.map(function (c) { return { c: c, sn: sn }; }).sort(byTh);
          return '<div class="mgroup" style="--c:' + viaCol(sn.via) + '"><button class="mhead" data-n="' + sn.n + '"><span class="n">' + sn.n + '</span><span class="sx"><b>' + esc(sn.en || sn.th.slice(0, 50)) + '</b>' +
            '<small>' + (par ? 'grew from meaning ' + par.n + (par.en ? ' (' + esc(par.en) + ')' : '') + ' · ' + VIA_SAY[sn.via || ''] : esc(sn.th.slice(0, 70))) + '</small></span><span class="cnt">' + list.length + '</span></button>' +
            (list.length ? crows(list.map(function (o) { return row(o); }).join('')) : '<p class="muted none">ยังไม่มีคำ · no word is built on this meaning yet.</p>') + '</div>';
        }).join('');
      } else if (group === 'place') {
        var first = [], last = [], mid = [];
        all.forEach(function (o) { var i = o.c.parts.indexOf(h.th); (i === 0 ? first : i === o.c.parts.length - 1 ? last : mid).push(o); });
        [[first, esc(h.th) + ' มาก่อน · ' + esc(h.th) + ' comes first', esc(h.th) + ' + …'], [last, esc(h.th) + ' มาทีหลัง · ' + esc(h.th) + ' comes last', '… + ' + esc(h.th)], [mid, 'อยู่ตรงกลาง · in the middle', '… + ' + esc(h.th) + ' + …']].forEach(function (g) {
          if (!g[0].length) return;
          html += '<div class="mgroup"><div class="mhead plain"><span class="sx"><b>' + g[1] + '</b><small>' + g[2] + '</small></span><span class="cnt">' + g[0].length + '</span></div>' + crows(g[0].sort(byTh).map(function (o) { return row(o, true); }).join('')) + '</div>';
        });
      } else {
        html = crows(all.sort(byTh).map(function (o) { return row(o, true); }).join(''));
      }
      wl.innerHTML = html || '<p class="muted">ยังไม่มีคำ · no word is built from ' + esc(h.th) + ' yet.</p>';
      wl.querySelectorAll('.mhead[data-n]').forEach(function (b) { b.addEventListener('click', function () { openSense(+b.getAttribute('data-n'), null, true); }); });
    }
    main.querySelectorAll('.wgroup button').forEach(function (b) { b.addEventListener('click', function () { group = b.getAttribute('data-g'); store('group', group); renderWords(); }); });
    renderWords(); restoreScroll();
    cv.addEventListener('click', function (e) {
      var hit = hitAt(cv, e, 1.6);
      if (!hit) return;
      if (hit.k === 'sense') return openSense(hit.n);
      if (hit.k === 'leaf') return openSense(hit.n, hit.th);
      if (hit.k === 'root' || hit.k === 'word') {
        var hr = hit.th ? wordHref(hit.th) : null;
        openSheet('<div class="sh-body"><p class="say-big">' + esc(hit.say) + '</p>' + (hr ? '<a class="btn" href="' + hr + '">เปิด ' + esc(hit.th) + ' · open ›</a>' : '') + '<p class="muted">The same story as text is under ราก · roots below the meanings.</p></div>', 'ราก · root');
      }
    });
    if (lit != null) openSense(lit, leaf);
    if (!store('guided')) setTimeout(function () { if (location.hash.indexOf('#/w/' + s) === 0) guide(); }, 900);
  }).catch(pageMissing);
}

/* the panel a branch opens: its meaning, how it grew, its leaves; arrows walk the branches */
function senseSheet(h, n, th, onPick) {
  var i = h.senses.findIndex(function (x) { return x.n === n; }), sn = h.senses[i]; if (!sn) return;
  var by = {}; h.senses.forEach(function (x) { by[x.n] = x; });
  var par = sn.ext != null ? by[sn.ext] : null, kids = h.senses.filter(function (x) { return x.ext === sn.n && x !== sn; });
  var c = th ? sn.c.filter(function (x) { return x.th === th; })[0] : null;
  var html =
    '<div class="sh-top" style="--c:' + viaCol(sn.via) + '"><span class="n">' + sn.n + '</span><div><b>' + esc(sn.en || '—') + '</b><small>' + esc(h.th) + ' · ' + (sn.posth ? esc(sn.posth) + ' · ' : '') + esc(sn.pos) + '</small></div></div>' +
    '<div class="sh-body">' +
      '<p class="gth">' + esc(sn.th) + '</p>' +
      (par ? '<p class="grew"><i style="background:' + viaCol(sn.via) + '"></i>Grew from meaning <button class="lnk" data-n="' + par.n + '">' + par.n + ' ' + esc(par.en || '') + '</button>: ' + VIA_SAY[sn.via || ''] + ' (' + VIA[sn.via || ''].th + ')' + (sn.vn ? '. ' + esc(sn.vn) : '') + '</p>' : '<p class="grew"><i style="background:' + viaCol('') + '"></i>One of the word\'s first meanings.</p>') +
      (kids.length ? '<p class="grew">Meanings that grew from it: ' + kids.map(function (k) { return '<button class="lnk" data-n="' + k.n + '">' + k.n + ' ' + esc(k.en || '') + '</button>'; }).join(', ') + '</p>' : '') +
      (c ? '<div class="picked"><div class="pk-word"><b>' + esc(c.th) + '</b>' + speakBtn(c.th, true) + '</div><div class="muted">' + esc(c.r) + '</div>' + (c.en ? '<div class="pk-en">' + esc(c.en) + '</div>' : '') +
        '<div class="split big">' + c.parts.map(function (p) { return '<span class="' + (p === h.th ? 'hp' : 'xp') + '">' + esc(p) + '</span>'; }).join('<i>+</i>') + '</div>' + (litOf(c.parts, c.lit) ? '<div class="muted">ตามตัว · literally ' + esc(litOf(c.parts, c.lit)) + '</div>' : '') + '<a class="btn" href="#/k/' + enc(c.th) + '">เปิดคำนี้ · open this word ›</a></div>' : '') +
      (sn.c.length ? '<h3>คำที่สร้างจากความหมายนี้ · the ' + sn.c.length + (sn.c.length === 1 ? ' word' : ' words') + ' built on this meaning</h3>' + crows(sn.c.slice().sort(function (a, b) { return thCmp(a.th, b.th); }).map(function (x) { return crow(x.th, x.r, x.en, x.parts, x.lit, h.th); }).join('')) : '<p class="muted">ยังไม่มีคำ · no word is built on this meaning yet.</p>') +
    '</div>' +
    '<div class="sh-nav">' + (i > 0 ? '<button class="btn ghost" data-n="' + h.senses[i - 1].n + '">‹ ' + h.senses[i - 1].n + '</button>' : '<span></span>') +
      '<span class="muted">ความหมาย ' + (i + 1) + ' จาก ' + h.senses.length + ' · meaning ' + (i + 1) + ' of ' + h.senses.length + '</span>' +
      (i < h.senses.length - 1 ? '<button class="btn ghost" data-n="' + h.senses[i + 1].n + '">' + h.senses[i + 1].n + ' ›</button>' : '<span></span>') + '</div>';
  openSheet(html, 'ความหมาย ' + sn.n + ' · meaning ' + sn.n);
  sheet.querySelectorAll('[data-n]').forEach(function (b) { b.addEventListener('click', function () { var m = +b.getAttribute('data-n'); onPick(m, null); senseSheet(h, m, null, onPick); }); });
}
function openSheet(html, label) {
  sheet.innerHTML = '<div class="sh-grab" aria-hidden="true"></div><button class="sh-close" aria-label="ปิด · close">×</button>' + html;
  sheet.setAttribute('aria-label', label || ''); sheet.hidden = false; document.body.classList.add('has-sheet');
  wire(sheet); sheet.scrollTop = 0;
  sheet.querySelector('.sh-close').addEventListener('click', closeSheet);
}
function closeSheet() { sheet.hidden = true; sheet.innerHTML = ''; document.body.classList.remove('has-sheet'); }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!mapEl.hidden) closeMap(); else if (!guideEl.hidden) closeGuide(); else closeSheet(); } });
/* a swipe down on the panel's top closes it */
(function () { var y0 = null; sheet.addEventListener('touchstart', function (e) { y0 = sheet.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  sheet.addEventListener('touchend', function (e) { if (y0 != null && e.changedTouches[0].clientY - y0 > 90) closeSheet(); y0 = null; }, { passive: true }); })();

function originLine(h) {
  var R = h.roots || {}, f = (R.from || [])[0], tr = (R.tr || [])[0], cog = (R.cog || []).length, out = '';
  if (f && f[5] === 'loan') out = 'It is borrowed from ' + (f[1] || f[0]) + ' ' + f[2] + '.';
  else if (f) out = 'It is an inherited Tai word, from ' + (f[1] || f[0]) + ' ' + f[2] + '.';
  else if (h.o === 'tai') out = 'It is an inherited Tai word.';
  else if (ORIGIN[h.o] && h.o !== 'unknown' && h.o !== 'other') out = 'It comes from ' + ORIGIN[h.o][1] + '.';
  if (cog) out += ' The same word is found in ' + cog + ' sister languages.';
  if (tr) out += ' ThaiRoots files it under ' + tr.root + (tr.gloss ? ' (' + tr.gloss + ')' : '') + '.';
  return out;
}
function rootsHave(h) { var R = h.roots || {}; return !!((R.from || []).length || (R.cog || []).length || (R.tr || []).length); }
function rootsHtml(h) {
  if (!rootsHave(h)) return '';
  var R = h.roots;
  function row(g) { return '<span class="f">' + esc(g[2]) + '</span><span>' + (g[3] ? esc(g[3]) + ' · ' : '') + esc(g[1] || g[0]) + ' <span class="muted">' + esc(g[0]) + '</span>' + (g[4] ? ' “' + esc(g[4]) + '”' : '') + '</span>'; }
  return '<div class="roots-list">' +
      ((R.from || []).length ? '<div class="card"><h3>รากแก้ว · comes from, newest to oldest</h3><div class="cog">' + R.from.map(function (g) { return row(g.slice(0, 5)); }).join('') + '</div>' + ((R.cf || []).length ? '<h3>เทียบ · compare</h3><div class="cog">' + R.cf.map(row).join('') + '</div>' : '') + '</div>' : '') +
      ((R.cog || []).length ? '<div class="card"><h3>รากแขนง · the same word in sister languages</h3><div class="cog">' + R.cog.map(row).join('') + '</div></div>' : '') +
      (R.tr || []).map(function (f) {
        return '<div class="card tr-knot"><h3>ThaiRoots ' + esc(f.id) + (f.rel === 'root' ? ' · this word is the root' : ' · grown from this root') + '</h3><div class="tr-root">' + esc(f.root) + '</div><div>' + esc(f.gloss) + (f.gth ? ' · ' + esc(f.gth) : '') + (f.pali ? ' · Pali ' + esc(f.pali) : '') + '</div>' +
          (f.note ? '<p>' + linkifyThai(f.note) + '</p>' : '') + (f.noteT ? '<p class="muted">' + linkifyThai(f.noteT) + '</p>' : '') +
          '<div class="chips">' + f.der.slice(0, 30).map(function (d) { var hr = wordHref(d[0]); return hr ? chip(d[0], d[1], d[2], hr, 'sm') : '<span class="chip sm"><b>' + esc(d[0]) + '</b><i>' + esc(d[1]) + '</i><span>' + esc(d[2]) + '</span></span>'; }).join('') + '</div></div>';
      }).join('') +
    '</div>';
}

/* ---------------------------------------------------------------- a compound: what it means, how it is built, where it hangs */
function pageWord(th) {
  var w = IDX.words[th]; if (!w) return pageMissing();
  if (IDX.byTh[th]) { location.replace('#/w/' + IDX.byTh[th]); return; }
  var at = (w.a || []).filter(function (a) { return a[1] > 0; }), weed = (w.a || []).filter(function (a) { return a[1] === 0; });
  var first = at[0] || weed[0] || null;
  setTab('');
  if (!first) {   /* a part only: a word that appears inside compounds but is not filed as one */
    step('#/k/' + enc(th), th); here = { kind: 'word', w: th, parts: [] };
    put('<section class="word-head card"><div class="wh-id"><h1 class="th">' + esc(th) + '</h1>' + speakBtn(th) + '<p class="muted">A part of other words: it has no tree of its own here.</p></div></section>' +
      section('อยู่ในคำเหล่านี้', 'built into these compounds', 'x:net', (w.i || []).length) + '<div class="chips">' + (w.i || []).map(function (i) { return chip(i[0], 'on ' + BY[i[1]].th, '', '#/k/' + enc(i[0]), 'sm'); }).join('') + '</div>');
    return;
  }
  head(first[0]).then(function (h) {
    var sn = null, c = null, look = null;
    h.senses.forEach(function (s) { s.c.forEach(function (x) { if (x.th === th && !c) { c = x; sn = s; } }); });
    if (!c) h.look.forEach(function (l) { if (l.th === th) look = l; });
    here = { kind: 'word', w: th, parts: c ? c.parts : [] };
    if (look) {
      step('#/k/' + enc(th), th, (USE[look.use] || ['', ''])[1]); crumbLabel(th + ' · lookalike');
      hint(esc(th) + ' only looks like it contains ' + esc(h.th) + '. The box below says what it is.');
      put('<section class="word-head card"><div class="wh-pic"><canvas data-mark="x:mask"></canvas></div><div class="wh-id"><h1 class="th">' + esc(th) + '</h1><div class="say"><span class="rtgs">' + esc(look.r) + '</span></div>' + speakBtn(th) + '</div></section>' +
        '<div class="card verdict"><b>คำหน้าเหมือน · a lookalike</b><p>' + esc(th) + ' looks like a compound of ' + hlink(h.s) + ' and is not. ' + (USE[look.use] ? USE[look.use].join(' · ') + '.' : '') + '</p><p>' + linkifyThai(look.note) + '</p>' + (look.gth ? '<p class="muted">' + esc(look.gth) + '</p>' : '') +
        '<a class="btn" href="#/w/' + h.s + '">ดูต้น ' + esc(h.th) + ' · see the ' + esc(h.th) + ' tree ›</a></div>');
      restoreScroll();
      return;
    }
    step('#/k/' + enc(th), th, c.en);
    crumbLabel(th + (c.en ? ' · ' + c.en.split(/[;,]/)[0] : ''));
    var others = (c.parts || []).filter(function (p) { return p !== h.th; });
    var kin = [];
    others.forEach(function (p) { ((IDX.words[p] || {}).i || []).forEach(function (i) { if (i[0] !== th) kin.push(i); }); });
    var sibs = sn.c.filter(function (x) { return x.th !== th; });
    var also = (w.a || []).filter(function (a) { return a[0] !== h.s && a[1] > 0; });
    put(
      '<section class="word-head card">' +
        '<div class="wh-id"><h1 class="th">' + esc(th) + '</h1>' +
          '<div class="say"><span class="rtgs">' + esc(c.r) + '</span><span class="ipa">' + esc(c.ipa) + '</span></div>' +
          (c.en ? '<div class="en">' + esc(c.en) + '</div>' : '') +
          '<div class="wh-row">' + speakBtn(th) + '</div>' +
        '</div>' +
      '</section>' +
      (c.parts && c.parts.length ? '<section class="card build"><h3>ประกอบจาก · built from</h3><div class="equation">' + c.parts.map(function (p, i) {
        var hr = wordHref(p), hp = BY[IDX.byTh[p]];
        return (i ? '<span class="op">+</span>' : '') + (hr ? chip(p, hp ? hp.r : '', hp ? hp.en.split(',')[0] : '', hr) : '<span class="chip"><b>' + esc(p) + '</b></span>');
      }).join('') + '<span class="op">=</span><span class="chip whole"><b>' + esc(th) + '</b>' + (c.en ? '<span>' + esc(c.en) + '</span>' : '') + '</span></div>' +
        (litOf(c.parts, c.lit) ? '<p>ตามตัว · literally <b>' + esc(litOf(c.parts, c.lit)) + '</b></p>' : '') + '</section>' : '') +
      '<section class="card where"><h3>เติบโตที่ · where it grows</h3>' +
        '<p class="crumbs"><a href="#/w/' + h.s + '">' + esc(h.th) + ' <small>' + esc(h.en.split(',')[0]) + '</small></a><span>›</span><a href="#/w/' + h.s + '/' + sn.n + '/' + enc(th) + '" style="--c:' + viaCol(sn.via) + '"><i></i>meaning ' + sn.n + ' <small>' + esc(sn.en || '') + '</small></a><span>›</span><b>' + esc(th) + '</b></p>' +
        '<a class="k-pic" href="#/w/' + h.s + '/' + sn.n + '/' + enc(th) + '" aria-label="open the ' + esc(h.th) + ' tree at this leaf"><canvas id="ktree"></canvas><span class="k-cap">ใบสีแดงคือ ' + esc(th) + ' · the red leaf is this word, on meaning ' + sn.n + ' of ' + esc(h.th) + '. Tap to open the tree.</span></a>' +
        '<p class="gth">' + esc(c.gth) + '</p>' +
        '<div class="chips">' + (c.pat ? '<a class="pill" href="#/shape/' + enc(c.pat) + '">' + esc(c.pat) + ' · ' + esc(c.pat.split('+').map(function (x) { return POS[x] || x; }).join(' + ')) + '</a>' : '') +
          (c.fr && FRAME[c.fr] ? '<span class="pill">' + FRAME[c.fr].join(' · ') + '</span>' : '') +
          also.map(function (a) { return '<a class="pill" href="#/w/' + a[0] + '">also on ' + esc(BY[a[0]].th) + '</a>'; }).join('') + '</div>' +
      '</section>' +
      others.map(function (p) {
        var seenW = {}, list = ((IDX.words[p] || {}).i || []).filter(function (i) { if (i[0] === th || seenW[i[0]]) return false; seenW[i[0]] = 1; return true; }).map(function (i) { return i[0]; }).sort(thCmp);
        return list.length ? fold('คำอื่นที่มี ' + esc(p), 'other words with ' + esc(p) + (glossOf(p) ? ' (' + esc(glossOf(p)) + ')' : ''), list.length, crows(list.slice(0, 120).map(function (t) { return crowT(t, p); }).join('')), true, 'd:kinship') : '';
      }).join('') +
      (sibs.length ? fold('คำอื่นในความหมายเดียวกัน', 'other words built on ' + esc(h.th) + ', meaning ' + sn.n + (sn.en ? ' (' + esc(sn.en) + ')' : ''), sibs.length, crows(sibs.slice().sort(function (a, b) { return thCmp(a.th, b.th); }).map(function (x) { return crow(x.th, x.r, x.en, x.parts, x.lit, h.th); }).join('')), true, 'd:plant') : '')
    );
    restoreScroll();
    hint('The compound ' + esc(th) + ', built from ' + c.parts.map(esc).join(' + ') + '. Tap a part to open it, or <b>' + esc(h.th) + '</b> to see every word built from it. <b>แผนที่ · map</b> shows its relatives.');
    var cv = document.getElementById('ktree');
    pic(cv, function (cc, W, H, t) { return MDTREE.draw(cc, W, H, t, h, { sky: true, hi: sn.n, leaf: th, sign: true }); });
  }).catch(pageMissing);
}

/* ---------------------------------------------------------------- the net: every tree a knot, every shared compound a thread */
var NET = null;
function netLayout() {
  if (NET) return NET;
  var nodes = IDX.heads.map(function (h, i) { var a = i * 2.39996, r = 20 * Math.sqrt(i); return { s: h.s, h: h, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0 }; });
  var at = {}; nodes.forEach(function (n, i) { at[n.s] = i; });
  var E = IDX.edges.map(function (e) { return [at[e[0]], at[e[1]], e[2], e[3]]; });
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
  put(section('ตาข่าย', 'head words joined by the compounds they share', 'x:net') +
    '<div class="net-tools" id="nt"></div><div class="net-stage" id="ns"><canvas id="net" aria-label="the net of trees"></canvas>' +
    '<div class="net-zoom"><button data-z="1.25" aria-label="ซูมเข้า · zoom in">+</button><button data-z="0.8" aria-label="ซูมออก · zoom out">−</button><button data-z="0" aria-label="ดูทั้งหมด · fit">⤢</button></div>' +
    '<div class="net-card" id="nc">แตะจุดเพื่อดูคำที่ใช้ร่วมกัน · tap a dot to see which head words share compounds with it. Drag to move, pinch to zoom.</div></div>');
  setTab('net'); hint('Each dot is a head word. Tap a dot to see the head words it shares compounds with, then <b>เปิด · open</b> to go to it.');
  var N = netLayout(), cv = document.getElementById('net'), view = { x: 0, y: 0, k: 1.3 }, sel = null, domList = Object.keys(IDX.domains), dsel = null;
  var card = document.getElementById('nc'), tools = document.getElementById('nt');
  tools.innerHTML = '<button data-d="" class="on">ทั้งหมด · all</button>' + domList.filter(function (d) { return IDX.heads.some(function (h) { return h.d[0] === d; }); }).map(function (d) { return '<button data-d="' + d + '">' + esc(dom(d).th) + '</button>'; }).join('');
  tools.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; dsel = b.getAttribute('data-d') || null; tools.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); });
  document.querySelectorAll('.net-zoom button').forEach(function (b) { b.addEventListener('click', function () { var z = +b.getAttribute('data-z'); if (!z) { view = { x: 0, y: 0, k: 1 }; } else view.k = Math.max(0.3, Math.min(5, view.k * z)); }); });
  function col(h) { var i = domList.indexOf(h.d[0]); return DCOL[(i < 0 ? 9 : i) % DCOL.length]; }
  function choose(i) {
    sel = i;
    if (i == null) { card.innerHTML = 'แตะจุดเพื่อดูคำที่ใช้ร่วมกัน · tap a dot to see which head words share compounds with it.'; return; }
    var n = N.nodes[i], links = N.E.filter(function (e) { return e[0] === i || e[1] === i; });
    card.innerHTML = '<div class="nc-top"><b>' + esc(n.h.th) + '</b> <span>' + esc(n.h.r) + ' · ' + esc(n.h.en) + '</span><a class="btn" href="#/w/' + n.s + '">เปิดต้นนี้ · open ›</a></div>' +
      (links.length ? '<div class="chips">' + links.slice(0, 14).map(function (e) { var o = N.nodes[e[0] === i ? e[1] : e[0]]; return '<button class="chip sm" data-i="' + (e[0] === i ? e[1] : e[0]) + '"><b>' + esc(o.h.th) + '</b><span>' + e[3].slice(0, 3).map(esc).join(' · ') + '</span></button>'; }).join('') + '</div>' : '<p class="muted">It shares no compound with another head word.</p>');
    card.querySelectorAll('[data-i]').forEach(function (b) { b.addEventListener('click', function () { choose(+b.getAttribute('data-i')); }); });
  }
  pic(cv, function (c, W, H, t) {
    var k = view.k * Math.min(W, H) / (N.R * 2.2), ox = W / 2 + view.x, oy = H / 2 + view.y, hits = [];
    var cs = getComputedStyle(document.body);
    c.fillStyle = cs.getPropertyValue('--card') || '#fffaf0'; c.fillRect(0, 0, W, H);
    N.E.forEach(function (e) {
      var a = N.nodes[e[0]], b = N.nodes[e[1]], on = sel != null && (e[0] === sel || e[1] === sel);
      var dim = (dsel && a.h.d[0] !== dsel && b.h.d[0] !== dsel) || (sel != null && !on);
      c.strokeStyle = on ? '#d99a22' : dim ? 'rgba(120,100,80,.07)' : 'rgba(120,90,60,.28)'; c.lineWidth = on ? 3 : Math.min(3, e[2]);
      c.beginPath(); c.moveTo(ox + a.x * k, oy + a.y * k);
      c.quadraticCurveTo((a.x + b.x) / 2 * k + ox + Math.sin(t / 1500 + e[0]) * 4, (a.y + b.y) / 2 * k + oy, ox + b.x * k, oy + b.y * k); c.stroke();
    });
    var nb = {}; if (sel != null) N.E.forEach(function (e) { if (e[0] === sel) nb[e[1]] = 1; if (e[1] === sel) nb[e[0]] = 1; });
    N.nodes.forEach(function (n, i) {
      var x = ox + n.x * k, y = oy + n.y * k, r = (4 + Math.sqrt(n.h.nc) * 1.3) * Math.max(0.7, Math.min(1.8, view.k));
      var dim = (dsel && n.h.d[0] !== dsel) || (sel != null && i !== sel && !nb[i]);
      if (x < -40 || y < -40 || x > W + 40 || y > H + 40) return;
      c.globalAlpha = dim ? 0.2 : 1;
      MDSKY.paper(c, function (q) { q.beginPath(); q.arc(x, y, r, 0, 6.283); }, i === sel ? '#d99a22' : col(n.h), 0.6);
      if (view.k > 1.6 || n.h.nc > 45 || i === sel || nb[i]) { c.fillStyle = cs.getPropertyValue('--ink') || '#23180f'; c.font = '500 ' + Math.round(13 + Math.min(6, view.k * 3)) + 'px Mitr, sans-serif'; c.textAlign = 'center'; c.fillText(n.h.th, x, y + r + 15); }
      c.globalAlpha = 1;
      hits.push({ x: x, y: y, r: Math.max(16, r + 6), i: i });
    });
    return hits;
  });
  var pts = {}, moved = 0;
  cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; moved = 0; });
  cv.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return; var ids = Object.keys(pts), p = pts[e.pointerId];
    if (ids.length === 1) { view.x += e.clientX - p[0]; view.y += e.clientY - p[1]; moved += Math.abs(e.clientX - p[0]) + Math.abs(e.clientY - p[1]); }
    else if (ids.length === 2) { var o = pts[ids[0] == e.pointerId ? ids[1] : ids[0]], d0 = Math.hypot(p[0] - o[0], p[1] - o[1]), d1 = Math.hypot(e.clientX - o[0], e.clientY - o[1]); if (d0 > 0) view.k = Math.max(0.3, Math.min(5, view.k * d1 / d0)); moved += 20; }
    pts[e.pointerId] = [e.clientX, e.clientY];
  });
  function up(e) { if (pts[e.pointerId] && moved < 6) { var h = hitAt(cv, e); choose(h ? h.i : null); } delete pts[e.pointerId]; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; });
  cv.addEventListener('wheel', function (e) { e.preventDefault(); view.k = Math.max(0.3, Math.min(5, view.k * (e.deltaY < 0 ? 1.12 : 0.89))); }, { passive: false });
}

/* ---------------------------------------------------------------- browsing pages */
var SORTS = [['nc', 'คำที่สร้าง · most words built'], ['ns', 'ความหมาย · most meanings'], ['th', 'ก–ฮ · Thai alphabetical'], ['en', 'A–Z · English'], ['nl', 'หน้าเหมือน · most lookalikes']];
function sortHeads(hs, k) {
  return hs.slice().sort(function (x, y) { return k === 'th' ? thCmp(x.th, y.th) : k === 'en' ? x.en.toLowerCase().localeCompare(y.en.toLowerCase()) : (y[k] - x[k]) || thCmp(x.th, y.th); });
}
function sortBar(id) { return '<div class="sortbar" data-for="' + id + '" role="group" aria-label="เรียง · sort"><span>เรียง · sort</span>' + SORTS.map(function (s2) { return '<button data-k="' + s2[0] + '">' + s2[1] + '</button>'; }).join('') + '</div>'; }
function sortable(id, hs, render) {
  var box = document.getElementById(id), bar = main.querySelector('.sortbar[data-for="' + id + '"]');
  function go() {
    var k = store('sort') || 'nc';
    if (bar) bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-k') === k ? 'true' : 'false'); });
    box.innerHTML = render(sortHeads(hs, k), k); wire(box);
    box.querySelectorAll('[data-k]').forEach(function (b) { b.addEventListener('click', function () { store('sort', b.getAttribute('data-k')); go(); }); });
  }
  if (bar) bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; store('sort', b.getAttribute('data-k')); go(); });
  go();
}
function pageAll() {
  put(crumb('#/explore', 'สำรวจ', 'explore') + section('คำทั้งหมด', 'all ' + IDX.heads.length + ' head words', 'x:garden') + sortBar('allt') + '<div id="allt"></div>');
  setTab('explore'); hint('Tap a sort button or a column heading to change the order. Tap a word to open its page; its origin is there under <b>ที่มา · origin</b>.');
  sortable('allt', IDX.heads, function (a, k) {
    function th(key, t, e) { return '<th' + (key ? ' data-k="' + key + '" aria-sort="' + (k === key ? (key === 'th' || key === 'en' ? 'ascending' : 'descending') : 'none') + '" class="sortable' + (k === key ? ' on' : '') + '"' : '') + '>' + t + '<small>' + e + '</small></th>'; }
    return '<div class="tablewrap"><table class="wtable"><thead><tr>' + th('th', 'คำ', 'word') + th('en', 'ความหมายหลัก', 'English') + th('ns', 'ความหมาย', 'meanings') + th('nc', 'คำที่สร้าง', 'words built') + th('nl', 'หน้าเหมือน', 'lookalikes') + th('', 'ที่มา', 'origin') + '</tr></thead><tbody>' +
      a.map(function (h) { return '<tr><td><a href="#/w/' + h.s + '"><b>' + esc(h.th) + '</b><small>' + esc(h.r) + '</small></a></td><td>' + esc(h.en) + '</td><td class="num2">' + h.ns + '</td><td class="num2"><span class="bar" style="--w:' + Math.round(100 * h.nc / 118) + '%"></span>' + h.nc + '</td><td class="num2">' + (h.nl || '') + '</td><td>' + ORIGIN[h.o][1] + '</td></tr>'; }).join('') +
      '</tbody></table></div>';
  });
  restoreScroll();
}
function treeGrid(hs, sub) {
  return '<div class="grid">' + hs.map(function (h) {
    return '<a class="tile" href="#/w/' + h.s + '"><canvas data-tree="' + h.s + '"></canvas><div class="cap"><b>' + esc(h.th) + '</b><span>' + esc(h.r) + ' · ' + esc(h.en) + '</span><small>' + h.ns + ' meanings · ' + h.nc + ' compounds</small>' + (sub ? '<div class="muted sub">' + sub(h) + '</div>' : '') + '</div></a>';
  }).join('') + '</div>';
}
function crumb() { return ''; }   /* the path bar above every page does this now */
function pageBeds() {
  var cnt = {}; IDX.heads.forEach(function (h) { h.d.forEach(function (d) { cnt[d] = (cnt[d] || 0) + 1; }); });
  put(crumb('#/explore', 'สำรวจ', 'explore') + section('หมวด', 'topics; a tree stands in every topic its meanings reach', 'x:garden') +
    '<div class="topics">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (d) {
      return '<a class="topic" href="#/bed/' + enc(d) + '"><canvas data-mark="' + d + '"></canvas><b>' + esc(dom(d).th) + '</b><span>' + esc(dom(d).en) + '</span><em>' + cnt[d] + '</em></a>';
    }).join('') + '</div>');
  setTab('explore'); hint('Each tile is a topic. Tap one to see its words.');
}
function pageBed(d) {
  var hs = IDX.heads.filter(function (h) { return h.d.indexOf(d) >= 0; }).sort(function (a, b) { return b.nc - a.nc; });
  put(crumb('#/beds', 'หมวด', 'topics') + section(esc(dom(d).th), esc(dom(d).en), d, hs.length + ' words') + sortBar('tg') + '<div id="tg"></div>');
  sortable('tg', hs, function (a) { return treeGrid(a); });
  setTab('explore'); hint('Each card is one head word. Sort with the buttons; tap a card to open the word.'); restoreScroll();
}
function pageSeeds() {
  var cnt = {}; IDX.heads.forEach(function (h) { cnt[h.o] = (cnt[h.o] || 0) + 1; });
  put(crumb('#/explore', 'สำรวจ', 'explore') + section('ที่มา', 'where each word came from, as its etymology says', 'o:tai') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (o) {
      return '<a class="tile" href="#/seed/' + o + '"><canvas data-mark="o:' + o + '"></canvas><div class="cap"><b>' + ORIGIN[o][0] + '</b><span>' + ORIGIN[o][1] + ' · ' + cnt[o] + ' words</span></div></a>';
    }).join('') + '</div>');
  setTab('explore'); hint('Words grouped by where they came from. Tap a group to see its words.');
}
function pageSeed(o) {
  var hs = IDX.heads.filter(function (h) { return h.o === o; }).sort(function (a, b) { return b.nc - a.nc; });
  put(crumb('#/seeds', 'ที่มา', 'origins') + section(ORIGIN[o] ? ORIGIN[o][0] : o, ORIGIN[o] ? ORIGIN[o][1] : '', 'o:' + o, hs.length + ' words') + sortBar('tg') + '<div id="tg"></div>');
  sortable('tg', hs, function (a) { return treeGrid(a, function (h) { return esc((h.ety || '').slice(0, 90)); }); });
  setTab('explore'); hint('Each card is one head word from this source. Sort with the buttons; tap a card to open the word and read its origin.'); restoreScroll();
}
function pageGrafts() {
  var cnt = {}; IDX.heads.forEach(function (h) { h.sen.forEach(function (r) { if (r[2] != null && r[3]) cnt[r[3]] = (cnt[r[3]] || 0) + 1; }); });
  put(crumb('#/explore', 'สำรวจ', 'explore') + section('ความหมายงอก', 'how one meaning grows out of another', 'v:metaphor') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (v) {
      return '<a class="tile" href="#/via/' + v + '"><canvas data-mark="v:' + v + '"></canvas><div class="cap"><b style="color:' + viaCol(v) + '">' + VIA[v].th + ' · ' + VIA[v].en + '</b><span>' + VIA_SAY[v] + ' · ' + cnt[v] + ' meanings</span></div></a>';
    }).join('') + '</div>');
  setTab('explore'); hint('How one meaning of a word grows out of another. Tap a kind to see examples.');
}
function pageVia(v) {
  var rows = [];
  IDX.heads.forEach(function (h) { var by = {}; h.sen.forEach(function (r) { by[r[0]] = r; }); h.sen.forEach(function (r) { if (r[3] === v && r[2] != null && by[r[2]]) rows.push([h, by[r[2]], r]); }); });
  rows.sort(function (a, b) { return b[0].nc - a[0].nc; });
  put(crumb('#/grafts', 'ความหมายงอก', 'how meanings grow') + section(VIA[v] ? VIA[v].th + ' · ' + VIA[v].en : v, VIA_SAY[v] || '', 'v:' + v, rows.length) +
    '<div class="grid">' + rows.map(function (x) {
      return '<a class="card via-card" style="--c:' + viaCol(v) + '" href="#/w/' + x[0].s + '/' + x[2][0] + '"><b class="vt">' + esc(x[0].th) + '</b> <span class="muted">' + esc(x[0].r) + '</span>' +
        '<div class="vflow"><span>' + esc(x[1][1] || '—') + '</span><em>→</em><span>' + esc(x[2][1] || '—') + '</span></div><div class="muted">' + esc(x[2][5] || '') + '</div></a>';
    }).join('') + '</div>');
  setTab('explore'); hint('Each card shows a word, the meaning it started with, and the meaning that grew from it. Tap a card to open that meaning.'); restoreScroll();
}
function pageShapes() {
  var cnt = {}; IDX.compounds.forEach(function (c) { if (c[5]) cnt[c[5]] = (cnt[c[5]] || 0) + 1; });
  put(crumb('#/explore', 'สำรวจ', 'explore') + section('รูปคำ', 'how compounds are put together', 'd:speech') +
    '<div class="grid">' + Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (p) {
      var ex = IDX.compounds.filter(function (c) { return c[5] === p; }).slice(0, 4).map(function (c) { return c[0]; }).join(' · ');
      return '<a class="card shape" href="#/shape/' + enc(p) + '"><b>' + esc(p.split('+').map(function (x) { return POS[x] || x; }).join(' + ')) + '</b> <span class="muted">' + cnt[p] + '</span><div class="ex">' + esc(ex) + '</div></a>';
    }).join('') + '</div>');
  setTab('explore'); hint('Compounds grouped by the kinds of words they join. Tap a shape to see its compounds.');
}
function pageShape(p) {
  var cs = IDX.compounds.filter(function (c) { return c[5] === p; }), byF = {};
  cs.forEach(function (c) { (byF[c[6] || ''] = byF[c[6] || ''] || []).push(c); });
  put(crumb('#/shapes', 'รูปคำ', 'word shapes') + section(esc(p.split('+').map(function (x) { return POS[x] || x; }).join(' + ')), esc(p), 'd:speech', cs.length) +
    Object.keys(byF).map(function (f) { return fold(FRAME[f] ? FRAME[f][0] : 'อื่น ๆ', FRAME[f] ? 'names ' + FRAME[f][1] : 'other', byF[f].length, crows(byF[f].slice().sort(function (a, b) { return thCmp(a[0], b[0]); }).slice(0, 400).map(function (c) { return crowC(c); }).join('')), Object.keys(byF).length < 3); }).join(''));
  setTab('explore'); hint('Each row shows a compound, the parts it is built from and what it means. Tap a row to open it.'); restoreScroll();
}
function pageWeeds() {
  var by = {}; IDX.look.forEach(function (l) { (by[l[2]] = by[l[2]] || []).push(l); });
  var ks = Object.keys(by).sort(function (a, b) { return by[b].length - by[a].length; });
  put(crumb('#/explore', 'สำรวจ', 'explore') + section('คำหน้าเหมือน', 'lookalikes: words that look built from a head word and are not', 'x:mask', IDX.look.length) +
    '<p class="lede">ตา sits inside เมตตา only by spelling: เมตตา is Pali mettā, loving-kindness. The filer pulled each of these out and wrote down why.</p>' +
    ks.map(function (s) { return fold(esc(BY[s].th), esc(BY[s].r) + ' · ' + esc(BY[s].en), by[s].length, '<div class="chips">' + by[s].map(function (l) { return '<a class="chip sm" href="#/k/' + enc(l[0]) + '"><b>' + esc(l[0]) + '</b><i>' + esc(l[1]) + '</i><span>' + (USE[l[3]] || [l[3], l[3]])[1] + '</span></a>'; }).join('') + '</div>', false); }).join(''));
  setTab('explore'); hint('Words grouped by the head word they seem to contain. Tap a group to open it, then a word to read why it is a lookalike.'); restoreScroll();
}
function pageNotes(s) {
  J('data/notes.json').then(function (N) {
    var list = s ? N.filter(function (n) { return n.a.indexOf(s) >= 0; }) : N, groups = [], cur = null;
    list.forEach(function (n) {
      if (!cur || cur.h !== n.h2) { cur = { h: n.h2, items: [] }; groups.push(cur); }
      cur.items.push('<div class="note">' + (n.h3 ? '<div class="d">' + linkifyThai(n.h3) + '</div>' : '') + md(n.t) + (n.a.length ? '<div class="d">' + n.a.map(hlink).join(' · ') + '</div>' : '') + '</div>');
    });
    put(crumb('#/explore', 'สำรวจ', 'explore') + section('สมุดของผู้จัด', 'the compound filer\'s notebook' + (s ? ' on ' + esc(BY[s].th) : ', from 31 Aug 2026'), 'x:notebook') +
      '<p class="lede">The filer read each word and decided which meaning every compound grows from. These notes say why.</p>' +
      groups.map(function (g, i) { return fold(linkifyThai(g.h), '', g.items.length, '<div class="notes">' + g.items.join('') + '</div>', i === 0); }).join(''));
    setTab('explore'); hint('The filer\'s notes, grouped by the day they were written. Tap a heading to open it; tap a Thai word to open its page.'); restoreScroll();
  });
}
function pageTrail() {
  var t = trail().slice().reverse();
  put(section('ประวัติ', 'the words you have opened, newest first', 'x:trail', t.length || null) +
    (t.length ? '<div class="trail">' + t.map(function (x) { return '<a href="' + x[0] + '"><b>' + esc(x[1]) + '</b>' + (x[2] ? '<span>' + esc(String(x[2]).split(',')[0]) + '</span>' : '') + '</a>'; }).join('') + '</div><p><button class="btn ghost" id="clr">ลบรอยเท้า · clear the trail</button></p>'
      : '<div class="card empty"><canvas data-mark="x:trail"></canvas><p>ยังไม่มีรอยเท้า · no steps yet. Open any word, or press <b>เดินเล่น · wander</b> to jump to a linked one.</p></div>'));
  setTab('trail'); hint('Every word you opened, newest first. Tap one to go back to it.');
  var b = document.getElementById('clr'); if (b) b.addEventListener('click', function () { store('trail', []); pageTrail(); });
}

/* ---------------------------------------------------------------- play: the filer's own job, as two games */
function pagePlay() {
  var sc = store('score') || { r: 0, n: 0, best: 0, run: 0 }, mode = store('mode') || 'branch';
  put(section('เล่น', 'file the words yourself', 'x:wander') +
    '<div class="seg game-pick" role="tablist"><button role="tab" data-m="branch" aria-selected="' + (mode === 'branch') + '">ความหมายไหน · which meaning?</button><button role="tab" data-m="weed" aria-selected="' + (mode === 'weed') + '">ของจริงหรือหน้าเหมือน · built from it, or a lookalike?</button></div>' +
    '<p class="lede" id="how"></p><div class="card game" id="game"></div>' +
    '<p class="score" id="score"></p>');
  setTab('play'); hint('Pick a game, answer, then press <b>ต่อ · next</b>. Your score is kept on this device.');
  var g = document.getElementById('game');
  function tally() { document.getElementById('score').innerHTML = 'ถูก ' + sc.r + ' จาก ' + sc.n + ' · ' + sc.r + ' right of ' + sc.n + (sc.run > 1 ? ' · ติดกัน ' + sc.run + ' in a row' : '') + (sc.best > 1 ? ' · best run ' + sc.best : ''); }
  function mark(ok) { sc.n++; if (ok) { sc.r++; sc.run = (sc.run || 0) + 1; sc.best = Math.max(sc.best || 0, sc.run); } else sc.run = 0; store('score', sc); tally(); }
  main.querySelectorAll('.game-pick button').forEach(function (b) { b.addEventListener('click', function () { mode = b.getAttribute('data-m'); store('mode', mode); main.querySelectorAll('.game-pick button').forEach(function (x) { x.setAttribute('aria-selected', x === b); }); round(); }); });
  function round() {
    document.getElementById('how').textContent = mode === 'weed'
      ? 'Is the word built from the head word, or does it only look that way?'
      : 'A compound word grows on one meaning of its head word. Pick the meaning it grows on.';
    var pool = IDX.heads.filter(function (h) { return mode === 'weed' ? h.nl >= 2 && h.nc >= 4 : h.sen.filter(function (r) { return r[4] > 0 && r[1]; }).length >= 2; });
    var h = pick(pool);
    g.innerHTML = '<div class="loading"><canvas width="80" height="80" data-head="' + h.s + '"></canvas></div>'; wire(g);
    head(h.s).then(function (H) {
      if (mode === 'weed') {
        var isWeed = Math.random() < 0.5, w;
        if (isWeed) w = pick(H.look); else { var all = []; H.senses.forEach(function (s) { s.c.forEach(function (c) { all.push(c); }); }); w = pick(all); }
        g.innerHTML = '<div class="q-head">Is this built on <b>' + esc(H.th) + '</b> <span class="muted">' + esc(H.r) + ' · ' + esc(H.en.split(',')[0]) + '</span>?</div><div class="q">' + esc(w.th) + '</div><div class="muted">' + esc(w.r) + '</div>' +
          '<div class="answers two"><button data-a="1"><span class="n" style="background:#2f7a46">ใ</span><span><b>สร้างจาก · built from it</b><small>a compound of ' + esc(H.th) + '</small></span></button><button data-a="0"><span class="n" style="background:#7a3a6e">ว</span><span><b>หน้าเหมือน · a lookalike</b><small>only looks that way</small></span></button></div><div id="why"></div>';
        wire(g);
        g.querySelectorAll('.answers button').forEach(function (b) { b.addEventListener('click', function () {
          var ok = (b.getAttribute('data-a') === '0') === isWeed; mark(ok);
          g.querySelectorAll('.answers button').forEach(function (x) { x.disabled = true; x.classList.add((x.getAttribute('data-a') === '0') === isWeed ? 'right' : 'wrong'); });
          document.getElementById('why').innerHTML = '<div class="verdict ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'ถูก · right' : 'ไม่ใช่ · not quite') + '</b><p>' + (isWeed ? rich(w.note) : esc(w.th) + (w.en ? ' means ' + esc(w.en) : '') + (w.lit ? ', literally ' + esc(w.lit) : '') + '.') + '</p></div>' +
            '<div class="row"><button class="btn" id="next">ต่อ · next ›</button><a class="btn ghost" href="#/k/' + enc(w.th) + '">ดูคำ · see the word</a></div>';
          document.getElementById('next').addEventListener('click', round); document.getElementById('next').focus();
        }); });
        return;
      }
      var withC = H.senses.filter(function (s) { return s.c.length && s.en; }), right = pick(withC), c = pick(right.c);
      var opts = [right].concat(withC.filter(function (s) { return s !== right; }).sort(function () { return Math.random() - 0.5; }).slice(0, 3)).sort(function (a, b) { return a.n - b.n; });
      g.innerHTML = '<div class="q-head">Which meaning of <b>' + esc(H.th) + '</b> <span class="muted">' + esc(H.r) + '</span> does it grow on?</div><div class="q">' + esc(c.th) + '</div><div class="muted">' + esc(c.r) + (c.en ? ' · ' + esc(c.en) : '') + '</div>' +
        '<div class="answers">' + opts.map(function (s) { return '<button data-n="' + s.n + '"><span class="n" style="background:' + viaCol(s.via) + '">' + s.n + '</span><span><b>' + esc(s.en) + '</b><small>' + esc(s.th.slice(0, 60)) + '</small></span></button>'; }).join('') + '</div><div id="why"></div>';
      g.querySelectorAll('.answers button').forEach(function (b) { b.addEventListener('click', function () {
        var ok = +b.getAttribute('data-n') === right.n; mark(ok);
        g.querySelectorAll('.answers button').forEach(function (x) { x.disabled = true; x.classList.add(+x.getAttribute('data-n') === right.n ? 'right' : 'wrong'); });
        document.getElementById('why').innerHTML = '<div class="verdict ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'ถูก · right' : 'ไม่ใช่ · it grows on ' + right.n + ', ' + esc(right.en)) + '</b></div>' +
          '<div class="row"><button class="btn" id="next">ต่อ · next ›</button><a class="btn ghost" href="#/w/' + H.s + '/' + right.n + '/' + enc(c.th) + '">ดูบนต้นไม้ · see it on the tree</a></div>' +
          (H.rule ? fold('วิธีแบ่ง', 'how the filer divided ' + esc(H.th), null, '<p class="rule">' + rich(H.rule) + '</p>', false) : '');
        document.getElementById('next').addEventListener('click', round); document.getElementById('next').focus();
      }); });
    });
  }
  tally(); round();
}
function pageMissing() { put('<div class="card empty"><canvas data-mark="x:search"></canvas><p>ไม่พบหน้านี้ · this page is not in the garden.</p><p><a class="btn" href="#/">กลับสวน · back to the garden</a></p></div>'); setTab(''); }

/* ---------------------------------------------------------------- the guide: a real tree, one part at a time */
var GUIDE = [
  ['trunk', 'ต้นหนึ่งคือคำหนึ่ง', 'Each tree is one Thai word. This one is ตา, the eye.'],
  ['sense', 'กิ่งคือความหมาย', 'Each numbered branch is one meaning of the word. A branch grows out of the meaning it came from, and its colour says how: by metaphor, by naming a neighbour, by narrowing or widening.'],
  ['leaf', 'ใบคือคำประสม', 'Each leaf is one compound word built on that meaning, like ตาข่าย, a net. Tap a branch or a leaf to see its words.'],
  ['weed', 'วัชพืช', 'Weeds at the foot only look like they contain the word. เมตตา has ตา in its spelling, and is Pali mettā, loving-kindness.'],
  ['root', 'ราก', 'Under the ground: where the word came from, and the same word in Lao, Shan and other sister languages. Switch to ราก · the roots on any tree to read them.'],
  ['', 'เดินเล่น', 'Search any word at the top, or press เดินเล่น · wander to jump to a linked word. The ? button brings this tour back.']
];
var gStep = 0, gTree = null;
function guide() {
  gStep = 0; guideEl.hidden = false; document.body.classList.add('has-guide');
  guideEl.innerHTML = '<div class="g-box"><canvas id="gcv"></canvas><div class="g-text" aria-live="polite"></div><div class="g-nav"><button class="btn ghost" id="gskip">ข้าม · skip</button><span id="gdots"></span><button class="btn" id="gnext">ต่อ · next ›</button></div></div>';
  var cv = document.getElementById('gcv');
  (gTree ? Promise.resolve(gTree) : head('ta')).then(function (h) {
    gTree = h;
    var big = h.senses.slice().sort(function (a, b) { return b.c.length - a.c.length; })[0].n;
    pic(cv, function (c, W, H, t) {
      var key = GUIDE[gStep][0], lift = key === 'root' ? H * 0.75 : 0, VH = H * 1.75;
      c.save(); c.translate(0, -lift);
      var hs = MDTREE.draw(c, W, VH, t, h, { sky: true, roots: true, hi: key === 'sense' || key === 'leaf' ? big : null });
      c.restore();
      var target = null;
      hs.forEach(function (q) {
        if (target) return;
        if (key === 'sense' && q.k === 'sense' && q.n === big) target = q;
        if (key === 'leaf' && q.k === 'leaf' && q.n === big) target = q;
        if (key === 'trunk' && q.k === 'trunk') target = q;
        if (key === 'weed' && q.k === 'weed') target = q;
        if (key === 'root' && q.k === 'root') target = q;
      });
      if (target) {
        var x = target.x, y = target.y - lift, pr = 26 + 6 * Math.sin(t / 250);
        c.save(); c.fillStyle = 'rgba(20,12,4,.38)'; c.beginPath(); c.rect(0, 0, W, H); c.arc(x, y, pr + 14, 0, 6.283, true); c.fill('evenodd');
        c.strokeStyle = '#f6d25a'; c.lineWidth = 4; c.beginPath(); c.arc(x, y, pr, 0, 6.283); c.stroke(); c.restore();
      }
    });
    show();
  });
  function show() {
    var s = GUIDE[gStep];
    guideEl.querySelector('.g-text').innerHTML = '<b>' + s[1] + '</b><p>' + s[2] + '</p>';
    document.getElementById('gdots').innerHTML = GUIDE.map(function (x, i) { return '<i class="' + (i === gStep ? 'on' : '') + '"></i>'; }).join('');
    document.getElementById('gnext').textContent = gStep === GUIDE.length - 1 ? 'เริ่มเลย · start' : 'ต่อ · next ›';
    cv._dirty = 1;
  }
  document.getElementById('gnext').addEventListener('click', function () { if (gStep < GUIDE.length - 1) { gStep++; show(); } else closeGuide(); });
  document.getElementById('gskip').addEventListener('click', closeGuide);
  document.getElementById('gnext').focus();
}
function closeGuide() { guideEl.hidden = true; guideEl.innerHTML = ''; document.body.classList.remove('has-guide'); store('guided', 1); var inv = main.querySelector('.invite'); if (inv) inv.remove(); }

/* ---------------------------------------------------------------- the map: you are here, and every way on from here */
var mapEl = document.getElementById('map'), MAPK = {
  came: ['ทางที่มา', 'the way you came', '#8a7a68'],
  meanings: ['ความหมาย', 'its meanings', '#6b4426'],
  built: ['คำที่สร้างจากคำนี้', 'words built from it', '#2f7a46'],
  shares: ['ใช้คำร่วมกัน', 'shares compounds with', '#c8862a'],
  topic: ['หมวดเดียวกัน', 'same topic', '#24507a'],
  origin: ['ที่มาเดียวกัน', 'same origin', '#7a3a6e'],
  parts: ['ส่วนประกอบ', 'its parts', '#9a2a1f'],
  head: ['คำหลัก', 'filed under', '#2f7a46'],
  siblings: ['ความหมายเดียวกัน', 'same meaning of the head word', '#5a8a3a'],
  kin: ['มีส่วนเดียวกัน', 'share a part', '#c8862a'],
  places: ['ส่วนต่าง ๆ', 'places in the garden', '#24507a'],
  recent: ['เพิ่งเปิด', 'recently opened', '#7a3a6e']
};
var MAP_SORTS = [['close', 'ใกล้ชิดที่สุด · closest link'], ['nc', 'คำที่สร้างมาก · most words built'], ['th', 'ก–ฮ · Thai alphabetical']];
function headItem(kind, s2, score, why) { var o = BY[s2]; return { kind: kind, th: o.th, sub: o.en.split(',')[0], href: '#/w/' + s2, score: score || 0, nc: o.nc, why: why || '' }; }
function wordItem(kind, th, score, why) {
  var hs = IDX.byTh[th]; if (hs) return headItem(kind, hs, score, why);
  var c = cinfo(th); return { kind: kind, th: th, sub: c ? (c[2] || '').split(/[;,]/)[0] : '', href: wordHref(th) || '#/', score: score || 0, nc: c && BY[c[3]] ? BY[c[3]].nc : 0, why: why || '' };
}
function mapData() {
  var hsh = decodeURIComponent(location.hash.replace(/^#\/?/, '')), p = hsh.split('/'), items = [], center;
  PATH.slice(0, -1).forEach(function (q, i) { items.push({ kind: 'came', th: q[1].split(' · ')[0], sub: q[1].split(' · ').slice(1).join(' · '), href: q[0], score: i + 1, nc: 0, step: i }); });
  if (p[0] === 'w' && BY[p[1]]) {
    var s = p[1], b = BY[s], H = HEADS[s];
    center = { th: b.th, sub: b.en.split(',')[0], kind: 'head' };
    (H ? H.senses : b.sen.map(function (r) { return { n: r[0], en: r[1], via: r[3], c: { length: r[4] } }; })).forEach(function (sn) { items.push({ kind: 'meanings', th: String(sn.n), sub: sn.en || '', href: '#/w/' + s + '/' + sn.n, score: sn.c.length, nc: sn.c.length, why: sn.c.length + ' words', col: viaCol(sn.via) }); });
    IDX.compounds.forEach(function (c) { if (c[3] === s) items.push({ kind: 'built', th: c[0], sub: (c[2] || '').split(/[;,]/)[0], href: '#/k/' + enc(c[0]), score: 1, nc: 0, why: c[7] ? c[7].replace(/\+/g, ' + ') : '' }); });
    IDX.edges.forEach(function (e) { if (e[0] === s || e[1] === s) { var o = e[0] === s ? e[1] : e[0]; items.push(headItem('shares', o, e[2], e[3].slice(0, 3).join(' · '))); } });
    var d0 = b.d[0]; IDX.heads.forEach(function (o) { if (o.s === s) return; if (d0 && o.d[0] === d0) items.push(headItem('topic', o.s, 0, dom(d0).en)); if (o.o === b.o) items.push(headItem('origin', o.s, 0, ORIGIN[b.o][1])); });
  } else if (p[0] === 'k' && cinfo(p.slice(1).join('/'))) {
    var th = p.slice(1).join('/'), c = cinfo(th), hs2 = c[3], parts = c[7] ? c[7].split('+') : [];
    center = { th: th, sub: (c[2] || '').split(/[;,]/)[0], kind: 'word' };
    parts.forEach(function (q) { if (wordHref(q)) items.push(wordItem('parts', q, 3, glossOf(q))); });
    if (BY[hs2]) items.push(headItem('head', hs2, 3, 'meaning ' + c[4]));
    IDX.compounds.forEach(function (x) { if (x[3] === hs2 && x[4] === c[4] && x[0] !== th) items.push({ kind: 'siblings', th: x[0], sub: (x[2] || '').split(/[;,]/)[0], href: '#/k/' + enc(x[0]), score: 1, nc: 0, why: x[7] ? x[7].replace(/\+/g, ' + ') : '' }); });
    var seenK = {}; parts.forEach(function (q) { ((IDX.words[q] || {}).i || []).forEach(function (i) { if (i[0] !== th && !seenK[i[0]]) { seenK[i[0]] = 1; items.push(wordItem('kin', i[0], 1, 'with ' + q)); } }); });
  } else {
    var lab = PATH.length ? PATH[PATH.length - 1][1] : 'สวน · home';
    center = { th: lab.split(' · ')[0], sub: lab.split(' · ').slice(1).join(' · '), kind: 'page' };
    [['#/', 'สวน', 'home'], ['#/all', 'คำทั้งหมด', 'all words'], ['#/beds', 'หมวด', 'topics'], ['#/seeds', 'ที่มา', 'origins'], ['#/grafts', 'ความหมายงอก', 'how meanings grow'], ['#/shapes', 'รูปคำ', 'word shapes'],
     ['#/weeds', 'คำหน้าเหมือน', 'lookalikes'], ['#/notes', 'สมุด', 'notebook'], ['#/net', 'ตาข่าย', 'net'], ['#/play', 'เล่น', 'play'], ['#/trail', 'ประวัติ', 'history']].forEach(function (q, i) {
      if (q[0] !== location.hash && !(q[0] === '#/' && !hsh)) items.push({ kind: 'places', th: q[1], sub: q[2], href: q[0], score: 20 - i, nc: 0 });
    });
    trail().slice(-12).reverse().forEach(function (t2, i) { items.push({ kind: 'recent', th: t2[1], sub: String(t2[2] || '').split(',')[0], href: t2[0], score: 12 - i, nc: 0 }); });
  }
  return { center: center, items: items };
}
var mapState = { kind: '', sort: 'close' };
function openMap() {
  var D = mapData(), kinds = [];
  D.items.forEach(function (it) { if (kinds.indexOf(it.kind) < 0) kinds.push(it.kind); });
  if (mapState.kind && kinds.indexOf(mapState.kind) < 0) mapState.kind = '';
  mapEl.innerHTML = '<div class="map-box">' +
    '<div class="map-top"><div><small>แผนที่ · map</small><b>คุณอยู่ที่ <span>' + esc(D.center.th) + '</span></b><small>you are here' + (D.center.sub ? ': ' + esc(D.center.sub) : '') + '</small></div><button class="sh-close" id="mapx" aria-label="ปิด · close">×</button></div>' +
    '<div class="map-kinds" role="group" aria-label="แสดง · show"><button data-k=""' + (mapState.kind ? '' : ' aria-pressed="true"') + '>ทั้งหมด · all</button>' +
      kinds.map(function (k) { var n = D.items.filter(function (i) { return i.kind === k; }).length; return '<button data-k="' + k + '"' + (mapState.kind === k ? ' aria-pressed="true"' : '') + '><i style="background:' + MAPK[k][2] + '"></i>' + MAPK[k][0] + ' · ' + MAPK[k][1] + ' <em>' + n + '</em></button>'; }).join('') + '</div>' +
    '<div class="map-stage"><canvas id="mapcv" aria-label="แผนที่ · a map of what links to ' + esc(D.center.th) + '"></canvas></div>' +
    '<div class="map-sort" role="group" aria-label="เรียง · sort"><span>ไปต่อที่ไหน · where next, sorted by</span>' + MAP_SORTS.map(function (q) { return '<button data-s="' + q[0] + '"' + (mapState.sort === q[0] ? ' aria-pressed="true"' : '') + '>' + q[1] + '</button>'; }).join('') + '</div>' +
    '<div class="map-list" id="maplist"></div></div>';
  mapEl.hidden = false; document.body.classList.add('has-guide');
  function chosen() {
    var list = D.items.filter(function (i) { return mapState.kind ? i.kind === mapState.kind : true; });
    var k = mapState.sort;
    return list.slice().sort(function (a, b) { return k === 'th' ? thCmp(a.th, b.th) : k === 'nc' ? (b.nc - a.nc) || thCmp(a.th, b.th) : (b.score - a.score) || (b.nc - a.nc) || thCmp(a.th, b.th); });
  }
  function drawList() {
    var list = chosen(), groups = {};
    if (mapState.kind) groups[mapState.kind] = list; else list.forEach(function (i) { (groups[i.kind] = groups[i.kind] || []).push(i); });
    document.getElementById('maplist').innerHTML = kinds.filter(function (k) { return groups[k]; }).map(function (k) {
      var g = groups[k], cap = mapState.kind ? 400 : 8;
      return '<section><h3><i style="background:' + MAPK[k][2] + '"></i>' + MAPK[k][0] + ' · ' + MAPK[k][1] + ' <small>' + g.length + '</small></h3>' +
        g.slice(0, cap).map(function (i) { return '<a class="mrow" href="' + i.href + '"><i style="background:' + (i.col || MAPK[k][2]) + '"></i><b>' + esc(i.th) + '</b><span>' + esc(i.sub) + (i.why ? ' <small>' + esc(i.why) + '</small>' : '') + '</span>' + (i.nc && k !== 'meanings' ? '<em>' + i.nc + '</em>' : '') + '</a>'; }).join('') +
        (g.length > cap ? '<button class="btn ghost more" data-k="' + k + '">ดูทั้ง ' + g.length + ' · show all ' + g.length + '</button>' : '') + '</section>';
    }).join('');
    mapEl.querySelectorAll('.more').forEach(function (b) { b.addEventListener('click', function () { mapState.kind = b.getAttribute('data-k'); openMap(); }); });
  }
  var cv = document.getElementById('mapcv');
  pic(cv, function (c, W, H, t) {
    var list = chosen(), cx = W * 0.54, cy = H * 0.47, RX = W * 0.35, RY = H * 0.37, hits = [];
    var cs = getComputedStyle(document.body), ink = cs.getPropertyValue('--ink') || '#23180f';
    c.fillStyle = cs.getPropertyValue('--card') || '#fffaf0'; c.fillRect(0, 0, W, H);
    var came = list.filter(function (i) { return i.kind === 'came'; }).sort(function (a, b) { return a.step - b.step; }).slice(-4);
    var rest = list.filter(function (i) { return i.kind !== 'came'; });
    var ks = []; rest.forEach(function (i) { if (ks.indexOf(i.kind) < 0) ks.push(i.kind); });
    var per = mapState.kind ? (W < 520 ? 12 : 18) : Math.max(3, Math.floor((W < 520 ? 16 : 26) / Math.max(1, ks.length)));
    var nodes = [];
    /* the way you came: stepping stones from the left edge into the centre */
    came.forEach(function (i, j) { var u = (j + 1) / (came.length + 1); nodes.push({ it: i, x: W * 0.07 + (cx - W * 0.07) * u * 0.85, y: H * 0.9 - (H * 0.9 - cy) * u * u, r: 11, col: MAPK.came[2] }); });
    /* everything else on a ring round the centre, one sector per kind */
    var span = came.length ? Math.PI * 1.55 : Math.PI * 2, a0 = came.length ? -Math.PI * 0.95 : -Math.PI / 2, slot = span / Math.max(1, ks.length);
    ks.forEach(function (k, ki) {
      var g = rest.filter(function (i) { return i.kind === k; }).slice(0, per), n = g.length;
      g.forEach(function (i, j) {
        var ring = n > 5 ? (j % 2 ? 1.0 : 0.66) : 0.88, a = a0 + slot * ki + slot * (n === 1 ? 0.5 : (j + 0.5) / n);
        nodes.push({ it: i, x: cx + Math.cos(a) * RX * ring, y: cy + Math.sin(a) * RY * ring, r: 9 + Math.min(8, Math.sqrt(i.nc || 1) * 0.8), col: i.col || MAPK[k][2] });
      });
    });
    nodes.forEach(function (n2) {
      c.strokeStyle = n2.it.kind === 'came' ? 'rgba(120,100,80,.5)' : n2.col; c.globalAlpha = n2.it.kind === 'came' ? 1 : 0.45; c.lineWidth = 2;
      c.setLineDash(n2.it.kind === 'came' ? [5, 6] : []); c.beginPath(); c.moveTo(cx, cy); c.lineTo(n2.x, n2.y); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    });
    if (came.length) { c.strokeStyle = 'rgba(120,100,80,.6)'; c.setLineDash([5, 6]); c.beginPath(); came.forEach(function (i, j) { var n2 = nodes[j]; j ? c.lineTo(n2.x, n2.y) : c.moveTo(n2.x, n2.y); }); c.stroke(); c.setLineDash([]); }
    nodes.forEach(function (n2) {
      MDSKY.paper(c, function (q) { q.beginPath(); q.arc(n2.x, n2.y, n2.r, 0, 6.283); }, n2.col, 0.5);
      c.fillStyle = ink; c.font = '500 ' + (n2.it.kind === 'meanings' ? 13 : 14) + 'px Mitr, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'top';
      var lab = n2.it.kind === 'meanings' ? n2.it.th + ' ' + (n2.it.sub || '').slice(0, 14) : n2.it.th;
      var mx = W < 520 ? 9 : 14; c.fillText(lab.length > mx ? lab.slice(0, mx - 1) + '…' : lab, n2.x, n2.y + n2.r + 3);
      if (n2.it.kind === 'meanings') { c.fillStyle = '#fffaf0'; c.font = '600 12px Mitr, sans-serif'; c.textBaseline = 'middle'; c.fillText(n2.it.th, n2.x, n2.y + 1); }
      hits.push({ x: n2.x, y: n2.y, r: n2.r + 14, href: n2.it.href });
    });
    /* you are here */
    var pu = 0.5 + 0.5 * Math.sin(t / 300);
    c.strokeStyle = 'rgba(217,154,34,' + (0.4 + 0.5 * pu) + ')'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 40 + pu * 6, 0, 6.283); c.stroke();
    MDSKY.paper(c, function (q) { q.beginPath(); q.arc(cx, cy, 34, 0, 6.283); }, '#d99a22', 1.2);
    c.fillStyle = '#2a1a08'; c.font = '600 ' + (D.center.th.length > 4 ? 15 : 20) + 'px Mitr, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(D.center.th.length > 8 ? D.center.th.slice(0, 7) + '…' : D.center.th, cx, cy);
    c.fillStyle = ink; c.font = '600 12px Sarabun, sans-serif'; c.fillText('คุณอยู่ที่นี่ · you are here', cx, cy + 50);
    return hits;
  });
  cv.addEventListener('click', function (e) { var h = hitAt(cv, e); if (h) { closeMap(); location.hash = h.href; } });
  mapEl.querySelectorAll('.map-kinds button').forEach(function (b) { b.addEventListener('click', function () { mapState.kind = b.getAttribute('data-k'); openMap(); }); });
  mapEl.querySelectorAll('.map-sort button').forEach(function (b) { b.addEventListener('click', function () { mapState.sort = b.getAttribute('data-s'); mapEl.querySelectorAll('.map-sort button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); drawList(); cv._dirty = 1; }); });
  mapEl.querySelector('#maplist').addEventListener('click', function (e) { if (e.target.closest('a')) closeMap(); });
  document.getElementById('mapx').addEventListener('click', closeMap);
  wire(mapEl); drawList(); document.getElementById('mapx').focus();
}
function closeMap() { mapEl.hidden = true; mapEl.innerHTML = ''; document.body.classList.remove('has-guide'); }
document.getElementById('mapbtn').addEventListener('click', function () { mapState.kind = ''; openMap(); });
mapEl.addEventListener('click', function (e) { if (e.target === mapEl) closeMap(); });

/* ---------------------------------------------------------------- routing */
function route() {
  var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), p = h.split('/');
  here = { kind: 'page' };
  var lab = LABEL[p[0]] || '';
  if (p[0] === 'w' && BY[p[1]]) lab = BY[p[1]].th + (p[2] ? ' · meaning ' + p[2] : '');
  if (p[0] === 'k') lab = p.slice(1).join('/');
  if (p[0] === 'bed') lab = dom(p[1]).th + ' · ' + dom(p[1]).en;
  if (p[0] === 'seed' && ORIGIN[p[1]]) lab = ORIGIN[p[1]][0] + ' · ' + ORIGIN[p[1]][1];
  if (p[0] === 'via' && VIA[p[1]]) lab = VIA[p[1]].th + ' · ' + VIA[p[1]].en;
  if (p[0] === 'shape') lab = p.slice(1).join('/');
  if (p[0] === 'notes' && p[1] && BY[p[1]]) lab = 'สมุด · notes on ' + BY[p[1]].th;
  pathVisit(location.hash, lab);
  hint('');
  if (!h) { here = { kind: 'home' }; return pageHome(); }
  switch (p[0]) {
    case 'w': return pageHead(p[1], p[2], p[3]);
    case 'k': return pageWord(p.slice(1).join('/'));
    case 'explore': return pageExplore();
    case 'all': return pageAll();
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
window.addEventListener('hashchange', function () {
  SCROLL[curHash] = lastY; curHash = location.hash; route();
});

J('data/index.json').then(function (idx) {
  IDX = idx; IDX.byTh = {};
  idx.heads.forEach(function (h) { BY[h.s] = h; IDX.byTh[h.th] = h.s; });
  drawFoot(); wire(document); route();
}).catch(function (e) { main.innerHTML = '<div class="card"><p>โหลดไม่ได้ · could not load the garden: its data files did not arrive.</p></div>'; console.error(e); });
})();
