/* The Word Garden's little pictures, cut from paper: the garden beds (semantic domains),
   the seed packets (where a word came from), the branch kinds (how a sense grew from another)
   and a few extras for buttons and empty states.

   MDKHAMMARKS.draw(key, c, x, y, s, t)   key drawn in the box x±s, y±s; t in milliseconds; false when unknown
   MDKHAMMARKS.keys                       d:… o:… v:… x:… in order */
(function () {
'use strict';
var D = window.MDDOODLER, SKY = window.MDSKY; if (!SKY || window.MDKHAMMARKS) return;
var K = D ? D.kit : null;
var paper = SKY.paper, circ = SKY.circ, TAU = 6.2832, FONT = '"Noto Sans", "Noto Sans Thai", sans-serif';
var RED = '#7a1f1a', GOLD = '#e8b84a', GREEN = '#2f6b3a', INDIGO = '#1f4a6b', ORANGE = '#c8642a', CREAM = '#fbf3df', LRED = '#d9342b', WOOD = '#8a5a2a', SKIN = '#d9a27a', INK = '#2a1a14';
function lerp(a, b, u) { return a + (b - a) * u; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sm(u) { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); }
function back(u) { u = clamp(u, 0, 1) - 1; return 1 + 2.70158 * u * u * u + 1.70158 * u * u; }
function bump(p, m, w) { return Math.max(0, 1 - Math.abs(p - m) / w); }
function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mixc(a, b, u) { var p = rgb(a), q = rgb(b); return 'rgb(' + Math.round(lerp(p[0], q[0], u)) + ',' + Math.round(lerp(p[1], q[1], u)) + ',' + Math.round(lerp(p[2], q[2], u)) + ')'; }
function poly(pts) { return function (q) { q.beginPath(); pts.forEach(function (p, i) { i ? q.lineTo(p[0], p[1]) : q.moveTo(p[0], p[1]); }); q.closePath(); }; }
function ell(x, y, rx, ry, r) { return function (q) { q.beginPath(); q.ellipse(x, y, Math.abs(rx), Math.abs(ry), r || 0, 0, TAU); }; }
function ball(x, y, r, k) { return function (q) { circ(q, x, y, r, k || 5); }; }
function rect(x, y, w, h) { return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]); }
function line(c, pts, col, w) { c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach(function (p, i) { i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); }); c.stroke(); c.restore(); }
function dot(c, x, y, r, col) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function eye(c, x, y, s) { dot(c, x, y, s, '#fffaf0'); dot(c, x + s * 0.2, y, s * 0.55, '#1b1410'); }
function glint(c, x, y, s, t, k) { var u = (Math.sin(t / 380 + k) + 1) / 2; c.save(); c.globalAlpha = 0.35 + 0.6 * u; c.fillStyle = '#fff6c8'; c.beginPath(); for (var j = 0; j < 8; j++) { var a = j / 8 * TAU, r = j % 2 ? s * 0.25 : s; c.lineTo(x + Math.cos(a) * r * (0.6 + 0.4 * u), y + Math.sin(a) * r * (0.6 + 0.4 * u)); } c.closePath(); c.fill(); c.restore(); }
/* a four-point star that flashes at strength a (0..1) */
function star(c, x, y, r, a, col) { if (a <= 0.02) return; c.save(); c.globalAlpha = Math.min(1, a); c.fillStyle = col || '#fff6c8'; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); c.restore(); }
function halo(c, x, y, r, col, a) { var g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); c.save(); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
function txt(c, str, x, y, px, col, maxW) {
  c.save(); c.font = 'bold ' + Math.round(px) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
  if (maxW) { var w = c.measureText(str).width; if (w > maxW) { px *= maxW / w; c.font = 'bold ' + Math.max(4, Math.round(px)) + 'px ' + FONT; } }
  c.fillText(str, x, y); c.restore();
}
function bg(c, x, y, r, col, lift) { paper(c, ball(x, y, r, 7), col, lift == null ? 0.4 : lift); }
/* a leaf along +x from its stalk, turned by ang */
function leaf(c, x, y, len, wid, ang, col, lift) {
  c.save(); c.translate(x, y); c.rotate(ang);
  paper(c, function (q) { q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(len * 0.45, -wid, len, 0); q.quadraticCurveTo(len * 0.45, wid, 0, 0); q.closePath(); }, col, lift == null ? 0.6 : lift);
  c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(0.8, wid * 0.08); c.beginPath(); c.moveTo(0, 0); c.lineTo(len * 0.85, 0); c.stroke();
  c.restore();
}
/* a cloud: flat belly, three bumps */
function cloud(c, x, y, w, h, col) {
  paper(c, function (q) {
    q.beginPath(); q.moveTo(x - w, y + h * 0.5);
    q.bezierCurveTo(x - w * 1.25, y + h * 0.05, x - w * 0.95, y - h * 0.45, x - w * 0.5, y - h * 0.3);
    q.bezierCurveTo(x - w * 0.5, y - h * 1.0, x + w * 0.25, y - h * 1.15, x + w * 0.4, y - h * 0.4);
    q.bezierCurveTo(x + w * 0.85, y - h * 0.65, x + w * 1.3, y - h * 0.05, x + w * 0.95, y + h * 0.5);
    q.closePath();
  }, col || '#eef2f4', 1);
}
function figure(c, x, gy, h, pose, d) {
  if (K && K.person) return K.person(c, x, gy, h, pose, d);
  var hip = [x, gy - h * 0.47], sh = [x, gy - h * 0.8], sw = Math.sin((pose.legs && pose.legs[0]) || 0);
  line(c, [[x - h * 0.1 - sw * h * 0.2, gy], hip, [x + h * 0.1 + sw * h * 0.2, gy]], d.low || d.col, h * 0.08); line(c, [hip, sh], d.col, h * 0.12);
  line(c, [[x - h * 0.15, gy - h * 0.55], sh, [x + h * 0.15, gy - h * 0.55]], d.col, h * 0.07); dot(c, x, gy - h * 0.92, h * 0.1, d.skin || SKIN);
  return { head: [x, gy - h * 0.92], hand: [[x + h * 0.15, gy - h * 0.55], [x - h * 0.15, gy - h * 0.55]], hip: hip, sh: sh };
}
function pose(lean, seat, legs, arms) { return { lean: lean, seat: seat, legs: legs, arms: arms }; }
/* arm angles [upper, elbow] that put a hand on T, elbow bent away from the line */
function reach(h, P, x, gy, T, dir) {
  var lean = P.lean || 0, seat = P.seat || 0.47, sx = x + dir * Math.sin(lean) * h * 0.33, sy = gy - h * seat - Math.cos(lean) * h * 0.33;
  var a = h * 0.17, b = h * 0.16, dx = T[0] - sx, dy = T[1] - sy, D = Math.sqrt(dx * dx + dy * dy), th = Math.atan2(dx * dir, dy);
  D = clamp(D, h * 0.1, (a + b) * 0.995);
  var al = Math.acos(clamp((a * a + D * D - b * b) / (2 * a * D), -1, 1)), be = Math.acos(clamp((b * b + D * D - a * a) / (2 * b * D), -1, 1)), sg = th >= 0 ? -1 : 1;
  return [th + sg * al, -sg * (al + be)];
}
var R = {};

/* ================================================================ garden beds */
R['d:body'] = function (c, x, y, s, t) {
  var u = sm(0.5 + 0.5 * Math.sin(t / 650)), gy = y + s * 0.92, h = s * 1.55;
  bg(c, x, y + s * 0.02, s * 0.92, '#f0cf8e', 0.3);
  var a1 = lerp(-0.4, 3.0, u), a2 = lerp(-0.4, 3.0, 1 - u);
  paper(c, ell(x, gy + s * 0.02, s * 0.5, s * 0.07), '#b08a50', 0.2);
  var me = figure(c, x, gy, h, pose((u - 0.5) * 0.1, 0.47, [0.07, 0, -0.07, 0], [a1, 0.05, a2, 0.05]), { dir: 1, garb: 'casual', long: true, col: '#2f8f5b', low: '#2c2f45', skin: '#c98b62', hair: 1 });
  var up = u > 0.5 ? me.hand[0] : me.hand[1], dn = u > 0.5 ? me.hand[1] : me.hand[0], k = Math.abs(u - 0.5) * 2;
  for (var j = -1; j <= 1; j++) line(c, [[up[0] + j * s * 0.11, up[1] - s * 0.1], [up[0] + j * s * 0.15, up[1] - s * (0.2 + 0.05 * k)]], 'rgba(200,100,30,' + (0.3 + 0.6 * k) + ')', Math.max(1.2, s * 0.03));
  for (j = -1; j <= 1; j += 2) line(c, [[dn[0] + j * s * 0.1, dn[1] + s * 0.1], [dn[0] + j * s * 0.13, dn[1] + s * 0.2]], 'rgba(200,100,30,' + (0.3 + 0.6 * k) + ')', Math.max(1.2, s * 0.03));
};

function heartPath(x, y, r) { return function (q) { q.beginPath(); q.moveTo(x, y + r * 0.95); q.bezierCurveTo(x - r * 1.45, y + r * 0.15, x - r * 1.0, y - r * 1.0, x, y - r * 0.38); q.bezierCurveTo(x + r * 1.0, y - r * 1.0, x + r * 1.45, y + r * 0.15, x, y + r * 0.95); q.closePath(); }; }
R['d:heart'] = function (c, x, y, s, t) {
  var ph = (t / 1000) % 1, b = bump(ph, 0.06, 0.12) + 0.65 * bump(ph, 0.26, 0.12), r = s * 0.66 * (1 + 0.13 * b);
  halo(c, x, y, s * 1.05, '255,176,70', 0.35 + 0.4 * b);
  c.save(); c.strokeStyle = 'rgba(232,184,74,' + (0.7 * (1 - ph)) + ')'; c.lineWidth = Math.max(1, s * 0.03); c.beginPath(); c.arc(x, y, s * (0.7 + 0.3 * ph), 0, TAU); c.stroke(); c.restore();
  paper(c, heartPath(x, y + s * 0.02, r), '#a8281f', 1.6);
  paper(c, heartPath(x - r * 0.04, y - r * 0.04, r * 0.82), LRED, 0.5);
  c.save(); c.strokeStyle = 'rgba(232,184,74,.9)'; c.lineWidth = Math.max(1, s * 0.025); c.setLineDash([s * 0.07, s * 0.06]); heartPath(x, y + s * 0.02, r * 0.92)(c); c.stroke(); c.restore();
  c.save(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(x - r * 0.5, y - r * 0.3, r * 0.2, r * 0.1, -0.8, 0, TAU); c.fill(); c.restore();
  star(c, x + s * 0.72, y - s * 0.6, s * 0.14, 0.4 + 0.6 * b, '#ffe9a0'); star(c, x - s * 0.78, y + s * 0.45, s * 0.1, 0.8 - 0.6 * b, '#ffe9a0');
};

R['d:kinship'] = function (c, x, y, s, t) {
  var gy = y + s * 0.9, sway = Math.sin(t / 900), ox = sway * s * 0.035, dy = Math.sin(t / 900 + 0.8) * s * 0.012;
  bg(c, x, y + s * 0.05, s * 0.93, '#f4d8a8', 0.3);
  paper(c, ell(x, gy + s * 0.02, s * 0.92, s * 0.07), '#7fae5a', 0.3);
  var P1 = [x - s * 0.28 + ox, gy - s * 0.8 + dy], P2 = [x + s * 0.28 + ox, gy - s * 0.8 - dy];
  var gx = x - s * 0.58 + ox, px = x + ox, cx = x + s * 0.58 + ox, gh = s * 1.12, ph = s * 1.5, ch = s * 1.0;
  var gP = pose(0.12 + sway * 0.03, 0.47, [0.12, 0.05, -0.1, 0.1], [0, 0, 0.12, 0.1]), pP = pose(sway * 0.03, 0.47, [0.06, 0, -0.06, 0], [0, 0, 0, 0]), cP = pose(0.05 - sway * 0.03, 0.47, [0.07, 0, -0.07, 0], [0.15, 0.2, 0, 0]);
  var A = reach(gh, gP, gx, gy, P1, 1); gP.arms[0] = A[0]; gP.arms[1] = A[1];
  A = reach(ph, pP, px, gy, P2, 1); pP.arms[0] = A[0]; pP.arms[1] = A[1];
  A = reach(ph, pP, px, gy, P1, 1); pP.arms[2] = A[0]; pP.arms[3] = A[1];
  A = reach(ch, cP, cx, gy, P2, 1); cP.arms[2] = A[0]; cP.arms[3] = A[1];
  figure(c, gx, gy, gh, gP, { dir: 1, garb: 'sin', col: '#f2e6c9', low: '#2f4a6b', hem: GOLD, sabai: LRED, skin: '#c98b62', hair: 2, hairCol: '#e8e8e8' });
  figure(c, cx, gy, ch, cP, { dir: 1, garb: 'casual', col: '#e5567f', low: '#2f55c9', skin: '#d9a27a', hair: 1 });
  figure(c, px, gy, ph, pP, { dir: 1, garb: 'casual', long: true, col: '#2f8f5b', low: '#2c2f45', skin: '#c98b62', hair: 0 });
  dot(c, P1[0], P1[1], Math.max(1.5, s * 0.04), '#c98b62'); dot(c, P2[0], P2[1], Math.max(1.5, s * 0.04), '#c98b62');
  star(c, x + ox, y - s * 0.78, s * 0.1, 0.5 + 0.5 * Math.sin(t / 500), '#ffe9a0');
};

R['d:water'] = function (c, x, y, s, t) {
  var yT = y - s * 0.12, yB = y + s * 0.88, p = (t / 7000) % 1, lev = p < 0.82 ? sm(p / 0.82) : 1 - sm((p - 0.82) / 0.18);
  var yW = lerp(yB - s * 0.06, yT + s * 0.3, lev);
  function jar(q) { q.beginPath(); q.moveTo(x - s * 0.3, yT); q.bezierCurveTo(x - s * 0.3, yT + s * 0.2, x - s * 0.64, yT + s * 0.25, x - s * 0.64, yT + s * 0.55); q.bezierCurveTo(x - s * 0.64, yT + s * 0.85, x - s * 0.52, yB, x - s * 0.42, yB); q.lineTo(x + s * 0.42, yB); q.bezierCurveTo(x + s * 0.52, yB, x + s * 0.64, yT + s * 0.85, x + s * 0.64, yT + s * 0.55); q.bezierCurveTo(x + s * 0.64, yT + s * 0.25, x + s * 0.3, yT + s * 0.2, x + s * 0.3, yT); q.closePath(); }
  paper(c, jar, '#dcebe6', 1.2);
  c.save(); jar(c); c.clip();
  var g = c.createLinearGradient(0, yW, 0, yB); g.addColorStop(0, '#5aaee0'); g.addColorStop(1, '#2a6fa8'); c.fillStyle = g;
  c.beginPath(); c.moveTo(x - s * 0.8, yB + 4); c.lineTo(x - s * 0.8, yW); for (var j = 0; j <= 16; j++) { var u = j / 16; c.lineTo(x - s * 0.8 + u * s * 1.6, yW + Math.sin(u * 9 - t / 300) * s * 0.018); } c.lineTo(x + s * 0.8, yB + 4); c.closePath(); c.fill();
  c.globalAlpha = 0.35; c.fillStyle = '#fff'; c.fillRect(x - s * 0.5, yT + s * 0.3, s * 0.07, s * 0.5); c.globalAlpha = 1;
  c.restore();
  paper(c, ell(x, yT, s * 0.34, s * 0.07), '#f1f7f4', 0.5); paper(c, ell(x, yT, s * 0.26, s * 0.04), '#8ab4b0', 0);
  c.save(); c.strokeStyle = GOLD; c.lineWidth = Math.max(1, s * 0.035); c.beginPath(); c.moveTo(x - s * 0.61, yT + s * 0.5); c.quadraticCurveTo(x, yT + s * 0.58, x + s * 0.61, yT + s * 0.5); c.stroke(); c.restore();
  cloud(c, x, y - s * 0.7, s * 0.6, s * 0.26, '#e4ecf1');
  var cols = [-0.2, -0.07, 0.07, 0.2, -0.78, 0.8];
  for (j = 0; j < cols.length; j++) {
    var wide = j > 3, u2 = ((t / 900) + j * 0.37) % 1, top = y - s * 0.5, bot = wide ? y + s * 0.86 : yW, yy = lerp(top, bot, u2 * u2);
    if (wide && u2 > 0.96) continue;
    line(c, [[x + cols[j] * s, yy - s * 0.1], [x + cols[j] * s, yy]], '#4b8fc9', Math.max(1.4, s * 0.035));
    if (!wide && u2 > 0.85) { c.save(); c.globalAlpha = (1 - u2) * 5; c.strokeStyle = '#d9efff'; c.lineWidth = Math.max(1, s * 0.02); c.beginPath(); c.ellipse(x + cols[j] * s, yW, (u2 - 0.8) * s * 1.2, (u2 - 0.8) * s * 0.25, 0, 0, TAU); c.stroke(); c.restore(); }
  }
};

R['d:spirit'] = function (c, x, y, s, t) {
  var bob = Math.sin(t / 900) * s * 0.05, fl = 0.8 + 0.2 * Math.sin(t / 120) * Math.sin(t / 170), lx = x + Math.sin(t / 1400) * s * 0.05, ly = y - s * 0.25 + bob;
  bg(c, x, y, s * 0.93, '#27386a', 0.3);
  for (var j = 0; j < 6; j++) star(c, x + Math.cos(j * 2.4 + 1) * s * 0.7, y + Math.sin(j * 2.4 + 1) * s * 0.6 - s * 0.1, s * (0.05 + (j % 3) * 0.02), 0.3 + 0.6 * Math.abs(Math.sin(t / 700 + j * 1.7)), '#ffe9a0');
  halo(c, lx, ly, s * 1.0, '255,190,90', 0.55 * fl);
  var w = s * 0.5, h = s * 0.72;
  function body(q) { q.beginPath(); q.moveTo(lx - w * 0.2, ly - h * 0.5); q.bezierCurveTo(lx - w * 1.1, ly - h * 0.45, lx - w * 1.1, ly + h * 0.3, lx - w * 0.6, ly + h * 0.5); q.lineTo(lx + w * 0.6, ly + h * 0.5); q.bezierCurveTo(lx + w * 1.1, ly + h * 0.3, lx + w * 1.1, ly - h * 0.45, lx + w * 0.2, ly - h * 0.5); q.closePath(); }
  paper(c, body, '#d8802a', 1.4);
  c.save(); body(c); c.clip(); var g = c.createRadialGradient(lx, ly + h * 0.15, 0, lx, ly + h * 0.15, w * 1.2); g.addColorStop(0, 'rgba(255,248,190,' + fl + ')'); g.addColorStop(1, 'rgba(255,200,90,0)'); c.fillStyle = g; c.fillRect(lx - w * 1.2, ly - h * 0.5, w * 2.4, h);
  c.strokeStyle = 'rgba(122,31,26,.7)'; c.lineWidth = Math.max(1, s * 0.025); [-0.55, -0.2, 0.2, 0.55].forEach(function (f) { c.beginPath(); c.moveTo(lx + f * w * 0.3, ly - h * 0.5); c.quadraticCurveTo(lx + f * w * 1.3, ly, lx + f * w * 0.75, ly + h * 0.5); c.stroke(); });
  c.restore();
  paper(c, poly([[lx - w * 0.28, ly - h * 0.5], [lx + w * 0.28, ly - h * 0.5], [lx + w * 0.16, ly - h * 0.63], [lx - w * 0.16, ly - h * 0.63]]), GOLD, 0.6);
  dot(c, lx, ly - h * 0.68, s * 0.04, GOLD);
  paper(c, rect(lx - w * 0.66, ly + h * 0.5, w * 1.32, s * 0.07), RED, 0.6);
  c.save(); c.fillStyle = 'rgba(255,255,230,' + fl + ')'; c.beginPath(); c.moveTo(lx, ly + h * 0.1 + (1 - fl) * 2); c.quadraticCurveTo(lx + w * 0.22, ly + h * 0.3, lx, ly + h * 0.42); c.quadraticCurveTo(lx - w * 0.22, ly + h * 0.3, lx, ly + h * 0.1); c.fill(); c.restore();
  var tx = lx, ty = ly + h * 0.5 + s * 0.07;
  c.save(); c.strokeStyle = CREAM; c.lineWidth = Math.max(1.2, s * 0.04); c.lineCap = 'round'; c.shadowColor = 'rgba(255,220,140,.8)'; c.shadowBlur = 4; c.beginPath();
  for (j = 0; j <= 20; j++) { var u = j / 20; c.lineTo(tx + Math.sin(u * 7 - t / 380) * s * 0.13 * u, ty + u * s * 0.62); } c.stroke(); c.restore();
  var ex = tx + Math.sin(7 - t / 380) * s * 0.13, ey = ty + s * 0.62; dot(c, ex, ey, s * 0.045, GOLD); star(c, ex, ey, s * 0.13, 0.5 + 0.5 * Math.sin(t / 300), '#fff6c8');
};

R['d:religion'] = function (c, x, y, s, t) {
  var gy = y + s * 0.9, W = '#f6f1e6', SH = 'rgba(80,60,40,.18)', fl = 0.85 + 0.15 * Math.sin(t / 110) * Math.sin(t / 157);
  paper(c, ball(x, y - s * 0.2, s * 0.62, 4), '#f3d58a', 0.2);
  paper(c, rect(x - s * 0.52, gy - s * 0.14, s * 1.04, s * 0.14), W, 0.8);
  paper(c, rect(x - s * 0.42, gy - s * 0.27, s * 0.84, s * 0.13), W, 0.8);
  paper(c, rect(x - s * 0.32, gy - s * 0.39, s * 0.64, s * 0.12), W, 0.8);
  c.fillStyle = GOLD; c.fillRect(x - s * 0.52, gy - s * 0.15, s * 1.04, s * 0.025); c.fillRect(x - s * 0.42, gy - s * 0.28, s * 0.84, s * 0.02); c.fillRect(x - s * 0.32, gy - s * 0.4, s * 0.64, s * 0.02);
  var b = gy - s * 0.39;
  function bell(q) { q.beginPath(); q.moveTo(x - s * 0.3, b); q.bezierCurveTo(x - s * 0.3, b - s * 0.32, x - s * 0.13, b - s * 0.5, x - s * 0.07, b - s * 0.72); q.lineTo(x + s * 0.07, b - s * 0.72); q.bezierCurveTo(x + s * 0.13, b - s * 0.5, x + s * 0.3, b - s * 0.32, x + s * 0.3, b); q.closePath(); }
  paper(c, bell, W, 1);
  c.save(); bell(c); c.clip(); c.fillStyle = SH; c.fillRect(x + s * 0.08, b - s * 0.8, s * 0.3, s * 0.85); c.restore();
  for (var j = 0; j < 5; j++) { var rw = s * (0.11 - j * 0.015), ry = b - s * (0.74 + j * 0.065); paper(c, rect(x - rw, ry - s * 0.055, rw * 2, s * 0.055), j % 2 ? GOLD : W, 0.5); }
  paper(c, poly([[x - s * 0.04, b - s * 1.05], [x + s * 0.04, b - s * 1.05], [x, b - s * 1.4]]), GOLD, 0.6);
  dot(c, x, b - s * 1.43, s * 0.04, GOLD); star(c, x, b - s * 1.43, s * 0.16, 0.4 + 0.6 * Math.max(0, Math.sin(t / 600)), '#fff6c8');
  var cx = x - s * 0.72, cb = gy + s * 0.02;
  halo(c, cx, cb - s * 0.56, s * 0.42, '255,200,90', 0.5 * fl);
  paper(c, rect(cx - s * 0.06, cb - s * 0.42, s * 0.12, s * 0.42), '#f7ecd0', 0.8);
  line(c, [[cx, cb - s * 0.42], [cx, cb - s * 0.47]], '#3a2a1a', Math.max(1, s * 0.015));
  c.save(); c.fillStyle = '#ffb02e'; c.beginPath(); c.moveTo(cx + (fl - 0.85) * s * 0.3, cb - s * 0.72); c.quadraticCurveTo(cx + s * 0.1, cb - s * 0.56, cx, cb - s * 0.46); c.quadraticCurveTo(cx - s * 0.1, cb - s * 0.56, cx + (fl - 0.85) * s * 0.3, cb - s * 0.72); c.fill();
  c.fillStyle = '#fff6c8'; c.beginPath(); c.ellipse(cx, cb - s * 0.54, s * 0.03, s * 0.06, 0, 0, TAU); c.fill(); c.restore();
};

R['d:food'] = function (c, x, y, s, t) {
  var by = y + s * 0.12, bw = s * 0.52;
  bg(c, x, y + s * 0.02, s * 0.93, '#f4dba6', 0.3);
  function utensil(sx, ang, kind) {
    c.save(); c.translate(sx, y + s * 0.78); c.rotate(ang);
    paper(c, poly([[-s * 0.035, 0], [s * 0.035, 0], [s * 0.05, -s * 0.8], [-s * 0.05, -s * 0.8]]), '#cfd6dc', 0.7);
    if (kind === 'spoon') paper(c, ell(0, -s * 1.0, s * 0.14, s * 0.22), '#dfe5ea', 0.7);
    else { paper(c, poly([[-s * 0.13, -s * 0.82], [s * 0.13, -s * 0.82], [s * 0.13, -s * 1.1], [s * 0.09, -s * 1.1], [s * 0.09, -s * 0.94], [s * 0.03, -s * 0.94], [s * 0.03, -s * 1.1], [-s * 0.03, -s * 1.1], [-s * 0.03, -s * 0.94], [-s * 0.09, -s * 0.94], [-s * 0.09, -s * 1.1], [-s * 0.13, -s * 1.1]]), '#dfe5ea', 0.7); }
    c.restore();
  }
  utensil(x - s * 0.78, -0.1, 'fork'); utensil(x + s * 0.78, 0.1 + Math.sin(t / 700) * 0.02, 'spoon');
  c.save(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = Math.max(1.3, s * 0.045); c.lineCap = 'round';
  for (var j = 0; j < 3; j++) { var u = (t / 2400 + j / 3) % 1; c.globalAlpha = Math.sin(u * Math.PI) * 0.9; c.beginPath(); for (var k = 0; k <= 10; k++) { var v = k / 10; c.lineTo(x + (j - 1) * s * 0.26 + Math.sin(v * 5 + t / 420 + j * 1.5) * s * 0.07, by - s * 0.32 - u * s * 0.3 - v * s * 0.35); } c.stroke(); }
  c.restore();
  paper(c, function (q) { q.beginPath(); q.moveTo(x - bw * 0.82, by - s * 0.02); q.bezierCurveTo(x - bw * 0.75, by - s * 0.5, x + bw * 0.75, by - s * 0.5, x + bw * 0.82, by - s * 0.02); q.closePath(); }, '#fffdf4', 1);
  c.fillStyle = '#d8d2bd'; for (j = 0; j < 14; j++) { var gx = x + Math.cos(j * 2.1) * bw * 0.55, gyy = by - s * (0.12 + 0.2 * Math.abs(Math.sin(j * 1.7))); c.beginPath(); c.ellipse(gx, gyy, s * 0.035, s * 0.015, j, 0, TAU); c.fill(); }
  paper(c, function (q) { q.beginPath(); q.moveTo(x - bw, by - s * 0.02); q.lineTo(x + bw, by - s * 0.02); q.bezierCurveTo(x + bw, by + s * 0.45, x + bw * 0.45, by + s * 0.62, x, by + s * 0.62); q.bezierCurveTo(x - bw * 0.45, by + s * 0.62, x - bw, by + s * 0.45, x - bw, by - s * 0.02); q.closePath(); }, '#f6efdd', 1.4);
  paper(c, rect(x - bw * 0.42, by + s * 0.6, bw * 0.84, s * 0.1), '#e6dcc2', 0.8);
  c.save(); c.beginPath(); c.moveTo(x - bw, by - s * 0.02); c.lineTo(x + bw, by - s * 0.02); c.bezierCurveTo(x + bw, by + s * 0.45, x + bw * 0.45, by + s * 0.62, x, by + s * 0.62); c.bezierCurveTo(x - bw * 0.45, by + s * 0.62, x - bw, by + s * 0.45, x - bw, by - s * 0.02); c.clip();
  c.fillStyle = INDIGO; c.fillRect(x - bw, by + s * 0.03, bw * 2, s * 0.07); c.fillStyle = LRED; for (j = -3; j <= 3; j++) { c.beginPath(); c.arc(x + j * bw * 0.28, by + s * 0.3, s * 0.045, 0, TAU); c.fill(); c.beginPath(); c.arc(x + j * bw * 0.28 + bw * 0.14, by + s * 0.42, s * 0.03, 0, TAU); c.fillStyle = INDIGO; c.fill(); c.fillStyle = LRED; }
  c.restore();
  paper(c, ell(x, by - s * 0.02, bw, s * 0.06), '#fffdf4', 0.3);
};

R['d:money'] = function (c, x, y, s, t) {
  var T = 11, prog = (t / 480) % T, fade = prog > 10 ? 1 - (prog - 10) : 1, gy = y + s * 0.86, hh = s * 0.13, ry = s * 0.075;
  bg(c, x, y, s * 0.93, '#f0dcae', 0.3);
  paper(c, ell(x, gy + s * 0.04, s * 0.95, s * 0.1), '#8a3a2a', 0.5);
  function stack(cx, w, n, cap, rate) {
    var cnt = Math.max(n, Math.min(cap, Math.floor(prog * rate))), part = prog * rate - Math.floor(prog * rate);
    for (var i = 0; i < Math.min(cnt + 1, cap); i++) {
      var sc = i < cnt ? 1 : back(part); if (sc <= 0.01) continue;
      var by = gy - i * hh * 0.82, cy = by - hh * 0.5 * (1 - sc) * 0;
      c.save(); c.globalAlpha = fade; c.translate(cx, by); c.scale(1, 1); c.translate(0, hh * (1 - sc) * 0.5); c.scale(sc, sc);
      paper(c, function (q) { q.beginPath(); q.moveTo(-w, -hh); q.lineTo(-w, 0); q.ellipse(0, 0, w, ry, 0, Math.PI, 0, true); q.lineTo(w, -hh); q.ellipse(0, -hh, w, ry, 0, 0, Math.PI, true); q.closePath(); }, i % 2 ? '#d9a02e' : GOLD, 0.6);
      c.strokeStyle = 'rgba(122,31,26,.35)'; c.lineWidth = Math.max(0.8, s * 0.012); for (var k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * w * 0.4, ry * 0.7); c.lineTo(k * w * 0.4, ry * 0.7 + hh * 0.5 * (1 - Math.abs(k) * 0.1)); c.stroke(); }
      if (i === Math.min(cnt, cap - 1) || i === cap - 1) { paper(c, ell(0, -hh, w, ry), '#f3cd62', 0.2); c.strokeStyle = 'rgba(122,31,26,.5)'; c.beginPath(); c.ellipse(0, -hh, w * 0.7, ry * 0.7, 0, 0, TAU); c.stroke(); }
      c.restore();
    }
    return cnt;
  }
  stack(x - s * 0.62, s * 0.24, 2, 3, 0.6); stack(x + s * 0.64, s * 0.22, 2, 4, 0.75);
  stack(x, s * 0.3, 3, 7, 1);
  if (prog > 7.4 && prog < 10) { var tp = gy - 6 * hh * 0.82 - hh; star(c, x - s * 0.1, tp - s * 0.12, s * 0.16, Math.sin((prog - 7.4) / 2.6 * Math.PI), '#fff6c8'); star(c, x + s * 0.2, tp - s * 0.3, s * 0.1, Math.sin((prog - 7.4) / 2.6 * Math.PI + 0.8), '#fff6c8'); }
};

R['d:settlement'] = function (c, x, y, s, t) {
  bg(c, x, y, s * 0.93, '#cfe6ee', 0.3);
  var sun = ball(x + s * 0.55, y - s * 0.55, s * 0.17, 3); paper(c, sun, GOLD, 0.3);
  c.save(); c.beginPath(); c.arc(x, y, s * 0.93, 0, TAU); c.clip();
  paper(c, ell(x + s * 0.1, y + s * 0.95, s * 1.0, s * 0.8), '#4f8a52', 0.6);
  paper(c, ell(x - s * 0.5, y + s * 1.0, s * 0.7, s * 0.45), '#6aa05a', 0.6);
  function house(cx, by, w, h, roof, wall, k) {
    var fl = by - h * 0.2, wt = fl - h * 0.5;
    [-0.38, 0, 0.38].forEach(function (f) { line(c, [[cx + f * w, fl], [cx + f * w, by]], '#5a3a1a', Math.max(1.2, w * 0.06)); });
    paper(c, rect(cx - w * 0.5, wt, w, h * 0.5), wall, 0.8);
    paper(c, poly([[cx - w * 0.7, wt + h * 0.02], [cx + w * 0.7, wt + h * 0.02], [cx + w * 0.34, wt - h * 0.34], [cx - w * 0.34, wt - h * 0.34]]), roof, 1);
    line(c, [[cx - w * 0.1, wt - h * 0.34], [cx + w * 0.1, wt - h * 0.46]], '#3a2a1a', Math.max(1, w * 0.04)); line(c, [[cx + w * 0.1, wt - h * 0.34], [cx - w * 0.1, wt - h * 0.46]], '#3a2a1a', Math.max(1, w * 0.04));
    var lit = 0.75 + 0.25 * Math.sin(t / 230 + k * 2);
    c.fillStyle = 'rgba(255,205,90,' + lit + ')'; c.fillRect(cx - w * 0.3, wt + h * 0.1, w * 0.22, h * 0.2); c.fillStyle = '#4a2a1a'; c.fillRect(cx + w * 0.1, wt + h * 0.12, w * 0.2, h * 0.38);
    return [cx, wt - h * 0.34];
  }
  var tp = house(x + s * 0.02, y + s * 0.2, s * 0.44, s * 0.55, '#7a1f1a', '#d9b27a', 1);
  c.save(); c.strokeStyle = 'rgba(240,240,240,.8)'; c.lineWidth = Math.max(1.3, s * 0.045); c.lineCap = 'round';
  for (var j = 0; j < 2; j++) { var u = (t / 3000 + j / 2) % 1; c.globalAlpha = Math.sin(u * Math.PI) * 0.8; c.beginPath(); for (var k = 0; k <= 6; k++) { var v = k / 6; c.lineTo(x - s * 0.17 + Math.sin(v * 4 + t / 500) * s * 0.05, y - s * 0.12 - u * s * 0.35 - v * s * 0.2); } c.stroke(); }
  c.restore();
  var N = 40, a = [], b = [];
  for (j = 0; j <= N; j++) { var v2 = j / N, py = lerp(y + s * 0.98, y + s * 0.3, v2), cx2 = x + s * 0.05 + Math.sin(v2 * 3.2 + 0.6) * s * 0.3 * (1 - v2 * 0.4) - s * 0.08, hw = lerp(s * 0.2, s * 0.03, v2); a.push([cx2 - hw, py]); b.unshift([cx2 + hw, py]); }
  paper(c, poly(a.concat(b)), '#ead9a8', 0.5);
  c.restore();
  house(x - s * 0.66, y + s * 0.62, s * 0.5, s * 0.64, '#5a3a1a', '#e2c690', 2);
  house(x + s * 0.62, y + s * 0.55, s * 0.46, s * 0.58, '#7a1f1a', '#d9b27a', 3);
  var bx = x - s * 0.9 + ((t / 5200) % 1) * s * 1.8, by = y - s * 0.7 + Math.sin(t / 400) * s * 0.03, w2 = Math.sin(t / 110) * s * 0.04;
  line(c, [[bx - s * 0.08, by - s * 0.03 + w2], [bx, by], [bx + s * 0.08, by - s * 0.03 + w2]], '#3a2a2a', Math.max(1, s * 0.025));
};

R['d:time'] = function (c, x, y, s, t) {
  var hy = y + s * 0.38, orr = s * 0.68, a = t / 2600 + 0.5, R0 = s * 0.92, hgt = Math.sin(a), u = sm(clamp(0.5 + hgt * 1.3, 0, 1));
  paper(c, ball(x, y, R0 + 2, 7), '#e8b84a', 0.5);
  c.save(); c.beginPath(); c.arc(x, y, R0, 0, TAU); c.clip();
  var sky = mixc('#1b2455', '#86c3ea', u); c.fillStyle = sky; c.fillRect(x - R0, y - R0, R0 * 2, R0 * 2);
  if (Math.abs(hgt) < 0.45) halo(c, x, hy, s * 1.2, '255,150,70', 0.55 * (1 - Math.abs(hgt) / 0.45));
  for (var j = 0; j < 7; j++) star(c, x + Math.cos(j * 2.3) * s * 0.7, y - s * 0.15 + Math.sin(j * 3.1) * s * 0.4, s * 0.06, (1 - u) * (0.4 + 0.5 * Math.abs(Math.sin(t / 500 + j))), '#fff6c8');
  c.setLineDash([s * 0.04, s * 0.06]); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = Math.max(1, s * 0.018); c.beginPath(); c.arc(x, hy, orr, Math.PI, TAU); c.stroke(); c.setLineDash([]);
  var sx = x - Math.cos(a) * orr, sy = hy - Math.sin(a) * orr, mx = x + Math.cos(a) * orr, my = hy + Math.sin(a) * orr;
  if (sy < hy + s * 0.3) {
    halo(c, sx, sy, s * 0.6, '255,210,90', 0.5);
    c.save(); c.translate(sx, sy); c.rotate(t / 3000); c.fillStyle = '#f4b83a'; for (j = 0; j < 12; j++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(s * 0.2, -s * 0.045); c.lineTo(s * 0.34, 0); c.lineTo(s * 0.2, s * 0.045); c.fill(); } c.restore();
    paper(c, ball(sx, sy, s * 0.2, 4), '#f6c445', 0.8);
  }
  if (my < hy + s * 0.3) {
    halo(c, mx, my, s * 0.5, '230,230,255', 0.3);
    paper(c, ball(mx, my, s * 0.19, 6), '#f4efe0', 0.8);
    c.fillStyle = sky; c.beginPath(); c.arc(mx + s * 0.1, my - s * 0.06, s * 0.17, 0, TAU); c.fill();
  }
  paper(c, function (q) { q.beginPath(); q.moveTo(x - R0, hy + s * 0.06); for (var k = 0; k <= 12; k++) q.lineTo(x - R0 + k / 12 * R0 * 2, hy + s * 0.06 - Math.abs(Math.sin(k * 1.7)) * s * 0.06); q.lineTo(x + R0, y + R0); q.lineTo(x - R0, y + R0); q.closePath(); }, '#2f6b3a', 1);
  paper(c, poly([[x - s * 0.45, hy + s * 0.04], [x - s * 0.35, hy - s * 0.16], [x - s * 0.25, hy + s * 0.04]]), '#1f4a2a', 0.5);
  paper(c, poly([[x + s * 0.3, hy + s * 0.05], [x + s * 0.38, hy - s * 0.1], [x + s * 0.48, hy + s * 0.05]]), '#1f4a2a', 0.5);
  c.restore();
};

R['d:colour'] = function (c, x, y, s, t) {
  var cols = ['#d9342b', '#f0b52e', '#2f7fc0', '#3f9a52'], r = s * 0.5, a0 = t / 2300;
  c.save();
  for (var i = 0; i < 4; i++) {
    var a = a0 * (i % 2 ? -1 : 1) + i * TAU / 4, o = s * (0.3 + 0.08 * Math.sin(t / 900 + i)), cx = x + Math.cos(a) * o, cy = y + Math.sin(a) * o;
    c.globalAlpha = 0.74; paper(c, ball(cx, cy, r * (1 + 0.06 * Math.sin(t / 700 + i * 2)), 3 + i), cols[i], 0.7);
  }
  c.restore();
  star(c, x + s * 0.7, y - s * 0.72, s * 0.12, 0.4 + 0.6 * Math.abs(Math.sin(t / 600)), '#fff6c8');
};

R['d:motion'] = function (c, x, y, s, t) {
  var p = t / 190, sn = Math.sin(p), gy = y + s * 0.86, h = s * 1.5;
  bg(c, x, y, s * 0.93, '#c6e0ea', 0.3);
  paper(c, rect(x - s * 0.96, gy, s * 1.92, s * 0.1), '#b98a54', 0.4);
  c.save(); c.strokeStyle = 'rgba(80,50,20,.6)'; c.lineWidth = Math.max(1.2, s * 0.03); c.lineCap = 'round';
  for (var j = 0; j < 5; j++) { var gx = x + s * 0.9 - (((t / 600) + j * 0.4) % 2) * s * 0.9; if (gx > x - s * 0.85) { c.beginPath(); c.moveTo(gx, gy + s * 0.05); c.lineTo(gx - s * 0.12, gy + s * 0.05); c.stroke(); } }
  for (j = 0; j < 3; j++) { var u = ((t / 500) + j / 3) % 1; c.globalAlpha = (1 - u) * 0.6; c.fillStyle = '#fff'; c.beginPath(); c.arc(x - s * 0.35 - u * s * 0.5, gy - s * 0.05 - u * s * 0.15, s * (0.05 + u * 0.08), 0, TAU); c.fill(); }
  c.globalAlpha = 1; c.strokeStyle = 'rgba(255,255,255,.9)'; for (j = 0; j < 3; j++) { var u2 = ((t / 380) + j * 0.33) % 1; c.globalAlpha = Math.sin(u2 * Math.PI); c.beginPath(); c.moveTo(x - s * 0.5 - u2 * s * 0.3, y - s * (0.1 + j * 0.25)); c.lineTo(x - s * 0.8 - u2 * s * 0.3, y - s * (0.1 + j * 0.25)); c.stroke(); }
  c.restore();
  var k1 = 1, lg = [sn * 0.7, -(0.5 + 0.9 * Math.max(0, -Math.cos(p))), -sn * 0.7, -(0.5 + 0.9 * Math.max(0, Math.cos(p)))], ar = [-sn * 0.9, 1.5, sn * 0.9, 1.5];
  figure(c, x, gy - s * 0.02, h, { lean: 0.22, seat: 0.47, lift: Math.abs(Math.cos(p)) * 0.04, legs: lg, arms: ar }, { dir: 1, garb: 'casual', col: '#e5567f', low: '#2f55c9', skin: '#c98b62', hair: 1 });
};

R['d:speech'] = function (c, x, y, s, t) {
  var pu = 1 + 0.06 * Math.sin(t / 260), w = s * 0.7, hh = s * 0.5, r = s * 0.2;
  bg(c, x, y, s * 0.93, '#f2d79c', 0.3);
  c.save(); c.translate(x + s * 0.5, y - s * 0.62); c.rotate(0.15 + Math.sin(t / 700) * 0.03);
  paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.28, -s * 0.18); q.lineTo(s * 0.28, -s * 0.18); q.lineTo(s * 0.28, s * 0.14); q.lineTo(s * 0.12, s * 0.14); q.lineTo(s * 0.18, s * 0.28); q.lineTo(-s * 0.04, s * 0.14); q.lineTo(-s * 0.28, s * 0.14); q.closePath(); }, INDIGO, 0.8);
  for (var j = -1; j <= 1; j++) dot(c, j * s * 0.13, -s * 0.02, s * 0.035 * (0.7 + 0.5 * Math.max(0, Math.sin(t / 300 - j * 0.9))), CREAM);
  c.restore();
  c.save(); c.translate(x - s * 0.05, y + s * 0.05); c.scale(pu, pu);
  paper(c, function (q) { q.beginPath(); q.moveTo(-w + r, -hh); q.lineTo(w - r, -hh); q.quadraticCurveTo(w, -hh, w, -hh + r); q.lineTo(w, hh - r); q.quadraticCurveTo(w, hh, w - r, hh); q.lineTo(-w * 0.05, hh); q.lineTo(-w * 0.55, hh + s * 0.38); q.lineTo(-w * 0.45, hh); q.lineTo(-w + r, hh); q.quadraticCurveTo(-w, hh, -w, hh - r); q.lineTo(-w, -hh + r); q.quadraticCurveTo(-w, -hh, -w + r, -hh); q.closePath(); }, CREAM, 1.4);
  c.strokeStyle = GOLD; c.lineWidth = Math.max(1.2, s * 0.03); c.setLineDash([s * 0.08, s * 0.05]); c.strokeRect(-w + s * 0.1, -hh + s * 0.1, w * 2 - s * 0.2, hh * 2 - s * 0.2); c.setLineDash([]);
  txt(c, 'ก', 0, s * 0.03, s * 0.78, RED);
  c.restore();
};

R['d:medicine'] = function (c, x, y, s, t) {
  var sw = Math.sin(t / 1100) * 0.05;
  bg(c, x, y, s * 0.93, '#dcebc4', 0.3);
  c.save(); c.translate(x - s * 0.52, y + s * 0.88); c.rotate(sw);
  var pts = []; for (var j = 0; j <= 12; j++) { var v = j / 12; pts.push([Math.sin(v * 3) * s * 0.07, -v * s * 1.65]); }
  line(c, pts, '#2f6b3a', Math.max(1.6, s * 0.05));
  [0.25, 0.4, 0.55, 0.7, 0.85].forEach(function (f, i) { var p = pts[Math.round(f * 12)], L = s * (0.4 - f * 0.18); leaf(c, p[0], p[1], L, L * 0.34, -0.7 - sw * 2 + Math.sin(t / 700 + i) * 0.06, '#4f9a4a', 0.5); leaf(c, p[0], p[1], L, L * 0.34, -Math.PI + 0.7 - sw * 2 - Math.sin(t / 700 + i) * 0.06, '#3f8a42', 0.5); });
  var tp = pts[12]; for (j = 0; j < 5; j++) { var a = j / 5 * TAU; dot(c, tp[0] + Math.cos(a) * s * 0.06, tp[1] - s * 0.04 + Math.sin(a) * s * 0.06, s * 0.05, '#fffdf4'); } dot(c, tp[0], tp[1] - s * 0.04, s * 0.04, GOLD);
  c.restore();
  var mx = x + s * 0.3, my = y + s * 0.55, g = Math.sin(t / 330), gc = Math.cos(t / 330);
  paper(c, function (q) { q.beginPath(); q.moveTo(mx - s * 0.52, my - s * 0.28); q.bezierCurveTo(mx - s * 0.5, my + s * 0.1, mx - s * 0.5, my + s * 0.25, mx - s * 0.28, my + s * 0.3); q.lineTo(mx + s * 0.28, my + s * 0.3); q.bezierCurveTo(mx + s * 0.5, my + s * 0.25, mx + s * 0.5, my + s * 0.1, mx + s * 0.52, my - s * 0.28); q.closePath(); }, '#7d7468', 1.2);
  paper(c, rect(mx - s * 0.3, my + s * 0.3, s * 0.6, s * 0.1), '#5d564c', 0.8);
  paper(c, ell(mx, my - s * 0.28, s * 0.52, s * 0.14), '#938a7c', 0.6); paper(c, ell(mx, my - s * 0.27, s * 0.42, s * 0.1), '#4a443c', 0);
  c.fillStyle = '#6aa33c'; for (j = 0; j < 7; j++) { c.beginPath(); c.ellipse(mx + Math.cos(j * 1.9) * s * 0.28, my - s * 0.26 + Math.sin(j * 2.7) * s * 0.04, s * 0.04, s * 0.02, j, 0, TAU); c.fill(); }
  var bx = mx + gc * s * 0.1, by = my - s * 0.27 + g * s * 0.03, tx = bx + s * 0.34 - gc * s * 0.08, ty = my - s * 0.98;
  c.save(); c.lineCap = 'round'; c.strokeStyle = '#e8dcc0'; c.lineWidth = Math.max(2.5, s * 0.1); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 3; c.shadowOffsetY = 2; c.beginPath(); c.moveTo(bx, by); c.lineTo(tx, ty); c.stroke(); c.restore();
  dot(c, tx, ty, s * 0.07, '#e8dcc0');
};

R['d:plant'] = function (c, x, y, s, t) {
  var gr = sm(0.5 + 0.5 * Math.sin(t / 1700)), sway = Math.sin(t / 1200) * s * 0.03, base = y + s * 0.72, tpx = x + sway, tpy = base - lerp(s * 0.85, s * 1.1, gr);
  bg(c, x, y, s * 0.93, '#e3efc8', 0.3);
  paper(c, ell(x, y + s * 0.82, s * 0.78, s * 0.2), '#6a4a2a', 0.8);
  c.fillStyle = '#4a3220'; for (var j = 0; j < 6; j++) { c.beginPath(); c.ellipse(x + (j - 2.5) * s * 0.24, y + s * 0.84 + (j % 2) * s * 0.04, s * 0.05, s * 0.025, 0, 0, TAU); c.fill(); }
  c.save(); c.strokeStyle = '#3f8a3a'; c.lineWidth = Math.max(2, s * 0.07); c.lineCap = 'round'; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 3; c.shadowOffsetX = 1.5; c.shadowOffsetY = 2; c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x - s * 0.02, (base + tpy) / 2, tpx, tpy); c.stroke(); c.restore();
  var open = lerp(-1.5, -0.4, gr), L = s * lerp(0.5, 0.72, gr), wd = L * 0.36;
  leaf(c, tpx, tpy, L, wd, open, '#5fae4c', 0.9); leaf(c, tpx, tpy, L, wd, -Math.PI - open, '#4f9a44', 0.9);
  var lo = lerp(-0.9, -0.2, gr); leaf(c, x - s * 0.01, base - s * 0.35, s * 0.3, s * 0.1, lo - 0.3, '#7fc05a', 0.6);
  paper(c, ell(x + s * 0.02, base + s * 0.03, s * 0.12, s * 0.06, 0.3), '#9c6a3a', 0.5);
  var dr = (t / 2400) % 1; if (dr < 0.7) { c.save(); c.globalAlpha = Math.sin(dr / 0.7 * Math.PI); dot(c, x + s * 0.55, y - s * 0.65 + dr * s * 0.5, s * 0.05, '#4b8fc9'); c.restore(); }
  star(c, tpx + L * 0.8, tpy - L * 0.5, s * 0.1, 0.3 + 0.6 * gr, '#fff6c8');
};

R['d:animal'] = function (c, x, y, s, t) {
  var gy = y + s * 0.85, ph = t / 520, bob = Math.sin(ph * 2) * s * 0.012, ox = -s * 0.08, bx = x + ox, by = y + s * 0.08 + bob, col = '#4e3f4a', dk = '#3a2e38';
  bg(c, x, y, s * 0.93, '#f1d9a6', 0.3);
  paper(c, rect(x - s * 0.96, gy - s * 0.02, s * 1.92, s * 0.12), '#6a9e4a', 0.4);
  c.fillStyle = '#4a7e36'; for (var j = 0; j < 7; j++) { var gx = x + s * 0.95 - (((t / 2800) + j / 7) % 1) * s * 2; if (gx > x - s * 0.9 && gx < x + s * 0.9) { c.beginPath(); c.moveTo(gx - s * 0.05, gy); c.lineTo(gx, gy - s * 0.12); c.lineTo(gx + s * 0.05, gy); c.fill(); } }
  [[-0.5, 0], [-0.38, 2.4], [0.3, 1.2], [0.42, 3.6]].forEach(function (l, i) {
    var q = ph + l[1], fx = bx + s * l[0] + Math.sin(q) * s * 0.13, fy = gy - Math.max(0, Math.cos(q)) * s * 0.1, hx = bx + s * l[0], hy = by + s * 0.2, kx = (hx + fx) / 2 + s * 0.03, ky = (hy + fy) / 2;
    line(c, [[hx, hy], [kx, ky], [fx, fy]], i % 2 ? dk : col, s * 0.12); line(c, [[fx, fy - s * 0.02], [fx + s * 0.01, fy]], '#2a2028', s * 0.13);
  });
  var tw = Math.sin(ph * 1.3) * s * 0.1; line(c, [[bx - s * 0.64, by - s * 0.1], [bx - s * 0.8 + tw * 0.4, by + s * 0.1], [bx - s * 0.78 + tw, by + s * 0.4]], dk, s * 0.045); dot(c, bx - s * 0.78 + tw, by + s * 0.42, s * 0.05, '#2a2028');
  paper(c, ell(bx, by, s * 0.7, s * 0.34), col, 1.4);
  paper(c, ell(bx - s * 0.12, by - s * 0.02, s * 0.4, s * 0.2, -0.1), '#5d4c5a', 0.4);
  var hx = bx + s * 0.8, hy = by + s * 0.2 + Math.sin(ph) * s * 0.01;
  paper(c, poly([[bx + s * 0.4, by - s * 0.3], [bx + s * 0.78, by - s * 0.05], [hx + s * 0.05, hy + s * 0.08], [bx + s * 0.45, by + s * 0.28]]), col, 1);
  paper(c, ell(hx + s * 0.08, hy + s * 0.04, s * 0.2, s * 0.14, 0.6), dk, 1.2);
  paper(c, ell(hx + s * 0.22, hy + s * 0.12, s * 0.1, s * 0.08, 0.6), '#7a6a72', 0.5);
  paper(c, function (q) { q.beginPath(); q.moveTo(hx - s * 0.06, hy - s * 0.06); q.quadraticCurveTo(hx - s * 0.4, hy - s * 0.02, hx - s * 0.45, hy - s * 0.3); q.quadraticCurveTo(hx - s * 0.25, hy - s * 0.14, hx + s * 0.02, hy - s * 0.12); q.closePath(); }, '#ece5d0', 0.6);
  eye(c, hx + s * 0.1, hy - s * 0.04, s * 0.03);
  var ex = bx - s * 0.1, ey = by - s * 0.33, nod = Math.sin(t / 700), fl = Math.max(0, Math.sin(t / 1900));
  line(c, [[ex - s * 0.02, ey + s * 0.02], [ex - s * 0.03, ey + s * 0.1]], '#d9a03a', s * 0.025);
  c.save(); c.translate(ex, ey); c.rotate(-0.1 - fl * 0.2);
  paper(c, ell(0, -s * 0.07, s * 0.2, s * 0.1, -0.15), '#fffdf4', 0.7);
  if (fl > 0.2) paper(c, ell(-s * 0.04, -s * 0.12 - fl * s * 0.1, s * 0.16, s * 0.06, -0.6 - fl * 0.5), '#eef2f0', 0.4);
  paper(c, function (q) { q.beginPath(); q.moveTo(s * 0.1, -s * 0.12); q.quadraticCurveTo(s * 0.22, -s * 0.25, s * 0.2 + nod * s * 0.02, -s * 0.38); q.lineTo(s * 0.26 + nod * s * 0.02, -s * 0.38); q.quadraticCurveTo(s * 0.28, -s * 0.2, s * 0.16, -s * 0.05); q.closePath(); }, '#fffdf4', 0.5);
  paper(c, poly([[s * 0.25 + nod * s * 0.02, -s * 0.4], [s * 0.4 + nod * s * 0.02, -s * 0.37], [s * 0.25 + nod * s * 0.02, -s * 0.34]]), '#f2b83a', 0.3);
  dot(c, s * 0.23 + nod * s * 0.02, -s * 0.39, s * 0.015, '#1b1410');
  c.restore();
};

R['d:cloth'] = function (c, x, y, s, t) {
  var NR = 13, prog = (t / 430) % (NR + 4), rows = Math.min(NR, Math.floor(prog)), part = prog - Math.floor(prog), fade = prog > NR + 2 ? 1 - (prog - NR - 2) / 2 : 1;
  var rh = s * 0.108, wl = x - s * 0.58, wr = x + s * 0.58, top = y - s * 0.66, bot = y + s * 0.78;
  var pat = [RED, RED, GOLD, CREAM, INDIGO, INDIGO, CREAM, GOLD, RED, RED, GOLD, CREAM, INDIGO];
  bg(c, x, y, s * 0.93, '#e9d4a4', 0.3);
  paper(c, rect(x - s * 0.74, top - s * 0.14, s * 0.12, bot - top + s * 0.28), WOOD, 1); paper(c, rect(x + s * 0.62, top - s * 0.14, s * 0.12, bot - top + s * 0.28), WOOD, 1);
  paper(c, rect(x - s * 0.74, top - s * 0.14, s * 1.48, s * 0.1), '#6f4520', 1); paper(c, rect(x - s * 0.74, bot + s * 0.04, s * 1.48, s * 0.1), '#6f4520', 1);
  c.save(); c.strokeStyle = 'rgba(80,60,40,.55)'; c.lineWidth = Math.max(0.8, s * 0.014); for (var j = 0; j <= 16; j++) { var wx = lerp(wl, wr, j / 16); c.beginPath(); c.moveTo(wx, top - s * 0.04); c.lineTo(wx, bot + s * 0.04); c.stroke(); } c.restore();
  var ct = bot - rows * rh - (part > 0 && rows < NR ? 0 : 0);
  c.save(); c.globalAlpha = fade;
  if (rows > 0) {
    paper(c, rect(wl, ct, wr - wl, rows * rh), CREAM, 0.6);
    for (j = 0; j < rows; j++) {
      var ry = bot - (j + 1) * rh; c.fillStyle = pat[j % pat.length]; c.fillRect(wl, ry, wr - wl, rh);
      if (pat[j] === CREAM || pat[j] === GOLD) { c.fillStyle = RED; for (var k = 0; k < 7; k++) c.fillRect(wl + (k + 0.35) * (wr - wl) / 7, ry + rh * 0.3, (wr - wl) / 7 * 0.3, rh * 0.4); }
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(wl, ry, wr - wl, Math.max(0.6, rh * 0.06));
    }
  }
  var sy = ct - rh * 0.5 * (rows < NR ? 1 : 0), shx = lerp(wl - s * 0.1, wr + s * 0.1, 0.5 + 0.5 * Math.sin(prog * 3.1));
  if (rows < NR) {
    paper(c, rect(wl - s * 0.04, ct - s * 0.1, wr - wl + s * 0.08, s * 0.06), '#6f4520', 0.8);
    paper(c, poly([[shx - s * 0.2, sy - s * 0.15], [shx - s * 0.08, sy - s * 0.2], [shx + s * 0.2, sy - s * 0.15], [shx - s * 0.08, sy - s * 0.1]]), '#c89a5a', 0.9);
    line(c, [[shx - s * 0.18, sy - s * 0.15], [wl - s * 0.04, sy - s * 0.15]], pat[rows % pat.length], Math.max(1, s * 0.02));
  }
  c.restore();
};

R['d:tool'] = function (c, x, y, s, t) {
  var ph = (t / 1500) % 1, soil = y + s * 0.68, a, hit = 0;
  if (ph < 0.55) a = lerp(0.47, 1.08, sm(ph / 0.55)); else if (ph < 0.68) a = lerp(1.08, 0.47, Math.pow((ph - 0.55) / 0.13, 2)); else a = 0.47;
  if (ph >= 0.68) hit = (ph - 0.68) / 0.32;
  bg(c, x, y, s * 0.93, '#efdcae', 0.3);
  var kx = x + s * 0.58, ky = y + s * 0.5, kd = [-1.25, -1.1], kl = Math.sqrt(kd[0] * kd[0] + kd[1] * kd[1]), ux = kd[0] / kl, uy = kd[1] / kl, nx = -uy, ny = ux;
  function kp(l, w) { return [kx + ux * l * s + nx * w * s, ky + uy * l * s + ny * w * s]; }
  c.save(); c.shadowColor = 'rgba(0,0,0,.35)';
  paper(c, poly([kp(0, -0.05), kp(0.42, -0.05), kp(0.42, 0.05), kp(0, 0.05)]), '#6a3a1a', 0.8);
  paper(c, poly([kp(0.42, -0.07), kp(0.46, -0.07), kp(0.46, 0.07), kp(0.42, 0.07)]), GOLD, 0.5);
  paper(c, poly([kp(0.46, -0.06), kp(1.1, -0.1), kp(1.64, -0.02), kp(1.7, 0.05), kp(1.1, 0.12), kp(0.46, 0.07)]), '#c9d0d6', 0.9);
  c.restore();
  var Px = x + s * 0.55, Py = y - s * 0.6, L = s * 1.3, tx = Px - Math.sin(a) * L, ty = Py + Math.cos(a) * L, ex = Math.cos(a), ey = Math.sin(a), dx = -Math.sin(a), dy = Math.cos(a);
  paper(c, poly([[Px + ex * s * 0.035, Py + ey * s * 0.035], [Px - ex * s * 0.035, Py - ey * s * 0.035], [tx - ex * s * 0.035, ty - ey * s * 0.035], [tx + ex * s * 0.035, ty + ey * s * 0.035]]), '#a8703a', 1);
  paper(c, poly([[tx - dx * s * 0.04 + ex * s * 0.07, ty - dy * s * 0.04 + ey * s * 0.07], [tx + dx * s * 0.3 + ex * s * 0.2, ty + dy * s * 0.3 + ey * s * 0.2], [tx + dx * s * 0.3 - ex * s * 0.2, ty + dy * s * 0.3 - ey * s * 0.2], [tx - dx * s * 0.04 - ex * s * 0.07, ty - dy * s * 0.04 - ey * s * 0.07]]), '#6b7078', 1);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.96, soil + s * 0.05); for (var k = 0; k <= 16; k++) q.lineTo(x - s * 0.96 + k / 16 * s * 1.92, soil - Math.abs(Math.sin(k * 1.9)) * s * 0.05); q.lineTo(x + s * 0.96, y + s * 0.95); q.lineTo(x - s * 0.96, y + s * 0.95); q.closePath(); }, '#7a5230', 1.2);
  if (hit > 0 && hit < 0.9) { for (var j = 0; j < 6; j++) { var v = hit * 0.9 * 1.4, vx = (j - 2.5) * s * 0.25, px = tx + dx * s * 0.3 + vx * v, py = soil - (s * (0.7 + (j % 3) * 0.25) * v - s * 1.4 * v * v); if (py > soil) continue; c.save(); c.globalAlpha = 1 - hit; dot(c, px, py, s * (0.035 + (j % 3) * 0.015), '#6a4426'); c.restore(); } }
};

R['d:number'] = function (c, x, y, s, t) {
  var cols = [LRED, GOLD, INDIGO], nums = ['๑', '๒', '๓'], rod = y + s * 0.5;
  bg(c, x, y, s * 0.93, '#ecd9aa', 0.3);
  paper(c, rect(x - s * 0.88, y - s * 0.78, s * 0.1, s * 1.62), WOOD, 1); paper(c, rect(x + s * 0.78, y - s * 0.78, s * 0.1, s * 1.62), WOOD, 1);
  paper(c, rect(x - s * 0.88, y - s * 0.78, s * 1.76, s * 0.1), '#6f4520', 1); paper(c, rect(x - s * 0.88, y + s * 0.74, s * 1.76, s * 0.1), '#6f4520', 1);
  line(c, [[x - s * 0.78, y - s * 0.5], [x + s * 0.78, y - s * 0.5]], '#3a2a1a', Math.max(1.2, s * 0.03));
  for (var j = 0; j < 7; j++) { var bxx = x - s * 0.7 + j * s * 0.13 + (j > 3 ? s * 0.2 + Math.sin(t / 900) * s * 0.1 : Math.sin(t / 900) * s * 0.03 * 0); paper(c, ell(bxx, y - s * 0.5, s * 0.06, s * 0.09), j % 2 ? '#c8642a' : '#7a1f1a', 0.4); }
  paper(c, rect(x - s * 0.78, rod, s * 1.56, s * 0.07), '#6f4520', 0.8);
  for (j = 0; j < 3; j++) {
    var p = (((t / 760) - j * 0.18) % 1 + 1) % 1, up = 4 * p * (1 - p), sq = p < 0.08 ? 1 - (0.08 - p) * 2 : 1, r = s * 0.24, bx = x + (j - 1) * s * 0.5, by = rod - r * 0.92 * sq - up * s * 0.3;
    c.save(); c.translate(bx, rod); c.scale(1 + (1 - sq) * 0.6, sq); c.translate(-bx, -rod);
    paper(c, ball(bx, rod - r * 0.92 - up * s * 0.3 / sq, r, 5 + j), cols[j], 1.2);
    c.restore();
    txt(c, nums[j], bx, by + s * 0.02, s * 0.4, j === 1 ? RED : CREAM);
  }
};

R['d:power'] = function (c, x, y, s, t) {
  bg(c, x, y, s * 0.93, '#7a1f1a', 0.4);
  var gy = y + s * 0.74, j;
  paper(c, ell(x, gy + s * 0.14, s * 0.72, s * 0.14), '#b8342b', 1);
  paper(c, ell(x, gy + s * 0.08, s * 0.66, s * 0.1), '#d9453a', 0.4);
  [-1, 1].forEach(function (d) { line(c, [[x + d * s * 0.7, gy + s * 0.14], [x + d * s * 0.76, gy + s * 0.32]], GOLD, Math.max(1.5, s * 0.03)); dot(c, x + d * s * 0.76, gy + s * 0.35, s * 0.04, GOLD); });
  [-1, 1].forEach(function (d) { paper(c, function (q) { q.beginPath(); q.moveTo(x + d * s * 0.5, gy - s * 0.06); q.quadraticCurveTo(x + d * s * 0.72, gy - s * 0.1, x + d * s * 0.64, gy - s * 0.34); q.quadraticCurveTo(x + d * s * 0.6, gy - s * 0.2, x + d * s * 0.44, gy - s * 0.16); q.closePath(); }, '#f0c24e', 0.9); });
  paper(c, poly([[x - s * 0.52, gy], [x + s * 0.52, gy], [x + s * 0.48, gy - s * 0.16], [x - s * 0.48, gy - s * 0.16]]), '#c9922a', 0.9);
  for (j = -2; j <= 2; j++) dot(c, x + j * s * 0.19, gy - s * 0.08, s * 0.04, j % 2 ? '#2f8f5b' : '#d9342b');
  var yy = gy - s * 0.16, tiers = [[0.4, 0.36], [0.33, 0.33], [0.26, 0.3], [0.19, 0.27], [0.12, 0.24]];
  tiers.forEach(function (tr, i) {
    var w = s * tr[0], h = s * tr[1];
    paper(c, function (q) { q.beginPath(); q.moveTo(x - w, yy); q.quadraticCurveTo(x - w * 0.62, yy - h * 0.3, x - w * 0.34, yy - h); q.lineTo(x, yy - h * 1.12); q.lineTo(x + w * 0.34, yy - h); q.quadraticCurveTo(x + w * 0.62, yy - h * 0.3, x + w, yy); q.closePath(); }, i % 2 ? '#f0c24e' : GOLD, 0.9 + i * 0.1);
    line(c, [[x, yy - h * 0.15], [x, yy - h * 1.05]], 'rgba(122,31,26,.45)', Math.max(1, s * 0.02));
    c.fillStyle = 'rgba(122,31,26,.5)'; c.beginPath(); c.moveTo(x - w * 0.8, yy - h * 0.12); c.lineTo(x - w * 0.62, yy - h * 0.32); c.lineTo(x - w * 0.44, yy - h * 0.12); c.moveTo(x + w * 0.44, yy - h * 0.12); c.lineTo(x + w * 0.62, yy - h * 0.32); c.lineTo(x + w * 0.8, yy - h * 0.12); c.fill();
    yy -= h * 0.72;
  });
  paper(c, poly([[x - s * 0.035, yy + s * 0.04], [x + s * 0.035, yy + s * 0.04], [x, yy - s * 0.34]]), GOLD, 0.6); dot(c, x, yy - s * 0.36, s * 0.04, '#fff3b0');
  var gp = [[-0.3, 0.6], [0.22, 0.4], [-0.08, 0.05], [0.2, -0.3], [0.0, -0.75]], gi = Math.floor(t / 520) % gp.length;
  star(c, x + gp[gi][0] * s, y + gp[gi][1] * s, s * 0.2, Math.sin(((t / 520) % 1) * Math.PI), '#ffffff'); star(c, x + s * 0.55, y - s * 0.55, s * 0.09, 0.4 + 0.5 * Math.sin(t / 400), '#ffe9a0');
};
R['d:toponym'] = function (c, x, y, s, t) {
  var bob = Math.abs(Math.sin(t / 520)), hx = x + s * 0.14, hy = y + s * 0.3;
  bg(c, x, y, s * 0.93, '#cfe6ee', 0.3);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.97, y + s * 0.9); q.bezierCurveTo(x - s * 0.5, y + s * 0.15, x - s * 0.1, hy - s * 0.2, hx, hy - s * 0.2); q.bezierCurveTo(hx + s * 0.4, hy - s * 0.2, x + s * 0.6, y + s * 0.5, x + s * 0.97, y + s * 0.9); q.closePath(); }, '#3f7a4a', 0.8);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.97, y + s * 0.95); q.bezierCurveTo(x - s * 0.8, y + s * 0.6, x - s * 0.5, y + s * 0.55, x - s * 0.2, y + s * 0.75); q.bezierCurveTo(x + s * 0.2, y + s * 0.98, x + s * 0.7, y + s * 0.6, x + s * 0.97, y + s * 0.8); q.lineTo(x + s * 0.95, y + s * 0.95); q.closePath(); }, '#5f9a52', 0.8);
  var N = 30, a = [], b = [];
  for (var j = 0; j <= N; j++) { var v = j / N, px = lerp(x - s * 0.5, hx, v) + Math.sin(v * 5.5) * s * 0.18 * (1 - v * 0.6), py = lerp(y + s * 0.98, hy - s * 0.12, v), hw = lerp(s * 0.2, s * 0.025, v); a.push([px - hw, py]); b.unshift([px + hw, py]); }
  paper(c, poly(a.concat(b)), '#e9d8a6', 0.5);
  c.save(); c.strokeStyle = 'rgba(160,110,50,.7)'; c.lineWidth = Math.max(1, s * 0.02); c.setLineDash([s * 0.07, s * 0.06]); c.lineDashOffset = -t / 60; c.beginPath(); for (j = 0; j <= N; j++) { var v2 = j / N, px2 = lerp(x - s * 0.5, hx, v2) + Math.sin(v2 * 5.5) * s * 0.18 * (1 - v2 * 0.6), py2 = lerp(y + s * 0.98, hy - s * 0.12, v2); j ? c.lineTo(px2, py2) : c.moveTo(px2, py2); } c.stroke(); c.restore();
  var r = s * 0.27, tipY = hy - s * 0.12 - bob * s * 0.14;
  c.save(); c.globalAlpha = 0.35 - bob * 0.2; paper(c, ell(hx, hy - s * 0.1, s * 0.12 * (1 - bob * 0.3), s * 0.04), '#1a2a1a', 0); c.restore();
  var ring = (t / 1500) % 1; c.save(); c.strokeStyle = 'rgba(255,255,255,' + (0.7 * (1 - ring)) + ')'; c.lineWidth = Math.max(1, s * 0.02); c.beginPath(); c.ellipse(hx, hy - s * 0.1, s * (0.1 + ring * 0.3), s * (0.03 + ring * 0.08), 0, 0, TAU); c.stroke(); c.restore();
  paper(c, function (q) { var cy = tipY - r * 1.7; q.beginPath(); q.moveTo(hx, tipY); q.bezierCurveTo(hx - r * 0.2, tipY - r * 0.8, hx - r, tipY - r * 0.9, hx - r, cy); q.arc(hx, cy, r, Math.PI, TAU); q.bezierCurveTo(hx + r, tipY - r * 0.9, hx + r * 0.2, tipY - r * 0.8, hx, tipY); q.closePath(); }, '#d9342b', 1.6);
  paper(c, ball(hx, tipY - r * 1.7, r * 0.42, 3), CREAM, 0.3);
};

R['d:material'] = function (c, x, y, s, t) {
  var gy = y + s * 0.88, wob = Math.sin(t / 900) * 0.025;
  bg(c, x, y, s * 0.93, '#efdcb0', 0.3);
  paper(c, rect(x - s * 0.95, gy, s * 1.9, s * 0.1), '#8a6a3a', 0.4);
  var bw = s * 0.34, bh = s * 0.17, cols = ['#b8512e', '#c25e36', '#a64626', '#cc6a3e'];
  for (var r = 0; r < 3; r++) for (var k = 0; k < 3; k++) { if (r % 2 && k === 2) continue; var bx = x - s * 0.82 + k * (bw + s * 0.02) + (r % 2 ? bw * 0.5 : 0), by = gy - (r + 1) * (bh + s * 0.02); paper(c, rect(bx, by, bw, bh), cols[(r * 3 + k) % 4], 0.6); }
  c.save(); c.translate(x - s * 0.35, gy - 3 * (bh + s * 0.02)); c.rotate(wob);
  paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.2, -s * 0.5); q.lineTo(-s * 0.2, -s * 0.44); q.bezierCurveTo(-s * 0.46, -s * 0.3, -s * 0.46, -s * 0.02, -s * 0.18, 0); q.lineTo(s * 0.18, 0); q.bezierCurveTo(s * 0.46, -s * 0.02, s * 0.46, -s * 0.3, s * 0.2, -s * 0.44); q.lineTo(s * 0.2, -s * 0.5); q.closePath(); }, '#c8642a', 1.2);
  c.fillStyle = '#7a1f1a'; c.fillRect(-s * 0.4, -s * 0.28, s * 0.8, s * 0.05); c.fillStyle = GOLD; for (var j = -3; j <= 3; j++) { c.beginPath(); c.moveTo(j * s * 0.1, -s * 0.2); c.lineTo(j * s * 0.1 + s * 0.04, -s * 0.12); c.lineTo(j * s * 0.1 - s * 0.04, -s * 0.12); c.fill(); }
  paper(c, ell(0, -s * 0.5, s * 0.22, s * 0.05), '#a0501e', 0.4); paper(c, ell(0, -s * 0.5, s * 0.16, s * 0.03), '#3a2218', 0);
  c.restore();
  [[0.5, 1.7, '#6a9a3a'], [0.68, 1.45, '#5a8a32'], [0.86, 1.2, '#7aaa44']].forEach(function (b, i) {
    var cx = x + s * (b[0] - 0.05), top = gy - s * b[1] * 0.9, sw = Math.sin(t / 800 + i) * 0.1;
    paper(c, rect(cx - s * 0.055, top, s * 0.11, gy - top), b[2], 0.9);
    c.strokeStyle = 'rgba(40,70,20,.8)'; c.lineWidth = Math.max(1, s * 0.022); for (var n = 1; n < 6; n++) { var ny = top + (gy - top) * n / 6; c.beginPath(); c.moveTo(cx - s * 0.06, ny); c.lineTo(cx + s * 0.06, ny); c.stroke(); }
    leaf(c, cx, top, s * 0.3, s * 0.07, -0.5 + sw, '#3f8a3a', 0.5); leaf(c, cx, top, s * 0.3, s * 0.07, -2.6 - sw, '#4f9a44', 0.5);
  });
  line(c, [[x + s * 0.4, gy - s * 0.35], [x + s * 0.9, gy - s * 0.35]], '#c89a5a', Math.max(1.5, s * 0.03));
};

/* ================================================================ seed packets: where a word came from */
function sprout(c, x, by, s, t, kind) {
  var sw = Math.sin(t / 800), i;
  if (kind === 0) {   /* rice: arching blades */
    [[-0.5, 0.9, '#4f9a44'], [0.45, 0.8, '#3f8a42'], [-0.1, 1.0, '#6aae4e'], [0.12, 0.7, '#4f9a44']].forEach(function (b, k) {
      var tx = x + b[0] * s * 0.7 + sw * s * 0.04 * (k + 1) * 0.5, ty = by - b[1] * s * 0.82, mx = x + b[0] * s * 0.18, my = by - b[1] * s * 0.6;
      paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.03, by + s * 0.05); q.quadraticCurveTo(mx - s * 0.06, my, tx, ty); q.quadraticCurveTo(mx + s * 0.06, my + s * 0.06, x + s * 0.03, by + s * 0.05); q.closePath(); }, b[2], 0.5);
    });
    dot(c, x + sw * s * 0.03 + s * 0.31, by - s * 0.72, s * 0.04, GOLD);
    return;
  }
  var top = by - s * 0.55;
  line(c, [[x, by + s * 0.05], [x + sw * s * 0.03, top]], '#3f8a3a', Math.max(1.6, s * 0.05));
  var lx = x + sw * s * 0.03;
  if (kind === 1 || kind === 2 || kind === 4) { leaf(c, lx, top, s * 0.46, s * 0.16, -0.45 + sw * 0.08, '#5fae4c', 0.6); leaf(c, lx, top, s * 0.46, s * 0.16, -Math.PI + 0.45 - sw * 0.08, '#4f9a44', 0.6); }
  if (kind === 2) { paper(c, ball(lx, top - s * 0.14, s * 0.07, 3), '#f2b83a', 0.4); }
  if (kind === 4) { leaf(c, lx, top - s * 0.18, s * 0.34, s * 0.12, -1.57 + sw * 0.1, '#7fc05a', 0.6); }
  if (kind === 3) {   /* a curled frond */
    c.save(); c.strokeStyle = '#4f9a44'; c.lineWidth = Math.max(2, s * 0.07); c.lineCap = 'round'; c.beginPath(); c.moveTo(lx, top); c.quadraticCurveTo(lx + s * 0.02, top - s * 0.3, lx + s * 0.16, top - s * 0.33); c.arc(lx + s * 0.16, top - s * 0.22, s * 0.11, -Math.PI / 2, Math.PI * 0.6); c.stroke(); c.restore();
    leaf(c, lx, top + s * 0.12, s * 0.34, s * 0.11, -2.6 + sw * 0.06, '#6aae4e', 0.5);
  }
}
function packet(c, x, y, s, t, col, label, kind, ink, labBg) {
  var w = s * 0.52, top = y - s * 0.12, bot = y + s * 0.92, tr = Math.sin(t / 1300) * 0.025;
  c.save(); c.translate(x, bot); c.rotate(tr); c.translate(-x, -bot);
  sprout(c, x, top + s * 0.02, s, t, kind);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - w, bot); q.lineTo(x - w, top); for (var k = 0; k <= 10; k++) q.lineTo(x - w + (k / 10) * w * 2, top - (k % 2 ? 0 : s * 0.045)); q.lineTo(x + w, bot); q.closePath(); }, col, 1.4);
  c.fillStyle = 'rgba(0,0,0,.14)'; c.fillRect(x - w, top + s * 0.02, w * 2, s * 0.09); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - w, top + s * 0.11, w * 2, Math.max(1, s * 0.015));
  c.fillStyle = 'rgba(0,0,0,.13)'; c.fillRect(x + w * 0.82, top + s * 0.11, w * 0.18, bot - top - s * 0.11);
  var lw = w * 1.56, lh = s * 0.6, ly = y + s * 0.5;
  paper(c, function (q) { var r = s * 0.06, a = x - lw / 2, b = x + lw / 2, u = ly - lh / 2, d = ly + lh / 2; q.beginPath(); q.moveTo(a + r, u); q.lineTo(b - r, u); q.quadraticCurveTo(b, u, b, u + r); q.lineTo(b, d - r); q.quadraticCurveTo(b, d, b - r, d); q.lineTo(a + r, d); q.quadraticCurveTo(a, d, a, d - r); q.lineTo(a, u + r); q.quadraticCurveTo(a, u, a + r, u); q.closePath(); }, labBg || CREAM, 0.5);
  c.save(); c.strokeStyle = ink; c.globalAlpha = 0.5; c.lineWidth = Math.max(0.8, s * 0.015); c.strokeRect(x - lw / 2 + s * 0.04, ly - lh / 2 + s * 0.04, lw - s * 0.08, lh - s * 0.08); c.restore();
  txt(c, label, x, ly + s * 0.02, s * 0.44, ink, lw * 0.8);
  c.restore();
}
function origin(col, label, kind, ink, labBg) { return function (c, x, y, s, t) { packet(c, x, y, s, t, col, label, kind, ink || INK, labBg); }; }
R['o:tai'] = origin('#2f7a42', 'ไท', 0);
R['o:sanskrit'] = origin('#e8921c', 'देव', 1);
R['o:pali'] = origin('#c8642a', 'ภาสา', 2);
R['o:khmer'] = origin('#1f4a6b', 'ខ្មែរ', 3);
R['o:chinese'] = origin('#c0302a', '字', 4);
R['o:english'] = origin('#2f6fb0', 'ABC', 1);
R['o:mon'] = origin('#6b3a7a', 'မန်', 2);
R['o:vietnamese'] = origin('#1f7f7a', 'Việt', 3);
R['o:other'] = origin('#8a8a86', '?', 4);
R['o:unknown'] = function (c, x, y, s, t) { packet(c, x, y, s, t, '#efe3c0', '…', 2, '#8a6a4a', '#fbf3df'); c.save(); c.strokeStyle = 'rgba(138,106,74,.6)'; c.lineWidth = Math.max(1, s * 0.02); c.setLineDash([s * 0.06, s * 0.05]); c.strokeRect(x - s * 0.5, y - s * 0.07, s * 1.0, s * 0.97); c.restore(); };

/* ================================================================ branch kinds */
function chaikin(pts, n) { for (var k = 0; k < n; k++) { var o = []; for (var i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; o.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); } pts = o; } return pts; }
function area(p) { var a = 0; for (var i = 0; i < p.length; i++) { var q = p[(i + 1) % p.length]; a += p[i][0] * q[1] - q[0] * p[i][1]; } return a; }
function resample(pts, N) {
  if (area(pts) < 0) pts = pts.slice().reverse();
  var m = 0; for (var i = 1; i < pts.length; i++) if (pts[i][0] > pts[m][0]) m = i;
  pts = pts.slice(m).concat(pts.slice(0, m));
  var L = [0], tot = 0; for (i = 0; i < pts.length; i++) { var a = pts[i], b = pts[(i + 1) % pts.length]; tot += Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)); L.push(tot); }
  var out = [], j = 0; for (i = 0; i < N; i++) { var d = i / N * tot; while (L[j + 1] < d) j++; var p0 = pts[j % pts.length], p1 = pts[(j + 1) % pts.length], u = (d - L[j]) / (L[j + 1] - L[j] || 1); out.push([lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)]); }
  return out;
}
var LEAF = resample(chaikin([[1, 0], [0.75, 0.28], [0.35, 0.46], [-0.15, 0.46], [-0.6, 0.3], [-1, 0.04], [-0.62, -0.26], [-0.2, -0.46], [0.3, -0.46], [0.72, -0.28]], 3), 72);
var BIRD = resample(chaikin([[1.02, 0.02], [0.8, 0.07], [0.64, 0.14], [0.56, 0.36], [0.22, 0.52], [-0.2, 0.46], [-0.6, 0.28], [-1.04, 0.1], [-0.62, -0.1], [-0.34, -0.2], [-0.5, -0.62], [-0.22, -0.88], [0.06, -0.5], [0.2, -0.3], [0.44, -0.3], [0.6, -0.36], [0.78, -0.18], [0.86, -0.04]], 3), 72);

R['v:metaphor'] = function (c, x, y, s, t) {
  var m = sm(clamp(0.5 + 0.95 * Math.sin(t / 1100), 0, 1)), k = s * 0.84, cy = y - s * 0.06, pts = [], i;
  for (i = 0; i < LEAF.length; i++) pts.push([x + lerp(LEAF[i][0], BIRD[i][0], m) * k, cy + lerp(LEAF[i][1], BIRD[i][1], m) * k]);
  paper(c, poly(pts), mixc('#4f9a44', '#e08a2a', m), 1.2);
  c.save(); c.globalAlpha = 1 - m; line(c, [[x - k * 0.95, cy + k * 0.04], [x + k * 0.8, cy]], 'rgba(255,255,255,.45)', Math.max(1, s * 0.025)); [-0.5, -0.1, 0.3].forEach(function (f) { line(c, [[x + f * k, cy], [x + f * k + k * 0.15, cy - k * 0.2]], 'rgba(255,255,255,.35)', Math.max(0.8, s * 0.018)); line(c, [[x + f * k, cy], [x + f * k + k * 0.15, cy + k * 0.2]], 'rgba(255,255,255,.35)', Math.max(0.8, s * 0.018)); }); c.restore();
  c.save(); c.globalAlpha = m; eye(c, x + 0.6 * k, cy - 0.14 * k, s * 0.045); line(c, [[x - 0.4 * k, cy - 0.4 * k], [x - 0.1 * k, cy - 0.12 * k]], 'rgba(122,31,26,.5)', Math.max(1, s * 0.03)); c.restore();
  dot(c, x - s * 0.22, y + s * 0.84, s * 0.07 * (1.2 - m * 0.4), mixc('#4f9a44', '#bdb7a2', m)); dot(c, x + s * 0.22, y + s * 0.84, s * 0.07 * (0.8 + m * 0.4), mixc('#bdb7a2', '#e08a2a', m));
};

R['v:metonymy'] = function (c, x, y, s, t) {
  var g = Math.sin(t / 700), gh = Math.max(0, g), gd = Math.max(0, -g), hb = Math.sin(t / 700) * s * 0.012;
  halo(c, x, y - s * 0.6, s * 0.7, '255,210,90', 0.7 * gh); halo(c, x, y + s * 0.38, s * 0.7, '255,190,120', 0.7 * gd);
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.62, y + s * 0.95); q.bezierCurveTo(x - s * 0.62, y + s * 0.62, x - s * 0.3, y + s * 0.62, x, y + s * 0.62); q.bezierCurveTo(x + s * 0.3, y + s * 0.62, x + s * 0.62, y + s * 0.62, x + s * 0.62, y + s * 0.95); q.closePath(); }, INDIGO, 0.8);
  paper(c, rect(x - s * 0.08, y + s * 0.5, s * 0.16, s * 0.18), '#c98b62', 0.4);
  paper(c, ball(x, y + s * 0.3, s * 0.34, 5), '#d9a27a', 1);
  paper(c, function (q) { q.beginPath(); q.arc(x, y + s * 0.27, s * 0.35, Math.PI * 0.98, Math.PI * 2.02); q.quadraticCurveTo(x + s * 0.1, y + s * 0.12, x - s * 0.35, y + s * 0.27); q.closePath(); }, '#241a18', 0.4);
  c.save(); c.strokeStyle = '#2a1a12'; c.lineWidth = Math.max(1, s * 0.03); c.lineCap = 'round'; c.beginPath(); c.arc(x - s * 0.13, y + s * 0.36, s * 0.05, Math.PI, TAU); c.moveTo(x + s * 0.18, y + s * 0.36); c.arc(x + s * 0.13, y + s * 0.36, s * 0.05, 0, Math.PI, true); c.stroke();
  c.strokeStyle = '#9c3a2a'; c.beginPath(); c.arc(x, y + s * 0.42, s * 0.08, 0.3, Math.PI - 0.3); c.stroke(); c.restore();
  for (var j = 0; j < 3; j++) dot(c, x, y - s * 0.3 + j * s * 0.1, s * 0.035, 'rgba(180,90,30,' + (0.25 + 0.7 * Math.max(0, Math.sin(t / 700 - j * 0.9 + 1.6))) + ')');
  c.save(); c.translate(x, y - s * 0.44 + hb); c.rotate(Math.sin(t / 900) * 0.03);
  paper(c, function (q) { q.beginPath(); q.moveTo(0, -s * 0.52); q.quadraticCurveTo(s * 0.35, -s * 0.2, s * 0.62, s * 0.1); q.quadraticCurveTo(0, s * 0.2, -s * 0.62, s * 0.1); q.quadraticCurveTo(-s * 0.35, -s * 0.2, 0, -s * 0.52); q.closePath(); }, mixc('#d9a84a', '#f4d27a', gh), 1.2);
  c.strokeStyle = 'rgba(122,70,20,.55)'; c.lineWidth = Math.max(1, s * 0.02); for (j = 1; j < 5; j++) { c.beginPath(); c.moveTo(-s * 0.1 * j, s * (0.02 + j * 0.02)); c.quadraticCurveTo(0, s * (0.12 + j * 0.01), s * 0.1 * j, s * (0.02 + j * 0.02)); c.stroke(); } for (j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(0, -s * 0.5); c.lineTo(j * s * 0.24, s * 0.12); c.stroke(); }
  c.restore();
};

function flow(c, x, y, s, t, spread) {
  var N = 9, fx = spread ? x - s * 0.78 : x + s * 0.78, i;
  c.save(); c.globalAlpha = 0.5;
  var ex = spread ? x + s * 0.95 : x - s * 0.95;
  paper(c, poly([[fx, y], [ex, y - s * 0.82], [ex, y + s * 0.82]]), '#f2e0b0', 0.3);
  c.restore();
  for (i = 0; i < N; i++) {
    var u = ((t / 2600) + i / N) % 1, lane = (i - (N - 1) / 2) / ((N - 1) / 2) * s * 0.68, al = Math.min(1, u * 6, (1 - u) * 6), px, py;
    if (spread) { px = lerp(fx + s * 0.1, ex - s * 0.1, u); py = y + lane * sm(u); }
    else { px = lerp(ex + s * 0.1, fx - s * 0.1, u); py = y + lane * (1 - sm(u)); }
    c.save(); c.globalAlpha = al; paper(c, ball(px, py, s * 0.075, 2 + i), spread ? mixc(GOLD, '#c8642a', u) : mixc('#c8642a', GOLD, u), 0.6); c.restore();
  }
  var pl = 0.6 + 0.4 * Math.sin(t / 260);
  halo(c, fx, y, s * 0.5, '255,220,110', 0.5 * pl); paper(c, ball(fx, y, s * 0.14, 9), '#ffd24a', 1); star(c, fx, y, s * 0.28, pl, '#fffbe0');
}
R['v:specialisation'] = function (c, x, y, s, t) { flow(c, x, y, s, t, false); };
R['v:generalisation'] = function (c, x, y, s, t) { flow(c, x, y, s, t, true); };

R['v:euphemism'] = function (c, x, y, s, t) {
  var o = sm(clamp(0.5 + 0.9 * Math.sin(t / 900 - 1), 0, 1)), fx = x + s * 0.55, fy = y + s * 0.84, d0 = Math.atan2(y + s * 0.34 - fy, x - fx), hs = lerp(0.05, 0.82, o), Rf = s * 0.98, n = 7, j;
  paper(c, ball(x, y - s * 0.02, s * 0.74, 6), '#ecc79c', 1);
  paper(c, function (q) { q.beginPath(); q.arc(x, y - s * 0.12, s * 0.76, Math.PI * 1.03, Math.PI * 1.97); q.quadraticCurveTo(x + s * 0.2, y - s * 0.5, x - s * 0.76, y - s * 0.12); q.closePath(); }, '#241a18', 0.5);
  line(c, [[x - s * 0.34, y - s * 0.12], [x - s * 0.18, y - s * 0.08]], '#2a1a12', Math.max(1.2, s * 0.035)); line(c, [[x + s * 0.18, y - s * 0.08], [x + s * 0.34, y - s * 0.12]], '#2a1a12', Math.max(1.2, s * 0.035));
  c.save(); c.fillStyle = 'rgba(217,100,100,.3)'; c.beginPath(); c.arc(x - s * 0.44, y + s * 0.12, s * 0.09, 0, TAU); c.arc(x + s * 0.44, y + s * 0.12, s * 0.09, 0, TAU); c.fill(); c.restore();
  paper(c, ell(x, y + s * 0.34, s * 0.16, s * 0.06 + s * 0.02 * Math.sin(t / 300) * (1 - o)), '#b8342b', 0.3);
  var a0 = d0 - hs, a1 = d0 + hs;
  paper(c, function (q) { q.beginPath(); q.moveTo(fx, fy); q.arc(fx, fy, Rf, a0, a1); q.closePath(); }, CREAM, 1.4);
  for (j = 0; j < n; j++) { var b0 = lerp(a0, a1, j / n), b1 = lerp(a0, a1, (j + 1) / n); c.fillStyle = j % 2 ? GOLD : '#d9342b'; c.beginPath(); c.moveTo(fx, fy); c.arc(fx, fy, Rf * 0.94, b0, b1); c.closePath(); c.fill(); }
  c.strokeStyle = 'rgba(80,30,10,.6)'; c.lineWidth = Math.max(1, s * 0.018); for (j = 0; j <= n; j++) { var b = lerp(a0, a1, j / n); c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.cos(b) * Rf, fy + Math.sin(b) * Rf); c.stroke(); }
  c.beginPath(); c.arc(fx, fy, Rf * 0.94, a0, a1); c.stroke();
  paper(c, ball(fx, fy, s * 0.1, 3), '#d9a27a', 0.6); paper(c, poly([[fx - s * 0.06, fy + s * 0.02], [fx + s * 0.1, fy + s * 0.02], [fx + s * 0.34, fy + s * 0.2], [fx + s * 0.1, fy + s * 0.22]]), INDIGO, 0.5);
};

/* ================================================================ extras */
function face(c, x, y, r, skin, hair) {
  paper(c, ball(x, y, r, 4), skin, 0.8);
  paper(c, function (q) { q.beginPath(); q.arc(x, y - r * 0.12, r * 1.02, Math.PI * 1.02, Math.PI * 1.98); q.quadraticCurveTo(x + r * 0.2, y - r * 0.66, x - r * 1.02, y - r * 0.12); q.closePath(); }, hair || '#241a18', 0.4);
}
R['x:mask'] = function (c, x, y, s, t) {
  var m = sm(clamp(0.5 + 0.9 * Math.sin(t / 1400), 0, 1)), fx = x - s * 0.25, fy = y + s * 0.1, mx = fx + m * s * 0.82, my = fy - m * s * 0.3 - s * 0.03, rot = m * 0.2, hx = x + s * 0.7, hy = y + s * 0.88;
  face(c, fx, fy, s * 0.6, '#ecc79c', '#241a18');
  paper(c, function (q) { q.beginPath(); q.arc(fx, fy, s * 0.6, 0, Math.PI); q.closePath(); }, 'rgba(0,0,0,0)', 0);
  line(c, [[fx - s * 0.28, fy - s * 0.03], [fx - s * 0.16, fy - s * 0.09], [fx - s * 0.06, fy - s * 0.03]], '#2a1a12', Math.max(1.2, s * 0.035)); line(c, [[fx + s * 0.06, fy - s * 0.03], [fx + s * 0.16, fy - s * 0.09], [fx + s * 0.28, fy - s * 0.03]], '#2a1a12', Math.max(1.2, s * 0.035));
  c.save(); c.strokeStyle = '#9c3a2a'; c.lineWidth = Math.max(1.4, s * 0.04); c.lineCap = 'round'; c.beginPath(); c.arc(fx, fy + s * 0.12, s * 0.2, 0.25, Math.PI - 0.25); c.stroke(); c.restore();
  c.save(); c.fillStyle = 'rgba(217,100,100,.3)'; c.beginPath(); c.arc(fx - s * 0.36, fy + s * 0.14, s * 0.07, 0, TAU); c.arc(fx + s * 0.36, fy + s * 0.14, s * 0.07, 0, TAU); c.fill(); c.restore();
  var bx = mx - Math.sin(rot) * s * 0.7, by = my + Math.cos(rot) * s * 0.7;
  line(c, [[mx, my + s * 0.45], [hx, hy - s * 0.1]], '#a8703a', Math.max(2, s * 0.06));
  paper(c, ell(hx, hy, s * 0.11, s * 0.09), '#c98b62', 0.6); paper(c, poly([[hx - s * 0.1, hy + s * 0.04], [hx + s * 0.2, hy + s * 0.12], [hx + s * 0.2, hy + s * 0.3], [hx - s * 0.2, hy + s * 0.3]]), INDIGO, 0.5);
  c.save(); c.translate(mx, my); c.rotate(rot);
  var w = s * 0.4, h = s * 0.5;
  paper(c, poly([[-w * 0.7, -h * 0.82], [-w * 0.45, -h * 1.12], [-w * 0.2, -h * 0.9], [0, -h * 1.25], [w * 0.2, -h * 0.9], [w * 0.45, -h * 1.12], [w * 0.7, -h * 0.82]]), GOLD, 1.2);
  paper(c, function (q) { q.beginPath(); q.moveTo(0, -h); q.bezierCurveTo(w * 1.1, -h, w * 1.1, -h * 0.1, w * 0.55, h * 0.45); q.lineTo(0, h); q.lineTo(-w * 0.55, h * 0.45); q.bezierCurveTo(-w * 1.1, -h * 0.1, -w * 1.1, -h, 0, -h); q.closePath(); }, '#3f9a52', 1.4);
  [-1, 1].forEach(function (d) { paper(c, function (q) { q.beginPath(); q.moveTo(d * w * 0.15, -h * 0.25); q.quadraticCurveTo(d * w * 0.55, -h * 0.5, d * w * 0.8, -h * 0.2); q.quadraticCurveTo(d * w * 0.5, -h * 0.02, d * w * 0.15, -h * 0.25); q.closePath(); }, CREAM, 0.3); dot(c, d * w * 0.5, -h * 0.25, w * 0.1, '#1b1410'); line(c, [[d * w * 0.1, -h * 0.5], [d * w * 0.55, -h * 0.62], [d * w * 0.85, -h * 0.4]], LRED, Math.max(1.2, s * 0.04)); });
  line(c, [[0, -h * 0.25], [-w * 0.08, h * 0.12], [w * 0.08, h * 0.12]], '#2f7a42', Math.max(1.2, s * 0.04));
  paper(c, function (q) { q.beginPath(); q.moveTo(-w * 0.4, h * 0.38); q.quadraticCurveTo(0, h * 0.62, w * 0.4, h * 0.38); q.quadraticCurveTo(0, h * 0.3, -w * 0.4, h * 0.38); q.closePath(); }, '#b8201a', 0.3);
  poly([[-w * 0.3, h * 0.4], [-w * 0.2, h * 0.58], [-w * 0.1, h * 0.43]])(c); c.fillStyle = CREAM; c.fill(); poly([[w * 0.3, h * 0.4], [w * 0.2, h * 0.58], [w * 0.1, h * 0.43]])(c); c.fill();
  c.restore();
};

R['x:notebook'] = function (c, x, y, s, t) {
  var cyc = (t / 5000) % 1, wr = Math.min(1, cyc / 0.8), fl = cyc > 0.8 ? (cyc - 0.8) / 0.2 : 0, i;
  bg(c, x, y, s * 0.93, '#eadcb6', 0.3);
  paper(c, poly([[x - s * 0.98, y - s * 0.56], [x, y - s * 0.46], [x + s * 0.98, y - s * 0.56], [x + s * 0.98, y + s * 0.68], [x, y + s * 0.74], [x - s * 0.98, y + s * 0.68]]), '#7a1f1a', 1.4);
  paper(c, poly([[x - s * 0.92, y - s * 0.5], [x, y - s * 0.4], [x, y + s * 0.64], [x - s * 0.92, y + s * 0.56]]), '#fbf3df', 0.5);
  paper(c, poly([[x, y - s * 0.4], [x + s * 0.92, y - s * 0.5], [x + s * 0.92, y + s * 0.56], [x, y + s * 0.64]]), '#f7edd2', 0.5);
  function ln(side, k) { var f = (k + 1) / 7, x0 = x + side * s * 0.1, x1 = x + side * s * 0.82, y0 = lerp(y - s * 0.4 + 0.0, y + s * 0.64, f) - side * s * 0.0, yEnd = lerp(y - s * 0.5, y + s * 0.56, f); return [[x0, lerp(y - s * 0.4, y + s * 0.64, f) - s * 0.0], [x1, yEnd]]; }
  c.strokeStyle = 'rgba(31,74,107,.35)'; c.lineWidth = Math.max(0.8, s * 0.012); for (i = 0; i < 6; i++) for (var sd = -1; sd <= 1; sd += 2) { var L = ln(sd, i); c.beginPath(); c.moveTo(L[0][0], L[0][1]); c.lineTo(L[1][0], L[1][1]); c.stroke(); }
  function scribble(side, k, p) { var L = ln(side, k), pts = [], n = 14; for (var q = 0; q <= n * p; q++) { var u = q / n; pts.push([lerp(L[0][0], L[1][0], u * 0.95), lerp(L[0][1], L[1][1], u * 0.95) - s * 0.03 - (q % 2 ? s * 0.035 : 0) - (q % 5 === 0 ? s * 0.03 : 0)]); } return pts; }
  for (i = 0; i < 4; i++) { var pp = scribble(-1, i, 1 - i * 0.12); if (pp.length > 1) line(c, pp, 'rgba(42,26,20,.75)', Math.max(0.9, s * 0.02)); }
  var tip = null;
  if (fl === 0) {
    for (i = 0; i < 4; i++) { var seg = clamp(wr * 4 - i, 0, 1); if (seg > 0) { var ps = scribble(1, i, seg); if (ps.length > 1) line(c, ps, 'rgba(122,31,26,.9)', Math.max(0.9, s * 0.022)); if (seg < 1 && ps.length) tip = ps[ps.length - 1]; } }
    if (!tip) { var lp = scribble(1, 3, 1); tip = lp[lp.length - 1]; tip = [tip[0] + s * 0.15, tip[1] + s * 0.25]; }
  } else tip = [x + s * 0.5, y + s * 0.45];
  if (fl > 0) {
    var ang = fl * Math.PI, cs = Math.cos(ang), lift = Math.sin(ang) * s * 0.18, sx = x + (cs * s * 0.92);
    paper(c, poly([[x, y - s * 0.4], [x + cs * s * 0.92, y - s * 0.5 - lift], [x + cs * s * 0.92, y + s * 0.56 - lift], [x, y + s * 0.64]]), cs > 0 ? '#fffaf0' : '#f2e8cc', 0.9 + Math.sin(ang));
    if (cs > 0) { c.strokeStyle = 'rgba(122,31,26,.7)'; c.lineWidth = Math.max(0.9, s * 0.02); for (i = 0; i < 4; i++) { var ps2 = scribble(1, i, 1); c.beginPath(); ps2.forEach(function (p, k) { var px = x + (p[0] - x) * cs, py = p[1] - lift * (p[0] - x) / (s * 0.92); k ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); } }
  }
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = Math.max(1, s * 0.02); c.beginPath(); c.moveTo(x, y - s * 0.4); c.lineTo(x, y + s * 0.64); c.stroke();
  paper(c, rect(x + s * 0.04, y + s * 0.5, s * 0.05, s * 0.4), '#d9342b', 0.3);
  c.save(); c.translate(tip[0], tip[1]); c.rotate(-1.0 + Math.sin(t / 130) * 0.04 * (fl === 0 ? 1 : 0));
  paper(c, poly([[0, 0], [s * 0.06, -s * 0.04], [s * 0.8, -s * 0.05], [s * 0.8, s * 0.05], [s * 0.06, s * 0.04]]), '#2f4a6b', 1.5);
  paper(c, poly([[0, 0], [s * 0.1, -s * 0.03], [s * 0.1, s * 0.03]]), GOLD, 0.4); paper(c, rect(s * 0.74, -s * 0.055, s * 0.06, s * 0.11), GOLD, 0.4);
  c.restore();
};

R['x:wander'] = function (c, x, y, s, t) {
  var u = (t / 6500) % 1, px = lerp(x - s * 0.7, x + s * 0.7, u), al = Math.min(sm(u * 7), sm((1 - u) * 7));
  function pyf(q) { return y + s * 0.62 + Math.sin((q - x) / s * 3.3) * s * 0.13; }
  bg(c, x, y, s * 0.93, '#26336a', 0.3);
  for (var j = 0; j < 7; j++) star(c, x + Math.cos(j * 2.7 + 0.4) * s * 0.65, y - s * 0.3 + Math.sin(j * 1.9) * s * 0.4, s * 0.05, 0.3 + 0.6 * Math.abs(Math.sin(t / 650 + j)), '#ffe9a0');
  paper(c, ball(x - s * 0.5, y - s * 0.55, s * 0.17, 3), '#f4efe0', 0.3); c.fillStyle = '#26336a'; c.beginPath(); c.arc(x - s * 0.42, y - s * 0.6, s * 0.15, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(x, y, s * 0.93, 0, TAU); c.clip();
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.93, y + s * 0.6); q.quadraticCurveTo(x - s * 0.5, y + s * 0.05, x, y + s * 0.4); q.quadraticCurveTo(x + s * 0.5, y + s * 0.05, x + s * 0.93, y + s * 0.5); q.lineTo(x + s * 0.93, y + s * 0.8); q.lineTo(x - s * 0.93, y + s * 0.8); q.closePath(); }, '#16204a', 0.5);
  var a = [], b = []; for (j = 0; j <= 24; j++) { var q2 = x - s * 0.95 + j / 24 * s * 1.9, yy = pyf(q2); a.push([q2, yy - s * 0.1]); b.unshift([q2, yy + s * 0.1]); }
  paper(c, poly(a.concat(b)), '#5a6aa0', 0.5);
  c.restore();
  var p = t / 300, sn = Math.sin(p), gy = pyf(px) + s * 0.03;
  c.save(); c.globalAlpha = al;
  var me = figure(c, px, gy, s * 0.95, { lean: 0.04, seat: 0.47, legs: [sn * 0.5, -0.4 - 0.5 * Math.max(0, -Math.cos(p)), -sn * 0.5, -0.4 - 0.5 * Math.max(0, Math.cos(p))], arms: [0.55, 1.2, sn * 0.4, 0.3] }, { dir: 1, garb: 'casual', long: true, col: '#d9a03a', low: '#4a3a5a', skin: '#c98b62', hair: 1 });
  var h = me.hand[0], fl = 0.85 + 0.15 * Math.sin(t / 130) * Math.sin(t / 91);
  halo(c, h[0] + s * 0.02, h[1] + s * 0.18, s * 0.6, '255,190,90', 0.6 * fl);
  line(c, [h, [h[0] + s * 0.02, h[1] + s * 0.07]], '#3a2a1a', Math.max(1, s * 0.02));
  paper(c, ell(h[0] + s * 0.02, h[1] + s * 0.17, s * 0.09, s * 0.11), '#e8902a', 0.7); c.fillStyle = 'rgba(255,245,180,' + fl + ')'; c.beginPath(); c.ellipse(h[0] + s * 0.02, h[1] + s * 0.17, s * 0.04, s * 0.06, 0, 0, TAU); c.fill();
  c.restore();
};

R['x:trail'] = function (c, x, y, s, t) {
  var N = 7, prog = (t / 620) % (N + 4), fade = prog > N + 2 ? 1 - (prog - N - 2) / 2 : 1, j;
  bg(c, x, y, s * 0.93, '#bfe0ea', 0.3);
  c.save(); c.beginPath(); c.arc(x, y, s * 0.93, 0, TAU); c.clip();
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.96, y - s * 0.3); for (var k = 0; k <= 16; k++) q.lineTo(x - s * 0.96 + k / 16 * s * 1.92, y - s * 0.3 + Math.sin(k * 1.3 + t / 700) * s * 0.025); q.lineTo(x + s * 0.96, y + s * 0.9); q.lineTo(x - s * 0.96, y + s * 0.9); q.closePath(); }, '#4b8fc9', 0.6);
  c.save(); c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = Math.max(1, s * 0.02); for (j = 0; j < 6; j++) { var wy = y - s * 0.12 + j * s * 0.15, wx = x - s * 0.8 + ((j * 0.37 + t / 4000) % 1) * s * 1.2; c.beginPath(); c.moveTo(wx, wy); c.quadraticCurveTo(wx + s * 0.12, wy - s * 0.04, wx + s * 0.24, wy); c.stroke(); } c.restore();
  paper(c, function (q) { q.beginPath(); q.moveTo(x - s * 0.97, y + s * 0.9); q.lineTo(x - s * 0.97, y + s * 0.35); q.bezierCurveTo(x - s * 0.7, y + s * 0.25, x - s * 0.5, y + s * 0.5, x - s * 0.35, y + s * 0.9); q.closePath(); }, '#4f8a46', 0.8);
  paper(c, function (q) { q.beginPath(); q.moveTo(x + s * 0.97, y - s * 0.3); q.lineTo(x + s * 0.97, y + s * 0.25); q.bezierCurveTo(x + s * 0.75, y + s * 0.2, x + s * 0.55, y - s * 0.05, x + s * 0.5, y - s * 0.3); q.closePath(); }, '#5f9a52', 0.8);
  c.restore();
  var sp = [[-0.45, 0.5], [-0.28, 0.35], [-0.08, 0.38], [0.1, 0.18], [0.0, 0.0], [0.2, -0.08], [0.4, 0.0]];
  for (j = 0; j < N; j++) {
    var sc = j < Math.floor(prog) ? 1 : j === Math.floor(prog) ? back(prog - j) : 0; if (sc <= 0.02) continue;
    var sx = x + sp[j][0] * s, sy = y + sp[j][1] * s, r = s * (0.11 + (j % 3) * 0.02);
    if (j === Math.floor(prog)) { var rp = prog - j; c.save(); c.globalAlpha = (1 - rp) * 0.8 * fade; c.strokeStyle = '#e8f6ff'; c.lineWidth = Math.max(1, s * 0.02); c.beginPath(); c.ellipse(sx, sy + r * 0.2, r * (1.1 + rp * 1.4), r * (0.5 + rp * 0.5), 0, 0, TAU); c.stroke(); c.restore(); }
    c.save(); c.globalAlpha = fade; c.translate(sx, sy); c.scale(sc, sc);
    paper(c, ell(0, s * 0.03, r * 1.05, r * 0.55), '#7f786d', 0.8); paper(c, ell(0, 0, r, r * 0.52, 0), j % 2 ? '#aaa395' : '#b4ad9f', 0.6); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.ellipse(-r * 0.2, -r * 0.1, r * 0.45, r * 0.18, 0, 0, TAU); c.fill();
    c.restore();
  }
  c.save(); c.translate(x + s * 0.7, y + s * 0.55); c.rotate(Math.sin(t / 1500) * 0.05); paper(c, ell(0, 0, s * 0.2, s * 0.08), '#3f8a42', 0.5); paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.08, -s * 0.02); q.quadraticCurveTo(-s * 0.02, -s * 0.2, 0, -s * 0.12); q.quadraticCurveTo(s * 0.02, -s * 0.2, s * 0.08, -s * 0.02); q.closePath(); }, '#f08aa8', 0.5); c.restore();
};

R['x:net'] = function (c, x, y, s, t) {
  var cols = ['#e8b84a', '#d9342b', '#3fa0d9', '#5fbf6a', '#c870d9'], P = [], i, j;
  bg(c, x, y, s * 0.93, '#1f2f5b', 0.3);
  for (i = 0; i < 5; i++) { P.push([]); for (j = 0; j < 5; j++) P[i].push([x + (i - j) * s * 0.215 + Math.sin(t / 900 + i * 0.7 + j * 0.4) * s * 0.012, y + (i + j - 4) * s * 0.17 + Math.sin(t / 1100 + j) * s * 0.012 + Math.abs(i - j) * 0.0]); }
  c.save(); c.strokeStyle = 'rgba(232,184,74,.75)'; c.lineWidth = Math.max(0.9, s * 0.02); for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) { if (i < 4) { c.beginPath(); c.moveTo(P[i][j][0], P[i][j][1]); c.lineTo(P[i + 1][j][0], P[i + 1][j][1]); c.stroke(); } if (j < 4) { c.beginPath(); c.moveTo(P[i][j][0], P[i][j][1]); c.lineTo(P[i][j + 1][0], P[i][j + 1][1]); c.stroke(); } } c.restore();
  for (i = 0; i < 5; i++) for (j = 0; j < 5; j++) {
    var d = Math.sqrt((i - 2) * (i - 2) + (j - 2) * (j - 2)), g = Math.pow(Math.max(0, Math.sin(t / 380 - d * 1.5)), 6), r = s * (0.075 + 0.04 * g), p = P[i][j];
    paper(c, poly([[p[0], p[1] - r * 1.25], [p[0] + r, p[1]], [p[0], p[1] + r * 1.25], [p[0] - r, p[1]]]), cols[(i * 2 + j) % 5], 0.3 + g);
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.moveTo(p[0], p[1] - r * 1.1); c.lineTo(p[0] + r * 0.4, p[1] - r * 0.2); c.lineTo(p[0] - r * 0.2, p[1]); c.fill();
    star(c, p[0], p[1], s * 0.22 * g + 0.001, g * 1.2, '#ffffff');
  }
};

R['x:garden'] = function (c, x, y, s, t) {
  var gy = y + s * 0.85;
  bg(c, x, y, s * 0.93, '#d6ecee', 0.3);
  paper(c, ball(x + s * 0.5, y - s * 0.6, s * 0.15, 3), GOLD, 0.3);
  paper(c, ell(x, gy + s * 0.02, s * 0.96, s * 0.17), '#5f9a52', 0.5);
  c.save(); c.translate(x - s * 0.6, gy); c.rotate(Math.sin(t / 1000) * 0.03);
  paper(c, function (q) { q.beginPath(); q.moveTo(-s * 0.04, 0); q.quadraticCurveTo(-s * 0.12, -s * 0.5, s * 0.02, -s * 0.9); q.lineTo(s * 0.08, -s * 0.9); q.quadraticCurveTo(s * 0.0, -s * 0.5, s * 0.05, 0); q.closePath(); }, '#9a6a3a', 0.8);
  for (var j = 0; j < 7; j++) { var a = -2.9 + j * 0.5 + Math.sin(t / 700 + j) * 0.05; leaf(c, s * 0.04, -s * 0.9, s * 0.5, s * 0.1, a, j % 2 ? '#3f8a42' : '#5fae4c', 0.5); }
  dot(c, s * 0.0, -s * 0.84, s * 0.05, '#7a5a2a'); dot(c, s * 0.08, -s * 0.82, s * 0.05, '#7a5a2a');
  c.restore();
  c.save(); c.translate(x + s * 0.05, gy); c.rotate(Math.sin(t / 1300 + 1) * 0.025);
  paper(c, poly([[-s * 0.07, 0], [s * 0.07, 0], [s * 0.05, -s * 0.8], [-s * 0.05, -s * 0.8]]), '#7a4a2a', 0.8);
  [[0, -1.2, 0.46, '#2f6b3a'], [-0.28, -1.0, 0.33, '#3f8a42'], [0.3, -1.02, 0.34, '#4f9a4a'], [0.0, -0.95, 0.3, '#3a7a3e']].forEach(function (b, i) { paper(c, ball(b[0] * s, b[1] * s * 0.82, b[2] * s, 4 + i), b[3], 0.9); });
  [[-0.2, -1.2], [0.2, -1.0], [0.05, -1.35]].forEach(function (p) { dot(c, p[0] * s, p[1] * s * 0.82, s * 0.04, '#f2b83a'); });
  c.restore();
  c.save(); c.translate(x + s * 0.7, gy); c.rotate(Math.sin(t / 800 + 2) * 0.05);
  line(c, [[0, 0], [s * 0.02, -s * 0.4]], '#8a5a3a', s * 0.04);
  paper(c, ball(s * 0.02, -s * 0.5, s * 0.17, 8), '#7fc05a', 0.7); leaf(c, s * 0.02, -s * 0.3, s * 0.22, s * 0.07, -0.5, '#6aae4e', 0.4); leaf(c, s * 0.02, -s * 0.3, s * 0.2, s * 0.07, -2.7, '#6aae4e', 0.4);
  c.restore();
  var fc = ['#e5567f', '#fffdf4', '#f2b83a']; for (j = 0; j < 7; j++) dot(c, x - s * 0.85 + j * s * 0.28, gy + s * 0.04 + (j % 2) * s * 0.05, s * 0.03, fc[j % 3]);
};

R['x:search'] = function (c, x, y, s, t) {
  var L = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ญ', 'ด', 'ต', 'ถ', 'ท', 'น', 'ม'], lx = x + Math.sin(t / 1300) * s * 0.4, ly = y - s * 0.03 + Math.sin(t / 870) * s * 0.12, r = s * 0.4, j;
  function px(k) { return x + ((k % 5) - 2) * s * 0.34; }
  function py(k) { return y - s * 0.03 + (Math.floor(k / 5) - 1) * s * 0.36; }
  paper(c, rect(x - s * 0.93, y - s * 0.6, s * 1.86, s * 1.2), CREAM, 1.2);
  for (j = 0; j < 15; j++) txt(c, L[j], px(j), py(j), s * 0.27, 'rgba(122,31,26,.8)');
  var hx = lx + r * 0.72, hy = ly + r * 0.72;
  line(c, [[hx, hy], [hx + s * 0.4, hy + s * 0.4]], '#6a3a1a', Math.max(3, s * 0.1)); line(c, [[hx, hy], [hx + s * 0.1, hy + s * 0.1]], GOLD, Math.max(3.5, s * 0.115));
  paper(c, ball(lx, ly, r + s * 0.05, 3), GOLD, 1.4);
  c.save(); c.beginPath(); c.arc(lx, ly, r, 0, TAU); c.clip(); c.fillStyle = '#fffaf0'; c.fillRect(lx - r, ly - r, r * 2, r * 2);
  c.translate(lx, ly); c.scale(1.8, 1.8); c.translate(-lx, -ly);
  for (j = 0; j < 15; j++) txt(c, L[j], px(j), py(j), s * 0.27, RED);
  c.restore();
  c.save(); c.beginPath(); c.arc(lx, ly, r, 0, TAU); c.clip(); c.fillStyle = 'rgba(150,200,240,.18)'; c.fillRect(lx - r, ly - r, r * 2, r * 2); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = Math.max(1.2, s * 0.03); c.beginPath(); c.arc(lx, ly, r * 0.8, Math.PI * 1.1, Math.PI * 1.42); c.stroke(); c.restore();
  c.save(); c.strokeStyle = '#a8761c'; c.lineWidth = Math.max(1, s * 0.025); c.beginPath(); c.arc(lx, ly, r, 0, TAU); c.stroke(); c.restore();
};

R['x:speak'] = function (c, x, y, s, t) {
  var x0 = x - s * 0.3, m = Math.pow(Math.abs(Math.sin(t / 290)), 1.3) * (0.55 + 0.45 * Math.abs(Math.sin(t / 770))), ry = s * (0.04 + 0.2 * m), j;
  bg(c, x - s * 0.1, y, s * 0.93, '#f1d7ac', 0.3);
  for (j = 0; j < 3; j++) { var u = ((t / 1200) + j / 3) % 1, rr = s * (0.28 + u * 0.55); c.save(); c.globalAlpha = Math.sin(u * Math.PI) * 0.9; c.strokeStyle = j % 2 ? GOLD : '#d9342b'; c.lineWidth = Math.max(1.6, s * 0.065 * (1 - u * 0.5)); c.lineCap = 'round'; c.beginPath(); c.arc(x0 + s * 0.4, y, rr, -0.75, 0.75); c.stroke(); c.restore(); }
  paper(c, ell(x0, y, s * 0.6, ry + s * 0.17), '#d9456a', 1.2);
  paper(c, ell(x0, y - s * 0.05 - ry * 0.4, s * 0.52, s * 0.09 + ry * 0.3), '#e5668a', 0.2);
  c.fillStyle = '#4a1018'; c.beginPath(); c.ellipse(x0, y, s * 0.44, ry, 0, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.ellipse(x0, y, s * 0.44, ry, 0, 0, TAU); c.clip();
  c.fillStyle = '#fffaf0'; c.fillRect(x0 - s * 0.44, y - ry, s * 0.88, Math.min(ry * 0.8, s * 0.1));
  c.fillStyle = '#e8758a'; c.beginPath(); c.ellipse(x0, y + ry * 0.95, s * 0.26, ry * 0.7, 0, 0, TAU); c.fill();
  c.restore();
  c.strokeStyle = 'rgba(122,31,26,.55)'; c.lineWidth = Math.max(1, s * 0.022); c.beginPath(); c.moveTo(x0 - s * 0.58, y); c.lineTo(x0 - s * 0.46, y); c.moveTo(x0 + s * 0.46, y); c.lineTo(x0 + s * 0.58, y); c.stroke();
};

var KEYS = Object.keys(R);
window.MDKHAMMARKS = {
  keys: KEYS,
  draw: function (key, c, x, y, s, t) { var f = R[key]; if (!f) return false; c.save(); f(c, x, y, s, t || 0); c.restore(); return true; }
};
})();
