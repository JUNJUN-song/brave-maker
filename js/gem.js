/* 고유 보석 · 오오라 · 능력치 보석 렌더러 (Canvas 픽셀아트, 시드 고정)
 * 승인 원본: assets/APPROVED_signature_gem_aura_animated.gif
 *  - 둥근 다이아(상하좌우가 살짝 평평한 원형), 밝은 픽셀 테두리, 금속테 없음
 *  - 삼각 컷팅 면 모자이크, 좌상단 큰 하이라이트, 중앙 큰 십자 별빛
 *  - 보석 본체는 한 번만 그려 캐시 → 모든 프레임이 같은 본체를 그대로 사용 (절대 움직이지 않음)
 *  - 프레임마다 바뀌는 것: 중앙 별빛 밝기/길이, 표면 반짝임, 오오라, 별가루
 */
window.BM = window.BM || {};
BM.gem = (function () {
  const U = BM.util;
  const SIZE = 144, CX = 72, CY = 72, R = 34;
  const TAU = Math.PI * 2;
  const LIGHT = Math.PI * 1.25; // 좌상단에서 오는 빛
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];

  // ---------- 색 ----------
  function hexToRgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => U.clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
    }
    return [h * 360, s, l];
  }
  function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = U.clamp(s, 0, 1); l = U.clamp(l, 0, 1);
    if (s === 0) return rgbToHex(l * 255, l * 255, l * 255);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return rgbToHex(f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255);
  }
  function mix(a, b, t) { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
  function luminance(hex) { const [r, g, b] = hexToRgb(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

  // 6단계 램프 (0 어두움 → 5 가장 밝음). 어두운 쪽은 보랏빛으로, 밝은 쪽은 맑게 — 탁한 회색/갈색 방지
  const rampCache = {};
  const WHITE_RAMPS = new WeakSet();   // 흰 보석(신성력) 램프: 가장 어두운 단계(금빛)를 일부 면에서 흰빛으로
  function ramp(hex) {
    if (rampCache[hex]) return rampCache[hex];
    let [h, s, l] = rgbToHsl(...hexToRgb(hex));
    let L, S, H;
    if (l > 0.88) {            // 흰색 계열(신성력): 신성한 흰 보석 — 빛 면은 순백, 그림자 면은 옅은 샴페인 금빛 (2026-11-15 사용자: "회청이 안 예뻐, 약간 금색을 섞어 신성한 느낌")
      //  금빛은 그림자에만 옅게(지도력의 진한 금색과 헷갈리지 않게 밝기 높게·채도 낮게), 가장 밝은 두 단계는 거의 흰빛
      //  예전: 하늘색(채도 0.42~1) → 흰·연회색 덩어리(v1.7.3) → 얼음빛 회청 다이아몬드(v1.7.4)
      // v1.7.7 (사용자: "진하기를 줄이면 안 되고, 흰 부분이 더 많게"): 금빛은 v1.7.5 진하기 그대로 가장 어두운 한 단계에만(신성력 칸의 약 30%), 나머지는 흰빛
      //  (보석 탭은 빛 반대쪽 면을 가장 어두운 단계로 많이 칠해서, 두 단계를 금빛으로 하면 약 45~50% 가 금빛)
      H = [40, 44, 46, 46, 48, 50]; S = [0.4, 0.1, 0.07, 0.05, 0.08, 0.15]; L = [0.73, 0.84, 0.895, 0.935, 0.97, 0.995];
      //  v1.7.8 ("조금만 더 줄이고"): 그림자 면 둘 중 하나는 금빛 대신 흰빛(build 에서 WHITE_RAMPS 로 판단) → 금빛 칸 약 37% → 약 23%
      rampCache[hex] = H.map((hh, i) => hslToHex(hh, S[i], L[i]));
      WHITE_RAMPS.add(rampCache[hex]);
      return rampCache[hex];
    } else if (l < 0.25) {     // 검정 계열(자존감): 흑요석 + 라벤더 광택
      H = [250, 250, 252, 255, 258, 262]; S = [0.3, 0.28, 0.26, 0.26, 0.3, 0.45]; L = [0.07, 0.12, 0.19, 0.28, 0.42, 0.66];
    } else if (s < 0.3) {      // 회색 계열(절제력): 강철빛 푸른 은색
      H = [225, 220, 216, 214, 212, 210]; S = [0.3, 0.28, 0.27, 0.3, 0.38, 0.6]; L = [0.3, 0.42, 0.55, 0.68, 0.8, 0.94];
    } else {
      const toward = (h2, amt) => h + ((((h2 - h) % 360) + 540) % 360 - 180) * amt;
      // 채도는 능력치 색보다 낮게(최대 약 0.5), 그림자 색상 이동도 절반 → 원색처럼 쨍하지 않게 (2026-11-13 "보석 색상 너무 원색이 안들어가게")
      const c = Math.min(0.6, s) * 0.85;
      H = [toward(255, 0.14), toward(255, 0.08), toward(255, 0.03), h, toward(55, 0.05), toward(55, 0.08)];
      S = [c * 0.85, c * 0.95, c, c, c * 0.85, c * 0.55];
      L = [l - 0.3, l - 0.19, l - 0.07, l + 0.06, l + 0.18, 0.93].map(v => U.clamp(v, 0.1, 0.95));   // 조금 밝게 (명세 10장)
    }
    rampCache[hex] = H.map((hh, i) => hslToHex(hh, S[i], L[i]));
    return rampCache[hex];
  }

  // ---------- 컷팅 구조 ----------
  // 실루엣: 원형 + 상하좌우의 짧은 평면 (승인 GIF 형태)
  function inside(dx, dy, r) {
    r = r || R;
    const flat = r * 0.955;
    return dx * dx + dy * dy <= r * r + r * 0.4 && Math.abs(dx) <= flat && Math.abs(dy) <= flat;
  }
  // 라운드 브릴리언트 윗면: 직선 경계를 가진 실제 다각형 면
  //  테이블 8삼각 / 스타 8삼각 / 카이트(베젤) 8사각 / 어퍼 거들 16삼각
  const GEO = {};
  function geo(r) {
    if (GEO[r]) return GEO[r];
    const P = (rad, deg) => [rad * r * Math.cos(deg * Math.PI / 180), rad * r * Math.sin(deg * Math.PI / 180)];
    const T = [], S = [], G = [];
    for (let k = 0; k < 8; k++) {
      T.push(P(0.42, 22.5 + 45 * k));    // 테이블 꼭짓점
      S.push(P(0.70, 45 * k));           // 스타 꼭짓점 (테이블 변의 중점 방향)
      G.push(P(1.02, 22.5 + 45 * k));    // 카이트 바깥 끝 (거들)
    }
    const polys = [];
    for (let k = 0; k < 8; k++) polys.push({ ring: 0, idx: k, pts: [[0, 0], T[k], T[(k + 1) % 8]] });
    for (let k = 0; k < 8; k++) polys.push({ ring: 1, idx: k, pts: [T[k], S[(k + 1) % 8], T[(k + 1) % 8]] });
    for (let k = 0; k < 8; k++) polys.push({ ring: 2, idx: k, pts: [S[k], G[k], S[(k + 1) % 8], T[k]] });
    return (GEO[r] = polys);
  }
  function inPoly(x, y, pts) {
    let sign = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
      const c = (x2 - x1) * (y - y1) - (y2 - y1) * (x - x1);
      if (Math.abs(c) < 1e-9) continue;
      const s = c > 0 ? 1 : -1;
      if (sign === 0) sign = s; else if (s !== sign) return false;
    }
    return true;
  }
  function facetOf(dx, dy, r) {
    r = r || R;
    const polys = geo(r);
    for (let i = 0; i < polys.length; i++) if (inPoly(dx, dy, polys[i].pts)) return { ring: polys[i].ring, idx: polys[i].idx, id: i };
    let a = Math.atan2(dy, dx); if (a < 0) a += TAU;
    const i = Math.floor(a / (Math.PI / 8)) % 16; return { ring: 3, idx: i, id: 24 + i };
  }
  function facetAngle(ring, idx) {
    if (ring === 0) return (idx + 1) * Math.PI / 4;
    if (ring === 1) return (idx + 1) * Math.PI / 4;
    if (ring === 2) return idx * Math.PI / 4 + Math.PI / 8;
    return idx * Math.PI / 8 + Math.PI / 16;
  }
  const RING_R = [0.24, 0.55, 0.76, 0.93];
  const FACETS = [];
  for (let ring = 0; ring < 4; ring++) for (let idx = 0; idx < (ring === 3 ? 16 : 8); idx++) FACETS.push({ ring, idx, id: FACETS.length, angle: facetAngle(ring, idx) });

  // 컷팅 면마다 본체 픽셀 수 (모양은 고정이라 한 번만 센다)
  let FACET_AREA = null;
  function facetAreas() {
    if (FACET_AREA) return FACET_AREA;
    FACET_AREA = FACETS.map(() => 0);
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) { const dx = x - CX, dy = y - CY; if (inside(dx, dy)) FACET_AREA[facetOf(dx, dy).id]++; }
    return FACET_AREA;
  }

  // ---------- 시드 기반 레이아웃 (색과 무관 → 상위 능력치가 바뀌어도 나만의 패턴 유지) ----------
  function ratioSpec(n) {
    const all = BM.CONFIG.gem.ratios;
    if (all[n]) return all[n];
    const base = Array.from({ length: n }, (_, i) => n - i); const s = base.reduce((a, b) => a + b, 0);   // 그 밖의 색 수: 순위 비례
    return { base: base.map(v => v / s), range: base.map(v => [v / s - 0.02, v / s + 0.02]) };
  }
  function ratios(seed, n) {
    n = n || BM.CONFIG.gem.colorCount;
    const g = ratioSpec(n); const rnd = U.rng(U.hash(seed, 'ratio', n === 3 ? '' : n));
    // 정규화(합 100%) 후에도 각 순위가 허용 범위 안에 들도록 시드 고정 재추첨
    for (let tries = 0; tries < 200; tries++) {
      const raw = g.range.map(([lo, hi]) => lo + (hi - lo) * rnd());
      const s = raw.reduce((a, b) => a + b, 0);
      const p = raw.map(v => v / s);
      if (p.every((v, i) => v >= g.range[i][0] && v <= g.range[i][1])) return p;
    }
    return g.base.slice();
  }
  // 보석 색 비율 = 상위 N개 능력치의 공정 정규화 점수(희귀 ÷10, 일반 ÷기준치 — scoring.normalized) 비율 (명세 10장, 2026-11-13)
  // 점수를 모르는 화면(데모 등)은 null → 예전처럼 시드 고정 비율
  function statRatios(stats, ids) {
    if (ids && ids.length && BM.CONFIG.gem.fixedRatios && BM.CONFIG.gem.ratios[ids.length]) return BM.CONFIG.gem.ratios[ids.length].base.slice();   // 고정 비율 (60·25·10·5)
    if (!stats || !ids || !ids.length || !BM.scoring) return null;
    const norm = BM.scoring.normalized(stats).norm, v = ids.map(id => Math.max(0, norm[id] || 0)), s = v.reduce((a, b) => a + b, 0);
    return s > 0 ? v.map(x => x / s) : ids.map(() => 1 / ids.length);
  }
  function layout(seed, nColors, given) {
    const N = nColors || BM.CONFIG.gem.colorCount;
    const rnd = U.rng(U.hash(seed, 'layout'));
    const p = given && given.length === N ? given : ratios(seed, N);
    const outer = FACETS.filter(f => f.ring > 0);          // 32면: 정확한 비율로 배분
    const n = outer.length;
    const exact = p.map(v => v * n); const cnt = exact.map(Math.floor);
    let left = n - cnt.reduce((a, b) => a + b, 0);
    exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { cnt[i]++; left--; } });
    let rot = rnd() * TAU; const twist = (rnd() - 0.5) * 0.9, jag = 0.55 + rnd() * 0.35;
    // 4색 이상: 1위 덩어리를 오른쪽 가운데로 (좌상단은 빛이 세서 그쪽 색은 하얗게 보임 → 비율보다 작아 보였음).
    // 사람마다 ±17° 정도만 다르게. 2위는 그다음(아래·왼쪽 아래), 3·4위가 빛 쪽
    if (N >= 4) rot = -p[0] * Math.PI + (rot / TAU - 0.5) * 0.6;
    const keyed = outer.map(f => {
      const k = (((f.angle + f.ring * twist - rot) % TAU) + TAU) % TAU / TAU + (rnd() - 0.5) * jag * 0.35;
      return { f, k };
    }).sort((a, b) => a.k - b.k);
    const rank = new Array(FACETS.length).fill(0);
    let pos = 0, share = null;
    if (N >= 4) {
      // 4색 이상(2026-11-13): 면 '개수'가 아니라 면 '넓이'로 나눈다 (바깥 작은 면과 안쪽 큰 면의 크기가 달라서
      // 개수로 나누면 3위·4위가 뒤바뀌어 보이기도 함). 테이블(중심)은 1위 색이므로 그만큼 1위 몫에서 뺀다
      const area = facetAreas(), tableA = FACETS.filter(f => f.ring === 0).reduce((s, f) => s + area[f.id], 0);
      const totalA = tableA + outer.reduce((s, f) => s + area[f.id], 0);
      // 둘레 순서(keyed)는 그대로 두고, 색 경계(N-1곳)를 모든 경우에서 골라 목표 비율에 가장 가깝게 (순위 뒤바뀜 없이)
      const pre = [0]; keyed.forEach(e => pre.push(pre[pre.length - 1] + area[e.f.id]));
      const cuts = [], best = { bad: 2, err: Infinity, cuts: null };
      (function rec(start, r) {
        if (r === N - 1) {
          const edges = [0].concat(cuts, [n]);
          const s = p.map((_, i) => (pre[edges[i + 1]] - pre[edges[i]] + (i === 0 ? tableA : 0)) / totalA);
          // 피할 것: 순위 뒤바뀜, 그리고 목표가 1.5배 이상 차이 나는 이웃 순위(10%·5% 등)가 1.4배 미만으로 비슷해지는 것 (2026-11-15, 60·25·10·5)
          const bad = s.some((v, i) => i > 0 && v >= s[i - 1]) ? 1 : 0, close = s.some((v, i) => i > 0 && p[i - 1] >= 1.5 * p[i] && s[i - 1] < 1.4 * v) ? 1 : 0;
          const err = Math.max(...s.map((v, i) => Math.abs(v - p[i]))) + close;
          if (bad < best.bad || (bad === best.bad && err < best.err)) { best.bad = bad; best.err = err; best.cuts = cuts.slice(); }
          return;
        }
        for (let c = start + 1; c <= n - (N - 1 - r); c++) { cuts[r] = c; rec(c, r + 1); }
      })(0, 0);
      const edges = [0].concat(best.cuts, [n]);
      for (let r = 0; r < N; r++) for (let k = edges[r]; k < edges[r + 1]; k++) rank[keyed[k].f.id] = r;
      cnt.fill(0); outer.forEach(f => cnt[rank[f.id]]++);
      share = p.map(() => 0); share[0] += tableA; outer.forEach(f => { share[rank[f.id]] += area[f.id]; });
      share = share.map(v => v / totalA);
    } else {
      cnt.forEach((c, r) => { for (let i = 0; i < c; i++) rank[keyed[pos++].f.id] = r; });
    }
    // 테이블(중심 8면)은 가장 밝은 색과 번갈아 칠한다. 4색 이상은 나머지 칸을 1위 색으로 (1위 색이 보석의 주인공),
    // 예전 3색 보석은 이웃 면 색으로 (기존 모습 유지)
    const tablePhase = Math.floor(rnd() * 2);
    FACETS.filter(f => f.ring === 0).forEach(f => { rank[f.id] = (f.idx + tablePhase) % 2 === 0 ? -1 : (N >= 4 ? 0 : rank[16 + f.idx]); });
    // 면별 명암 흔들림, 반사광 면
    const jitter = FACETS.map(() => (rnd() < 0.35 ? (rnd() < 0.5 ? -1 : 1) : 0));
    const reflect = FACETS.map(() => (rnd() < 0.28 ? 1 + Math.floor(rnd() * (N - 1)) : 0));   // 다른 순위 색의 반사광
    // 4색 이상: 반사광은 바로 옆 면(같은 둘레 순서의 다음 면)의 색 → 색 비율이 흐트러지지 않게 (같은 색이면 밝은 반사)
    const reflRank = FACETS.map(() => 0);
    keyed.forEach((e, k) => { reflRank[e.f.id] = rank[keyed[(k + 1) % keyed.length].f.id]; });
    const sparkleEdge = FACETS.map(() => rnd() < 0.18);
    const reflSide = FACETS.map(() => (rnd() < 0.5 ? 1 : -1));
    const glints = [];
    for (let i = 0; i < 5; i++) {
      const ang = rnd() * TAU, rr = R * (0.3 + rnd() * 0.55);
      glints.push({ x: Math.round(CX + Math.cos(ang) * rr), y: Math.round(CY + Math.sin(ang) * rr), ph: rnd() * TAU, len: 1 + Math.floor(rnd() * 2) });
    }
    const dust = [];
    for (let i = 0; i < 9; i++) dust.push({ ang: rnd() * TAU, rr: R + 10 + rnd() * 30, ph: Math.floor(rnd() * 12), big: rnd() < 0.35 });
    return { N, p, cnt, share, rank, jitter, reflect, reflRank, reflSide, sparkleEdge, glints, dust };
  }

  // ---------- 본체 (정지) ----------
  function drawBody(spec, lay) {
    const cols = spec.colors.map(id => (BM.STAT[id] ? BM.STAT[id].color : id));
    const ramps = cols.map(ramp);
    let bright = 0; cols.forEach((c, i) => { if (luminance(c) > luminance(cols[bright])) bright = i; });
    const cv = document.createElement('canvas'); cv.width = SIZE; cv.height = SIZE;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(SIZE, SIZE);
    const fid = new Int16Array(SIZE * SIZE).fill(-1);
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      const dx = x - CX, dy = y - CY;
      if (inside(dx, dy)) fid[y * SIZE + x] = facetOf(dx, dy).id;
    }
    const put = (x, y, hex, a) => {
      const [r, g, b] = hexToRgb(hex); const o = (y * SIZE + x) * 4;
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = a == null ? 255 : a;
    };
    // 4색 이상(2026-11-13): 테이블의 별 모양 밝은 면도 1위 색(가장 밝은 단계)으로 → 색 비율대로 보이고 1위 색이 주인공.
    // 예전 3색 보석은 그대로 '가장 밝은 색'으로
    const pct = (lay.N || ramps.length) >= 4;
    const rankOf = id => (lay.rank[id] === -1 ? (pct ? 0 : bright) : lay.rank[id]);
    const baseTone = [4, 3, 2, 2];
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      const id = fid[y * SIZE + x]; if (id < 0) continue;
      const f = FACETS[id], dx = x - CX, dy = y - CY;
      const rk = rankOf(id), rp = ramps[rk];
      const o = Math.cos(f.angle - LIGHT);
      let tone = baseTone[f.ring] + o * 1.3 + lay.jitter[id] + ((f.ring >= 2 && f.idx % 2) ? -0.6 : 0);
      const proj = (dx * Math.cos(LIGHT) + dy * Math.sin(LIGHT)) / R;   // 좌상단일수록 +
      tone += proj * 0.9;
      // 좌상단 큰 하이라이트
      const hl = Math.hypot(dx + R * 0.4, dy + R * 0.36) / (R * 0.42);
      // 4색 이상: 하이라이트를 약하게 — 강하면 좌상단에 놓인 색이 거의 흰색이 되어 비율보다 작아 보임 (2026-11-13 사용자: "퍼센트 적용이 안된 것 같은데")
      if (hl < 1) tone += (1 - hl) * (pct ? 0.8 : 1.8);
      if (pct && lay.rank[id] === -1) tone += 0.5;   // 테이블 별: 1위 색의 조금 밝은 단계 (하얗게 날아가지 않게)
      // 디더는 계조 경계에서만 아주 약하게 (과도한 노이즈 금지)
      let t = U.clamp(Math.floor(tone + 0.5 + (bayer(x, y) - 0.5) * 0.45), 0, 5);
      if (t === 0 && id % 2 === 0 && WHITE_RAMPS.has(rp)) t = 1;   // 흰 보석: 그림자 면 둘 중 하나는 금빛 대신 흰빛 (v1.7.8)
      let col = rp[t];
      // 반사광: 면의 절반에 다른 색의 맑은 반사 (면 단위 → 노이즈 없이 투명감)
      if (lay.reflect[id]) {
        const fa = f.angle, fr = RING_R[f.ring] * R;
        const side = (dx - Math.cos(fa) * fr) * -Math.sin(fa) + (dy - Math.sin(fa) * fr) * Math.cos(fa);
        if (side * lay.reflSide[id] > 0.5) {
          if (pct && lay.reflRank) { const nr = lay.reflRank[id]; col = nr === rk ? rp[U.clamp(t + 1, 2, 5)] : ramps[nr][U.clamp(t, 2, 5)]; }
          else col = ramps[(rk + lay.reflect[id]) % ramps.length][U.clamp(t, 2, 5)];
        }
      }
      // 컷팅 경계선
      const r = fid[y * SIZE + x + 1], b = fid[(y + 1) * SIZE + x];
      if ((r >= 0 && r !== id) || (b >= 0 && b !== id)) {
        if (lay.sparkleEdge[id] && (x + y) % 2 === 0) col = rp[5];
        else col = rp[Math.max(0, t - 1)];
      }
      put(x, y, col);
    }
    // 테두리: 안쪽 밝은 픽셀 림 + 바깥 짙은 외곽선 (금속테 아님)
    const edgeCol = (dx, dy) => {
      const ang = Math.atan2(dy, dx); const lit = (Math.cos(ang - LIGHT) + 1) / 2;
      const f = FACETS[facetOf(dx * 0.9, dy * 0.9).id]; const rp = ramps[rankOf(f.id)];
      return mix(rp[4], '#ffffff', 0.35 + lit * 0.55);
    };
    for (let y = 1; y < SIZE - 1; y++) for (let x = 1; x < SIZE - 1; x++) {
      const i = y * SIZE + x, me = fid[i] >= 0;
      const nb = [fid[i - 1], fid[i + 1], fid[i - SIZE], fid[i + SIZE]];
      if (me && nb.some(v => v < 0)) put(x, y, edgeCol(x - CX, y - CY));
      else if (!me && nb.some(v => v >= 0)) put(x, y, '#0b0a26');
    }
    ctx.putImageData(img, 0, 0);
    return { canvas: cv, mask: fid, ramps };
  }

  // ---------- 오오라 (프레임마다) ----------
  function auraPalettes(sr, al) {
    const lerpPal = (A, B, t) => A.map((c, i) => mix(c, B[i], t));
    const inner = lerpPal(['#3a2a8c', '#5f3fc8', '#9468ee', '#cfb2ff'], ['#7a1f63', '#c43f8a', '#f17eaf', '#ffd2e6'], U.clamp(sr * 1.25 - 0.15, 0, 1));
    const outer = lerpPal(['#22307e', '#3f5fcf', '#7ea2ff', '#cfe0ff'], ['#5b6aa0', '#a9bbe6', '#e3ecff', '#ffffff'], U.clamp(al * 1.25 - 0.15, 0, 1));
    return { inner, outer };
  }
  function drawAura(ctx, spec, frame, nFrames, mask) {
    const sr = U.clamp(spec.sr == null ? 0.5 : spec.sr, 0, 1), al = U.clamp(spec.al == null ? 0.5 : spec.al, 0, 1);
    const calm = U.clamp((spec.esteem == null ? 5 : spec.esteem) / 10, 0, 1);  // 자존감이 높을수록 흐름이 안정적
    const ph = TAU * frame / nFrames;
    const pal = auraPalettes(sr, al);
    const img = ctx.createImageData(SIZE, SIZE);
    const ALPHA = [0, 0.18, 0.3, 0.44, 0.58, 0.72, 0.86, 0.96];
    const Wi = 5 + 9 * sr, Wo = 10 + 24 * al;
    const sI = 0.62 + 0.38 * sr, sO = 0.5 + 0.5 * al;
    const wob = 1 - 0.45 * calm;
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      if (mask[y * SIZE + x] >= 0) continue;
      const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy);
      if (d < R - 1) continue;
      const a = Math.atan2(dy, dx);
      let Ii = 0, Io = 0;
      const xi = (d - R) / Wi;
      if (xi < 1) {
        const swirl = 0.5 + 0.5 * Math.sin(3 * a + ph + 1.6 * Math.sin(2 * a - ph) * wob);
        Ii = sI * Math.pow(Math.max(0, 1 - xi), 1.4) * (0.62 + 0.38 * swirl);
      }
      const yo = (d - R - 1) / Wo;
      if (yo > -0.05 && yo < 1) {
        const rip = 0.5 + 0.5 * Math.sin(d * 0.42 - ph * 2 + 1.4 * Math.sin(a * 2 + ph) * wob);
        const ribbon = Math.pow(0.5 + 0.5 * Math.sin(a * 2 - d * 0.13 + ph), 6);
        const wisp = 0.5 + 0.5 * Math.sin(5 * a - ph + d * 0.07);
        Io = sO * Math.pow(Math.max(0, 1 - yo), 1.25) * (0.35 * rip + 0.35 * wisp + 0.6 * ribbon);
      }
      const I = Math.max(Ii * 1.08, Io);
      const lv = U.clamp(Math.floor(I * 8 + (bayer(x, y) - 0.5) * 0.8), 0, 7);
      if (lv <= 0) continue;
      const col = (Ii * 1.08 >= Io ? pal.inner : pal.outer)[Math.min(3, Math.floor((lv - 1) / 2))];
      const [r, g, b] = hexToRgb(col); const o = (y * SIZE + x) * 4;
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = b; img.data[o + 3] = Math.round(ALPHA[lv] * 255);
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- 빛 (프레임마다) ----------
  function px(ctx, x, y, col, a) { ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = col; ctx.fillRect(x, y, 1, 1); }
  function drawStar(ctx, frame, nFrames, tint) {
    const ph = TAU * frame / nFrames;
    const b = 0.5 + 0.5 * Math.sin(ph - Math.PI / 2 + Math.PI);   // frame 0 = 가장 밝게
    const L = 13 + Math.round(9 * b);
    const pale = mix(tint, '#ffffff', 0.7);
    // 부드러운 코어 글로우
    for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
      const d = Math.hypot(x, y);
      if (d <= 6 && d > 3.2 && bayer(x + 8, y + 8) < 0.55 + 0.3 * b) px(ctx, CX + x, CY + y, pale, 0.4 + 0.25 * b);
    }
    // 십자 팔: 가운데가 두껍고 끝으로 갈수록 가늘어짐
    for (let k = 0; k <= L; k++) {
      const w = Math.floor(3.6 * Math.pow(1 - k / L, 1.8));
      const col = k < L * 0.45 ? '#ffffff' : pale;
      const a = k < L * 0.7 ? 1 : 0.55 + 0.4 * b;
      for (let s = -w; s <= w; s++) {
        [[k, s], [-k, s], [s, k], [s, -k]].forEach(([x, y]) => px(ctx, CX + x, CY + y, col, a));
      }
    }
    // 짧은 대각선 빛
    const Ld = Math.round(L * 0.36);
    for (let k = 1; k <= Ld; k++) {
      const a = (1 - k / (Ld + 1)) * (0.6 + 0.35 * b);
      [[k, k], [-k, k], [k, -k], [-k, -k]].forEach(([x, y]) => px(ctx, CX + x, CY + y, pale, a));
    }
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (Math.abs(x) + Math.abs(y) <= 3) px(ctx, CX + x, CY + y, '#ffffff', 1);
    ctx.globalAlpha = 1;
  }
  function drawGlints(ctx, lay, frame, nFrames) {
    const ph = TAU * frame / nFrames;
    lay.glints.forEach(g => {
      const v = Math.sin(ph + g.ph);
      if (v < 0.55) return;
      const a = (v - 0.55) / 0.45;
      px(ctx, g.x, g.y, '#ffffff', 0.6 + 0.4 * a);
      for (let k = 1; k <= g.len; k++) [[k, 0], [-k, 0], [0, k], [0, -k]].forEach(([x, y]) => px(ctx, g.x + x, g.y + y, '#ffffff', 0.5 * a));
    });
    ctx.globalAlpha = 1;
  }
  function drawDust(ctx, lay, frame, nFrames) {
    lay.dust.forEach(d => {
      const age = (frame - d.ph + nFrames) % nFrames;
      if (age > 2) return;                                  // 드물게, 짧게
      const x = Math.round(CX + Math.cos(d.ang) * d.rr), y = Math.round(CY + Math.sin(d.ang) * d.rr);
      if (x < 2 || y < 2 || x > SIZE - 3 || y > SIZE - 3) return;
      const a = age === 1 ? 1 : 0.5;
      px(ctx, x, y, '#ffffff', a);
      if (d.big && age === 1) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => px(ctx, x + dx, y + dy, '#cfd8ff', 0.6));
    });
    ctx.globalAlpha = 1;
  }

  // ---------- 조립 ----------
  function build(spec) {
    const nF = BM.CONFIG.gem.frames;
    const lay = layout(spec.seed, spec.colors.length, spec.ratios);
    const body = drawBody(spec, lay);
    const tint = body.ramps[0][4];
    const frames = [];
    for (let f = 0; f < nF; f++) {
      const cv = document.createElement('canvas'); cv.width = SIZE; cv.height = SIZE;
      const ctx = cv.getContext('2d');
      drawAura(ctx, spec, f, nF, body.mask);
      drawDust(ctx, lay, f, nF);
      ctx.drawImage(body.canvas, 0, 0);                    // 본체: 언제나 같은 캔버스를 같은 위치에
      drawGlints(ctx, lay, f, nF);
      drawStar(ctx, f, nF, tint);
      frames.push(cv);
    }
    return { size: SIZE, radius: R, body: body.canvas, mask: body.mask, frames, layout: lay };
  }

  function specKey(s) {
    return [s.seed, s.colors.join(','), Math.round((s.sr || 0) * 50), Math.round((s.al || 0) * 50), Math.round((s.esteem || 0)), (s.ratios || []).map(v => Math.round(v * 200)).join(',')].join('|');
  }
  const buildCache = new Map();
  function cached(spec) {
    const k = specKey(spec);
    if (!buildCache.has(k)) { if (buildCache.size > 12) buildCache.clear(); buildCache.set(k, build(spec)); }
    return buildCache.get(k);
  }

  function prefersReduced() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  // 캔버스에 고유 보석을 재생
  function Player(canvas, spec, opts) {
    opts = opts || {};
    canvas.width = SIZE; canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    let g = cached(spec), raf = 0, last = -1, alive = true;
    const reduced = () => opts.reducedMotion === true || (opts.reducedMotion !== false && prefersReduced());
    function draw(i) { ctx.clearRect(0, 0, SIZE, SIZE); ctx.drawImage(g.frames[i], 0, 0); }
    function loop(t) {
      if (!alive) return;
      if (!canvas.isConnected) { alive = false; return; }
      if (reduced()) { if (last !== 0) { draw(0); last = 0; } }
      else {
        const i = Math.floor(t / BM.CONFIG.gem.frameMs) % g.frames.length;
        if (i !== last) { draw(i); last = i; }
      }
      raf = requestAnimationFrame(loop);
    }
    draw(0);
    raf = requestAnimationFrame(loop);
    return {
      set(s) { g = cached(s); last = -1; draw(0); },
      stop() { alive = false; cancelAnimationFrame(raf); },
      get gem() { return g; }
    };
  }

  // ---------- 능력치 보석 (작은 수집품) ----------
  function decompose(value) {
    const v = Math.floor(Math.max(0, value || 0) + 1e-9);
    const tiers = [];
    for (let k = 0, unit = 100; unit <= v; k++, unit *= 10) {
      const c = Math.floor(v / unit) % 10;
      if (c > 0) tiers.push({ tier: k, count: c });
    }
    tiers.reverse();
    const rem = v % 100;
    return { value: v, tiers, remainder: rem, remainderStage: rem > 0 ? stageOf(rem) : null };
  }
  function stageOf(v) { return v >= 100 ? 'complete' : v >= 60 ? 'fine' : v >= 30 ? 'partial' : 'rough'; }
  const STAGE_NAME = { rough: '거친 원석', partial: '다듬은 보석', fine: '정교한 컷팅', complete: '완성 보석' };
  function rareStage(v) { const n = Math.floor(v + 1e-9); return n >= 10 ? 'max' : n >= 8 ? 'complete' : n >= 5 ? 'fine' : n >= 3 ? 'partial' : 'rough'; }

  const iconCache = new Map();
  function icon(color, stage, tier, seedKey) {
    tier = tier || 0;
    const key = [color, stage, tier, seedKey || ''].join('|');
    if (iconCache.has(key)) return iconCache.get(key);
    const r = stage === 'rough' ? 6 : 6.5 + Math.min(4.5, tier * 1.5);
    const S = Math.ceil(r * 2) + 7, c = Math.floor(S / 2);
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    const ctx = cv.getContext('2d');
    const rp = ramp(color);
    const rnd = U.rng(U.hash(color, seedKey || 'icon', stage));
    const m = new Int8Array(S * S);
    // 실루엣
    const verts = [];
    const nv = 7; for (let i = 0; i < nv; i++) verts.push(r * (stage === 'partial' ? 0.86 + rnd() * 0.16 : 0.72 + rnd() * 0.32));
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const dx = x - c, dy = y - c;
      let ok;
      if (stage === 'rough' || stage === 'partial') {   // 원석 → 일부 가공: 울퉁불퉁함이 줄고 윗면만 다듬어짐
        const a = (Math.atan2(dy, dx) + TAU) % TAU, t = a / TAU * nv, i0 = Math.floor(t) % nv, i1 = (i0 + 1) % nv;
        const rr = verts[i0] + (verts[i1] - verts[i0]) * (t - Math.floor(t));
        ok = Math.hypot(dx, dy) <= rr;
      } else ok = inside(dx, dy, r);
      if (ok) m[y * S + x] = 1;
    }
    const img = ctx.createImageData(S, S);
    const put = (x, y, hex, a) => { const [R1, G1, B1] = hexToRgb(hex); const o = (y * S + x) * 4; img.data[o] = R1; img.data[o + 1] = G1; img.data[o + 2] = B1; img.data[o + 3] = a == null ? 255 : a; };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      if (!m[y * S + x]) continue;
      const dx = x - c, dy = y - c;
      const proj = (dx * Math.cos(LIGHT) + dy * Math.sin(LIGHT)) / r;
      let t;
      if (stage === 'rough') t = 2 + proj * 1.6 + (rnd() < 0.12 ? 1 : 0);
      else if (stage === 'partial') {
        const table = Math.max(Math.abs(dx), Math.abs(dy)) < r * 0.45;
        t = table ? 4 + proj * 0.6 : 2 + proj * 1.4 + ((Math.floor((Math.atan2(dy, dx) + 4) * 2)) % 2 ? -0.5 : 0.3);
      } else {
        const f = facetOf(dx, dy, r);
        t = [4, 3, 2, 2][f.ring] + Math.cos(FACETS[f.id].angle - LIGHT) * 1.3 + proj * 0.8 + (f.ring >= 2 && f.idx % 2 ? -0.6 : 0);
      }
      put(x, y, rp[U.clamp(Math.floor(t + bayer(x, y) - 0.3), 0, 5)]);
    }
    // 외곽: 밝은 림(가공 단계 이상) / 어두운 외곽선
    for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
      const i = y * S + x, nb = [m[i - 1], m[i + 1], m[i - S], m[i + S]];
      if (m[i] && nb.some(v => !v)) put(x, y, stage === 'rough' ? rp[1] : mix(rp[4], '#ffffff', (Math.cos(Math.atan2(y - c, x - c) - LIGHT) + 1) / 2 * 0.7));
      else if (!m[i] && nb.some(v => v)) put(x, y, '#0b0a26');
    }
    ctx.putImageData(img, 0, 0);
    if (stage === 'complete' || stage === 'max' || tier > 0) {
      // 작은 십자 별빛
      const L = 2 + Math.min(3, tier);
      for (let k = 0; k <= L; k++) [[k, 0], [-k, 0], [0, k], [0, -k]].forEach(([x, y]) => px(ctx, c + x, c + y, '#ffffff', k === L ? 0.6 : 1));
      ctx.globalAlpha = 1;
    }
    if (stage === 'max') {
      ctx.globalCompositeOperation = 'destination-over';
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const d = Math.hypot(x - c, y - c);
        if (d > r && d < r + 3 && bayer(x, y) < 0.5) px(ctx, x, y, rp[4], 0.55);
      }
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
    iconCache.set(key, cv);
    return cv;
  }

  return { SIZE, RADIUS: R, CX, CY, ramp, mix, luminance, build, cached, Player, layout, ratios, statRatios, facetOf, inside, decompose, stageOf, STAGE_NAME, rareStage, icon, prefersReduced };
})();
