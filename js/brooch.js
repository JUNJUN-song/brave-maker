/* 브로치 보석 초상화 (확정 디자인 2026-11-13, docs/NOTES.md)
 * 용사 상반신 초상화의 망토 브로치에 상위 4개 능력치 색을 넣고, 브로치에서 부드러운 오라가 흘러나온다.
 *  - 색: 능력치 색 그대로의 보석 램프 (흰색=흰 보석, 검정=검은 보석, 회색=은빛, 유채색은 선명하게)
 *  - 섞기: 위에서부터 띠 [4위(5%), 2위, 1위, 3위(15%)] (약 72° 기울기, 2026-11-15), 띠 경계는 바둑판 디더. 비율 CONFIG.gem.ratios[4] (50:35:15:5 → 약 48·33·14·5%)
 *  - 오라: 둘레 빛(최대 4px) + 짧은 빛줄기 3가닥(최대 14px) + 빛 알갱이 6개, 20프레임 × 120ms
 *  - 같은 사람(시드)·같은 능력치면 언제나 같은 그림 (새로고침해도 그대로)
 */
window.BM = window.BM || {};
BM.brooch = (function () {
  const TAU = Math.PI * 2, LIGHT = Math.PI * 1.25, NF = 20, FRAME_MS = 120;
  const LOOKS = ['girl', 'boy'];

  // ---------- 보석 전용 색 ----------
  function hexToHsl(h) {
    let r = parseInt(h.substr(1, 2), 16) / 255, g = parseInt(h.substr(3, 2), 16) / 255, b = parseInt(h.substr(5, 2), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let hh = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; hh *= 60; }
    return [hh, s, l];
  }
  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map(v => Math.round(v * 255));
  }
  const toward = (h, t, k) => h + ((((t - h) % 360) + 540) % 360 - 180) * k;
  const rampCache = {}, WHITE = new WeakSet();   // WHITE = 흰 보석(신성력) 램프
  // 능력치 색 → 보석 6단계 램프 (0 가장 어두움 … 5 반짝임, [r,g,b])
  //  가운데(3단계)는 능력치 색의 밝기 그대로 → 흰색은 흰 보석, 검정은 검은 보석, 분홍은 분홍 보석으로 보인다 (2026-11-13 사용자 요청)
  function jewelRamp(hex) {
    if (rampCache[hex]) return rampCache[hex];
    const [h, s, l] = hexToHsl(hex), rgb = [1, 3, 5].map(i => parseInt(hex.substr(i, 2), 16) / 255);
    const chroma = Math.max(...rgb) - Math.min(...rgb);   // 아주 밝은 색은 HSL 채도가 높게 나와서 채도 대신 색 폭으로 판단
    let out;
    if (chroma < 0.12) {
      // 무채색: 색은 그대로 두고 밝기만 단계로 (원래 색의 옅은 기운만 유지)
      const S = Math.min(0.25, s), hh = chroma < 0.01 ? 225 : h;
      if (l > 0.85) {
        // 흰 보석(신성력): 빛 면은 순백, 그림자 면은 옅은 샴페인 금빛 — 보석 탭(gem.ramp)과 같은 '신성한 흰색' (2026-11-15)
        const HH = [40, 42, 44, 46, 48, 50], SS = [0.4, 0.36, 0.08, 0.05, 0.08, 0.15], LL = [0.68, 0.77, 0.88, 0.93, 0.965, 0.995];   // 금빛은 어두운 두 단계에만 (v1.7.7)
        out = LL.map((li, i) => hslToRgb(HH[i], SS[i], li));
        WHITE.add(out);
        return (rampCache[hex] = out);
      }
      const L = l < 0.3 ? [0.03, 0.06, 0.1, l, l + 0.1, l + 0.28]                         // 검은 보석: 검정, 반짝임만 회색
        : [l * 0.35, l * 0.55, l * 0.78, l, l + (1 - l) * 0.5, l + (1 - l) * 0.85];        // 은빛 보석
      out = L.map((li, i) => hslToRgb(hh, S * (i >= 4 ? 0.7 : 1), li));
    } else {
      // 유채색: 능력치 색의 색상·밝기는 그대로, 채도는 낮게(최대 약 0.5) → 원색처럼 쨍하지 않은 원석 느낌 (2026-11-13 "보석 색상 너무 원색이 안들어가게")
      //  예전: 채도 72% 이상으로 올리고 그림자를 푸른/보라 쪽으로 크게 이동 → 초록이 형광, 분홍 그림자가 자홍이 됐음
      const sat = Math.min(0.6, s) * 0.85, m = Math.min(0.75, Math.max(0.48, l + 0.03));   // 밝기는 능력치 색보다 아주 조금 밝게 (명세 10장 '조금 밝고')
      // 밝은 색(분홍·연보라)은 그림자를 덜 어둡고 덜 푸르게 → 진분홍·보라로 바뀌지 않고 제 색으로 보이게
      const k = Math.min(1, Math.max(0, (m - 0.57) / 0.15)), mix = (a, b) => a + (b - a) * k, sh = 1 - 0.5 * k;
      const L = [m * mix(0.28, 0.4), m * mix(0.49, 0.6), m * mix(0.74, 0.82), m, m + (1 - m) * 0.45, m + (1 - m) * 0.8];
      const H = [toward(h, 255, 0.15 * sh), toward(h, 255, 0.08 * sh), toward(h, 255, 0.03 * sh), h, toward(h, 50, 0.05), toward(h, 50, 0.1)];
      const S = [sat * 0.75, sat * 0.9, sat, sat, sat * 0.8, sat * 0.5];
      out = H.map((hh, i) => hslToRgb(hh, S[i], L[i]));
    }
    return (rampCache[hex] = out);
  }
  const css = c => 'rgb(' + c.join(',') + ')';
  function statCss(id, tone) { return css(jewelRamp(BM.STAT[id].color)[tone == null ? 3 : tone]); }

  // ---------- 초상화 리소스 ----------
  // 확정 디자인은 가로 137px 초상화 기준. 2026-11-13 초상화를 1.5배 픽셀(206px)로 다시 뽑아서,
  // 오라 거리·디더 폭은 이 비율(sc)만큼 키워 화면에서 보이는 크기를 확정 디자인과 같게 한다
  const BASE_W = 137;
  const res = {};
  let readyP = null;
  function ready() {
    if (readyP) return readyP;
    const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
    readyP = Promise.all(LOOKS.map(async n => {
      const P = BM.PORTRAITS && BM.PORTRAITS[n]; if (!P) return;
      const [img, mk] = await Promise.all([load(P.img), load(P.mask)]); if (!img || !mk) return;
      const W = img.width, H = img.height, m = document.createElement('canvas'); m.width = W; m.height = H; m.getContext('2d').drawImage(mk, 0, 0);
      const md = m.getContext('2d').getImageData(0, 0, W, H).data, mask = new Uint8Array(W * H);
      let sx = 0, sy = 0, cnt = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
      for (let i = 0; i < W * H; i++) if (md[i * 4 + 3]) { mask[i] = 1; const x = i % W, y = (i / W) | 0; sx += x; sy += y; cnt++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      res[n] = { img, W, H, mask, cx: sx / cnt, cy: sy / cnt, r: Math.max(x1 - x0, y1 - y0) / 2 + 0.5, sc: W / BASE_W };
    })).then(() => res);
    return readyP;
  }
  const isReady = look => !!res[look];

  // ---------- 브로치 칠하기 (대각선 띠 + 디더 + 컷팅 명암) ----------
  function paint(d, W, H, mask, colors, ratios, seed) {
    const idx = []; let sx = 0, sy = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (let i = 0; i < W * H; i++) if (mask[i]) { const x = i % W, y = (i / W) | 0; idx.push(i); sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const cx = sx / idx.length + 0.5, cy = sy / idx.length + 0.5, R = Math.max(x1 - x0, y1 - y0) / 2 + 0.5;
    const ramps = colors.map(id => jewelRamp(BM.STAT[id].color));
    const inM = (x, y) => x >= 0 && y >= 0 && x < W && y < H && mask[y * W + x];
    const rnd = BM.util.rng(BM.util.hash(seed, 'jewel'));
    // 4색(2026-11-15 사용자 요청): 위에서부터 4위(5%) · 2위 · 1위 · 3위(15%) — 띠를 약 72°로 세워 위·아래로 나뉘어 보이게 (대각선 느낌은 조금 남김)
    // 그 밖의 색 수(예전 저장분): 좌상단부터 대각선 띠 2위·1위·3위·4위·5위
    const four = colors.length === 4, tilt = (rnd() - 0.5) * (four ? 0.2 : 0.6), ang = (four ? Math.PI * 0.4 : Math.PI / 4) + tilt, ux = Math.cos(ang), uy = Math.sin(ang);
    const order = four ? [3, 1, 0, 2] : [1, 0, 2, 3, 4].filter(k => k < colors.length), share = order.map(k => ratios[k]);
    const sorted = idx.map(i => ({ i, u: ((i % W) + 0.5 - cx) * ux + (((i / W) | 0) + 0.5 - cy) * uy })).sort((a, b) => a.u - b.u);
    const band = new Int8Array(W * H).fill(-1), cuts = []; let pos = 0;
    order.forEach((rk, bi) => {
      const n = bi === order.length - 1 ? sorted.length - pos : Math.round(sorted.length * share[bi]);
      for (let k = pos; k < pos + n; k++) band[sorted[k].i] = rk;
      pos += n; if (bi < order.length - 1) cuts.push(sorted[Math.min(sorted.length - 1, pos)].u);
    });
    const colorOf = new Int8Array(W * H).fill(-1);
    sorted.forEach(({ i, u }) => {
      let rk = band[i];
      // 4색의 맨 위 얇은 띠(4위 5%)와 2위 사이는 바둑판 디더를 하지 않음 (섞이면 5% 띠가 거의 안 보임)
      for (let c = 0; c < cuts.length; c++) if (!(four && c === 0) && Math.abs(u - cuts[c]) < 0.9 * Math.max(1, W / BASE_W)) { const x = i % W, y = (i / W) | 0; rk = ((x + y) % 2 === 0) ? order[c] : order[c + 1]; break; }
      colorOf[i] = rk;
    });
    const rot = (rnd() * 8) | 0, facet = new Int8Array(W * H).fill(-2);
    idx.forEach(i => { const dx = (i % W) + 0.5 - cx, dy = ((i / W) | 0) + 0.5 - cy, oct = Math.max(Math.abs(dx), Math.abs(dy), (Math.abs(dx) + Math.abs(dy)) / Math.SQRT2); let a = Math.atan2(dy, dx); if (a < 0) a += TAU; facet[i] = oct < R * 0.42 ? -1 : (Math.floor(a / (TAU / 8)) + rot) % 8; });
    idx.forEach(i => {
      const x = i % W, y = (i / W) | 0, dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R, proj = dx * Math.cos(LIGHT) + dy * Math.sin(LIGHT), f = facet[i];
      let tone = f === -1 ? 3.6 + proj * 0.9 : 2.5 + Math.cos(((f - rot + 8) % 8) * TAU / 8 + TAU / 16 - LIGHT) * 1.25 + proj * 0.7;
      if (Math.hypot(dx, dy) > 0.8) tone -= 0.5;
      const rN = x + 1 < W ? facet[i + 1] : -2, bN = y + 1 < H ? facet[i + W] : -2;
      if ((rN !== -2 && rN !== f) || (bN !== -2 && bN !== f)) tone -= 1;
      let ti = Math.max(0, Math.min(5, Math.round(tone)));
      if (ti === 1 && WHITE.has(ramps[colorOf[i]]) && (f + 8) % 3 === 0) ti = 2;   // 흰 보석: 금빛 그림자 면 일부를 흰빛으로 (v1.7.8)
      let c = ramps[colorOf[i]][ti];
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !inM(x + a, y + b))) { const lit = (Math.cos(Math.atan2(dy, dx) - LIGHT) + 1) / 2; c = ramps[colorOf[i]][lit > 0.62 ? (four && colorOf[i] === 3 ? 4 : 5) : lit > 0.3 ? 3 : 1]; }   // 4위(5%) 테두리는 하얗게 날리지 않게
      d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2];
    });
    const put = (x, y, a) => { if (!inM(x, y)) return; const o = (y * W + x) * 4; for (let k = 0; k < 3; k++) d[o + k] = Math.round(d[o + k] + (255 - d[o + k]) * a); };
    const hx = Math.round(cx - 0.5 - R * 0.42), hy = Math.round(cy - 0.5 - R * 0.42);
    put(hx, hy, 1); put(hx + 1, hy, 0.9); put(hx, hy + 1, 0.8); put(hx + 1, hy + 1, 0.4);
    put(Math.round(cx - 0.5 + R * 0.45), Math.round(cy - 0.5 + R * 0.4), 0.55);
    const CX = Math.round(cx - 1), CY = Math.round(cy - 1);
    put(CX, CY, 0.85); put(CX + 1, CY, 0.4); put(CX - 1, CY, 0.4); put(CX, CY + 1, 0.4); put(CX, CY - 1, 0.4);
  }

  // ---------- 오라 (프레임마다) ----------
  const AURA = { sr: ['#c43f8a', '#f17eaf', '#ffd2e6'], al: ['#a9bbe6', '#e3ecff', '#ffffff'] };
  function auraFrame(P, colors, axes, f, seed) {
    const W = P.W, H = P.H, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const ph = f / NF, main = jewelRamp(BM.STAT[colors[0]].color).map(css), cx = P.cx, cy = P.cy, R = P.r, sc = P.sc || W / BASE_W;
    const px = (X, Y, col, a) => { X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X >= W || Y >= H) return; x.globalAlpha = a; x.fillStyle = col; x.fillRect(X, Y, 1, 1); };
    const soft = 0.5 + 0.5 * Math.sin(ph * TAU), ringW = 4.5 * sc, lim = Math.ceil(R + ringW + 1);
    for (let yy = -lim; yy <= lim; yy++) for (let xx = -lim; xx <= lim; xx++) {
      const d = Math.hypot(xx, yy * 1.1); if (d < R + 0.5 || d > R + ringW) continue;
      const k = 1 - (d - R) / ringW, b = ((xx + 40) * 7 + (yy + 40) * 13) % 4 / 4;
      if (k > b * 0.7 + 0.25) px(cx + xx, cy + yy, k > .6 ? main[5] : main[4], (0.12 + 0.28 * k) * (0.7 + 0.3 * soft));
    }
    const sr = axes && axes.sr != null ? axes.sr : 0.5, al = axes && axes.al != null ? axes.al : 0.5;
    const outer = sr >= al ? AURA.sr : AURA.al, outer2 = sr >= al ? AURA.al : AURA.sr;
    for (let j = 0; j < 3; j++) {
      const base = j / 3 * TAU + seed % 7 + 0.4;
      for (let s = 0; s <= 1; s += 0.02) {
        const flow = ((s * 2.2 - ph + j / 3) % 1 + 1) % 1; if (flow > 0.42) continue;
        const rad = R + sc + s * 14 * sc, ang = base + s * 1.6 + ph * TAU / 6;
        const X = cx + Math.cos(ang) * rad * 1.15, Y = cy + Math.sin(ang) * rad * 0.6 - s * 6 * sc;
        const col = s < 0.35 ? main[5] : (j === 1 ? outer2[2] : outer[2]);
        const a = Math.sin(flow / 0.42 * Math.PI) * (1 - s) * 0.7;
        if (a > 0.05) px(X, Y, col, a);
      }
    }
    const r = BM.util.rng(seed + 11);
    for (let k = 0; k < 6; k++) {
      const off = r(), life = (ph + off) % 1, a0 = r() * TAU;
      const X = cx + Math.cos(a0) * (R + sc + life * 5 * sc) * 1.1, Y = cy + Math.sin(a0) * R * 0.55 - life * (7 + r() * 5) * sc;
      px(X, Y, k % 2 === 0 ? '#ffffff' : outer[2], Math.sin(life * Math.PI) * 0.75);
    }
    const tw = Math.sin(ph * TAU * 2);
    if (tw > 0.6) { const a = (tw - .6) / .4, sx = cx - R * 0.35, sy = cy - R * 0.45; px(sx, sy, '#fff', 1); [1, 2].forEach(k => { px(sx + k, sy, '#fff', a * (1 - k / 3)); px(sx - k, sy, '#fff', a * (1 - k / 3)); px(sx, sy + k, '#fff', a * (1 - k / 3)); px(sx, sy - k, '#fff', a * (1 - k / 3)); }); }
    x.globalAlpha = 1;
    return c;
  }

  // ---------- 조립 (캐시) ----------
  // spec: { look: 'girl'|'boy', colors: [id × 4], seed, sr, al }
  function key(s) { return [s.look, s.colors.join(','), s.seed, Math.round((s.sr || 0) * 40), Math.round((s.al || 0) * 40), (s.ratios || []).map(v => Math.round(v * 200)).join(',')].join('|'); }
  const cache = new Map();
  function build(spec) {
    const look = LOOKS.includes(spec.look) ? spec.look : 'girl', P = res[look]; if (!P) return null;
    const k = key(Object.assign({}, spec, { look })); if (cache.has(k)) return cache.get(k);
    const colors = spec.colors.slice(0, BM.CONFIG.gem.colorCount), ratios = spec.ratios && spec.ratios.length === colors.length ? spec.ratios : BM.gem.ratios(spec.seed, colors.length);
    const base = document.createElement('canvas'); base.width = P.W; base.height = P.H; const bx = base.getContext('2d'); bx.drawImage(P.img, 0, 0);
    const im = bx.getImageData(0, 0, P.W, P.H); paint(im.data, P.W, P.H, P.mask, colors, ratios, spec.seed); bx.putImageData(im, 0, 0);
    const frames = [];
    for (let f = 0; f < NF; f++) {
      const c = document.createElement('canvas'); c.width = P.W; c.height = P.H; const x = c.getContext('2d');
      x.drawImage(base, 0, 0); x.drawImage(auraFrame(P, colors, { sr: spec.sr, al: spec.al }, f, spec.seed), 0, 0); frames.push(c);
    }
    const out = { look, colors, ratios, base, frames, W: P.W, H: P.H, cx: P.cx, cy: P.cy, r: P.r, seed: spec.seed, sr: spec.sr, al: spec.al };
    if (cache.size > 10) cache.clear(); cache.set(k, out);
    return out;
  }

  // 캔버스에 재생. opts.crop: 브로치 주변만 잘라 보기 — 숫자(정사각형 한 변) 또는 { w, h, dx, dy }(보석 중심에서 dx,dy 옮긴 직사각형)
  function Player(canvas, spec, opts) {
    opts = opts || {};
    const cr = !opts.crop ? null : typeof opts.crop === 'number' ? { w: opts.crop, h: opts.crop, dx: 0, dy: 0 } : Object.assign({ dx: 0, dy: 0 }, opts.crop);
    const ctx = canvas.getContext('2d'); let b = null, raf = 0, last = -1, alive = true;
    const reduced = () => opts.reducedMotion === true || (opts.reducedMotion !== false && BM.gem.prefersReduced());
    function draw(i) {
      if (!b) return;
      const src = b.frames;
      if (cr) {
        const sx = Math.round(b.cx + cr.dx - cr.w / 2), sy = Math.round(b.cy + cr.dy - cr.h / 2);
        if (canvas.width !== cr.w || canvas.height !== cr.h) { canvas.width = cr.w; canvas.height = cr.h; }
        ctx.clearRect(0, 0, cr.w, cr.h); ctx.drawImage(src[i], sx, sy, cr.w, cr.h, 0, 0, cr.w, cr.h);
      }
      else {
        if (canvas.width !== b.W) { canvas.width = b.W; canvas.height = b.H; }
        ctx.clearRect(0, 0, b.W, b.H); ctx.drawImage(src[i], 0, 0);
      }
    }
    function loop(t) {
      if (!alive) return;
      if (!canvas.isConnected) { alive = false; return; }
      if (b) { const i = reduced() ? 0 : Math.floor(t / FRAME_MS) % NF; if (i !== last) { draw(i); last = i; } }
      raf = requestAnimationFrame(loop);
    }
    const look = LOOKS.includes(spec.look) ? spec.look : 'girl', P0 = BM.PORTRAITS && BM.PORTRAITS[look];
    if (cr) { canvas.width = cr.w; canvas.height = cr.h; }
    else if (P0) { canvas.width = P0.W; canvas.height = P0.H; }     // 그림을 읽기 전에도 자리 크기를 맞춰 화면이 흔들리지 않게
    canvas.classList.add('px');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', (opts.crop ? '브로치 보석' : (look === 'boy' ? '남자' : '여자') + ' 용사 초상화. 브로치 보석') + ' 색: ' + spec.colors.slice(0, BM.CONFIG.gem.colorCount).map(id => BM.STAT[id].name).join(', '));
    ready().then(() => { if (!alive) return; b = build(spec); last = -1; draw(0); });
    raf = requestAnimationFrame(loop);
    return { stop() { alive = false; cancelAnimationFrame(raf); }, get built() { return b; } };
  }

  // 비율을 정수 %로 (합계 100, 큰 나머지 순)
  function percents(ratios) {
    const raw = ratios.map(r => r * 100), p = raw.map(Math.floor);
    let left = 100 - p.reduce((a, b) => a + b, 0);
    raw.map((v, i) => ({ i, f: v - Math.floor(v) })).sort((a, b) => b.f - a.f).forEach(o => { if (left > 0) { p[o.i]++; left--; } });
    return p;
  }

  return { ready, isReady, build, Player, jewelRamp, statCss, paint, percents, clearCache: () => cache.clear(), LOOKS, NF, FRAME_MS };
})();
