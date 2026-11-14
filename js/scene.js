/* 상단 모험 장면 — 수련 탭 맨 위 (명세: art/source/claude_package_2026-11-13/BRAVE_MAKER_CLAUDE_IMPLEMENTATION_SPEC_KO.md 3~7장)
 *  - 배경: 시간대별 사용자 PNG 원본 화질 그대로 (art/background/hi, 새벽·낮·저녁·밤). 캔버스는 기기 픽셀 해상도, 배경은 원본에서 부드럽게 축소, 도트 캐릭터는 최근접 확대
 *  - 모험(WALK): 걷는 동안 배경 전체가 왼쪽으로 흐름(발과 같은 속도, 좌우 뒤집어 이어 붙여 끝없이). 용사는 화면 37% 자리에서 사용자 걷기 그림(원본 해상도, 칸 순서·길이는 BM.SPRITES 의 seq·dur) 반복, 발밑 그림자는 코드로 (시간대·날씨·보폭에 맞춰)
 *  - 캠프(수면 미션 판정): 저녁 캠프 그림 원본, 쉬기·잠들 준비는 통나무 뒤에 앉기, 잠은 사용자 잠 그림 8프레임. (그림을 못 읽으면 패키지 3레이어 타일로 대신)
 *  - 시간대(휴대폰 시각): 새벽 04~06:59 · 낮 07~17:59 · 저녁(sunset) 18~21:59 · 밤 22~03:59. 장면만 바뀌고 용사는 밤이라고 자지 않음
 *  - 날씨: 비·눈은 패키지 오버레이를 아래로 흘림, 흐림·안개는 빛을 낮추고 뿌옇게
 *  - 캠프(REST·SLEEP_PREP·SLEEP, 수면 수련 판정): 캠프 고정 그림 + 모닥불 6프레임(160ms) + 반짝임 4프레임(380ms)만 움직임
 *    앉기 = 걷기 원본을 통나무 뒤에 앉힘(다리는 통나무에 가려짐), 잠들 준비 = 거기에 망토색 담요, 잠 = 담요 + 눈만 감기고 Z (불가에서 조는 모습)
 *    (패키지의 *_TEMP_REFERENCE 포즈는 원본과 다른 임시 그림이라 쓰지 않음)
 *  - 가려져 있거나 화면 밖이면 멈추고, '움직임 줄이기'면 정지 화면
 */
window.BM = window.BM || {};
BM.scene = (function () {
  const H = 144, TW = 512;
  const GROUND = 131;                 // 모험: 길 위 발 기준선
  const CAMP = { ground: 130, fire: 232, hero: 192 };   // 캠프 그림 안의 좌표 (불 = 돌 화덕 옆 붉은 땅 가운데, 용사는 불 왼쪽에 앉아 불을 봄)
  const SPEED = 20;                   // 걷기 시트에 보폭(stride)이 없을 때만 쓰는 전경 속도 (논리 픽셀/초)
  const PAR = { far: 0.2, mid: 0.5, front: 1 };
  // 걷기: 사용자가 새로 그린 8프레임(2026-11-14)을 1초에 6장 (천천히). 땅은 '한 바퀴 동안 몸이 나아가는 거리(stride)'만큼 흘러 발이 미끄러지지 않게
  const FPS = 30, WALK_FPS = 6, SLEEP_FPS = 1.1;   // 걷기 8프레임 1초 6장, 잠 8프레임 1초 1.1장(한 바퀴 약 7초, 깊이 잠든 느린 숨 — 2026-11-15 "더 느리게")
  // 시간대별 배경 = 사용자 PNG 원본 화질 그대로 (2026-11-13 "산·숲·성·유적·꽃길을 다시 그리지 말고 원본 화질 유지").
  //  캔버스를 기기 픽셀 해상도로 그려 배경은 원본에서 바로 부드럽게 축소, 도트 캐릭터만 최근접으로 확대.
  //  걷는 동안 배경 전체가 왼쪽으로 흐름(땅 속도 = 보폭). 좌우를 뒤집어 이어 붙여 끝없이. feet = 꽃길 위 발 기준선(논리 좌표)
  const HI = { feet: 127 };
  // 캠프(수면 미션 판정 시): 저녁 캠프 그림을 모닥불 둘레로 확대한 원본 840×472 → 논리 300×169, 화면에는 위 12줄을 잘라 144줄
  const CAMP2 = { w: 300, h: 169, offY: 12, fireX: 135, fireY: 100, log: [163, 98, 238, 145], sitX: 200, tent: [64, 62], sleepX: 204, sleepY: 151 };
  const TIME_NAME = { dawn: '새벽', day: '낮', sunset: '저녁', night: '밤' };
  const WEATHER_NAME = { clear: '맑음', cloudy: '흐림', rain: '비', snow: '눈', fog: '안개' };
  const STATE_NAME = { WALK: '모험 중', REST: '쉬는 중', SLEEP_PREP: '잠들 준비', SLEEP: '자는 중' };
  // 발밑 그림자 (그림에는 없음, 코드로): a = 진하기, sx = 가로 늘림, dx = 빛 반대쪽으로 밀림. 낮은 진하고 짧게, 새벽·저녁은 길고 옅게, 밤은 달빛이라 아주 옅게
  const SHADOW = { dawn: { a: 0.45, sx: 1.3, dx: -3 }, day: { a: 0.58, sx: 1, dx: 0 }, sunset: { a: 0.5, sx: 1.45, dx: -5 }, night: { a: 0.36, sx: 0.95, dx: 0 } };
  const CLOTH = { girl: ['#5a2a26', '#7d3a33', '#9e4d42', '#c06e5c'], boy: ['#28325c', '#3b4a82', '#5666a3', '#7d8cc4'] };

  function timeOf(date) {
    const h = (date || new Date()).getHours();
    return h >= 4 && h < 7 ? 'dawn' : h >= 7 && h < 18 ? 'day' : h >= 18 && h < 22 ? 'sunset' : 'night';
  }

  // ---------- 그림 불러오기 (한 번만) ----------
  const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  function shrink(img) {           // 3배 확대 PNG → 논리 크기 (최근접)
    if (!img) return null;
    const k = (BM.SCENE_ART && BM.SCENE_ART.scale) || 3, c = document.createElement('canvas');
    c.width = Math.round(img.width / k); c.height = Math.round(img.height / k);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }
  let artP = null;
  function art() {
    if (artP) return artP;
    const A = BM.SCENE_ART;
    if (!A) return (artP = Promise.resolve(null));
    const one = src => loadImg(src).then(shrink);
    artP = Promise.all([
      Promise.all(['dawn', 'day', 'sunset', 'night'].map(t => Promise.all(['sky', 'far', 'mid', 'front'].map(k => one(A.bg[t][k]))).then(L => [t, { sky: L[0], far: L[1], mid: L[2], front: L[3] }]))),
      one(A.camp), Promise.all(A.fire.map(one)), Promise.all(A.spark.map(one)), one(A.rain), one(A.snow),
      Promise.all(['dawn', 'day', 'sunset', 'night'].filter(t => A.hi && A.hi[t]).map(t => loadImg(A.hi[t]).then(i => i && [t, { img: mirror(i), lw: i.width * H / i.height }]))),
      A.hi && A.hi.camp ? loadImg(A.hi.camp).then(mirror) : null,
      A.par ? Promise.all(['sky', 'clouds', 'mid', 'front', 'sparkle'].map(k => A.par[k] ? loadImg(A.par[k]) : null)).then(([sky, clouds, mid, front, sparkle]) => sky && mid && front ? { sky, clouds, mid, front, sparkle, h: A.par.h, period: A.par.period, stars: starsOf(sky, A.par.period.sky, 290), cloudA: alphaOf(clouds, 290) } : null) : null
    ]).then(([bg, camp, fire, spark, rain, snow, hi, campHi, par]) => ({ bg: Object.fromEntries(bg), camp, fire, spark, rain, snow, hi: Object.fromEntries(hi.filter(Boolean)), campHi, par, fireMs: A.fireMs || 160, sparkMs: A.sparkMs || 380 }));
    return artP;
  }
  // ---------- 무한 순환 파랄랙스 v3 (사용자 패키지 BRAVE_MAKER_PARALLAX_CRISP_MID_v3, 2026-11-15) ----------
  // 하늘(고정) + 구름 · 산·숲·성 · 길·유적·꽃 3레이어. 모두 3832×724 같은 원점, 아래 10줄은 투명이라 714줄까지를 화면 높이(144)에 맞춤.
  // 레이어마다 따로 주기·위치값·속도: 위치 = (위치 + 속도 × 지난 시간) % 주기, 같은 그림을 주기 간격으로 두 장 이상 이어 그려 경계가 화면 안에서 튀지 않음.
  //  주기: mid 는 첫 열 = 끝 열이라 3831, 구름·길은 끝 열 → 첫 열이 이웃 열처럼 이어져 3832.
  //  길(발 디딜 곳)이 front 레이어 → front = 걷는 속도(보폭에 맞춤), 구름·산은 패키지 권장 비율(3.5 : 8 : 19)
  const PARX = { feet: 137, crop: 714, ratio: { clouds: 3.5 / 19, mid: 8 / 19, front: 1 } };
  const parPos = { clouds: 0, mid: 0, front: 0 };   // 레이어별 위치 (논리 px). 모든 장면이 함께 씀 → 화면을 다시 그려도 처음으로 튀지 않음
  let parLast = null;                               // 위치를 마지막으로 움직인 시각 (가려졌다 돌아와도 그 자리부터)
  // 시간대 색감: 낮 그림에 위(하늘)→아래(땅) 그라디언트를 곱해 새벽·저녁·밤으로. 용사는 같은 빛을 약하게(mix 0.45)
  const GRADE = { dawn: [[196, 168, 228], [255, 214, 214]], sunset: [[255, 160, 112], [255, 204, 164]], night: [[40, 50, 116], [84, 100, 168]] };
  const tintCache = {};
  function tinted(img, key, t, mix) {
    const G = GRADE[t];
    if (!G || !img) return img;
    const id = key + '|' + t + '|' + mix;
    if (tintCache[id]) return tintCache[id];
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d');
    const col = v => 'rgb(' + v.map(ch => Math.round(255 - (255 - ch) * mix)).join(',') + ')';
    x.drawImage(img, 0, 0);
    x.globalCompositeOperation = 'multiply';
    const g = x.createLinearGradient(0, 0, 0, img.height); g.addColorStop(0, col(G[0])); g.addColorStop(1, col(G[1]));
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(img, 0, 0);   // 투명한 곳은 그대로 투명
    return (tintCache[id] = c);
  }
  // 구름 레이어 위쪽(maxRow 줄까지)의 투명도 — 반짝이는 별이 구름 뒤에 숨지 않게 고를 때 씀
  function alphaOf(img, maxRow) {
    if (!img) return null;
    const w = img.width, h = Math.min(img.height, maxRow), c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3];
    return { w, h, a };
  }
  // 밤하늘 별 자리: 하늘 그림 위쪽(산이 시작하기 전, maxRow 줄까지)의 파란 하늘 칸에서 골라 (같은 자리에 늘 같은 별, 구름이 지나가면 가려짐)
  function starsOf(img, period, maxRow) {
    const h = Math.min(img.height, maxRow), c = document.createElement('canvas'); c.width = period; c.height = h;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, period, h).data;
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const out = [];
    for (let i = 0; i < 12000 && out.length < 320; i++) {
      const sx = Math.floor(rnd() * period), sy = Math.floor(rnd() * h), o = (sy * period + sx) * 4, r = d[o], g = d[o + 1], b = d[o + 2];
      if (b > 120 && b > r + 30 && b >= g && Math.max(r, g, b) < 236) out.push({ x: sx, y: sy, ph: rnd() * 6.28, sp: 1.2 + rnd() * 2.6, big: rnd() < 0.18, warm: rnd() < 0.3 });
    }
    return out;
  }

  // 한 장 그림 → [그림 | 좌우 뒤집은 그림] 으로 이어 붙여 이음새 없이 반복
  function mirror(img) {
    if (!img) return null;
    const c = document.createElement('canvas'); c.width = img.width * 2; c.height = img.height; const x = c.getContext('2d');
    x.drawImage(img, 0, 0); x.translate(img.width * 2, 0); x.scale(-1, 1); x.drawImage(img, 0, 0);
    return c;
  }

  // ---------- 캐릭터 (승인된 걷기 시트) ----------
  const sprites = {};
  function sprite(look) {
    if (sprites[look]) return sprites[look];
    const S = BM.SPRITES && BM.SPRITES[look];
    return (sprites[look] = (S ? loadImg(S.walk) : Promise.resolve(null)).then(async img => {
      if (!img) return null;
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, img.width, img.height).data, A0 = S.hi ? 128 : 0;
      // 원본 해상도 시트(hi)는 원본 px 로 재고, 아래에서 sc 를 곱해 논리 px 로 (fw·fh·foot·top·feet 는 논리 값, sw·sh 는 원본 칸 크기)
      let foot = 0, top = S.fh;
      for (let y = 0; y < S.fh; y++) for (let xx = 0; xx < img.width; xx++) if (d[(y * img.width + xx) * 4 + 3] > A0) { foot = Math.max(foot, y); top = Math.min(top, y); }
      const sc = S.sc || 1, rows = Math.max(3, Math.round(4 / sc)), feet = [];   // 프레임마다 발 4줄(논리)의 가로 범위 → 그림자 폭 (발을 벌리면 넓게)
      for (let f = 0; f < S.n; f++) {
        let a = S.fw, b = -1;
        for (let y = Math.max(0, foot - rows); y <= foot; y++) for (let xx = 0; xx < S.fw; xx++) if (d[(y * img.width + f * S.fw + xx) * 4 + 3] > A0) { a = Math.min(a, xx); b = Math.max(b, xx); }
        feet.push((b < 0 ? [S.fw * 0.3, S.fw * 0.6] : [a, b + 1]).map(v => v * sc));
      }
      const seq = S.seq || [...Array(S.n).keys()], dur = S.dur || seq.map(() => 1);
      const spr = {
        img, hi: !!S.hi, sw: S.fw, sh: S.fh, fw: S.fw * sc, fh: S.fh * sc, n: S.n, sc, ax: (S.ax != null ? S.ax : S.fw / 2) * sc,
        stride: S.stride || 0, cyc: S.cyc || seq.length / WALK_FPS, seq, dur, total: dur.reduce((p, q) => p + q, 0),
        foot: (foot + 1) * sc - 1, top: top * sc, feet
      };
      if (S.sleep) { const si = await loadImg(S.sleep.img); if (si) spr.sleep = { img: si, fw: S.sleep.fw, fh: S.sleep.fh, n: S.sleep.n }; }
      return spr;
    }));
  }

  // ---------- 그리기 도우미 ----------
  function sparkle(ctx, x, y, a, col) {
    ctx.globalAlpha = a; ctx.fillStyle = col || '#fffbe6';
    ctx.fillRect(x, y, 1, 1); if (a > 0.5) { ctx.fillRect(x - 1, y, 1, 1); ctx.fillRect(x + 1, y, 1, 1); ctx.fillRect(x, y - 1, 1, 1); ctx.fillRect(x, y + 1, 1, 1); }
    ctx.globalAlpha = 1;
  }
  function zee(ctx, x, y, big, a) {
    const g = big ? ['11111', '00010', '00100', '01000', '11111'] : ['1111', '0010', '0100', '1111'];
    ctx.globalAlpha = a; ctx.fillStyle = '#e8eeff';
    g.forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') ctx.fillRect(x + i, y + j, 1, 1); }));
    ctx.globalAlpha = 1;
  }
  function log(ctx, cx, ground) {     // 앉는 통나무 (패키지 그림처럼 단색 면 + 나이테)
    ctx.fillStyle = '#4a3122'; ctx.fillRect(cx - 16, ground - 7, 32, 7);
    ctx.fillStyle = '#6b4a31'; ctx.fillRect(cx - 16, ground - 7, 32, 2);
    ctx.fillStyle = '#8a6444'; ctx.fillRect(cx + 13, ground - 6, 3, 5); ctx.fillStyle = '#b48a5e'; ctx.fillRect(cx + 14, ground - 5, 1, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(cx - 17, ground, 34, 1);
  }

  // ---------- 장면 ----------
  const T0 = performance.now();      // 다시 그려도(버튼을 눌러도) 배경이 처음으로 튀지 않게 시계는 하나
  function Scene(canvas, opts) {
    const o = Object.assign({ look: 'girl', state: 'WALK', weather: 'clear', time: null, reduced: false }, opts || {});
    const ctx = canvas.getContext('2d');
    let W = 256, k = 2, A = null, spr = null, raf = 0, alive = true, last = -1, shown = true;
    canvas.classList.add('px', 'scene-cv');
    canvas.setAttribute('role', 'img');

    function measure() {
      const host = canvas.parentElement, cssW = Math.max(240, Math.min(560, (host && host.clientWidth) || 360));
      const dpr = window.devicePixelRatio || 1;
      k = Math.max(1, Math.round(190 * dpr / H));                       // 기기 픽셀 기준 정수 배율 (높이 약 190 CSS px)
      const w = Math.max(160, Math.floor(cssW * dpr / k));
      // 캔버스 자체는 기기 픽셀 해상도 (배경 원본 화질), 그리기는 논리 좌표 × k
      if (w !== W || canvas.width !== w * k || canvas.height !== H * k) { W = w; canvas.width = W * k; canvas.height = H * k; }
      canvas.style.width = (W * k / dpr) + 'px'; canvas.style.height = (H * k / dpr) + 'px';
    }
    const smooth = on => { ctx.imageSmoothingEnabled = on; if (on) ctx.imageSmoothingQuality = 'high'; };
    const curTime = () => o.time || timeOf();
    function label() { canvas.setAttribute('aria-label', '모험 장면: ' + TIME_NAME[curTime()] + ', ' + (WEATHER_NAME[o.weather] || '맑음') + ', 용사는 ' + STATE_NAME[o.state]); }

    // 부드러운 타원 그림자 (기기 해상도라 둥글게). x·y = 가운데, rx·ry = 반지름
    function blob(x, y, rx, ry, a) {
      if (a <= 0 || rx <= 0) return;
      ctx.save(); smooth(true); ctx.translate(x, y); ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      g.addColorStop(0, 'rgba(18,12,28,' + a.toFixed(3) + ')'); g.addColorStop(0.6, 'rgba(18,12,28,' + (a * 0.85).toFixed(3) + ')'); g.addColorStop(1, 'rgba(18,12,28,0)');
      ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore(); smooth(false);
    }
    // 걷는 용사 발밑 그림자: 프레임마다 두 발 범위에 맞춰 폭이 바뀌고, 시간대·날씨에 따라 진하기·길이가 달라짐
    function heroShadow(f, left, feetY, t) {
      const P = SHADOW[t] || SHADOW.day, w = o.weather, diffuse = w === 'cloudy' || w === 'rain' || w === 'fog';
      const a = P.a * (diffuse ? 0.55 : w === 'snow' ? 0.75 : 1), sx = diffuse ? 1 : P.sx, dx = diffuse ? 0 : P.dx;
      const [fa, fb] = spr.feet[f] || [spr.fw * 0.3, spr.fw * 0.6], span = fb - fa;
      blob(left + (fa + fb) / 2 + dx, feetY + 1, Math.max(9, span / 2 + 4) * sx, 3.6, a);   // 발바닥 선(feetY+1)이 가운데 → 아래쪽 절반이 땅에 보임
    }

    // 걷기 칸 고르기: 한 바퀴(cyc 초)를 칸마다 dur 비율로 나눔 (양쪽 걸음 시간이 같게)
    function walkFrame(sec) {
      let p = ((sec / spr.cyc) % 1) * spr.total;
      for (let i = 0; i < spr.seq.length; i++) { p -= spr.dur[i]; if (p < 0) return spr.seq[i]; }
      return spr.seq[spr.seq.length - 1];
    }
    const snap = v => Math.round(v * k) / k;   // 기기 픽셀에 맞춤 (흔들림·번짐 없이)
    // 용사 한 칸 그리기: 원본 해상도 시트는 기기 해상도로 부드럽게 줄임, 옛 도트 시트는 최근접. ch = 위에서부터 그릴 논리 높이(통나무 뒤 등)
    function hero(f, x, y, ch, img) {
      const h = ch == null ? spr.fh : Math.max(0, Math.min(spr.fh, ch));
      if (h <= 0) return;
      if (spr.hi) smooth(true);
      ctx.drawImage(img || spr.img, f * spr.sw, 0, spr.sw, h / spr.sc, snap(x), snap(y), spr.fw, h);
      if (spr.hi) smooth(false);
    }

    // 저녁 달: 도트(논리 1px = 1칸, 용사 도트와 같은 크기) 보름달 + 부드러운 달빛 번짐. 하늘에 고정
    function moon(mx, my, a) {
      if (!a) return;
      mx = Math.round(mx); my = Math.round(my);
      smooth(true);
      const g = ctx.createRadialGradient(mx, my, 3, mx, my, 26);
      g.addColorStop(0, 'rgba(255,240,205,' + (0.45 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,240,205,0)');
      ctx.fillStyle = g; ctx.fillRect(mx - 26, my - 26, 52, 52);
      smooth(false);
      ctx.globalAlpha = a;
      for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
        const r2 = x * x + y * y; if (r2 > 42) continue;
        const crater = (x === -2 && y === -1) || (x === -1 && y === -1) || (x === 2 && y === 2) || (x === 3 && y === 2) || (x === 1 && y === -3) || (x === -3 && y === 3);
        ctx.fillStyle = r2 > 30 ? (x + y > 0 ? '#e9cf98' : '#fff3cf') : crater ? '#ecd9a6' : (x + y > 4 ? '#f6e4b4' : '#fff8e2');
        ctx.fillRect(mx + x, my + y, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    // 모험(걷기): 하늘(고정) → (밤) 별 / (저녁) 달 → 구름(저녁 빼고) → 산·숲·성 → 길·유적·꽃 → 그림자·용사(길 위) → 반딧불·반짝임(낮·새벽) → 날씨
    function parallax(now, sec, t, moving, speed) {
      const P = A.par, s = H / PARX.crop, dh = P.h * s;                                     // 원본 1px → 논리 px, 그림 전체 높이(아래 투명 줄은 화면 밖)
      const per = L => Math.round(P.period[L] * s * k) / k;                                  // 한 주기를 기기 픽셀 정수로 → 이어 붙인 경계에 틈·겹침 없음
      const dt = parLast == null ? 0 : Math.max(0, Math.min(0.5, (now - parLast) / 1000));
      parLast = now;
      if (moving) for (const L in parPos) parPos[L] = (parPos[L] + speed * PARX.ratio[L] * dt) % per(L);
      const layer = (img, L, x0) => {
        if (!img) return;
        const im = tinted(img, 'v3-' + L, t, 1), p = per(L);
        smooth(true);
        for (let x = x0 == null ? Math.floor(-(parPos[L] % p) * k) / k : x0; x < W; x += p) ctx.drawImage(im, 0, 0, P.period[L], P.h, x, 0, p, dh);   // 주기 간격으로 두 장 이상
        smooth(false);
      };
      const w = o.weather, clear = w === 'clear' || w === 'fog';
      layer(P.sky, 'sky', 0);                                          // 하늘은 고정
      if (t === 'night' && clear) {                                   // 밤하늘: 희미한 별 몇 개 + 드물게 하나씩 반짝 (2026-11-15 "드물게 하나씩")
        const p = per('sky'), d = 1 / k, fade = w === 'fog' ? 0.5 : 1, vis = [];
        P.stars.forEach((st, i) => { const x = (st.x * s) % p; if (x <= W) vis.push({ st, x, i }); });
        vis.forEach(({ st, x, i }) => {                               // 희미한 별: 12개 중 1개만, 반짝이지 않음
          if (i % 12) return;
          ctx.globalAlpha = (st.warm ? 0.32 : 0.42) * fade; ctx.fillStyle = st.warm ? '#fff1c4' : '#eaf2ff';
          ctx.fillRect(Math.round(x * k) / k, Math.round(st.y * s * k) / k, 2 * d, 2 * d);
        });
        // 지금 구름에 가려진 별인지 (구름 레이어는 따로 흐르므로 그 위치에서 구름 투명도를 봄)
        const cloudy = (x, y) => { const ca = P.cloudA; if (!ca) return false; const pc = per('clouds'), sx = Math.floor((((x + parPos.clouds) % pc) + pc) % pc / s), sy = Math.floor(y); return sy < ca.h && ca.a[sy * ca.w + Math.min(ca.w - 1, sx)] > 24; };
        if (!o.reduced && vis.length) {                               // 반짝임: 2.6초마다 구름 없는 자리의 별 하나가 1초 동안 십자로 빛났다 사라짐
          const T = 2.6, e = Math.floor(sec / T), u = (sec - e * T) / 1.0;
          let pick = null;
          if (u < 1) { const h = Math.abs(Math.sin(e * 12.9898) * 43758.5453) % 1, i0 = Math.floor(h * vis.length); for (let j = 0; j < vis.length && !pick; j++) { const v = vis[(i0 + j * 7) % vis.length]; if (!cloudy(v.x, v.st.y)) pick = v; } }
          if (pick) {
            const { st, x } = pick;
            const a = Math.sin(Math.PI * u) * fade, X = Math.round(x * k) / k, Y = Math.round(st.y * s * k) / k, L = 1 + Math.round(3 * Math.sin(Math.PI * u));
            ctx.fillStyle = '#fffbe8';
            ctx.globalAlpha = a; ctx.fillRect(X, Y, 2 * d, 2 * d);
            ctx.globalAlpha = a * 0.75; ctx.fillRect(X - L * d, Y + 0.5 * d, (2 + 2 * L) * d, d); ctx.fillRect(X + 0.5 * d, Y - L * d, d, (2 + 2 * L) * d);
          }
        }
        ctx.globalAlpha = 1;
      }
      if (t === 'sunset') moon(W * 0.74, 24, o.weather === 'clear' ? 1 : 0.35);   // 저녁: 구름 없이 달만
      else layer(P.clouds, 'clouds');
      layer(P.mid, 'mid');
      layer(P.front, 'front');
      if (spr) {                                                       // 용사는 길 위 (울타리·유적보다 앞)
        const f = moving ? walkFrame(sec) : spr.seq[0], left = snap(W * 0.37 - spr.ax);
        heroShadow(f, left, PARX.feet, t);
        hero(f, left, PARX.feet - spr.foot, null, tinted(spr.img, 'hero-' + o.look, t, 0.45));
      }
      if (t === 'night' && clear) for (let i = 0; i < 5; i++) {        // 반딧불이 (울타리·꽃 위)
        const fx = ((i * 97 + sec * (5 + i)) % (W + 20)) - 10, fy = 104 + Math.sin(sec * 1.3 + i * 2) * 6 + i * 4;
        sparkle(ctx, Math.round(fx), Math.round(fy), 0.4 + 0.4 * Math.sin(sec * 3 + i), '#e8ff9a');
      }
      if (P.sparkle) {                                                 // 따로 떠다니는 반짝임 (맵 그림에 합치지 않음)
        // 밤·저녁은 끔 (밤하늘 별이 너무 많아 보이고, 저녁은 달만 있는 깨끗한 하늘)
        const s2 = H / P.sparkle.height, tw = P.sparkle.width * s2, a = ({ day: 0.45, dawn: 0.65 }[t] || 0) * (o.reduced ? 0.8 : 0.65 + 0.35 * Math.sin(sec * 1.4));
        const dx = -(((sec * 4 + parPos.mid * 0.6) % tw) + tw) % tw, dy = o.reduced ? 0 : Math.sin(sec * 0.6) * 2;
        ctx.globalAlpha = a; smooth(true);
        for (let x = dx; x < W; x += tw) ctx.drawImage(P.sparkle, x, dy, tw, H);
        smooth(false); ctx.globalAlpha = 1;
      }
      weather(sec, true);
    }

    function weather(sec, sky) {
      const w = o.weather;
      if (w === 'rain' && A.rain) {
        ctx.fillStyle = 'rgba(20,28,58,0.3)'; ctx.fillRect(0, 0, W, H);
        const y = Math.floor((sec * 150) % H); for (let x = 0; x < W; x += TW) { ctx.drawImage(A.rain, x, y - H); ctx.drawImage(A.rain, x, y); }
      } else if (w === 'snow' && A.snow) {
        ctx.fillStyle = 'rgba(205,215,240,0.12)'; ctx.fillRect(0, 0, W, H);
        const y = Math.floor((sec * 14) % H), dx = Math.round(Math.sin(sec * 0.7) * 4); for (let x = -TW; x < W + TW; x += TW) { ctx.drawImage(A.snow, x + dx, y - H); ctx.drawImage(A.snow, x + dx, y); }
      } else if (w === 'cloudy') { ctx.fillStyle = 'rgba(58,66,90,0.22)'; ctx.fillRect(0, 0, W, H); }
      else if (w === 'fog') {
        ctx.fillStyle = '#e2e6ee';                                    // 땅 위로 낮게 깔린 안개 띠 (천천히 짙어졌다 옅어짐)
        const breathe = 0.85 + 0.15 * Math.sin(sec * 0.4);
        for (let y = 56; y < 130; y++) { ctx.globalAlpha = 0.24 * Math.sin(Math.PI * (y - 56) / 74) * breathe; ctx.fillRect(0, y, W, 1); }
        ctx.globalAlpha = 1;
      }
      if (sky && (w === 'cloudy' || w === 'rain' || w === 'snow')) { ctx.fillStyle = 'rgba(70,78,100,0.35)'; ctx.fillRect(0, 0, W, 70); }   // 하늘을 흐리게 (해·달 가림)
    }

    function draw(now) {
      ctx.setTransform(k, 0, 0, k, 0, 0); smooth(false);
      if (!A) { ctx.fillStyle = '#14122a'; ctx.fillRect(0, 0, W, H); return; }
      const t = curTime(), B = A.bg[t], sec = (now - T0) / 1000, camp = o.state !== 'WALK';
      ctx.clearRect(0, 0, W, H);
      if (camp || o.reduced) parLast = now;            // 쉬는 동안은 배경 위치가 그대로 (다시 걸으면 그 자리부터)
      if (!camp) {
        const moving = !o.reduced, speed = spr && spr.stride ? spr.stride / spr.cyc : SPEED;   // 땅 속도 = 한 바퀴 보폭 ÷ 한 바퀴 시간 (발이 미끄러지지 않게)
        if (A.par) { parallax(now, sec, t, moving, speed); return; }
        const bgi = A.hi && A.hi[t];
        if (bgi) {                                   // 사용자 배경 원본: 걷는 동안 전체가 왼쪽으로 (발과 같은 속도)
          const lw2 = bgi.lw * 2, x0 = moving ? -((sec * speed) % lw2) : 0;
          smooth(true);
          for (let x = x0; x < W; x += lw2) ctx.drawImage(bgi.img, x, 0, lw2, H);
          smooth(false);
          if (spr) {
            const f = moving ? walkFrame(sec) : spr.seq[0], left = snap(W * 0.37 - spr.ax);
            heroShadow(f, left, HI.feet, t);
            hero(f, left, HI.feet - spr.foot);
          }
          weather(sec, true);
          return;
        }
        const layer = (img, f) => { if (!img) return; const x0 = moving ? -Math.floor((sec * speed * f) % TW) : 0; for (let x = x0; x < W; x += TW) ctx.drawImage(img, x, 0); };
        if (B.sky) for (let x = 0; x < W; x += TW) ctx.drawImage(B.sky, x, 0);     // 하늘은 고정
        if (o.weather === 'cloudy' || o.weather === 'rain' || o.weather === 'snow') { ctx.fillStyle = 'rgba(120,128,150,0.45)'; ctx.fillRect(0, 0, W, 70); }
        layer(B.far, PAR.far);
        if (o.weather === 'fog') { ctx.fillStyle = 'rgba(214,220,232,0.4)'; ctx.fillRect(0, 0, W, H); }
        layer(B.mid, PAR.mid);
        if (o.weather === 'fog') { ctx.fillStyle = 'rgba(214,220,232,0.2)'; ctx.fillRect(0, 0, W, H); }
        layer(B.front, PAR.front);
        if (t === 'night' && o.weather === 'clear') for (let i = 0; i < 4; i++) {     // 반딧불이
          const fx = ((i * 97 + sec * (5 + i)) % (W + 20)) - 10, fy = 96 + Math.sin(sec * 1.3 + i * 2) * 6 + i * 3;
          sparkle(ctx, Math.round(fx), Math.round(fy), 0.4 + 0.4 * Math.sin(sec * 3 + i), '#e8ff9a');
        }
        if (spr) {
          const f = moving ? walkFrame(sec) : spr.seq[0], left = snap(W * 0.37 - spr.ax);
          heroShadow(f, left, GROUND, t);
          hero(f, left, GROUND - spr.foot);
        }
        weather(sec, false);
        return;
      }
      if (A.campHi) return campPhoto(now, sec, t);
      // 캠프: 불이 화면 가운데쯤 오도록 캠프 그림을 맞춰 자름
      const x0 = Math.max(0, Math.min(TW - W, Math.round(CAMP.fire - W * 0.5))), X = v => v - x0;
      if (A.camp) { ctx.drawImage(A.camp, -x0, 0); if (W > TW) ctx.drawImage(A.camp, TW - x0, 0); }
      const tint = { dawn: 'rgba(255,170,190,0.16)', day: 'rgba(170,205,255,0.24)', sunset: 'rgba(255,140,90,0.16)' }[t];   // 캠프 그림은 밤 → 시간대 빛만 살짝
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
      const ff = o.reduced ? 0 : Math.floor((now - T0) / A.fireMs) % A.fire.length, fire = A.fire[ff];
      if (spr) {
        const cx = X(CAMP.hero), sy = CAMP.ground - spr.foot + 15, cut = Math.max(0, CAMP.ground - 4 - sy);   // 통나무 뒤에 앉은 모습
        hero(spr.seq[0], cx - spr.ax, sy, cut);
        if (o.state === 'SLEEP_PREP' || o.state === 'SLEEP') {          // 어깨까지 담요
          const cl = CLOTH[o.look] || CLOTH.girl, top = sy + spr.top + Math.round((spr.foot - spr.top) * 0.5), bot = CAMP.ground - 6;
          for (let y = top; y < bot; y++) {
            const j = y - top, w = Math.min(14, 9 + j), inset = j === 0 ? 3 : j === 1 ? 1 : 0;
            ctx.fillStyle = cl[j === 0 ? 3 : 2]; ctx.fillRect(cx - w + inset, y, (w - inset) * 2, 1);
            ctx.fillStyle = cl[1]; ctx.fillRect(cx + w - inset - 4, y, 4, 1);
            if (j > 2) { ctx.fillStyle = cl[1]; ctx.fillRect(cx - 4, y, 1, 1); ctx.fillRect(cx + 3 + (j % 2), y, 1, 1); }
          }
        }
        log(ctx, cx, CAMP.ground);
      }
      if (fire) ctx.drawImage(fire, X(CAMP.fire) - 24, CAMP.ground + 1 - 58);
      const sf = A.spark.length, sa = o.state === 'SLEEP' ? 1 : 0.6;     // 반짝임 4프레임 (잠들 준비·휴식은 약하게)
      [[70, 22], [150, 12], [262, 30], [318, 16], [420, 26]].forEach(([px, py], i) => {
        const img = A.spark[(Math.floor((now - T0) / A.sparkMs) + i) % sf];
        if (img) { ctx.globalAlpha = o.reduced ? sa * 0.8 : sa; ctx.drawImage(img, X(px) - 16, py - 16); ctx.globalAlpha = 1; }
      });
      if (o.state === 'SLEEP' && spr) for (let i = 0; i < 3; i++) {              // 머리 위로 Z
        const life = o.reduced ? i / 3 : ((sec / 2.6) + i / 3) % 1, hx = X(CAMP.hero) + 10, hy = CAMP.ground - spr.foot + 15 + spr.top;
        zee(ctx, hx + Math.round(life * 10) + i * 2, hy - 4 - Math.round(life * 20) - i, i === 2, 1 - life * 0.9);
      }
      weather(sec, true);
    }
    // 캠프(사용자 저녁 그림): 쉬기·잠들 준비 = 불 오른쪽 통나무 뒤에 불을 보고 앉음(통나무를 다시 덮어 그려 다리를 가림), 잠 = 텐트 안에서 잠(Z)
    //  그림 속 모닥불은 빛이 일렁이고 불티가 오름. 정식 앉기·잠 그림이 오면 여기서 바꿔 그림
    function campPhoto(now, sec, t) {
      const img = A.campHi, C = CAMP2, s = img.height / C.h, x0 = Math.max(0, Math.min(C.w * 2 - W, Math.round(C.fireX - W * 0.45))), X = v => v - x0, Y = v => v - C.offY;   // img = [그림 | 뒤집은 그림] 원본 해상도 (넓은 화면용)
      smooth(true); ctx.drawImage(img, -x0, -C.offY, C.w * 2, C.h); smooth(false);
      const tint = { dawn: 'rgba(255,170,190,0.14)', day: 'rgba(170,205,255,0.22)' }[t];
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(0, 0, W, H); }
      const fl = o.reduced ? 0.5 : 0.5 + 0.5 * Math.sin(sec * 7) * Math.sin(sec * 2.3 + 1);      // 불빛 일렁임
      const gx = X(C.fireX), gy = Y(C.fireY), gr = ctx.createRadialGradient(gx, gy, 2, gx, gy, 40);   // 둥근 불빛 (고해상도라 네모가 보이지 않게)
      gr.addColorStop(0, 'rgba(255,180,90,' + (0.30 + 0.14 * fl).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,180,90,0)');
      ctx.fillStyle = gr; ctx.fillRect(gx - 40, gy - 40, 80, 80);
      for (let i = 0; i < 6; i++) {                                                           // 불티
        const life = o.reduced ? i / 6 : ((sec / 1.6) + i / 6) % 1;
        sparkle(ctx, X(C.fireX) + Math.round(Math.sin(i * 2.1 + life * 6) * 6), Math.round(Y(C.fireY) - 6 - life * 34), (1 - life) * 0.9, i % 2 ? '#ffd36a' : '#ff9a4a');
      }
      if (spr && o.state !== 'SLEEP') {
        const waist = spr.top + Math.round((spr.foot - spr.top) * 0.55), sy = Y(C.log[1]) + 4 - waist, sx = snap(X(C.sitX) - spr.fw + spr.ax);
        ctx.save(); ctx.translate(sx + spr.fw, 0); ctx.scale(-1, 1);                          // 불 쪽(왼쪽)을 보게 좌우 반전 (머리 가운데가 sitX)
        hero(0, 0, sy);
        ctx.restore();
        if (o.state === 'SLEEP_PREP') {                                                        // 어깨까지 담요
          const cl = CLOTH[o.look] || CLOTH.girl, cx = X(C.sitX), top = sy + spr.top + Math.round((spr.foot - spr.top) * 0.36), bot = Y(C.log[1]) + 6;
          for (let y = top; y < bot; y++) {
            const j = y - top, w = Math.min(15, 10 + j), inset = j === 0 ? 3 : j === 1 ? 1 : 0;
            ctx.fillStyle = cl[j === 0 ? 3 : 2]; ctx.fillRect(cx - w + inset, y, (w - inset) * 2, 1);
            ctx.fillStyle = cl[1]; ctx.fillRect(cx - w + inset, y, 4, 1);
            if (j > 2) { ctx.fillStyle = cl[1]; ctx.fillRect(cx + 3, y, 1, 1); ctx.fillRect(cx - 4 - (j % 2), y, 1, 1); }
          }
        }
        const [lx0, ly0, lx1, ly1] = C.log;                                                    // 통나무를 다시 그려 다리를 가림
        smooth(true); ctx.drawImage(img, lx0 * s, ly0 * s, (lx1 - lx0) * s, (ly1 - ly0) * s, X(lx0), Y(ly0), lx1 - lx0, ly1 - ly0); smooth(false);
      }
      [[22, 30], [96, 12], [176, 22], [236, 36], [282, 14]].forEach(([px, py], i) => {      // 작은 별빛 (그림에 맞게 작은 점)
        const a = o.reduced ? 0.6 : 0.5 + 0.5 * Math.sin(sec * 2.2 + i * 2.1);
        sparkle(ctx, X(px), py, a * (o.state === 'SLEEP' ? 0.95 : 0.7), i % 2 ? '#fff4c8' : '#ffffff');
      });
      if (o.state === 'SLEEP' && spr && spr.sleep) {                                           // 사용자 잠 그림 8프레임: 불 오른쪽 통나무 앞에서 침낭 베고 잠 (Z는 그림 안에)
        const z = spr.sleep, f = o.reduced ? 0 : Math.floor(sec * SLEEP_FPS) % z.n;
        blob(X(C.sleepX) + 3, Y(C.sleepY) - 1, z.fw * 0.46, 3, 0.3);                              // 침낭 밑 그림자 (불 반대쪽으로 조금)
        ctx.drawImage(z.img, f * z.fw, 0, z.fw, z.fh, X(C.sleepX) - Math.round(z.fw / 2), Y(C.sleepY) - z.fh, z.fw, z.fh);
      } else if (o.state === 'SLEEP') for (let i = 0; i < 3; i++) {                             // 잠 그림이 없으면 텐트에서 Z
        const life = o.reduced ? i / 3 : ((sec / 2.6) + i / 3) % 1;
        zee(ctx, X(C.tent[0]) + Math.round(life * 12) + i * 2, Y(C.tent[1]) - Math.round(life * 24) - i * 2, i === 2, 1 - life * 0.9);
      }
      weather(sec, true);
    }
    function loop(now) {
      if (!alive) return;
      if (!canvas.isConnected) { api.stop(); return; }
      raf = requestAnimationFrame(loop);
      if (!shown || document.hidden) return;
      if (now - last < 1000 / FPS) return;
      last = now; draw(now);
    }
    let io = null;
    if ('IntersectionObserver' in window) { io = new IntersectionObserver(es => { shown = es.some(e => e.isIntersecting); }); io.observe(canvas); }
    const onResize = () => { measure(); draw(performance.now()); };
    window.addEventListener('resize', onResize);
    measure(); label();
    Promise.all([art(), sprite(o.look)]).then(([a, s]) => { A = a; spr = s; draw(performance.now()); });
    if (!o.reduced) raf = requestAnimationFrame(loop); else draw(performance.now());
    const api = {
      set(p) {
        const lookChanged = p.look && p.look !== o.look; Object.assign(o, p); label();
        if (lookChanged) sprite(o.look).then(s => { spr = s; draw(performance.now()); });
        draw(performance.now());
      },
      stop() { alive = false; cancelAnimationFrame(raf); if (io) io.disconnect(); window.removeEventListener('resize', onResize); },
      drawAt(ms) { draw(ms); },        // 테스트용: 정해진 시각의 한 장면 (그림을 다 읽은 뒤)
      get ready() { return !!A && !!spr; },
      get info() { return { time: curTime(), weather: o.weather, state: o.state, W, H, k, par: Object.assign({}, parPos) }; }
    };
    return api;
  }

  return { Scene, timeOf, art, sprite, TIME_NAME, WEATHER_NAME, STATE_NAME, H, GROUND, CAMP };
})();
