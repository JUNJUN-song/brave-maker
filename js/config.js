/* BRAVE MAKER — 조정 가능한 모든 수치. 임의로 정한 값은 docs/NOTES.md 에 이유와 함께 정리되어 있다. */
window.BM = window.BM || {};

BM.STATS = [
  { id: 'fit',        name: '체력',   color: '#ED4656', rare: false, desc: '운동·근력·지구력' },
  { id: 'mind',       name: '지능',   color: '#398CF5', rare: false, desc: '지식·학습·사고·분석' },
  { id: 'create',     name: '창조력', color: '#A469F5', rare: false, desc: '음악·게임·콘텐츠 창작' },
  { id: 'money',      name: '경제력', color: '#F39A35', rare: false, desc: '경제관리·소득·지출' },
  { id: 'care',       name: '인격력', color: '#30C4B9', rare: false, desc: '책임·배려·존중' },
  { id: 'lead',       name: '지도력', color: '#E5BC55', rare: false, desc: '협업·조율·리더십' },
  { id: 'discipline', name: '절제력', color: '#AAB5C4', rare: false, desc: '자기통제·습관 유지' },
  { id: 'recovery',   name: '회복력', color: '#58C67A', rare: false, desc: '건강·수면·식단·휴식' },
  { id: 'charm',      name: '매력',   color: '#F17EAF', rare: true,  desc: '자기관리·종합적 성장' },
  { id: 'divine',     name: '신성력', color: '#F0F6FF', rare: true,  desc: '양심·선행·이타적 실천' },
  { id: 'esteem',     name: '자존감', color: '#292B35', rare: true,  desc: '자기신뢰·성취 축적' }
];
BM.STAT_IDS = BM.STATS.map(s => s.id);
BM.STAT = Object.fromEntries(BM.STATS.map(s => [s.id, s]));
BM.GENERAL_IDS = BM.STATS.filter(s => !s.rare).map(s => s.id);
BM.RARE_IDS = BM.STATS.filter(s => s.rare).map(s => s.id);

BM.CONFIG = {
  totalPoints: 200,
  generalInitCap: 60,
  rareCap: 10,

  scoring: {
    shrinkK: 3,      // 관찰 기회가 적은 능력치를 '평균'쪽으로 당기는 강도 (저점 오판 방지)
    gamma: 1.6,      // 성향 차이를 얼마나 또렷하게 벌릴지
    minFill: 0.1     // 최저 채움률: 일반 6점, 희귀 1점
  },

  gem: {
    colorCount: 4,          // 보석에 반영하는 상위 능력치 수 (3 → 5 → 4, 2026-11-13 사용자: "4가지의 색으로", 브로치와 같은 4색·같은 비율)
    // 색 수별 비율. 정규화 후에도 각 순위가 범위 안에 들도록 시드 고정으로 뽑는다.
    // 예전에 3색으로 저장된 보석(초기 결과)은 3색 비율로 그대로 그린다.
    ratios: {
      3: { base: [0.40, 0.35, 0.25], range: [[0.38, 0.42], [0.33, 0.36], [0.24, 0.28]] },
      // 브로치(캐릭터 목걸이) 4색: 사용자 요청 50:30:20:10 을 합 100%로 맞춤 (2026-11-13)
      4: { base: [0.4545, 0.2727, 0.1818, 0.0910], range: [[0.435, 0.475], [0.255, 0.29], [0.165, 0.20], [0.08, 0.105]] },
      // 1위 색이 확실히 주인공이 되도록 (2026-11-12 사용자 요청: 1위 50 / 2위 20 / 3위 10 내외)
      5: { base: [0.50, 0.20, 0.12, 0.10, 0.08], range: [[0.48, 0.52], [0.18, 0.22], [0.10, 0.14], [0.08, 0.12], [0.06, 0.10]] }
    },
    frames: 12,
    frameMs: 110
  },

  xp: { done: 10, try: 4, rest: 0, miss: 0 },
  general: { done: 1, try: 0.25, miss: -1, maxMissPenaltyPerStatPerDay: 1 },
  exerciseBonus: 0.10,                      // 운동 완료일, 실제 수행한 다른 수련 XP +10%
  // 운동 수련을 '완료'하면 연결 능력치와 함께 이 능력치들도 오른다 (시도·미수행에는 적용하지 않음)
  // 매력·자존감은 운동이 '꾸준함형'이라 아래 growth.habit 규칙으로 오른다 (2026-11-13)
  exerciseStats: ['fit', 'discipline'],

  // 성장 방식 (2026-11-13 사용자 요청: "정말 인간이 성장하는 방식과 비슷하게")
  //  - 꾸준함형(habit: 운동·식단·창작·학습): 효과는 '최근 4주 꾸준함'에 비례해 커진다. 처음 ×0.8 → 4주 꾸준히 ×1.6
  //    (보통 수련 +1 보다 결국 더 크게 오르지만, 꾸준해야 드러남. 쉬면 꾸준함이 줄어 다시 쌓아야 함)
  //    매력·자존감도 꾸준함에 비례해 오른다: 처음 0.3회분 → 4주 꾸준히 1.3회분
  //  - 바로 반영형(instant: 샤워·피부관리): 완료하면 바로 매력 1회분 + 자존감 0.5회분. 2일 연속 놓치면 매력 하락
  //  - 보통(normal): 예전 규칙 그대로 (완료 +1)
  growth: {
    windowDays: 28,                         // 꾸준함을 보는 기간: 최근 4주
    // 꾸준함형 미수행은 -0.5 (하루 안 했다고 실력이 줄진 않음 — 대신 꾸준함이 줄어 이후 효과가 작아지는 게 진짜 손해)
    habit: { min: 0.8, max: 1.6, rareMin: 0.3, rareMax: 1.3, missPenalty: 0.5 },
    instant: { charm: 1, esteem: 0.5 },
    // 하루에 반영되는 매력·자존감 상승 횟수 상한. 스펙 밸런스(2) 유지 → 매우 꾸준하면 12주에 약 8, 5~6개월에 10
    rareMaxEvents: { charm: 2, esteem: 2 }
  },
  // 연속 달성 [일수, XP 배율] — 마스터 스펙 초기 밸런스 참고값
  disciplineStreak: [[3, 1.05], [7, 1.10], [21, 1.20], [40, 1.35], [100, 1.50], [365, 1.75]],
  rareStreakAmplify: 2,                     // 희귀 상승에는 연속 보너스를 2배로 반영: 1 + 2*(배율-1)

  rare: {
    // 구간별 [완료 1회 상승, 미수행 1회 하락] — 마스터 스펙 8장 초기 밸런스 후보
    bands: [
      { below: 5,  gain: 0.02, loss: 0.12 },
      { below: 8,  gain: 0.03, loss: 0.04 },
      { below: 10, gain: 0.01, loss: 0.04 },
      { below: Infinity, gain: 0, loss: 0.04 }
    ],
    tryFactor: 0.5,             // 시도는 완료 상승량의 50%
    maxEventsPerDay: 2,         // 한 희귀 능력치에 하루 반영되는 완료 횟수 상한
    charmOverallBonus: 0.5,     // 하루 수행률 80% 이상(3개 이상)이면 매력에 '종합 성장' 상승 0.5회분
    esteemGoodDayRatio: 0.6,    // 하루 수행률이 이 이상이면 자존감 상승 1회분
    esteemLowRatio: 0.34,       // 하루 수행률이 이보다 낮은 날이
    esteemLowStreakDays: 3,     // 연속 3일 이상 이어질 때부터 자존감 하락 (하루 실패는 영향 없음)
    charmMissStreakDays: 2,     // 자기관리 수련을 연속 2일 놓치면 매력 하락
    divineMissWindow: 7,        // 선행 수련 '미수행'을 7일 안에
    divineMissRepeat: 2,        // 2회 이상 반복했을 때만 신성력 하락 (기회 없음·미기록은 중립)
    idleDecayThreshold: 9,      // 9 이상에서
    idleDecayDays: 14,          // 14일 동안 해당 능력 상승이 없으면
    idleDecayPerDay: 0.02       // 하루 0.02씩 천천히 하락
  },
  dayStartHour: 4,              // 하루 경계: 새벽 4시 (그 전은 전날로 기록)

  aura: {
    longRate: 0.03,             // 장기 기록 반영 속도 (하루 3%)
    recentDays: 14,
    longWeight: 0.7,            // 장기 70% + 최근 14일 30%
    signal: { done: 1, try: 0.6, miss: 0.25 }
  },

  initialMeanFill: 200 / 510,   // 초기 평균 채움률. 성장 후 일반 능력치 정규화 기준
  level: { base: 50 },          // 레벨 n 도달 누적 XP = base * n * (n-1)
  autoMissUnrecorded: false     // 기록하지 않은 날을 미수행으로 처리할지 (기본: 처리하지 않음)
};

BM.SR_STATS = ['recovery', 'charm', 'esteem'];      // 자기존중 오오라에 영향을 주는 수련 연결
BM.AL_STATS = ['care', 'divine'];                   // 이타심 오오라에 영향을 주는 수련 연결
