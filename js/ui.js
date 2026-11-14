/* 본 앱과 지인용 진단 앱이 함께 쓰는 UI 조각 */
window.BM = window.BM || {};
BM.ui = (function () {
  const U = BM.util;
  const $ = (sel, root) => (root || document).querySelector(sel);

  // 픽셀 별 배경 (한 번 생성해 반복 타일로 사용)
  function starfield() {
    try {
      const c = document.createElement('canvas'); c.width = 96; c.height = 96;
      const x = c.getContext('2d'); const r = U.rng(7);
      for (let i = 0; i < 26; i++) {
        const px = Math.floor(r() * 96), py = Math.floor(r() * 96), b = r();
        x.fillStyle = b > 0.85 ? '#cfd6ff' : b > 0.5 ? '#5b5699' : '#2c2866';
        x.fillRect(px, py, 1, 1);
        if (b > 0.93) { x.fillStyle = '#6f6ab5'; x.fillRect(px - 1, py, 1, 1); x.fillRect(px + 1, py, 1, 1); x.fillRect(px, py - 1, 1, 1); x.fillRect(px, py + 1, 1, 1); }
      }
      document.body.style.setProperty('--stars', 'url(' + c.toDataURL() + ')');
    } catch (e) { /* 배경은 없어도 된다 */ }
  }

  function toast(msg, isErr) {
    const old = $('.toast'); if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (isErr ? ' err' : ''); t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), isErr ? 4200 : 2200);
  }

  function modal(html, onMount) {
    const bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal panel" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(bg);
    const close = () => { bg.remove(); document.removeEventListener('keydown', esc); };
    const esc = e => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', esc);
    bg.addEventListener('click', e => { if (e.target === bg) close(); });
    if (onMount) onMount(bg.firstChild, close);
    const f = bg.querySelector('input,button,textarea'); if (f) f.focus();
    return close;
  }
  function confirmBox(title, body, okLabel, danger) {
    return new Promise(res => {
      modal('<h2>' + U.esc(title) + '</h2><p class="muted">' + body + '</p><div class="row"><button class="btn ghost grow" data-x="no">취소</button><button class="btn grow ' + (danger ? 'danger' : 'gold') + '" data-x="ok">' + U.esc(okLabel || '확인') + '</button></div>',
        (m, close) => m.addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (!b) return; close(); res(b.dataset.x === 'ok'); }));
    });
  }

  // ---------- 보석 ----------
  function gemSpec(seed, top3, aura, esteem, stats) {   // stats 가 있으면 색 비율 = 실제 능력치 비율
    return { seed, colors: top3, sr: aura.sr, al: aura.al, esteem: esteem == null ? 5 : esteem, ratios: BM.gem.statRatios(stats, top3) };
  }
  function mountGem(canvas, spec, reduced) {
    canvas.classList.add('px');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '고유 보석: ' + spec.colors.map(id => BM.STAT[id].name).join(', ') + ' 색과 성향 오오라');
    return BM.gem.Player(canvas, spec, { reducedMotion: reduced === 'auto' ? undefined : reduced === 'on' });
  }

  // ---------- 브로치 보석 초상화 ----------
  const LOOK_NAME = { girl: '여자 용사', boy: '남자 용사' };
  function broochSpec(look, seed, ids, aura, stats) {
    const colors = ids.slice(0, BM.CONFIG.gem.colorCount);
    return { look: look === 'boy' ? 'boy' : 'girl', seed, colors, sr: aura ? aura.sr : 0.5, al: aura ? aura.al : 0.5, ratios: BM.gem.statRatios(stats, colors) };
  }
  // view: { crop: 숫자 }(브로치 주변만 정사각형으로) | 없음(초상화 전체)
  function mountBrooch(canvas, spec, reduced, view) {
    const v = view && typeof view === 'object' ? view : {};
    return BM.brooch.Player(canvas, spec, { reducedMotion: reduced === 'auto' || reduced == null ? undefined : reduced === 'on', crop: v.crop || 0 });
  }
  // 초상화 카드 자리 (data-brooch 값으로 어떤 보석인지 구분, 화면 코드에서 mountBrooch)
  // opts.say: 말풍선 글 → 캐릭터는 제자리(가운데) 그대로, 말풍선만 초상화 오른쪽 바깥 빈 곳에 덧붙인다 (꼬리는 캐릭터 쪽)
  function heroCard(which, cls, opts) {
    const say = opts && opts.say;
    return '<div class="hero-card ' + (cls || '') + '"><canvas data-brooch="' + which + '"></canvas>' +
      (say ? '<div class="speech" role="status">' + U.esc(say) + '</div>' : '') + '</div>';
  }
  // 시작·모습 고르기 화면에서 보여줄 견본 브로치
  const DEMO = {
    girl: { look: 'girl', seed: 20261112, colors: ['create', 'charm', 'mind', 'divine'], sr: 0.7, al: 0.5 },
    boy: { look: 'boy', seed: 4242, colors: ['fit', 'discipline', 'mind', 'esteem'], sr: 0.4, al: 0.75 }
  };
  // 모습 고르기 버튼 2개 (canvas data-brooch="demo-girl|demo-boy", 버튼 data-look)
  function lookPicker(cur) {
    return '<div class="look-pick" role="group" aria-label="용사 모습">' + ['girl', 'boy'].map(k =>
      '<button class="btn" data-look="' + k + '" aria-pressed="' + (cur === k) + '"><canvas data-brooch="demo-' + k + '"></canvas>' + LOOK_NAME[k] + '</button>').join('') + '</div>';
  }
  // 결과 이미지 저장: 브로치 초상화(반짝이는 순간 프레임) + 능력치
  async function saveResultPNG(name, result, spec) {
    await BM.brooch.ready();
    const b = BM.brooch.build(spec);
    const art = b ? b.frames[2] : BM.gem.cached(gemSpec(spec.seed, result.top3, result.axes, result.points.esteem, result.points)).frames[0];
    return savePNG(resultCanvas(name, result, art, null, b ? { ids: spec.colors, seed: spec.seed, stats: result.points } : null), 'brave-maker-' + name + '.png');
  }
  // 브로치 순위·비율 칩 (1위 ○○ 46% …)
  function broochLegend(ids, seed, opts) {
    opts = opts || {};
    const top = ids.slice(0, BM.CONFIG.gem.colorCount), pct = BM.brooch.percents(BM.gem.statRatios(opts.stats, top) || BM.gem.ratios(seed, top.length));
    const col = id => BM.STAT[id].color;   // 칩은 능력치 색 그대로 (4색 띠는 2026-11-13 사용자 요청으로 뺌)
    return '<div class="brooch-legend">' +
      '<div class="center">' + top.map((id, i) => '<span class="chip" style="--c:' + col(id) + '"><i></i>' + (i + 1) + '위 ' + BM.STAT[id].name + (BM.STAT[id].rare ? '<span class="tag-rare">희귀</span>' : '') + (opts.noPct ? '' : ' <span class="muted">' + pct[i] + '%</span>') + '</span>').join('') + '</div></div>';
  }

  function chips(ids) {
    return ids.map((id, i) => '<span class="chip" style="--c:' + BM.STAT[id].color + '"><i></i>' + (i + 1) + '위 ' + BM.STAT[id].name + (BM.STAT[id].rare ? '<span class="tag-rare">희귀</span>' : '') + '</span>').join('');
  }

  function level3(v) { return v >= 0.66 ? '선명함' : v >= 0.4 ? '잔잔함' : '은은함'; }
  function auraLines(a) {
    return '<div class="small">자기존중 오오라 <b class="gold">' + level3(a.sr) + '</b> · 분홍빛이 보석 가까이 모입니다</div>' +
      '<div class="small">이타 실천 오오라 <b class="gold">' + level3(a.al) + '</b> · 흰빛이 바깥으로 퍼집니다</div>';
  }

  // ---------- 능력치 목록 (가로 보석 + 오른쪽 숫자) ----------
  function statRows(stats) {
    return BM.STATS.map(s => {
      const v = stats[s.id] || 0;
      const shown = s.rare ? String(Math.floor(v + 1e-9)) : U.fmt(v);
      return '<div class="stat-row"><span class="stat-name" style="color:' + (s.id === 'esteem' ? '#b9b6d6' : s.color) + '">' + s.name + (s.rare ? '<span class="tag-rare">★</span>' : '') +
        '</span><span class="stat-gems" data-stat="' + s.id + '" data-v="' + v + '"></span><span class="stat-val count">' + shown + (s.rare ? '<span class="dim small">/10</span>' : '') + '</span></div>';
    }).join('');
  }
  function hydrateGems(root) {
    root.querySelectorAll('.stat-gems[data-stat]').forEach(el => {
      const s = BM.STAT[el.dataset.stat], v = parseFloat(el.dataset.v) || 0;
      el.innerHTML = '';
      const add = (cv, cls, label) => { const c = cloneCanvas(cv); c.className = 'px ' + (cls || ''); c.setAttribute('aria-hidden', 'true'); c.title = label || ''; el.appendChild(c); return c; };
      const labels = [];
      if (s.rare) {
        const st = BM.gem.rareStage(v);
        add(BM.gem.icon(s.color, st, 0, s.id), '', st === 'max' ? '최대' : BM.gem.STAGE_NAME[st]);
        labels.push(st === 'max' ? '최대 단계 보석' : BM.gem.STAGE_NAME[st]);
      } else {
        const d = BM.gem.decompose(v);
        if (!d.value) {
          const c = add(BM.gem.icon('#3a3566', 'rough', 0, 'empty'), '', '아직 없음'); c.style.opacity = 0.5; labels.push('보석 없음');
        }
        d.tiers.forEach(t => {
          const cv = BM.gem.icon(s.color, 'complete', t.tier, s.id);
          const name = t.tier === 0 ? '완성 보석' : t.tier === 1 ? '대형 보석' : '상위 보석 ×' + Math.pow(10, t.tier + 2).toLocaleString();
          const shownCount = Math.min(t.count, 9);
          for (let i = 0; i < shownCount; i++) add(cv, 't' + Math.min(3, t.tier), name);
          labels.push(name + ' ' + t.count + '개');
        });
        if (d.remainder) { add(BM.gem.icon(s.color, d.remainderStage, 0, s.id), '', BM.gem.STAGE_NAME[d.remainderStage]); labels.push(BM.gem.STAGE_NAME[d.remainderStage] + ' 1개'); }
      }
      el.setAttribute('aria-label', s.name + ': ' + labels.join(', '));
    });
  }
  function cloneCanvas(src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; }

  // ---------- 진단 질문 진행 (생활 습관 + 상황) ----------
  // opts.order 가 있으면 적응형(BM.adaptive): 질문 목록이 답할 때마다 한 개씩 늘어나고(opts.extend), 총 opts.total 문항
  function quiz(root, opts) {
    const bank = opts.bank, adaptive = Array.isArray(opts.order);
    const byId = {}; bank.questions.forEach(q => { byId[q.id] = q; });
    const list = () => adaptive ? opts.order.map(id => byId[id]).filter(Boolean) : bank.questions;
    const total = adaptive ? opts.total : bank.questions.length;
    const answered = x => Number.isInteger(opts.answers[x.id]);
    if (adaptive) opts.extend();
    let qs = list();
    let i = U.clamp(opts.cursor || 0, 0, qs.length - 1);
    const complete = () => adaptive ? BM.adaptive.isComplete(bank, opts.order, opts.answers) : BM.scoring.isComplete(bank, opts.answers);
    function render() {
      qs = list();
      const q = qs[i], ans = opts.answers[q.id];
      const order = BM.scoring.choiceOrder(q, opts.seed);
      const done = qs.filter(answered).length, last = i === total - 1;
      root.innerHTML =
        '<div class="screen">' +
        '<div class="q-head"><span class="q-num count">' + String(i + 1).padStart(2, '0') + ' <span class="dim">/ ' + total + '</span></span><span class="small muted">응답 ' + done + '개</span></div>' +
        '<div class="bar thin" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '"><i style="width:' + (done / total * 100) + '%;--c:var(--gold)"></i></div>' +
        (q.stage !== 'baseline' && i > 0 && i === qs.findIndex(x => x.stage !== 'baseline')
          ? '<p class="small gold" style="margin:4px">여기부터는 상황 질문이에요. 그 상황이라면 실제로 어떻게 할지 골라 주세요.</p>' : '') +
        '<div class="panel dialog" aria-live="polite"><span class="tl">' + (q.stage === 'baseline' ? '생활 습관' + (q.window ? ' · ' + U.esc(q.window) : '') : '상황') + '</span>' + U.esc(q.situation) + '</div>' +
        '<div role="group" aria-label="선택지">' +
        order.map((ci, k) => '<button class="btn choice" data-ci="' + ci + '" aria-pressed="' + (ans === ci) + '"><span class="key">' + (k + 1) + '.</span><span>' + U.esc(q.choices[ci].text) + '</span></button>').join('') +
        '</div>' +
        '<div class="row" style="margin-top:12px"><button class="btn ghost grow" data-nav="prev" ' + (i === 0 ? 'disabled' : '') + '>◀ 이전</button>' +
        (!last
          ? '<button class="btn grow" data-nav="next" ' + (Number.isInteger(ans) ? '' : 'disabled') + '>다음 ▶</button>'
          : '<button class="btn gold grow" data-nav="finish" ' + (complete() ? '' : 'disabled') + '>결과 보기 ★</button>') +
        '</div>' +
        (last && !complete() && qs.some(x => !answered(x)) ? '<p class="small muted center">아직 답하지 않은 질문이 ' + qs.filter(x => !answered(x)).length + '개 있어요. <button class="btn sm ghost" data-nav="first-missing">이동</button></p>' : '') +
        (adaptive && i === 0 ? '<p class="small muted center" style="margin:6px 0 0">답에 따라 다음 질문이 골라져요 (모두 ' + total + '문항).</p>' : '') +
        (q.stage === 'baseline'
          ? '<p class="notice">최근에 실제로 한 만큼 골라 주세요. 하고 싶은 만큼이 아니라 해 온 만큼이에요. 생활 습관의 자기보고일 뿐, 능력이나 사람됨을 평가하지 않습니다.</p>'
          : '<p class="notice">정답은 없어요. 지금의 나와 가장 가까운 행동을 골라 주세요. 이 진단은 게임용 성향 표현이며 실제 능력·도덕성을 판정하지 않습니다.</p>') +
        '</div>';
    }
    function go(n) {
      if (adaptive && n >= list().length) opts.extend();    // 다음 질문이 아직 안 정해졌으면 지금까지의 답으로 고름
      qs = list();
      i = U.clamp(n, 0, qs.length - 1); opts.onCursor && opts.onCursor(i); render();
    }
    root.onclick = e => {
      const c = e.target.closest('[data-ci]');
      if (c) {
        const q = qs[i];
        opts.answers[q.id] = parseInt(c.dataset.ci, 10);
        opts.onAnswer && opts.onAnswer(q.id, opts.answers[q.id], i);
        root.querySelectorAll('[data-ci]').forEach(b => b.setAttribute('aria-pressed', b === c));
        c.classList.add('pressed');
        setTimeout(() => { if (i < total - 1) go(i + 1); else render(); }, 200);
        return;
      }
      const n = e.target.closest('[data-nav]'); if (!n) return;
      if (n.dataset.nav === 'prev') go(i - 1);
      if (n.dataset.nav === 'next') go(i + 1);
      if (n.dataset.nav === 'first-missing') go(qs.findIndex(x => !answered(x)));
      if (n.dataset.nav === 'finish') {
        if (!complete()) { const k = qs.findIndex(x => !answered(x)); if (k >= 0) go(k); toast('모든 질문에 답해야 용사가 탄생해요.', true); return; }
        opts.onDone();
      }
    };
    root.onkeydown = e => {
      if (e.target.closest('input,textarea')) return;
      const k = parseInt(e.key, 10);
      if (k >= 1 && k <= 5) { const b = root.querySelectorAll('[data-ci]')[k - 1]; if (b) b.click(); }
    };
    render();
  }

  // ---------- 결과 이미지 (PNG) ----------
  // art: 그릴 그림 캔버스 (브로치 초상화 프레임 또는 보석). legend: { ids, seed } 를 주면 브로치 4색 줄을 그린다
  function resultCanvas(name, result, art, subtitle, legend) {
    const W = 720, H = 1280, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const font = getComputedStyle(document.body).fontFamily;
    x.fillStyle = '#0a0920'; x.fillRect(0, 0, W, H);
    const r = U.rng(11);
    for (let i = 0; i < 160; i++) { x.fillStyle = r() > 0.8 ? '#cfd6ff' : '#3a357a'; const s = r() > 0.9 ? 4 : 2; x.fillRect(Math.floor(r() * W / 2) * 2, Math.floor(r() * H / 2) * 2, s, s); }
    // 프레임
    x.fillStyle = '#05041a'; x.fillRect(24, 24, W - 48, H - 48);
    x.fillStyle = '#1a1645'; x.fillRect(32, 32, W - 64, H - 64);
    x.fillStyle = '#5145a8'; x.fillRect(32, 32, W - 64, 6);
    x.textAlign = 'center'; x.fillStyle = '#ffd76a'; x.font = '700 24px ' + font; x.fillText('용사 키우기 · BRAVE MAKER', W / 2, 92);
    x.fillStyle = '#ffffff'; x.font = '700 46px ' + font; x.fillText('용사 ' + name, W / 2, 154);
    x.fillStyle = '#a9a2d6'; x.font = '22px ' + font; x.fillText(subtitle || '200 / 200 초기 포인트', W / 2, 192);
    // 그림: 정수 배율로 (도트가 고르게)
    const k = Math.max(1, Math.floor(Math.min(600 / art.width, 510 / art.height))), aw = art.width * k, ah = art.height * k, ax = Math.round((W - aw) / 2), ay = 214;
    if (legend) {   // 초상화 액자
      x.fillStyle = '#05041a'; x.fillRect(ax - 12, ay - 12, aw + 24, ah + 24);
      const g = x.createLinearGradient(0, ay, 0, ay + ah); g.addColorStop(0, '#231d5a'); g.addColorStop(1, '#120f33');
      x.fillStyle = g; x.fillRect(ax - 8, ay - 8, aw + 16, ah + 16);
      x.fillStyle = '#5145a8'; x.fillRect(ax - 8, ay - 8, aw + 16, 4); x.fillRect(ax - 8, ay - 8, 4, ah + 16);
      x.fillStyle = '#110d33'; x.fillRect(ax - 8, ay + ah + 4, aw + 16, 4); x.fillRect(ax + aw + 4, ay - 8, 4, ah + 16);
    }
    x.drawImage(art, ax, ay, aw, ah);
    let y = ay + ah + (legend ? 52 : 30);
    x.font = '700 24px ' + font;
    if (legend) {
      const top = legend.ids.slice(0, BM.CONFIG.gem.colorCount), pct = BM.brooch.percents(BM.gem.statRatios(legend.stats, top) || BM.gem.ratios(legend.seed, top.length));
      const line = '브로치 보석  ' + top.map((id, i) => BM.STAT[id].name + ' ' + pct[i] + '%').join(' · ');
      for (let fs = 24; fs >= 14; fs--) { x.font = '700 ' + fs + 'px ' + font; if (x.measureText(line).width <= W - 112) break; }
      x.fillStyle = '#ffffff'; x.fillText(line, W / 2, y); y += 36;
    } else {
      x.fillStyle = '#ffffff'; x.fillText('고유 보석의 빛: ' + result.top3.map(id => BM.STAT[id].name).join(' · '), W / 2, y); y += 36;
    }
    x.textAlign = 'left';
    BM.STATS.forEach((s, k) => {
      const col = k % 2, row = Math.floor(k / 2);
      const bx = 64 + col * 304, by = y + 14 + row * 62;
      const v = result.points[s.id], cap = s.rare ? 10 : 60;
      x.fillStyle = s.id === 'esteem' ? '#b9b6d6' : s.color; x.font = '700 22px ' + font; x.fillText(s.name, bx, by + 20);
      x.fillStyle = '#ffffff'; x.textAlign = 'right'; x.fillText(String(Math.floor(v)), bx + 272, by + 20); x.textAlign = 'left';
      x.fillStyle = '#05041a'; x.fillRect(bx, by + 30, 272, 14);
      x.fillStyle = s.id === 'esteem' ? '#6f6a9e' : s.color; x.fillRect(bx + 2, by + 32, Math.round(268 * v / cap), 10);
      x.fillStyle = 'rgba(255,255,255,0.3)'; x.fillRect(bx + 2, by + 32, Math.round(268 * v / cap), 3);
    });
    x.textAlign = 'center'; x.fillStyle = '#6d66a3'; x.font = '18px ' + font;
    x.fillText('게임용 성향 진단이며 실제 능력·인격·도덕성의 평가가 아닙니다.', W / 2, H - 64);
    return c;
  }
  function savePNG(canvas, filename) {
    return new Promise(res => {
      const done = async blob => {
        if (blob && BM.cloud && BM.cloud.hasDownloads()) {
          // claude.ai 링크 안: 일반 다운로드가 막혀 있어 저장 확인 창으로 내보낸다
          if (await BM.cloud.saveFile(filename, blob)) return res(true);
        } else if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        }
        // iOS 등에서 다운로드가 막혀도 길게 눌러 저장할 수 있게 미리보기 제공
        modal('<h2>결과 이미지</h2><p class="small muted">저장이 안 되면 이미지를 길게 눌러 사진에 저장하세요.</p><img class="px" alt="진단 결과 이미지" style="width:100%;height:auto" src="' + canvas.toDataURL('image/png') + '"><button class="btn block" data-x="close">닫기</button>',
          (m, close) => m.addEventListener('click', e => { if (e.target.closest('[data-x]')) close(); }));
        res(!!blob);
      };
      try { canvas.toBlob(done, 'image/png'); } catch (e) { done(null); }
    });
  }

  return { $, starfield, toast, modal, confirmBox, gemSpec, mountGem, LOOK_NAME, DEMO, lookPicker, saveResultPNG, broochSpec, mountBrooch, heroCard, broochLegend, chips, auraLines, statRows, hydrateGems, quiz, resultCanvas, savePNG };
})();
