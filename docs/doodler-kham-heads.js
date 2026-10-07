/* The heads of the Word Garden, cut from paper: for each of the 49 lexicon headwords a little
   animated scene of the word's core meaning (น้ำ the khan bowl pours, ช้าง the elephant sprays,
   ไก่ the rooster crows at the sun …). Same paper, same shadows as the consonants' pictures.

   MDKHAMHEADS.draw(key, c, x, y, s, t)   draws the picture for a lexicon slug in the box
                                          x ± s, y ± s at time t (ms); false for an unknown key
   MDKHAMHEADS.keys                       the slugs, in dictionary order of the brief */
(function () {
'use strict';
var D = window.MDDOODLER, SKY = window.MDSKY; if (!SKY || window.MDKHAMHEADS) return;
var K = D ? D.kit : null;
var paper = SKY.paper, circ = SKY.circ, TAU = 6.2832, PI = Math.PI, API = {}, P = {};
function poly(pts) { return function (q) { q.beginPath(); pts.forEach(function (p, i) { i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1]); }); q.closePath(); }; }
function ell(x, y, rx, ry, r) { return function (q) { q.beginPath(); q.ellipse(x, y, Math.abs(rx), Math.abs(ry), r || 0, 0, TAU); }; }
function ball(x, y, r, k) { return function (q) { circ(q, x, y, r, k || 5); }; }
function rect(x, y, w, h) { return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); }
function line(c, pts, col, w) { c.save(); c.strokeStyle = col; c.lineWidth = Math.max(0.6, w); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke(); c.restore(); }
function dot(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function eye(c, x, y, s) { dot(c, x, y, s, '#fffaf0'); dot(c, x + s * 0.2, y, s * 0.55, '#1b1410'); }
function glint(c, x, y, s, t, k) { var u = (Math.sin(t / 380 + k) + 1) / 2; c.save(); c.globalAlpha = 0.35 + 0.6 * u; c.fillStyle = '#fff6c8'; c.beginPath(); for (var j = 0; j < 8; j++) { var a = j / 8 * TAU, r = j % 2 ? s * 0.25 : s; c.lineTo(x + Math.cos(a) * r * (0.6 + 0.4 * u), y + Math.sin(a) * r * (0.6 + 0.4 * u)); } c.closePath(); c.fill(); c.restore(); }
/* a flat piece with no shadow, for small things that would only blur */
function flat(c, path, fill) { c.fillStyle = fill; path(c); c.fill(); }
function lerp(a, b, u) { return a + (b - a) * u; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sm(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }
function fr(v) { return v - Math.floor(v); }
/* a smooth closed curve through the points (Catmull-Rom as béziers) */
function blob(pts) {
  return function (q) { var n = pts.length, i; q.beginPath(); q.moveTo(pts[0][0], pts[0][1]);
    for (i = 0; i < n; i++) { var p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      q.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
    q.closePath(); };
}
/* a tapering ribbon along a centre line */
function ribbon(pts, w0, w1) {
  var L = [], R = [], n = pts.length, i;
  for (i = 0; i < n; i++) { var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy) || 1, w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] - dy / d * w, pts[i][1] + dx / d * w]); R.push([pts[i][0] + dy / d * w, pts[i][1] - dx / d * w]); }
  return poly(L.concat(R.reverse()));
}
/* a leaf from (x, y) pointing along ang, length len, half-width wid */
function lf(x, y, len, wid, ang) {
  var ca = Math.cos(ang), sa = Math.sin(ang);
  function T(u, v) { return [x + ca * u - sa * v, y + sa * u + ca * v]; }
  return function (q) { var a = T(len * 0.3, -wid * 1.3), b = T(len * 0.75, -wid * 0.9), e = T(len, 0), d = T(len * 0.75, wid * 0.9), f = T(len * 0.3, wid * 1.3);
    q.beginPath(); q.moveTo(x, y); q.bezierCurveTo(a[0], a[1], b[0], b[1], e[0], e[1]); q.bezierCurveTo(d[0], d[1], f[0], f[1], x, y); q.closePath(); };
}
/* a flame, tip swaying */
function flame(c, cx, base, h, w, sway, col) {
  paper(c, function (q) { q.beginPath(); q.moveTo(cx - w, base); q.bezierCurveTo(cx - w * 1.1, base - h * 0.5, cx + sway * 0.5, base - h * 0.6, cx + sway, base - h); q.bezierCurveTo(cx + w * 0.9 + sway * 0.4, base - h * 0.55, cx + w * 1.1, base - h * 0.3, cx + w, base); q.closePath(); }, col, 0.3);
}
/* a figure from the doodler's kit when it is on the page; a plain paper doll when it is not */
function figure(c, x, gy, h, pose, d) {
  if (K && K.person) return K.person(c, x, gy, h, pose, d);
  var hip = [x, gy - h * 0.47], sh = [x, gy - h * 0.8];
  line(c, [[x - h * 0.1, gy], hip, [x + h * 0.1, gy]], d.low || d.col, h * 0.08); line(c, [hip, sh], d.col, h * 0.12);
  line(c, [[x - h * 0.15, gy - h * 0.55], sh, [x + h * 0.15, gy - h * 0.55]], d.col, h * 0.07); dot(c, x, gy - h * 0.92, h * 0.1, d.skin || '#d9a27a');
  return { head: [x, gy - h * 0.92], hand: [[x + h * 0.15, gy - h * 0.55], [x - h * 0.15, gy - h * 0.55]], hip: hip, sh: sh };
}
function pose(lean, seat, legs, arms) { return { lean: lean, seat: seat, legs: legs, arms: arms }; }
/* a soft round-edged portal of paper that scenes with a sky or sea sit inside */
function portal(c, x, y, r, col, inner) {
  paper(c, ball(x, y, r, 9), col, 1.4);
  c.save(); ball(x, y, r * 0.99, 9)(c); c.clip(); inner(); c.restore();
  c.save(); c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 1; ball(x, y, r, 9)(c); c.stroke(); c.restore();
}
var RED = '#7a1f1a', GOLD = '#e8b84a', GREEN = '#2f6b3a', INDIGO = '#1f4a6b', ORANGE = '#c8642a', CREAM = '#fbf3df', TEAK = '#8a5a32', DTEAK = '#5a3a1a', LGREEN = '#5d9e4a', CRIM = '#d9342b', SKINC = '#d9a27a', SILVER = '#c9d0d6', INK = '#1b1410';

/* ================================================================ the pictures */
/* น้ำ water: the silver khan bowl tips and pours; rings of ripples spread where it lands */
P.nam = function (c, x, y, s, t) {
  var py = y + s * 0.58, a = 0.95 + 0.14 * Math.sin(t / 1100), w = s * 0.4, px = x - s * 0.5, pvy = y - s * 0.62;
  var lipx = px + w * Math.cos(a), lipy = pvy + w * Math.sin(a), lx = lipx + s * 0.16, k, i;
  paper(c, ell(x, py + s * 0.13, s * 0.98, s * 0.27), '#2a6f9a', 1);
  paper(c, ell(x, py, s * 0.92, s * 0.23), '#4aa0c8', 0.6);
  c.save(); c.strokeStyle = 'rgba(233,246,251,.45)'; c.lineWidth = Math.max(0.7, s * 0.015);
  for (k = 0; k < 4; k++) { var wx = x - s * 0.6 + ((t / 30 + k * 90) % 200) / 200 * s * 1.2; c.beginPath(); c.moveTo(wx, py + s * (0.05 + (k % 2) * 0.07)); c.lineTo(wx + s * 0.16, py + s * (0.05 + (k % 2) * 0.07)); c.stroke(); }
  for (k = 0; k < 3; k++) { var u = fr(t / 1500 + k / 3); c.globalAlpha = (1 - u) * 0.9; c.lineWidth = Math.max(0.8, s * 0.035 * (1 - u)); c.beginPath(); c.ellipse(lx, py + s * 0.02, s * (0.07 + 0.7 * u), s * (0.02 + 0.17 * u), 0, 0, TAU); c.stroke(); }
  c.restore();
  /* the stream, falling from the lip */
  var sp = []; for (i = 0; i <= 14; i++) { var v = i / 14; sp.push([lipx + (lx - lipx) * (1 - (1 - v) * (1 - v)) + Math.sin(v * 9 - t / 110) * s * 0.012, lipy + (py - lipy) * v]); }
  paper(c, ribbon(sp, s * 0.1, s * 0.07), '#8fd0ec', 0.4);
  line(c, sp.slice(1, 12).map(function (p) { return [p[0] - s * 0.015, p[1]]; }), 'rgba(255,255,255,.65)', s * 0.015);
  for (k = 0; k < 5; k++) { var u2 = fr(t / 700 + k * 0.2); dot(c, lx + (k % 2 ? 1 : -1) * s * 0.12 * Math.sin(u2 * PI), py - s * 0.3 * Math.sin(u2 * PI), s * 0.022, '#c8ecf8'); }
  /* the bowl, tipped about the middle of its rim */
  c.save(); c.translate(px, pvy); c.rotate(a);
  paper(c, poly([[-s * 0.2, s * 0.42], [s * 0.2, s * 0.42], [s * 0.15, s * 0.5], [-s * 0.15, s * 0.5]]), '#8d98a3', 0.5);
  paper(c, function (q) { q.beginPath(); q.moveTo(-w, 0); q.bezierCurveTo(-w * 1.02, s * 0.3, -w * 0.45, s * 0.44, 0, s * 0.44); q.bezierCurveTo(w * 0.45, s * 0.44, w * 1.02, s * 0.3, w, 0); q.closePath(); }, SILVER, 1.4);
  c.save(); c.strokeStyle = '#8d98a3'; c.lineWidth = Math.max(0.8, s * 0.018);
  [0.12, 0.27].forEach(function (f) { c.beginPath(); c.moveTo(-w * (1 - f * 0.15), s * f); c.quadraticCurveTo(0, s * (f + 0.1), w * (1 - f * 0.15), s * f); c.stroke(); });
  for (k = -3; k <= 3; k++) dot(c, k * w * 0.27, s * (0.2 + 0.05 * Math.abs(k) * 0.4) , s * 0.016, '#8d98a3');
  c.restore();
  line(c, [[-w * 0.7, s * 0.1], [-w * 0.5, s * 0.34]], 'rgba(255,255,255,.7)', s * 0.03);
  paper(c, ell(0, 0, w, s * 0.075), '#e3e8ec', 0.6);
  flat(c, ell(0, s * 0.006, w * 0.88, s * 0.052), '#7fbfe0');
  c.restore();
};
/* บ้าน house: a Lanna house on stilts, the kalae crossed on the gable, smoke curling from the kitchen */
P.ban = function (c, x, y, s, t) {
  var gy = y + s * 0.84, fy = gy - s * 0.4, wy = fy - s * 0.44, hx = x - s * 0.2, ry = wy - s * 0.66, kx = x + s * 0.7, wk = fy - s * 0.3, k;
  paper(c, ell(x, gy + s * 0.04, s * 1.0, s * 0.08), '#6fa04f', 0.4);
  [-0.5, -0.17, 0.17, 0.5].forEach(function (f) { paper(c, rect(hx + s * f - s * 0.032, fy, s * 0.064, gy - fy), DTEAK, 0.6); });
  [-0.12, 0.14].forEach(function (f) { paper(c, rect(kx + s * f - s * 0.03, fy, s * 0.06, gy - fy), DTEAK, 0.6); });
  /* the kitchen wing */
  paper(c, rect(kx - s * 0.22, wk, s * 0.44, fy - wk), '#a8703c', 0.9);
  for (k = 1; k < 5; k++) line(c, [[kx - s * 0.22 + k * s * 0.088, wk], [kx - s * 0.22 + k * s * 0.088, fy]], 'rgba(60,35,15,.35)', s * 0.01);
  paper(c, rect(kx - s * 0.06, wk + s * 0.08, s * 0.12, s * 0.12), '#2a1a12', 0.3);
  paper(c, poly([[kx - s * 0.34, wk + s * 0.05], [kx - s * 0.14, wk - s * 0.27], [kx + s * 0.14, wk - s * 0.27], [kx + s * 0.34, wk + s * 0.05]]), '#a8432f', 1.2);
  line(c, [[kx - s * 0.14, wk - s * 0.27], [kx + s * 0.14, wk - s * 0.27]], GOLD, s * 0.025);
  /* the stairs */
  paper(c, poly([[hx - s * 0.96, gy], [hx - s * 0.92, gy], [hx - s * 0.5, fy + s * 0.04], [hx - s * 0.54, fy + s * 0.04]]), DTEAK, 0.7);
  for (k = 0; k < 5; k++) paper(c, rect(hx - s * (0.93 - k * 0.09), gy - (k + 0.7) * (gy - fy) / 5.5, s * 0.1, s * 0.03), '#c8913a', 0.4);
  /* the walls lean out toward the eaves */
  paper(c, poly([[hx - s * 0.52, fy], [hx + s * 0.52, fy], [hx + s * 0.58, wy], [hx - s * 0.58, wy]]), '#b57a42', 1.1);
  for (k = 1; k < 8; k++) line(c, [[hx - s * 0.52 + k * s * 0.13 - k * s * 0.0, fy], [hx - s * 0.58 + k * s * 0.145, wy]], 'rgba(70,40,15,.3)', s * 0.01);
  paper(c, poly([[hx - s * 0.12, fy], [hx - s * 0.12, fy - s * 0.3], [hx + s * 0.12, fy - s * 0.3], [hx + s * 0.12, fy]]), '#3a2418', 0.4);
  [-0.38, 0.38].forEach(function (f) { paper(c, rect(hx + s * f - s * 0.07, fy - s * 0.3, s * 0.14, s * 0.15), '#2a1a12', 0.4); paper(c, rect(hx + s * f - s * 0.07, fy - s * 0.3, s * 0.065, s * 0.15), '#8a5a32', 0.3); });
  paper(c, rect(hx - s * 0.66, fy - s * 0.02, s * 1.32, s * 0.05), TEAK, 0.8);
  /* the roof in two layers and the gable with its lattice */
  paper(c, poly([[hx - s * 0.74, wy + s * 0.12], [hx - s * 0.5, wy - s * 0.1], [hx + s * 0.5, wy - s * 0.1], [hx + s * 0.74, wy + s * 0.12]]), '#7a2a1e', 1.2);
  paper(c, poly([[hx - s * 0.68, wy - s * 0.04], [hx, ry], [hx + s * 0.68, wy - s * 0.04]]), '#a8432f', 1.5);
  c.save(); poly([[hx - s * 0.68, wy - s * 0.04], [hx, ry], [hx + s * 0.68, wy - s * 0.04]])(c); c.clip(); c.strokeStyle = 'rgba(60,15,10,.45)'; c.lineWidth = Math.max(0.7, s * 0.014);
  for (k = 1; k < 7; k++) { var ty = wy - s * 0.04 - k * s * 0.088; c.beginPath(); for (var j = 0; j < 14; j++) { c.lineTo(hx - s * 0.7 + j * s * 0.1, ty + (j % 2 ? s * 0.02 : 0)); } c.stroke(); }
  c.restore();
  paper(c, poly([[hx - s * 0.3, wy - s * 0.06], [hx, wy - s * 0.46], [hx + s * 0.3, wy - s * 0.06]]), '#c8913a', 0.6);
  c.save(); c.strokeStyle = 'rgba(70,40,15,.55)'; c.lineWidth = Math.max(0.7, s * 0.012);
  for (k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(hx + k * s * 0.07, wy - s * 0.06); c.lineTo(hx + k * s * 0.07 * 0.4, wy - s * 0.4); c.stroke(); }
  c.restore();
  line(c, [[hx - s * 0.68, wy - s * 0.04], [hx, ry], [hx + s * 0.68, wy - s * 0.04]], GOLD, s * 0.035);
  /* the kalae: two horns crossed at the peak */
  [-1, 1].forEach(function (sd) { var pts = []; for (var i = 0; i <= 8; i++) { var u = i / 8; pts.push([hx + sd * (s * 0.08 - u * s * 0.3) + sd * Math.sin(u * 2.4) * s * 0.0, ry + s * 0.1 - u * s * 0.42 - Math.sin(u * PI) * 0.0]); }
    pts = pts.map(function (p, i) { var u = i / 8; return [hx + sd * (s * 0.1 - u * s * 0.3 + u * u * s * 0.08) * 1, ry + s * 0.12 - u * s * 0.4 + 0]; });
    paper(c, ribbon(pts, s * 0.06, s * 0.012), GOLD, 0.8); });
  /* smoke */
  for (k = 0; k < 4; k++) { var u = fr(t / 3600 + k / 4), r = s * (0.04 + u * 0.1); c.fillStyle = 'rgba(233,228,215,' + (0.7 * (1 - u)).toFixed(2) + ')'; c.beginPath(); c.arc(kx + Math.sin(u * 6 + k * 2) * s * 0.07 + u * s * 0.16, wk - s * 0.3 - u * s * 0.55, r, 0, TAU); c.fill(); }
};
/* หน้า face: a big round paper face whose look shifts: a smile, a surprise, a shy glance */
var FACE = [
  { br: 0, bt: 0.0, eo: 0.55, lx: 0, ly: 0, mw: 0.3, cu: 0.1, d: 0.1, op: 0.09, bl: 0.4, tilt: 0 },
  { br: -0.14, bt: 0.0, eo: 1.15, lx: 0, ly: 0, mw: 0.1, cu: 0.0, d: -0.02, op: 0.2, bl: 0.0, tilt: 0 },
  { br: -0.02, bt: 0.07, eo: 0.4, lx: -0.05, ly: 0.07, mw: 0.12, cu: 0.03, d: 0.03, op: 0.0, bl: 1.0, tilt: 0.12 }
];
P.na = function (c, x, y, s, t) {
  var T = (t / 2800) % 3, i = Math.floor(T), u = sm((T - i - 0.35) / 0.5), A = FACE[i], B = FACE[(i + 1) % 3], E = {}, k;
  for (k in A) E[k] = lerp(A[k], B[k], u);
  c.save(); c.translate(x, y + s * 0.1); c.rotate(E.tilt); c.translate(-x, -(y + s * 0.1));
  var fy = y + s * 0.08;
  paper(c, ball(x, y - s * 0.12, s * 0.8, 6), '#1b1410', 1);
  paper(c, ball(x, y - s * 0.86, s * 0.23, 4), '#1b1410', 1.2);
  paper(c, poly([[x - s * 0.04, y - s * 0.96], [x + s * 0.2, y - s * 0.93], [x + s * 0.06, y - s * 0.78]]), GOLD, 0.4);
  dot(c, x + s * 0.13, y - s * 0.89, s * 0.05, '#fffaf0'); dot(c, x + s * 0.13, y - s * 0.89, s * 0.02, GOLD);
  [-1, 1].forEach(function (sd) { paper(c, ell(x + sd * s * 0.77, fy + s * 0.12, s * 0.1, s * 0.16), '#e0a97c', 0.5); });
  paper(c, ball(x, fy + s * 0.03, s * 0.76, 8), '#eebf92', 1.3);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.76, fy - s * 0.1); q.bezierCurveTo(x - s * 0.7, fy - s * 0.78, x + s * 0.5, fy - s * 0.9, x + s * 0.76, fy - s * 0.2); q.bezierCurveTo(x + s * 0.4, fy - s * 0.5, x - s * 0.1, fy - s * 0.38, x - s * 0.3, fy - s * 0.22); q.bezierCurveTo(x - s * 0.5, fy - s * 0.3, x - s * 0.7, fy - s * 0.1, x - s * 0.76, fy - s * 0.1); q.closePath(); }, '#1b1410', 1.5);
  [-1, 1].forEach(function (sd) {
    var ex = x + sd * s * 0.29, ey = fy - s * 0.04 + E.ly * s * 0.4, by = fy - s * 0.27 + E.br * s;
    flat(c, ell(x + sd * s * 0.42, fy + s * 0.2, s * 0.13, s * 0.075), 'rgba(226,90,95,' + (E.bl * 0.55).toFixed(2) + ')');
    if (E.eo > 0.8) { dot(c, ex, ey, s * 0.115 * clamp(E.eo, 0, 1.2), '#fffaf0'); }
    flat(c, ell(ex + E.lx * s, ey, s * 0.07, s * 0.095 * E.eo), '#1b1410');
    dot(c, ex + E.lx * s + s * 0.025, ey - s * 0.03 * E.eo, s * 0.022, '#fffaf0');
    line(c, [[ex - sd * s * 0.1, by + sd * 0 + E.bt * s * (sd > 0 ? -1 : 1) * 0 + E.bt * s * (sd > 0 ? 1 : 1)], [ex + sd * s * 0.1, by - E.bt * s]], '#1b1410', s * 0.04);
  });
  line(c, [[x - s * 0.025, fy + s * 0.12], [x - s * 0.04, fy + s * 0.16], [x + s * 0.03, fy + s * 0.165]], '#b5714a', s * 0.02);
  var my = fy + s * 0.34, mw = E.mw * s, cy = my - E.cu * s;
  paper(c, function (q) { q.beginPath(); q.moveTo(x - mw, cy); q.quadraticCurveTo(x, cy + 2 * E.d * s, x + mw, cy); q.quadraticCurveTo(x, cy + 2 * (E.d + E.op) * s, x - mw, cy); q.closePath(); }, '#8a1f2a', 0.2);
  if (E.op > 0.05) { c.save(); c.beginPath(); c.moveTo(x - mw, cy); c.quadraticCurveTo(x, cy + 2 * E.d * s, x + mw, cy); c.quadraticCurveTo(x, cy + 2 * (E.d + E.op) * s, x - mw, cy); c.clip();
    c.fillStyle = '#fffaf0'; c.fillRect(x - mw, cy + E.d * s * 0.5, mw * 2, E.op * s * 0.45); c.fillStyle = '#e0707a'; c.beginPath(); c.ellipse(x, cy + (E.d + E.op) * s * 1.0, mw * 0.45, E.op * s * 0.35, 0, 0, TAU); c.fill(); c.restore(); }
  c.restore();
};
/* แม่ mother: she carries the small child on her hip and sways */
P.mae = function (c, x, y, s, t) {
  var gy = y + s * 0.9, sw = 0.045 * Math.sin(t / 750), bob = Math.sin(t / 750 + 1) * s * 0.012, k;
  paper(c, ell(x, gy, s * 0.55, s * 0.06), 'rgba(60,35,15,.3)', 0.1);
  c.save(); c.translate(x - s * 0.1, gy); c.rotate(sw);
  [-1, 1].forEach(function (sd) { paper(c, ell(sd * s * 0.1, -s * 0.03, s * 0.09, s * 0.04), '#d9a27a', 0.4); });
  paper(c, poly([[-s * 0.2, -s * 0.8], [s * 0.2, -s * 0.8], [s * 0.34, -s * 0.07], [-s * 0.34, -s * 0.07]]), '#2a3a6a', 1.3);
  for (k = 1; k < 5; k++) line(c, [[-s * 0.2 + k * s * 0.08, -s * 0.78], [-s * 0.33 + k * s * 0.132, -s * 0.1]], 'rgba(255,255,255,.12)', s * 0.015);
  paper(c, rect(-s * 0.34, -s * 0.2, s * 0.68, s * 0.12), GOLD, 0.6);
  c.save(); c.strokeStyle = RED; c.lineWidth = Math.max(0.7, s * 0.012); c.beginPath(); for (k = 0; k <= 12; k++) c.lineTo(-s * 0.34 + k * s * 0.0567, -s * (k % 2 ? 0.19 : 0.09)); c.stroke(); c.restore();
  paper(c, poly([[-s * 0.2, -s * 1.28], [s * 0.2, -s * 1.28], [s * 0.2, -s * 0.78], [-s * 0.2, -s * 0.78]]), '#fbf3df', 1);
  paper(c, poly([[-s * 0.2, -s * 1.28], [s * 0.2, -s * 1.28], [s * 0.2, -s * 1.15], [-s * 0.2, -s * 1.15]]), '#d9342b', 0.4);
  paper(c, rect(-s * 0.045, -s * 1.4, s * 0.09, s * 0.16), '#d9a27a', 0.5);
  var hx = s * 0.0 + Math.sin(t / 750 + 2) * s * 0.01, hy = -s * 1.52;
  paper(c, ball(hx - s * 0.02, hy - s * 0.06, s * 0.2, 3), '#1b1410', 0.8);
  paper(c, ball(hx - s * 0.05, hy - s * 0.27, s * 0.1, 3), '#1b1410', 1);
  dot(c, hx - s * 0.05, hy - s * 0.27, s * 0.03, GOLD);
  paper(c, ball(hx, hy, s * 0.17, 3), '#e0a97c', 1);
  paper(c, function (q) { q.beginPath(); q.moveTo(hx - s * 0.18, hy - s * 0.02); q.bezierCurveTo(hx - s * 0.15, hy - s * 0.22, hx + s * 0.12, hy - s * 0.22, hx + s * 0.18, hy - s * 0.04); q.bezierCurveTo(hx + s * 0.08, hy - s * 0.1, hx - s * 0.08, hy - s * 0.1, hx - s * 0.18, hy - s * 0.02); q.closePath(); }, '#1b1410', 0.5);
  dot(c, hx + s * 0.07, hy + s * 0.01, s * 0.02, INK); dot(c, hx - s * 0.05, hy + s * 0.01, s * 0.02, INK);
  line(c, [[hx - s * 0.04, hy + s * 0.08], [hx + s * 0.01, hy + s * 0.105], [hx + s * 0.06, hy + s * 0.08]], '#a8432f', s * 0.016);
  /* the arm under the child, the other hand holding her skirt */
  var cx = s * 0.34, cy = -s * 0.95 + bob;
  line(c, [[-s * 0.18, -s * 1.2], [-s * 0.26, -s * 0.95], [-s * 0.2, -s * 0.78]], '#d9a27a', s * 0.075);
  /* the child, astride the hip */
  line(c, [[cx - s * 0.04, cy + s * 0.12], [cx + s * 0.02, cy + s * 0.34], [cx - s * 0.04, cy + s * 0.46]], '#e0a97c', s * 0.07);
  line(c, [[cx + s * 0.08, cy + s * 0.12], [cx + s * 0.18, cy + s * 0.3], [cx + s * 0.16, cy + s * 0.43]], '#e0a97c', s * 0.07);
  paper(c, ell(cx + s * 0.02, cy, s * 0.15, s * 0.21, 0.1), '#e8892a', 1);
  paper(c, ell(cx + s * 0.02, cy + s * 0.15, s * 0.15, s * 0.07, 0.1), '#2f8f5b', 0.5);
  line(c, [[cx - s * 0.05, cy - s * 0.12], [-s * 0.18, -s * 1.28]], '#e0a97c', s * 0.06);
  line(c, [[cx + s * 0.12, cy - s * 0.1], [cx + s * 0.22, cy + s * 0.05], [cx + s * 0.12, cy + s * 0.15]], '#e0a97c', s * 0.06);
  var chx = cx + s * 0.02 + Math.sin(t / 750 + 3) * s * 0.01, chy = cy - s * 0.33;
  paper(c, ball(chx, chy, s * 0.15, 3), '#e8b48a', 1);
  paper(c, ball(chx - s * 0.02, chy - s * 0.1, s * 0.12, 3), '#1b1410', 0.6);
  paper(c, poly([[chx - s * 0.02, chy - s * 0.24], [chx + s * 0.04, chy - s * 0.34], [chx + s * 0.07, chy - s * 0.22]]), '#1b1410', 0.4);
  dot(c, chx - s * 0.04, chy + s * 0.0, s * 0.018, INK); dot(c, chx + s * 0.07, chy + s * 0.0, s * 0.018, INK);
  flat(c, ell(chx - s * 0.09, chy + s * 0.05, s * 0.04, s * 0.025), 'rgba(226,90,95,.5)'); flat(c, ell(chx + s * 0.12, chy + s * 0.05, s * 0.04, s * 0.025), 'rgba(226,90,95,.5)');
  line(c, [[chx - s * 0.01, chy + s * 0.07], [chx + s * 0.03, chy + s * 0.09], [chx + s * 0.07, chy + s * 0.07]], '#a8432f', s * 0.014);
  c.restore();
};
/* ท่า pier: wooden landing steps go down into the river; a small boat bobs at the foot */
P.tha = function (c, x, y, s, t) {
  var yw = y + s * 0.16, k, bob = Math.sin(t / 650) * s * 0.025, bx = x + s * 0.4, by = yw + s * 0.08 + bob;
  paper(c, rect(x - s, yw, s * 2, s * 0.84), '#2f6b8a', 0.4);
  c.save(); c.strokeStyle = 'rgba(190,230,245,.4)'; c.lineWidth = Math.max(0.8, s * 0.016);
  for (k = 0; k < 6; k++) { var wy = yw + s * (0.1 + k * 0.13), wx = x - s + ((t / 45 + k * 77) % 300) / 300 * s * 2; c.beginPath(); c.moveTo(wx - s * 0.2, wy); c.quadraticCurveTo(wx, wy - s * 0.03, wx + s * 0.2, wy); c.stroke(); }
  c.restore();
  /* the bank and steps going down */
  var st = [[x - s, y - s * 0.4], [x - s * 0.6, y - s * 0.4]];
  for (k = 0; k < 6; k++) { st.push([x - s * 0.6 + k * s * 0.14, y - s * 0.4 + k * s * 0.15]); st.push([x - s * 0.6 + (k + 1) * s * 0.14, y - s * 0.4 + k * s * 0.15]); }
  st.push([x - s * 0.6 + 6 * s * 0.14, y + s * 0.9]); st.push([x - s, y + s * 0.9]);
  paper(c, poly(st), '#7a5a3a', 1.2);
  c.save(); c.globalAlpha = 0.6; c.fillStyle = '#3f8fb8'; c.fillRect(x - s, yw, s * 2, s * 0.84); c.restore();
  paper(c, poly([[x - s, y - s * 0.4], [x - s * 0.58, y - s * 0.4], [x - s * 0.58, y - s * 0.33], [x - s, y - s * 0.36]]), '#5d9e4a', 0.5);
  for (k = 0; k < 6; k++) { paper(c, rect(x - s * 0.62 + k * s * 0.14, y - s * 0.42 + k * s * 0.15, s * 0.17, s * 0.045), '#c8913a', 0.6); }
  [[0, 0], [3, 0]].forEach(function (p) { var px = x - s * 0.6 + p[0] * s * 0.14 + s * 0.04, py = y - s * 0.4 + p[0] * s * 0.15; paper(c, rect(px, py - s * 0.35, s * 0.045, s * 0.37), DTEAK, 0.8); dot(c, px + s * 0.022, py - s * 0.36, s * 0.04, '#a8432f'); });
  line(c, [[x - s * 0.57, y - s * 0.74], [x - s * 0.57 + 3 * s * 0.14, y - s * 0.74 + 3 * s * 0.15 + s * 0.02]], '#e8d9b0', s * 0.015);
  /* the boat */
  c.save(); c.translate(bx, by); c.rotate(0.05 * Math.sin(t / 800 + 1));
  paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.5, -s * 0.15); q.quadraticCurveTo(-s * 0.45, s * 0.1, -s * 0.25, s * 0.15); q.lineTo(s * 0.28, s * 0.15); q.quadraticCurveTo(s * 0.5, s * 0.1, s * 0.58, -s * 0.16); q.lineTo(s * 0.3, -s * 0.04); q.lineTo(-s * 0.3, -s * 0.04); q.closePath(); }, '#a8432f', 1.4);
  line(c, [[-s * 0.47, -s * 0.1], [-s * 0.3, -s * 0.01], [s * 0.3, -s * 0.01], [s * 0.54, -s * 0.11]], GOLD, s * 0.03);
  paper(c, function (q) { q.beginPath(); q.ellipse(-s * 0.02, -s * 0.04, s * 0.26, s * 0.2, 0, PI, TAU); q.closePath(); }, '#d8b878', 1);
  c.save(); c.strokeStyle = 'rgba(100,70,30,.5)'; c.lineWidth = Math.max(0.7, s * 0.012); for (k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-s * 0.02 + k * s * 0.1, -s * 0.04); c.quadraticCurveTo(-s * 0.02 + k * s * 0.05, -s * 0.15, -s * 0.02, -s * 0.24); c.stroke(); } c.restore();
  c.restore();
  line(c, [[x - s * 0.57 + 3 * s * 0.14 + s * 0.02, y - s * 0.4 + 3 * s * 0.15 - s * 0.3], [(x + bx - s * 0.5) / 2 - s * 0.1, by + s * 0.1], [bx - s * 0.45, by - s * 0.1]], '#e8d9b0', s * 0.014);
  c.save(); c.globalAlpha = 0.55; c.fillStyle = '#4aa0c8'; c.beginPath(); c.moveTo(bx - s * 0.6, by + s * 0.03); for (k = 0; k <= 10; k++) c.lineTo(bx - s * 0.6 + k * s * 0.12, by + s * 0.03 + Math.sin(k * 1.4 + t / 400) * s * 0.02); c.lineTo(bx + s * 0.6, by + s * 0.3); c.lineTo(bx - s * 0.6, by + s * 0.3); c.closePath(); c.fill(); c.restore();
};
/* ลูก child / ball: a child kicks the takraw ball, which arcs up and comes back to the foot */
P.luk = function (c, x, y, s, t) {
  var gy = y + s * 0.88, u = fr(t / 2200), hx = x - s * 0.4, hy = gy - s * 0.74, TL = s * 0.38;
  function swing(u2) { var a, r; if (u2 < 0.08) { a = lerp(-0.5, 1.1, sm(u2 / 0.08)); r = lerp(-1.0, 0.1, sm(u2 / 0.08)); } else if (u2 < 0.2) { a = lerp(1.1, -0.3, sm((u2 - 0.08) / 0.12)); r = lerp(0.1, -0.8, sm((u2 - 0.08) / 0.12)); } else if (u2 < 0.75) { a = -0.3 + 0.05 * Math.sin(u2 * 12); r = -0.8; } else { a = lerp(-0.3, -0.5, sm((u2 - 0.75) / 0.25)); r = lerp(-0.8, -1.0, sm((u2 - 0.75) / 0.25)); } return [a, r]; }
  function foot(u2) { var q = swing(u2), kx = hx + Math.sin(q[0]) * TL, ky = hy + Math.cos(q[0]) * TL; return [kx + Math.sin(q[0] + q[1]) * TL, ky + Math.cos(q[0] + q[1]) * TL]; }
  var home = foot(0.05), v = fr(u - 0.05), bx = home[0] + s * 0.1 + s * 0.16 * Math.sin(v * PI), by = home[1] - Math.sin(v * PI) * s * 1.0 - s * 0.04;
  if (u < 0.05) { bx = home[0] + s * 0.1; by = home[1] - s * 0.04; }
  paper(c, ell(x, gy, s * 0.85, s * 0.07), 'rgba(60,35,15,.28)', 0.1);
  var q = swing(u), kick = Math.max(0, 1 - Math.abs(u - 0.06) / 0.1), lean = -0.04 - kick * 0.14 + (u > 0.8 ? 0.06 : 0), SK = '#c98b62';
  /* the standing leg and the kicking leg */
  paper(c, ribbon([[hx + s * 0.02, hy], [hx + s * 0.0, gy - s * 0.05]], s * 0.12, s * 0.09), SK, 0.8);
  paper(c, ell(hx + s * 0.05, gy - s * 0.02, s * 0.12, s * 0.05), '#1b1410', 0.5);
  var k1 = [hx + Math.sin(q[0]) * TL, hy + Math.cos(q[0]) * TL], f1 = [k1[0] + Math.sin(q[0] + q[1]) * TL, k1[1] + Math.cos(q[0] + q[1]) * TL];
  paper(c, ribbon([[hx, hy], k1, f1], s * 0.12, s * 0.085), SK, 0.9);
  c.save(); c.translate(f1[0], f1[1]); c.rotate(q[0] + q[1] - 1.1); paper(c, ell(s * 0.05, 0, s * 0.1, s * 0.045), '#1b1410', 0.5); c.restore();
  paper(c, poly([[hx - s * 0.17, hy - s * 0.08], [hx + s * 0.17, hy - s * 0.08], [hx + s * 0.2, hy + s * 0.16], [hx - s * 0.2, hy + s * 0.16]]), '#1f4a6b', 0.9);
  /* the body leans back a little as the foot swings */
  c.save(); c.translate(hx, hy - s * 0.04); c.rotate(lean);
  paper(c, poly([[-s * 0.17, 0], [s * 0.17, 0], [s * 0.2, -s * 0.5], [-s * 0.2, -s * 0.5]]), '#e8892a', 1);
  flat(c, rect(-s * 0.17, -s * 0.06, s * 0.34, s * 0.04), '#c8642a');
  var ay = -s * 0.44, ar = 0.35 + kick * 0.4;
  line(c, [[-s * 0.2, ay], [-s * 0.43, ay + s * 0.0 - ar * s * 0.0], [-s * 0.62, ay - s * 0.14]], SK, s * 0.075);
  line(c, [[s * 0.2, ay], [s * 0.42, ay + s * 0.02], [s * 0.6, ay - s * 0.16 - kick * s * 0.12]], SK, s * 0.075);
  paper(c, rect(-s * 0.05, -s * 0.58, s * 0.1, s * 0.12), SK, 0.4);
  paper(c, ball(0, -s * 0.72, s * 0.17, 4), '#e0a97c', 1);
  paper(c, function (q2) { q2.beginPath(); q2.arc(0, -s * 0.74, s * 0.18, PI * 1.02, TAU * 0.999); q2.lineTo(s * 0.12, -s * 0.78); q2.quadraticCurveTo(0, -s * 0.7, -s * 0.12, -s * 0.76); q2.closePath(); }, '#1b1410', 0.7);
  paper(c, ball(s * 0.0, -s * 0.94, s * 0.07, 3), '#1b1410', 0.6);
  dot(c, -s * 0.06, -s * 0.7, s * 0.02, INK); dot(c, s * 0.07, -s * 0.7, s * 0.02, INK);
  line(c, [[-s * 0.04, -s * 0.63], [s * 0.01, -s * 0.6], [s * 0.06, -s * 0.63]], '#a8432f', s * 0.015);
  flat(c, ell(-s * 0.11, -s * 0.64, s * 0.035, s * 0.022), 'rgba(226,90,95,.5)'); flat(c, ell(s * 0.12, -s * 0.64, s * 0.035, s * 0.022), 'rgba(226,90,95,.5)');
  c.restore();
  /* the ball: woven rattan, turning as it flies */
  flat(c, ell(bx, gy + s * 0.01, s * 0.12 * (1 - (gy - by) / (s * 2.2)), s * 0.025), 'rgba(60,35,15,.3)');
  c.save(); c.translate(bx, by); c.rotate(t / 260);
  paper(c, ball(0, 0, s * 0.17, 5), '#e8b84a', 1.2);
  c.strokeStyle = '#8a5a22'; c.lineWidth = Math.max(0.8, s * 0.022); c.lineCap = 'round';
  c.beginPath(); c.arc(-s * 0.1, 0, s * 0.17, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(s * 0.1, 0, s * 0.17, PI - 0.9, PI + 0.9); c.stroke();
  c.beginPath(); c.arc(0, -s * 0.1, s * 0.17, 0.7, PI - 0.7); c.stroke(); c.beginPath(); c.arc(0, s * 0.1, s * 0.17, PI + 0.7, TAU - 0.7); c.stroke();
  c.restore();
  if (kick > 0.4) glint(c, bx + s * 0.1, by - s * 0.1, s * 0.14, t, 2);
};
/* หัว head: a head in profile, nodding, with a topknot */
P.hua = function (c, x, y, s, t) {
  var nod = 0.1 * Math.sin(t / 560) + 0.03 * Math.sin(t / 230), hx = x - s * 0.05, ny = y + s * 0.42;
  paper(c, poly([[hx - s * 0.62, y + s * 0.95], [hx - s * 0.45, y + s * 0.6], [hx + s * 0.45, y + s * 0.6], [hx + s * 0.62, y + s * 0.95]]), '#1f4a6b', 1.2);
  paper(c, poly([[hx - s * 0.2, y + s * 0.6], [hx, y + s * 0.82], [hx + s * 0.2, y + s * 0.6]]), '#f2e6c9', 0.6);
  c.save(); c.translate(hx, ny); c.rotate(nod);
  paper(c, poly([[-s * 0.16, s * 0.2], [s * 0.16, s * 0.2], [s * 0.19, -s * 0.2], [-s * 0.19, -s * 0.2]]), '#c98b62', 0.6);
  var hc = [0, -s * 0.65], R = s * 0.5;
  /* the topknot, bound with a gold band */
  paper(c, ball(-R * 0.1, hc[1] - R * 0.95, R * 0.3, 4), '#1b1410', 1.1);
  paper(c, poly([[-R * 0.32, hc[1] - R * 0.78], [R * 0.12, hc[1] - R * 0.8], [R * 0.1, hc[1] - R * 0.68], [-R * 0.3, hc[1] - R * 0.66]]), GOLD, 0.5);
  var P0 = [[-0.46, 0.0], [-0.42, -0.3], [-0.2, -0.46], [0.12, -0.5], [0.34, -0.36], [0.41, -0.14], [0.43, -0.02], [0.56, 0.12], [0.43, 0.2], [0.44, 0.3], [0.38, 0.44], [0.12, 0.54], [-0.16, 0.42], [-0.34, 0.28]].map(function (p) { return [hc[0] + p[0] * R * 2 * 0.95, hc[1] + p[1] * R * 2 * 0.95]; });
  paper(c, blob(P0), '#d9a27a', 1.4);
  paper(c, function (q) { q.beginPath(); q.moveTo(hc[0] - R * 0.9, hc[1] - R * 0.1); q.bezierCurveTo(hc[0] - R * 0.95, hc[1] - R * 0.95, hc[0] + R * 0.3, hc[1] - R * 1.05, hc[0] + R * 0.5, hc[1] - R * 0.5); q.bezierCurveTo(hc[0] + R * 0.1, hc[1] - R * 0.5, hc[0] - R * 0.2, hc[1] - R * 0.3, hc[0] - R * 0.35, hc[1] + R * 0.2); q.lineTo(hc[0] - R * 0.5, hc[1] + R * 0.4); q.closePath(); }, '#1b1410', 1.5);
  paper(c, ell(hc[0] - R * 0.05, hc[1] + R * 0.12, R * 0.12, R * 0.22, 0.1), '#c98b62', 0.6);
  var bl = Math.sin(t / 3000) > 0.97 ? 0.3 : 1;
  flat(c, ell(hc[0] + R * 0.52, hc[1] - R * 0.02, R * 0.09, R * 0.075 * bl), INK);
  line(c, [[hc[0] + R * 0.42, hc[1] - R * 0.16], [hc[0] + R * 0.66, hc[1] - R * 0.12]], INK, R * 0.07);
  flat(c, ell(hc[0] + R * 0.42, hc[1] + R * 0.34, R * 0.12, R * 0.07), 'rgba(226,90,95,.45)');
  line(c, [[hc[0] + R * 0.62, hc[1] + R * 0.56], [hc[0] + R * 0.78, hc[1] + R * 0.55]], '#a8432f', R * 0.05);
  c.restore();
};
/* ตา eye: one large eye that blinks and looks left and right */
P.ta = function (c, x, y, s, t) {
  var ph = (t % 3400) / 3400, bl = ph > 0.9 ? Math.sin((ph - 0.9) / 0.1 * PI) : 0, op = 1 - bl * 0.95;
  var look = Math.sin(t / 1900) * 0.9; look = Math.max(-1, Math.min(1, look * 1.5)) * s * 0.2; var lk = Math.sin(t / 2700 + 1) * s * 0.04;
  var W = s * 0.92, H = s * 0.5 * op;
  paper(c, ell(x, y, s * 0.98, s * 0.84), '#e8b98c', 1.2);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.88, y - s * 0.42); q.bezierCurveTo(x - s * 0.5, y - s * 0.88, x + s * 0.4, y - s * 0.92, x + s * 0.9, y - s * 0.5); q.bezierCurveTo(x + s * 0.4, y - s * 0.7, x - s * 0.4, y - s * 0.68, x - s * 0.88, y - s * 0.42); q.closePath(); }, '#1b1410', 1.3);
  function almond(q) { q.beginPath(); q.moveTo(x - W, y + s * 0.02); q.bezierCurveTo(x - W * 0.5, y - H * 1.35, x + W * 0.5, y - H * 1.35, x + W, y); q.bezierCurveTo(x + W * 0.5, y + H * 0.95, x - W * 0.5, y + H * 0.95, x - W, y + s * 0.02); q.closePath(); }
  paper(c, almond, '#fffaf0', 0.4);
  c.save(); almond(c); c.clip();
  var ix = x + look, iy = y - s * 0.03 + lk;
  dot(c, ix, iy, s * 0.4, '#5a3a1a'); dot(c, ix, iy, s * 0.34, '#8a5a32'); dot(c, ix, iy, s * 0.24, '#3a2418');
  c.strokeStyle = 'rgba(232,184,74,.55)'; c.lineWidth = Math.max(0.7, s * 0.012); for (var k = 0; k < 12; k++) { var a = k / 12 * TAU; c.beginPath(); c.moveTo(ix + Math.cos(a) * s * 0.26, iy + Math.sin(a) * s * 0.26); c.lineTo(ix + Math.cos(a) * s * 0.34, iy + Math.sin(a) * s * 0.34); c.stroke(); }
  dot(c, ix, iy, s * 0.14, INK); dot(c, ix - s * 0.1, iy - s * 0.12, s * 0.06, '#fffaf0'); dot(c, ix + s * 0.1, iy + s * 0.1, s * 0.03, 'rgba(255,255,255,.7)');
  c.fillStyle = 'rgba(232,150,150,.5)'; c.fillRect(x - W, y - s * 0.05, s * 0.18, s * 0.1);
  c.restore();
  c.save(); c.lineCap = 'round'; c.strokeStyle = INK; c.lineWidth = s * 0.06; c.beginPath(); c.moveTo(x - W, y + s * 0.02); c.bezierCurveTo(x - W * 0.5, y - H * 1.35, x + W * 0.5, y - H * 1.35, x + W, y); c.stroke();
  c.lineWidth = s * 0.02; for (k = 0; k < 7; k++) { var u = 0.16 + k * 0.11, px = x - W + u * 2 * W, py = y - H * 1.0 * Math.sin(u * PI) * 1.0; c.beginPath(); c.moveTo(px, py + s * 0.01 * 0); c.lineTo(px + (u - 0.5) * s * 0.25, py - s * 0.14 * (0.5 + 0.5 * Math.sin(u * PI))); c.stroke(); }
  c.strokeStyle = 'rgba(122,31,26,.5)'; c.lineWidth = s * 0.018; c.beginPath(); c.moveTo(x - W * 0.8, y - s * 0.12 - H * 0.2); c.bezierCurveTo(x - W * 0.4, y - H * 1.9 - s * 0.1, x + W * 0.4, y - H * 1.9 - s * 0.1, x + W * 0.85, y - s * 0.1); c.stroke();
  c.strokeStyle = '#8a4a2a'; c.lineWidth = s * 0.018; c.beginPath(); c.moveTo(x - W * 0.85, y + s * 0.04); c.bezierCurveTo(x - W * 0.5, y + H * 0.95 + s * 0.03, x + W * 0.5, y + H * 0.95 + s * 0.03, x + W * 0.85, y + s * 0.03); c.stroke();
  c.restore();
};
/* นา rice field: stepped paddy terraces with glinting water; a buffalo walks along the lowest bank */
P['na-2'] = function (c, x, y, s, t) {
  var k, j, cols = ['#7fb84a', '#8fc4d4', '#6aa84a', '#9ccfdc', '#5d9e4a'];
  portal(c, x, y, s * 0.98, '#fbf3df', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#f2d9a0', 0.3);
    dot(c, x + s * 0.45, y - s * 0.62, s * 0.2, '#f0a030');
    paper(c, poly([[x - s, y - s * 0.1], [x - s * 0.5, y - s * 0.52], [x - s * 0.1, y - s * 0.28], [x + s * 0.35, y - s * 0.55], [x + s, y - s * 0.2], [x + s, y + s], [x - s, y + s]]), '#3f7a4a', 0.5);
    for (k = 0; k < 5; k++) {
      var ty = y - s * 0.28 + k * s * 0.28, amp = s * 0.05 * (1 + k * 0.2);
      paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 1.05, y + s); q.lineTo(x - s * 1.05, ty); for (var i = 0; i <= 12; i++) q.lineTo(x - s * 1.05 + i * s * 0.175, ty + Math.sin(i * 0.9 + k * 1.7) * amp - i * s * 0.01 * (k % 2 ? -1 : 1)); q.lineTo(x + s * 1.05, y + s); q.closePath(); }, cols[k], 0.6 + k * 0.1);
      if (k % 2 === 1) { c.save(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(0.8, s * 0.02); c.lineCap = 'round'; for (j = 0; j < 4; j++) { var g = Math.max(0, Math.sin(t / 700 + j * 1.9 + k)), gx = x - s * 0.75 + ((j * 0.37 + k * 0.21) % 1) * s * 1.5; c.globalAlpha = g; c.beginPath(); c.moveTo(gx, ty + s * 0.13); c.lineTo(gx + s * 0.14, ty + s * 0.13); c.stroke(); } c.restore(); }
      else { c.save(); c.strokeStyle = 'rgba(30,80,30,.55)'; c.lineWidth = Math.max(0.7, s * 0.014); for (j = 0; j < 14; j++) { var px = x - s * 0.95 + j * s * 0.145 + (k % 2) * s * 0.05, py = ty + s * 0.13; c.beginPath(); c.moveTo(px, py); c.lineTo(px + Math.sin(t / 600 + j) * s * 0.012, py - s * 0.07); c.stroke(); } c.restore(); }
    }
    /* the buffalo walks left to right on the lowest bank, fading in and out at the edges */
    var u = fr(t / 14000), bx = x - s * 0.95 + u * s * 1.9, by = y + s * 0.9, m = s * 0.75, ph = t / 330, al = Math.min(1, u * 8, (1 - u) * 8);
    c.save(); c.globalAlpha = al; c.translate(bx, by);
    [[-0.22, 0], [0.2, 1], [-0.12, 2], [0.3, 3]].forEach(function (l, i) { var sw = Math.sin(ph + i * 1.57); line(c, [[l[0] * m, -m * 0.38], [l[0] * m + sw * m * 0.1, -m * 0.05 - Math.max(0, -sw) * m * 0.04]], i % 2 ? '#2e2e36' : '#3c3c44', m * 0.1); });
    paper(c, ell(0, -m * 0.55, m * 0.46, m * 0.25), '#4a4a52', 0.9);
    line(c, [[-m * 0.42, -m * 0.6], [-m * 0.52, -m * 0.35 + Math.sin(t / 400) * m * 0.04]], '#3c3c44', m * 0.04);
    paper(c, ell(m * 0.5, -m * 0.38, m * 0.16, m * 0.13, 0.5), '#3c3c44', 0.9);
    paper(c, poly([[m * 0.42, -m * 0.45], [m * 0.26, -m * 0.62], [m * 0.22, -m * 0.58], [m * 0.38, -m * 0.4]]), '#e8e2d0', 0.4);
    dot(c, m * 0.55, -m * 0.4, m * 0.025, '#fffaf0');
    c.restore();
  });
};
/* ป่า forest: layered jungle trees sway; a gibbon swings on a vine */
P.pa = function (c, x, y, s, t) {
  var gy = y + s * 0.85, k, layers = [
    { col: '#5d9e4a', tr: '#6a4a2a', xs: [-0.7, -0.2, 0.35, 0.8], r: 0.34, h: 0.8, ph: 0 },
    { col: '#3f8442', tr: '#5a3a1a', xs: [-0.5, 0.05, 0.6], r: 0.4, h: 0.95, ph: 1 },
    { col: '#2f6b3a', tr: '#4a2e18', xs: [-0.85, -0.1, 0.55, 0.95], r: 0.36, h: 0.6, ph: 2 }];
  paper(c, ell(x, gy + s * 0.04, s * 1.0, s * 0.1), '#2f6b3a', 0.4);
  layers.forEach(function (L, li) {
    L.xs.forEach(function (f, i) {
      var tx = x + s * f, sw = Math.sin(t / 900 + L.ph + i * 1.3) * s * 0.035, top = gy - s * L.h, rr = s * L.r;
      paper(c, poly([[tx - s * 0.04, gy], [tx + s * 0.04, gy], [tx + s * 0.025 + sw * 0.4, top + rr * 0.5], [tx - s * 0.025 + sw * 0.4, top + rr * 0.5]]), L.tr, 0.6);
      [[0, 0, 1], [-0.7, 0.35, 0.72], [0.7, 0.3, 0.74], [0.1, -0.55, 0.65]].forEach(function (b, bi) { paper(c, ball(tx + sw + b[0] * rr * 0.7, top + b[1] * rr * 0.6, rr * b[2] * 0.75, 7 + bi + li), bi % 2 ? L.col : (li === 1 ? '#4d9e52' : L.col), 0.9 + li * 0.2); });
    });
  });
  {
      /* the vine and the gibbon, a pendulum from the high bough */
      var pvx = x + s * 0.2, pvy = y - s * 1.0, a = 0.7 * Math.sin(t / 950), len = s * 1.1, hx = pvx + Math.sin(a) * len, hy = pvy + Math.cos(a) * len;
      paper(c, poly([[pvx - s * 0.5, pvy - s * 0.05], [pvx + s * 0.45, pvy - s * 0.08], [pvx + s * 0.45, pvy + s * 0.0], [pvx - s * 0.5, pvy + s * 0.03]]), '#5a3a1a', 0.8);
      line(c, [[pvx, pvy], [hx, hy]], '#3a6a2a', s * 0.03);
      c.save(); c.translate(hx, hy); c.rotate(a * 0.6); c.scale(1.5, 1.5);
      line(c, [[-s * 0.01, s * 0.16], [-s * 0.2, s * 0.3], [-s * 0.34, s * 0.36 + Math.sin(t / 300) * s * 0.02]], '#2a2a30', s * 0.05);
      line(c, [[s * 0.01, s * 0.16], [-s * 0.08, s * 0.4], [-s * 0.2, s * 0.52 + Math.sin(t / 300 + 1) * s * 0.02]], '#3a3a42', s * 0.05);
      paper(c, ell(0, s * 0.3, s * 0.1, s * 0.2, 0.0), '#3a3a42', 0.9);
      paper(c, ell(s * 0.02, s * 0.34, s * 0.06, s * 0.12), '#c9b99a', 0.3);
      line(c, [[0, s * 0.12], [s * 0.02, -s * 0.02], [0, 0]], '#2a2a30', s * 0.05);
      line(c, [[-s * 0.05, s * 0.2], [-s * 0.16, -s * 0.0], [-s * 0.02, -s * 0.0]], '#2a2a30', s * 0.04);
      paper(c, ball(s * 0.0, s * 0.1, s * 0.09, 3), '#2a2a30', 0.8);
      paper(c, ell(s * 0.01, s * 0.11, s * 0.055, s * 0.06), '#e8e2d0', 0.3);
      dot(c, s * 0.0, s * 0.1, s * 0.012, INK); dot(c, s * 0.04, s * 0.1, s * 0.012, INK);
      dot(c, 0, 0, s * 0.03, '#2a2a30');
      c.restore();
    }
};
function bz(a, b, c2, d, u) { var v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c2[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c2[1] + u * u * u * d[1]]; }
/* ทอง gold: gold leaf squares stacked on a lacquer pedestal; a glint sweeps across; one sheet lifts away */
P.thong = function (c, x, y, s, t) {
  var gy = y + s * 0.88, y0 = gy - s * 0.5, N = 11, k, i, hs = s * 0.5;
  paper(c, poly([[x - s * 0.7, gy], [x + s * 0.7, gy], [x + s * 0.58, gy - s * 0.12], [x - s * 0.58, gy - s * 0.12]]), RED, 1.2);
  paper(c, poly([[x - s * 0.34, gy - s * 0.12], [x + s * 0.34, gy - s * 0.12], [x + s * 0.24, gy - s * 0.34], [x - s * 0.24, gy - s * 0.34]]), '#a8432f', 0.9);
  line(c, [[x - s * 0.66, gy - s * 0.1], [x + s * 0.66, gy - s * 0.1]], GOLD, s * 0.025);
  paper(c, ell(x, gy - s * 0.38, s * 0.7, s * 0.14), RED, 1);
  paper(c, ell(x, gy - s * 0.4, s * 0.62, s * 0.11), '#a8432f', 0.4);
  function sheet(k2) { var a = ((k2 * 0.61) % 0.3) - 0.15, ca = Math.cos(a), sa = Math.sin(a), h2 = hs * (1 - k2 * 0.008), cy = y0 - k2 * s * 0.085; return [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (p) { return [x + (p[0] * ca - p[1] * sa) * h2, cy + (p[0] * sa + p[1] * ca) * h2 * 0.42]; }); }
  for (k = 0; k < N; k++) {
    var pts = sheet(k), low = pts.map(function (p) { return [p[0], p[1] + s * 0.05]; });
    if (k === 0 || k === N - 1) { paper(c, poly(low), '#b8892a', 0.8); paper(c, poly(pts), k % 2 ? '#f2cb62' : GOLD, 1); }
    else { flat(c, poly(low), '#b8892a'); flat(c, poly(pts), k % 2 ? '#f2cb62' : GOLD); line(c, pts.concat([pts[0]]), 'rgba(140,90,20,.35)', Math.max(0.6, s * 0.01)); }
  }
  /* the sweep of light, clipped to the stack */
  c.save(); c.beginPath(); for (k = 0; k < N; k++) { var pp = sheet(k); c.moveTo(pp[0][0], pp[0][1]); for (i = 1; i < 4; i++) c.lineTo(pp[i][0], pp[i][1] + s * 0.05); c.closePath(); c.moveTo(pp[0][0], pp[0][1]); for (i = 1; i < 4; i++) c.lineTo(pp[i][0], pp[i][1]); c.closePath(); } c.clip();
  var sx = x - s * 1.4 + fr(t / 2600) * s * 2.8;
  c.fillStyle = 'rgba(255,255,235,.75)'; c.beginPath(); c.moveTo(sx, y0 - s * 1.2); c.lineTo(sx + s * 0.12, y0 - s * 1.2); c.lineTo(sx - s * 0.3, y0 + s * 0.2); c.lineTo(sx - s * 0.42, y0 + s * 0.2); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,235,.4)'; c.beginPath(); c.moveTo(sx + s * 0.2, y0 - s * 1.2); c.lineTo(sx + s * 0.28, y0 - s * 1.2); c.lineTo(sx - s * 0.14, y0 + s * 0.2); c.lineTo(sx - s * 0.22, y0 + s * 0.2); c.closePath(); c.fill();
  c.restore();
  var gp = fr(t / 2600); if (gp > 0.2 && gp < 0.8) glint(c, x + (gp - 0.5) * s * 1.4, y0 - s * 0.85, s * 0.17, t, 0);
  /* a loose leaf lifting off the top */
  var fl = Math.abs(Math.sin(t / 700)), fx = x + s * 0.45 + Math.sin(t / 1300) * s * 0.1, fy = y0 - N * s * 0.085 - s * 0.35 + Math.sin(t / 1000) * s * 0.06, fa = Math.sin(t / 900) * 0.5;
  paper(c, poly([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (p) { var h2 = s * 0.22; return [fx + (p[0] * Math.cos(fa) - p[1] * Math.sin(fa)) * h2, fy + (p[0] * Math.sin(fa) + p[1] * Math.cos(fa)) * h2 * (0.15 + 0.4 * fl)]; })), '#f6d878', 0.9);
  glint(c, x - s * 0.55, y0 - s * 0.6, s * 0.1, t, 3);
};
/* ข้าว rice: stalks heavy with grain bow in the wind; a basket of sticky rice steams beside them */
P.khao = function (c, x, y, s, t) {
  var gy = y + s * 0.86, i, j;
  paper(c, ell(x, gy + s * 0.02, s * 1.0, s * 0.1), '#8fc4d4', 0.4);
  for (i = 0; i < 6; i++) {
    var bx = x - s * 0.95 + i * s * 0.17, h = s * (1.45 - (i % 3) * 0.12), bow = s * (0.42 + 0.06 * (i % 2)) + Math.sin(t / 850 + i * 0.7) * s * 0.07;
    var p0 = [bx, gy], p1 = [bx - s * 0.02, gy - h * 0.8], p2 = [bx + bow * 0.4, gy - h * 1.12], p3 = [bx + bow, gy - h * 0.72], pts = [];
    for (j = 0; j <= 12; j++) pts.push(bz(p0, p1, p2, p3, j / 12));
    [[-1, 0.2], [1, 0.12]].forEach(function (lv, li) { var lp = [[bx, gy - h * lv[1]], [bx + lv[0] * s * 0.12, gy - h * lv[1] - s * 0.35], [bx + lv[0] * s * 0.3 + Math.sin(t / 900 + i) * s * 0.03, gy - h * lv[1] - s * 0.6]]; paper(c, ribbon(lp.map(function (p, ii, a) { return ii === 1 ? p : p; }), s * 0.05, s * 0.01), li ? '#4d9e52' : '#3f8442', 0.5); });
    line(c, pts, '#6a9a3a', s * 0.025);
    for (j = 0; j < 11; j++) {
      var u = 0.6 + j * 0.036, q0 = bz(p0, p1, p2, p3, u), q1 = bz(p0, p1, p2, p3, u + 0.02), ang = Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), off = (j % 2 ? 1 : -1) * s * 0.03;
      flat(c, ell(q0[0] - Math.sin(ang) * off, q0[1] + Math.cos(ang) * off, s * 0.05, s * 0.022, ang + (j % 2 ? 0.5 : -0.5)), (i + j) % 3 ? '#e8b84a' : '#d9a02a');
    }
  }
  /* the sticky-rice basket, its rice steaming */
  var kx = x + s * 0.7, ky = gy;
  paper(c, poly([[kx - s * 0.26, ky - s * 0.5], [kx + s * 0.26, ky - s * 0.5], [kx + s * 0.2, ky], [kx - s * 0.2, ky]]), '#d8b060', 1.2);
  c.save(); poly([[kx - s * 0.26, ky - s * 0.5], [kx + s * 0.26, ky - s * 0.5], [kx + s * 0.2, ky], [kx - s * 0.2, ky]])(c); c.clip(); c.strokeStyle = 'rgba(110,70,25,.5)'; c.lineWidth = Math.max(0.7, s * 0.014);
  for (j = -8; j <= 8; j++) { c.beginPath(); c.moveTo(kx + j * s * 0.06 - s * 0.3, ky - s * 0.5); c.lineTo(kx + j * s * 0.06 + s * 0.3, ky); c.stroke(); c.beginPath(); c.moveTo(kx + j * s * 0.06 + s * 0.3, ky - s * 0.5); c.lineTo(kx + j * s * 0.06 - s * 0.3, ky); c.stroke(); }
  c.restore();
  paper(c, rect(kx - s * 0.28, ky - s * 0.55, s * 0.56, s * 0.07), '#a8702a', 0.9);
  paper(c, ell(kx, ky - s * 0.56, s * 0.26, s * 0.07), '#fffdf4', 0.6);
  paper(c, function (q) { q.beginPath(); q.ellipse(kx, ky - s * 0.56, s * 0.22, s * 0.2, 0, PI, TAU); q.closePath(); }, '#fffdf4', 0.8);
  for (j = 0; j < 3; j++) { var u2 = fr(t / 2400 + j / 3); c.save(); c.globalAlpha = Math.sin(u2 * PI) * 0.7; c.strokeStyle = '#fff'; c.lineWidth = s * 0.03; c.lineCap = 'round'; c.beginPath(); for (var k2 = 0; k2 <= 8; k2++) { var v = k2 / 8; c.lineTo(kx + (j - 1) * s * 0.12 + Math.sin(v * 5 + t / 400 + j) * s * 0.05, ky - s * 0.8 - u2 * s * 0.35 - v * s * 0.2); } c.stroke(); c.restore(); }
};
/* พระ monk: in saffron, walking his alms round at dawn with the bowl at his belly */
P.phra = function (c, x, y, s, t) {
  var gy = y + s * 0.9, ph = t / 330, sw = Math.sin(ph), bob = Math.abs(Math.cos(ph)) * s * 0.025, k, SAF = '#e8892a', SAF2 = '#b8601a', SK = '#d9a27a';
  paper(c, ball(x, y - s * 0.12, s * 0.8, 9), '#f6c063', 0.6);
  paper(c, ball(x, y - s * 0.12, s * 0.6, 8), '#f0a030', 0.4);
  paper(c, ell(x, gy, s * 0.7, s * 0.07), 'rgba(60,35,15,.3)', 0.1);
  [-1, 1].forEach(function (sd) { var lift = Math.max(0, sd * sw) * s * 0.05; paper(c, ell(x + sd * s * 0.11 + sd * sw * s * 0.03, gy - s * 0.02 - lift, s * 0.075, s * 0.035), SK, 0.4); });
  c.save(); c.translate(0, -bob);
  var hs = Math.sin(ph) * s * 0.03;
  paper(c, poly([[x - s * 0.2, gy - s * 0.78], [x + s * 0.2, gy - s * 0.78], [x + s * 0.3 + hs, gy - s * 0.07], [x - s * 0.3 + hs, gy - s * 0.07]]), SAF, 1.2);
  for (k = 1; k < 5; k++) line(c, [[x - s * 0.2 + k * s * 0.08, gy - s * 0.76], [x - s * 0.3 + k * s * 0.12 + hs, gy - s * 0.1]], SAF2, s * 0.012);
  line(c, [[x - s * 0.3 + hs, gy - s * 0.1], [x + s * 0.3 + hs, gy - s * 0.1]], SAF2, s * 0.03);
  paper(c, poly([[x - s * 0.26, gy - s * 1.22], [x + s * 0.28, gy - s * 1.2], [x + s * 0.22, gy - s * 0.74], [x - s * 0.22, gy - s * 0.74]]), SK, 0.8);
  paper(c, poly([[x - s * 0.29, gy - s * 1.22], [x - s * 0.04, gy - s * 1.3], [x + s * 0.22, gy - s * 0.96], [x + s * 0.22, gy - s * 0.74], [x - s * 0.24, gy - s * 0.74]]), SAF, 1);
  line(c, [[x - s * 0.2, gy - s * 1.18], [x + s * 0.1, gy - s * 0.86]], SAF2, s * 0.012); line(c, [[x - s * 0.12, gy - s * 1.2], [x + s * 0.14, gy - s * 0.92]], SAF2, s * 0.01);
  paper(c, rect(x - s * 0.06, gy - s * 1.36, s * 0.12, s * 0.1), SK, 0.4);
  /* the arms folded around the bowl */
  line(c, [[x - s * 0.26, gy - s * 1.16], [x - s * 0.32, gy - s * 0.96], [x - s * 0.14, gy - s * 0.88]], SAF, s * 0.09);
  line(c, [[x + s * 0.24, gy - s * 1.14], [x + s * 0.31, gy - s * 0.95], [x + s * 0.14, gy - s * 0.88]], SK, s * 0.075);
  paper(c, function (q) { q.beginPath(); q.ellipse(x, gy - s * 0.93, s * 0.19, s * 0.2, 0, 0, PI); q.closePath(); }, '#2a1a12', 1);
  paper(c, ell(x, gy - s * 0.93, s * 0.19, s * 0.06), GOLD, 0.5);
  flat(c, ell(x - s * 0.06, gy - s * 0.86, s * 0.05, s * 0.025), 'rgba(255,255,255,.25)');
  dot(c, x - s * 0.15, gy - s * 0.9, s * 0.045, SK); dot(c, x + s * 0.15, gy - s * 0.9, s * 0.045, SK);
  var hy = gy - s * 1.5;
  [-1, 1].forEach(function (sd) { paper(c, ell(x + sd * s * 0.145, hy + s * 0.01, s * 0.03, s * 0.055), SK, 0.3); });
  paper(c, ell(x, hy, s * 0.14, s * 0.165), '#e0a97c', 1);
  line(c, [[x - s * 0.09, hy - s * 0.01], [x - s * 0.05, hy + s * 0.005], [x - s * 0.01, hy - s * 0.01]], INK, s * 0.014); line(c, [[x + s * 0.01, hy - s * 0.01], [x + s * 0.05, hy + s * 0.005], [x + s * 0.09, hy - s * 0.01]], INK, s * 0.014);
  line(c, [[x - s * 0.04, hy + s * 0.07], [x, hy + s * 0.09], [x + s * 0.04, hy + s * 0.07]], '#a8432f', s * 0.014);
  c.restore();
};
/* ไม้ wood: a felled log on trestles is sawn; sawdust puffs from the kerf; the cut end shows its rings */
P.mai = function (c, x, y, s, t) {
  var gy = y + s * 0.85, cy = y + s * 0.15, R = s * 0.34, xe = x + s * 0.5, k, kx = x - s * 0.15, top = cy - R;
  [x - s * 0.5, x + s * 0.25].forEach(function (tx) { paper(c, ribbon([[tx - s * 0.2, gy], [tx, cy + R * 0.7]], s * 0.07, s * 0.07), '#8a5a32', 0.8); paper(c, ribbon([[tx + s * 0.2, gy], [tx, cy + R * 0.7]], s * 0.07, s * 0.07), '#6a4a2a', 0.8); paper(c, rect(tx - s * 0.12, cy + R * 0.55, s * 0.24, s * 0.06), '#5a3a1a', 0.7); });
  paper(c, ell(x, gy + s * 0.01, s * 0.95, s * 0.06), 'rgba(60,35,15,.25)', 0.1);
  paper(c, ell(x - s * 0.85, cy, s * 0.1, R), '#4a3018', 1.2);
  paper(c, rect(x - s * 0.85, cy - R, xe - x + s * 0.85, R * 2), '#6a4a2a', 1.4);
  c.save(); rect(x - s * 0.85, cy - R, xe - x + s * 0.85, R * 2)(c); c.clip();
  c.fillStyle = 'rgba(255,230,180,.2)'; c.fillRect(x - s * 0.85, cy - R, xe - x + s * 0.85, R * 0.3);
  c.strokeStyle = 'rgba(30,18,8,.5)'; c.lineWidth = Math.max(0.7, s * 0.014); c.lineCap = 'round';
  for (k = 0; k < 26; k++) { var bx = x - s * 0.8 + (k * 0.381 % 1) * s * 1.28, by = cy - R + ((k * 0.618) % 1) * R * 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + s * (0.05 + (k % 3) * 0.04), by + (k % 2 ? 0.01 : -0.01) * s); c.stroke(); }
  c.restore();
  paper(c, ell(xe, cy, s * 0.12, R), '#e8c88a', 1.3);
  [0.8, 0.62, 0.46, 0.3, 0.16].forEach(function (f, i) { c.save(); c.strokeStyle = i % 2 ? '#a8742f' : '#c89a5a'; c.lineWidth = Math.max(0.7, s * 0.018); c.beginPath(); c.ellipse(xe, cy, s * 0.12 * f, R * f, 0, 0, TAU); c.stroke(); c.restore(); });
  dot(c, xe, cy, s * 0.012, '#7a4a1a'); line(c, [[xe, cy], [xe + s * 0.08, cy - R * 0.6]], 'rgba(90,50,20,.6)', s * 0.01);
  /* the kerf */
  paper(c, poly([[kx - s * 0.06, top], [kx + s * 0.06, top], [kx + s * 0.01, top + s * 0.3], [kx - s * 0.01, top + s * 0.3]]), '#2a1a0e', 0.2);
  line(c, [[kx - s * 0.06, top], [kx - s * 0.01, top + s * 0.29]], '#e8c88a', s * 0.012); line(c, [[kx + s * 0.06, top], [kx + s * 0.01, top + s * 0.29]], '#c89a5a', s * 0.012);
  /* the saw working to and fro along its own length */
  var m = Math.sin(t / 210) * s * 0.13;
  c.save(); c.translate(kx, top + s * 0.27); c.rotate(-0.8); c.translate(m, 0);
  var bl = s * 0.95, wd = s * 0.1;
  paper(c, poly([[-s * 0.05, -wd * 0.25], [bl, -wd * 0.7], [bl, wd * 0.7], [-s * 0.05, wd * 0.25]]), '#b8c0c8', 0.9);
  c.strokeStyle = '#6a737c'; c.lineWidth = Math.max(0.7, s * 0.012); c.beginPath(); for (k = 0; k <= 16; k++) c.lineTo(k * (bl + s * 0.05) / 16 - s * 0.05, wd * (0.25 + 0.45 * k / 16) + (k % 2 ? s * 0.02 : 0)); c.stroke();
  line(c, [[s * 0.1, -wd * 0.12], [bl * 0.9, -wd * 0.4]], 'rgba(255,255,255,.6)', s * 0.012);
  paper(c, ell(bl + s * 0.1, 0, s * 0.12, s * 0.07), '#8a5a32', 0.8);
  dot(c, bl + s * 0.1, 0, s * 0.018, '#5a3a1a');
  c.restore();
  for (k = 0; k < 8; k++) { var u = fr(t / 640 + k / 8), sx = kx + (k % 4 - 1.5) * s * 0.07 * (0.3 + u) , sy = top - Math.sin(u * PI) * s * (0.14 + (k % 3) * 0.05); c.fillStyle = 'rgba(244,222,170,' + (1 - u).toFixed(2) + ')'; c.beginPath(); c.arc(sx, sy, s * (0.016 + (k % 3) * 0.008), 0, TAU); c.fill(); }
  paper(c, ell(kx - s * 0.04, gy - s * 0.01, s * 0.2, s * 0.04), '#e8d4a0', 0.3);
};
/* ไฟ fire: a flickering cooking fire under a clay stove; sparks rise */
P.fai = function (c, x, y, s, t) {
  var gy = y + s * 0.88, k, f1 = Math.sin(t / 97), f2 = Math.sin(t / 131 + 1), f3 = Math.sin(t / 77 + 2);
  paper(c, ell(x, gy + s * 0.01, s * 0.8, s * 0.07), 'rgba(60,35,15,.3)', 0.1);
  var ty = gy - s * 0.58;
  /* flames licking round the pot, behind the stove top */
  flame(c, x - s * 0.42, ty + s * 0.02, s * (0.78 + 0.1 * f1), s * 0.13, f2 * s * 0.05, '#d9342b'); flame(c, x + s * 0.42, ty + s * 0.02, s * (0.72 + 0.1 * f3), s * 0.13, f1 * s * 0.05, '#d9342b');
  flame(c, x - s * 0.42, ty + s * 0.02, s * (0.5 + 0.08 * f2), s * 0.08, f3 * s * 0.04, '#f2a02a'); flame(c, x + s * 0.42, ty + s * 0.02, s * (0.46 + 0.08 * f1), s * 0.08, f2 * s * 0.04, '#f2a02a');
  /* the pot with its lid */
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.4, ty - s * 0.2); q.bezierCurveTo(x - s * 0.46, ty + s * 0.08, x - s * 0.3, ty + s * 0.12, x - s * 0.22, ty + s * 0.1); q.lineTo(x + s * 0.22, ty + s * 0.1); q.bezierCurveTo(x + s * 0.3, ty + s * 0.12, x + s * 0.46, ty + s * 0.08, x + s * 0.4, ty - s * 0.2); q.closePath(); }, '#2f2a28', 1.2);
  line(c, [[x - s * 0.34, ty - s * 0.06], [x - s * 0.3, ty + s * 0.04]], 'rgba(255,255,255,.2)', s * 0.03);
  paper(c, ell(x, ty - s * 0.2, s * 0.43, s * 0.06), '#3a3532', 0.8);
  paper(c, function (q) { q.beginPath(); q.ellipse(x, ty - s * 0.2, s * 0.38, s * 0.2, 0, PI, TAU); q.closePath(); }, '#4a4440', 1);
  paper(c, ball(x, ty - s * 0.42, s * 0.05, 3), '#c8913a', 0.6);
  /* the stove */
  paper(c, blob([[x - s * 0.58, gy], [x - s * 0.5, gy - s * 0.3], [x - s * 0.52, ty], [x + s * 0.52, ty], [x + s * 0.5, gy - s * 0.3], [x + s * 0.58, gy]]), '#c8642a', 1.4);
  paper(c, rect(x - s * 0.55, ty - s * 0.02, s * 1.1, s * 0.08), '#a34a1c', 0.8);
  c.save(); c.strokeStyle = 'rgba(100,40,10,.45)'; c.lineWidth = Math.max(0.7, s * 0.014); for (k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - s * 0.5, ty + s * (0.12 + k * 0.07)); c.quadraticCurveTo(x, ty + s * (0.18 + k * 0.07), x + s * 0.5, ty + s * (0.12 + k * 0.07)); c.stroke(); } c.restore();
  var ax = x, aw = s * 0.26, ay = gy - s * 0.02, ah = s * 0.3;
  function arch(q) { q.beginPath(); q.moveTo(ax - aw, ay); q.lineTo(ax - aw, ay - ah * 0.5); q.arc(ax, ay - ah * 0.5, aw, PI, TAU); q.lineTo(ax + aw, ay); q.closePath(); }
  paper(c, arch, '#2a0e08', 0.2);
  c.save(); arch(c); c.clip(); c.fillStyle = '#7a1f1a'; c.fillRect(ax - aw, ay - ah, aw * 2, ah);
  flame(c, ax - aw * 0.4, ay, ah * (0.8 + 0.12 * f1), aw * 0.5, f2 * s * 0.03, '#d9342b'); flame(c, ax + aw * 0.4, ay, ah * (0.75 + 0.12 * f2), aw * 0.5, f3 * s * 0.03, '#d9342b');
  flame(c, ax, ay, ah * (0.95 + 0.1 * f3), aw * 0.55, f1 * s * 0.04, '#f2a02a'); flame(c, ax, ay, ah * (0.55 + 0.08 * f1), aw * 0.3, f2 * s * 0.02, '#ffe27a');
  c.restore();
  paper(c, ribbon([[x - s * 0.45, gy - s * 0.02], [x - s * 0.1, gy - s * 0.1]], s * 0.07, s * 0.06), '#5a3a1a', 0.8);
  paper(c, ribbon([[x + s * 0.45, gy - s * 0.03], [x + s * 0.1, gy - s * 0.11]], s * 0.07, s * 0.06), '#6a4a2a', 0.8);
  for (k = 0; k < 9; k++) { var u = fr(t / 1500 + k * 0.137), px = x + (k - 4) * s * 0.1 + Math.sin(u * 8 + k * 2) * s * 0.07, py = ty - s * 0.1 - u * s * 0.95; c.fillStyle = 'rgba(255,' + Math.round(210 - u * 90) + ',90,' + (1 - u).toFixed(2) + ')'; c.beginPath(); c.arc(px, py, s * 0.022 * (1 - u * 0.5), 0, TAU); c.fill(); }
};
/* ปาก mouth: talking; the lips open and close and small arcs of speech go out */
P.pak = function (c, x, y, s, t) {
  var o = Math.max(0, Math.sin(t / 190)) * (0.55 + 0.45 * Math.sin(t / 1300)), g = s * 0.32 * o, W = s * 0.5, mx = x - s * 0.1, my = y + s * 0.05, k;
  paper(c, blob([[mx - s * 0.85, my - s * 0.4], [mx, my - s * 0.62], [mx + s * 0.85, my - s * 0.4], [mx + s * 0.8, my + s * 0.4], [mx, my + s * 0.7], [mx - s * 0.8, my + s * 0.4]]), '#eebf92', 1.2);
  flat(c, ell(mx - s * 0.58, my + s * 0.02, s * 0.14, s * 0.08), 'rgba(226,90,95,.4)'); flat(c, ell(mx + s * 0.58, my + s * 0.02, s * 0.14, s * 0.08), 'rgba(226,90,95,.4)');
  flat(c, ell(mx - s * 0.06, my - s * 0.34, s * 0.025, s * 0.018), 'rgba(122,60,40,.55)'); flat(c, ell(mx + s * 0.06, my - s * 0.34, s * 0.025, s * 0.018), 'rgba(122,60,40,.55)');
  /* inside the mouth */
  var inner = function (q) { q.beginPath(); q.moveTo(mx - W, my); q.quadraticCurveTo(mx, my - g * 1.0 - s * 0.01, mx + W, my); q.quadraticCurveTo(mx, my + g + s * 0.01, mx - W, my); q.closePath(); };
  flat(c, inner, '#4a0f10');
  if (g > s * 0.03) { c.save(); inner(c); c.clip(); c.fillStyle = '#fffaf0'; c.fillRect(mx - W, my - g, W * 2, g * 0.55); c.fillStyle = '#e0707a'; c.beginPath(); c.ellipse(mx, my + g * 0.7, W * 0.5, g * 0.45, 0, 0, TAU); c.fill(); c.restore(); }
  paper(c, function (q) { q.beginPath(); q.moveTo(mx - W, my); q.bezierCurveTo(mx - W * 0.6, my - s * 0.3 - g * 0.5, mx - W * 0.25, my - s * 0.32 - g * 0.5, mx, my - s * 0.19 - g * 0.5); q.bezierCurveTo(mx + W * 0.25, my - s * 0.32 - g * 0.5, mx + W * 0.6, my - s * 0.3 - g * 0.5, mx + W, my); q.quadraticCurveTo(mx, my - g * 1.0 - s * 0.01, mx - W, my); q.closePath(); }, '#d9342b', 0.9);
  paper(c, function (q) { q.beginPath(); q.moveTo(mx - W, my); q.quadraticCurveTo(mx, my + g + s * 0.01, mx + W, my); q.bezierCurveTo(mx + W * 0.5, my + s * 0.36 + g * 0.9, mx - W * 0.5, my + s * 0.36 + g * 0.9, mx - W, my); q.closePath(); }, '#e0463b', 1.2);
  line(c, [[mx - W * 0.3, my + g + s * 0.14], [mx + W * 0.3, my + g + s * 0.14]], 'rgba(255,255,255,.4)', s * 0.03);
  for (k = 0; k < 3; k++) { var u = fr(t / 1000 + k / 3), r = s * (0.12 + u * 0.4); c.save(); c.globalAlpha = Math.sin(u * PI); c.strokeStyle = k % 2 ? GOLD : ORANGE; c.lineWidth = Math.max(1, s * 0.04); c.lineCap = 'round'; c.beginPath(); c.arc(mx + W + s * 0.05, my - s * 0.02, r, -0.7, 0.7); c.stroke(); c.restore(); }
};
/* มือ hand: an open hand waves, then the palms come together in a wai, and round again */
function handOpen(c, s, t) {
  var fl = Math.sin(t / 140), k, bx = [-0.19, -0.095, 0, 0.095, 0.185], L = [0.28, 0.38, 0.42, 0.36, 0.26], an = [-0.28, -0.1, 0, 0.1, 0.26], sk = '#e0a97c';
  for (k = 0; k < 5; k++) {
    var a = an[k] + fl * 0.04 * (k - 2), x0 = bx[k] * s, y0 = -0.36 * s, x1 = x0 + Math.sin(a) * L[k] * s, y1 = y0 - Math.cos(a) * L[k] * s;
    paper(c, ribbon([[x0, y0], [x1, y1]], s * 0.1, s * 0.085), sk, 0.6); flat(c, ball(x1, y1, s * 0.042, 3), sk); dot(c, x1 - Math.sin(a) * s * 0.005, y1 + s * 0.005, s * 0.02, '#f0b0a0');
  }
  paper(c, ribbon([[-0.18 * s, -0.1 * s], [-0.5 * s, -0.3 * s]], s * 0.12, s * 0.095), sk, 0.6); flat(c, ball(-0.5 * s, -0.3 * s, s * 0.047, 3), sk);
  paper(c, blob([[-0.17, 0.02], [-0.25, -0.16], [-0.23, -0.4], [0.0, -0.44], [0.22, -0.4], [0.24, -0.18], [0.17, 0.02]].map(function (p) { return [p[0] * s, p[1] * s]; })), sk, 0.8);
  [-0.1, 0.0, 0.1].forEach(function (f) { line(c, [[f * s, -0.12 * s], [f * s * 0.8, -0.26 * s]], 'rgba(150,90,60,.3)', s * 0.01); });
  paper(c, poly([[-0.25 * s, 0], [0.25 * s, 0], [0.31 * s, 0.36 * s], [-0.31 * s, 0.36 * s]]), INDIGO, 0.8);
  paper(c, rect(-0.26 * s, -0.02 * s, 0.52 * s, 0.06 * s), GOLD, 0.4);
}
function handWai(c, s, t) {
  var sk = '#e0a97c', bob = Math.sin(t / 500) * s * 0.01;
  paper(c, ribbon([[0, -0.78 * s], [0, -0.95 * s]], s * 0.02, s * 0.02), '#4d9e52', 0.3);
  paper(c, blob([[0, -1.18], [-0.07, -1.0], [0, -0.82], [0.07, -1.0]].map(function (p) { return [p[0] * s, p[1] * s + bob]; })), '#f09ab0', 0.6);
  paper(c, blob([[-0.1, -0.98], [-0.14, -0.86], [0, -0.8], [0.0, -0.95]].map(function (p) { return [p[0] * s, p[1] * s + bob]; })), '#e0708c', 0.4);
  paper(c, blob([[0, 0.05], [-0.17, -0.1], [-0.2, -0.35], [-0.11, -0.6], [0, -0.8], [0.11, -0.6], [0.2, -0.35], [0.17, -0.1]].map(function (p) { return [p[0] * s, p[1] * s]; })), sk, 1);
  line(c, [[0, -0.79 * s], [0, -0.14 * s]], 'rgba(150,90,60,.55)', s * 0.012);
  [-1, 1].forEach(function (sd) { line(c, [[sd * 0.05 * s, -0.7 * s], [sd * 0.1 * s, -0.45 * s]], 'rgba(150,90,60,.3)', s * 0.01); paper(c, ell(sd * 0.08 * s, -0.12 * s, s * 0.05, s * 0.09, sd * 0.5), sk, 0.4); });
  [-1, 1].forEach(function (sd) { paper(c, ribbon([[sd * 0.6 * s, 0.45 * s], [sd * 0.17 * s, 0.02 * s]], s * 0.26, s * 0.2), INDIGO, 0.8); line(c, [[sd * 0.32 * s, 0.24 * s], [sd * 0.22 * s, 0.1 * s]], GOLD, s * 0.04); });
}
P.mue = function (c, x, y, s, t) {
  var u = (t % 7000) / 7000, w = u < 0.45 ? 1 : u < 0.55 ? 1 - sm((u - 0.45) / 0.1) : u < 0.95 ? 0 : sm((u - 0.95) / 0.05), s2 = s * 1.5, k;
  if (w > 0.01) { c.save(); c.globalAlpha = w; c.translate(x, y + s * 0.55); c.rotate(Math.sin(t / 200) * 0.28 * (u < 0.5 ? 1 : 0.4)); c.scale(0.7 + 0.3 * w, 0.7 + 0.3 * w); handOpen(c, s2, t); c.restore(); }
  if (w < 0.99) { c.save(); c.globalAlpha = 1 - w; c.translate(x, y + s * 0.62); c.scale(0.8 + 0.2 * (1 - w), 0.8 + 0.2 * (1 - w)); handWai(c, s2 * 0.95, t); c.restore(); }
  if (u > 0.6 && u < 0.9) for (k = 0; k < 3; k++) glint(c, x + (k - 1) * s * 0.55, y - s * (0.7 + (k % 2) * 0.1), s * 0.08, t, k);
};
/* ช้าง elephant: bathing, the trunk raised and curled back to spray water over its own back */
P.chang = function (c, x, y, s, t) {
  var m = s * 0.52, ox = x - s * 0.1, oy = y + s * 0.1, k, G = '#8a8f98', G2 = '#767b84';
  function X(a) { return ox + a * m; } function Y(b) { return oy + b * m; } function Q(p) { return [X(p[0]), Y(p[1])]; }
  var fl = Math.sin(t / 420), gyy = 1.12;
  paper(c, ell(X(0.1), Y(gyy), m * 1.5, m * 0.14), '#8fc4d4', 0.3);
  /* far legs, tail */
  [[-0.62, G2], [0.62, G2]].forEach(function (l) { paper(c, rect(X(l[0]) - m * 0.2, Y(0.35), m * 0.4, m * 0.78), l[1], 0.7); });
  line(c, [[X(-1.0), Y(-0.35)], [X(-1.25), Y(0.1)], [X(-1.2 + Math.sin(t / 500) * 0.1), Y(0.55)]], G2, m * 0.08); dot(c, X(-1.2 + Math.sin(t / 500) * 0.1), Y(0.58), m * 0.08, '#3a3a40');
  paper(c, ell(X(0), Y(0), m * 1.05, m * 0.7), G, 1.5);
  /* the red cloth over the back, with gold fringe */
  paper(c, poly([[X(-0.55), Y(-0.67)], [X(0.4), Y(-0.67)], [X(0.5), Y(-0.15)], [X(-0.65), Y(-0.15)]]), '#c0392b', 1);
  line(c, [[X(-0.65), Y(-0.15)], [X(0.5), Y(-0.15)]], GOLD, m * 0.08);
  for (k = 0; k < 6; k++) line(c, [[X(-0.55 + k * 0.19), Y(-0.15)], [X(-0.55 + k * 0.19), Y(-0.02)]], GOLD, m * 0.035);
  paper(c, ell(X(-0.1), Y(-0.43), m * 0.14, m * 0.1), GOLD, 0.4);
  /* near legs */
  [[-0.5, G], [0.52, G]].forEach(function (l) { paper(c, rect(X(l[0]) - m * 0.22, Y(0.35), m * 0.44, m * 0.78), l[1], 0.9); for (var j = 0; j < 3; j++) dot(c, X(l[0]) + (j - 1) * m * 0.12, Y(1.08), m * 0.035, '#fbf3df'); line(c, [[X(l[0]) - m * 0.18, Y(0.7)], [X(l[0]) + m * 0.1, Y(0.72)]], 'rgba(0,0,0,.15)', m * 0.02); });
  /* the head and ear */
  paper(c, ell(X(1.02), Y(-0.28), m * 0.5, m * 0.52), G, 1.4);
  var tp = [[1.5, -0.1], [1.78, -0.45], [1.86, -0.95], [1.62, -1.45], [1.25, -1.55]].map(Q), tr = []; for (k = 0; k <= 12; k++) tr.push(bz(tp[0], tp[1], tp[3], tp[4], k / 12));
  paper(c, ribbon(tr, m * 0.36, m * 0.15), G, 1.2);
  for (k = 1; k < 10; k += 2) { var pp = tr[k]; line(c, [[pp[0] - m * 0.08, pp[1] + m * 0.03], [pp[0] + m * 0.08, pp[1] - m * 0.03]], 'rgba(0,0,0,.15)', m * 0.02); }
  paper(c, function (q) { q.beginPath(); q.moveTo(X(0.7), Y(-0.55)); q.bezierCurveTo(X(0.2 - fl * 0.06), Y(-0.6), X(0.2 - fl * 0.08), Y(0.15), X(0.68 - fl * 0.02), Y(0.28)); q.bezierCurveTo(X(0.78), Y(0.0), X(0.86), Y(-0.25), X(0.7), Y(-0.55)); q.closePath(); }, G2, 1.3);
  paper(c, function (q) { q.beginPath(); q.moveTo(X(0.68), Y(-0.4)); q.bezierCurveTo(X(0.38 - fl * 0.04), Y(-0.38), X(0.38 - fl * 0.04), Y(0.0), X(0.66), Y(0.1)); q.closePath(); }, '#c9a8a8', 0.3);
  paper(c, ribbon([[X(1.28), Y(-0.02)], [X(1.4), Y(0.28)], [X(1.3), Y(0.5)]], m * 0.1, m * 0.02), '#fbf3df', 0.7);
  eye(c, X(1.2), Y(-0.38), m * 0.05);
  paper(c, poly([[X(0.98), Y(-0.65)], [X(1.18), Y(-0.55)], [X(1.18), Y(-0.45)], [X(0.98), Y(-0.5)]]), GOLD, 0.4);
  /* the spray: out of the tip, over the back */
  var T = [1.2, -1.57]; var path = []; for (k = 0; k <= 14; k++) { var uu = k / 14; path.push([X(T[0] - 1.25 * uu), Y(T[1] - 1.45 * uu + 2.3 * uu * uu)]); }
  c.save(); c.globalAlpha = 0.45; paper(c, ribbon(path, m * 0.05, m * 0.14), '#bfe6f6', 0.2); c.restore();
  for (k = 0; k < 18; k++) { var du = fr(t / 900 + k / 18), dx = X(T[0] - 1.25 * du) + Math.sin(k * 5.1) * m * 0.06 * du, dy = Y(T[1] - 1.45 * du + 2.3 * du * du) + Math.cos(k * 3.7) * m * 0.04 * du; dot(c, dx, dy, m * (0.045 + (k % 3) * 0.015), k % 2 ? '#e6f6fc' : '#9fd8f0'); }
  for (k = 0; k < 6; k++) { var su = fr(t / 600 + k / 6); dot(c, X(-0.05) + (k - 2.5) * m * 0.09 * (0.5 + su), Y(-0.67) - Math.sin(su * PI) * m * 0.3, m * 0.03, 'rgba(230,246,252,' + (1 - su).toFixed(2) + ')'); }
};
/* เงิน money: silver coins land one by one and the stack climbs; two finished stacks stand beside it */
P.ngoen = function (c, x, y, s, t) {
  var gy = y + s * 0.88, rx = s * 0.28, ry = rx * 0.38, th = s * 0.105, base = gy - s * 0.2, k;
  paper(c, poly([[x - s * 0.95, gy], [x + s * 0.95, gy], [x + s * 0.82, gy - s * 0.24], [x - s * 0.82, gy - s * 0.24]]), RED, 1.2);
  paper(c, poly([[x - s * 0.86, gy - s * 0.04], [x + s * 0.86, gy - s * 0.04], [x + s * 0.78, gy - s * 0.2], [x - s * 0.78, gy - s * 0.2]]), '#a8432f', 0.4);
  for (k = -9; k <= 9; k++) line(c, [[x + k * s * 0.1, gy], [x + k * s * 0.1, gy + s * 0.06]], GOLD, s * 0.02);
  function coin(cx, cy, r, ry2, top) {
    flat(c, function (q) { q.beginPath(); q.moveTo(cx - r, cy); q.lineTo(cx - r, cy + th); q.ellipse(cx, cy + th, r, ry2, 0, PI, 0, true); q.lineTo(cx + r, cy); q.ellipse(cx, cy, r, ry2, 0, 0, PI, true); q.closePath(); }, '#8d98a3');
    if (top) paper(c, ell(cx, cy, r, ry2), '#e3e8ec', 0.7); else flat(c, ell(cx, cy, r, ry2), '#dfe5ea');
    c.save(); c.strokeStyle = '#9aa5b0'; c.lineWidth = Math.max(0.6, s * 0.012); c.beginPath(); c.ellipse(cx, cy, r * 0.72, ry2 * 0.72, 0, 0, TAU); c.stroke(); c.restore();
    flat(c, ell(cx, cy, r * 0.2, ry2 * 0.2), '#aab4bd');
  }
  function stack(cx, n, top) { for (var i = 0; i < n; i++) coin(cx, base - i * th, rx, ry, top && i === n - 1); }
  stack(x - s * 0.66, 3, true); stack(x - s * 0.02, 5, true);
  var step = 650, kk = Math.floor(t / step) % 10, f = fr(t / step), cx = x + s * 0.62, land = f >= 0.7 ? 1 : 0, n = Math.min(8, kk + land);
  if (kk === 0 && f < 0.7) n = 0; else n = Math.min(8, kk + land);
  stack(cx, n, true);
  if (f < 0.7 && kk < 8) { var d = 1 - f / 0.7, cyy = base - n * th - d * d * s * 1.1; c.save(); c.translate(cx, cyy); c.rotate(d * 0.9 * (kk % 2 ? 1 : -1)); c.translate(-cx, -cyy); coin(cx, cyy, rx, ry, true); c.restore(); }
  if (kk >= 8) glint(c, cx + Math.sin(t / 300) * s * 0.1, base - 8 * th - s * 0.12, s * 0.14, t, kk);
  if (f > 0.7 && f < 0.9 && kk < 8) glint(c, cx, base - n * th - s * 0.04, s * 0.1, t, 5);
};
/* ยา medicine: a stone mortar and pestle grind herbs; leaves lie beside them and a small bottle stands by */
P.ya = function (c, x, y, s, t) {
  var gy = y + s * 0.82, ry0 = y + s * 0.06, a = t / 430, k, mx = x - s * 0.05;
  paper(c, ell(x, gy + s * 0.01, s * 1.0, s * 0.06), 'rgba(60,35,15,.25)', 0.1);
  /* the leaves, bundled */
  [[-1.25, '#3f8442'], [-1.45, '#2f6b3a'], [-1.7, '#5d9e4a'], [-1.9, '#4d9e52'], [-1.06, '#2f6b3a']].forEach(function (l, i) { var lx = x - s * 0.8, a2 = l[0] + Math.sin(t / 900 + i) * 0.03; paper(c, lf(lx, gy, s * 0.75, s * 0.11, a2 - 0.0), l[1], 0.8 + i * 0.1); line(c, [[lx, gy], [lx + Math.cos(a2) * s * 0.68, gy + Math.sin(a2) * s * 0.68]], 'rgba(255,255,255,.3)', s * 0.01); });
  paper(c, ell(x - s * 0.8, gy - s * 0.02, s * 0.06, s * 0.03), '#c8913a', 0.5);
  /* the mortar */
  paper(c, rect(mx - s * 0.3, gy - s * 0.12, s * 0.6, s * 0.12), '#7a7a76', 1.1);
  paper(c, function (q) { q.beginPath(); q.moveTo(mx - s * 0.5, ry0); q.bezierCurveTo(mx - s * 0.54, ry0 + s * 0.38, mx - s * 0.34, ry0 + s * 0.5, mx - s * 0.24, gy - s * 0.1); q.lineTo(mx + s * 0.24, gy - s * 0.1); q.bezierCurveTo(mx + s * 0.34, ry0 + s * 0.5, mx + s * 0.54, ry0 + s * 0.38, mx + s * 0.5, ry0); q.closePath(); }, '#9a9a94', 1.4);
  line(c, [[mx - s * 0.4, ry0 + s * 0.15], [mx - s * 0.3, ry0 + s * 0.4]], 'rgba(255,255,255,.35)', s * 0.04);
  for (k = 0; k < 14; k++) dot(c, mx + (((k * 0.37) % 1) - 0.5) * s * 0.7, ry0 + s * 0.15 + ((k * 0.61) % 1) * s * 0.35, s * 0.01, k % 2 ? '#6a6a66' : '#c8c8c0');
  paper(c, ell(mx, ry0, s * 0.5, s * 0.14), '#b0aea6', 0.8);
  flat(c, ell(mx, ry0 + s * 0.01, s * 0.4, s * 0.1), '#4a4844');
  flat(c, ell(mx, ry0 + s * 0.015, s * 0.34, s * 0.075), '#4d8a3a');
  [[-0.2, 0.01, '#7fb84a'], [0.12, 0.03, '#3f8442'], [0.0, -0.02, '#a8cf6a'], [0.22, -0.01, '#2f6b3a'], [-0.08, 0.04, '#5d9e4a']].forEach(function (b, i) { flat(c, lf(mx + b[0] * s, ry0 + b[1] * s, s * 0.12, s * 0.03, i * 1.3), b[2]); });
  /* the pestle, circling inside */
  c.save(); c.beginPath(); c.rect(x - s * 1.2, y - s * 1.2, s * 2.4, (ry0 + s * 0.09) - (y - s * 1.2)); c.clip();
  var tx = mx + Math.cos(a) * s * 0.2, ty = y - s * 0.82 + Math.sin(a) * s * 0.03, bx = mx + Math.cos(a + 1.2) * s * 0.07, by = ry0 + s * 0.04;
  paper(c, ribbon([[tx, ty], [bx, by]], s * 0.13, s * 0.17), '#a8742f', 1.4);
  line(c, [[tx - s * 0.03, ty + s * 0.05], [bx - s * 0.04, by - s * 0.08]], 'rgba(255,230,180,.35)', s * 0.03);
  paper(c, ball(tx, ty - s * 0.02, s * 0.085, 3), '#8a5a22', 1);
  c.restore();
  for (k = 0; k < 5; k++) { var u = fr(t / 800 + k / 5); dot(c, mx + (k - 2) * s * 0.1 * (0.5 + u) + Math.cos(a) * s * 0.05, ry0 - Math.sin(u * PI) * s * 0.22, s * 0.017, k % 2 ? '#7fb84a' : '#4d8a3a'); }
  /* the little bottle */
  var bx2 = x + s * 0.78;
  paper(c, function (q) { q.beginPath(); q.moveTo(bx2 - s * 0.14, gy); q.lineTo(bx2 - s * 0.14, gy - s * 0.38); q.quadraticCurveTo(bx2 - s * 0.14, gy - s * 0.5, bx2 - s * 0.06, gy - s * 0.52); q.lineTo(bx2 - s * 0.06, gy - s * 0.62); q.lineTo(bx2 + s * 0.06, gy - s * 0.62); q.lineTo(bx2 + s * 0.06, gy - s * 0.52); q.quadraticCurveTo(bx2 + s * 0.14, gy - s * 0.5, bx2 + s * 0.14, gy - s * 0.38); q.lineTo(bx2 + s * 0.14, gy); q.closePath(); }, '#a8601a', 1.2);
  paper(c, rect(bx2 - s * 0.075, gy - s * 0.72, s * 0.15, s * 0.11), '#c8913a', 0.7);
  paper(c, rect(bx2 - s * 0.14, gy - s * 0.34, s * 0.28, s * 0.2), '#fbf3df', 0.4);
  flat(c, lf(bx2 - s * 0.05, gy - s * 0.2, s * 0.14, s * 0.04, -0.9), '#3f8442'); flat(c, lf(bx2 - s * 0.05, gy - s * 0.2, s * 0.14, s * 0.04, -2.2), '#5d9e4a');
  line(c, [[bx2 - s * 0.09, gy - s * 0.46], [bx2 - s * 0.09, gy - s * 0.38]], 'rgba(255,255,255,.5)', s * 0.025);
};
function cloudPath(cx, cy, w) {
  return blob([[-0.56, 0.3], [-0.64, 0.12], [-0.5, -0.04], [-0.34, -0.1], [-0.28, -0.26], [-0.05, -0.36], [0.2, -0.28], [0.3, -0.12], [0.5, -0.08], [0.64, 0.1], [0.58, 0.3], [0.3, 0.34], [0, 0.35], [-0.3, 0.34]].map(function (p) { return [cx + p[0] * w, cy + p[1] * w]; }));
}
/* a panel of paper, rounded, that a scene is cut into */
function panel(c, x, y, s, col, inner) {
  var r = s * 0.16, X0 = x - s * 0.97, Y0 = y - s * 0.97, W = s * 1.94;
  function p(q) { q.beginPath(); q.moveTo(X0 + r, Y0); q.lineTo(X0 + W - r, Y0); q.quadraticCurveTo(X0 + W, Y0, X0 + W, Y0 + r); q.lineTo(X0 + W, Y0 + W - r); q.quadraticCurveTo(X0 + W, Y0 + W, X0 + W - r, Y0 + W); q.lineTo(X0 + r, Y0 + W); q.quadraticCurveTo(X0, Y0 + W, X0, Y0 + W - r); q.lineTo(X0, Y0 + r); q.quadraticCurveTo(X0, Y0, X0 + r, Y0); q.closePath(); }
  paper(c, p, col, 1.4); c.save(); p(c); c.clip(); inner(); c.restore();
}
/* ทาง way: a winding road goes back into the hills; a tiny scooter travels along it */
P.thang = function (c, x, y, s, t) {
  var k, yb = y + s * 1.0, yh = y - s * 0.08;
  function xc(v) { return x + Math.sin(v * 5.2 + 0.7) * s * 0.42 * (1 - 0.45 * v); }
  function yc(v) { return yb - (yb - yh) * v; }
  function wd(v) { return s * (0.5 * Math.pow(1 - v, 1.5) + 0.025); }
  portal(c, x, y, s * 0.98, '#f6e3b0', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#f6e3b0', 0.2);
    dot(c, x - s * 0.45, y - s * 0.58, s * 0.17, '#f0a030');
    paper(c, blob([[x - s * 1.1, y - s * 0.1], [x - s * 0.6, y - s * 0.36], [x - s * 0.1, y - s * 0.2], [x + s * 0.5, y - s * 0.42], [x + s * 1.1, y - s * 0.1], [x + s * 1.1, y + s * 0.2], [x - s * 1.1, y + s * 0.2]]), '#a9c4b4', 0.5);
    paper(c, blob([[x - s * 1.1, y + s * 0.0], [x - s * 0.5, y - s * 0.14], [x + s * 0.3, y - s * 0.02], [x + s * 1.1, y - s * 0.12], [x + s * 1.1, y + s * 0.4], [x - s * 1.1, y + s * 0.4]]), '#6aa06a', 0.7);
    /* a white chedi on the far hill */
    var cx0 = x + s * 0.5, cy0 = y - s * 0.4;
    paper(c, poly([[cx0 - s * 0.1, cy0 + s * 0.16], [cx0 + s * 0.1, cy0 + s * 0.16], [cx0 + s * 0.07, cy0 + s * 0.04], [cx0 - s * 0.07, cy0 + s * 0.04]]), '#fbf3df', 0.4);
    paper(c, poly([[cx0 - s * 0.06, cy0 + s * 0.05], [cx0, cy0 - s * 0.14], [cx0 + s * 0.06, cy0 + s * 0.05]]), '#fffaf0', 0.4); line(c, [[cx0, cy0 - s * 0.14], [cx0, cy0 - s * 0.24]], GOLD, s * 0.02);
    paper(c, rect(x - s * 1.1, y + s * 0.0, s * 2.2, s * 1.1), '#8fc060', 0.3);
    for (k = 0; k < 6; k++) { var u2 = 0.1 + k * 0.14, side = k % 2 ? 1 : -1, tx = xc(u2) + side * (wd(u2) + s * (0.12 + 0.05 * (1 - u2))), th = s * 0.3 * (1 - u2) + s * 0.05; paper(c, rect(tx - th * 0.05, yc(u2) - th * 0.5, th * 0.1, th * 0.5), '#5a3a1a', 0.3); paper(c, ball(tx, yc(u2) - th * 0.7, th * 0.4, 4 + k), '#3f8442', 0.5); }
    var L = [], R = [], n = 28; for (k = 0; k <= n; k++) { var v = k / n; L.push([xc(v) - wd(v), yc(v)]); R.push([xc(v) + wd(v), yc(v)]); }
    paper(c, poly(L.concat(R.reverse())), '#9a8a74', 0.7);
    var L2 = [], R2 = []; for (k = 0; k <= n; k++) { var v2 = k / n; L2.push([xc(v2) - wd(v2) * 0.9, yc(v2)]); R2.push([xc(v2) + wd(v2) * 0.9, yc(v2)]); }
    flat(c, poly(L2.concat(R2.reverse())), '#6a5e4e');
    for (k = 0; k < 9; k++) { var va = fr(k / 9 + t / 3200) * 0.9, vb = va + 0.035; if (vb > 0.95) continue; line(c, [[xc(va), yc(va)], [xc(vb), yc(vb)]], '#f2e6c9', Math.max(0.8, wd(va) * 0.12)); }
    /* the scooter, seen from behind, going away */
    var u = fr(t / 9000), v = 0.04 + u * 0.88, al = Math.min(1, u * 10, (1 - u) * 6), m = s * 0.62 * Math.pow(1 - v, 1.1) + s * 0.03, lean = (xc(v + 0.02) - xc(v)) / (s * 0.1);
    c.save(); c.globalAlpha = al; c.translate(xc(v), yc(v)); c.rotate(clamp(lean, -0.5, 0.5) * 0.5);
    flat(c, ell(0, 0, m * 0.2, m * 0.05), 'rgba(0,0,0,.3)');
    paper(c, rect(-m * 0.04, -m * 0.2, m * 0.08, m * 0.2), '#2a2a30', 0.3);
    paper(c, poly([[-m * 0.17, -m * 0.2], [m * 0.17, -m * 0.2], [m * 0.12, -m * 0.5], [-m * 0.12, -m * 0.5]]), '#c0392b', 0.6);
    dot(c, 0, -m * 0.34, m * 0.03, '#ffe27a');
    paper(c, poly([[-m * 0.14, -m * 0.5], [m * 0.14, -m * 0.5], [m * 0.17, -m * 0.95], [-m * 0.17, -m * 0.95]]), INDIGO, 0.6);
    paper(c, ball(0, -m * 1.1, m * 0.15, 3), '#e8b84a', 0.6);
    c.restore();
  });
};
/* เขา mountain: misty layered mountains, a white chedi on the high peak, mist drifting between */
P['khao-3'] = function (c, x, y, s, t) {
  function mist(k, yy, a) { var u = fr(t / (9000 + k * 2500) + k * 0.37), mx = x - s * 1.5 + u * s * 3.0; c.save(); c.globalAlpha = a; c.fillStyle = '#fbf3df'; c.beginPath(); c.ellipse(mx, y + yy * s, s * 0.7, s * 0.07, 0, 0, TAU); c.ellipse(mx + s * 0.3, y + yy * s - s * 0.05, s * 0.4, s * 0.06, 0, 0, TAU); c.fill(); c.restore(); }
  function P2(pts) { return pts.map(function (p) { return [x + p[0] * s, y + p[1] * s]; }); }
  panel(c, x, y, s, '#f6e3b0', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#f8e8c0', 0.2);
    dot(c, x + s * 0.5, y - s * 0.6, s * 0.2, '#f6b44a');
    paper(c, poly(P2([[-1.1, -0.1], [-0.75, -0.38], [-0.5, -0.22], [-0.15, -0.52], [0.2, -0.26], [0.55, -0.46], [0.8, -0.22], [1.1, -0.34], [1.1, 1.1], [-1.1, 1.1]])), '#c6d3dc', 0.5);
    mist(0, -0.28, 0.7);
    paper(c, poly(P2([[-1.1, 0.1], [-0.7, -0.08], [-0.42, -0.4], [-0.22, -0.68], [-0.08, -0.4], [0.25, -0.22], [0.6, -0.05], [1.1, 0.12], [1.1, 1.1], [-1.1, 1.1]])), '#8fa9b8', 0.8);
    /* the chedi on the peak */
    var px = x - s * 0.22, py = y - s * 0.68;
    paper(c, poly([[px - s * 0.12, py + s * 0.02], [px + s * 0.12, py + s * 0.02], [px + s * 0.09, py - s * 0.04], [px - s * 0.09, py - s * 0.04]]), '#fbf3df', 0.4);
    paper(c, function (q) { q.beginPath(); q.moveTo(px - s * 0.09, py - s * 0.04); q.bezierCurveTo(px - s * 0.1, py - s * 0.15, px - s * 0.04, py - s * 0.2, px - s * 0.02, py - s * 0.24); q.lineTo(px + s * 0.02, py - s * 0.24); q.bezierCurveTo(px + s * 0.04, py - s * 0.2, px + s * 0.1, py - s * 0.15, px + s * 0.09, py - s * 0.04); q.closePath(); }, '#fffaf0', 0.5);
    paper(c, poly([[px - s * 0.025, py - s * 0.24], [px, py - s * 0.4], [px + s * 0.025, py - s * 0.24]]), GOLD, 0.4);
    glint(c, px, py - s * 0.4, s * 0.08, t, 1);
    mist(1, 0.0, 0.65);
    paper(c, poly(P2([[-1.1, 0.4], [-0.6, 0.22], [-0.2, 0.36], [0.3, 0.12], [0.7, 0.28], [1.1, 0.2], [1.1, 1.1], [-1.1, 1.1]])), '#4f7f68', 1);
    mist(2, 0.38, 0.6);
    paper(c, poly(P2([[-1.1, 0.68], [-0.5, 0.5], [0.0, 0.66], [0.6, 0.5], [1.1, 0.62], [1.1, 1.1], [-1.1, 1.1]])), '#2f5a40', 1.2);
    for (var k = 0; k < 10; k++) { var tx = x - s * 0.9 + k * s * 0.2, ty = y + s * (0.78 + (k % 3) * 0.05); paper(c, poly([[tx - s * 0.06, ty], [tx, ty - s * 0.2], [tx + s * 0.06, ty]]), k % 2 ? '#25483a' : '#3a6a4a', 0.4); }
  });
};
/* เรือ boat: a long-tail boat runs across the waves with its wake behind and ribbons at the bow */
P.ruea = function (c, x, y, s, t) {
  var k, u0 = s * 0.74, bob = Math.sin(t / 520) * s * 0.03, wl = y + s * 0.36;
  function W(a, b) { return [x + s * 0.12 + a * u0, wl + bob + b * u0]; }
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.98, y + s * 0.95); q.lineTo(x - s * 0.98, wl - s * 0.04); for (var i = 0; i <= 20; i++) q.lineTo(x - s * 0.98 + i * s * 0.098, wl - s * 0.04 + Math.sin(i * 1.1 - t / 500) * s * 0.025); q.lineTo(x + s * 0.98, y + s * 0.95); q.closePath(); }, '#4aa0c8', 0.5);
  /* the wake: foam behind the propeller */
  var pr = W(-1.42, 0.05);
  for (k = 0; k < 12; k++) { var u = fr(t / 1100 + k / 12), fx = pr[0] + 0.04 * s - u * s * 0.5 - 0, fy = wl + s * 0.06 + Math.sin(k * 3.1 + t / 200) * s * 0.03 * (0.5 + u); c.fillStyle = 'rgba(255,255,255,' + (0.85 * (1 - u)).toFixed(2) + ')'; c.beginPath(); c.arc(fx - s * 0.02, fy, s * (0.025 + u * 0.05), 0, TAU); c.fill(); }
  c.save(); c.translate(0, bob * 0.0); c.translate(x + s * 0.12, wl + bob); c.rotate(0.035 * Math.sin(t / 640)); c.translate(-(x + s * 0.12), -(wl + bob));
  var hull = [W(-0.95, -0.12), W(-0.88, 0.12), W(-0.3, 0.2), W(0.5, 0.12), W(0.98, -0.34)];
  paper(c, function (q) { q.beginPath(); q.moveTo(hull[0][0], hull[0][1]); q.bezierCurveTo(hull[1][0], hull[1][1], hull[2][0], hull[2][1] + s * 0.02, W(0.1, 0.2)[0], W(0.1, 0.2)[1]); q.bezierCurveTo(hull[3][0], hull[3][1], W(0.85, 0.0)[0], W(0.85, 0.0)[1], hull[4][0], hull[4][1]); q.quadraticCurveTo(W(0.6, -0.14)[0], W(0.6, -0.14)[1], W(0.2, -0.1)[0], W(0.2, -0.1)[1]); q.lineTo(W(-0.5, -0.1)[0], W(-0.5, -0.1)[1]); q.closePath(); }, '#c0392b', 1.4);
  line(c, [W(-0.93, -0.06), W(-0.4, -0.06), W(0.3, -0.04), W(0.8, -0.2)], '#1f4a6b', s * 0.045);
  line(c, [W(-0.95, -0.12), W(-0.5, -0.1), W(0.2, -0.1), W(0.6, -0.14), W(0.98, -0.34)], GOLD, s * 0.03);
  /* the bow ribbons */
  var bow = W(0.97, -0.33);
  ['#d9342b', GOLD, '#2f8f5b', '#f09ab0'].forEach(function (cl, i) { var pts = []; for (var j = 0; j <= 8; j++) { var v = j / 8; pts.push([bow[0] - v * s * 0.4, bow[1] - s * 0.02 - i * s * 0.025 + v * s * 0.05 + Math.sin(v * 7 - t / 140 + i) * s * 0.03 * v]); } paper(c, ribbon(pts, s * 0.04, s * 0.02), cl, 0.3); });
  /* a striped awning over the middle, and a seated passenger */
  [-0.3, 0.3].forEach(function (f) { var p = W(f, -0.1), q2 = W(f, -0.58); line(c, [p, q2], '#5a3a1a', s * 0.025); });
  figure(c, W(0.0, -0.1)[0], W(0.0, -0.1)[1] + s * 0.04, s * 0.5, pose(0, 0.24, [1.5, -1.5, 1.4, -1.5], [0.4, 1.0, -0.2, 0.6]), { dir: 1, garb: 'casual', col: '#e8892a', low: '#2c2f45', skin: '#c98b62', hair: 4 });
  paper(c, poly([W(-0.42, -0.58), W(0.42, -0.58), W(0.5, -0.5), W(-0.5, -0.5)]), '#fbf3df', 0.8);
  for (k = 0; k < 5; k++) { var a0 = W(-0.5 + k * 0.2, -0.5), b0 = W(-0.5 + k * 0.2 + 0.1, -0.5), c0 = W(-0.42 + k * 0.17 + 0.085, -0.58), d0 = W(-0.42 + k * 0.17, -0.58); flat(c, poly([a0, b0, c0, d0]), k % 2 ? '#fbf3df' : '#d9342b'); }
  /* the engine on its post, the long shaft down to the water */
  var e0 = W(-0.7, -0.1), e1 = W(-0.7, -0.4);
  paper(c, rect(e1[0] - s * 0.12, e1[1] - s * 0.14, s * 0.24, s * 0.16), '#2a2a30', 1);
  paper(c, rect(e1[0] - s * 0.08, e1[1] - s * 0.24, s * 0.16, s * 0.1), '#c0392b', 0.7);
  paper(c, ell(e1[0] + s * 0.12, e1[1] - s * 0.06, s * 0.03, s * 0.05), '#b8c0c8', 0.5);
  line(c, [e0, e1], '#3a3a42', s * 0.05);
  line(c, [[e1[0] - s * 0.1, e1[1] - s * 0.04], pr], '#8d98a3', s * 0.03);
  c.restore();
  dot(c, pr[0], pr[1] + bob * 0.2, s * 0.04, '#5a636b');
  /* the front waves over the hull's foot */
  c.save(); c.globalAlpha = 0.85; c.fillStyle = '#2f7aa0'; c.beginPath(); c.moveTo(x - s * 0.98, wl + s * 0.2); for (k = 0; k <= 20; k++) c.lineTo(x - s * 0.98 + k * s * 0.098, wl + s * 0.14 + Math.sin(k * 0.95 + 1 - t / 420) * s * 0.035); c.lineTo(x + s * 0.98, y + s * 0.95); c.lineTo(x - s * 0.98, y + s * 0.95); c.closePath(); c.fill(); c.restore();
  for (k = 0; k < 5; k++) { var wx = x - s + fr(t / 5000 + k * 0.2) * s * 2; c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = Math.max(0.8, s * 0.016); c.beginPath(); c.moveTo(wx, wl + s * 0.45 + (k % 3) * s * 0.1); c.quadraticCurveTo(wx + s * 0.1, wl + s * 0.4 + (k % 3) * s * 0.1, wx + s * 0.2, wl + s * 0.45 + (k % 3) * s * 0.1); c.stroke(); }
};
/* ฟ้า sky: clouds drift, lightning flashes now and then, rain streaks fall */
P.fa = function (c, x, y, s, t) {
  var k, ph = fr(t / 3600), flash = (ph < 0.04 || (ph > 0.07 && ph < 0.12)) ? 1 : 0;
  portal(c, x, y, s * 0.98, '#2d4f73', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), flash ? '#5a7fa3' : '#2d4f73', 0.2);
    for (k = 0; k < 2; k++) { var lx = x - s * 1.4 + fr(t / 16000 + k * 0.5) * s * 2.8; flat(c, cloudPath(lx, y - s * 0.55 + k * s * 0.1, s * 0.55), 'rgba(235,242,248,.85)'); }
    paper(c, cloudPath(x - s * 0.25 + Math.sin(t / 3500) * s * 0.12, y - s * 0.28, s * 1.2), '#6a7f95', 1);
    paper(c, cloudPath(x + s * 0.4 + Math.sin(t / 4200 + 1) * s * 0.1, y - s * 0.2, s * 0.95), '#46586e', 1.2);
    if (flash) { var bx = x - s * 0.05, by = y - s * 0.06, pts = [[bx, by], [bx - s * 0.14, by + s * 0.28], [bx - s * 0.02, by + s * 0.3], [bx - s * 0.2, by + s * 0.62], [bx - s * 0.1, by + s * 0.64], [bx - s * 0.3, by + s * 0.98]];
      var L2 = pts.map(function (p, i) { return [p[0] + s * 0.07, p[1]]; }); var poly2 = pts.concat(L2.reverse());
      c.save(); c.shadowColor = '#fff6c8'; c.shadowBlur = s * 0.2; flat(c, poly(poly2), '#fff6c8'); c.restore(); }
    c.save(); c.strokeStyle = 'rgba(190,220,240,.7)'; c.lineWidth = Math.max(0.8, s * 0.016); c.lineCap = 'round';
    for (k = 0; k < 26; k++) { var rx = x - s + ((k * 0.381) % 1) * s * 2.2, ry = y - s * 0.1 + fr(t / 650 + k * 0.173) * s * 1.2; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - s * 0.04, ry + s * 0.16); c.stroke(); }
    c.restore();
    if (flash) { c.fillStyle = 'rgba(255,255,240,.28)'; c.fillRect(x - s, y - s, s * 2, s * 2); }
  });
};
/* ไข่ egg: three eggs in a woven nest; one is hatching, the chick peeking out */
function eggPath(cx, cy, w, h) { return function (q) { q.beginPath(); q.moveTo(cx, cy - h); q.bezierCurveTo(cx + w * 0.8, cy - h, cx + w * 1.05, cy + h * 0.35, cx, cy + h); q.bezierCurveTo(cx - w * 1.05, cy + h * 0.35, cx - w * 0.8, cy - h, cx, cy - h); q.closePath(); }; }
P.khai = function (c, x, y, s, t) {
  var ny = y + s * 0.4, rx = s * 0.95, k, rock = Math.sin(t / 900) * 0.06;
  paper(c, ell(x, ny, rx, s * 0.2), '#7a5a3a', 1.2); flat(c, ell(x, ny, rx * 0.92, s * 0.16), '#3a2a1a');
  function speck(cx, cy, w, h, seed) { for (var i = 0; i < 7; i++) dot(c, cx + (((i * 0.37 + seed) % 1) - 0.5) * w * 1.2, cy + (((i * 0.61 + seed * 2) % 1) - 0.3) * h * 1.2, s * 0.012, 'rgba(140,100,60,.5)'); }
  /* left and right eggs */
  [[-0.58, 0.04, 0.26, 0.34, 0.12, 0.3], [0.6, 0.06, 0.25, 0.33, -0.2, 0.7]].forEach(function (e, i) {
    var ex = x + e[0] * s, ey = y + e[1] * s, a = e[4] + rock * (i ? -1 : 1);
    c.save(); c.translate(ex, ey + e[3] * s); c.rotate(a); c.translate(-ex, -ey - e[3] * s);
    paper(c, eggPath(ex, ey, e[2] * s, e[3] * s), '#fbf3df', 1.2); flat(c, ell(ex - e[2] * s * 0.35, ey - e[3] * s * 0.3, e[2] * s * 0.2, e[3] * s * 0.35, 0.4), 'rgba(255,255,255,.55)'); speck(ex, ey, e[2] * s, e[3] * s, e[5]); c.restore();
  });
  /* the hatching egg in the middle */
  var cx = x, cy = y + s * 0.02, w = s * 0.31, h = s * 0.4, peek = (0.5 + 0.5 * Math.sin(t / 1100)) * s * 0.1, zz = [];
  for (k = 0; k <= 8; k++) zz.push([cx - w * 1.1 + k * w * 0.275, cy - s * 0.04 + (k % 2 ? -1 : 1) * s * 0.05]);
  var hy = cy - s * 0.2 - peek, op = Math.max(0, Math.sin(t / 330)) * (Math.sin(t / 2000) > -0.3 ? 1 : 0);
  paper(c, ell(cx, cy - s * 0.06 - peek * 0.3, s * 0.2, s * 0.22), '#f6d34a', 0.8);
  [-1, 1].forEach(function (sd) { paper(c, ell(cx + sd * s * 0.22, cy - s * 0.0 - peek * 0.2, s * 0.06, s * 0.1, sd * 0.4), '#e8b82a', 0.5); });
  paper(c, ball(cx, hy, s * 0.19, 4), '#f6d34a', 0.9);
  [-0.03, 0.0, 0.04].forEach(function (f, i) { line(c, [[cx + f * s * 1.4, hy - s * 0.17], [cx + (f * 2.5 + (i - 1) * 0.02) * s, hy - s * 0.28 - (i % 2) * s * 0.03]], '#e8b82a', s * 0.02); });
  dot(c, cx - s * 0.08, hy - s * 0.02, s * 0.028, INK); dot(c, cx + s * 0.09, hy - s * 0.02, s * 0.028, INK);
  dot(c, cx - s * 0.075, hy - s * 0.03, s * 0.01, '#fff'); dot(c, cx + s * 0.095, hy - s * 0.03, s * 0.01, '#fff');
  flat(c, ell(cx - s * 0.13, hy + s * 0.05, s * 0.04, s * 0.025), 'rgba(240,120,100,.45)'); flat(c, ell(cx + s * 0.15, hy + s * 0.05, s * 0.04, s * 0.025), 'rgba(240,120,100,.45)');
  paper(c, poly([[cx - s * 0.05, hy + s * 0.04 - op * s * 0.01], [cx + s * 0.05, hy + s * 0.04 - op * s * 0.01], [cx, hy + s * 0.12 + op * s * 0.0]]), '#e8892a', 0.3);
  if (op > 0.2) flat(c, poly([[cx - s * 0.045, hy + s * 0.07], [cx + s * 0.045, hy + s * 0.07], [cx, hy + s * 0.12 + op * s * 0.05]]), '#c0392b');
  /* lower shell, with its jagged lip */
  c.save(); eggPath(cx, cy, w, h)(c); c.clip(); c.beginPath(); c.moveTo(zz[0][0], zz[0][1]); zz.forEach(function (p) { c.lineTo(p[0], p[1]); }); c.lineTo(cx + w * 1.2, cy + h * 1.2); c.lineTo(cx - w * 1.2, cy + h * 1.2); c.closePath(); c.clip();
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 5; c.shadowOffsetY = 3; c.fillStyle = '#fbf3df'; c.fillRect(cx - w * 1.2, cy - h, w * 2.4, h * 2.4); c.shadowColor = 'transparent';
  speck(cx, cy + h * 0.4, w, h * 0.6, 0.4); c.restore();
  var tx = cx - w * 0.95, ty = cy - h * 0.55 - Math.sin(t / 700) * s * 0.01;
  c.save(); c.translate(tx, ty); c.rotate(-0.8 + Math.sin(t / 900) * 0.05);
  c.beginPath(); eggPath(0, 0, w * 0.95, h * 0.9)(c); c.clip(); c.beginPath(); c.rect(-w * 1.2, -h, w * 2.4, h * 1.05 - s * 0.0); c.clip();
  paper(c, function (q) { q.beginPath(); q.moveTo(0, -h * 0.9); q.bezierCurveTo(w * 0.76, -h * 0.9, w, -h * 0.05, w * 0.95, h * 0.0); for (var i = 8; i >= 0; i--) q.lineTo(-w * 0.95 + i * w * 0.2375, (i % 2 ? -1 : 1) * s * 0.05 + 0); q.bezierCurveTo(-w * 1.0, -h * 0.05, -w * 0.76, -h * 0.9, 0, -h * 0.9); q.closePath(); }, '#fbf3df', 1);
  c.restore();
  /* the nest's front */
  var nest = function (q) { q.beginPath(); q.ellipse(x, ny, rx, s * 0.2, 0, PI, 0, true); q.ellipse(x, ny, rx, s * 0.52, 0, 0, PI, false); q.closePath(); };
  paper(c, nest, '#8a5a32', 1.4);
  c.save(); nest(c); c.clip(); c.lineCap = 'round';
  for (k = 0; k < 46; k++) { var a = (k * 0.6180339) % 1, b = (k * 0.7548776) % 1; c.strokeStyle = ['#c8a060', '#5a3a1a', '#a8803a', '#e0c080'][k % 4]; c.lineWidth = Math.max(0.8, s * 0.02); var sx = x - rx + a * rx * 2, sy = ny + s * 0.05 + b * s * 0.45; c.beginPath(); c.moveTo(sx - s * 0.12, sy + s * 0.04); c.quadraticCurveTo(sx, sy - s * 0.04, sx + s * 0.12, sy + s * 0.03); c.stroke(); }
  c.restore();
};
/* ลม wind: a paper kite flies on its curving string; leaves and wind-swirls blow past */
P.lom = function (c, x, y, s, t) {
  var k, kx = x + s * 0.2 + Math.sin(t / 1300) * s * 0.14, ky = y - s * 0.42 + Math.sin(t / 1700) * s * 0.1, ang = 0.22 * Math.sin(t / 1100) + 0.15;
  for (k = 0; k < 3; k++) { var u = fr(t / 2400 + k / 3), wy0 = y + (k - 1) * s * 0.55 + s * 0.1; c.save(); c.globalAlpha = Math.sin(u * PI) * 0.7; c.strokeStyle = '#7fb0c8'; c.lineWidth = Math.max(1, s * 0.025); c.lineCap = 'round'; var ox = x - s * 0.95 + u * s * 0.9; c.beginPath(); c.moveTo(ox, wy0); c.bezierCurveTo(ox + s * 0.3, wy0 - s * 0.12, ox + s * 0.7, wy0 + s * 0.12, ox + s * 0.9, wy0 - s * 0.02); c.bezierCurveTo(ox + s * 1.0, wy0 - s * 0.1, ox + s * 1.05, wy0 - s * 0.2, ox + s * 0.95, wy0 - s * 0.22); c.stroke(); c.restore(); }
  /* the string, bellied downwind */
  var ax = x - s * 0.85, ay = y + s * 0.82, sag = Math.sin(t / 900) * s * 0.04;
  c.save(); c.strokeStyle = '#6a4a2a'; c.lineWidth = Math.max(0.8, s * 0.014); c.beginPath(); c.moveTo(ax, ay); c.quadraticCurveTo(x - s * 0.15 + sag, y + s * 0.38 + sag, kx + Math.sin(ang) * s * 0.05, ky + s * 0.1); c.stroke(); c.restore();
  paper(c, ball(ax, ay, s * 0.07, 3), GOLD, 0.6); paper(c, ell(ax, ay + s * 0.06, s * 0.05, s * 0.02), '#5a3a1a', 0.3);
  c.save(); c.translate(kx, ky); c.rotate(ang);
  /* the tail of bows */
  var tl = []; for (k = 0; k <= 14; k++) { var v = k / 14; tl.push([Math.sin(t / 260 - v * 5) * s * 0.07 * v + v * s * 0.05, s * 0.5 + v * s * 0.75]); }
  line(c, tl, '#6a4a2a', Math.max(0.8, s * 0.014));
  [3, 6, 9, 12].forEach(function (i, j) { var p = tl[i], cl = ['#d9342b', GOLD, '#2f8f5b', '#f09ab0'][j]; flat(c, poly([[p[0], p[1]], [p[0] - s * 0.1, p[1] - s * 0.05], [p[0] - s * 0.1, p[1] + s * 0.05]]), cl); flat(c, poly([[p[0], p[1]], [p[0] + s * 0.1, p[1] - s * 0.05], [p[0] + s * 0.1, p[1] + s * 0.05]]), cl); });
  paper(c, poly([[0, -s * 0.52], [0, 0.0], [-s * 0.38, -s * 0.12]]), '#d9342b', 1); paper(c, poly([[0, -s * 0.52], [0, 0], [s * 0.38, -s * 0.12]]), GOLD, 1);
  paper(c, poly([[0, 0], [0, s * 0.52], [-s * 0.38, -s * 0.12]]), '#2f8f5b', 1); paper(c, poly([[0, 0], [0, s * 0.52], [s * 0.38, -s * 0.12]]), '#1f4a6b', 1);
  line(c, [[0, -s * 0.52], [0, s * 0.52]], '#fbf3df', s * 0.025); line(c, [[-s * 0.38, -s * 0.12], [s * 0.38, -s * 0.12]], '#fbf3df', s * 0.025);
  dot(c, 0, -s * 0.12, s * 0.04, '#fbf3df');
  c.restore();
  for (k = 0; k < 5; k++) { var u2 = fr(t / 4200 + k / 5), lx = x - s * 1.1 + u2 * s * 2.3, ly = y + s * 0.15 + (k - 2) * s * 0.3 + Math.sin(u2 * 9 + k) * s * 0.14; c.save(); c.globalAlpha = Math.min(1, u2 * 8, (1 - u2) * 8); paper(c, lf(lx, ly, s * 0.2, s * 0.06, u2 * 10 + k), ['#3f8442', '#e8b84a', '#c8642a', '#5d9e4a', '#a8432f'][k], 0.5); c.restore(); }
};
/* ทราย sand: a sand dune shore; a sand chedi decked with little flags, the sea washing behind */
P['sai-2'] = function (c, x, y, s, t) {
  var k;
  portal(c, x, y, s * 0.98, '#f6e3b0', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#f8e8c0', 0.2);
    paper(c, rect(x - s, y - s * 0.15, s * 2, s * 0.55), '#4aa0c8', 0.3);
    flat(c, rect(x - s, y - s * 0.15, s * 2, s * 0.08), '#7fc0dc');
    paper(c, blob([[x - s * 1.1, y + s * 0.2], [x - s * 0.6, y + s * 0.0], [x - s * 0.1, y + s * 0.12], [x + s * 0.7, y - s * 0.02], [x + s * 1.1, y + s * 0.1], [x + s * 1.1, y + s * 1.1], [x - s * 1.1, y + s * 1.1]]), '#e6c98a', 0.7);
    c.save(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = Math.max(1, s * 0.03); c.lineCap = 'round'; c.beginPath(); for (k = 0; k <= 30; k++) c.lineTo(x - s * 1.05 + k * s * 0.07, y + s * 0.06 + Math.sin(k * 0.8 - t / 500) * s * 0.025 + Math.sin(t / 1600) * s * 0.03); c.stroke(); c.restore();
    paper(c, blob([[x - s * 1.1, y + s * 0.5], [x - s * 0.5, y + s * 0.4], [x + s * 0.2, y + s * 0.5], [x + s * 0.9, y + s * 0.38], [x + s * 1.1, y + s * 0.45], [x + s * 1.1, y + s * 1.1], [x - s * 1.1, y + s * 1.1]]), '#f0dba4', 1);
    var by = y + s * 0.78, tiers = [[0.58, 0.2], [0.46, 0.2], [0.34, 0.2], [0.22, 0.18]], cy2 = by;
    paper(c, ell(x, by, s * 0.7, s * 0.08), '#e0c488', 0.5);
    tiers.forEach(function (T, i) { paper(c, poly([[x - s * T[0], cy2], [x + s * T[0], cy2], [x + s * (T[0] - 0.06), cy2 - s * T[1]], [x - s * (T[0] - 0.06), cy2 - s * T[1]]]), i % 2 ? '#e8cf94' : '#f2dfae', 0.9 + i * 0.1); line(c, [[x - s * (T[0] - 0.03), cy2 - s * T[1] * 0.5], [x + s * (T[0] - 0.03), cy2 - s * T[1] * 0.5]], 'rgba(150,110,50,.35)', s * 0.012); cy2 -= s * T[1]; });
    paper(c, poly([[x - s * 0.16, cy2], [x, cy2 - s * 0.45], [x + s * 0.16, cy2]]), '#f2dfae', 1.1);
    line(c, [[x - s * 0.08, cy2 - s * 0.14], [x + s * 0.08, cy2 - s * 0.14]], 'rgba(150,110,50,.4)', s * 0.012); line(c, [[x - s * 0.05, cy2 - s * 0.26], [x + s * 0.05, cy2 - s * 0.26]], 'rgba(150,110,50,.4)', s * 0.012);
    var topY = cy2 - s * 0.45; line(c, [[x, topY], [x, topY - s * 0.14]], '#6a4a2a', s * 0.015); flat(c, poly([[x, topY - s * 0.14], [x + s * 0.14 + Math.sin(t / 200) * s * 0.02, topY - s * 0.1], [x, topY - s * 0.06]]), '#d9342b');
    /* bunting from the spire to the corners */
    [-1, 1].forEach(function (sd) { var ex = x + sd * s * 0.78, ey = by - s * 0.02, sx = x, sy = topY; c.save(); c.strokeStyle = '#6a4a2a'; c.lineWidth = Math.max(0.7, s * 0.012); c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(x + sd * s * 0.5, topY + s * 0.15, ex, ey); c.stroke(); c.restore();
      for (var i = 1; i < 8; i++) { var u = i / 8, bp = [lerp(lerp(sx, x + sd * s * 0.5, u), lerp(x + sd * s * 0.5, ex, u), u), lerp(lerp(sy, topY + s * 0.15, u), lerp(topY + s * 0.15, ey, u), u)]; flat(c, poly([[bp[0] - s * 0.04, bp[1]], [bp[0] + s * 0.04, bp[1]], [bp[0] + Math.sin(t / 220 + i * 1.3 + sd) * s * 0.02, bp[1] + s * 0.11]]), ['#d9342b', GOLD, '#2f8f5b', '#2f55c9', '#f09ab0'][(i + (sd > 0 ? 2 : 0)) % 5]); } });
    [[-0.58, 0], [0.58, 0]].forEach(function (p) { line(c, [[x + p[0] * s, by - s * 0.02], [x + p[0] * s, by - s * 0.2]], '#6a4a2a', s * 0.012); flat(c, poly([[x + p[0] * s, by - s * 0.2], [x + p[0] * s + s * 0.09, by - s * 0.16 + Math.sin(t / 230) * s * 0.01], [x + p[0] * s, by - s * 0.12]]), '#2f8f5b'); });
    paper(c, poly([[x + s * 0.8, by + s * 0.1], [x + s * 0.74, by + s * 0.0], [x + s * 0.88, by - s * 0.01]]), '#f2e6c9', 0.4);
  });
};
/* ไก่ chicken: a rooster stands on the fence and crows at the rising sun */
P.kai = function (c, x, y, s, t) {
  var k, ph = fr(t / 3600), crow = sm((ph - 0.15) / 0.1) * (1 - sm((ph - 0.62) / 0.1)), sx = x + s * 0.32, sy = y + s * 0.18 - s * 0.05 * Math.sin(t / 2500);
  paper(c, ball(sx, sy, s * 0.55, 9), '#f6b44a', 0.4); paper(c, ball(sx, sy, s * 0.42, 8), '#f0a030', 0.3);
  c.save(); c.translate(sx, sy); c.rotate(t / 9000); c.fillStyle = '#f6b44a'; for (k = 0; k < 14; k++) { var a = k / 14 * TAU, r = s * (0.78 + 0.08 * Math.sin(t / 400 + k)); c.beginPath(); c.moveTo(Math.cos(a - 0.1) * s * 0.58, Math.sin(a - 0.1) * s * 0.58); c.lineTo(Math.cos(a) * r, Math.sin(a) * r); c.lineTo(Math.cos(a + 0.1) * s * 0.58, Math.sin(a + 0.1) * s * 0.58); c.closePath(); c.fill(); } c.restore();
  paper(c, blob([[x - s * 1.1, y + s * 0.62], [x - s * 0.5, y + s * 0.5], [x + s * 0.1, y + s * 0.6], [x + s * 0.7, y + s * 0.48], [x + s * 1.1, y + s * 0.58], [x + s * 1.1, y + s * 1.1], [x - s * 1.1, y + s * 1.1]]), '#5d9e4a', 0.6);
  /* the rooster */
  var bx = x - s * 0.15, by = y + s * 0.02, ry = 0.34 * (1 + 0.07 * crow);
  [['#1f6b6b', -2.4, 0.9], ['#2f6b3a', -2.1, 0.95], ['#1b1410', -1.85, 0.8], ['#7a1f1a', -2.65, 0.7]].forEach(function (f, i) { var sw = Math.sin(t / 700 + i) * 0.04, pts = []; for (var j = 0; j <= 8; j++) { var v = j / 8; pts.push([bx - s * 0.5 + Math.cos(f[1] + sw) * v * s * f[2] * 0.9 - v * v * s * 0.15, by - s * 0.0 + Math.sin(f[1] + sw) * v * s * f[2] * 0.9 + v * v * s * 0.35]); } paper(c, ribbon(pts, s * 0.07, s * 0.2), f[0], 0.8 + i * 0.1); });
  [[-0.06, 0], [0.12, 1]].forEach(function (l) { var lx = bx + l[0] * s; line(c, [[lx, by + s * 0.3], [lx + s * 0.01, y + s * 0.5]], '#e0902a', s * 0.04); line(c, [[lx - s * 0.08, y + s * 0.51], [lx + s * 0.01, y + s * 0.5], [lx + s * 0.1, y + s * 0.51]], '#e0902a', s * 0.03); });
  paper(c, ell(bx, by, s * 0.5, s * ry, -0.25), '#b8501e', 1.4);
  paper(c, ell(bx + s * 0.28, by + s * 0.04, s * 0.26, s * 0.25, 0), '#1b1410', 0.7);
  paper(c, function (q) { q.beginPath(); q.ellipse(bx - s * 0.1, by - s * 0.04, s * 0.32, s * 0.2, -0.3, 0, TAU); }, '#e8892a', 0.9);
  c.save(); c.strokeStyle = 'rgba(120,40,10,.55)'; c.lineWidth = Math.max(0.7, s * 0.014); for (k = 0; k < 3; k++) { c.beginPath(); c.arc(bx - s * 0.14 + k * s * 0.1, by - s * 0.03, s * 0.12, 0.2, 2.6); c.stroke(); } c.restore();
  /* neck and head, thrown back to crow */
  var hx = lerp(x + s * 0.28, x + s * 0.22, crow), hy = lerp(y - s * 0.36, y - s * 0.62, crow), ha = -0.9 * crow;
  paper(c, ribbon([[bx + s * 0.26, by - s * 0.02], [lerp(bx + s * 0.4, bx + s * 0.34, crow), lerp(by - s * 0.22, by - s * 0.3, crow)], [hx - s * 0.02, hy + s * 0.1]], s * 0.3, s * 0.16), '#e8892a', 1);
  paper(c, function (q) { q.beginPath(); q.moveTo(bx + s * 0.1, by - s * 0.1); for (var i = 0; i < 5; i++) { q.lineTo(lerp(bx + s * 0.12, hx - s * 0.12, i / 4) - s * 0.04, lerp(by - s * 0.04, hy + s * 0.12, i / 4) - s * 0.03 + (i % 2 ? 0 : 0)); q.lineTo(lerp(bx + s * 0.12, hx - s * 0.12, (i + 0.5) / 4) - s * 0.14, lerp(by + s * 0.1, hy + s * 0.2, (i + 0.5) / 4)); } q.lineTo(bx + s * 0.3, by + s * 0.1); q.closePath(); }, GOLD, 0.8);
  c.save(); c.translate(hx, hy); c.rotate(ha);
  paper(c, ball(0, 0, s * 0.15, 3), '#c8642a', 1);
  [-0.09, -0.03, 0.04, 0.1].forEach(function (f, i) { paper(c, ball(f * s, -s * 0.16 - (i % 2 ? 0.015 : 0) * s, s * 0.05, 3 + i), CRIM, 0.5); });
  paper(c, ell(s * 0.04, s * 0.02, s * 0.08, s * 0.07), '#d9342b', 0.3);
  var open = crow * 0.35;
  c.save(); c.translate(s * 0.12, s * 0.01); c.rotate(-open); flat(c, poly([[0, -s * 0.045], [s * 0.2, 0], [0, s * 0.01]]), '#f2b83a'); c.restore();
  c.save(); c.translate(s * 0.12, s * 0.025); c.rotate(open); flat(c, poly([[0, 0], [s * 0.15, s * 0.0], [0, s * 0.04]]), '#e0a02a'); c.restore();
  if (crow > 0.3) flat(c, ell(s * 0.14, s * 0.02, s * 0.03, s * 0.015), '#7a1f1a');
  paper(c, ell(s * 0.06, s * 0.14 + crow * s * 0.02, s * 0.04, s * 0.07), CRIM, 0.4);
  eye(c, s * 0.04, -s * 0.03, s * 0.035);
  c.restore();
  if (crow > 0.15) for (k = 0; k < 3; k++) { c.save(); c.globalAlpha = crow * (1 - k * 0.2); c.strokeStyle = GOLD; c.lineWidth = Math.max(1, s * 0.03); c.lineCap = 'round'; c.beginPath(); c.arc(hx - s * 0.1, hy - s * 0.1, s * (0.28 + k * 0.14), -1.7, -0.9); c.stroke(); c.restore(); }
  /* the fence */
  [-0.95, -0.5, -0.05, 0.4, 0.85].forEach(function (f) { paper(c, poly([[x + f * s - s * 0.06, y + s * 1.0], [x + f * s - s * 0.06, y + s * 0.42], [x + f * s, y + s * 0.36], [x + f * s + s * 0.06, y + s * 0.42], [x + f * s + s * 0.06, y + s * 1.0]]), '#8a5a32', 0.9); });
  paper(c, rect(x - s * 1.0, y + s * 0.5, s * 2.0, s * 0.07), '#a8703c', 0.9); paper(c, rect(x - s * 1.0, y + s * 0.74, s * 2.0, s * 0.07), '#a8703c', 0.9);
};
/* ทะเล sea: rolling layered waves, a fishing boat on the horizon, a gull wheeling over */
P['tha-le'] = function (c, x, y, s, t) {
  var k, hz = y - s * 0.12, cols = ['#7fc6d6', '#4aa0c8', '#2f7aa0', '#1f5a80', '#1f4a6b'];
  panel(c, x, y, s, '#f6d8a0', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 0.95), '#fbe8bc', 0.2); flat(c, rect(x - s, y - s * 0.4, s * 2, s * 0.3), '#f8d890');
    dot(c, x + s * 0.4, hz - s * 0.02, s * 0.2, '#f0a030'); flat(c, rect(x - s, hz, s * 2, s * 0.05), '#7fc6d6');
    var bob = Math.sin(t / 700) * s * 0.012, bx = x - s * 0.3 + Math.sin(t / 6000) * s * 0.15;
    paper(c, poly([[bx - s * 0.17, hz - s * 0.04 + bob], [bx + s * 0.17, hz - s * 0.04 + bob], [bx + s * 0.12, hz + s * 0.03 + bob], [bx - s * 0.12, hz + s * 0.03 + bob]]), '#a8432f', 0.5);
    paper(c, rect(bx - s * 0.04, hz - s * 0.12 + bob, s * 0.08, s * 0.08), '#fbf3df', 0.3); line(c, [[bx + s * 0.1, hz - s * 0.04 + bob], [bx + s * 0.1, hz - s * 0.2 + bob]], '#5a3a1a', s * 0.01);
    dot(c, bx - s * 0.1, hz - s * 0.08 + bob, s * 0.025, '#ffe27a');
    for (k = 0; k < 5; k++) {
      var by0 = hz + s * 0.1 + k * s * 0.2, amp = s * (0.025 + k * 0.012), ph2 = t / (800 - k * 90) + k * 1.7;
      paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 1.05, y + s * 1.05); q.lineTo(x - s * 1.05, by0); for (var i = 0; i <= 22; i++) q.lineTo(x - s * 1.05 + i * s * 0.0955, by0 + Math.sin(i * 0.9 - ph2) * amp); q.lineTo(x + s * 1.05, y + s * 1.05); q.closePath(); }, cols[k], 0.6 + k * 0.15);
      c.save(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = Math.max(0.8, s * 0.018); c.lineCap = 'round';
      for (var i2 = 1; i2 < 22; i2 += 3) { var wx = x - s * 1.05 + i2 * s * 0.0955, wy = by0 + Math.sin(i2 * 0.9 - ph2) * amp; if (Math.cos(i2 * 0.9 - ph2) < -0.2) continue; c.beginPath(); c.moveTo(wx - s * 0.07, wy + s * 0.03); c.quadraticCurveTo(wx, wy - s * 0.04, wx + s * 0.07, wy + s * 0.01); c.stroke(); }
      c.restore();
    }
    var u = fr(t / 9000), gx = x - s * 1.0 + u * s * 2.1, gy = y - s * 0.5 + Math.sin(u * TAU * 2) * s * 0.07, fl = Math.sin(t / 150), m = s * 0.34;
    c.save(); c.translate(gx, gy); c.rotate(Math.cos(u * TAU * 2) * 0.1);
    [-1, 1].forEach(function (sd) { paper(c, function (q) { q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(sd * m * 0.4, -m * 0.3 - fl * m * 0.25, sd * m * 0.95, fl * m * 0.5); q.quadraticCurveTo(sd * m * 0.5, -m * 0.04, 0, m * 0.1); q.closePath(); }, '#fffaf0', 0.8); flat(c, poly([[sd * m * 0.7, fl * m * 0.38], [sd * m * 0.95, fl * m * 0.5], [sd * m * 0.6, fl * m * 0.25]]), '#6a737c'); });
    paper(c, ell(0, m * 0.04, m * 0.2, m * 0.08), '#fffaf0', 0.8); paper(c, ball(m * 0.2, 0, m * 0.07, 3), '#fffaf0', 0.5); flat(c, poly([[m * 0.26, -m * 0.01], [m * 0.36, m * 0.02], [m * 0.26, m * 0.03]]), '#f2b83a'); dot(c, m * 0.22, -m * 0.01, m * 0.012, INK);
    c.restore();
  });
};
/* ดิน earth: a clod cut open to show its layers; a seed sprouts upward, roots go down, a worm wriggles */
P.din = function (c, x, y, s, t) {
  var k, g = 0.5 - 0.5 * Math.cos(t / 3600), surf = y - s * 0.1, sx = x - s * 0.28, sy = y + s * 0.3;
  var blk = [[-0.9, -0.1], [-0.5, -0.16], [0, -0.09], [0.5, -0.17], [0.9, -0.08], [0.82, 0.4], [0.9, 0.8], [0.3, 0.86], [-0.3, 0.82], [-0.85, 0.86], [-0.92, 0.4]].map(function (p) { return [x + p[0] * s, y + p[1] * s]; });
  paper(c, blob(blk), '#4a2e1a', 1.6);
  c.save(); blob(blk)(c); c.clip();
  function layer(yy, col, ph) { c.fillStyle = col; c.beginPath(); c.moveTo(x - s, y + s); c.lineTo(x - s, yy); for (var i = 0; i <= 12; i++) c.lineTo(x - s + i * s * 0.1667, yy + Math.sin(i * 1.3 + ph) * s * 0.03); c.lineTo(x + s, y + s); c.closePath(); c.fill(); }
  layer(y + s * 0.12, '#6a4426', 0); layer(y + s * 0.42, '#a8602a', 2); layer(y + s * 0.66, '#c8884a', 4);
  for (k = 0; k < 16; k++) { var px = x + (((k * 0.618) % 1) - 0.5) * s * 1.7, py = y + s * (-0.0 + ((k * 0.381) % 1) * 0.85); flat(c, ell(px, py, s * (0.025 + (k % 3) * 0.015), s * (0.02 + (k % 2) * 0.012), k), k % 3 ? '#b8b0a0' : '#8a8478'); }
  /* the worm, in its tunnel */
  var wx = x + s * 0.05 + Math.sin(t / 2600) * s * 0.12, wy = y + s * 0.56, wp = [];
  for (k = 0; k < 14; k++) wp.push([wx + k * s * 0.06, wy + Math.sin(k * 0.8 - t / 250) * s * 0.035]);
  line(c, wp, 'rgba(60,30,12,.7)', s * 0.12);
  for (k = 0; k < 14; k++) dot(c, wp[k][0], wp[k][1], s * (k > 11 ? 0.05 : 0.042), k % 2 ? '#d9707a' : '#e88a92');
  dot(c, wp[13][0] + s * 0.03, wp[13][1] - s * 0.02, s * 0.01, INK);
  /* the roots, going down from the seed */
  var rl = (0.12 + g * 0.5) * s;
  [[-0.35, 0.9], [0.1, 1.0], [0.45, 0.7]].forEach(function (r, i) { var pts = []; for (var j = 0; j <= 8; j++) { var v = j / 8; pts.push([sx + Math.sin(r[0]) * rl * r[1] * v + Math.sin(v * 7 + i) * s * 0.02, sy + Math.cos(r[0]) * rl * r[1] * v]); } line(c, pts, '#f0e6d0', s * 0.028); for (var j2 = 2; j2 < 8; j2 += 2) { var p = pts[j2]; line(c, [p, [p[0] + (j2 % 4 ? 1 : -1) * s * 0.06, p[1] + s * 0.03]], '#f0e6d0', s * 0.012); } });
  c.restore();
  /* the seed and the shoot */
  paper(c, ell(sx, sy, s * 0.07, s * 0.045, -0.3), '#c8913a', 0.6);
  var topY = surf - g * s * 0.55, sway = Math.sin(t / 900) * s * 0.015;
  line(c, [[sx, sy - s * 0.03], [sx - s * 0.02, (sy + surf) / 2], [sx, surf + s * 0.02]], '#e8e0b0', s * 0.035);
  line(c, [[sx, surf], [sx + sway * 0.5, (surf + topY) / 2], [sx + sway, topY]], '#5d9e4a', s * 0.04);
  var ll = (0.1 + g * 0.26) * s, la = 0.35 + (1 - g) * 0.8;
  paper(c, lf(sx + sway, topY, ll, s * 0.07 * (0.6 + g * 0.5), -PI / 2 - la), '#7fb84a', 0.8); paper(c, lf(sx + sway, topY, ll, s * 0.07 * (0.6 + g * 0.5), -PI / 2 + la), '#5d9e4a', 0.8);
  /* grass on the top edge */
  [-0.7, -0.45, 0.1, 0.35, 0.65].forEach(function (f, i) { var gx = x + f * s, sw = Math.sin(t / 700 + i * 2) * s * 0.02; flat(c, poly([[gx - s * 0.03, surf + s * 0.01 + (i % 2 ? 0 : 0)], [gx + sw, surf - s * 0.15], [gx + s * 0.03, surf + s * 0.01]]), '#3f8442'); flat(c, poly([[gx + s * 0.02, surf + s * 0.01], [gx + sw * 1.4 + s * 0.06, surf - s * 0.1], [gx + s * 0.07, surf + s * 0.01]]), '#5d9e4a'); });
};
/* วัด temple: a Lanna temple hall with its layered roofs and naga finials; the bell swings beside it */
function naga(c, px, py, dir, m, t, k) {
  var sw = Math.sin(t / 700 + k) * m * 0.03, pts = [[px, py], [px + dir * m * 0.05, py - m * 0.12], [px + dir * m * 0.0 + sw, py - m * 0.26], [px + dir * m * 0.1 + sw, py - m * 0.38], [px + dir * m * 0.2 + sw, py - m * 0.36]];
  var ct = []; for (var i = 0; i <= 8; i++) ct.push(bz(pts[0], pts[1], pts[3], pts[4], i / 8));
  paper(c, ribbon(ct, m * 0.06, m * 0.025), GOLD, 0.6);
  var h = ct[8]; paper(c, ell(h[0] + dir * m * 0.02, h[1], m * 0.05, m * 0.032, dir * -0.3), GOLD, 0.5); dot(c, h[0] + dir * m * 0.03, h[1] - m * 0.008, m * 0.01, RED);
  flat(c, poly([[h[0] - dir * m * 0.02, h[1] - m * 0.02], [h[0] - dir * m * 0.06, h[1] - m * 0.1], [h[0] + dir * m * 0.01, h[1] - m * 0.03]]), '#c8913a');
}
function tier(c, cx, base, hw, h, fl, col) {
  var cxl = cx - hw, cxr = cx + hw;
  function p(q) { q.beginPath(); q.moveTo(cxl, base); q.lineTo(cxr, base); q.quadraticCurveTo(cxr + fl * 0.4, base - fl * 0.1, cxr + fl, base - fl * 1.2); q.quadraticCurveTo(cxr - hw * 0.15, base - h * 0.5, cx + hw * 0.5, base - h); q.lineTo(cx - hw * 0.5, base - h); q.quadraticCurveTo(cxl + hw * 0.15, base - h * 0.5, cxl - fl, base - fl * 1.2); q.quadraticCurveTo(cxl - fl * 0.4, base - fl * 0.1, cxl, base); q.closePath(); }
  paper(c, p, col, 1.4);
  c.save(); p(c); c.clip(); c.strokeStyle = 'rgba(40,10,5,.4)'; c.lineWidth = Math.max(0.7, h * 0.04);
  for (var k = 1; k < 5; k++) { var ty = base - k * h / 5; c.beginPath(); for (var j = 0; j < 12; j++) c.lineTo(cxl - fl + j * (hw * 2 + fl * 2) / 11, ty + (j % 2 ? h * 0.05 : 0)); c.stroke(); }
  c.strokeStyle = '#2f6b3a'; c.lineWidth = Math.max(1, h * 0.12); c.beginPath(); c.moveTo(cxl - fl, base - fl * 1.2); c.quadraticCurveTo(cxl - fl * 0.4, base - fl * 0.1, cxl, base); c.lineTo(cxr, base); c.quadraticCurveTo(cxr + fl * 0.4, base - fl * 0.1, cxr + fl, base - fl * 1.2); c.stroke();
  c.restore();
  line(c, [[cxl - fl, base - fl * 1.2], [cxl - hw * 0.15 + 0, base - h * 0.5], [cx - hw * 0.5, base - h], [cx + hw * 0.5, base - h], [cxr - hw * 0.15 + 0, base - h * 0.5], [cxr + fl, base - fl * 1.2]], GOLD, Math.max(1, h * 0.07));
}
P.wat = function (c, x, y, s, t) {
  var gy = y + s * 0.92, hx = x - s * 0.15, k, a = 0.32 * Math.sin(t / 650);
  paper(c, rect(hx - s * 0.8, gy - s * 0.14, s * 1.6, s * 0.14), '#f2ece0', 1);
  paper(c, poly([[hx - s * 0.18, gy], [hx + s * 0.18, gy], [hx + s * 0.14, gy - s * 0.14], [hx - s * 0.14, gy - s * 0.14]]), '#d8d0bc', 0.6);
  paper(c, rect(hx - s * 0.56, gy - s * 0.66, s * 1.12, s * 0.52), '#f8f0dc', 1);
  [-0.56, -0.2, 0.2, 0.56].forEach(function (f) { paper(c, rect(hx + s * f - s * 0.04, gy - s * 0.66, s * 0.08, s * 0.52), RED, 0.5); });
  paper(c, function (q) { q.beginPath(); q.moveTo(hx - s * 0.12, gy - s * 0.14); q.lineTo(hx - s * 0.12, gy - s * 0.4); q.quadraticCurveTo(hx - s * 0.12, gy - s * 0.52, hx, gy - s * 0.54); q.quadraticCurveTo(hx + s * 0.12, gy - s * 0.52, hx + s * 0.12, gy - s * 0.4); q.lineTo(hx + s * 0.12, gy - s * 0.14); q.closePath(); }, GOLD, 0.7);
  paper(c, function (q) { q.beginPath(); q.moveTo(hx - s * 0.08, gy - s * 0.14); q.lineTo(hx - s * 0.08, gy - s * 0.4); q.quadraticCurveTo(hx - s * 0.08, gy - s * 0.48, hx, gy - s * 0.5); q.quadraticCurveTo(hx + s * 0.08, gy - s * 0.48, hx + s * 0.08, gy - s * 0.4); q.lineTo(hx + s * 0.08, gy - s * 0.14); q.closePath(); }, '#5a1410', 0.3);
  [-0.38, 0.38].forEach(function (f) { paper(c, rect(hx + s * f - s * 0.07, gy - s * 0.5, s * 0.14, s * 0.2), GOLD, 0.5); flat(c, rect(hx + s * f - s * 0.05, gy - s * 0.48, s * 0.1, s * 0.16), '#3a1410'); });
  var T = [[0.7, gy - s * 0.6, s * 0.26, '#a8432f'], [0.52, gy - s * 0.94, s * 0.24, '#b8503a'], [0.34, gy - s * 1.24, s * 0.22, '#a8432f']];
  paper(c, rect(hx - s * 0.46, gy - s * 0.96, s * 0.92, s * 0.34), '#e8b84a', 0.8);
  paper(c, rect(hx - s * 0.3, gy - s * 1.26, s * 0.6, s * 0.32), '#d9a640', 0.8);
  flat(c, ell(hx, gy - s * 0.8, s * 0.1, s * 0.1), RED); for (k = 0; k < 8; k++) line(c, [[hx + Math.cos(k * 0.785) * s * 0.1, gy - s * 0.8 + Math.sin(k * 0.785) * s * 0.1], [hx + Math.cos(k * 0.785) * s * 0.15, gy - s * 0.8 + Math.sin(k * 0.785) * s * 0.15]], RED, s * 0.012);
  T.forEach(function (r) { tier(c, hx, r[1], s * r[0], r[2], s * 0.1, r[3]); });
  T.forEach(function (r, i) { var tl = [hx - s * r[0] - s * 0.1, r[1] - s * 0.12], tr = [hx + s * r[0] + s * 0.1, r[1] - s * 0.12]; naga(c, tl[0], tl[1], -1, s * (0.7 - i * 0.08), t, i); naga(c, tr[0], tr[1], 1, s * (0.7 - i * 0.08), t, i + 3); });
  var ty = gy - s * 1.24 - s * 0.22;
  paper(c, poly([[hx - s * 0.04, ty], [hx, ty - s * 0.3], [hx + s * 0.04, ty]]), GOLD, 0.7); [0.08, 0.15, 0.22].forEach(function (f) { line(c, [[hx - s * 0.035 * (1 - f * 2), ty - s * f], [hx + s * 0.035 * (1 - f * 2), ty - s * f]], '#c8913a', s * 0.015); });
  /* the bell on its frame */
  var bx = x + s * 0.82, by = gy - s * 0.72;
  paper(c, rect(bx - s * 0.13, by - s * 0.06, s * 0.26, s * 0.05), DTEAK, 0.8);
  [-0.12, 0.12].forEach(function (f) { paper(c, rect(bx + s * f - s * 0.025, by - s * 0.06, s * 0.05, gy - by + s * 0.06), DTEAK, 0.7); });
  c.save(); c.translate(bx, by - s * 0.01); c.rotate(a);
  line(c, [[0, 0], [0, s * 0.06]], '#3a2a1a', s * 0.02);
  paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.03, s * 0.06); q.quadraticCurveTo(-s * 0.06, s * 0.1, -s * 0.09, s * 0.32); q.lineTo(-s * 0.13, s * 0.38); q.lineTo(s * 0.13, s * 0.38); q.lineTo(s * 0.09, s * 0.32); q.quadraticCurveTo(s * 0.06, s * 0.1, s * 0.03, s * 0.06); q.closePath(); }, '#c8913a', 1.1);
  line(c, [[-s * 0.1, s * 0.22], [s * 0.1, s * 0.22]], 'rgba(90,50,10,.5)', s * 0.012); dot(c, 0, s * 0.37, s * 0.025, '#5a3a1a');
  c.restore();
  if (Math.abs(Math.sin(t / 650)) > 0.96) { c.save(); c.strokeStyle = 'rgba(232,184,74,.7)'; c.lineWidth = Math.max(1, s * 0.02); c.beginPath(); c.arc(bx, by + s * 0.22, s * 0.22, 0.2, 1.0); c.stroke(); c.beginPath(); c.arc(bx, by + s * 0.22, s * 0.22, PI - 1.0, PI - 0.2); c.stroke(); c.restore(); }
};
/* ใบ leaf: a bodhi leaf lets go of its branch and falls, rocking from side to side */
function bodhi(c, cx, cy, L, ang, col, lift) {
  c.save(); c.translate(cx, cy); c.rotate(ang);
  paper(c, function (q) { q.beginPath(); q.moveTo(0, 0.5 * L); q.bezierCurveTo(-0.14 * L, 0.55 * L, -0.45 * L, 0.4 * L, -0.42 * L, 0.08 * L); q.bezierCurveTo(-0.4 * L, -0.18 * L, -0.14 * L, -0.2 * L, -0.06 * L, -0.36 * L); q.bezierCurveTo(-0.03 * L, -0.43 * L, -0.01 * L, -0.47 * L, 0, -0.5 * L); q.bezierCurveTo(0.01 * L, -0.47 * L, 0.03 * L, -0.43 * L, 0.06 * L, -0.36 * L); q.bezierCurveTo(0.14 * L, -0.2 * L, 0.4 * L, -0.18 * L, 0.42 * L, 0.08 * L); q.bezierCurveTo(0.45 * L, 0.4 * L, 0.14 * L, 0.55 * L, 0, 0.5 * L); q.closePath(); }, col, lift || 1);
  line(c, [[0, 0.62 * L], [0, 0.5 * L], [0, -0.44 * L]], 'rgba(235,245,200,.7)', Math.max(0.8, L * 0.028));
  for (var i = 0; i < 6; i++) { var v = 0.4 - i * 0.15, w = 0.36 - i * 0.04; line(c, [[0, v * L], [-w * L, (v - 0.12) * L]], 'rgba(235,245,200,.4)', Math.max(0.6, L * 0.016)); line(c, [[0, v * L], [w * L, (v - 0.12) * L]], 'rgba(235,245,200,.4)', Math.max(0.6, L * 0.016)); }
  c.restore();
}
P.bai = function (c, x, y, s, t) {
  var u = fr(t / 5400), k, gy = y + s * 0.85;
  paper(c, ell(x, gy + s * 0.03, s * 0.9, s * 0.1), '#8a6a3a', 0.4);
  bodhi(c, x + s * 0.55, gy - s * 0.02, s * 0.3, 1.9, '#c8a03a', 0.3); bodhi(c, x - s * 0.5, gy - s * 0.0, s * 0.26, -0.7, '#b8602a', 0.3);
  var br = [[x - s * 1.0, y - s * 0.55], [x - s * 0.55, y - s * 0.7], [x - s * 0.1, y - s * 0.78], [x + s * 0.35, y - s * 0.95], [x + s * 0.9, y - s * 0.9]];
  paper(c, ribbon(br, s * 0.07, s * 0.03), DTEAK, 0.9);
  [[-0.7, -0.66, 0.4, 0.9], [-0.35, -0.74, 0.5, -0.4], [0.5, -0.94, 0.45, 0.2], [0.78, -0.92, 0.38, -0.6]].forEach(function (b, i) { var sw = Math.sin(t / 900 + i) * 0.08; line(c, [[x + b[0] * s, y + b[1] * s], [x + b[0] * s + Math.sin(b[3] + sw) * s * 0.07, y + b[1] * s + s * 0.1]], '#4a6a2a', s * 0.015); bodhi(c, x + b[0] * s + Math.sin(b[3] + sw) * s * 0.1, y + b[1] * s + b[2] * s * 0.36 + s * 0.1, b[2] * s * 0.7, b[3] + sw, i % 2 ? '#4d9e52' : '#5d9e4a', 0.9); });
  /* the falling leaf */
  var w = u * TAU * 1.5, px = x - s * 0.1 + Math.sin(w) * s * 0.36 + u * s * 0.35, py = y - s * 0.55 + u * s * 1.35, ang = Math.cos(w) * 0.95 + 0.2, al = Math.min(1, u * 10, (1 - u) * 10 + 0.0);
  c.save(); c.globalAlpha = al; bodhi(c, px, py, s * 0.62, ang, '#6aa84a', 1.8); c.restore();
  if (u > 0.9) { c.save(); c.globalAlpha = (u - 0.9) * 10; flat(c, ell(px, gy, s * 0.2, s * 0.03), 'rgba(60,35,15,.3)'); c.restore(); }
};
/* หู ear: a large ear, and rings of sound arriving at it */
P.hu = function (c, x, y, s, t) {
  var k, ex = x - s * 0.05, ey = y + s * 0.05;
  for (k = 0; k < 4; k++) { var u = fr(t / 1800 + k / 4), r = u * s * 1.0 + s * 0.05; c.save(); c.globalAlpha = Math.sin(u * PI) * 0.9; c.strokeStyle = k % 2 ? ORANGE : GOLD; c.lineWidth = Math.max(1, s * 0.05 * (1 - u * 0.4)); c.lineCap = 'round'; c.beginPath(); c.arc(x - s * 1.1, ey, r, -0.6, 0.6); c.stroke(); c.restore(); }
  for (k = 0; k < 2; k++) { var nx = x - s * 0.75 + k * s * 0.3, ny = y - s * 0.55 + Math.sin(t / 500 + k * 2) * s * 0.06 - k * s * 0.15; flat(c, ell(nx, ny, s * 0.05, s * 0.036, -0.4), '#7a1f1a'); line(c, [[nx + s * 0.04, ny - s * 0.01], [nx + s * 0.04, ny - s * 0.22]], '#7a1f1a', s * 0.016); line(c, [[nx + s * 0.04, ny - s * 0.22], [nx + s * 0.1, ny - s * 0.14]], '#7a1f1a', s * 0.02); }
  paper(c, ball(ex + s * 0.3, ey - s * 0.08, s * 0.7, 8), '#1b1410', 1);
  paper(c, ball(ex + s * 0.28, ey + s * 0.22, s * 0.62, 8), '#e0a97c', 1.2);
  var E = function (a, b) { return [ex + a * s, ey + b * s]; };
  var earP = blob([[-0.12, -0.36], [0.05, -0.5], [0.26, -0.44], [0.36, -0.2], [0.35, 0.1], [0.24, 0.34], [0.1, 0.52], [-0.04, 0.54], [-0.14, 0.4], [-0.2, 0.12], [-0.22, -0.14]].map(function (p) { return E(p[0], p[1]); }));
  paper(c, earP, '#efc39c', 1.6); c.save(); c.strokeStyle = '#a8663c'; c.lineWidth = Math.max(1, s * 0.022); earP(c); c.stroke(); c.restore();
  c.save(); c.strokeStyle = '#b87a52'; c.lineWidth = Math.max(1, s * 0.035); c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - s * 0.08, ey - s * 0.3); c.bezierCurveTo(ex + s * 0.1, ey - s * 0.44, ex + s * 0.26, ey - s * 0.36, ex + s * 0.28, ey - s * 0.12); c.bezierCurveTo(ex + s * 0.29, ey + s * 0.14, ex + s * 0.2, ey + s * 0.3, ex + s * 0.1, ey + s * 0.4); c.stroke(); c.restore();
  flat(c, ell(ex + s * 0.03, ey + s * 0.02, s * 0.1, s * 0.17, -0.1), '#9a5a38');
  c.save(); c.strokeStyle = '#b87a52'; c.lineWidth = Math.max(0.8, s * 0.025); c.beginPath(); c.moveTo(ex + s * 0.16, ey - s * 0.26); c.bezierCurveTo(ex + s * 0.06, ey - s * 0.12, ex + s * 0.1, ey + s * 0.0, ex + s * 0.02, ey + s * 0.16); c.stroke(); c.beginPath(); c.moveTo(ex + s * 0.1, ey - s * 0.12); c.quadraticCurveTo(ex - s * 0.04, ey - s * 0.2, ex - s * 0.08, ey - s * 0.1); c.stroke(); c.restore();
  paper(c, ell(ex - s * 0.17, ey + s * 0.02, s * 0.045, s * 0.07, 0.2), '#d9a27a', 0.6);
  var sw = Math.sin(t / 450) * s * 0.02;
  line(c, [[ex + s * 0.02, ey + s * 0.5], [ex + s * 0.02 + sw, ey + s * 0.6]], GOLD, s * 0.02);
  c.save(); c.strokeStyle = GOLD; c.lineWidth = Math.max(1, s * 0.03); c.beginPath(); c.arc(ex + s * 0.02 + sw, ey + s * 0.68, s * 0.08, 0, TAU); c.stroke(); c.restore(); dot(c, ex + s * 0.02 + sw, ey + s * 0.76, s * 0.03, CRIM);
};
/* รถ vehicle: a red songthaew drives along, wheels turning, the benches full */
P.rot = function (c, x, y, s, t) {
  var gy = y + s * 0.68, k, bob = Math.sin(t / 95) * s * 0.008, wr = s * 0.2, RD = '#c0392b';
  function wheel(wx) { dot(c, wx, gy - wr, wr, '#25252b'); dot(c, wx, gy - wr, wr * 0.62, '#b8c0c8'); dot(c, wx, gy - wr, wr * 0.4, '#8d98a3'); c.save(); c.translate(wx, gy - wr); c.rotate(t / 70); for (var i = 0; i < 5; i++) { c.rotate(TAU / 5); dot(c, wr * 0.5, 0, wr * 0.06, '#25252b'); } c.restore(); dot(c, wx, gy - wr, wr * 0.1, '#3a3a42'); }
  paper(c, rect(x - s * 1.0, gy, s * 2.0, s * 0.2), '#7a6a58', 0.5);
  for (k = 0; k < 5; k++) { var dx = x - s * 1.1 + fr(t / 900 + k * 0.2) * s * 2.2; flat(c, rect(dx, gy + s * 0.08, s * 0.22, s * 0.035), '#f2e6c9'); }
  flat(c, ell(x, gy + s * 0.01, s * 0.95, s * 0.05), 'rgba(0,0,0,.25)');
  /* exhaust puffs, going back */
  for (k = 0; k < 4; k++) { var u = fr(t / 800 + k / 4); c.fillStyle = 'rgba(200,200,205,' + (0.5 * (1 - u)).toFixed(2) + ')'; c.beginPath(); c.arc(x - s * 1.0 - u * s * 0.3, gy - s * 0.15 - u * s * 0.08, s * (0.03 + u * 0.06), 0, TAU); c.fill(); }
  wheel(x - s * 0.52); 
  c.save(); c.translate(0, bob);
  paper(c, rect(x - s * 0.92, gy - s * 1.04, s * 1.04, s * 0.42), '#3a1f18', 0.4);
  [[-0.72, '#e8892a', '#7a4a2a'], [-0.4, '#2f8f5b', '#1b1410'], [-0.08, '#f2e6c9', '#5a3a1a']].forEach(function (p, i) { var hx = x + p[0] * s, hb = Math.sin(t / 95 + i * 2) * s * 0.012; dot(c, hx, gy - s * 0.84 + hb, s * 0.07, '#c98b62'); paper(c, ell(hx, gy - s * 0.84 + hb, s * 0.07, s * 0.075), '#c98b62', 0.2); flat(c, ell(hx, gy - s * 0.88 + hb, s * 0.075, s * 0.04), p[2]); flat(c, poly([[hx - s * 0.1, gy - s * 0.62], [hx - s * 0.08, gy - s * 0.77 + hb], [hx + s * 0.08, gy - s * 0.77 + hb], [hx + s * 0.1, gy - s * 0.62]]), p[1]); });
  paper(c, poly([[x - s * 0.96, gy - s * 0.3], [x - s * 0.96, gy - s * 0.64], [x + s * 0.5, gy - s * 0.64], [x + s * 0.58, gy - s * 0.7], [x + s * 0.98, gy - s * 0.66], [x + s * 1.0, gy - s * 0.5], [x + s * 0.98, gy - s * 0.3]]), RD, 1.2);
  flat(c, rect(x - s * 0.96, gy - s * 0.5, s * 1.96, s * 0.045), '#fbf3df');
  paper(c, poly([[x + s * 0.1, gy - s * 0.64], [x + s * 0.1, gy - s * 1.08], [x + s * 0.4, gy - s * 1.08], [x + s * 0.58, gy - s * 0.7]]), RD, 0.8);
  flat(c, poly([[x + s * 0.17, gy - s * 0.72], [x + s * 0.17, gy - s * 1.0], [x + s * 0.37, gy - s * 1.0], [x + s * 0.5, gy - s * 0.72]]), '#bfe0ec');
  flat(c, poly([[x + s * 0.2, gy - s * 0.96], [x + s * 0.3, gy - s * 0.96], [x + s * 0.22, gy - s * 0.76]]), 'rgba(255,255,255,.5)');
  paper(c, poly([[x - s * 1.0, gy - s * 1.04], [x + s * 0.44, gy - s * 1.1], [x + s * 0.44, gy - s * 1.02], [x - s * 1.0, gy - s * 0.97]]), RD, 1.2);
  flat(c, poly([[x - s * 1.0, gy - s * 1.04], [x + s * 0.44, gy - s * 1.1], [x + s * 0.44, gy - s * 1.07], [x - s * 1.0, gy - s * 1.01]]), '#fbf3df');
  [-0.92, -0.45, 0.06].forEach(function (f) { paper(c, rect(x + f * s - s * 0.02, gy - s * 1.0, s * 0.04, s * 0.38), '#b8c0c8', 0.4); });
  paper(c, rect(x + s * 0.94, gy - s * 0.46, s * 0.1, s * 0.12), '#b8c0c8', 0.6); paper(c, rect(x - s * 1.02, gy - s * 0.42, s * 0.08, s * 0.1), '#b8c0c8', 0.5);
  dot(c, x + s * 0.94, gy - s * 0.58, s * 0.05, '#ffe27a');
  c.restore();
  c.save(); c.globalAlpha = 0.25 + 0.1 * Math.sin(t / 200); c.fillStyle = '#ffe27a'; c.beginPath(); c.moveTo(x + s * 0.98, gy - s * 0.6); c.lineTo(x + s * 1.3, gy - s * 0.75); c.lineTo(x + s * 1.3, gy - s * 0.35); c.closePath(); c.fill(); c.restore();
  wheel(x + s * 0.5);
  paper(c, ell(x + s * 0.5, gy - wr * 1.0, wr * 1.15, wr * 0.6), 'rgba(40,30,30,0)', 0.0);
};
/* นก bird: a red-whiskered bulbul on a branch flicks its tail, then hops along */
P.nok = function (c, x, y, s, t) {
  var T = 5200, ph = fr(t / T), k, hopR = sm((ph - 0.42) / 0.12), hopL = sm((ph - 0.9) / 0.1), pos = -0.28 + 0.56 * hopR - 0.56 * hopL;
  var hop = Math.sin(clamp((ph - 0.42) / 0.12, 0, 1) * PI) * s * 0.2 + Math.sin(clamp((ph - 0.9) / 0.1, 0, 1) * PI) * s * 0.2;
  var flick = (ph < 0.4 || (ph > 0.58 && ph < 0.88)) ? 1 : 0.15, tl = Math.sin(t / 85) * 0.38 * flick;
  function br(u) { return [x - s * 1.0 + u * s * 2.0, y + s * 0.5 + Math.sin(u * 3.2 + 0.4) * s * 0.07 - u * s * 0.08]; }
  var pts = []; for (k = 0; k <= 12; k++) pts.push(br(k / 12));
  paper(c, ribbon(pts, s * 0.1, s * 0.05), DTEAK, 1);
  [[0.1, -1], [0.3, 1], [0.62, -1], [0.85, 1], [0.95, -1]].forEach(function (b, i) { var p = br(b[0]); paper(c, lf(p[0], p[1], s * 0.3, s * 0.07, -PI / 2 + b[1] * (0.7 + 0.1 * Math.sin(t / 900 + i)) + (b[1] > 0 ? 0 : 0)), i % 2 ? '#3f8442' : '#5d9e4a', 0.8); });
  [[0.22, 1], [0.7, -1], [0.78, 1]].forEach(function (b) { var p = br(b[0]); line(c, [[p[0], p[1]], [p[0] + b[1] * s * 0.04, p[1] + s * 0.1]], '#4a6a2a', s * 0.012); dot(c, p[0] + b[1] * s * 0.04, p[1] + s * 0.12, s * 0.035, '#d9342b'); });
  var bp = br((pos + 1) / 2 * 0.9 + 0.05), bx = bp[0], by = bp[1] - s * 0.03 - hop;
  c.save(); c.translate(bx, by); c.rotate(-0.05 + hop / s * -0.3); c.scale(1.35, 1.35);
  [-0.05, 0.1].forEach(function (f) { line(c, [[f * s, -s * 0.12], [f * s, s * 0.02]], '#3a2a2a', s * 0.02); });
  /* the tail, hinged at the rump */
  c.save(); c.translate(-s * 0.26, -s * 0.28); c.rotate(0.5 + tl);
  paper(c, ribbon([[0, 0], [-s * 0.3, s * 0.0], [-s * 0.6, s * 0.01]], s * 0.14, s * 0.1), '#6a4a2e', 0.9);
  flat(c, poly([[-s * 0.55, -s * 0.05], [-s * 0.66, -s * 0.04], [-s * 0.66, s * 0.06], [-s * 0.55, s * 0.07]]), '#fbf3df');
  c.restore();
  paper(c, ell(-s * 0.2, -s * 0.2, s * 0.05, s * 0.04), CRIM, 0.3);
  paper(c, ell(0, -s * 0.34, s * 0.34, s * 0.2, -0.45), '#7a5a3a', 1.2);
  paper(c, ell(s * 0.06, -s * 0.28, s * 0.2, s * 0.14, -0.4), '#fbf3df', 0.5);
  paper(c, ell(-s * 0.1, -s * 0.38, s * 0.2, s * 0.1, -0.3), '#5a3e26', 0.7);
  line(c, [[-s * 0.26, -s * 0.34], [-s * 0.06, -s * 0.4]], '#9a7a56', s * 0.012);
  paper(c, ball(s * 0.2, -s * 0.58, s * 0.14, 3), '#1b1410', 1);
  paper(c, poly([[s * 0.12, -s * 0.66], [-s * 0.02, -s * 0.84], [s * 0.04, -s * 0.66]]), '#1b1410', 0.5); paper(c, poly([[s * 0.16, -s * 0.68], [s * 0.1, -s * 0.9], [s * 0.2, -s * 0.7]]), '#1b1410', 0.4);
  flat(c, ell(s * 0.22, -s * 0.5, s * 0.07, s * 0.045), '#fbf3df'); flat(c, ell(s * 0.14, -s * 0.54, s * 0.025, s * 0.04), CRIM);
  eye(c, s * 0.23, -s * 0.6, s * 0.032);
  flat(c, poly([[s * 0.31, -s * 0.6], [s * 0.4, -s * 0.57], [s * 0.31, -s * 0.54]]), '#1b1410');
  c.restore();
};
/* ชา tea: Thai tea pulled from high into a glass over ice; the stream arcs */
P.cha = function (c, x, y, s, t) {
  var gx = x + s * 0.3, top = y - s * 0.02, bot = y + s * 0.88, k, lvl = top + s * 0.14 + Math.sin(t / 380) * s * 0.012;
  var glass = function (q) { q.beginPath(); q.moveTo(gx - s * 0.33, top); q.lineTo(gx + s * 0.33, top); q.lineTo(gx + s * 0.25, bot); q.lineTo(gx - s * 0.25, bot); q.closePath(); };
  paper(c, ell(gx, bot + s * 0.01, s * 0.34, s * 0.05), 'rgba(60,35,15,.3)', 0.1);
  paper(c, function (q) { q.beginPath(); q.moveTo(gx - s * 0.33 + (lvl - top) * 0.09, lvl); q.lineTo(gx + s * 0.33 - (lvl - top) * 0.09, lvl); q.lineTo(gx + s * 0.25, bot); q.lineTo(gx - s * 0.25, bot); q.closePath(); }, '#e8782a', 1);
  c.save(); glass(c); c.clip();
  flat(c, rect(gx - s * 0.4, lvl, s * 0.8, s * 0.2), '#f0a050'); flat(c, rect(gx - s * 0.4, lvl + s * 0.2, s * 0.8, s * 0.5), '#d9641e'); flat(c, rect(gx - s * 0.4, lvl + s * 0.5, s * 0.8, s * 0.5), '#b8501a');
  c.strokeStyle = '#fbe0b0'; c.lineWidth = Math.max(1, s * 0.03); c.beginPath(); for (k = 0; k <= 10; k++) c.lineTo(gx - s * 0.28 + k * s * 0.056, lvl + s * 0.04 + Math.sin(k * 1.2 + t / 300) * s * 0.02); c.stroke();
  [[-0.12, 0.2], [0.12, 0.32], [-0.04, 0.5], [0.1, 0.62], [-0.14, 0.72]].forEach(function (b, i) { var bx = gx + b[0] * s + Math.sin(t / 700 + i) * s * 0.01, by2 = lvl + b[1] * s + Math.sin(t / 600 + i * 2) * s * 0.012, sz = s * (0.09 - (i % 2) * 0.01); c.save(); c.translate(bx, by2); c.rotate(i * 0.5); flat(c, rect(-sz, -sz, sz * 2, sz * 2), 'rgba(255,245,235,.4)'); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = Math.max(0.7, s * 0.012); c.strokeRect(-sz, -sz, sz * 2, sz * 2); c.restore(); });
  flat(c, poly([[gx - s * 0.28, top + s * 0.05], [gx - s * 0.2, top + s * 0.05], [gx - s * 0.15, bot - s * 0.05], [gx - s * 0.2, bot - s * 0.05]]), 'rgba(255,255,255,.28)');
  c.restore();
  c.save(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = Math.max(0.8, s * 0.018); glass(c); c.stroke(); c.restore();
  flat(c, ell(gx, top, s * 0.33, s * 0.04), 'rgba(255,255,255,.2)');
  for (k = 0; k < 5; k++) dot(c, gx + (k - 2) * s * 0.1, top + s * 0.4 + ((k * 0.37) % 1) * s * 0.3, s * 0.012, 'rgba(255,255,255,.7)');
  /* the straw */
  paper(c, ribbon([[gx + s * 0.1, bot - s * 0.2], [gx + s * 0.34, top - s * 0.2]], s * 0.05, s * 0.05), '#fbf3df', 0.5);
  for (k = 0; k < 6; k++) { var f = k / 6; flat(c, ribbon([[lerp(gx + s * 0.12, gx + s * 0.34, f * 0.9 + 0.05), lerp(bot - s * 0.2, top - s * 0.2, f * 0.9 + 0.05)], [lerp(gx + s * 0.12, gx + s * 0.34, f * 0.9 + 0.12), lerp(bot - s * 0.2, top - s * 0.2, f * 0.9 + 0.12)]], s * 0.05, s * 0.05), k % 2 ? '#fbf3df' : CRIM); }
  /* the stream from the steel pitcher, high up */
  var P0 = [x - s * 0.22, y - s * 0.66], P1 = [x + s * 0.12, y - s * 0.86], P2 = [x + s * 0.34, y - s * 0.46], P3 = [gx - s * 0.02, lvl + s * 0.0], sp = [];
  for (k = 0; k <= 16; k++) { var q = bz(P0, P1, P2, P3, k / 16); sp.push([q[0] + Math.sin(k * 0.9 - t / 90) * s * 0.01, q[1]]); }
  paper(c, ribbon(sp, s * 0.07, s * 0.05), '#e8782a', 0.4);
  line(c, sp.slice(1, 14).map(function (p) { return [p[0] - s * 0.012, p[1]]; }), 'rgba(255,225,170,.8)', s * 0.012);
  var tilt = 0.55 + 0.08 * Math.sin(t / 700);
  c.save(); c.translate(x - s * 0.52, y - s * 0.78); c.rotate(tilt);
  paper(c, poly([[-s * 0.2, -s * 0.2], [s * 0.2, -s * 0.2], [s * 0.26, s * 0.3], [-s * 0.26, s * 0.3]]), SILVER, 1.2);
  paper(c, poly([[s * 0.2, -s * 0.2], [s * 0.34, -s * 0.28], [s * 0.2, -s * 0.12]]), SILVER, 0.6);
  line(c, [[-s * 0.2, -s * 0.2], [s * 0.2, -s * 0.2]], '#8d98a3', s * 0.03); line(c, [[-s * 0.12, -s * 0.12], [-s * 0.16, s * 0.26]], 'rgba(255,255,255,.7)', s * 0.04);
  c.strokeStyle = '#8d98a3'; c.lineWidth = Math.max(1.5, s * 0.05); c.beginPath(); c.arc(-s * 0.3, s * 0.05, s * 0.14, -1.2, 1.2); c.stroke();
  c.restore();
  for (k = 0; k < 3; k++) { var u = fr(t / 600 + k / 3); dot(c, gx + (k - 1) * s * 0.1 * Math.sin(u * PI), lvl - Math.sin(u * PI) * s * 0.12, s * 0.018, '#f0a050'); }
};
/* แกง curry: a clay pot of curry bubbles; steam rises, chilies lie beside it, the coconut-shell ladle in the pot */
P.kaeng = function (c, x, y, s, t) {
  var px = x + s * 0.02, py = y + s * 0.38, k, gy = y + s * 0.9;
  paper(c, ell(x, gy, s * 0.98, s * 0.1), '#c8a060', 0.8); flat(c, ell(x, gy, s * 0.8, s * 0.06), '#a8803a');
  for (k = 0; k < 3; k++) { var u = fr(t / 2800 + k / 3); c.save(); c.globalAlpha = Math.sin(u * PI) * 0.55; c.strokeStyle = '#fff'; c.lineWidth = s * 0.07; c.lineCap = 'round'; c.beginPath(); for (var j = 0; j <= 10; j++) { var v = j / 10; c.lineTo(px + (k - 1) * s * 0.26 + Math.sin(v * 5 + t / 500 + k * 2) * s * 0.07, y - s * 0.12 - u * s * 0.4 - v * s * 0.28); } c.stroke(); c.restore(); }
  /* the ladle */
  var la = Math.sin(t / 900) * 0.04;
  paper(c, ribbon([[px + s * 0.15, py - s * 0.08], [px + s * 0.6, y - s * 0.55 + la * s]], s * 0.05, s * 0.04), '#8a5a32', 0.8);
  paper(c, function (q) { q.beginPath(); q.ellipse(px + s * 0.66, y - s * 0.62 + la * s, s * 0.1, s * 0.1, 0.6, 0, PI); q.closePath(); }, '#4a2e18', 0.8);
  paper(c, function (q) { q.beginPath(); q.moveTo(px - s * 0.58, py - s * 0.22); q.bezierCurveTo(px - s * 0.7, py + s * 0.3, px - s * 0.4, py + s * 0.5, px, py + s * 0.5); q.bezierCurveTo(px + s * 0.4, py + s * 0.5, px + s * 0.7, py + s * 0.3, px + s * 0.58, py - s * 0.22); q.closePath(); }, '#b8501e', 1.4);
  line(c, [[px - s * 0.5, py - s * 0.05], [px - s * 0.5, py + s * 0.2]], 'rgba(255,220,170,.35)', s * 0.05);
  c.save(); c.strokeStyle = '#7a2a10'; c.lineWidth = Math.max(0.8, s * 0.02); c.beginPath(); c.moveTo(px - s * 0.66, py + s * 0.05); c.quadraticCurveTo(px, py + s * 0.24, px + s * 0.66, py + s * 0.05); c.stroke(); c.restore();
  [-1, 1].forEach(function (sd) { paper(c, ell(px + sd * s * 0.58, py - s * 0.14, s * 0.1, s * 0.06, sd * 0.4), '#a34a1c', 0.6); });
  paper(c, ell(px, py - s * 0.2, s * 0.58, s * 0.14), '#8a3a14', 0.9);
  flat(c, ell(px, py - s * 0.19, s * 0.5, s * 0.1), '#e8852a');
  c.save(); c.strokeStyle = '#fbe0b0'; c.lineWidth = Math.max(1, s * 0.03); c.lineCap = 'round'; c.beginPath(); c.ellipse(px - s * 0.05, py - s * 0.19, s * 0.2, s * 0.045, 0.1, 0.3, 4.5 + Math.sin(t / 500) * 0.3); c.stroke(); c.restore();
  flat(c, lf(px + s * 0.16, py - s * 0.2 + Math.sin(t / 600) * s * 0.01, s * 0.14, s * 0.04, -0.3 + Math.sin(t / 700) * 0.2), '#3f8442');
  flat(c, lf(px - s * 0.3, py - s * 0.17, s * 0.1, s * 0.03, 2.5), '#5d9e4a');
  dot(c, px - s * 0.18, py - s * 0.22, s * 0.025, '#d9342b'); dot(c, px + s * 0.33, py - s * 0.17, s * 0.022, '#d9342b');
  [[-0.3, 0.0], [0.25, 0.04], [0.02, -0.05], [-0.08, 0.06], [0.38, -0.02], [-0.38, -0.04]].forEach(function (b, i) { var u2 = fr(t / 1100 + i * 0.19), r = s * 0.05 * Math.min(1, u2 * 1.3); if (u2 > 0.88) { c.save(); c.strokeStyle = 'rgba(255,235,200,' + (1 - (u2 - 0.88) / 0.12).toFixed(2) + ')'; c.lineWidth = Math.max(0.8, s * 0.014); c.beginPath(); c.ellipse(px + b[0] * s, py - s * 0.19 + b[1] * s, s * (0.05 + (u2 - 0.88) * 0.4), s * (0.03 + (u2 - 0.88) * 0.2), 0, 0, TAU); c.stroke(); c.restore(); } else { flat(c, ell(px + b[0] * s, py - s * 0.19 + b[1] * s, r, r * 0.7), 'rgba(255,225,170,.8)'); } });
  /* the chilies */
  [[-0.88, 0.0, 0.5, CRIM], [-0.72, 0.06, 0.8, '#c0392b'], [-0.82, 0.12, 0.2, '#3f8f4a']].forEach(function (cc) { var cx2 = x + cc[0] * s, cy2 = gy - s * 0.04 + cc[1] * s * 0.5, pts = []; for (var j = 0; j <= 8; j++) { var v = j / 8; pts.push([cx2 + v * s * 0.32 * Math.cos(cc[2]) - Math.sin(v * 3) * s * 0.0, cy2 - v * s * 0.32 * Math.sin(cc[2]) + Math.sin(v * 2.6) * s * 0.06]); } paper(c, ribbon(pts, s * 0.075, s * 0.012), cc[3], 0.6); paper(c, ell(cx2, cy2, s * 0.035, s * 0.03), '#3f8442', 0.4); line(c, [[cx2, cy2], [cx2 - s * 0.05, cy2 - s * 0.07]], '#3f8442', s * 0.02); });
};
/* ขา leg: two legs in a sarong walking, the feet in sandals, a bag swinging */
P['kha-3'] = function (c, x, y, s, t) {
  var p = t / 380, sw = Math.sin(p), L = s * 0.5, gy = y + s * 0.86, hx = x - s * 0.05, k;
  var a1 = sw * 0.55, k1 = -0.5 * (0.4 + 0.6 * Math.max(0, -Math.cos(p))), a2 = -sw * 0.55, k2 = -0.5 * (0.4 + 0.6 * Math.max(0, Math.cos(p)));
  function leg(a, kn) { var kx = Math.sin(a) * L, ky = Math.cos(a) * L; return [[0, 0], [kx, ky], [kx + Math.sin(a + kn) * L, ky + Math.cos(a + kn) * L]]; }
  var l1 = leg(a1, k1), l2 = leg(a2, k2), low = Math.max(l1[2][1], l2[2][1]), hy = gy - low;
  function A(l, i) { return [hx + l[i][0], hy + l[i][1]]; }
  flat(c, ell(hx, gy + s * 0.01, s * 0.55, s * 0.05), 'rgba(60,35,15,.28)');
  [[l2, '#a8704a'], [l1, '#c98b62']].forEach(function (L2, i) {
    var f = A(L2[0], 2), kn = A(L2[0], 1);
    line(c, [A(L2[0], 0), kn, f], L2[1], s * 0.11);
    var up = i ? 0 : 0;
    flat(c, ell(f[0] + s * 0.05, f[1] + s * 0.01, s * 0.11, s * 0.035, 0.0), '#7a1f1a'); flat(c, ell(f[0] + s * 0.05, f[1] - s * 0.005, s * 0.09, s * 0.02), '#e8b84a');
  });
  /* the sarong, swaying with the stride */
  var lean = ((A(l1, 2)[0] + A(l2, 2)[0]) / 2 - hx) * 0.35, top = hy - s * 0.46, hem = hy + s * 0.4;
  paper(c, poly([[hx - s * 0.2, top], [hx + s * 0.2, top], [hx + s * 0.28 + lean, hem], [hx - s * 0.28 + lean, hem]]), '#2a3a6a', 1.3);
  for (k = 1; k < 6; k++) line(c, [[hx - s * 0.2 + k * s * 0.067, top + s * 0.04], [hx - s * 0.28 + k * s * 0.093 + lean, hem - s * 0.1]], 'rgba(255,255,255,.1)', s * 0.015);
  paper(c, poly([[hx - s * 0.28 + lean, hem], [hx + s * 0.28 + lean, hem], [hx + s * 0.275 + lean, hem - s * 0.1], [hx - s * 0.275 + lean, hem - s * 0.1]]), GOLD, 0.7);
  c.save(); c.strokeStyle = RED; c.lineWidth = Math.max(0.7, s * 0.014); c.beginPath(); for (k = 0; k <= 14; k++) c.lineTo(hx - s * 0.28 + lean + k * s * 0.04, hem - (k % 2 ? s * 0.015 : s * 0.085)); c.stroke(); c.restore();
  /* the blouse and sash, cut off with a torn edge */
  var by = top - s * 0.42;
  paper(c, function (q) { q.beginPath(); q.moveTo(hx - s * 0.2, top + s * 0.02); q.lineTo(hx + s * 0.2, top + s * 0.02); q.lineTo(hx + s * 0.18, by); for (var i = 0; i <= 8; i++) q.lineTo(hx + s * 0.18 - i * s * 0.045, by + (i % 2 ? s * 0.04 : 0)); q.closePath(); }, '#fbf3df', 1);
  paper(c, rect(hx - s * 0.21, top - s * 0.06, s * 0.42, s * 0.1), '#d9342b', 0.6); flat(c, rect(hx - s * 0.21, top - s * 0.02, s * 0.42, s * 0.025), GOLD);
  /* the bag, swinging at her hip */
  var ba = Math.sin(p + 1.2) * 0.35 - 0.1, bx = hx + s * 0.2, byy = top - s * 0.02;
  c.save(); c.translate(bx, byy); c.rotate(ba);
  line(c, [[0, 0], [s * 0.02, s * 0.2]], '#5a3a1a', s * 0.015);
  paper(c, poly([[-s * 0.1, s * 0.2], [s * 0.12, s * 0.2], [s * 0.14, s * 0.4], [-s * 0.12, s * 0.4]]), '#c8642a', 0.9);
  flat(c, rect(-s * 0.11, s * 0.28, s * 0.24, s * 0.04), GOLD); flat(c, rect(-s * 0.11, s * 0.34, s * 0.24, s * 0.02), '#7a1f1a');
  c.restore();
  var fd = A(Math.cos(p) > 0 ? l1 : l2, 2); if (Math.abs(fd[1] - gy) < s * 0.03) for (k = 0; k < 3; k++) { c.fillStyle = 'rgba(200,180,140,.5)'; c.beginPath(); c.arc(fd[0] - s * 0.1 - k * s * 0.05, gy - s * 0.02 - k * s * 0.02, s * (0.025 + k * 0.01), 0, TAU); c.fill(); }
};
/* ขน feather: a peacock feather floats down, rocking in a zigzag; a small down feather drifts after it */
function feather(c, cx, cy, L, ang, big, t) {
  c.save(); c.translate(cx, cy); c.rotate(ang);
  var N = 10, i;
  function ed(sd, u) { var w = L * 0.17 * Math.sin(Math.pow(u, 0.7) * PI) * (big ? 1 : 0.9) + L * 0.012; return [sd * w + (big ? Math.sin(u * 8) * L * 0.004 : 0), L * 0.5 - u * L]; }
  [-1, 1].forEach(function (sd) { var pts = []; for (i = 0; i <= N; i++) pts.push(ed(sd, i / N)); pts.push([0, -L * 0.5]); pts.unshift([0, L * 0.5]); paper(c, poly(pts), big ? (sd > 0 ? '#2f8f6a' : '#27806a') : '#fbf3df', big ? 1 : 0.8); });
  c.save(); c.lineWidth = Math.max(0.6, L * 0.007); c.strokeStyle = big ? 'rgba(220,255,200,.5)' : 'rgba(150,150,140,.5)';
  for (i = 1; i < 18; i++) { var u = i / 18, e1 = ed(1, u), e0 = ed(-1, u); c.beginPath(); c.moveTo(0, L * 0.5 - u * L); c.lineTo(e1[0], e1[1] - L * 0.04); c.moveTo(0, L * 0.5 - u * L); c.lineTo(e0[0], e0[1] - L * 0.04); c.stroke(); }
  c.restore();
  if (big) { paper(c, ell(0, -L * 0.3, L * 0.13, L * 0.17), '#e8b84a', 0.5); flat(c, ell(0, -L * 0.3, L * 0.1, L * 0.14), '#1f4a6b'); flat(c, ell(0, -L * 0.3, L * 0.055, L * 0.08), '#2f8f6a'); flat(c, ell(0, -L * 0.31, L * 0.025, L * 0.04), '#1b1410'); }
  line(c, [[0, L * 0.58], [0, -L * 0.5]], big ? '#e8d9b0' : '#d8d0bc', Math.max(0.8, L * 0.016));
  c.restore();
}
P['khon-2'] = function (c, x, y, s, t) {
  var u = fr(t / 6800), w = u * TAU * 2, px = x + Math.sin(w) * s * 0.4, py = y - s * 1.0 + u * s * 2.0, ang = Math.cos(w) * 0.8 + 0.1, al = Math.min(1, u * 8, (1 - u) * 8);
  var u2 = fr(t / 5200 + 0.45), w2 = u2 * TAU * 1.5 + 1, qx = x + s * 0.5 * Math.sin(w2) - s * 0.2, qy = y - s * 1.0 + u2 * s * 2.0, al2 = Math.min(1, u2 * 8, (1 - u2) * 8);
  c.save(); c.globalAlpha = al2; feather(c, qx, qy, s * 0.6, Math.cos(w2) * 0.9 - 0.3, false, t); c.restore();
  c.save(); c.globalAlpha = al; feather(c, px, py, s * 1.45, ang, true, t); c.restore();
  c.save(); c.strokeStyle = 'rgba(150,120,80,.25)'; c.lineWidth = Math.max(0.8, s * 0.014); c.setLineDash([s * 0.04, s * 0.06]); c.beginPath(); for (var k = 0; k <= 40; k++) { var v = k / 40, ww = (u - 0.35 + v * 0.35) * TAU * 2; if (u - 0.35 + v * 0.35 < 0) continue; c.lineTo(x + Math.sin(ww) * s * 0.4, y - s * 1.0 + (u - 0.35 + v * 0.35) * s * 2.0); } c.stroke(); c.restore();
};
/* ต้น trunk: a tree grows from a sapling to its full height and back again, slowly */
P.ton = function (c, x, y, s, t) {
  var g = 0.5 - 0.5 * Math.cos(t / 3600), gy = y + s * 0.88, k, cg = sm((g - 0.1) / 0.88), sap = 1 - sm((g - 0.04) / 0.32), sway = Math.sin(t / 800) * s * 0.03;
  paper(c, blob([[x - s * 0.95, gy + s * 0.08], [x - s * 0.5, gy - s * 0.1], [x + s * 0.5, gy - s * 0.1], [x + s * 0.95, gy + s * 0.08], [x, gy + s * 0.14]]), '#6aa84a', 0.9);
  flat(c, ell(x, gy - s * 0.02, s * (0.2 + g * 0.3), s * 0.04), 'rgba(40,60,20,.3)');
  var Ht = s * (0.2 + 1.0 * g), wb = s * (0.035 + 0.09 * g), topx = x + sway * g;
  paper(c, poly([[x - wb, gy - s * 0.02], [x + wb, gy - s * 0.02], [topx + wb * 0.45, gy - Ht], [topx - wb * 0.45, gy - Ht]]), '#6a4a2a', 0.9 + g);
  if (g > 0.3) for (k = 0; k < 4; k++) line(c, [[x - wb * 0.4 + k * wb * 0.3, gy - s * 0.04], [topx - wb * 0.2 + k * wb * 0.15, gy - Ht * (0.5 + k * 0.1)]], 'rgba(40,20,5,.35)', s * 0.012);
  if (cg > 0.02) {
    var R = s * (0.1 + 0.58 * cg), cy = gy - Ht - R * 0.2;
    [[-0.7, 0.3, 0.75], [0.7, 0.25, 0.78], [0, -0.1, 1.0], [-0.35, -0.45, 0.7], [0.4, -0.5, 0.68]].forEach(function (b, i) {
      var bs = 1 + 0.025 * Math.sin(t / 600 + i * 1.5); paper(c, ball(topx + b[0] * R * 0.85 + sway * 0.6, cy + b[1] * R * 0.8, R * b[2] * 0.62 * bs, 5 + i), ['#2f7a3a', '#3f8f4a', '#4d9e52', '#3a8442', '#5db05a'][i], 1 + cg * 0.6);
    });
    if (cg > 0.85) [[-0.5, 0.2], [0.55, 0.0], [0.1, -0.4], [-0.1, 0.45]].forEach(function (f, i) { dot(c, topx + f[0] * R * 0.8 + sway * 0.6, cy + f[1] * R * 0.8, s * 0.03 * ((cg - 0.85) / 0.15), CRIM); });
  }
  if (sap > 0.05) {
    c.save(); c.globalAlpha = sap; var tx = topx, ty = gy - Ht, la = 0.5 + 0.2 * Math.sin(t / 700);
    paper(c, lf(tx, ty, s * 0.3, s * 0.1, -PI / 2 - la - 0.3), '#7fb84a', 0.8); paper(c, lf(tx, ty, s * 0.3, s * 0.1, -PI / 2 + la + 0.3), '#5d9e4a', 0.8); paper(c, lf(tx, ty, s * 0.26, s * 0.08, -PI / 2), '#8fc860', 0.8);
    c.restore();
  }
  if (g > 0.15 && g < 0.9) glint(c, x + s * 0.55, gy - Ht * 0.7 - s * 0.2, s * 0.08, t, 4);
};
/* หิน stone: a stack of balanced river stones; the top one rocks */
function stone(rx, ry, seed) { var pts = [], n = 9; for (var i = 0; i < n; i++) { var a = i / n * TAU, r = 1 + 0.1 * Math.sin(a * 2 + seed) + 0.06 * Math.sin(a * 3 + seed * 2); pts.push([Math.cos(a) * rx * r, Math.sin(a) * ry * r * (Math.sin(a) > 0 ? 0.85 : 1)]); } return pts; }
P.hin = function (c, x, y, s, t) {
  var gy = y + s * 0.86, k, i, S = [[0.64, 0.21, '#7a7a76', 0.0, 1], [0.5, 0.17, '#a39d92', 0.05, 2], [0.4, 0.16, '#66666c', -0.05, 3], [0.3, 0.14, '#b0aa9e', 0.04, 4], [0.2, 0.11, '#8a847c', -0.02, 5]];
  paper(c, ell(x, gy + s * 0.02, s * 0.98, s * 0.17), '#2f6b8a', 0.5); paper(c, ell(x, gy, s * 0.92, s * 0.14), '#4aa0c8', 0.5);
  for (k = 0; k < 3; k++) { var u = fr(t / 2400 + k / 3); c.save(); c.globalAlpha = (1 - u) * 0.8; c.strokeStyle = '#e9f6fb'; c.lineWidth = Math.max(0.8, s * 0.025 * (1 - u)); c.beginPath(); c.ellipse(x, gy + s * 0.02, s * (0.7 + u * 0.28), s * (0.1 + u * 0.05), 0, 0, TAU); c.stroke(); c.restore(); }
  var topY = gy - s * 0.02;
  S.forEach(function (st, idx) {
    var rx = st[0] * s, ry = st[1] * s, cy = topY - ry * 0.75, cx = x + st[3] * s, rock = idx === 4 ? Math.sin(t / 650) * 0.13 : idx === 3 ? Math.sin(t / 650 - 0.5) * 0.015 : 0;
    c.save(); c.translate(cx, cy + ry * 0.85); c.rotate(rock); c.translate(-cx, -(cy + ry * 0.85));
    var pts = stone(rx, ry, st[4]).map(function (p) { return [cx + p[0], cy + p[1]]; });
    paper(c, blob(pts), st[2], 1.4);
    c.save(); blob(pts)(c); c.clip();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(1, ry * 0.18); c.beginPath(); c.moveTo(cx - rx, cy + ry * (0.1 * idx - 0.2)); c.quadraticCurveTo(cx, cy - ry * 0.5, cx + rx, cy + ry * 0.2); c.stroke();
    for (i = 0; i < 9; i++) dot(c, cx + (((i * 0.37 + idx * 0.21) % 1) - 0.5) * rx * 1.7, cy + (((i * 0.61 + idx * 0.13) % 1) - 0.5) * ry * 1.5, Math.max(0.6, s * 0.01), 'rgba(0,0,0,.25)');
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(cx - rx * 0.35, cy - ry * 0.4, rx * 0.35, ry * 0.2, -0.3, 0, TAU); c.fill();
    c.restore(); c.restore();
    topY = cy - ry * 0.95;
  });
  [[-0.78, 0.0, 0.1], [0.82, 0.02, 0.08], [-0.6, 0.06, 0.06]].forEach(function (p, i) { paper(c, ell(x + p[0] * s, gy - p[2] * s * 0.2, p[2] * s * 1.2, p[2] * s * 0.7), i % 2 ? '#a39d92' : '#7a7a76', 0.7); });
};
/* แดง red: a red paper lantern swings on its string, two small ones swing after it */
function lantern(c, px, py, rope, R, a, t, k) {
  c.save(); c.translate(px, py); c.rotate(a);
  line(c, [[0, 0], [0, rope]], '#3a2a1a', Math.max(0.8, R * 0.05));
  var cy = rope + R * 0.95;
  var g = c.createRadialGradient(0, cy, R * 0.3, 0, cy, R * 2.3); g.addColorStop(0, 'rgba(255,170,90,' + (0.55 + 0.15 * Math.sin(t / 300 + k)).toFixed(2) + ')'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(-R * 2.4, cy - R * 2.4, R * 4.8, R * 4.8);
  paper(c, poly([[-R * 0.34, rope], [R * 0.34, rope], [R * 0.42, rope + R * 0.2], [-R * 0.42, rope + R * 0.2]]), GOLD, 0.6);
  paper(c, ell(0, cy, R, R * 0.88), '#d9342b', 1.3);
  c.save(); c.strokeStyle = 'rgba(122,31,26,.55)'; c.lineWidth = Math.max(0.8, R * 0.035); [0.3, 0.62, 0.9].forEach(function (f) { c.beginPath(); c.ellipse(0, cy, R * f, R * 0.88, 0, 0, TAU); c.stroke(); }); c.restore();
  flat(c, ell(-R * 0.4, cy - R * 0.3, R * 0.16, R * 0.3, 0.4), 'rgba(255,230,200,.35)');
  line(c, [[-R * 0.8, cy], [R * 0.8, cy]], 'rgba(232,184,74,.0)', 1);
  paper(c, poly([[-R * 0.3, cy + R * 0.82], [R * 0.3, cy + R * 0.82], [R * 0.4, cy + R * 1.0], [-R * 0.4, cy + R * 1.0]]), GOLD, 0.6);
  var tl = R * 1.5, ty = cy + R * 1.0;
  for (var i = -2; i <= 2; i++) { var pts = []; for (var j = 0; j <= 5; j++) { var v = j / 5; pts.push([i * R * 0.07 + Math.sin(t / 380 - v * 3 + k + i) * R * 0.12 * v + a * -R * 0.4 * v, ty + v * tl]); } line(c, pts, i % 2 ? '#d9342b' : GOLD, Math.max(0.8, R * 0.05)); }
  paper(c, ell(0, ty + R * 0.05, R * 0.1, R * 0.12), GOLD, 0.4);
  c.restore();
}
P.daeng = function (c, x, y, s, t) {
  var by = y - s * 0.92;
  paper(c, ribbon([[x - s * 0.98, by + s * 0.02], [x + s * 0.98, by - s * 0.02]], s * 0.07, s * 0.07), '#c8a860', 1);
  [-0.9, -0.3, 0.3, 0.9].forEach(function (f) { line(c, [[x + f * s, by - s * 0.04], [x + f * s, by + s * 0.05]], '#a8802a', s * 0.015); });
  lantern(c, x - s * 0.66, by, s * 0.14, s * 0.22, 0.28 * Math.sin(t / 700 + 1.0), t, 1);
  lantern(c, x + s * 0.66, by, s * 0.14, s * 0.22, 0.28 * Math.sin(t / 700 + 2.2), t, 2);
  lantern(c, x, by, s * 0.28, s * 0.4, 0.22 * Math.sin(t / 900), t, 0);
};
/* ขาว white: a garland of white jasmine (phuang malai) swings on its cord */
function jas(c, x, y, r, rot) { c.fillStyle = '#fffdf6'; c.strokeStyle = 'rgba(190,200,150,.6)'; c.lineWidth = Math.max(0.5, r * 0.12); for (var j = 0; j < 5; j++) { var a = rot + j * TAU / 5; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.3, a, 0, TAU); c.fill(); c.stroke(); } dot(c, x, y, r * 0.28, '#e8d070'); }
function jbud(c, x, y, r, a) { c.fillStyle = '#fffdf6'; c.strokeStyle = 'rgba(190,200,150,.6)'; c.lineWidth = Math.max(0.5, r * 0.15); c.beginPath(); c.ellipse(x, y, r * 1.1, r * 0.45, a, 0, TAU); c.fill(); c.stroke(); dot(c, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9, r * 0.14, '#9bc07a'); }
P['khao-4'] = function (c, x, y, s, t) {
  var k, j;
  portal(c, x, y, s * 0.98, '#2a5a3a', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#2a5a3a', 0.2);
    [[-0.7, -0.5, 0.5, 0.3], [0.75, -0.2, 2.6, 0.35], [-0.6, 0.55, -0.4, 0.4], [0.65, 0.65, 3.4, 0.3]].forEach(function (l, i) { flat(c, lf(x + l[0] * s, y + l[1] * s, s * l[3] * 1.6, s * 0.12, l[2]), i % 2 ? '#3f8442' : '#357a40'); });
    var a = 0.22 * Math.sin(t / 900), pvx = x, pvy = y - s * 0.93;
    c.save(); c.translate(pvx, pvy); c.rotate(a); c.scale(1.2, 1.2);
    paper(c, ball(0, 0, s * 0.045, 3), GOLD, 0.5); line(c, [[0, 0], [0, s * 0.3]], '#e8d9b0', s * 0.02);
    /* the crown of buds */
    var cy = s * 0.5;
    for (k = 0; k < 14; k++) { var ang = k / 14 * TAU; jbud(c, Math.cos(ang) * s * 0.14, cy + Math.sin(ang) * s * 0.2, s * 0.06, ang); }
    for (k = 0; k < 7; k++) { var ang2 = k / 7 * TAU + 0.3; jbud(c, Math.cos(ang2) * s * 0.07, cy + Math.sin(ang2) * s * 0.1, s * 0.055, ang2); }
    jas(c, 0, cy, s * 0.07, 0.3);
    paper(c, poly([[-s * 0.2, cy - s * 0.26], [0, cy - s * 0.12], [s * 0.2, cy - s * 0.26], [s * 0.14, cy - s * 0.08], [0, cy - s * 0.16], [-s * 0.14, cy - s * 0.08]]), '#e0708c', 0.6);
    paper(c, poly([[-s * 0.04, cy - s * 0.18], [-s * 0.16, cy + s * 0.12], [-s * 0.08, cy + s * 0.1]]), '#d9342b', 0.4); paper(c, poly([[s * 0.04, cy - s * 0.18], [s * 0.16, cy + s * 0.12], [s * 0.08, cy + s * 0.1]]), '#d9342b', 0.4);
    /* the three tails of flowers and buds, each a beat behind */
    [[-0.14, 7], [0, 10], [0.14, 7]].forEach(function (tl, i) {
      var px = tl[0] * s, py = cy + s * 0.2, prev = [px, py];
      for (j = 0; j < tl[1]; j++) { var sw = Math.sin(t / 420 - j * 0.45 + i) * s * 0.012 * (j + 1) + a * -s * 0.04 * j; var nx = px + sw, ny = py + s * 0.085 * (j + 1); if (j % 2) jbud(c, nx, ny, s * 0.04, PI / 2 + sw * 2); else jas(c, nx, ny, s * 0.05, j); prev = [nx, ny]; }
      if (i === 1) { paper(c, ball(prev[0], prev[1] + s * 0.07, s * 0.06, 3), '#f09ab0', 0.5); paper(c, poly([[prev[0] - s * 0.03, prev[1] + s * 0.1], [prev[0], prev[1] + s * 0.32], [prev[0] + s * 0.03, prev[1] + s * 0.1]]), '#d9342b', 0.4); }
    });
    c.restore();
  });
};
/* ดำ black: a black crow on a branch under a crescent moon, now and then it caws */
P.dam = function (c, x, y, s, t) {
  var k, ph = fr(t / 4200), caw = sm((ph - 0.5) / 0.05) * (1 - sm((ph - 0.72) / 0.05));
  portal(c, x, y, s * 0.98, '#1c2644', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#1c2644', 0.2);
    var g = c.createRadialGradient(x - s * 0.45, y - s * 0.5, s * 0.1, x - s * 0.45, y - s * 0.5, s * 0.8); g.addColorStop(0, 'rgba(255,240,200,.45)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(x - s, y - s, s * 2, s * 2);
    for (k = 0; k < 12; k++) { var tw = 0.4 + 0.6 * Math.max(0, Math.sin(t / 500 + k * 2.1)); c.fillStyle = 'rgba(255,248,220,' + (tw * 0.9).toFixed(2) + ')'; c.beginPath(); c.arc(x + (((k * 0.618) % 1) * 1.8 - 0.9) * s, y - s * 0.9 + ((k * 0.381) % 1) * s * 0.9, s * (0.012 + (k % 3) * 0.006), 0, TAU); c.fill(); }
    var Mx = x - s * 0.45, My = y - s * 0.5, MR = s * 0.26, Bx = Mx + s * 0.13, By = My - s * 0.07, BR2 = s * 0.22, dd = Math.sqrt((Bx - Mx) * (Bx - Mx) + (By - My) * (By - My)), ph0 = Math.atan2(By - My, Bx - Mx), al = Math.acos((MR * MR + dd * dd - BR2 * BR2) / (2 * MR * dd));
    var P0 = [Mx + MR * Math.cos(ph0 + al), My + MR * Math.sin(ph0 + al)], P1 = [Mx + MR * Math.cos(ph0 - al), My + MR * Math.sin(ph0 - al)], q0 = Math.atan2(P0[1] - By, P0[0] - Bx), q1 = Math.atan2(P1[1] - By, P1[0] - Bx);
    var dl = ((q0 - q1) % TAU + TAU) % TAU, mid = q1 + dl / 2, ccw = Math.cos(mid - (ph0 + PI)) < 0;
    paper(c, function (q) { q.beginPath(); q.arc(Mx, My, MR, ph0 + al, ph0 - al + TAU, false); q.arc(Bx, By, BR2, q1, q0, ccw); q.closePath(); }, '#fbf0cf', 0.8);
    var br = [[x - s * 1.0, y + s * 0.62], [x - s * 0.4, y + s * 0.56], [x + s * 0.3, y + s * 0.6], [x + s * 1.0, y + s * 0.5]];
    paper(c, ribbon([br[0], br[1], br[2], br[3]], s * 0.1, s * 0.05), '#0f0d14', 1);
    [[-0.7, 0.55, -1.0], [0.55, 0.57, -0.4], [0.75, 0.52, -2.0], [-0.3, 0.57, -2.4]].forEach(function (l, i) { flat(c, lf(x + l[0] * s, y + l[1] * s, s * 0.3, s * 0.07, l[2] + Math.sin(t / 900 + i) * 0.06), '#1f3a2a'); });
    /* the crow, drawn facing right, then turned to face the moon */
    c.save(); c.translate(x + s * 0.12, y + s * 0.56); c.scale(-1.3, 1.3);
    var bob = Math.sin(t / 700) * s * 0.01, hb = Math.sin(t / 1300) * s * 0.015, tw2 = Math.sin(t / 900) * 0.05 + (ph > 0.3 && ph < 0.4 ? Math.sin(t / 60) * 0.12 : 0);
    [-0.04, 0.1].forEach(function (f) { line(c, [[f * s, -s * 0.12], [f * s, s * 0.02]], '#3a2a2a', s * 0.025); });
    c.save(); c.translate(-s * 0.26, -s * 0.28); c.rotate(0.35 + tw2);
    paper(c, poly([[0, -s * 0.07], [-s * 0.55, -s * 0.12], [-s * 0.6, s * 0.1], [0, s * 0.07]]), '#14121a', 0.9); c.restore();
    paper(c, ell(0, -s * 0.34 + bob, s * 0.34, s * 0.2, -0.4), '#14121a', 1.2);
    paper(c, ell(-s * 0.06, -s * 0.36 + bob, s * 0.24, s * 0.12, -0.3), '#1d2236', 0.7);
    line(c, [[-s * 0.2, -s * 0.34 + bob], [s * 0.1, -s * 0.4 + bob]], 'rgba(120,140,220,.55)', s * 0.015); line(c, [[-s * 0.16, -s * 0.28 + bob], [s * 0.04, -s * 0.33 + bob]], 'rgba(120,140,220,.35)', s * 0.012);
    var hx = s * 0.28, hy = -s * 0.6 + hb - caw * s * 0.08;
    paper(c, ell(s * 0.2, -s * 0.46 + bob, s * 0.14, s * 0.12), '#14121a', 0.7);
    paper(c, ball(hx, hy, s * 0.15, 3), '#14121a', 1);
    var op = caw * 0.4;
    c.save(); c.translate(hx + s * 0.1, hy + s * 0.0); c.rotate(-op - caw * 0.3); paper(c, poly([[0, -s * 0.05], [s * 0.26, s * 0.0], [0, s * 0.03]]), '#0a0910', 0.5); c.restore();
    c.save(); c.translate(hx + s * 0.1, hy + s * 0.03); c.rotate(op - caw * 0.3); paper(c, poly([[0, 0], [s * 0.2, s * 0.01], [0, s * 0.06]]), '#0a0910', 0.4); c.restore();
    if (caw > 0.3) flat(c, ell(hx + s * 0.16, hy + s * 0.04, s * 0.05, s * 0.012), '#7a1f1a');
    dot(c, hx + s * 0.05, hy - s * 0.03, s * 0.034, '#e8dcc0'); dot(c, hx + s * 0.06, hy - s * 0.03, s * 0.018, '#000');
    c.restore();
    if (caw > 0.2) for (k = 0; k < 3; k++) { c.save(); c.globalAlpha = caw * (1 - k * 0.25); c.strokeStyle = '#e8b84a'; c.lineWidth = Math.max(1, s * 0.03); c.lineCap = 'round'; c.beginPath(); c.arc(x - s * 0.3, y + s * 0.03, s * (0.2 + k * 0.13), PI + 0.5, PI + 1.15); c.stroke(); c.restore(); }
  });
};
/* สี colour: a row of paint pots; the brush dips in each and paints its band of the rainbow */
P.si = function (c, x, y, s, t) {
  var cols = ['#d9342b', '#f08a2a', '#e8b84a', '#4d9e52', '#2f55c9'], k, cx = x, cyy = y + s * 0.0, tm = t % 13500, kk = Math.min(6, Math.floor(tm / 2000)), f = kk < 5 ? (tm - kk * 2000) / 2000 : 0, rest = [x + s * 0.92, y + s * 0.3];
  function R(i) { return s * (0.26 + i * 0.1); } function pot(i) { return [x - s * 0.72 + i * s * 0.36, y + s * 0.56]; }
  paper(c, rect(x - s * 0.92, y - s * 0.95, s * 1.84, s * 1.2), '#fffaf0', 1.2);
  paper(c, rect(x - s * 0.96, y + s * 0.23, s * 1.92, s * 0.06), '#a8703c', 0.8);
  var fade = kk === 6 ? 1 - (tm - 12000) / 1500 : 1;
  c.save(); c.globalAlpha = clamp(fade, 0, 1); c.lineCap = 'round';
  for (k = 0; k < 5; k++) { var p = kk > k || kk >= 5 ? 1 : kk === k ? clamp((f - 0.55) / 0.45, 0, 1) : 0; if (p <= 0) continue; c.strokeStyle = cols[k]; c.lineWidth = s * 0.09; c.beginPath(); c.arc(cx, cyy + s * 0.12, R(k), PI, PI + p * PI); c.stroke(); }
  c.restore();
  for (k = 0; k < 5; k++) { var pp = pot(k); paper(c, rect(pp[0] - s * 0.14, pp[1], s * 0.28, s * 0.3), '#e8eef0', 0.9); flat(c, rect(pp[0] - s * 0.12, pp[1] + s * 0.1, s * 0.24, s * 0.18), cols[k]); paper(c, ell(pp[0], pp[1] + s * 0.1, s * 0.12, s * 0.035), cols[k], 0.2); flat(c, ell(pp[0], pp[1], s * 0.14, s * 0.035), 'rgba(255,255,255,.7)'); line(c, [[pp[0] - s * 0.1, pp[1] + s * 0.06], [pp[0] - s * 0.1, pp[1] + s * 0.26]], 'rgba(255,255,255,.7)', s * 0.025); }
  var bp, col = cols[Math.min(kk, 4)];
  function ease(u) { return sm(u); }
  if (kk >= 5) { bp = rest; col = null; }
  else {
    var from = kk === 0 ? rest : [x + R(kk - 1), cyy + s * 0.12], pt = pot(kk), st = [x - R(kk), cyy + s * 0.12];
    if (f < 0.25) { var u = ease(f / 0.25); bp = [lerp(from[0], pt[0], u), lerp(from[1], pt[1] - s * 0.05, u) - Math.sin(u * PI) * s * 0.15]; col = kk === 0 ? null : cols[kk - 1]; if (kk === 0 && f < 0.0) col = null; }
    else if (f < 0.42) { var d = Math.sin((f - 0.25) / 0.17 * PI); bp = [pt[0], pt[1] - s * 0.05 + d * s * 0.2]; col = (f - 0.25) / 0.17 > 0.5 ? cols[kk] : (kk === 0 ? null : cols[kk - 1]); }
    else if (f < 0.55) { var u2 = ease((f - 0.42) / 0.13); bp = [lerp(pt[0], st[0], u2), lerp(pt[1] - s * 0.05, st[1], u2) - Math.sin(u2 * PI) * s * 0.2]; col = cols[kk]; }
    else { var pr = (f - 0.55) / 0.45, ang = PI + pr * PI; bp = [cx + Math.cos(ang) * R(kk), cyy + s * 0.12 + Math.sin(ang) * R(kk)]; col = cols[kk]; }
  }
  c.save(); c.translate(bp[0], bp[1]); c.rotate(0.45);
  paper(c, ribbon([[0, -s * 0.18], [0, -s * 0.85]], s * 0.07, s * 0.05), '#a8432f', 0.9);
  paper(c, rect(-s * 0.04, -s * 0.22, s * 0.08, s * 0.1), '#b8c0c8', 0.5);
  paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.04, -s * 0.13); q.quadraticCurveTo(-s * 0.05, -s * 0.03, 0, s * 0.0); q.quadraticCurveTo(s * 0.05, -s * 0.03, s * 0.04, -s * 0.13); q.closePath(); }, col || '#3a2a1a', 0.5);
  c.restore();
};
/* แสง light: an oil lamp (pang pratheep) burns and its rays pulse outward */
P.saeng = function (c, x, y, s, t) {
  var k, fc = [x, y + s * 0.1], f1 = Math.sin(t / 110), f2 = Math.sin(t / 73 + 1);
  portal(c, x, y, s * 0.98, '#2a1a2e', function () {
    paper(c, rect(x - s, y - s, s * 2, s * 2), '#2a1a2e', 0.2);
    var g = c.createRadialGradient(fc[0], fc[1], s * 0.1, fc[0], fc[1], s * 1.0); g.addColorStop(0, 'rgba(255,220,120,.85)'); g.addColorStop(0.5, 'rgba(255,170,70,.3)'); g.addColorStop(1, 'rgba(255,170,70,0)'); c.fillStyle = g; c.fillRect(x - s, y - s, s * 2, s * 2);
    c.save(); c.translate(fc[0], fc[1]); c.rotate(t / 7000);
    for (k = 0; k < 18; k++) { var a = k / 18 * TAU, len = s * (k % 2 ? 0.5 : 0.72) * (0.85 + 0.2 * Math.sin(t / 420 + k * 0.9)), w = 0.07; c.fillStyle = k % 2 ? 'rgba(255,214,110,.6)' : 'rgba(255,230,150,.8)'; c.beginPath(); c.moveTo(Math.cos(a - w) * s * 0.2, Math.sin(a - w) * s * 0.2); c.lineTo(Math.cos(a) * len, Math.sin(a) * len); c.lineTo(Math.cos(a + w) * s * 0.2, Math.sin(a + w) * s * 0.2); c.closePath(); c.fill(); }
    c.restore();
    /* the lotus petals and the lamp */
    for (k = 0; k < 5; k++) { var pa = -PI / 2 + (k - 2) * 0.55; paper(c, lf(x, y + s * 0.82, s * 0.5, s * 0.1, pa), k % 2 ? '#f09ab0' : '#f6b8c8', 0.8); }
    paper(c, rect(x - s * 0.17, y + s * 0.5, s * 0.34, s * 0.08), '#a34a1c', 0.7);
    paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.46, y + s * 0.3); q.bezierCurveTo(x - s * 0.46, y + s * 0.55, x - s * 0.22, y + s * 0.6, x, y + s * 0.6); q.bezierCurveTo(x + s * 0.22, y + s * 0.6, x + s * 0.46, y + s * 0.55, x + s * 0.46, y + s * 0.3); q.closePath(); }, '#c8642a', 1.2);
    paper(c, poly([[x + s * 0.36, y + s * 0.32], [x + s * 0.5, y + s * 0.26], [x + s * 0.42, y + s * 0.4]]), '#c8642a', 0.5);
    line(c, [[x - s * 0.34, y + s * 0.42], [x - s * 0.2, y + s * 0.54]], 'rgba(255,220,170,.4)', s * 0.04);
    c.save(); c.strokeStyle = '#8a3a14'; c.lineWidth = Math.max(0.8, s * 0.018); c.beginPath(); c.moveTo(x - s * 0.44, y + s * 0.4); c.quadraticCurveTo(x, y + s * 0.5, x + s * 0.44, y + s * 0.4); c.stroke(); c.restore();
    paper(c, ell(x, y + s * 0.3, s * 0.46, s * 0.1), '#e8852a', 0.8); flat(c, ell(x, y + s * 0.3, s * 0.38, s * 0.07), '#8a3a14'); flat(c, ell(x, y + s * 0.3, s * 0.34, s * 0.055), '#f0a050');
    line(c, [[x, y + s * 0.3], [x, y + s * 0.22]], '#3a2a1a', s * 0.02);
    flame(c, x, y + s * 0.24, s * (0.46 + 0.05 * f1), s * 0.13, f2 * s * 0.025, '#e8852a'); flame(c, x, y + s * 0.24, s * (0.34 + 0.04 * f2), s * 0.09, f1 * s * 0.02, '#ffd25a'); flame(c, x, y + s * 0.24, s * (0.2 + 0.03 * f1), s * 0.05, 0, '#fffbe0');
    glint(c, x + s * 0.5, y - s * 0.55, s * 0.09, t, 1); glint(c, x - s * 0.62, y - s * 0.2, s * 0.07, t, 2); glint(c, x + s * 0.65, y + s * 0.0, s * 0.06, t, 3);
  });
};
/* เส้น strand: noodles lifted from a bowl on chopsticks; steam rising */
P.sen = function (c, x, y, s, t) {
  var k, i, bowlY = y + s * 0.42, lift = Math.sin(t / 1500) * s * 0.1, P0 = [x + s * 0.0, y - s * 0.62 + lift];
  for (k = 0; k < 3; k++) { var u = fr(t / 2600 + k / 3); c.save(); c.globalAlpha = Math.sin(u * PI) * 0.5; c.strokeStyle = '#fff'; c.lineWidth = s * 0.06; c.lineCap = 'round'; c.beginPath(); for (var j = 0; j <= 9; j++) { var v = j / 9; c.lineTo(x - s * 0.5 + k * s * 0.35 + Math.sin(v * 5 + t / 500 + k * 2) * s * 0.06, y - s * 0.1 - u * s * 0.3 - v * s * 0.3); } c.stroke(); c.restore(); }
  /* the bowl */
  paper(c, poly([[x - s * 0.2, y + s * 0.84], [x + s * 0.2, y + s * 0.84], [x + s * 0.17, y + s * 0.72], [x - s * 0.17, y + s * 0.72]]), '#e8e0cc', 0.8);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.8, bowlY); q.bezierCurveTo(x - s * 0.8, y + s * 0.78, x - s * 0.3, y + s * 0.8, x, y + s * 0.8); q.bezierCurveTo(x + s * 0.3, y + s * 0.8, x + s * 0.8, y + s * 0.78, x + s * 0.8, bowlY); q.closePath(); }, '#fbf3df', 1.4);
  c.save(); c.strokeStyle = '#2f55c9'; c.lineWidth = Math.max(1, s * 0.03); c.beginPath(); c.moveTo(x - s * 0.76, y + s * 0.52); c.quadraticCurveTo(x, y + s * 0.64, x + s * 0.76, y + s * 0.52); c.stroke();
  for (k = -5; k <= 5; k++) { c.beginPath(); c.arc(x + k * s * 0.13, y + s * 0.64 - Math.abs(k) * s * 0.012 + (5 - Math.abs(k)) * s * 0.0 + s * 0.02, s * 0.03, 0, TAU); c.stroke(); } c.restore();
  paper(c, ell(x, bowlY, s * 0.8, s * 0.15), '#e8e0cc', 0.8);
  flat(c, ell(x, bowlY + s * 0.01, s * 0.72, s * 0.12), '#c8642a');
  c.save(); c.strokeStyle = '#f6e3b0'; c.lineWidth = Math.max(1, s * 0.03); c.lineCap = 'round'; for (k = 0; k < 7; k++) { c.beginPath(); c.moveTo(x - s * 0.5 + k * s * 0.15, bowlY + s * 0.04); c.bezierCurveTo(x - s * 0.4 + k * s * 0.15, bowlY - s * 0.06, x - s * 0.3 + k * s * 0.15, bowlY + s * 0.08, x - s * 0.2 + k * s * 0.15, bowlY - s * 0.01); c.stroke(); } c.restore();
  paper(c, ell(x - s * 0.44, bowlY, s * 0.15, s * 0.07, -0.2), '#fffaf0', 0.5); dot(c, x - s * 0.44, bowlY, s * 0.04, '#f2a02a');
  paper(c, ell(x + s * 0.45, bowlY - s * 0.01, s * 0.14, s * 0.05, 0.2), '#e8a0a0', 0.5);
  for (k = 0; k < 6; k++) flat(c, ell(x - s * 0.1 + k * s * 0.07, bowlY - s * 0.03 + (k % 2) * s * 0.04, s * 0.025, s * 0.015, k), k % 2 ? '#4d9e52' : '#d9342b');
  /* the noodles hanging from the chopsticks */
  for (k = 0; k < 10; k++) {
    var pts = []; for (i = 0; i <= 14; i++) { var v = i / 14, bxk = x + (k - 4.5) * s * 0.055; pts.push([lerp(P0[0] + (k - 4.5) * s * 0.008, bxk, v) + Math.sin(v * 7 + t / 420 + k * 0.7) * s * 0.03 * Math.sin(v * PI), lerp(P0[1], bowlY - s * 0.03, v)]); }
    line(c, pts, '#e8cf90', s * 0.034); line(c, pts.map(function (p) { return [p[0] - s * 0.008, p[1]]; }), 'rgba(255,248,215,.7)', s * 0.01);
  }
  /* the chopsticks pinching */
  paper(c, ribbon([[x + s * 0.85, y - s * 1.0], [P0[0] + s * 0.02, P0[1] - s * 0.02]], s * 0.07, s * 0.025), '#a8703c', 0.9);
  paper(c, ribbon([[x + s * 0.95, y - s * 0.78], [P0[0] - s * 0.02, P0[1] + s * 0.02]], s * 0.07, s * 0.025), '#8a5a32', 0.9);
  paper(c, ribbon([[x + s * 0.85, y - s * 1.0], [x + s * 0.68, y - s * 0.89]], s * 0.075, s * 0.07), '#d9342b', 0.4); paper(c, ribbon([[x + s * 0.95, y - s * 0.78], [x + s * 0.78, y - s * 0.69]], s * 0.075, s * 0.07), '#d9342b', 0.4);
};
/* สวน garden: a bed of flowers that open and close, a butterfly drifting between them */
P.suan = function (c, x, y, s, t) {
  var gy = y + s * 0.8, k, i, cols = ['#e8708c', '#f08a2a', '#fbf3df', '#9b6bd6', '#f6c84a'], xs = [-0.72, -0.36, 0, 0.36, 0.72], hs = [0.66, 0.98, 0.8, 1.04, 0.62];
  for (k = 0; k < 11; k++) paper(c, rect(x - s * 0.98 + k * s * 0.18, y - s * 0.1 + (k % 2) * s * 0.04, s * 0.12, s * 0.9), k % 2 ? '#d8b878' : '#c8a860', 0.6);
  line(c, [[x - s, y + s * 0.2], [x + s, y + s * 0.2]], '#a8803a', s * 0.04);
  paper(c, blob([[x - s * 1.0, gy + s * 0.12], [x - s * 0.7, gy - s * 0.04], [x + s * 0.0, gy - s * 0.1], [x + s * 0.7, gy - s * 0.04], [x + s * 1.0, gy + s * 0.12], [x, gy + s * 0.18]]), '#6a4426', 1.1);
  for (k = 0; k < 12; k++) dot(c, x + (((k * 0.618) % 1) - 0.5) * s * 1.7, gy + ((k * 0.381) % 1) * s * 0.1, s * 0.015, '#4a2e1a');
  for (k = 0; k < 5; k++) {
    var o = 0.5 + 0.5 * Math.sin(t / 1300 + k * 1.3), sw = Math.sin(t / 1000 + k) * s * 0.025, hx = x + xs[k] * s + sw, hy = gy - hs[k] * s;
    line(c, [[x + xs[k] * s, gy], [x + xs[k] * s + sw * 0.4, gy - hs[k] * s * 0.5], [hx, hy]], '#3f8442', s * 0.035);
    paper(c, lf(x + xs[k] * s, gy - hs[k] * s * 0.28, s * 0.22, s * 0.05, -2.5 + k * 0.1), '#4d9e52', 0.7); paper(c, lf(x + xs[k] * s, gy - hs[k] * s * 0.4, s * 0.22, s * 0.05, -0.6 - k * 0.1), '#3f8442', 0.7);
    var spread = 0.3 + 1.15 * o, np = 7, len = s * (0.16 + 0.04 * o), wid = s * (0.045 + 0.03 * o);
    for (i = 0; i < np; i++) { var ang = -PI / 2 + (i / (np - 1) - 0.5) * 2 * spread; paper(c, lf(hx, hy, len, wid, ang), i % 2 ? cols[k] : mixc(cols[k]), 0.6); }
    dot(c, hx, hy, s * 0.03 + s * 0.015 * o, k === 2 ? '#e8b82a' : GOLD);
  }
  var bx = x + Math.sin(t / 1700) * s * 0.55, by = y - s * 0.35 + Math.sin(t / 850) * s * 0.17, fl = 0.25 + 0.75 * Math.abs(Math.cos(t / 95)), ba = Math.cos(t / 1700) * 0.3;
  c.save(); c.translate(bx, by); c.rotate(ba);
  [-1, 1].forEach(function (sd) { c.save(); c.scale(sd * fl, 1); paper(c, poly([[0, -s * 0.02], [s * 0.2, -s * 0.16], [s * 0.2, s * 0.0], [s * 0.02, s * 0.03]]), '#f08a2a', 0.6); paper(c, poly([[0, s * 0.01], [s * 0.14, s * 0.04], [s * 0.1, s * 0.16], [s * 0.01, s * 0.07]]), '#c8642a', 0.5); dot(c, s * 0.12, -s * 0.08, s * 0.025, '#1b1410'); c.restore(); });
  paper(c, ell(0, 0, s * 0.02, s * 0.08), '#1b1410', 0.4); line(c, [[0, -s * 0.07], [-s * 0.04, -s * 0.14]], '#1b1410', s * 0.01); line(c, [[0, -s * 0.07], [s * 0.04, -s * 0.14]], '#1b1410', s * 0.01);
  c.restore();
};
function mixc(h) { var r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16); r = Math.round(r * 0.82); g = Math.round(g * 0.82); b = Math.round(b * 0.82); return 'rgb(' + r + ',' + g + ',' + b + ')'; }
/* เมือง town: the brick city gate with its crenellated walls (Chiang Mai's Tha Phae Gate); pigeons lift off */
P.mueang = function (c, x, y, s, t) {
  var gy = y + s * 0.9, k, BR = '#b0553a';
  paper(c, ell(x, gy + s * 0.02, s * 1.0, s * 0.08), '#8a7a62', 0.5);
  function wall(x0, x1, top, col) {
    paper(c, rect(x0, top, x1 - x0, gy - top), col, 1.2);
    c.save(); rect(x0, top, x1 - x0, gy - top)(c); c.clip(); c.strokeStyle = 'rgba(70,20,10,.35)'; c.lineWidth = Math.max(0.6, s * 0.01);
    var row = 0; for (var yy = top + s * 0.07; yy < gy; yy += s * 0.07, row++) { c.beginPath(); c.moveTo(x0, yy); c.lineTo(x1, yy); c.stroke(); for (var xx = x0 + (row % 2) * s * 0.07; xx < x1; xx += s * 0.14) { c.beginPath(); c.moveTo(xx, yy - s * 0.07); c.lineTo(xx, yy); c.stroke(); } }
    c.restore();
    var mw = s * 0.11, gap = s * 0.06, n = Math.floor((x1 - x0 + gap) / (mw + gap)), off = (x1 - x0 - (n * mw + (n - 1) * gap)) / 2;
    for (var m = 0; m < n; m++) { var mx = x0 + off + m * (mw + gap); paper(c, rect(mx, top - s * 0.12, mw, s * 0.13), col, 0.9); flat(c, rect(mx + mw * 0.42, top - s * 0.09, mw * 0.16, s * 0.07), '#3a1410'); }
  }
  wall(x - s * 1.0, x - s * 0.4, gy - s * 0.62, '#a8492f'); wall(x + s * 0.4, x + s * 1.0, gy - s * 0.62, '#a8492f');
  wall(x - s * 0.46, x + s * 0.46, gy - s * 1.1, BR);
  paper(c, rect(x - s * 0.5, gy - s * 0.86, s * 1.0, s * 0.06), '#e8d8b8', 0.8); paper(c, rect(x - s * 0.5, gy - s * 1.12, s * 1.0, s * 0.05), '#e8d8b8', 0.8);
  [-0.38, -0.13, 0.13, 0.38].forEach(function (f) { paper(c, rect(x + f * s - s * 0.03, gy - s * 1.0, s * 0.06, s * 0.1), '#2a0e08', 0.3); });
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.2, gy); q.lineTo(x - s * 0.2, gy - s * 0.38); q.arc(x, gy - s * 0.38, s * 0.2, PI, TAU); q.lineTo(x + s * 0.2, gy); q.closePath(); }, '#e8d8b8', 1);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.15, gy); q.lineTo(x - s * 0.15, gy - s * 0.38); q.arc(x, gy - s * 0.38, s * 0.15, PI, TAU); q.lineTo(x + s * 0.15, gy); q.closePath(); }, '#2a0e08', 0.3);
  [-1, 1].forEach(function (sd) { var dx = x + sd * s * 0.145; c.save(); poly([[dx - sd * s * 0.145, gy], [dx - sd * s * 0.145, gy - s * 0.4], [dx - sd * s * 0.04, gy - s * 0.46], [dx - sd * s * 0.04, gy]].concat([]))(c); c.restore(); paper(c, poly([[x + sd * s * 0.15, gy], [x + sd * s * 0.15, gy - s * 0.42], [x + sd * s * 0.065, gy - s * 0.44], [x + sd * s * 0.065, gy - s * 0.02]]), '#6a4a2a', 0.5); for (var j = 0; j < 4; j++) dot(c, x + sd * s * 0.11, gy - s * 0.08 - j * s * 0.1, s * 0.012, GOLD); });
  paper(c, rect(x - s * 0.24, gy - s * 0.02, s * 0.48, s * 0.04), '#d8d0bc', 0.6);
  /* the pigeons: two sit on the left wall, three lift off from the walls in turn */
  function pigeon(px, py, m, fly, ph2, dir) {
    c.save(); c.translate(px, py); c.scale(dir, 1);
    var fl = fly ? Math.sin(ph2) : 0, wy = fly ? -m * 0.1 : 0;
    paper(c, ell(0, -m * 0.28, m * 0.3, m * 0.18, fly ? -0.3 : 0.1), '#9aa0a8', 0.7);
    paper(c, poly([[-m * 0.22, -m * 0.28], [-m * 0.5, -m * 0.2 + (fly ? m * 0.1 : 0)], [-m * 0.2, -m * 0.22]]), '#6a737c', 0.4);
    paper(c, ball(m * 0.28, -m * 0.4 - (fly ? m * 0.05 : 0), m * 0.1, 3), '#7a8490', 0.6); flat(c, ell(m * 0.22, -m * 0.34, m * 0.07, m * 0.04), '#4a7a6a');
    flat(c, poly([[m * 0.36, -m * 0.4], [m * 0.48, -m * 0.38], [m * 0.36, -m * 0.36]]), '#e8a0a0'); dot(c, m * 0.31, -m * 0.43, m * 0.015, '#e8892a');
    if (fly) { paper(c, poly([[-m * 0.05, -m * 0.34], [-m * 0.3, -m * 0.34 - fl * m * 0.7], [-m * 0.38, -m * 0.34 - fl * m * 0.5], [m * 0.1, -m * 0.28]]), '#b8bec6', 0.6); paper(c, poly([[0, -m * 0.3], [m * 0.1, -m * 0.5 - fl * m * 0.5], [m * 0.28, -m * 0.4 - fl * m * 0.3], [m * 0.14, -m * 0.28]]), '#aab0b8', 0.5); }
    else paper(c, ell(-m * 0.05, -m * 0.3, m * 0.2, m * 0.1, 0.1), '#8a929c', 0.4);
    if (!fly) { line(c, [[0, -m * 0.12], [0, 0]], '#c0504a', m * 0.04); }
    c.restore();
  }
  var perch = [[-0.82, 0.62], [-0.55, 0.62], [0.55, 0.62], [0.82, 0.62], [0.2, 1.1]];
  perch.forEach(function (p, i) {
    var u = fr(t / 5200 + i * 0.37), py0 = gy - p[1] * s - s * 0.12, px0 = x + p[0] * s, dir = p[0] < 0 ? -1 : 1;
    if (i === 0 || i === 1) { if (u < 0.5 || i === 0) { if (i === 0 || u < 0.5) pigeon(px0, py0, s * 0.22, false, 0, 1); } if (i === 1 && u >= 0.5) { var v = (u - 0.5) / 0.5; c.save(); c.globalAlpha = Math.min(1, (1 - v) * 3); pigeon(px0 - v * s * 0.8, py0 - v * s * 0.9, s * 0.22, true, t / 60 + i, -1); c.restore(); } return; }
    if (u < 0.12) { c.save(); c.globalAlpha = u / 0.12; pigeon(px0, py0, s * 0.22, false, 0, dir); c.restore(); }
    else if (u < 0.35) pigeon(px0, py0, s * 0.22, false, 0, dir);
    else { var v2 = (u - 0.35) / 0.65; c.save(); c.globalAlpha = Math.min(1, (1 - v2) * 3); pigeon(px0 + dir * v2 * s * 0.9, py0 - v2 * s * 1.0 - Math.sin(v2 * 20) * s * 0.02, s * 0.22, true, t / 60 + i, dir); c.restore(); }
  });
};

var KEYS = ['nam', 'ban', 'na', 'mae', 'tha', 'luk', 'hua', 'ta', 'na-2', 'pa', 'thong', 'khao', 'phra', 'mai', 'fai', 'pak', 'mue', 'chang', 'ngoen', 'ya', 'thang', 'khao-3', 'ruea', 'fa', 'khai', 'lom', 'sai-2', 'kai', 'tha-le', 'din', 'wat', 'bai', 'hu', 'rot', 'nok', 'cha', 'kaeng', 'kha-3', 'khon-2', 'ton', 'hin', 'daeng', 'khao-4', 'dam', 'si', 'saeng', 'sen', 'suan', 'mueang'];
API.keys = KEYS.filter(function (k) { return P[k]; });
API.draw = function (key, c, x, y, s, t) { var f = P[key]; if (!f) return false; c.save(); f(c, x, y, s, t || 0); c.restore(); return true; };
window.MDKHAMHEADS = API;
})();
