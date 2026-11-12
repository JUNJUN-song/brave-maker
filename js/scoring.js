/* 최초 진단 채점 — 생활 습관(baseline) + 상황 선택(scenario) → 초기 200포인트 + 성향축 2개 + 상위 3색
 *
 * 두 층을 따로 계산해 따로 저장하고, 초기 분배에만 섞는다 (기본 습관 70% / 상황 30%).
 *  - 습관 점수: 능력치별 baseline 문항의 (점수 ÷ 그 문항 최고점) 평균. '해당 없음'은 분모에서 제외.
 *  - 상황 성향: 선택지 배점을 문항당 같은 예산으로 맞춘 뒤, 관찰 기회를 보정한 상대 성향 (1.0 = 무작위 응답 기대치).
 *  - 무행동 선택지(배점 없음)는 어떤 능력치도 올리지 않고 response_tag 로만 기록한다.
 */
window.BM = window.BM || {};
BM.scoring = (function () {
  const C = BM.CONFIG;
  const AXES = ['sr', 'al'];
  const scenarioOf = bank => bank.questions.filter(q => q.stage !== 'baseline');
  const baselineOf = bank => bank.questions.filter(q => q.stage === 'baseline');

  // 한 선택지의 숨겨진 능력치 가중치를 '선택지당 동일 예산'으로 맞춘다 (배점 많은 선택지가 유리해지는 편향 제거).
  // 성향축의 음수 가중치는 0으로 본다 (행동을 감점하지 않음).
  function choiceWeights(choice, budget) {
    const w = choice.w || {};
    let sum = 0;
    for (const k in w) sum += Math.max(0, w[k]);
    const out = {};
    for (const id of BM.STAT_IDS) out[id] = sum > 0 ? Math.max(0, w[id] || 0) * budget / sum : 0;
    out.sr = Math.max(0, choice.sr || 0);
    out.al = Math.max(0, choice.al || 0);
    return out;
  }

  // 상황 문항: 문항별 최소/평균/최대 기회 (관찰 기회 보정용)
  function analyzeBank(bank) {
    const keys = BM.STAT_IDS.concat(AXES);
    const span = {}, expect = {}, observed = {};
    keys.forEach(k => { span[k] = 0; expect[k] = 0; observed[k] = 0; });
    const perQ = {};
    scenarioOf(bank).forEach(q => {
      const ws = q.choices.map(c => choiceWeights(c, bank.choiceBudget));
      const info = {};
      keys.forEach(k => {
        const vals = ws.map(w => w[k]);
        const mn = Math.min(...vals), mx = Math.max(...vals);
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        info[k] = { mn, mx, mean };
        span[k] += mx - mn;
        expect[k] += mean - mn;
        if (mx - mn > 1e-9) observed[k]++;
      });
      perQ[q.id] = { ws, info };
    });
    const habitQs = {};
    BM.STAT_IDS.forEach(id => { habitQs[id] = 0; });
    baselineOf(bank).forEach(q => { habitQs[q.category] = (habitQs[q.category] || 0) + 1; });
    return { perQ, span, expect, observed, habitQs };
  }

  let cache = null;
  function analysis(bank) {
    if (!cache || cache.bank !== bank) cache = { bank, a: analyzeBank(bank) };
    return cache.a;
  }

  function isComplete(bank, answers) {
    return !!answers && bank.questions.every(q => Number.isInteger(answers[q.id]) && answers[q.id] >= 0 && answers[q.id] < q.choices.length);
  }

  function tendency(a, got, k) {
    const span = a.span[k], exp = a.expect[k], n = a.observed[k];
    if (span <= 1e-9 || n === 0 || exp <= 1e-9) return 1;
    const m = exp / span;
    const unit = span / n;
    const K = C.scoring.shrinkK;
    const r = (got[k] + K * m * unit) / (span + K * unit);
    return r / m;
  }

  // 습관 층: 능력치별 0~1 (관측 문항이 모두 '해당 없음'이면 null)
  function habitScores(bank, answers) {
    const sum = {}, n = {};
    baselineOf(bank).forEach(q => {
      const c = q.choices[answers[q.id]];
      if (!c || c.na || c.score == null) return;
      const max = Math.max(...q.choices.filter(x => !x.na && x.score != null).map(x => x.score));
      if (max <= 0) return;
      sum[q.category] = (sum[q.category] || 0) + c.score / max;
      n[q.category] = (n[q.category] || 0) + 1;
    });
    const h = {};
    BM.STAT_IDS.forEach(id => { h[id] = n[id] ? sum[id] / n[id] : null; });
    return h;
  }

  function compute(bank, answers) {
    if (!isComplete(bank, answers)) return null;
    const a = analysis(bank);
    const keys = BM.STAT_IDS.concat(AXES);
    const got = {};
    keys.forEach(k => { got[k] = 0; });
    const tags = {};
    scenarioOf(bank).forEach(q => {
      const pq = a.perQ[q.id], idx = answers[q.id];
      const w = pq.ws[idx];
      keys.forEach(k => { got[k] += w[k] - pq.info[k].mn; });
      const tag = q.choices[idx].tag;
      if (tag) tags[tag] = (tags[tag] || 0) + 1;
    });

    const mix = bank.mix || { habit: 0.7, scenario: 0.3 };
    const habit = habitScores(bank, answers);
    const t = {}, scenario = {}, strength = {}, weight = {}, cap = {};
    BM.STATS.forEach(s => {
      t[s.id] = tendency(a, got, s.id);
      scenario[s.id] = BM.util.clamp(0.5 * t[s.id], 0, 1);              // 0.5 = 평균적인 선택 경향
      const h = habit[s.id];
      strength[s.id] = h == null ? scenario[s.id] : mix.habit * h + mix.scenario * scenario[s.id];
      weight[s.id] = Math.pow(0.03 + strength[s.id], C.scoring.gamma);   // 0.03: 모두 0일 때도 분배가 정의되도록
      cap[s.id] = s.rare ? C.rareCap : C.generalInitCap;
    });

    const fills = waterFill(weight, cap, C.totalPoints, C.scoring.minFill);
    const points = integerize(fills, cap, C.totalPoints);

    const axes = {};
    AXES.forEach(k => { axes[k] = BM.util.clamp(0.5 * tendency(a, got, k), 0, 1); });

    return {
      version: bank.version,
      points,
      habit,                // 습관 층 (0~1, null = 관측 없음)
      scenario,             // 상황 층 (0~1, 0.5 = 평균)
      strength,             // 섞은 값 (분배에 사용)
      tendency: strength,   // 동점 처리용 (성장 후 상위 3색 비교에도 사용)
      mix,
      axes,                 // sr = self_respect, al = altruism (0~1)
      tags,                 // inaction / deliberate_rest / no_weight 선택 수
      top3: top3Initial(points, strength),   // 이름은 호환용: 실제로는 보석 색 수(CONFIG.gem.colorCount)만큼
      observed: Object.assign({}, a.observed),
      habitQuestions: Object.assign({}, a.habitQs)
    };
  }

  // 채움률 f = clamp(α·weight, minFill, 1) 이 되도록 α 를 찾아 Σ cap·f = total 을 맞춘다 (상한 초과분은 자동 재분배).
  function waterFill(weight, cap, total, minFill) {
    const ids = Object.keys(weight);
    const sumAt = al => ids.reduce((s, id) => s + cap[id] * BM.util.clamp(al * weight[id], minFill, 1), 0);
    let lo = 0, hi = 1;
    while (sumAt(hi) < total && hi < 1e9) hi *= 2;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (sumAt(mid) < total) lo = mid; else hi = mid;
    }
    const f = {};
    ids.forEach(id => { f[id] = BM.util.clamp(hi * weight[id], minFill, 1); });
    return f;
  }

  // 정수 반올림 차이를 최대 잔여분 순으로 보정해 합계를 정확히 total 로 맞춘다.
  function integerize(fills, cap, total) {
    const ids = Object.keys(fills);
    const exact = {}, out = {};
    ids.forEach(id => { exact[id] = fills[id] * cap[id]; out[id] = Math.min(cap[id], Math.floor(exact[id] + 1e-9)); });
    let sum = ids.reduce((s, id) => s + out[id], 0);
    const order = ids.slice().sort((x, y) => (exact[y] - Math.floor(exact[y])) - (exact[x] - Math.floor(exact[x])) || BM.STAT_IDS.indexOf(x) - BM.STAT_IDS.indexOf(y));
    let guard = 0;
    while (sum < total && guard++ < 1000) {
      for (const id of order) { if (sum >= total) break; if (out[id] < cap[id]) { out[id]++; sum++; } }
    }
    while (sum > total && guard++ < 2000) {
      for (const id of order.slice().reverse()) { if (sum <= total) break; if (out[id] > 1) { out[id]--; sum--; } }
    }
    return out;
  }

  function top3Initial(points, t) {
    return BM.STAT_IDS.slice().sort((x, y) => {
      const nx = points[x] / (BM.STAT[x].rare ? C.rareCap : C.generalInitCap);
      const ny = points[y] / (BM.STAT[y].rare ? C.rareCap : C.generalInitCap);
      return (ny - nx) || ((t[y] || 0) - (t[x] || 0)) || BM.STAT_IDS.indexOf(x) - BM.STAT_IDS.indexOf(y);
    }).slice(0, C.gem.colorCount);
  }

  // 성장 이후 동적 정규화: 일반 능력치는 '현재 일반 평균이 초기 평균 채움률일 때의 60'을 기준으로 비교
  function normalized(stats) {
    const gen = BM.GENERAL_IDS.map(id => Math.max(0, stats[id] || 0));
    const mean = gen.reduce((a, b) => a + b, 0) / gen.length;
    const ref = Math.max(C.generalInitCap, mean / C.initialMeanFill);
    const n = {};
    BM.STATS.forEach(s => { n[s.id] = Math.max(0, stats[s.id] || 0) / (s.rare ? C.rareCap : ref); });
    return { norm: n, generalRef: ref };
  }
  function top3Current(stats, tie) {
    const { norm } = normalized(stats);
    return BM.STAT_IDS.slice().sort((x, y) => (norm[y] - norm[x]) || ((tie && tie[y]) || 0) - ((tie && tie[x]) || 0) || BM.STAT_IDS.indexOf(x) - BM.STAT_IDS.indexOf(y)).slice(0, C.gem.colorCount);
  }

  // 선택지 표시 순서
  //  - 습관 문항: 빈도 순서 그대로 (섞으면 답하기 어렵다)
  //  - 상황 문항: 사용자 시드로 섞되, '아무것도 하지 않는다'(배점 없음) 선택지는 항상 맨 끝
  function choiceOrder(q, seed) {
    const idx = q.choices.map((_, i) => i);
    if (q.stage === 'baseline') return idx;
    const pinned = idx.filter(i => isInaction(q.choices[i]));
    const free = idx.filter(i => !isInaction(q.choices[i]));
    return BM.util.shuffle(free, BM.util.rng(BM.util.hash(seed, q.id, 'order'))).concat(pinned);
  }
  function isInaction(c) { return c.tag === 'inaction' || c.tag === 'no_weight' || !c.w || !Object.keys(c.w).length; }

  return { compute, isComplete, analyzeBank, choiceWeights, habitScores, normalized, top3Current, choiceOrder, isInaction, waterFill, integerize };
})();
