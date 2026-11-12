/* 공용 유틸: 시드 랜덤, 해시, 날짜 */
window.BM = window.BM || {};
BM.util = (function () {
  // 문자열/숫자 → 32bit 해시 (FNV-1a)
  function hash(...parts) {
    let h = 0x811c9dc5;
    const s = parts.join('|');
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
  // mulberry32 — 같은 시드면 항상 같은 수열
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function newSeed() {
    try {
      const u = new Uint32Array(1);
      crypto.getRandomValues(u);
      return u[0];
    } catch (e) {
      return (Math.random() * 4294967296) >>> 0;
    }
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // ---- 날짜 (로컬 시간, 하루 경계 = dayStartHour) ----
  function pad(n) { return String(n).padStart(2, '0'); }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today(now) {
    const d = now ? new Date(now) : new Date();
    d.setHours(d.getHours() - (BM.CONFIG.dayStartHour || 0));
    return ymd(d);
  }
  function parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); }
  function addDays(s, n) { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); }
  function weekday(s) { return parse(s).getDay(); }
  function daysBetween(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  function pretty(s) { const d = parse(s); return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WD[d.getDay()] + ')'; }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmt(v) {
    const r = Math.round(v * 100) / 100;
    return (Number.isInteger(r) ? r.toLocaleString('ko-KR') : r.toLocaleString('ko-KR', { maximumFractionDigits: 2 }));
  }

  return { hash, rng, shuffle, newSeed, clamp, ymd, today, parse, addDays, weekday, daysBetween, pretty, WD, esc, fmt };
})();
