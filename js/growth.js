/* 성장 엔진 — 초기 200포인트 + 날짜별 수련 기록을 처음부터 다시 계산(리플레이)한다.
 * 같은 기록이면 언제 다시 계산해도 같은 결과 → 새로고침/수정으로 점수가 중복 지급되지 않는다.
 */
window.BM = window.BM || {};
BM.growth = (function () {
  const C = BM.CONFIG, U = BM.util;
  const JUDGE = {
    done: { label: '완료', short: '완료' },
    try:  { label: '시도', short: '시도' },
    rest: { label: '휴식·미해당', short: '휴식' },
    miss: { label: '미수행', short: '미수행' }
  };

  // growth: 'habit' 꾸준함형(최근 4주 꾸준할수록 효과가 커짐) · 'instant' 바로 반영형(완료하면 바로 매력) · 없으면 보통
  // 식단은 체력이 아니라 건강(회복력)·절제력 (2026-11-13 사용자: "식단은 건강이랑 관계있지 체력이랑은 모르겠네")
  const DEFAULT_TASKS = [
    { key: 'exercise', name: '운동', criterion: '정한 운동 계획을 안전하게 수행', stats: ['fit'], days: [1, 3, 5], exercise: true, growth: 'habit', on: true },
    { key: 'diet', name: '식단', criterion: '극단적 제한 없이 계획한 식사', stats: ['recovery', 'discipline'], days: [0, 1, 2, 3, 4, 5, 6], growth: 'habit', on: false },
    { key: 'create', name: '창작', criterion: '음악·게임 등 작업 30분', stats: ['create'], days: [0, 1, 2, 3, 4, 5, 6], growth: 'habit', on: true },
    { key: 'study', name: '학습', criterion: '개발·언어·독서 20분', stats: ['mind'], days: [0, 1, 2, 3, 4, 5, 6], growth: 'habit', on: true },
    { key: 'shower', name: '샤워', criterion: '필요한 일상 위생', stats: ['charm'], days: [0, 1, 2, 3, 4, 5, 6], growth: 'instant', on: true },
    { key: 'skin', name: '피부관리', criterion: '나에게 맞는 간단 루틴', stats: ['charm'], days: [0, 1, 2, 3, 4, 5, 6], growth: 'instant', on: false },
    { key: 'money', name: '지출 관리', criterion: '지출 기록과 사전 계획 지키기', stats: ['money'], days: [0, 1, 2, 3, 4, 5, 6], on: true },
    { key: 'sleep', name: '수면과 회복', criterion: '정한 시간에 잠자리에 들기', stats: ['recovery'], days: [0, 1, 2, 3, 4, 5, 6], on: true },
    { key: 'rule', name: '개인 절제 목표', criterion: '스스로 정한 규칙 지키기 (예: 충동구매 안 하기)', stats: ['discipline', 'esteem'], days: [0, 1, 2, 3, 4, 5, 6], on: true },
    { key: 'people', name: '인간관계', criterion: '만남·대화가 있을 때 존중하고 경청', stats: ['care'], days: [], opportunity: true, on: false },
    { key: 'good', name: '선행', criterion: '기회가 있을 때 자발적으로 돕기', stats: ['divine', 'care'], days: [], opportunity: true, on: true },
    { key: 'team', name: '협업', criterion: '협업·조율 기회가 있을 때 수행', stats: ['lead'], days: [], opportunity: true, on: false }
  ];

  function makeTask(t, startDate) {
    return {
      id: 't_' + (t.key || 'c') + '_' + Math.random().toString(36).slice(2, 8),
      name: t.name, criterion: t.criterion || '', stats: t.stats.slice(), days: (t.days || []).slice(),
      opportunity: !!t.opportunity, exercise: !!t.exercise, growth: t.growth || (t.exercise ? 'habit' : 'normal'), archived: false, createdAt: startDate
    };
  }

  // 수련의 성장 방식. 기록에 남긴 방식(g) → 수련 설정 → 운동이면 꾸준함형 → 기본 수련 이름표(id) 순서로 정한다
  // (예전 기록·수련에는 방식이 없어서 id 앞부분 't_shower_' 같은 기본 수련 표시로 알아낸다)
  const KEY_GROWTH = { exercise: 'habit', diet: 'habit', create: 'habit', study: 'habit', shower: 'instant', skin: 'instant' };
  const GROWTH_NAME = { habit: '꾸준함형', instant: '바로 반영형', normal: '보통' };
  function growthOf(rec, task) {
    const g = (rec && rec.g) || (task && task.growth);
    if (g === 'habit' || g === 'instant' || g === 'normal') return g;
    if ((rec && rec.ex) || (task && task.exercise)) return 'habit';
    const m = /^t_([a-z]+)_/.exec((rec && rec.id) || (task && task.id) || '');
    return (m && KEY_GROWTH[m[1]]) || 'normal';
  }

  // 꾸준함 (0~1): 최근 4주(28일) 동안 예정된 날 중 실제로 한 비율. 완료 1, 시도 0.5, '휴식'으로 기록한 예정일은 빼고 센다.
  // 새로 시작한 수련도 4주 전체를 기준으로 보므로 효과가 서서히(약 4주에 걸쳐) 드러난다
  function consistencyFrom(events, task, d) {
    const W = C.growth.windowDays, days = task && task.days && task.days.length ? task.days : [0, 1, 2, 3, 4, 5, 6];
    const from = U.addDays(d, -(W - 1));
    let expected = (W / 7) * days.length, got = 0;
    (events || []).forEach(e => {
      if (e.d < from || e.d > d) return;
      if (e.j === 'done') got += 1;
      else if (e.j === 'try') got += 0.5;
      else if (e.j === 'rest' && days.includes(U.weekday(e.d))) expected -= 1;
    });
    return U.clamp(got / Math.max(1, expected), 0, 1);
  }
  // 꾸준함 → 배율: 일반 능력치 상승 배율(처음 ×0.8 → ×1.6), 매력·자존감 상승 회분(처음 0.3 → 1.3)
  function habitMult(c) { const h = C.growth.habit; return { gen: h.min + (h.max - h.min) * c, rare: h.rareMin + (h.rareMax - h.rareMin) * c }; }

  // 그 날 화면에 보여줄 수련: 예정된 수련 + 기회형 수련 + 이미 기록이 있는 수련
  function tasksForDate(state, date) {
    const wd = U.weekday(date), rec = (state.records && state.records[date]) || {};
    return state.tasks.filter(t => {
      if (rec[t.id]) return true;
      if (t.archived) return false;
      if (t.createdAt && date < t.createdAt) return false;
      return t.opportunity || t.days.includes(wd);
    });
  }

  // 판정별로 실제 반영되는 능력치 (화면 표시·오오라용): 운동 수련 '완료'는 CONFIG.exerciseStats 도 함께,
  // 꾸준함형·바로 반영형 수련 '완료'는 매력·자존감도 함께 오른다
  function statsFor(task, j) {
    const own = (task.stats || []).slice();
    const isEx = task.ex != null ? task.ex : task.exercise;
    if (j === 'done' && isEx) (BM.CONFIG.exerciseStats || []).forEach(s => { if (!own.includes(s)) own.push(s); });
    const g = growthOf(task, task);
    if (j === 'done' && g !== 'normal') ['charm', 'esteem'].forEach(s => { if (!own.includes(s)) own.push(s); });
    return own;
  }

  function streakMult(n) {
    let m = 1;
    C.disciplineStreak.forEach(([days, mult]) => { if (n >= days) m = mult; });
    return m;
  }
  function band(v) { return C.rare.bands.find(b => v < b.below); }
  function level(xp) {
    const n = Math.floor((1 + Math.sqrt(1 + 4 * xp / C.level.base)) / 2);
    const cur = C.level.base * n * (n - 1), next = C.level.base * (n + 1) * n;
    return { level: n, into: xp - cur, need: next - cur };
  }

  function replay(state, until) {
    const init = state.diagnosis && state.diagnosis.result;
    if (!init) return null;
    const start = state.profile.startDate;
    until = until || U.today();
    const stats = {};
    BM.STAT_IDS.forEach(id => { stats[id] = init.points[id]; });
    const streaks = {};
    const taskById = {}; (state.tasks || []).forEach(t => { taskById[t.id] = t; });
    const events = {};    // 수련별 최근 4주 기록 { id: [{ d, j }] } — 꾸준함 계산용
    let xp = 0;
    const rareT = { esteemLow: 0, charmMissDays: 0, divineMissDates: [], lastGain: { charm: start, divine: start, esteem: start } };
    const auraInit = { sr: init.axes.sr, al: init.axes.al };
    const long = { sr: auraInit.sr, al: auraInit.al };
    const recent = [];
    const history = [];
    const auraHistory = [];
    const sig = C.aura.signal;

    for (let d = start, guard = 0; d <= until && guard < 40000; d = U.addDays(d, 1), guard++) {
      const dayRec = (state.records && state.records[d]) || {};
      const ids = Object.keys(dayRec).sort();
      if (!ids.length) {
        rareIdle(stats, rareT, d);
        continue;
      }
      const before = Object.assign({}, stats);
      const recs = ids.map(id => Object.assign({ id }, dayRec[id]));
      const exerciseDone = recs.some(r => r.j === 'done' && r.ex);
      const gain = {}, missed = {}, rDone = {}, rMiss = {};
      let planned = 0, nDone = 0, nTry = 0, dayXp = 0, bonusUsed = false, careDone = false, careMiss = false;
      const srS = [], alS = [];

      // 꾸준함 계산용: 오늘 기록을 먼저 넣고(오늘 한 것도 꾸준함에 들어감), 4주 지난 기록은 버린다
      const cutoff = U.addDays(d, -(C.growth.windowDays - 1));
      recs.forEach(r => { const ev = events[r.id] || (events[r.id] = []); ev.push({ d, j: r.j }); while (ev.length && ev[0].d < cutoff) ev.shift(); });

      recs.forEach(r => {
        const st = streaks[r.id] || (streaks[r.id] = { cur: 0, best: 0, name: r.name || '' });
        if (r.j === 'done') { st.cur++; st.best = Math.max(st.best, st.cur); }
        else if (r.j === 'miss') st.cur = 0;
        const disc = (r.stats || []).includes('discipline');
        const mult = disc && r.j === 'done' ? streakMult(st.cur) : 1;
        const exB = exerciseDone && !r.ex && (r.j === 'done' || r.j === 'try') ? 1 + C.exerciseBonus : 1;
        if (exB > 1) bonusUsed = true;
        dayXp += (C.xp[r.j] || 0) * mult * exB;
        if (r.j !== 'rest') { planned++; if (r.j === 'done') nDone++; if (r.j === 'try') nTry++; }

        // 성장 방식별 무게 — 꾸준함형: 최근 4주 꾸준함에 비례 / 바로 반영형: 매력(+자존감)에 바로 / 보통: 예전 그대로
        const g = growthOf(r, taskById[r.id]);
        const hm = g === 'habit' ? habitMult(consistencyFrom(events[r.id], taskById[r.id], d)) : null;
        const own = (r.stats || []).filter(s => BM.STAT[s]);
        const gen = own.filter(s => !BM.STAT[s].rare), rareW = {};
        if (r.j === 'done' && r.ex) (C.exerciseStats || []).forEach(s => { if (BM.STAT[s] && !BM.STAT[s].rare && !gen.includes(s)) gen.push(s); });
        own.filter(s => BM.STAT[s].rare).forEach(s => { rareW[s] = 1; });
        if (g === 'instant') { rareW.charm = Math.max(rareW.charm || 0, C.growth.instant.charm); rareW.esteem = Math.max(rareW.esteem || 0, C.growth.instant.esteem); }
        if (g === 'habit') { rareW.charm = rareW.esteem = 0; Object.keys(rareW).forEach(s => { rareW[s] = hm.rare; }); }
        const gm = hm ? hm.gen : 1;

        // 일반 능력치: 완료 +1, 시도 +0.25 (꾸준함형은 ×배율). 미수행 감점은 수련에 직접 연결한 능력치만
        gen.forEach(s => {
          if (r.j === 'done') gain[s] = (gain[s] || 0) + C.general.done * gm;
          else if (r.j === 'try') gain[s] = (gain[s] || 0) + C.general.try * gm;
        });
        if (r.j === 'miss') {
          const pen = g === 'habit' ? C.growth.habit.missPenalty : -C.general.miss;   // 꾸준함형 -0.5, 보통 -1
          own.filter(s => !BM.STAT[s].rare).forEach(s => { missed[s] = Math.max(missed[s] || 0, pen); });
        }
        // 희귀 능력치: 완료 1회분 × 무게 (절제력 수련은 연속 보너스로 더 크게), 시도는 절반
        const amp = 1 + C.rareStreakAmplify * (mult - 1);
        Object.keys(rareW).forEach(s => {
          if (r.j === 'done') rDone[s] = (rDone[s] || 0) + rareW[s] * amp;
          else if (r.j === 'try') rDone[s] = (rDone[s] || 0) + rareW[s] * C.rare.tryFactor;
        });
        if (r.j === 'miss') own.filter(s => BM.STAT[s].rare).forEach(s => { rMiss[s] = (rMiss[s] || 0) + 1; });
        // 매력 관리(샤워·피부관리처럼 꾸준함형이 아닌 매력 수련)를 했는지·놓쳤는지 → 2일 연속 놓치면 매력 하락
        if (g !== 'habit' && rareW.charm) { if (r.j === 'done' || r.j === 'try') careDone = true; else if (r.j === 'miss') careMiss = true; }

        if (r.j !== 'rest') {
          const v = sig[r.j], sts = statsFor(r, 'done');
          if (sts.some(s => BM.SR_STATS.includes(s))) srS.push(v);
          if (sts.some(s => BM.AL_STATS.includes(s))) alS.push(v);
        }
      });

      // 일반 능력치: 같은 능력의 미수행 페널티는 하루 최대 -1 (꾸준함형만 놓쳤으면 -0.5)
      BM.GENERAL_IDS.forEach(s => {
        const delta = (gain[s] || 0) - (missed[s] ? Math.min(C.general.maxMissPenaltyPerStatPerDay, missed[s]) : 0);
        if (delta) stats[s] = Math.max(0, stats[s] + delta);
      });

      // 희귀 능력치
      const ratio = planned ? (nDone + 0.5 * nTry) / planned : null;
      const R = C.rare, maxE = R.maxEventsPerDay, GM = C.growth.rareMaxEvents;
      const rare = { charm: [0, 0], divine: [0, 0], esteem: [0, 0] }; // [상승 횟수, 하락 여부]
      rare.charm[0] = Math.min(GM.charm || maxE, rDone.charm || 0) + (ratio !== null && ratio >= 0.8 && planned >= 3 ? R.charmOverallBonus : 0);
      if (careMiss && !careDone) rareT.charmMissDays++; else if (careDone) rareT.charmMissDays = 0;
      if (rareT.charmMissDays >= R.charmMissStreakDays && careMiss) rare.charm[1] = 1;

      rare.divine[0] = Math.min(maxE, rDone.divine || 0);
      if (rMiss.divine) rareT.divineMissDates.push(d);
      rareT.divineMissDates = rareT.divineMissDates.filter(x => U.daysBetween(x, d) < R.divineMissWindow);
      if (rMiss.divine && rareT.divineMissDates.length >= R.divineMissRepeat) rare.divine[1] = 1;

      rare.esteem[0] = Math.min(GM.esteem || maxE, rDone.esteem || 0) + (ratio !== null && ratio >= R.esteemGoodDayRatio ? 1 : 0);
      if (ratio !== null) rareT.esteemLow = ratio < R.esteemLowRatio ? rareT.esteemLow + 1 : 0;
      if (rareT.esteemLow >= R.esteemLowStreakDays) rare.esteem[1] = 1;

      BM.RARE_IDS.forEach(s => {
        const [ev, lose] = rare[s];
        const b = band(stats[s]);
        let v = stats[s] + ev * b.gain - (lose ? b.loss : 0);
        if (ev > 0) rareT.lastGain[s] = d;
        stats[s] = U.clamp(v, 0, C.rareCap);
      });
      rareIdle(stats, rareT, d, true);

      // 오오라: 장기 이동평균 + 최근 14일
      if (srS.length) { const a = avg(srS); long.sr += C.aura.longRate * (a - long.sr); recent.push({ d, k: 'sr', v: a }); }
      if (alS.length) { const a = avg(alS); long.al += C.aura.longRate * (a - long.al); recent.push({ d, k: 'al', v: a }); }

      xp += dayXp;
      const delta = {};
      BM.STAT_IDS.forEach(s => { const x = stats[s] - before[s]; if (Math.abs(x) > 1e-9) delta[s] = x; });
      const aura = auraAt(long, recent, d);
      auraHistory.push({ d, sr: aura.sr, al: aura.al });
      history.push({ date: d, xp: dayXp, delta, planned, done: nDone, tried: nTry, exerciseBonus: bonusUsed, aura });
    }
    const aura = auraAt(long, recent, until);
    // 꾸준함형 수련의 오늘 기준 꾸준함 (화면 표시: "꾸준함 64% · 효과 ×1.31")
    const habit = {};
    (state.tasks || []).forEach(t => { if (growthOf(null, t) === 'habit') { const c = consistencyFrom(events[t.id], t, until); habit[t.id] = Object.assign({ c }, habitMult(c)); } });
    return { stats, xp, lv: level(xp), streaks, aura, auraInitial: auraInit, history, auraHistory, habit, top3: BM.scoring.top3Current(stats, init.tendency) };
  }

  // 오래 관리하지 않은 9 이상 희귀 능력치는 천천히 하락
  function rareIdle(stats, rareT, d, alreadyApplied) {
    if (alreadyApplied === undefined) alreadyApplied = false;
    const R = C.rare;
    BM.RARE_IDS.forEach(s => {
      if (stats[s] >= R.idleDecayThreshold && U.daysBetween(rareT.lastGain[s], d) >= R.idleDecayDays) {
        stats[s] = U.clamp(stats[s] - R.idleDecayPerDay, 0, C.rareCap);
      }
    });
  }
  function auraAt(long, recent, d) {
    const win = recent.filter(x => U.daysBetween(x.d, d) < C.aura.recentDays);
    const out = {};
    ['sr', 'al'].forEach(k => {
      const w = win.filter(x => x.k === k);
      out[k] = U.clamp(w.length ? C.aura.longWeight * long[k] + (1 - C.aura.longWeight) * avg(w.map(x => x.v)) : long[k], 0, 1);
    });
    return out;
  }
  function avg(a) { return a.reduce((s, v) => s + v, 0) / a.length; }

  // 기록 쓰기: 같은 날 같은 수련은 한 칸 → 다시 눌러도 덮어쓸 뿐 중복 지급 없음
  function setRecord(state, date, task, j) {
    state.records = state.records || {};
    const day = state.records[date] || (state.records[date] = {});
    if (!j || (day[task.id] && day[task.id].j === j)) {
      delete day[task.id];
      if (!Object.keys(day).length) delete state.records[date];
      return null;
    }
    day[task.id] = { j, stats: task.stats.slice(), ex: !!task.exercise, opp: !!task.opportunity, g: growthOf(null, task), name: task.name };
    return day[task.id];
  }

  // 예정됐지만 기록하지 않은 지난 날 (자동 미수행 처리하지 않고 알려만 준다)
  function unrecorded(state, from, to) {
    const out = [];
    for (let d = from; d <= to; d = U.addDays(d, 1)) {
      const rec = (state.records && state.records[d]) || {};
      const missing = tasksForDate(state, d).filter(t => !t.opportunity && !rec[t.id]);
      if (missing.length) out.push({ date: d, count: missing.length });
    }
    return out;
  }

  // 그날 수련 체크가 다 끝났는가 (초상화 위 말풍선, 2026-11-13 사용자 요청)
  //  - 요일 수련은 모두 체크(완료·시도·휴식·미수행 아무거나, 미완료여도 됨), 기회형은 기록한 것만 본다
  //  - 'done' = 전부 '완료' → "오늘 완벽했어!", 'checked' = 전부 체크 → "오늘도 수고했어!", null = 아직 남음 또는 그날 수련 없음
  function dayCheck(state, date) {
    const rec = (state.records && state.records[date]) || {};
    const due = tasksForDate(state, date).filter(t => !t.opportunity || rec[t.id]);
    if (!due.length || !due.every(t => rec[t.id])) return null;
    return due.every(t => rec[t.id].j === 'done') ? 'done' : 'checked';
  }

  return { JUDGE, DEFAULT_TASKS, GROWTH_NAME, makeTask, growthOf, consistencyFrom, habitMult, tasksForDate, replay, setRecord, streakMult, level, band, unrecorded, statsFor, dayCheck };
})();
