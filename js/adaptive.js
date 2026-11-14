/* 적응형 진단 — 문항 은행 65개(생활 습관 20 + 상황 45) 중 사람마다 35문항만 묻는다 (명세 11장, 2026-11-15)
 *
 *  1. 앵커 11문항: 능력치 11개를 하나씩 직접 보는 생활 습관 문항 (모든 사람 공통, 순서 고정)
 *  2. 적응형 24문항: 매 응답 뒤 아직 안 물어본 문항마다 점수를 매겨 가장 높은 것 하나를 다음 질문으로 (무작위 아님, 동점은 id 순)
 *       점수 = 0.15·덜 본 능력치 보강 + 0.10·선택지 변별력 + 0.10·맥락 다양성 + 0.65·지금까지 드러난 강한 성향 확인 − 0.30·비슷한 질문
 *     (명세 제안값은 0.35·0.30·0.20·0.15 — 사용자 요청 "초반 답변 성향에 따라 질문을 선별, 사람 성향마다 확연히 다른 결과"에 맞춰
 *      성향 확인을 크게. 대신 모든 능력치를 최소 3번은 보도록 안전장치)
 *     각 항은 후보들 안에서 0~1 로 맞춘 뒤 더한다. 같은 답이면 언제나 같은 질문 순서가 나온다.
 *  3. 35문항이 끝나면 '답한 35문항만으로 된 은행'으로 기존 채점(BM.scoring.compute)을 그대로 돌린다
 *     (관찰 기회 보정·200점 분배·희귀 상한 로직 그대로, 기회는 답한 문항 기준으로 다시 계산됨)
 */
window.BM = window.BM || {};
BM.adaptive = (function () {
  const TOTAL = 35;
  // 체력 B01 · 지능 B07 · 창조력 B09 · 경제력 B11 · 인격력 B17 · 지도력 B19 · 절제력 B05 · 회복력 B20 · 매력 B12 · 신성력 B18 · 자존감 B15
  const ANCHORS = ['B01', 'B07', 'B09', 'B11', 'B17', 'B19', 'B05', 'B20', 'B12', 'B18', 'B15'];
  // 가중치 (가상 응답자 5명 시뮬레이션으로 정함, docs/NOTES.md v1.7.0): 성향 확인을 크게 → 사람마다 받는 질문이 24개 중 약 13개 다름,
  //  그래도 모든 능력치 최소 3번 관찰(아래 안전장치), 65문항 전부 답했을 때와 점수 차 평균 약 2점
  const WT = { coverage: 0.15, info: 0.10, context: 0.10, fit: 0.65, dup: 0.30 };
  const MIN_OPP = 3;                   // 능력치마다 최소 관찰 기회
  const BOOST = [1, 0.7, 0.45, 0.2];   // 지금까지 드러난 성향 1~4위 능력치를 확인하는 정도

  const idMap = new WeakMap();
  function byId(bank) { let m = idMap.get(bank); if (!m) { m = {}; bank.questions.forEach(q => { m[q.id] = q; }); idMap.set(bank, m); } return m; }

  // 문항이 능력치를 관찰하는 비중 (합 1): 습관 = 그 능력치 하나, 상황 = 선택지 사이 배점 차이(최대−최소)에 비례
  const obsMemo = new WeakMap();
  function obs(bank, q) {
    let o = obsMemo.get(q); if (o) return o;
    o = {};
    if (q.stage === 'baseline') o[q.category] = 1;
    else {
      const ws = q.choices.map(c => BM.scoring.choiceWeights(c, bank.choiceBudget));
      let sum = 0;
      BM.STAT_IDS.forEach(s => { const v = ws.map(w => w[s]), d = Math.max(...v) - Math.min(...v); if (d > 1e-9) { o[s] = d; sum += d; } });
      for (const s in o) o[s] /= sum;
    }
    obsMemo.set(q, o); return o;
  }
  // 선택지 변별력 0~1: 습관 문항은 빈도 5단계라 0.6, 상황 문항은 선택지 배점 패턴이 서로 다른 정도(평균 L1 거리 / 2)
  function info(bank, q) {
    if (q.stage === 'baseline') return 0.6;
    const ws = q.choices.map(c => BM.scoring.choiceWeights(c, bank.choiceBudget)), B = bank.choiceBudget;
    let tot = 0, n = 0;
    for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) { let d = 0; BM.STAT_IDS.forEach(s => { d += Math.abs(ws[i][s] - ws[j][s]) / B; }); tot += d / 2; n++; }
    return n ? Math.min(1, tot / n) : 0;
  }
  const cos = (a, b) => { let d = 0, na = 0, nb = 0; BM.STAT_IDS.forEach(s => { const x = a[s] || 0, y = b[s] || 0; d += x * y; na += x * x; nb += y * y; }); return na && nb ? d / Math.sqrt(na * nb) : 0; };

  // 고른 문항만으로 된 은행 (채점용)
  function subBank(bank, ids) {
    const m = byId(bank);
    return { version: bank.version + '/adaptive' + TOTAL, choiceBudget: bank.choiceBudget, mix: bank.mix, questions: ids.map(id => m[id]).filter(Boolean) };
  }
  // 지금까지 답한 문항으로 본 능력치별 성향 (0~1)
  function estimate(bank, order, answers) {
    const done = order.filter(id => Number.isInteger(answers[id]));
    if (!done.length) return null;
    const r = BM.scoring.compute(subBank(bank, done), answers);
    return r ? r.strength : null;
  }

  // 다음 질문 id (35개를 다 골랐으면 null). 점수 내역도 함께 돌려줌 (selection snapshot)
  function next(bank, order, answers) {
    if (order.length >= TOTAL) return null;
    const anchor = ANCHORS.find(id => !order.includes(id));
    if (anchor) return { id: anchor, why: 'anchor' };
    const m = byId(bank), asked = order.map(id => m[id]).filter(Boolean);
    const opp = {}, share = {};
    BM.STAT_IDS.forEach(s => { opp[s] = 0; share[s] = 0; });
    asked.forEach(q => { const o = obs(bank, q); for (const s in o) { if (o[s] > 0.05) opp[s]++; share[s] += o[s]; } });
    const est = estimate(bank, order, answers) || Object.fromEntries(BM.STAT_IDS.map(s => [s, 0.5]));
    const rank = BM.STAT_IDS.slice().sort((a, b) => (est[b] - est[a]) || BM.STAT_IDS.indexOf(a) - BM.STAT_IDS.indexOf(b));
    const boost = {}; rank.forEach((s, i) => { boost[s] = BOOST[i] || 0; });
    let cands = bank.questions.filter(q => !order.includes(q.id));
    // 안전장치: 남은 칸이 '최소 관찰 기회가 모자란 능력치 수' 이하로 줄면, 그 능력치를 보는 문항만 후보로
    const lacking = BM.STAT_IDS.filter(s => opp[s] < MIN_OPP), need = lacking.reduce((a, s) => a + MIN_OPP - opp[s], 0);
    if (lacking.length && need >= TOTAL - order.length) {
      const only = cands.filter(q => { const o = obs(bank, q); return lacking.some(s => (o[s] || 0) > 0.05); });
      if (only.length) cands = only;
    }
    const raw = cands.map(q => {
      const o = obs(bank, q);
      let coverage = 0, fit = 0, crowd = 0;
      for (const s in o) { coverage += o[s] / (1 + opp[s]); fit += o[s] * boost[s]; crowd += o[s] * share[s] / asked.length; }
      const dup = asked.some(a => a.category === q.category && a.category !== 'mixed' && cos(obs(bank, a), o) > 0.9) || asked.some(a => cos(obs(bank, a), o) > 0.98) ? 1 : 0;
      return { q, coverage, info: info(bank, q), context: 1 - crowd, fit, dup };
    });
    const norm = k => { const mx = Math.max(...raw.map(r => r[k])), mn = Math.min(...raw.map(r => r[k])); raw.forEach(r => { r[k + 'N'] = mx - mn > 1e-9 ? (r[k] - mn) / (mx - mn) : 0; }); };
    ['coverage', 'info', 'context', 'fit'].forEach(norm);
    raw.forEach(r => { r.score = WT.coverage * r.coverageN + WT.info * r.infoN + WT.context * r.contextN + WT.fit * r.fitN - WT.dup * r.dup; });
    raw.sort((a, b) => (b.score - a.score) || (a.q.id < b.q.id ? -1 : 1));
    const best = raw[0];
    return { id: best.q.id, why: 'adaptive', score: +best.score.toFixed(3) };
  }

  // 순서 목록 채우기: 비었거나 마지막 문항까지 답했으면 다음 1개를 붙인다.
  //  앞 질문의 답을 바꿔도 이미 답한 문항은 그대로 두고, 아직 안 나온 뒤 문항만 바뀐 답을 기준으로 고른다 (명세 권장 정책)
  function extend(bank, order, answers) {
    if (order.length >= TOTAL) return order;
    if (order.length && !Number.isInteger(answers[order[order.length - 1]])) return order;
    const n = next(bank, order, answers);
    if (n) order.push(n.id);
    return order;
  }
  function isComplete(bank, order, answers) { return order.length === TOTAL && order.every(id => Number.isInteger(answers[id])); }
  function compute(bank, order, answers) {
    if (!isComplete(bank, order, answers)) return null;
    const r = BM.scoring.compute(subBank(bank, order), answers);
    if (r) { r.mode = 'adaptive' + TOTAL; r.asked = order.slice(); }
    return r;
  }
  // 처음부터 끝까지 한 번에 (테스트·시뮬레이션용): answerFor(q) → 선택지 번호
  function run(bank, answerFor) {
    const order = [], answers = {};
    while (order.length < TOTAL) { const n = next(bank, order, answers); order.push(n.id); answers[n.id] = answerFor(byId(bank)[n.id]); }
    return { order, answers, result: compute(bank, order, answers) };
  }
  return { TOTAL, ANCHORS, WT, BOOST, next, extend, isComplete, compute, subBank, run, obs };
})();
