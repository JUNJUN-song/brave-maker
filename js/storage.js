/* 저장 · 백업 · 복구 (기기 로컬, 서버 없음) */
window.BM = window.BM || {};
BM.storage = (function () {
  const KEY = 'bravemaker.save.v1';
  const SCHEMA = 1;
  let memory = null;      // localStorage 를 못 쓰는 환경(사생활 보호 모드 등) 대비
  let lastError = null;

  function blank(name, look) {
    const today = BM.util.today();
    return {
      schema_version: SCHEMA,
      app: 'BRAVE_MAKER',
      phase: 'quiz',
      profile: { name: name, look: look === 'boy' ? 'boy' : 'girl', seed: BM.util.newSeed(), createdAt: new Date().toISOString(), startDate: today },
      diagnosis: { bankVersion: BM.QUESTION_BANK.version, mode: 'adaptive40', order: [], answers: {}, cursor: 0, result: null, completedAt: null },   // order = 적응형으로 고른 질문 순서 (BM.adaptive)
      tasks: [],
      records: {},
      settings: { reducedMotion: 'auto' }
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return validate(JSON.parse(raw));
    } catch (e) { lastError = e; }
    return memory ? JSON.parse(JSON.stringify(memory)) : null;
  }
  function save(state) {
    state.savedAt = new Date().toISOString();
    memory = JSON.parse(JSON.stringify(state));
    const cloud = BM.cloud && BM.cloud.ready();
    if (cloud) BM.cloud.save(state);
    try { localStorage.setItem(KEY, JSON.stringify(state)); lastError = null; return true; }
    catch (e) { lastError = e; return cloud; }   // 계정 저장이 되면 기기 저장 실패는 괜찮다
  }
  function clear() {
    memory = null;
    if (BM.cloud && BM.cloud.ready()) BM.cloud.clear();
    try { localStorage.removeItem(KEY); } catch (e) { lastError = e; }
  }
  function validate(s) {
    if (!s || typeof s !== 'object') throw new Error('저장 데이터 형식이 아니에요.');
    if (s.app !== 'BRAVE_MAKER') throw new Error('BRAVE MAKER 백업 파일이 아니에요.');
    if (!s.profile || typeof s.profile.name !== 'string' || !Number.isFinite(s.profile.seed)) throw new Error('용사 정보가 없어요.');
    if (!s.diagnosis || typeof s.diagnosis.answers !== 'object') throw new Error('진단 정보가 없어요.');
    s.tasks = Array.isArray(s.tasks) ? s.tasks : [];
    s.records = s.records && typeof s.records === 'object' ? s.records : {};
    s.settings = s.settings || { reducedMotion: 'auto' };
    if (s.profile.look !== 'girl' && s.profile.look !== 'boy') s.profile.look = 'girl';   // 모습 선택 이전 저장은 여자 용사로
    // 2026-11-13 성장 방식: 예전 수련에는 방식이 없어서 기본 수련 표시로 채운다 (꾸준함형·바로 반영형·보통)
    // 식단은 체력이 아니라 건강(회복력)·절제력 — 기본값 그대로인 식단 수련과 그 기록만 바꾼다
    const oldDiet = st => Array.isArray(st) && st.join() === 'fit,discipline';
    s.tasks.forEach(t => {
      if (/^t_diet_/.test(t.id) && oldDiet(t.stats)) t.stats = ['recovery', 'discipline'];
      if (!t.growth && BM.growth) t.growth = BM.growth.growthOf(null, t);
    });
    Object.keys(s.records).forEach(d => Object.keys(s.records[d] || {}).forEach(id => {
      const r = s.records[d][id];
      if (r && /^t_diet_/.test(id) && oldDiet(r.stats)) r.stats = ['recovery', 'discipline'];
    }));
    if (s.diagnosis.result) {
      const sum = BM.STAT_IDS.reduce((a, id) => a + (s.diagnosis.result.points[id] || 0), 0);
      if (sum !== BM.CONFIG.totalPoints) throw new Error('초기 포인트 합계가 200이 아니에요.');
    }
    return s;
  }
  function exportText(state) { return JSON.stringify(state, null, 2); }
  async function download(filename, text, mime) {
    if (BM.cloud && BM.cloud.hasDownloads()) return BM.cloud.saveFile(filename, text);
    const blob = new Blob([text], { type: mime || 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function importText(text) { return validate(JSON.parse(text)); }

  return { KEY, SCHEMA, blank, load, save, clear, validate, exportText, importText, download, get lastError() { return lastError; } };
})();
