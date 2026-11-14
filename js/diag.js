/* 지인 테스트용 성향 진단 전용 앱 — 모습·이름 → 생활 습관·상황 질문 → 200포인트 → 브로치 보석 초상화 → PNG 저장 → 다음 사람 */
(function () {
  const U = BM.util, UI = BM.ui;
  const app = document.getElementById('app');
  const KEY = 'bravemaker.diag.session';
  let S = null, players = [];

  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 세션 저장 실패해도 진행 가능 */ } }
  function load() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } }
  function clear() { try { sessionStorage.removeItem(KEY); } catch (e) { } }
  function stop() { players.forEach(p => p.stop()); players = []; }
  function brooch(canvas, spec) { players.push(UI.mountBrooch(canvas, spec, 'auto')); }

  function render() {
    stop();
    if (!S) return title();
    if (S.phase === 'quiz') return quiz();
    if (S.phase === 'result') return result();
    return title();
  }

  function title() {
    app.innerHTML =
      '<div class="screen">' +
      '<div class="title-logo"><div class="ko">용사 키우기</div><div class="en">성향 진단</div></div>' +
      '<p class="center muted" style="margin:12px 8px">' + BM.adaptive.TOTAL + '가지 질문으로 요즘의 내 습관과 선택을 살펴봐요 (답에 따라 다음 질문이 달라져요).<br>답변으로 용사 망토의 브로치 보석 색이 정해져요.</p>' +
      '<div class="panel"><span class="tl">모습</span>' + UI.lookPicker(null) + '</div>' +
      '<div class="panel"><span class="tl">이름</span><label class="lbl" for="nm">용사 이름 (최대 12자)</label><input id="nm" class="field" maxlength="12" autocomplete="off" placeholder="예: 송준철"></div>' +
      '<p class="center small gold" id="hint" aria-live="polite" style="margin:4px 0 0">모습을 골라 주세요</p>' +
      '<button class="btn gold block" id="go" disabled>진단 시작 ▶</button>' +
      '<p class="notice">답변은 이 화면을 닫으면 사라지고 어디에도 전송되지 않아요. 게임용 성향 진단이며 실제 능력·인격·도덕성을 평가하지 않습니다.</p>' +
      '</div>';
    app.querySelectorAll('canvas[data-brooch^="demo-"]').forEach(c => brooch(c, UI.DEMO[c.dataset.brooch.slice(5)]));
    let pick = null;
    const nm = document.getElementById('nm'), go = document.getElementById('go');
    const sync = () => {
      const v = nm.value.trim();
      go.disabled = !v || !pick;
      document.getElementById('hint').textContent = !pick ? '모습을 골라 주세요' : !v ? '이름을 적어 주세요' : '';
    };
    nm.oninput = sync;
    nm.onkeydown = e => { if (e.key === 'Enter' && !go.disabled) go.click(); };
    go.onclick = () => { S = { phase: 'quiz', name: nm.value.trim(), look: pick, seed: U.newSeed(), order: [], answers: {}, cursor: 0 }; save(); render(); };
    app.onclick = e => {
      const b = e.target.closest('[data-look]'); if (!b) return;
      pick = b.dataset.look;
      app.querySelectorAll('[data-look]').forEach(x => x.setAttribute('aria-pressed', x === b));
      sync();
    };
  }

  function quiz() {
    if (!Array.isArray(S.order)) S.order = [];   // 적응형 35문항 (BM.adaptive)
    UI.quiz(app, {
      bank: BM.QUESTION_BANK, seed: S.seed, answers: S.answers, cursor: S.cursor,
      order: S.order, total: BM.adaptive.TOTAL, extend: () => { BM.adaptive.extend(BM.QUESTION_BANK, S.order, S.answers); save(); },
      onAnswer: save, onCursor: i => { S.cursor = i; save(); },
      onDone: () => {
        S.result = BM.adaptive.compute(BM.QUESTION_BANK, S.order, S.answers);
        if (!S.result) return UI.toast('모든 질문에 답해 주세요.', true);
        S.phase = 'result'; save();
        app.onclick = null;
        app.innerHTML = '<div class="screen loading"><h2>답변을 교차 분석하는 중</h2><div class="dots"><span></span><span></span><span></span></div></div>';
        setTimeout(render, BM.gem.prefersReduced() ? 100 : 1200);
      }
    });
  }

  function result() {
    const r = S.result, spec = UI.broochSpec(S.look, S.seed, r.top3, r.axes, r.points);
    app.innerHTML =
      '<div class="screen">' +
      '<p class="center gold small" style="margin:6px 0 0">★ 진단 결과 ★</p>' +
      '<h1 class="center">용사 ' + U.esc(S.name) + '</h1>' +
      UI.heroCard('me') +
      UI.broochLegend(r.top3, S.seed, { stats: r.points }) +
      '<div class="panel"><span class="tl">성향 오오라</span>' + UI.auraLines(r.axes) + '</div>' +
      '<div class="panel"><span class="tl">초기 능력치</span><span class="tr count">200 / 200</span>' + UI.statRows(r.points) + '</div>' +
      '<p class="notice">일반 능력치는 최대 60, 희귀 능력치(★)는 최대 10에서 시작해요. 브로치에는 상위 5개 능력치 색이 들어가요. 정식 앱에서는 매일의 수련으로 브로치 보석의 색과 오오라가 계속 바뀝니다.</p>' +
      '<button class="btn gold block" data-a="png">결과 이미지 저장 (PNG)</button>' +
      '<button class="btn ghost block" data-a="redo">답변 다시 보기</button>' +
      '<button class="btn block" data-a="next">다음 사람 테스트 시작</button>' +
      '</div>';
    brooch(app.querySelector('canvas[data-brooch]'), spec);
    UI.hydrateGems(app);
    app.onclick = e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'png') UI.saveResultPNG(S.name, r, spec);
      if (a.dataset.a === 'redo') { S.phase = 'quiz'; S.cursor = 0; save(); render(); }
      if (a.dataset.a === 'next') { clear(); S = null; render(); window.scrollTo(0, 0); }
    };
  }

  UI.starfield();
  S = load();
  render();
})();
