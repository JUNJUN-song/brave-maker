/* BRAVE MAKER 본 앱 */
(function () {
  const U = BM.util, UI = BM.ui, G = BM.growth, ST = BM.storage;
  const app = document.getElementById('app');
  let S = null;                // 현재 저장 상태
  let players = [];
  let view = { tab: 'main', date: null };
  let lastSnapshot = null;     // 레벨업·보석 색 변화 알림용

  function stopPlayers() { players.forEach(p => p.stop()); players = []; }
  function persist() {
    if (!ST.save(S)) UI.toast('기기에 저장하지 못했어요. 백업 파일로 내보내 두세요. (' + (ST.lastError && ST.lastError.name || '저장 오류') + ')', true);
  }
  function reduced() { return (S && S.settings && S.settings.reducedMotion) || 'auto'; }
  function applyMotionClass() { document.documentElement.classList.toggle('reduce-motion', reduced() === 'on'); }
  function brooch(canvas, spec, view) { players.push(UI.mountBrooch(canvas, spec, reduced(), view)); }
  function gem(canvas, spec) { players.push(UI.mountGem(canvas, spec, reduced())); }   // 보석 탭의 컷팅 보석 (초창기 디자인, 상위 4색 비율)
  function look() { return (S && S.profile && S.profile.look) || 'girl'; }

  // ---------- 상단 모험 장면 (명세 3·7·9장) ----------
  // 용사 상태는 수면 수련 판정이 정한다: 완료=잠듦, 시도=잠들 준비, 휴식=쉬기, 미수행=계속 걷기.
  // 밤이라고 자동으로 자지 않고, 새벽 4시에 날짜가 바뀌어도 그대로. "일어났어요"나 다른 수련 기록으로 다시 걷는다
  const SLEEP_STATE = { done: 'SLEEP', try: 'SLEEP_PREP', rest: 'REST', miss: 'WALK' };
  const isSleepTask = t => !!t && (t.sleep === true || /^t_sleep_/.test(t.id));
  let currentScene = null;
  function sceneState() { const s = S && S.scene && S.scene.state; return BM.scene && BM.scene.STATE_NAME[s] ? s : 'WALK'; }
  function setSceneState(st) { S.scene = { state: st, at: new Date().toISOString() }; }
  function onJudged(t, rec) {
    if (isSleepTask(t)) setSceneState(rec ? SLEEP_STATE[rec.j] : 'WALK');
    else if (sceneState() !== 'WALK') setSceneState('WALK');      // 새 수련을 기록하면 활동 상태로
  }
  function sceneReduced() { return reduced() === 'on' || (reduced() === 'auto' && BM.gem.prefersReduced()); }
  function sceneCaption(st) {
    const w = BM.weather.settings(S), v = BM.weather.info();
    return BM.scene.TIME_NAME[BM.scene.timeOf()] + (w.mode !== 'off' && v ? ' · ' + (v.place || '') + ' ' + BM.scene.WEATHER_NAME[v.kind] : '') + ' · ' + BM.scene.STATE_NAME[st];
  }
  function mountScene(canvas) {
    currentScene = BM.scene.Scene(canvas, { look: look(), state: sceneState(), weather: BM.weather.kind(S), reduced: sceneReduced() });
    players.push(currentScene);
  }
  // 앱을 열거나 다시 돌아왔을 때만 날씨 확인 (30분 저장). 실패해도 마지막 날씨/시간대 배경으로 계속
  function refreshWeather(force) {
    if (!S || S.phase !== 'home') return Promise.resolve();
    return BM.weather.refresh(S, force).then(v => {
      if (!v) return;
      if (currentScene) currentScene.set({ weather: v.kind });
      const cap = app.querySelector('[data-scene-cap]'); if (cap) cap.textContent = sceneCaption(sceneState());
    }).catch(err => {
      if (err && err.code === 1 && BM.weather.settings(S).mode === 'gps') {     // 위치 권한 거부 → 지역 고르기로
        S.settings.weather = { mode: 'region', region: BM.weather.settings(S).region };
        persist(); UI.toast('위치 권한이 없어서 지역 날씨로 바꿨어요. 설정에서 지역을 골라 주세요.');
        if (view.tab === 'settings') render();
        return refreshWeather(true);
      }
    });
  }
  function mountDemos() { app.querySelectorAll('canvas[data-brooch^="demo-"]').forEach(c => brooch(c, UI.DEMO[c.dataset.brooch.slice(5)])); }

  // ---------- 화면 라우팅 ----------
  function render() {
    stopPlayers();
    applyMotionClass();
    if (!S) return renderTitle();
    switch (S.phase) {
      case 'name': return renderName();
      case 'quiz': return renderQuiz();
      case 'result': return renderResult();
      case 'setup': return renderSetup();
      default: return renderHome();
    }
  }

  // ---------- A. 시작 ----------
  function renderTitle() {
    const saved = ST.load();
    app.innerHTML =
      '<div class="screen">' +
      '<div class="hero-pair">' + UI.heroCard('demo-girl') + UI.heroCard('demo-boy') + '</div>' +
      '<div class="title-logo"><div class="ko">용사 키우기</div><div class="en">BRAVE MAKER</div></div>' +
      '<p class="center muted" style="margin:14px 8px 18px">현실의 나를, 내가 원하는 용사로.<br>나의 선택과 행동이 가슴의 보석이 됩니다.</p>' +
      '<button class="btn gold block" data-a="new">★ 용사 탄생 시작</button>' +
      (saved ? '<button class="btn block" data-a="continue">이어하기 · 용사 ' + U.esc(saved.profile.name || '') + '</button>' : '') +
      '<button class="btn ghost block" data-a="import">백업 파일 불러오기</button>' +
      '<input type="file" id="imp" accept="application/json,.json" class="sr-only" aria-label="백업 파일 선택">' +
      (!standalone && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        ? '<div class="notice"><b class="gold">휴대폰 앱으로 쓰기</b><br>' +
          (/Android/i.test(navigator.userAgent) ? 'Chrome 메뉴(⋮) → <b>홈 화면에 추가</b> 또는 <b>앱 설치</b>' : 'Safari 아래 공유 버튼(□↑) → <b>홈 화면에 추가</b>') +
          '<br>추가한 아이콘으로 앱을 열고 그 안에서 시작하세요. 브라우저에서 한 기록은 홈 화면 앱으로 넘어가지 않아요 (넘기려면 설정 → 백업).</div>'
        : '') +
      '<p class="notice center">모든 기록은 이 기기에만 저장됩니다. 서버로 보내지 않아요.</p>' +
      '</div>';
    mountDemos();
    app.onclick = async e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'new') {
        if (saved && !(await UI.confirmBox('새 용사로 시작할까요?', '지금 기기에 저장된 <b>용사 ' + U.esc(saved.profile.name) + '</b>의 기록이 지워져요. 필요하면 먼저 설정에서 백업하세요.', '새로 시작', true))) return;
        ST.clear(); S = { phase: 'name' }; render();
      }
      if (a.dataset.a === 'continue') { S = saved; render(); }
      if (a.dataset.a === 'import') document.getElementById('imp').click();
    };
    document.getElementById('imp').onchange = importFile;
  }

  // ---------- 이름 ----------
  function renderName() {
    app.innerHTML =
      '<div class="screen">' +
      '<div class="title-logo" style="margin-top:20px"><div class="en">NEW HERO</div></div>' +
      '<div class="panel" style="margin-top:28px"><span class="tl">모습</span>' +
      '<h2>어떤 용사가 될까요?</h2>' +
      UI.lookPicker(null) +
      '<p class="small muted" style="margin:6px 0 0">망토의 브로치 보석이 나의 능력치 색으로 빛나요. 모습은 나중에 설정에서 바꿀 수 있어요.</p></div>' +
      '<div class="panel" style="margin-top:20px"><span class="tl">이름</span>' +
      '<h2>용사의 이름을 정해 주세요</h2>' +
      '<p class="small muted">실명이 아니어도 괜찮아요. 내가 되고 싶은 용사의 이름이면 됩니다.</p>' +
      '<label class="lbl" for="nm">용사 이름 (최대 12자)</label>' +
      '<input id="nm" class="field" maxlength="12" autocomplete="off" placeholder="예: 송준철">' +
      '<p class="center" style="margin:14px 0 0">용사 <b class="gold" id="pv">___</b></p>' +
      '</div>' +
      '<p class="center small gold" id="hint" aria-live="polite" style="margin:4px 0 0">모습을 골라 주세요</p>' +
      '<button class="btn gold block" id="go" disabled>진단 시작 (' + BM.adaptive.TOTAL + '문항 · 약 5분) ▶</button>' +
      '<button class="btn ghost block" id="back">◀ 처음으로</button>' +
      '</div>';
    let pick = null;
    const nm = document.getElementById('nm'), go = document.getElementById('go');
    const sync = () => {
      const v = nm.value.trim();
      document.getElementById('pv').textContent = v || '___';
      go.disabled = !v || !pick;
      document.getElementById('hint').textContent = !pick ? '모습을 골라 주세요' : !v ? '이름을 적어 주세요' : '';
    };
    nm.oninput = sync;
    nm.onkeydown = e => { if (e.key === 'Enter' && !go.disabled) go.click(); };
    go.onclick = () => { S = ST.blank(nm.value.trim(), pick); S.phase = 'quiz'; persist(); render(); };
    document.getElementById('back').onclick = () => { S = null; render(); };
    app.onclick = e => {
      const b = e.target.closest('[data-look]'); if (!b) return;
      pick = b.dataset.look;
      app.querySelectorAll('[data-look]').forEach(x => x.setAttribute('aria-pressed', x === b));
      sync();
    };
    mountDemos();
  }

  // ---------- B. 진단 ----------
  function renderQuiz() {
    app.onclick = null;
    // 적응형 35문항 (BM.adaptive): 질문 순서 목록을 저장해 두어 앱을 닫았다 열어도 같은 질문으로 이어짐
    if (!Array.isArray(S.diagnosis.order)) S.diagnosis.order = [];
    S.diagnosis.mode = 'adaptive' + BM.adaptive.TOTAL;
    UI.quiz(app, {
      bank: BM.QUESTION_BANK, seed: S.profile.seed, answers: S.diagnosis.answers, cursor: S.diagnosis.cursor,
      order: S.diagnosis.order, total: BM.adaptive.TOTAL,
      extend: () => { BM.adaptive.extend(BM.QUESTION_BANK, S.diagnosis.order, S.diagnosis.answers); persist(); },
      onAnswer: () => persist(), onCursor: i => { S.diagnosis.cursor = i; persist(); },
      onDone: () => analyze()
    });
  }
  function analyze() {
    app.onclick = null;
    app.innerHTML = '<div class="screen loading">' + UI.heroCard('wait', 'sm') + '<h2>답변을 교차 분석하는 중</h2><div class="dots"><span></span><span></span><span></span></div><p class="small muted" style="margin-top:16px">200 포인트를 나누고 브로치 보석을 깎고 있어요…</p></div>';
    brooch(app.querySelector('canvas[data-brooch]'), UI.broochSpec(look(), S.profile.seed, ['discipline', 'divine', 'esteem', 'mind'], { sr: 0.3, al: 0.3 }));
    const result = Array.isArray(S.diagnosis.order) ? BM.adaptive.compute(BM.QUESTION_BANK, S.diagnosis.order, S.diagnosis.answers) : BM.scoring.compute(BM.QUESTION_BANK, S.diagnosis.answers);
    if (!result) { UI.toast('모든 질문에 답해야 해요.', true); S.phase = 'quiz'; return render(); }
    S.diagnosis.result = result;
    S.diagnosis.completedAt = new Date().toISOString();
    S.profile.startDate = U.today();
    S.phase = 'result';
    persist();
    setTimeout(render, reduced() === 'on' || BM.gem.prefersReduced() ? 200 : 1500);
  }

  // ---------- C. 탄생 결과 ----------
  function renderResult() {
    const r = S.diagnosis.result;
    app.innerHTML =
      '<div class="screen">' +
      '<p class="center gold small" style="margin:6px 0 0">★ 용사 탄생 ★</p>' +
      '<h1 class="center">용사 ' + U.esc(S.profile.name) + '</h1>' +
      UI.heroCard('init') +
      UI.broochLegend(r.top3, S.profile.seed, { stats: r.points }) +
      '<div class="panel"><span class="tl">성향 오오라</span>' + UI.auraLines(r.axes) + '</div>' +
      '<div class="panel"><span class="tl">초기 능력치</span><span class="tr count">200 / 200</span>' + UI.statRows(r.points) + '</div>' +
      '<div class="panel dark"><span class="tl">두드러진 성향</span>' +
      '<p>' + r.top3.map(id => '<b style="color:' + (id === 'esteem' ? '#b9b6d6' : BM.STAT[id].color) + '">' + BM.STAT[id].name + '</b>(' + BM.STAT[id].desc + ')').join(', ') + ' 쪽의 행동이 답변에서 자주 보였어요.</p>' +
      '<p class="small muted">이 점수는 시작점이에요. 앞으로의 실제 행동에 따라 브로치 보석의 색과 오오라가 계속 바뀝니다. 브로치에는 상위 4개 능력치 색이 들어가요.</p></div>' +
      '<p class="notice">게임용 성향 진단이며 실제 능력·인격·도덕성을 평가하지 않습니다. 일반 능력치는 처음에 최대 60, 희귀 능력치(★)는 최대 10이에요.</p>' +
      '<button class="btn ghost block" data-a="png">결과 이미지 저장</button>' +
      '<button class="btn gold block" data-a="next">일일 수련 정하기 ▶</button>' +
      '</div>';
    const spec = UI.broochSpec(look(), S.profile.seed, r.top3, r.axes, r.points);
    brooch(app.querySelector('canvas[data-brooch]'), spec);
    UI.hydrateGems(app);
    app.onclick = e => {
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'png') UI.saveResultPNG(S.profile.name, r, spec);
      if (a.dataset.a === 'next') { S.phase = 'setup'; persist(); render(); }
    };
  }

  // ---------- 수련 설정 ----------
  function renderSetup() {
    const top = S.diagnosis.result.top3;
    if (!S._picks) S._picks = G.DEFAULT_TASKS.map(t => !!t.on);
    app.innerHTML =
      '<div class="screen">' +
      '<h2 style="margin:8px 4px">나의 일일 수련</h2>' +
      '<p class="small muted" style="margin:0 4px 8px">하고 싶은 수련을 고르세요. 이름·기준·요일은 나중에 설정에서 바꿀 수 있어요. <span class="opp">기회형</span>은 기회가 있던 날만 기록하고, 기회가 없으면 감점하지 않아요.</p>' +
      G.DEFAULT_TASKS.map((t, i) =>
        '<button class="btn choice" data-pick="' + i + '" aria-pressed="' + S._picks[i] + '"><span class="key">' + (S._picks[i] ? '■' : '□') + '</span><span class="grow"><b>' + t.name + '</b>' +
        (t.stats.some(s => top.includes(s)) ? ' <span class="streak">추천</span>' : '') + (t.opportunity ? ' <span class="opp">기회형</span>' : '') +
        '<br><span class="small muted">' + t.criterion + ' · ' + G.statsFor(t, 'done').map(s => BM.STAT[s].name).join('·') + ' · ' + daysLabel(t) + (G.growthOf(null, t) !== 'normal' ? ' · <span class="gtag">' + G.GROWTH_NAME[G.growthOf(null, t)] + '</span>' : '') + '</span></span></button>').join('') +
      '<button class="btn ghost block" data-a="custom">+ 직접 수련 만들기</button>' +
      (S._custom && S._custom.length ? '<p class="small gold" style="margin:4px">직접 만든 수련 ' + S._custom.length + '개: ' + S._custom.map(t => U.esc(t.name)).join(', ') + '</p>' : '') +
      '<button class="btn gold block" data-a="start">수련 시작! ▶</button>' +
      '</div>';
    app.onclick = e => {
      const p = e.target.closest('[data-pick]');
      if (p) { const i = +p.dataset.pick; S._picks[i] = !S._picks[i]; renderSetup(); return; }
      const a = e.target.closest('[data-a]'); if (!a) return;
      if (a.dataset.a === 'custom') editTask(null, t => { (S._custom = S._custom || []).push(t); renderSetup(); });
      if (a.dataset.a === 'start') {
        const tasks = G.DEFAULT_TASKS.filter((t, i) => S._picks[i]).map(t => G.makeTask(t, S.profile.startDate)).concat(S._custom || []);
        if (!tasks.length) { UI.toast('수련을 하나 이상 골라 주세요.', true); return; }
        S.tasks = tasks; delete S._picks; delete S._custom;
        S.phase = 'home'; persist(); render();
      }
    };
  }
  function daysLabel(t) {
    if (t.opportunity) return '기회 있을 때';
    if (t.days.length === 7) return '매일';
    return t.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(d => U.WD[d]).join('·');
  }

  // ---------- 수련 편집 모달 ----------
  function editTask(task, onSave) {
    const t = task ? JSON.parse(JSON.stringify(task)) : { name: '', criterion: '', stats: [], days: [0, 1, 2, 3, 4, 5, 6], opportunity: false, exercise: false, growth: 'normal' };
    t.growth = G.growthOf(null, t);
    const GROWTH_HELP = {
      habit: '꾸준함형: 최근 4주 동안 꾸준할수록 효과가 커져요. 처음엔 ×0.8, 4주 꾸준히 하면 ×1.6. 매력·자존감도 함께 쌓여요. 미수행은 -0.5로 작지만, 쉬면 꾸준함이 줄어 효과가 다시 작아져요.',
      instant: '바로 반영형: 완료하면 바로 매력이 오르고 자존감도 조금 올라요. 이틀 연속 놓치면 매력이 내려가요.',
      normal: '보통: 완료할 때마다 연결 능력치 +1.'
    };
    const html =
      '<h2>' + (task ? '수련 편집' : '새 수련') + '</h2>' +
      '<label class="lbl" for="tn">이름</label><input id="tn" class="field" maxlength="20" value="' + U.esc(t.name) + '">' +
      '<label class="lbl" for="tc">달성 기준</label><input id="tc" class="field" maxlength="60" value="' + U.esc(t.criterion) + '" placeholder="예: 30분 이상">' +
      '<label class="lbl">수행 주기</label><div class="toggle-grid" id="tm"><button class="btn" data-m="0" aria-pressed="' + !t.opportunity + '">요일 지정</button><button class="btn" data-m="1" aria-pressed="' + t.opportunity + '">기회형</button></div>' +
      '<div class="toggle-grid" id="td" style="margin-top:6px">' + [1, 2, 3, 4, 5, 6, 0].map(d => '<button class="btn" data-d="' + d + '" aria-pressed="' + t.days.includes(d) + '">' + U.WD[d] + '</button>').join('') + '</div>' +
      '<label class="lbl">연결 능력치 (하나 이상)</label><div class="toggle-grid" id="ts">' + BM.STATS.map(s => '<button class="btn" style="--c:' + (s.id === 'esteem' ? '#b9b6d6' : s.color) + '" data-s="' + s.id + '" aria-pressed="' + t.stats.includes(s.id) + '">' + s.name + '</button>').join('') + '</div>' +
      '<label class="lbl">효과가 나타나는 방식</label><div class="toggle-grid" id="tg">' + ['habit', 'instant', 'normal'].map(g => '<button class="btn" data-g="' + g + '" aria-pressed="' + (t.growth === g) + '">' + G.GROWTH_NAME[g] + '</button>').join('') + '</div>' +
      '<p class="small dim" id="tgh" style="margin:4px 0 0">' + GROWTH_HELP[t.growth] + '</p>' +
      '<label class="lbl">운동 수련</label><div class="toggle-grid"><button class="btn" id="tx" aria-pressed="' + !!t.exercise + '">이 수련은 운동이에요</button></div>' +
      '<p class="small dim" style="margin:4px 0 0">운동으로 표시하면 완료할 때 체력·절제력이 함께 오르고(꾸준함형), 그날 실제로 한 다른 수련의 XP가 10% 늘어요.</p>' +
      '<div class="row" style="margin-top:14px"><button class="btn ghost grow" data-x="cancel">취소</button><button class="btn gold grow" data-x="save">저장</button></div>';
    UI.modal(html, (m, close) => {
      const sync = () => { m.querySelector('#td').style.display = t.opportunity ? 'none' : ''; };
      sync();
      m.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.m) { t.opportunity = b.dataset.m === '1'; m.querySelectorAll('[data-m]').forEach(x => x.setAttribute('aria-pressed', x === b)); sync(); }
        if (b.dataset.d) { const d = +b.dataset.d; t.days = t.days.includes(d) ? t.days.filter(x => x !== d) : t.days.concat(d); b.setAttribute('aria-pressed', t.days.includes(d)); }
        if (b.dataset.s) { const s = b.dataset.s; t.stats = t.stats.includes(s) ? t.stats.filter(x => x !== s) : t.stats.concat(s); b.setAttribute('aria-pressed', t.stats.includes(s)); }
        const setGrowth = g => { t.growth = g; m.querySelectorAll('[data-g]').forEach(x => x.setAttribute('aria-pressed', x.dataset.g === g)); m.querySelector('#tgh').textContent = GROWTH_HELP[g]; };
        if (b.dataset.g) setGrowth(b.dataset.g);
        if (b.id === 'tx') { t.exercise = !t.exercise; b.setAttribute('aria-pressed', t.exercise); if (t.exercise && t.growth === 'normal') setGrowth('habit'); }
        if (b.dataset.x === 'cancel') close();
        if (b.dataset.x === 'save') {
          t.name = m.querySelector('#tn').value.trim(); t.criterion = m.querySelector('#tc').value.trim();
          if (!t.name) return UI.toast('수련 이름을 적어 주세요.', true);
          if (!t.stats.length) return UI.toast('연결할 능력치를 하나 이상 골라 주세요.', true);
          if (!t.opportunity && !t.days.length) return UI.toast('요일을 하나 이상 고르거나 기회형으로 바꿔 주세요.', true);
          close();
          if (task) onSave(Object.assign(task, t));
          else onSave(G.makeTask(t, S.profile.startDate > U.today() ? S.profile.startDate : U.today()));
        }
      });
    });
  }

  // ---------- 홈 ----------
  function renderHome() {
    const today = U.today();
    if (!view.date || view.date > today) view.date = today;
    if (view.date < S.profile.startDate) view.date = S.profile.startDate;
    const R = G.replay(S, today);
    notifyChanges(R);
    // 탭: 메인 · 수련 · 보석 · 설정 (2026-11-13 사용자 요청. 예전 '기록' 탭은 수련 탭 맨 아래 '지난 기록'으로)
    const tabHtml = { main: tabMain, quest: tabQuest, gem: tabGem, settings: tabSettings }[view.tab] || tabMain;
    app.innerHTML =
      '<div class="screen">' +
      '<div class="spread" style="margin:4px 4px 6px"><div><div class="small gold">용사</div><h2 style="margin:0">' + U.esc(S.profile.name) + '</h2></div>' +
      '<div style="text-align:right;min-width:140px"><div class="count"><span class="gold">Lv.' + R.lv.level + '</span> <span class="small muted">' + U.fmt(R.xp) + ' XP</span></div>' +
      '<div class="bar thin" aria-label="다음 레벨까지"><i style="width:' + (R.lv.into / R.lv.need * 100) + '%;--c:var(--gold)"></i></div></div></div>' +
      tabHtml(R) +
      '</div>' +
      '<nav class="tabs" aria-label="메뉴"><div class="in">' +
      [['main', '메인'], ['quest', '수련'], ['gem', '보석'], ['settings', '설정']].map(([k, l]) => '<button class="btn" data-tab="' + k + '" ' + ((view.tab in { main: 1, quest: 1, gem: 1, settings: 1 } ? view.tab : 'main') === k ? 'aria-current="page"' : '') + '>' + l + '</button>').join('') +
      '</div></nav>';
    const r0 = S.diagnosis.result, top4 = ids => ids.slice(0, BM.CONFIG.gem.colorCount);
    app.querySelectorAll('canvas[data-brooch]').forEach(c => {
      const which = c.dataset.brooch;
      if (which === 'now') brooch(c, UI.broochSpec(look(), S.profile.seed, R.top3, R.aura, R.stats));
      if (which === 'init') brooch(c, UI.broochSpec(look(), S.profile.seed, r0.top3, r0.axes, r0.points));
    });
    app.querySelectorAll('canvas[data-gem]').forEach(c => {
      if (c.dataset.gem === 'now') gem(c, UI.gemSpec(S.profile.seed, top4(R.top3), R.aura, R.stats.esteem, R.stats));
      if (c.dataset.gem === 'init') gem(c, UI.gemSpec(S.profile.seed, top4(r0.top3), r0.axes, r0.points.esteem, r0.points));
    });
    UI.hydrateGems(app);
    currentScene = null;
    const sc = app.querySelector('canvas[data-scene]'); if (sc) mountScene(sc);
    const wr = app.querySelector('select[data-wregion]');
    if (wr) wr.onchange = () => { S.settings.weather = { mode: 'region', region: wr.value }; persist(); render(); refreshWeather(true).then(() => view.tab === 'settings' && render()); };
    app.onclick = e => onHomeClick(e, R);
    const imp = document.getElementById('imp'); if (imp) imp.onchange = importFile;
  }

  function notifyChanges(R) {
    const top4 = R.top3.slice(0, BM.CONFIG.gem.colorCount), snap = { level: R.lv.level, top3: top4.join(',') };
    if (lastSnapshot) {
      if (snap.level > lastSnapshot.level) UI.toast('★ 레벨 업! Lv.' + snap.level);
      else if (snap.top3 !== lastSnapshot.top3) UI.toast('브로치 보석의 빛이 바뀌었어요: ' + top4.map(id => BM.STAT[id].name).join(' · '));
    }
    lastSnapshot = snap;
  }

  function tabQuest(R) {
    const d = view.date, today = U.today();
    const list = G.tasksForDate(S, d);
    const rec = S.records[d] || {};
    const h = R.history.find(x => x.date === d);
    const miss = G.unrecorded(S, U.addDays(today, -7) < S.profile.startDate ? S.profile.startDate : U.addDays(today, -7), U.addDays(today, -1));
    // 수련 탭 순서: 걷는 모험 장면 → 날짜 → 오늘의 수련 (2026-11-13 사용자 요청). 초상화와 말풍선은 메인 탭으로
    const st = sceneState();
    return '<div class="scene-wrap"><canvas data-scene></canvas>' +
      '<div class="scene-bar"><span class="small muted" data-scene-cap>' + U.esc(sceneCaption(st)) + '</span>' +
      (st !== 'WALK' ? '<button class="btn sm" data-a="wake">' + (st === 'REST' ? '다시 출발' : '일어났어요') + '</button>' : '') + '</div></div>' +
      '<div class="panel dark datebar"><button class="btn sm ghost" data-a="prev" aria-label="이전 날" ' + (d <= S.profile.startDate ? 'disabled' : '') + '>◀</button>' +
      '<div class="d">' + U.pretty(d) + (d === today ? ' <span class="gold small">오늘</span>' : '') + '</div>' +
      '<button class="btn sm ghost" data-a="next" aria-label="다음 날" ' + (d >= today ? 'disabled' : '') + '>▶</button></div>' +
      (d !== today ? '<button class="btn sm ghost block" data-a="today">오늘로 돌아가기</button>' : '') +
      (miss.length && d === today ? '<div class="notice">기록하지 않은 지난 수련이 있어요: ' + miss.map(m => '<button class="btn sm ghost" data-go="' + m.date + '">' + U.pretty(m.date).replace(/ \(.\)/, '') + ' ' + m.count + '개</button>').join('') + '<br>미기록은 자동으로 미수행 처리하지 않아요. 날짜를 눌러 기록해 주세요.</div>' : '') +
      '<div class="panel"><span class="tl">오늘의 수련</span><span class="tr count">' + (h ? '+' + U.fmt(h.xp) + ' XP' + (h.exerciseBonus ? ' · 운동 보너스' : '') : '0 XP') + '</span>' +
      (list.length ? list.map(t => questCard(t, rec[t.id], R)).join('') : '<p class="muted">이 날 예정된 수련이 없어요.</p>') +
      '</div>' +
      (h && Object.keys(h.delta).length ? '<div class="panel dark"><span class="tl">이 날의 변화</span>' + deltaLine(h.delta) + '</div>' : '') +
      '<button class="btn ghost block" data-a="add">+ 수련 추가</button>' +
      '<details class="fold"' + (view.logOpen ? ' open' : '') + '><summary class="btn ghost block" data-a="log">지난 기록 · 연속 기록 · 오오라 변화</summary>' + tabLog(R) + '</details>';
  }

  // 메인: 상반신 캐릭터 + 오늘 수련을 한눈에 (2026-11-13 사용자: "메인에는 상반신 캐릭터와 각 수련이 체크가 됐는지 간단하게 한눈으로")
  //  수련 이름 칸을 누르면 수련 탭으로. 다 체크하면 초상화 오른쪽에 말풍선 (예전 수련 탭과 같은 규칙)
  const MARK = { done: ['✓', 'ok', '완료'], try: ['△', 'try', '시도'], rest: ['☾', 'rest', '휴식'], miss: ['✕', 'miss', '미수행'] };
  function tabMain(R) {
    const today = U.today(), list = G.tasksForDate(S, today), rec = S.records[today] || {}, h = R.history.find(x => x.date === today);
    const chk = G.dayCheck(S, today), n = list.length, checked = list.filter(t => rec[t.id]).length, done = list.filter(t => rec[t.id] && rec[t.id].j === 'done').length;
    const st = sceneState();
    return UI.heroCard('now', 'sm', chk ? { say: chk === 'done' ? '오늘 완벽했어!' : '오늘도 수고했어!' } : null) +
      UI.broochLegend(R.top3, S.profile.seed, { noPct: true }) +
      '<div class="panel today-glance"><span class="tl">오늘의 수련 · ' + U.pretty(today).replace(/^\d+년 /, '') + '</span><span class="tr count">' + checked + ' / ' + n + ' 체크</span>' +
      '<div class="bar thin" role="progressbar" aria-label="오늘 체크한 수련" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + checked + '"><i style="width:' + (n ? checked / n * 100 : 0) + '%;--c:var(--ok)"></i></div>' +
      (n ? '<div class="glance">' + list.map(t => {
        const r = rec[t.id], m = r ? MARK[r.j] : null;
        return '<button class="g-item' + (m ? ' ' + m[1] : '') + '" data-tab="quest" aria-label="' + U.esc(t.name) + ': ' + (m ? m[2] : '아직 체크 안 함') + '">' +
          '<span class="g-mark" aria-hidden="true">' + (m ? m[0] : '') + '</span><span class="g-name">' + U.esc(t.name) + '</span></button>';
      }).join('') + '</div>' : '<p class="muted">오늘 예정된 수련이 없어요.</p>') +
      '<div class="spread g-foot"><span class="small muted">완료 ' + done + '개 · 오늘 ' + (h ? '+' + U.fmt(h.xp) : '0') + ' XP' + (st !== 'WALK' ? ' · 용사는 ' + BM.scene.STATE_NAME[st] : '') + '</span>' +
      '<button class="btn sm" data-tab="quest">수련하러 가기 ▶</button></div></div>';
  }
  // 성장 방식 한 줄: 꾸준함형은 최근 4주 꾸준함 막대 + 지금 효과 배율, 바로 반영형은 표시만
  function growthLine(t, R) {
    const g = G.growthOf(null, t), hb = R.habit && R.habit[t.id];
    if (g === 'habit' && hb) {
      const pct = Math.round(hb.c * 100);
      return '<div class="grow-line" title="최근 4주 동안 예정된 날 중 실제로 한 비율"><span class="gtag">꾸준함</span><span class="gbar" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' +
        '<span class="small muted">' + pct + '% · 효과 ×' + hb.gen.toFixed(2) + '</span></div>';
    }
    if (g === 'instant') return '<div class="grow-line"><span class="gtag">바로 반영</span><span class="small muted">완료하면 바로 매력 ▲</span></div>';
    return '';
  }
  function questCard(t, r, R) {
    const st = R.streaks[t.id];
    return '<div class="quest" style="border-bottom:4px solid rgba(5,4,26,.55)">' +
      '<div class="spread"><div class="grow"><div class="qn">' + U.esc(t.name) + (t.archived ? ' <span class="dim small">(보관됨)</span>' : '') + '</div>' +
      '<div class="qc">' + U.esc(t.criterion) + (t.opportunity ? ' · <span class="opp">기회형</span>' : '') + (t.exercise ? ' · <span class="streak">운동</span>' : '') + '</div>' +
      (() => { const up = G.statsFor(t, 'done'), more = up.length > t.stats.length; return '<div class="dots">' + up.map(s => '<i style="--c:' + (s === 'esteem' ? '#b9b6d6' : BM.STAT[s].color) + '" title="' + BM.STAT[s].name + '"></i>').join('') + '<span class="small muted" style="margin-left:4px">' + (more ? '완료 시 ' : '') + up.map(s => BM.STAT[s].name).join('·') + (more ? ' ▲' : '') + '</span></div>'; })() +
      growthLine(t, R) + '</div>' +
      (st && st.cur > 0 ? '<span class="streak">연속 ' + st.cur + '일' + (t.stats.includes('discipline') && G.streakMult(st.cur) > 1 ? ' ×' + G.streakMult(st.cur) : '') + '</span>' : '') + '</div>' +
      '<div class="judge" role="group" aria-label="' + U.esc(t.name) + ' 판정">' +
      ['done', 'try', 'rest', 'miss'].map(j => '<button class="btn" data-j="' + j + '" data-t="' + t.id + '" aria-pressed="' + (!!r && r.j === j) + '">' + G.JUDGE[j].short + '</button>').join('') +
      '</div></div>';
  }
  function deltaLine(delta) {
    return '<div class="row wrap">' + Object.keys(delta).map(s => {
      const v = delta[s], rare = BM.STAT[s].rare;
      const txt = rare ? (v > 0 ? '▲' : '▼') + ' ' + Math.abs(v).toFixed(2) : (v > 0 ? '+' : '') + U.fmt(v);
      return '<span class="chip ' + (v > 0 ? 'delta-up' : 'delta-down') + '" style="--c:' + BM.STAT[s].color + '"><i></i>' + BM.STAT[s].name + ' ' + txt + '</span>';
    }).join('') + '</div>' + (Object.keys(delta).some(s => BM.STAT[s].rare) ? '<p class="small dim" style="margin:4px 0 0">희귀 능력치는 내부적으로 소수점까지 쌓이고 화면에는 정수만 보여요.</p>' : '');
  }

  function tabGem(R) {
    const ri = S.diagnosis.result;
    const names = ids => '<div class="small dim">' + ids.slice(0, BM.CONFIG.gem.colorCount).map(id => BM.STAT[id].name).join('·') + '</div>';
    // 보석 탭은 초창기 컷팅 보석 (2026-11-13 사용자: "초창기 이 버전이 훨씬 좋아") — 상위 4색을 비율대로. 수련 탭은 캐릭터 초상화
    return '<div class="gem-stage"><canvas data-gem="now"></canvas></div>' +
      UI.broochLegend(R.top3, S.profile.seed, { stats: R.stats }) +
      '<div class="panel"><span class="tl">성향 오오라</span>' +
      '<div class="row"><div class="grow center"><div class="small muted">처음</div><div class="gem-stage" style="margin:0"><canvas data-gem="init" style="width:120px"></canvas></div>' + names(ri.top3) + '</div>' +
      '<div class="grow center"><div class="small muted">지금</div><div class="gem-stage" style="margin:0"><canvas data-gem="now" style="width:120px"></canvas></div>' + names(R.top3) + '</div></div>' +
      UI.auraLines(R.aura) + '<p class="small dim" style="margin:6px 0 0">오오라는 오래 쌓인 기록 70% + 최근 14일 30%로 천천히 변해요.</p></div>' +
      '<div class="panel"><span class="tl">능력치 보석</span><span class="tr count">' + U.fmt(R.xp) + ' XP</span>' + UI.statRows(R.stats) + '</div>' +
      '<p class="notice">100마다 완성 보석 1개, 완성 보석 10개는 대형 보석 1개(1,000)로 합성돼요. 10,000·100,000도 10개씩 합쳐집니다. 초기값: ' +
      BM.STAT_IDS.map(id => BM.STAT[id].name + ' ' + ri.points[id]).join(' · ') + '</p>';
  }

  function tabLog(R) {
    const streaks = S.tasks.map(t => ({ t, s: R.streaks[t.id] || { cur: 0, best: 0 } }));
    const days = R.history.slice().reverse().slice(0, 60);
    const ah = R.auraHistory.slice(-30);
    return '<div class="panel"><span class="tl">연속 기록</span>' +
      streaks.map(({ t, s }) => '<div class="spread stat-row"><span class="grow">' + U.esc(t.name) + (t.archived ? ' <span class="dim small">(보관)</span>' : '') + '</span><span class="small muted">최장 ' + s.best + '일</span><span class="streak" style="min-width:70px;text-align:right">현재 ' + s.cur + '일</span></div>').join('') +
      '<p class="small dim" style="margin:8px 0 0">절제력 수련 연속 보너스: 3·7·21·40·100·365일</p></div>' +
      (ah.length ? '<div class="panel"><span class="tl">오오라 변화 (최근 ' + ah.length + '일 기록)</span>' + auraSpark(ah) + '</div>' : '') +
      '<div class="panel"><span class="tl">날짜별 기록</span>' +
      (days.length ? days.map(h => {
        const rec = S.records[h.date] || {};
        const items = Object.keys(rec).map(id => { const r = rec[id]; const t = S.tasks.find(x => x.id === id); return '<span class="chip small"><i style="--c:var(--' + (r.j === 'done' ? 'ok' : r.j === 'try' ? 'try' : r.j === 'rest' ? 'rest' : 'miss') + ')"></i>' + U.esc((t && t.name) || r.name || '수련') + ' ' + G.JUDGE[r.j].short + '</span>'; }).join('');
        return '<div class="list-day"><div class="spread"><button class="btn sm ghost" data-go="' + h.date + '">' + U.pretty(h.date) + '</button><span class="count gold">+' + U.fmt(h.xp) + ' XP</span></div><div class="row wrap">' + items + '</div>' + (Object.keys(h.delta).length ? deltaLine(h.delta) : '') + '</div>';
      }).join('') : '<p class="muted">아직 기록이 없어요. 오늘의 수련부터 시작해 보세요.</p>') +
      '</div>';
  }
  function auraSpark(ah) {
    const bar = (v, c) => '<i style="display:block;width:8px;height:' + Math.round(6 + v * 54) + 'px;background:' + c + ';box-shadow:2px 0 0 0 #05041a"></i>';
    return '<div class="row" style="align-items:flex-end;gap:2px;height:64px;overflow:hidden">' + ah.map(a => '<span style="display:flex;align-items:flex-end;gap:1px">' + bar(a.sr, '#f17eaf') + bar(a.al, '#e3ecff') + '</span>').join('') + '</div>' +
      '<div class="small muted"><span style="color:#f17eaf">■</span> 자기존중 <span style="color:#e3ecff">■</span> 이타 실천</div>';
  }

  // 날씨 연동: 끔 / 현재 위치 / 지역. 보내는 것은 대략적인 위도·경도(약 1km)뿐
  function weatherPanel() {
    const w = BM.weather.settings(S), v = BM.weather.info(), on = w.mode !== 'off';
    const now = on && v && v.mode === w.mode ? (v.place || '') + ' · ' + BM.scene.WEATHER_NAME[v.kind] + ' (' + Math.max(0, Math.round((Date.now() - v.at) / 60000)) + '분 전 확인)' : '';
    return '<div class="panel"><span class="tl">날씨</span>' +
      '<p class="small muted">모험 장면에 지금 날씨(비·눈·흐림·안개)를 보여 줘요. ' + (on ? (now || '날씨를 확인하는 중…') : '지금은 꺼져 있어서 시간대 배경만 보여요.') + '</p>' +
      '<div class="toggle-grid">' +
      '<button class="btn" data-a="wgps" aria-pressed="' + (w.mode === 'gps') + '">현재 위치</button>' +
      '<button class="btn" data-a="woff" aria-pressed="' + (w.mode === 'off') + '">끄기</button></div>' +
      '<label class="lbl" for="wregion">지역으로 보기</label>' +
      '<select id="wregion" class="field" data-wregion>' + (w.mode !== 'region' ? '<option value="" selected disabled>지역 고르기</option>' : '') +
      BM.weather.REGIONS.map(r => '<option value="' + r[0] + '"' + (w.mode === 'region' && w.region === r[0] ? ' selected' : '') + '>' + r[1] + '</option>').join('') + '</select>' +
      '<p class="small dim">켜면 위치(약 1km 단위로 줄임) 또는 고른 지역의 좌표만 무료 날씨 서비스 Open-Meteo에 보내 날씨를 받아 와요. 용사 기록은 보내지 않아요. 30분에 한 번만 확인해요.</p></div>';
  }
  function tabSettings() {
    return '<div class="panel"><span class="tl">용사</span>' +
      '<label class="lbl" for="rn">이름 변경</label><div class="row"><input id="rn" class="field grow" maxlength="12" value="' + U.esc(S.profile.name) + '"><button class="btn sm" data-a="rename">변경</button></div>' +
      '<label class="lbl">모습</label><div class="toggle-grid">' + ['girl', 'boy'].map(k => '<button class="btn" data-look="' + k + '" aria-pressed="' + (look() === k) + '">' + UI.LOOK_NAME[k] + '</button>').join('') + '</div>' +
      '<p class="small dim">시작일 ' + S.profile.startDate + ' · 하루 기준 새벽 ' + BM.CONFIG.dayStartHour + '시</p></div>' +
      '<div class="panel"><span class="tl">내 수련</span>' +
      S.tasks.map(t => '<div class="spread stat-row"><span class="grow"><b>' + U.esc(t.name) + '</b>' + (t.archived ? ' <span class="dim small">보관됨</span>' : '') + '<br><span class="small muted">' + daysLabel(t) + ' · ' + t.stats.map(s => BM.STAT[s].name).join('·') + ' · ' + G.GROWTH_NAME[G.growthOf(null, t)] + '</span></span>' +
        '<button class="btn sm ghost" data-edit="' + t.id + '">편집</button><button class="btn sm ghost" data-arch="' + t.id + '">' + (t.archived ? '복원' : '보관') + '</button></div>').join('') +
      '<button class="btn ghost block" data-a="add">+ 수련 추가</button>' +
      '<p class="small dim">보관한 수련의 지난 기록은 그대로 남아요. 기록 당시의 연결 능력치로 계산하므로 편집해도 과거 점수가 바뀌지 않아요.</p></div>' +
      '<div class="panel"><span class="tl">화면</span><label class="lbl">움직임 줄이기</label><div class="toggle-grid">' +
      [['auto', '기기 설정 따름'], ['on', '켜기'], ['off', '끄기']].map(([k, l]) => '<button class="btn" data-motion="' + k + '" aria-pressed="' + (reduced() === k) + '">' + l + '</button>').join('') + '</div></div>' +
      weatherPanel() +
      '<div class="panel"><span class="tl">데이터</span>' +
      '<button class="btn block" data-a="export">JSON 백업 내보내기</button>' +
      '<button class="btn ghost block" data-a="import">백업 불러오기</button>' +
      '<input type="file" id="imp" accept="application/json,.json" class="sr-only" aria-label="백업 파일 선택">' +
      '<button class="btn danger block" data-a="reset">새 용사로 다시 시작</button>' +
      '<p class="small dim">저장 위치: 이 브라우저의 로컬 저장소 · 마지막 저장 ' + (S.savedAt ? new Date(S.savedAt).toLocaleString('ko-KR') : '-') + '</p></div>' +
      '<p class="notice">BRAVE MAKER는 자기 성장을 돕는 게임이에요. 점수는 앱 안의 습관 추세를 보여주는 게임 지표이고, 실제 능력·외모·인격·도덕성의 평가가 아닙니다.</p>';
  }

  async function onHomeClick(e, R) {
    const tab = e.target.closest('[data-tab]');
    if (tab) { view.tab = tab.dataset.tab; window.scrollTo(0, 0); return render(); }
    const j = e.target.closest('[data-j]');
    if (j) {
      const t = S.tasks.find(x => x.id === j.dataset.t); if (!t) return;
      const rec = G.setRecord(S, view.date, t, j.dataset.j);
      if (view.date === U.today()) onJudged(t, rec);      // 지난 날을 고칠 때는 장면을 바꾸지 않음
      persist(); return render();
    }
    const go = e.target.closest('[data-go]');
    if (go) { view.date = go.dataset.go; view.tab = 'quest'; window.scrollTo(0, 0); return render(); }
    const ed = e.target.closest('[data-edit]');
    if (ed) { const t = S.tasks.find(x => x.id === ed.dataset.edit); return editTask(t, () => { persist(); render(); }); }
    const ar = e.target.closest('[data-arch]');
    if (ar) { const t = S.tasks.find(x => x.id === ar.dataset.arch); t.archived = !t.archived; persist(); return render(); }
    const lk = e.target.closest('[data-look]');
    if (lk) {
      if (look() === lk.dataset.look) return;
      S.profile.look = lk.dataset.look; persist(); UI.toast(UI.LOOK_NAME[S.profile.look] + ' 모습으로 바꿨어요.'); return render();
    }
    const mo = e.target.closest('[data-motion]');
    if (mo) { S.settings.reducedMotion = mo.dataset.motion; persist(); return render(); }
    const a = e.target.closest('[data-a]'); if (!a) return;
    switch (a.dataset.a) {
      case 'prev': view.date = U.addDays(view.date, -1); return render();
      case 'next': view.date = U.addDays(view.date, 1); return render();
      case 'today': view.date = U.today(); return render();
      case 'wake': setSceneState('WALK'); persist(); return render();
      case 'log': view.logOpen = !view.logOpen; return;            // 지난 기록 접기·펴기 (다시 그려도 그대로)
      case 'wgps': S.settings.weather = { mode: 'gps', region: BM.weather.settings(S).region }; persist(); render(); return refreshWeather(true).then(() => view.tab === 'settings' && render());
      case 'woff': S.settings.weather = { mode: 'off', region: BM.weather.settings(S).region }; persist(); return render();
      case 'add': return editTask(null, t => { S.tasks.push(t); persist(); render(); });
      case 'rename': {
        const v = document.getElementById('rn').value.trim();
        if (!v) return UI.toast('이름을 적어 주세요.', true);
        S.profile.name = v; persist(); UI.toast('용사 ' + v + '(으)로 바꿨어요.'); return render();
      }
      case 'export': {
        ST.download('brave-maker-backup-' + U.today() + '.json', ST.exportText(S));
        return UI.toast('백업 파일을 내보냈어요.');
      }
      case 'import': return document.getElementById('imp').click();
      case 'reset': {
        if (!(await UI.confirmBox('정말 다시 시작할까요?', '용사 <b>' + U.esc(S.profile.name) + '</b>의 진단 결과와 모든 수련 기록이 이 기기에서 지워져요.', '다음', true))) return;
        if (!(await UI.confirmBox('마지막 확인', '되돌릴 수 없어요. 백업을 내보내지 않았다면 취소하고 먼저 백업하세요.', '모두 지우고 새로 시작', true))) return;
        ST.clear(); S = null; view = { tab: 'main', date: null }; lastSnapshot = null; return render();
      }
    }
  }

  function importFile(e) {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = async () => {
      try {
        const data = ST.importText(String(rd.result));
        if (S && S.profile && !(await UI.confirmBox('백업을 불러올까요?', '지금 기록이 백업 파일 <b>용사 ' + U.esc(data.profile.name) + '</b>의 내용으로 바뀌어요.', '불러오기', true))) return;
        S = data; view = { tab: 'main', date: null }; lastSnapshot = null; persist(); UI.toast('백업을 불러왔어요.'); render();
      } catch (err) { UI.toast('불러오지 못했어요: ' + err.message, true); }
    };
    rd.onerror = () => UI.toast('파일을 읽지 못했어요.', true);
    rd.readAsText(f);
  }

  // ---------- 시작 ----------
  UI.starfield();
  const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  // 저장된 용사가 있으면 시작 화면 없이 바로 이어간다 (진단을 다시 하지 않음).
  // 새 용사는 설정 → '새 용사로 다시 시작'에서만 만든다.
  (async function boot() {
    let saved = null;
    try { saved = ST.load(); } catch (e) { UI.toast('저장 데이터를 읽지 못했어요: ' + e.message, true); }
    if (BM.cloud.present()) {
      // claude.ai 링크: 내 계정에 저장된 기록을 먼저 불러온다
      app.innerHTML = '<div class="screen loading"><div class="title-logo"><div class="ko">용사 키우기</div></div><h2 style="margin-top:20px">내 기록 불러오는 중</h2><div class="dots"><span></span><span></span><span></span></div></div>';
      if (await BM.cloud.init()) {
        BM.cloud.onError = e => UI.toast('계정에 저장하지 못했어요 (' + ((e && e.code) || '오류') + '). 잠시 후 다시 시도돼요.', true);
        try {
          const c = await BM.cloud.load();
          if (c) saved = ST.validate(c);
          else if (saved) BM.cloud.save(saved);      // 이 기기에만 있던 기록을 계정으로 올린다
        } catch (e) { UI.toast('계정 기록을 불러오지 못했어요. 이 기기 기록으로 열게요.', true); }
      } else {
        UI.toast('로그인하지 않아 이 기기에만 저장돼요.', true);
      }
    }
    S = saved && saved.phase && saved.phase !== 'name' ? saved : null;
    render();
    refreshWeather(false);
  })();
  // 다시 돌아왔을 때: 날씨 확인(30분 저장) + 시간대 문구 갱신. 가려져 있는 동안 장면은 스스로 멈춘다
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !S || S.phase !== 'home') return;
    refreshWeather(false);
    const cap = app.querySelector('[data-scene-cap]'); if (cap) cap.textContent = sceneCaption(sceneState());
  });

  // 설치형 앱: 오프라인 캐시 + 저장 공간 영구 보관 요청 (브라우저가 임의로 지우지 않도록)
  // 개발 서버(localhost)에서는 코드 수정이 바로 보이도록 업로드용 폴더(dist/날짜_v버전/web)에서만 캐시를 켠다
  const devHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const distWeb = /\/dist\/(?:[^/]+\/)?web\//;
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    if (!devHost || distWeb.test(location.pathname)) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* 캐시 없이도 동작 */ }));
    } else {
      navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => { if (!distWeb.test(r.scope)) r.unregister(); })).catch(() => { });
    }
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { /* 지원하지 않는 기기 */ }
  window.addEventListener('focus', () => { if (S && S.phase === 'home' && view.date && view.date > U.today()) { view.date = U.today(); render(); } });
  window.BM_APP = { get state() { return S; }, render };
})();
