/* 계정 저장 (claude.ai 링크로 열었을 때만 동작)
 * 기록을 내 Claude 계정의 비공개 공간 data/users/<내 id>/ 에 저장한다 → 아이폰·PC 어디서 열어도 같은 용사.
 * 문서 하나는 256KB 제한이 있어 본체(save) + 월별 기록(m-YYYY-MM)으로 나눈다.
 * 일반 브라우저/설치 앱에서는 window.claude 가 없으므로 아무것도 하지 않는다 (기기 저장만 사용).
 */
window.BM = window.BM || {};
BM.cloud = (function () {
  let db = null, uid = null, downloads = null;
  let timer = null, chain = Promise.resolve(), pending = null;
  const sent = {};                       // 문서별 마지막으로 보낸 내용 (바뀐 것만 쓰기)
  let onError = null;

  function present() { return !!(window.claude && typeof window.claude.use === 'function'); }
  function withTimeout(p, ms) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), ms))]); }

  async function init() {
    if (!present()) return false;
    try {
      const [d, u, dl] = await withTimeout(Promise.all([window.claude.use('db'), window.claude.use('user'), window.claude.use('downloads')]), 12000);
      downloads = dl || null;
      if (!d || !u) return false;
      const id = await u.id();
      if (!id) return false;
      db = d; uid = id;
      return true;
    } catch (e) { return false; }
  }
  const ready = () => !!(db && uid);
  const ref = name => db.doc('data/users/' + uid + '/' + name);

  async function load() {
    if (!ready()) return null;
    const main = await withTimeout(ref('save').get(), 12000);
    if (!main.exists) return null;
    const body = main.data();
    const s = JSON.parse(body.json);
    s.records = {};
    sent.save = body.json;
    for (const m of (body.months || [])) {
      const d = await withTimeout(ref('m-' + m).get(), 12000);
      if (d.exists) { const j = d.data().json; sent['m-' + m] = j; Object.assign(s.records, JSON.parse(j)); }
    }
    return s;
  }

  function split(state) {
    const core = Object.assign({}, state); delete core.records;
    const months = {};
    Object.keys(state.records || {}).sort().forEach(d => { const m = d.slice(0, 7); (months[m] = months[m] || {})[d] = state.records[d]; });
    return { core, months };
  }
  async function write(name, json, extra) {
    if (sent[name] === json && !extra) return;
    await ref(name).set(Object.assign({ json, at: new Date().toISOString() }, extra || {}));
    sent[name] = json;
  }
  async function flushNow(state) {
    const { core, months } = split(state);
    const names = Object.keys(months);
    for (const m of names) await write('m-' + m, JSON.stringify(months[m]));
    // 기록을 지워 빈 달이 된 문서는 비운다
    for (const k of Object.keys(sent)) if (k.startsWith('m-') && !months[k.slice(2)] && sent[k] !== '{}') await write(k, '{}');
    const coreJson = JSON.stringify(core);
    const monthList = names.join(',');
    if (sent.save !== coreJson || sent._months !== monthList) {
      await ref('save').set({ json: coreJson, months: names, at: new Date().toISOString() });
      sent.save = coreJson; sent._months = monthList;
    }
  }
  // 화면 조작마다 바로 쓰지 않고 잠깐 모았다가 한 번에 (한 문서에 한 번에 하나씩)
  function save(state) {
    if (!ready()) return;
    pending = JSON.parse(JSON.stringify(state));
    clearTimeout(timer);
    timer = setTimeout(flush, 700);
  }
  function flush() {
    clearTimeout(timer);
    if (!pending) return chain;
    const s = pending; pending = null;
    chain = chain.then(() => flushNow(s)).catch(e => { if (onError) onError(e); });
    return chain;
  }
  async function clear() {
    if (!ready()) return;
    pending = null; clearTimeout(timer);
    await chain.catch(() => { });
    const names = Object.keys(sent).filter(k => k === 'save' || k.startsWith('m-'));
    for (const k of names) { try { await ref(k).delete(); } catch (e) { /* 다음에 덮어씀 */ } delete sent[k]; }
    delete sent._months;
  }
  async function saveFile(filename, data) {
    if (!downloads) return false;
    try { await downloads.save({ filename, data }); return true; }
    catch (e) { if (e && e.code === 'declined') return true; return false; }
  }

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', () => flush());

  return { present, init, ready, load, save, flush, clear, saveFile, hasDownloads: () => !!downloads, set onError(fn) { onError = fn; } };
})();
