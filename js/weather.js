/* 날씨 (2026-11-13 명세 5장) — 상단 모험 장면에 비·눈·흐림·안개를 덧씌우는 용도
 *  - 설정에서 켠다: 위치 허용 → 현재 위치, 거부하거나 직접 고르면 → 지역
 *  - 무료 날씨 서비스 Open-Meteo (가입·키 없음). 보내는 것은 위도·경도뿐이고 소수 둘째 자리(약 1km)로 줄여서 보낸다. 용사 기록은 보내지 않는다
 *  - 30분 동안은 받아 둔 값을 쓴다 (앱을 열거나 다시 돌아올 때만 확인). 실패하면 마지막 날씨, 그것도 없으면 맑음(시간대 배경만)
 */
window.BM = window.BM || {};
BM.weather = (function () {
  const KEY = 'bravemaker.weather.v1', TTL = 30 * 60 * 1000;
  const REGIONS = [
    ['seoul', '서울', 37.57, 126.98], ['busan', '부산', 35.18, 129.08], ['incheon', '인천', 37.46, 126.71], ['daegu', '대구', 35.87, 128.6],
    ['daejeon', '대전', 36.35, 127.38], ['gwangju', '광주', 35.16, 126.85], ['ulsan', '울산', 35.54, 129.31], ['sejong', '세종', 36.48, 127.29],
    ['suwon', '수원', 37.26, 127.03], ['chuncheon', '춘천', 37.88, 127.73], ['gangneung', '강릉', 37.75, 128.88], ['cheongju', '청주', 36.64, 127.49],
    ['jeonju', '전주', 35.82, 127.15], ['pohang', '포항', 36.02, 129.34], ['changwon', '창원', 35.23, 128.68], ['jeju', '제주', 33.5, 126.53]
  ];
  let mem = null, pending = null;
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function store(v) { mem = v; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* 저장 못 해도 이번 실행에서는 씀 */ } }
  // WMO 날씨 코드 → 장면 날씨 5가지
  function kindOf(code) {
    if (code == null) return 'clear';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) return 'rain';
    if (code === 3) return 'cloudy';
    return 'clear';
  }
  function settings(S) { const w = (S && S.settings && S.settings.weather) || {}; return { mode: w.mode || 'off', region: w.region || 'seoul' }; }
  function info() { return mem || (mem = load()); }
  // 장면에 쓸 날씨: 꺼져 있으면 맑음, 켜져 있으면 마지막으로 받은 날씨
  function kind(S) { if (settings(S).mode === 'off') return 'clear'; const v = info(); return (v && v.kind) || 'clear'; }
  function position() {
    return new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(Object.assign(new Error('위치 기능 없음'), { code: 2 }));
      navigator.geolocation.getCurrentPosition(p => res(p.coords), rej, { maximumAge: TTL, timeout: 12000, enableHighAccuracy: false });
    });
  }
  async function fetchNow(lat, lon) {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat.toFixed(2) + '&longitude=' + lon.toFixed(2) + '&current=weather_code&timezone=auto';
    const ctl = typeof AbortController === 'function' ? new AbortController() : null, tm = setTimeout(() => ctl && ctl.abort(), 8000);
    try {
      const res = await fetch(url, ctl ? { signal: ctl.signal } : {});
      if (!res.ok) throw new Error('날씨 응답 ' + res.status);
      const j = await res.json();
      return j && j.current ? j.current.weather_code : null;
    } finally { clearTimeout(tm); }
  }
  // 새로 받아 오기 (30분 안에 같은 설정으로 받은 게 있으면 그대로). 위치 권한 거부는 err.code === 1
  function refresh(S, force) {
    const st = settings(S);
    if (st.mode === 'off') return Promise.resolve(null);
    const cur = info();
    if (!force && cur && cur.mode === st.mode && (st.mode !== 'region' || cur.region === st.region) && Date.now() - cur.at < TTL) return Promise.resolve(cur);
    if (pending) return pending;
    pending = (async () => {
      let lat, lon, place;
      if (st.mode === 'gps') { const c = await position(); lat = c.latitude; lon = c.longitude; place = '현재 위치'; }
      else { const r = REGIONS.find(x => x[0] === st.region) || REGIONS[0]; lat = r[2]; lon = r[3]; place = r[1]; }
      const code = await fetchNow(lat, lon);
      const v = { kind: kindOf(code), code, at: Date.now(), mode: st.mode, region: st.region, place };
      store(v);
      return v;
    })().finally(() => { pending = null; });
    return pending;
  }
  function forget() { mem = null; try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ } }
  return { REGIONS, kind, kindOf, info, refresh, settings, forget, TTL };
})();
