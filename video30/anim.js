// ===== camada de animação: movimento sutil, entradas/saídas de rótulos, câmera por cena =====
window.ANIM = { t: 0, d: 8, p: 0, dir: 0, text: false, probe: false };
const clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x, sstep = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
const env = (t, a, b, c, d) => sstep((t - a) / (b - a)) * (1 - sstep((t - c) / (d - c)));   // sobe a..b, desce c..d
const ph = (x, y) => x * .013 + y * .007;
const SS=(ctx)=>{const c=ANIM.cam||{z:1,x:W/2,y:H/2};ctx.translate(c.x,c.y);ctx.scale(1/c.z,1/c.z);ctx.translate(-W/2,-H/2);};
(function () {
  const wrapShip = (name, o) => { const f = window[name]; if (!f) return; window[name] = function (ctx, x, y, s = 1, op = {}) {
    const t = ANIM.t, p = ph(x, y); ctx.save(); ctx.translate(x, y + Math.sin(t * 1.05 + p) * (o.bob || 1.4) * s); ctx.rotate(Math.sin(t * .8 + p) * (o.rock || .004)); ctx.translate(-x, -y);
    let adv = 0; if (o.move) { const dir = op.flip ? -1 : 1; ANIM.dir = dir; adv = dir * (ANIM.p - .5) * o.move * s; }
    f(ctx, x + adv, y, s, op); ctx.restore(); }; };
  wrapShip('battleship', { bob: 1.6, rock: .0035 }); wrapShip('austrianBB', { bob: 1.4, rock: .003 }); wrapShip('destroyer', { bob: 1.8, rock: .006 }); wrapShip('tanker', { bob: 1.2, rock: .0025 }); wrapShip('carrier', { bob: 1.2, rock: .0025 });
  wrapShip('submarine', { bob: 1.4, rock: .005, move: 70 }); wrapShip('aircraftRAF', { bob: 2.4, rock: .006, move: 240 });
  const _mc = window.maialeCrew; window.maialeCrew = function (ctx, x, y, s, rot, o = {}) { const t = ANIM.t, dir = o.flip ? 1 : -1; ANIM.dir = dir; const adv = dir * (ANIM.p - .5) * 90 * s;
    _mc(ctx, x + adv, y + Math.sin(t * 1.3 + x * .01) * 3.2 * s, s, rot + Math.sin(t * .8 + 1) * .014 * (o.flip ? -1 : 1), o); };
  const _mg = window.mignatta; window.mignatta = function (ctx, x, y, s = 1, o = {}) { const t = ANIM.t, dir = o.flip ? 1 : -1; ANIM.dir = dir; const adv = dir * (ANIM.p - .5) * 90 * s;
    ctx.save(); const yy = y + Math.sin(t * 1.2) * 3; ctx.translate(x + adv, yy); ctx.rotate(Math.sin(t * .8) * .012 * dir); ctx.translate(-(x + adv), -yy); _mg(ctx, x + adv, yy, s, o); ctx.restore(); };
  const _m = window.maiale; window.maiale = function (ctx, x, y, s = 1, rot = 0, o = {}) { const t = ANIM.t; _m(ctx, x, y + Math.sin(t * 1.1 + x * .01) * 1.6, s, rot + Math.sin(t * .7 + y) * .006, o); };
  const _pp = window.puppet2D; window.puppet2D = function (ctx, x, y, s = 1, o = {}) { const t = ANIM.t, p = x * .021 + y * .013; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.15 + p) * .013); ctx.translate(-x, -y + Math.sin(t * 1.9 + p) * .9 * s);
    _pp(ctx, x, y, s, o); ctx.restore(); };
  const _dv = window.diver; window.diver = function (ctx, x, y, s = 1, o = {}) { const t = ANIM.t; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 1.6 + x * .02) * .012); ctx.translate(-x, -y); _dv(ctx, x, y, s, o); ctx.restore(); };
  const _sw = window.swimmer; window.swimmer = function (ctx, x, y, s = 1, o = {}) { const t = ANIM.t, op = { ...o }; if (op.kick == null) op.kick = Math.sin(t * 4.2 + x * .03) * .8; if (op.open == null) op.open = .45 + .4 * Math.sin(t * 2.2 + x * .02); ctx.save(); ctx.translate(x, y + Math.sin(t * 1.1 + x) * 2); ctx.rotate(Math.sin(t * .9) * .02); ctx.translate(-x, -y); _sw(ctx, x, y, s, op); ctx.restore(); };
  const _hd = window.heads; window.heads = function (ctx, x, y, s = 1) { _hd(ctx, x + Math.sin(ANIM.t * .7) * 2, y + Math.sin(ANIM.t * 1.4 + x) * 2.2, s); };
  const _mn = window.mine; window.mine = function (ctx, x, y, r, o = {}) { _mn(ctx, x, y + Math.sin(ANIM.t * .8 + x * .05) * 4, r, o); };
  // bolhas que sobem de verdade
  window.bubbles = function (ctx, x, y, n, seed = 3, s = 1) { const r = rng(seed), t = ANIM.t; ctx.save(); ctx.lineWidth = 1.3;
    for (let i = 0; i < n; i++) { const rr = (2 + r() * 5) * s, sp = (16 + r() * 22) * s, p0 = r() * 300, wob = r() * 7, range = (n * 15 + 50) * s, off = (t * sp + p0) % range, a = Math.min(1, off / 14) * (1 - off / range);
      ctx.globalAlpha = Math.max(0, a); ctx.strokeStyle = 'rgba(220,255,250,.75)'; ctx.fillStyle = 'rgba(220,255,250,.12)'; ctx.beginPath(); ctx.arc(x + (r() - .5) * 26 * s + Math.sin(t * 2 + i * 1.7) * wob * s, y - off, rr, 0, 7); ctx.fill(); ctx.stroke(); } ctx.restore(); };
  // ondas do mar em movimento
  window.sea = function (ctx, y, o = {}) { const t = ANIM.t; const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, o.top || '#13344d'); g.addColorStop(1, o.bot || '#06141f'); ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
    const r = rng(o.seed || 9); ctx.strokeStyle = o.wave || 'rgba(170,210,230,.16)'; ctx.lineWidth = 1.5;
    for (let i = 0; i < 70; i++) { const x0 = r() * W, yy0 = y + 4 + Math.pow(r(), 1.4) * (H - y - 6), w = 14 + r() * 50 * (1 + (yy0 - y) / 120), sp = 4 + r() * 7; const x = ((x0 + t * sp) % (W + 80)) - 40, yy = yy0 + Math.sin(t * .9 + i) * 1.4; ctx.beginPath(); ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + w / 2, yy - 3, x + w, yy); ctx.stroke(); } };
  // rótulos com entrada/saída
  const _tg = window.tag; window.tag = function (ctx, text, x, y, tx, ty, o) { const e = env(ANIM.t, .5, .95, Math.min(ANIM.d - .5, 4.4), Math.min(ANIM.d - .05, 4.9)); if (e <= 0.01) return 0; ctx.save(); SS(ctx); ctx.globalAlpha *= e; ctx.translate(0, (1 - e) * 14); const w = _tg(ctx, text, x, y, tx, ty, o); ctx.restore(); return w; };
  const _lt = window.lowerThird; window.lowerThird = function (ctx, a, b) { const e = env(ANIM.t, .5, 1.0, Math.min(ANIM.d - .5, 5.2), Math.min(ANIM.d - .05, 5.8)); if (e <= .01) return; ctx.save(); SS(ctx); ctx.globalAlpha *= e; ctx.translate((1 - e) * -26, 0); _lt(ctx, a, b); ctx.restore(); };
  const _cd = window.card; window.card = function (ctx, x, y, w, h, o = {}) { const e = env(ANIM.t, .35, .8, Math.min(ANIM.d - .45, 5.4), Math.min(ANIM.d - .05, 5.9)); if (e <= .01) return; ctx.save(); SS(ctx); ctx.globalAlpha *= e; const cx = x + w / 2, cy = y + h / 2, k = .93 + .07 * e; ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy); _cd(ctx, x, y, w, h, o); ctx.restore(); };
  const _ft = window.fadeText; window.fadeText = function (ctx, o) { ANIM.text = true; const e = env(ANIM.t, .5, 1.3, ANIM.d - .8, ANIM.d - .1), k = 1 + .025 * ANIM.p; ctx.save(); ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = e; ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2); _ft(ctx, { ...o, ls: o.ls || '6px' }); ctx.restore(); };
  const _rb = window.ringBlast; window.ringBlast = function (ctx, x, y, r) { const g = sstep(ANIM.t / 1.1), f = .35 + .65 * g; ctx.save(); ctx.globalAlpha = 1 - .55 * sstep((ANIM.t - 1.2) / 3); _rb(ctx, x, y, r * f); ctx.restore(); };
})();
