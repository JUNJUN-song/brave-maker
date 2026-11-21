/* 질문 데이터 — 자동 생성 파일 (dev/import_questions.ps1). 직접 고치지 말고 원본 JSON을 고친 뒤 다시 변환할 것.
 * 원본: question_bank_v0.3_habits_first.json / question_bank_0.4.0_habits_first */
window.BM = window.BM || {};
BM.QUESTION_BANK = {
  version: 'question_bank_0.4.0_habits_first',
  choiceBudget: 5,
  mix: { habit: 0.7, scenario: 0.3 },
  questions: [
    { id: 'B01', stage: 'baseline', category: 'fit', window: '최근 4주', situation: '최근 4주 동안 일주일에 운동을 며칠 했어요?', choices: [
      { text: '0일', score: 0, na: false },
      { text: '1일', score: 1, na: false },
      { text: '2일', score: 2, na: false },
      { text: '3~4일', score: 3, na: false },
      { text: '5일 이상', score: 4, na: false }
    ] },
    { id: 'B02', stage: 'baseline', category: 'fit', window: '최근 4주', situation: '최근 4주 동안 한 번 운동할 때 보통 얼마나 움직였어요?', choices: [
      { text: '운동한 적 없음', score: 0, na: false },
      { text: '15분 미만', score: 1, na: false },
      { text: '15~29분', score: 2, na: false },
      { text: '30~59분', score: 3, na: false },
      { text: '60분 이상', score: 4, na: false }
    ] },
    { id: 'B03', stage: 'baseline', category: 'fit', window: '최근 4주', situation: '최근 4주 동안 숨이 조금 차는 걷기·유산소 활동을 얼마나 했어요?', choices: [
      { text: '거의 하지 않음', score: 0, na: false },
      { text: '월 1~3회', score: 1, na: false },
      { text: '주 1회', score: 2, na: false },
      { text: '주 2~3회', score: 3, na: false },
      { text: '주 4회 이상', score: 4, na: false }
    ] },
    { id: 'B04', stage: 'baseline', category: 'fit', window: '최근 4주', situation: '최근 4주 동안 근력 운동이나 몸을 단련하는 활동을 얼마나 했어요?', choices: [
      { text: '하지 않음', score: 0, na: false },
      { text: '월 1~3회', score: 1, na: false },
      { text: '주 1회', score: 2, na: false },
      { text: '주 2~3회', score: 3, na: false },
      { text: '주 4회 이상', score: 4, na: false }
    ] },
    { id: 'B05', stage: 'baseline', category: 'discipline', window: '최근 2주', situation: '최근 2주 동안 계획한 활동을 실제로 끝낸 날은 얼마나 돼요?', choices: [
      { text: '거의 없음', score: 0, na: false },
      { text: '가끔', score: 1, na: false },
      { text: '절반 정도', score: 2, na: false },
      { text: '대부분', score: 3, na: false },
      { text: '거의 매일', score: 4, na: false }
    ] },
    { id: 'B06', stage: 'baseline', category: 'fit', window: '최근 2주', situation: '최근 2주 동안 식사량·단백질·채소 등 식사 구성을 의식적으로 조절했어요?', choices: [
      { text: '전혀 신경 쓰지 않음', score: 0, na: false },
      { text: '생각만 해 봄', score: 1, na: false },
      { text: '가끔 조절', score: 2, na: false },
      { text: '대부분의 날 조절', score: 3, na: false },
      { text: '꾸준히 조절하고 기록/점검', score: 4, na: false }
    ] },
    { id: 'B07', stage: 'baseline', category: 'mind', window: '최근 4주', situation: '최근 4주 동안 책이나 긴 글을 읽으며 배우는 시간을 얼마나 가졌어요?', choices: [
      { text: '전혀 없음', score: 0, na: false },
      { text: '월 1~3회', score: 1, na: false },
      { text: '주 1회', score: 2, na: false },
      { text: '주 2~4회', score: 3, na: false },
      { text: '거의 매일', score: 4, na: false }
    ] },
    { id: 'B08', stage: 'baseline', category: 'mind', window: '최근 4주', situation: '최근 4주 동안 새로운 지식이나 기술을 공부한 날은 얼마나 돼요?', choices: [
      { text: '전혀 없음', score: 0, na: false },
      { text: '월 1~3회', score: 1, na: false },
      { text: '주 1회', score: 2, na: false },
      { text: '주 2~4회', score: 3, na: false },
      { text: '거의 매일', score: 4, na: false }
    ] },
    { id: 'B09', stage: 'baseline', category: 'create', window: '최근 4주', situation: '최근 4주 동안 음악·그림·글·게임·영상·요리 등 무언가를 직접 만든 날은 얼마나 돼요?', choices: [
      { text: '전혀 없음', score: 0, na: false },
      { text: '월 1~3회', score: 1, na: false },
      { text: '주 1회', score: 2, na: false },
      { text: '주 2~4회', score: 3, na: false },
      { text: '거의 매일', score: 4, na: false }
    ] },
    { id: 'B10', stage: 'baseline', category: 'create', window: '최근 4주', situation: '최근 4주 동안 창작물을 끝내거나 공개하거나 개선한 횟수는 얼마나 돼요?', choices: [
      { text: '0회', score: 0, na: false },
      { text: '1회', score: 1, na: false },
      { text: '2회', score: 2, na: false },
      { text: '3~4회', score: 3, na: false },
      { text: '5회 이상', score: 4, na: false }
    ] },
    { id: 'B11', stage: 'baseline', category: 'money', window: '최근 4주', situation: '최근 4주 동안 수입·지출·예산을 얼마나 자주 확인했어요?', choices: [
      { text: '확인하지 않음', score: 0, na: false },
      { text: '월 1회', score: 1, na: false },
      { text: '월 2~3회', score: 2, na: false },
      { text: '주 1회', score: 3, na: false },
      { text: '주 2회 이상', score: 4, na: false }
    ] },
    { id: 'B12', stage: 'baseline', category: 'charm', window: '최근 2주', situation: '최근 2주 동안 기본 위생(샤워·양치·세탁 등)을 얼마나 일정하게 챙겼어요?', choices: [
      { text: '거의 챙기지 못함', score: 0, na: false },
      { text: '일부만 가끔', score: 1, na: false },
      { text: '절반 정도의 날', score: 2, na: false },
      { text: '대부분의 날', score: 3, na: false },
      { text: '필요한 만큼 매일 꾸준히', score: 4, na: false }
    ] },
    { id: 'B13', stage: 'baseline', category: 'charm', window: '최근 2주', situation: '최근 2주 동안 피부·머리·복장 등 외모 관리를 의식적으로 챙긴 날은 얼마나 돼요?', choices: [
      { text: '없음', score: 0, na: false },
      { text: '1~2일', score: 1, na: false },
      { text: '3~5일', score: 2, na: false },
      { text: '6~10일', score: 3, na: false },
      { text: '11일 이상', score: 4, na: false }
    ] },
    { id: 'B14', stage: 'baseline', category: 'recovery', window: '최근 2주', situation: '최근 2주 동안 피곤할 때 수면이나 휴식 시간을 조정했어요?', choices: [
      { text: '전혀 조정하지 못함', score: 0, na: false },
      { text: '거의 못함', score: 1, na: false },
      { text: '가끔 조정', score: 2, na: false },
      { text: '대부분 조정', score: 3, na: false },
      { text: '필요할 때 꾸준히 조정', score: 4, na: false }
    ] },
    { id: 'B15', stage: 'baseline', category: 'esteem', window: '최근 2주', situation: '최근 2주 동안 자신의 의견이나 경계를 필요할 때 표현했어요?', choices: [
      { text: '필요한 상황이 없었음', score: null, na: true },
      { text: '거의 못함', score: 1, na: false },
      { text: '가끔 표현', score: 2, na: false },
      { text: '대부분 표현', score: 3, na: false },
      { text: '꾸준히 명확히 표현', score: 4, na: false }
    ] },
    { id: 'B16', stage: 'baseline', category: 'esteem', window: '최근 2주', situation: '최근 2주 동안 일이 잘못됐을 때 스스로를 과하게 비난하지 않고 다음 행동을 정했어요?', choices: [
      { text: '해당 상황이 없었음', score: null, na: true },
      { text: '거의 못함', score: 0, na: false },
      { text: '가끔', score: 1, na: false },
      { text: '대부분', score: 2, na: false },
      { text: '거의 항상', score: 3, na: false }
    ] },
    { id: 'B17', stage: 'baseline', category: 'care', window: '최근 4주', situation: '최근 4주 동안 주변 사람에게 안부를 묻거나 실제 도움을 준 일은 얼마나 자주 있었어요?', choices: [
      { text: '기회가 없었음', score: null, na: true },
      { text: '월 1회', score: 0, na: false },
      { text: '월 2~3회', score: 1, na: false },
      { text: '주 1~2회', score: 2, na: false },
      { text: '주 3회 이상', score: 3, na: false }
    ] },
    { id: 'B18', stage: 'baseline', category: 'divine', window: '최근 4주', situation: '최근 4주 동안 손해나 불편을 감수하더라도 자신이 옳다고 믿는 원칙을 지킨 경험이 있어요?', choices: [
      { text: '해당 상황이 없었음', score: null, na: true },
      { text: '거의 없음', score: 0, na: false },
      { text: '한두 번', score: 1, na: false },
      { text: '여러 번', score: 2, na: false },
      { text: '기회가 있을 때마다', score: 3, na: false }
    ] },
    { id: 'B19', stage: 'baseline', category: 'lead', window: '최근 4주', situation: '최근 4주 동안 모임이나 팀에서 일정·역할·문제해결을 주도한 일은 얼마나 있었어요?', choices: [
      { text: '기회가 없었음', score: null, na: true },
      { text: '거의 없음', score: 0, na: false },
      { text: '1회', score: 1, na: false },
      { text: '2~3회', score: 2, na: false },
      { text: '4회 이상', score: 3, na: false }
    ] },
    { id: 'B20', stage: 'baseline', category: 'recovery', window: '최근 2주', situation: '최근 2주 동안 하루를 마치고 충분히 회복했다고 느낀 날은 얼마나 돼요?', choices: [
      { text: '거의 없음', score: 0, na: false },
      { text: '1~2일', score: 1, na: false },
      { text: '3~5일', score: 2, na: false },
      { text: '6~10일', score: 3, na: false },
      { text: '11일 이상', score: 4, na: false }
    ] },
    { id: 'Q01', stage: 'scenario', category: 'mixed', situation: '늦은 밤 양치하려고 보니 치약이 다 떨어졌어요. 어떻게 할까요?', choices: [
      { text: '지금 편의점에 가서 치약을 사 온다.', w: { discipline: 3, charm: 2 }, sr: 2, al: 0, tag: null },
      { text: '오늘은 다른 방법으로 양치하고 내일 산다.', w: { mind: 2, recovery: 2, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '집에 여분이 있는지 찾아보거나 가까운 사람에게 조금 빌린다.', w: { mind: 2, care: 1, charm: 1 }, sr: 0, al: 1, tag: null },
      { text: '다음에 장 볼 때 같이 산다.', w: { money: 2, recovery: 1 }, sr: -1, al: 0, tag: null }
    ] },
    { id: 'Q02', stage: 'scenario', category: 'mixed', situation: '주말에 갑자기 세 시간의 자유시간이 생겼어요.', choices: [
      { text: '가볍게 운동하거나 산책한다.', w: { fit: 4, recovery: 1 }, sr: 2, al: 0, tag: null },
      { text: '하던 창작이나 제작 작업을 이어서 한다.', w: { create: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '책이나 새로운 기술을 공부한다.', w: { mind: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '친구나 가족을 만나러 간다.', w: { care: 3, lead: 2 }, sr: 0, al: 2, tag: null },
      { text: '낮잠이나 반신욕으로 푹 쉬며 몸을 회복한다.', w: { recovery: 4 }, sr: 2, al: 0, tag: null },
      { text: '뭘 할지 정하지 못한 채 시간이 그냥 지나간다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q03', stage: 'scenario', category: 'mixed', situation: '배달된 택배가 이웃집 물건인 걸 알았어요.', choices: [
      { text: '문 앞에 직접 가져다 둔다.', w: { care: 3, divine: 2 }, sr: 0, al: 2, tag: null },
      { text: '관리실이나 배송업체에 잘못 왔다고 연락한다.', w: { mind: 2, discipline: 2, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '이웃에게 연락할 수 있는 방법을 찾아본다.', w: { lead: 2, care: 2 }, sr: 0, al: 2, tag: null },
      { text: '택배 기사에게 연락해 수거를 부탁한다.', w: { mind: 1, discipline: 2 }, sr: 0, al: 1, tag: null }
    ] },
    { id: 'Q04', stage: 'scenario', category: 'mixed', situation: '마음에 드는 옷을 발견했는데 원래 사려던 건 아니에요.', choices: [
      { text: '입어 보고 마음에 들면 구매한다.', w: { charm: 3, money: 1 }, sr: 1, al: 0, tag: null },
      { text: '집에 비슷한 옷이 있는지 떠올리고 결정한다.', w: { money: 3, mind: 2 }, sr: 1, al: 0, tag: null },
      { text: '가격과 소재를 비교해 본 다음 결정한다.', w: { mind: 2, money: 3 }, sr: 1, al: 0, tag: null },
      { text: '사진만 찍어 두고 나중에 다시 생각한다.', w: { discipline: 3, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q05', stage: 'scenario', category: 'mixed', situation: '오랜만에 찍힌 내 사진이 생각보다 마음에 들지 않아요.', choices: [
      { text: '다음에는 옷과 머리 스타일을 조금 바꿔 본다.', w: { charm: 4, create: 1 }, sr: 2, al: 0, tag: null },
      { text: '사진이 전부는 아니니 크게 신경 쓰지 않는다.', w: { esteem: 3, recovery: 2 }, sr: 2, al: 0, tag: null },
      { text: '다른 사진과 비교하며 어떤 차이가 있는지 살펴본다.', w: { mind: 2, charm: 2 }, sr: 1, al: 0, tag: null },
      { text: '잘 나온 사진을 골라 보관한다.', w: { esteem: 2, create: 1 }, sr: 1, al: 0, tag: null }
    ] },
    { id: 'Q06', stage: 'scenario', category: 'mixed', situation: '운동하러 나갈 시간에 비가 많이 쏟아지기 시작했어요.', choices: [
      { text: '예정대로 실내 운동 장소로 간다.', w: { fit: 4, discipline: 3 }, sr: 1, al: 0, tag: null },
      { text: '집에서 할 수 있는 운동으로 바꾼다.', w: { fit: 3, mind: 2, discipline: 2 }, sr: 2, al: 0, tag: null },
      { text: '내일로 계획을 조정하고 오늘은 쉰다.', w: { recovery: 3, discipline: 1 }, sr: 2, al: 0, tag: null },
      { text: '운동 대신 미뤄둔 집안일을 한다.', w: { discipline: 2, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '운동은 건너뛰고 다시 일정을 잡지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q07', stage: 'scenario', category: 'mixed', situation: '새로운 기술을 배우는데 설명이 이해되지 않아요.', choices: [
      { text: '관련 자료부터 다시 찾아 읽는다.', w: { mind: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '잘 아는 사람에게 직접 물어본다.', w: { mind: 2, lead: 2, care: 1 }, sr: 1, al: 1, tag: null },
      { text: '예제를 직접 실행하면서 익힌다.', w: { mind: 2, create: 3 }, sr: 1, al: 0, tag: null },
      { text: '잠시 쉬었다가 처음부터 다시 본다.', w: { recovery: 2, mind: 2 }, sr: 2, al: 0, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q08', stage: 'scenario', category: 'mixed', situation: '현금이 들어 있는 지갑을 길에서 발견했어요.', choices: [
      { text: '가까운 경찰서나 분실물 센터로 가져간다.', w: { divine: 4, discipline: 1 }, sr: 0, al: 3, tag: null },
      { text: '연락처를 확인해 주인에게 돌려줄 방법을 찾는다.', w: { care: 3, mind: 2, divine: 2 }, sr: 0, al: 3, tag: null },
      { text: '주변에 누가 잃어버렸는지 물어본다.', w: { lead: 2, care: 3, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '현장을 건드리지 않고 시설 관리인에게 알린다.', w: { mind: 2, discipline: 2, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '확인만 하고 그 자리에 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' },
      { text: '지갑 속 현금은 내가 갖는다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q09', stage: 'scenario', category: 'mixed', situation: '친구가 급하게 돈을 빌려 달라고 하는데 상환 시점은 확실하지 않아요.', choices: [
      { text: '친구를 믿고 요청한 금액을 빌려준다.', w: { care: 3, divine: 2 }, sr: -1, al: 3, tag: null },
      { text: '감당할 수 있는 금액을 정해 그 안에서 돕는다.', w: { money: 3, discipline: 2, care: 2 }, sr: 2, al: 2, tag: null },
      { text: '돈 이외에 도움이 될 다른 방법을 찾아본다.', w: { mind: 2, care: 3, lead: 1 }, sr: 2, al: 2, tag: null },
      { text: '상황을 설명하고 금전 거래는 하지 않는다.', w: { money: 3, discipline: 2, esteem: 1 }, sr: 2, al: 0, tag: null }
    ] },
    { id: 'Q10', stage: 'scenario', category: 'mixed', situation: '내일 아침 일정이 있는데 오늘 하던 작업이 아직 끝나지 않았어요.', choices: [
      { text: '끝날 때까지 작업하고 잔다.', w: { create: 3, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '핵심 부분을 마무리하고 정해진 시간에 잔다.', w: { discipline: 3, recovery: 2, mind: 1 }, sr: 2, al: 0, tag: null },
      { text: '내일 할 목록을 적고 바로 잔다.', w: { recovery: 4, mind: 2 }, sr: 2, al: 0, tag: null },
      { text: '지금은 다른 일을 잠깐 하며 기분을 전환한다.', w: { recovery: 2, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q11', stage: 'scenario', category: 'mixed', situation: '평소 사고 싶었던 전자기기가 할인을 시작했어요.', choices: [
      { text: '필요한 기능이 충분하면 구매한다.', w: { mind: 2, money: 1 }, sr: 1, al: 0, tag: null },
      { text: '가격 변동과 다른 모델을 더 찾아본다.', w: { mind: 3, money: 3 }, sr: 1, al: 0, tag: null },
      { text: '이번 달 예산과 우선순위를 확인한다.', w: { money: 4, discipline: 2 }, sr: 2, al: 0, tag: null },
      { text: '며칠 사용 후기만 읽어 보고 결정한다.', w: { mind: 3, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q12', stage: 'scenario', category: 'mixed', situation: '함께 일하는 팀에서 한 사람이 실수해 일정이 늦어졌어요.', choices: [
      { text: '우선 내가 할 수 있는 부분부터 처리한다.', w: { discipline: 3, lead: 2 }, sr: 1, al: 1, tag: null },
      { text: '작업을 다시 나눠서 전체 계획을 조정한다.', w: { lead: 4, mind: 2 }, sr: 1, al: 1, tag: null },
      { text: '실수한 사람과 함께 해결 방법을 찾는다.', w: { care: 3, lead: 2, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '내 맡은 일을 마치고 상황을 확인한다.', w: { discipline: 3, create: 1 }, sr: 1, al: 0, tag: null }
    ] },
    { id: 'Q13', stage: 'scenario', category: 'mixed', situation: '오랫동안 만든 작품을 공개했는데 반응이 거의 없어요.', choices: [
      { text: '새 작품의 첫 부분을 바로 만들어 본다.', w: { create: 4, esteem: 2 }, sr: 2, al: 0, tag: null },
      { text: '완성한 작품을 고칠 곳이 있는지 분석한다.', w: { mind: 3, create: 2 }, sr: 1, al: 0, tag: null },
      { text: '몇 사람에게 구체적으로 피드백을 부탁한다.', w: { lead: 2, create: 2, care: 1 }, sr: 1, al: 1, tag: null },
      { text: '잠시 다른 취미를 즐기며 거리를 둔다.', w: { recovery: 3, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '실망해서 작업을 접어 버린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q14', stage: 'scenario', category: 'mixed', situation: '관심 있는 사람이 약속을 취소했어요. 다음 날짜는 아직 없어요.', choices: [
      { text: '괜찮다고 말하고 상대가 연락할 때까지 기다린다.', w: { care: 2, discipline: 2, esteem: 2 }, sr: 2, al: 1, tag: null },
      { text: '다른 날 가능한지 한 번 물어본다.', w: { lead: 2, care: 1, esteem: 1 }, sr: 1, al: 1, tag: null },
      { text: '다른 일정을 잡고 내 생활을 이어 간다.', w: { recovery: 2, esteem: 3 }, sr: 2, al: 0, tag: null },
      { text: '며칠 뒤 가고 싶던 장소를 다시 제안한다.', w: { lead: 2, esteem: 2, care: 1 }, sr: 1, al: 1, tag: null },
      { text: '답장하지 않고 연락이 끊긴 채로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q15', stage: 'scenario', category: 'mixed', situation: '바쁜 하루를 보내고 집에 왔어요. 잠들기 전 씻는 일이 귀찮게 느껴져요.', choices: [
      { text: '평소처럼 샤워하고 피부관리까지 한다.', w: { charm: 4, discipline: 2 }, sr: 3, al: 0, tag: null },
      { text: '간단히 씻고 바로 잔다.', w: { charm: 2, recovery: 2 }, sr: 2, al: 0, tag: null },
      { text: '조금 쉬었다가 필요한 만큼 씻는다.', w: { recovery: 2, charm: 2 }, sr: 2, al: 0, tag: null },
      { text: '오늘은 일단 바로 잔다.', w: { recovery: 3 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q16', stage: 'scenario', category: 'mixed', situation: '피부 관리 제품을 꾸준히 사용했는데 뚜렷한 변화가 없는 것 같아요.', choices: [
      { text: '사용 기록을 확인하고 관리 방법을 조정한다.', w: { charm: 3, mind: 2 }, sr: 2, al: 0, tag: null },
      { text: '제품 설명을 더 찾아보고 필요하면 상담을 받는다.', w: { mind: 3, charm: 2 }, sr: 2, al: 0, tag: null },
      { text: '지금의 간단한 관리를 그대로 유지한다.', w: { charm: 3, discipline: 2 }, sr: 2, al: 0, tag: null },
      { text: '일단 쉬면서 피부 상태를 지켜본다.', w: { recovery: 3, charm: 1 }, sr: 2, al: 0, tag: null },
      { text: '관리를 그만두고 더는 신경 쓰지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q17', stage: 'scenario', category: 'mixed', situation: '혼자 점심을 먹으려고 해요. 마침 마음에 드는 식당이 여럿 있어요.', choices: [
      { text: '평소 먹고 싶던 메뉴가 있는 곳으로 간다.', w: { esteem: 2, recovery: 2 }, sr: 2, al: 0, tag: null },
      { text: '식사와 오후 활동을 고려해 메뉴를 고른다.', w: { fit: 2, mind: 2 }, sr: 2, al: 0, tag: null },
      { text: '예산 안에서 만족할 만한 곳을 고른다.', w: { money: 3, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '친구에게 추천받은 곳에 가 본다.', w: { care: 1, create: 2 }, sr: 1, al: 1, tag: null }
    ] },
    { id: 'Q18', stage: 'scenario', category: 'mixed', situation: '체중이나 체력이 생각처럼 변하지 않는 시기가 왔어요.', choices: [
      { text: '지금의 운동 계획을 조금 더 지속해 본다.', w: { fit: 3, discipline: 2 }, sr: 2, al: 0, tag: null },
      { text: '운동량과 식사, 휴식 기록을 함께 살펴본다.', w: { fit: 2, mind: 3, recovery: 1 }, sr: 2, al: 0, tag: null },
      { text: '목표를 현실에 맞게 다시 조정한다.', w: { mind: 2, recovery: 3, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '새로운 운동 방식을 배우거나 시도한다.', w: { fit: 2, create: 2, mind: 1 }, sr: 2, al: 0, tag: null },
      { text: '의욕이 떨어져 운동을 손에서 놓는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q19', stage: 'scenario', category: 'mixed', situation: '새로운 일에 도전할 기회가 생겼는데 익숙하지 않은 분야예요.', choices: [
      { text: '작은 프로젝트부터 직접 해 본다.', w: { create: 3, esteem: 2 }, sr: 2, al: 0, tag: null },
      { text: '필요한 지식을 조사한 뒤 결정한다.', w: { mind: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '경험 있는 사람에게 먼저 의견을 듣는다.', w: { care: 1, mind: 2, lead: 2 }, sr: 1, al: 1, tag: null },
      { text: '현재 하던 일을 더 안정적으로 발전시킨다.', w: { discipline: 2, money: 2, recovery: 1 }, sr: 2, al: 0, tag: null },
      { text: '고민만 하다가 기회를 흘려보낸다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q20', stage: 'scenario', category: 'mixed', situation: '길에서 무거운 짐을 들고 곤란해하는 사람을 봤어요. 내 시간은 10분 정도 여유 있어요.', choices: [
      { text: '가까이 가서 도움이 필요한지 물어본다.', w: { divine: 3, care: 3 }, sr: 0, al: 3, tag: null },
      { text: '짐을 옮길 수 있는 도구나 도움을 받을 곳을 알려준다.', w: { mind: 2, lead: 2, divine: 2 }, sr: 1, al: 2, tag: null },
      { text: '상황을 조금 살핀 뒤 도움을 요청하면 돕는다.', w: { care: 2, recovery: 1, divine: 1 }, sr: 1, al: 1, tag: null },
      { text: '지금 내 일정을 지키면서 지나간다.', w: { discipline: 2, recovery: 1 }, sr: 2, al: 0, tag: null }
    ] },
    { id: 'Q21', stage: 'scenario', category: 'mixed', situation: '친한 사람이 다른 사람에 대해 근거 없는 이야기를 하고 있어요.', choices: [
      { text: '어떤 근거가 있는지 먼저 물어본다.', w: { mind: 2, care: 2, divine: 1 }, sr: 1, al: 2, tag: null },
      { text: '그 사람이 없는 곳에서 단정하지 말자고 한다.', w: { divine: 3, care: 2 }, sr: 0, al: 3, tag: null },
      { text: '이야기를 듣되 판단을 유보한다.', w: { mind: 3, discipline: 1 }, sr: 1, al: 1, tag: null },
      { text: '다른 주제로 자연스럽게 대화를 돌린다.', w: { care: 2, lead: 2 }, sr: 1, al: 1, tag: null }
    ] },
    { id: 'Q22', stage: 'scenario', category: 'mixed', situation: '내가 좋아하는 옷을 입었는데 친구가 어울리지 않는다고 말했어요.', choices: [
      { text: '다른 옷을 입고 다시 나와 본다.', w: { charm: 3, care: 1 }, sr: 1, al: 0, tag: null },
      { text: '이유를 물어본 뒤 내 취향과 비교한다.', w: { mind: 2, charm: 2, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '나는 마음에 들어서 그대로 입는다.', w: { esteem: 4, charm: 1 }, sr: 3, al: 0, tag: null },
      { text: '다른 친구에게도 사진을 보내 의견을 구한다.', w: { care: 1, mind: 1, charm: 2 }, sr: 1, al: 1, tag: null },
      { text: '아무 말 못 하고 넘기지만 하루 종일 마음에 걸린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q23', stage: 'scenario', category: 'mixed', situation: '어떤 날은 이유 없이 기운이 떨어지고 집중도 잘되지 않아요.', choices: [
      { text: '오늘 할 일 중 꼭 필요한 한 가지만 한다.', w: { discipline: 2, recovery: 2, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '가벼운 산책이나 스트레칭을 해 본다.', w: { fit: 2, recovery: 3 }, sr: 2, al: 0, tag: null },
      { text: '쉬는 시간을 정하고 회복에 집중한다.', w: { recovery: 4, esteem: 1 }, sr: 3, al: 0, tag: null },
      { text: '친한 사람과 연락해 이야기를 나눈다.', w: { care: 2, recovery: 2 }, sr: 1, al: 1, tag: null }
    ] },
    { id: 'Q24', stage: 'scenario', category: 'mixed', situation: '가까운 사람이 힘든 일을 겪고 있어요. 내 일정도 꽉 차 있어요.', choices: [
      { text: '오늘 잠깐 시간을 내 직접 찾아간다.', w: { care: 3, divine: 3 }, sr: 0, al: 3, tag: null },
      { text: '전화를 걸어 이야기를 듣는다.', w: { care: 3, divine: 2 }, sr: 1, al: 3, tag: null },
      { text: '필요한 일을 물어보고 가능한 시간에 돕는다.', w: { lead: 2, divine: 2, discipline: 1 }, sr: 2, al: 3, tag: null },
      { text: '지금은 짧은 안부를 전하고 나중에 시간을 잡는다.', w: { recovery: 2, care: 2 }, sr: 2, al: 2, tag: null }
    ] },
    { id: 'Q25', stage: 'scenario', category: 'mixed', situation: '이번 달 여유 자금이 생겼어요. 생활에 필요한 지출은 이미 끝났어요.', choices: [
      { text: '평소 원하던 미용·패션 관리에 사용한다.', w: { charm: 3, esteem: 2 }, sr: 2, al: 0, tag: null },
      { text: '가족이나 친한 사람과 함께하는 일에 쓴다.', w: { care: 3, divine: 2 }, sr: 1, al: 3, tag: null },
      { text: '저축하거나 장기적인 계획에 더한다.', w: { money: 4, discipline: 2 }, sr: 2, al: 0, tag: null },
      { text: '배우거나 제작하고 싶던 것에 투자한다.', w: { create: 3, mind: 2 }, sr: 1, al: 0, tag: null },
      { text: '따로 정하지 않아 어느새 흐지부지 써 버린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q26', stage: 'scenario', category: 'mixed', situation: '함께 만든 프로젝트에서 다른 사람이 대부분의 칭찬을 받았어요.', choices: [
      { text: '내 기여를 분명하게 설명할 기회를 만든다.', w: { esteem: 3, lead: 2 }, sr: 3, al: 0, tag: null },
      { text: '함께한 사람들을 축하하고 다음 프로젝트를 준비한다.', w: { care: 2, create: 2, divine: 1 }, sr: 1, al: 2, tag: null },
      { text: '왜 그렇게 평가됐는지 살펴본다.', w: { mind: 3, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '팀원들과 각자의 역할을 정리해 공유한다.', w: { lead: 3, care: 2 }, sr: 2, al: 2, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q27', stage: 'scenario', category: 'mixed', situation: '이번 주 목표를 달성하지 못했어요. 다음 주는 어떻게 시작할까요?', choices: [
      { text: '같은 목표에 다시 도전한다.', w: { discipline: 4, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '못한 이유를 기록하고 방법을 바꾼다.', w: { mind: 3, discipline: 2, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '목표를 더 작은 단계로 쪼개서 시작한다.', w: { mind: 2, recovery: 2, discipline: 2 }, sr: 3, al: 0, tag: null },
      { text: '잠시 다른 목표에 집중해 본다.', w: { create: 2, recovery: 2 }, sr: 2, al: 0, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q28', stage: 'scenario', category: 'mixed', situation: '사람이 많지 않은 공원 벤치 주변에 쓰레기가 떨어져 있어요.', choices: [
      { text: '가까운 쓰레기통에 버린다.', w: { divine: 3, care: 2 }, sr: 0, al: 3, tag: null },
      { text: '관리하는 분에게 상황을 알려드린다.', w: { lead: 2, care: 2, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '내 쓰레기를 먼저 정리하고 자리를 떠난다.', w: { discipline: 2, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '주변 청소 활동이 있는지 알아본다.', w: { mind: 2, divine: 2, lead: 1 }, sr: 0, al: 2, tag: null }
    ] },
    { id: 'Q29', stage: 'scenario', category: 'mixed', situation: '친구들이 새로운 모임을 만들자고 해요. 준비할 일은 조금 있어요.', choices: [
      { text: '모임 일정과 장소를 직접 정리한다.', w: { lead: 4, discipline: 1 }, sr: 1, al: 1, tag: null },
      { text: '모두의 의견을 받아보는 역할을 맡는다.', w: { care: 3, lead: 2 }, sr: 1, al: 2, tag: null },
      { text: '음식이나 준비물을 맡아 돕는다.', w: { care: 2, divine: 1, discipline: 2 }, sr: 1, al: 2, tag: null },
      { text: '일정이 맞으면 참석하고 편하게 즐긴다.', w: { recovery: 2, care: 1 }, sr: 2, al: 1, tag: null },
      { text: '아무것도 하지 않고 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q30', stage: 'scenario', category: 'mixed', situation: '하루를 마무리하면서 오늘 가장 마음에 남는 순간을 하나 고른다면요?', choices: [
      { text: '계획했던 일을 내 힘으로 끝낸 순간.', w: { discipline: 3, esteem: 2 }, sr: 2, al: 0, tag: null },
      { text: '모르는 것을 새롭게 이해한 순간.', w: { mind: 3, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '누군가와 마음을 나누거나 도움을 준 순간.', w: { divine: 3, care: 3 }, sr: 1, al: 3, tag: null },
      { text: '나 자신을 잘 챙기고 편히 쉰 순간.', w: { recovery: 3, charm: 1, esteem: 1 }, sr: 3, al: 0, tag: null },
      { text: '새로운 것을 만들어 낸 순간.', w: { create: 4, esteem: 1 }, sr: 2, al: 0, tag: null }
    ] },
    { id: 'Q31', stage: 'scenario', category: 'fit_mind', situation: '주말에 두 시간이 남고 몸 상태는 괜찮아요. 무엇을 먼저 할래요?', choices: [
      { text: '운동하거나 몸을 움직인다.', w: { fit: 4 }, sr: 0, al: 0, tag: null },
      { text: '책이나 강의를 보며 공부한다.', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '운동 한 시간과 공부 한 시간을 나눈다.', w: { fit: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '창작 작업을 한다.', w: { create: 4 }, sr: 0, al: 0, tag: null },
      { text: '아무것도 하지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q32', stage: 'scenario', category: 'fit_mind', situation: '새로운 건강 습관을 만들고 싶어요. 첫 행동은 무엇으로 할까요?', choices: [
      { text: '가벼운 운동부터 바로 시작한다.', w: { fit: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '자료를 찾아 원리를 이해한다.', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '자료를 짧게 확인한 뒤 작게 실천한다.', w: { mind: 2, fit: 2 }, sr: 0, al: 0, tag: null },
      { text: '주변 사람과 함께할 계획을 만든다.', w: { lead: 2, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '지금은 아무것도 하지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q33', stage: 'scenario', category: 'fit_mind', situation: '일주일 동안 여유시간은 매일 30분뿐이에요. 어디에 가장 많이 쓸래요?', choices: [
      { text: '운동', w: { fit: 4 }, sr: 0, al: 0, tag: null },
      { text: '독서·공부', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '운동과 공부를 번갈아', w: { fit: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '작품 제작', w: { create: 4 }, sr: 0, al: 0, tag: null },
      { text: '정해 두지 않고 쉰다.', w: { recovery: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q34', stage: 'scenario', category: 'fit_mind', situation: '한 달 뒤에 달성하고 싶은 목표를 하나 선택한다면요?', choices: [
      { text: '운동 지속 기록 만들기', w: { fit: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '책 한 권을 이해하고 정리하기', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '운동과 독서를 각각 조금씩 이어가기', w: { fit: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '작품 하나 완성하기', w: { create: 4 }, sr: 0, al: 0, tag: null },
      { text: '목표를 정하지 않기', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q35', stage: 'scenario', category: 'charm', situation: '오랜만에 중요한 사람을 만나는 날이에요. 외출 전 무엇을 가장 신경 써요?', choices: [
      { text: '옷·머리·피부를 세심하게 준비한다.', w: { charm: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '상대에게 전할 이야기와 질문을 생각한다.', w: { care: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '지금 내 모습 그대로 편안하게 간다.', w: { esteem: 3, recovery: 1 }, sr: 0, al: 0, tag: null },
      { text: '늦지 않게 출발 시간과 가는 길을 미리 확인한다.', w: { discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '미루다가 준비할 시간을 놓쳐 급하게 나간다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q36', stage: 'scenario', category: 'charm', situation: '평소 외모나 분위기를 바꿔보고 싶은 마음이 생겼어요.', choices: [
      { text: '헤어·옷·피부 관리에 작은 변화를 준다.', w: { charm: 4, create: 1 }, sr: 0, al: 0, tag: null },
      { text: '참고 자료를 모아 내 스타일을 분석한다.', w: { mind: 2, charm: 2 }, sr: 0, al: 0, tag: null },
      { text: '지금 모습이 좋아 그대로 유지한다.', w: { esteem: 3 }, sr: 0, al: 0, tag: null },
      { text: '주변에 의견을 구한다.', w: { care: 1, charm: 2 }, sr: 0, al: 0, tag: null },
      { text: '마음만 있고 막상 실천하지는 못한다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q37', stage: 'scenario', category: 'esteem', situation: '상대가 부탁한 일이 내 일정과 충돌해요.', choices: [
      { text: '가능한 범위를 말하고 조정한다.', w: { esteem: 4, care: 2 }, sr: 0, al: 0, tag: null },
      { text: '내 일정을 미루고 돕는다.', w: { care: 3 }, sr: 0, al: 0, tag: null },
      { text: '이유를 설명하고 정중히 거절한다.', w: { esteem: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '대안을 함께 찾는다.', w: { mind: 2, care: 2 }, sr: 0, al: 0, tag: null },
      { text: '대답을 미루고 아무것도 하지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q38', stage: 'scenario', category: 'esteem', situation: '누군가 내 작업물을 비판했어요.', choices: [
      { text: '구체적 근거를 확인한 뒤 반영한다.', w: { mind: 2, esteem: 3 }, sr: 0, al: 0, tag: null },
      { text: '가치 있는 의견만 취하고 계속한다.', w: { esteem: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '상대와 관점을 나누어 본다.', w: { care: 2, lead: 2 }, sr: 0, al: 0, tag: null },
      { text: '잠시 감정을 정리하고 다시 본다.', w: { recovery: 2, esteem: 2 }, sr: 0, al: 0, tag: null },
      { text: '그대로 두고 아무것도 하지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q39', stage: 'scenario', category: 'esteem', situation: '계획했던 도전에 실패했어요.', choices: [
      { text: '실패 원인을 살펴 다음 시도를 정한다.', w: { esteem: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '다시 바로 도전한다.', w: { esteem: 3, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '휴식을 취하고 나중에 재정비한다.', w: { recovery: 3, esteem: 2 }, sr: 0, al: 0, tag: null },
      { text: '다른 목표로 방향을 바꾼다.', w: { create: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '다시 해 볼 생각 없이 그대로 포기한다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q40', stage: 'scenario', category: 'divine', situation: '아무도 보지 않는 곳에서 누군가의 중요한 물건을 주웠어요.', choices: [
      { text: '분실물 접수처에 맡긴다.', w: { divine: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '주인을 찾을 방법을 알아본다.', w: { divine: 3, care: 2 }, sr: 0, al: 0, tag: null },
      { text: '경찰 등에 신고한다.', w: { divine: 4, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '다른 사람에게 처리 방법을 묻는다.', w: { mind: 2, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '그대로 두고 떠난다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q41', stage: 'scenario', category: 'divine', situation: '친구가 다른 사람을 속여 이득을 보려는 걸 알았어요.', choices: [
      { text: '그만두라고 분명하게 말한다.', w: { divine: 4, esteem: 2 }, sr: 0, al: 0, tag: null },
      { text: '왜 그러는지 듣고 다른 해결책을 제안한다.', w: { divine: 3, care: 2 }, sr: 0, al: 0, tag: null },
      { text: '피해를 막을 수 있는 적절한 조치를 취한다.', w: { divine: 4, lead: 2 }, sr: 0, al: 0, tag: null },
      { text: '관여하지 않되 동참하지 않는다.', w: { esteem: 2, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '모른 척하고 평소처럼 어울린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q42', stage: 'scenario', category: 'divine', situation: '공동 프로젝트에서 공로가 잘못 알려졌어요.', choices: [
      { text: '사실관계를 확인하고 정확히 바로잡는다.', w: { divine: 4, lead: 2 }, sr: 0, al: 0, tag: null },
      { text: '실제 기여자의 역할을 알린다.', w: { divine: 3, care: 2 }, sr: 0, al: 0, tag: null },
      { text: '팀원끼리 공정한 기준을 마련한다.', w: { divine: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '내 몫만 제대로 설명한다.', w: { esteem: 3 }, sr: 0, al: 0, tag: null },
      { text: '아무것도 하지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q43', stage: 'scenario', category: 'care_divine', situation: '힘들어하는 지인이 도움을 청했지만 나도 여유가 적어요.', choices: [
      { text: '할 수 있는 범위를 정해 돕는다.', w: { care: 3, esteem: 2, divine: 1 }, sr: 0, al: 0, tag: null },
      { text: '다른 도움 자원을 연결한다.', w: { care: 2, mind: 2, divine: 1 }, sr: 0, al: 0, tag: null },
      { text: '현재는 어렵다고 솔직히 설명한다.', w: { esteem: 3, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '약속을 미루고 먼저 직접 돕는다.', w: { care: 3, divine: 2 }, sr: 0, al: 0, tag: null },
      { text: '답을 하지 않고 아무것도 하지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q44', stage: 'scenario', category: 'charm_esteem', situation: '외모에 대한 원치 않는 평가를 들었어요.', choices: [
      { text: '내 취향과 기준을 지킨다.', w: { esteem: 4 }, sr: 0, al: 0, tag: null },
      { text: '참고할 부분만 검토한다.', w: { esteem: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '내가 원하는 방식으로 스타일을 바꿔본다.', w: { charm: 3, create: 1 }, sr: 0, al: 0, tag: null },
      { text: '상대에게 불편하다고 말한다.', w: { esteem: 4, lead: 1 }, sr: 0, al: 0, tag: null },
      { text: '대응하지 않고 넘긴다.', w: { recovery: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q45', stage: 'scenario', category: 'recovery_inaction', situation: '피곤한 밤, 할 일이 남아 있지만 내일로 미뤄도 문제는 없어요.', choices: [
      { text: '일부만 마치고 잔다.', w: { discipline: 2, recovery: 2 }, sr: 0, al: 0, tag: null },
      { text: '내일 계획을 세우고 충분히 잔다.', w: { mind: 1, recovery: 4 }, sr: 0, al: 0, tag: null },
      { text: '끝까지 다 마치고 잔다.', w: { discipline: 3, create: 1 }, sr: 0, al: 0, tag: null },
      { text: '할 일은 내려놓고 좋아하는 음악을 들으며 일부러 쉰다.', w: { recovery: 4, esteem: 1 }, sr: 0, al: 0, tag: 'deliberate_rest' },
      { text: '할 일을 미룬 채 휴대폰을 보다가 늦게 잔다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q46', stage: 'scenario', category: 'fit', situation: '엘리베이터가 점검 중이라 5층까지 걸어 올라가야 해요.', choices: [
      { text: '운동 삼아 빠르게 걸어 올라간다.', w: { fit: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '천천히 쉬어 가며 올라간다.', w: { recovery: 3, fit: 1 }, sr: 1, al: 0, tag: null },
      { text: '점검이 끝날 때까지 기다리며 밀린 연락을 정리한다.', w: { mind: 2, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '올라가는 김에 이웃의 짐도 같이 들어 준다.', w: { care: 3, fit: 2 }, sr: 0, al: 2, tag: null }
    ] },
    { id: 'Q47', stage: 'scenario', category: 'money', situation: '월급이나 용돈이 들어온 날이에요. 가장 먼저 무엇을 하나요?', choices: [
      { text: '저축할 금액부터 따로 옮긴다.', w: { money: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '이번 달 예산을 항목별로 나눠 적는다.', w: { money: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '고생한 나에게 작은 선물을 한다.', w: { recovery: 2, esteem: 2, charm: 1 }, sr: 2, al: 0, tag: null },
      { text: '가족이나 고마운 사람에게 밥을 산다.', w: { care: 3, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '특별히 하는 일 없이 평소처럼 쓴다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q48', stage: 'scenario', category: 'charm', situation: '중요한 발표 전날이에요.', choices: [
      { text: '입을 옷과 머리 모양을 미리 정해 둔다.', w: { charm: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '발표 내용을 한 번 더 소리 내어 연습한다.', w: { mind: 3, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '일찍 자서 컨디션을 맞춘다.', w: { recovery: 4 }, sr: 1, al: 0, tag: null },
      { text: '동료에게 미리 보여 주고 의견을 듣는다.', w: { lead: 2, care: 1, mind: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q49', stage: 'scenario', category: 'divine', situation: '계산을 마치고 보니 거스름돈을 더 많이 받았어요.', choices: [
      { text: '바로 돌아가서 돌려준다.', w: { divine: 4, discipline: 1 }, sr: 0, al: 2, tag: null },
      { text: '다음에 들를 때 말하고 돌려준다.', w: { divine: 2, care: 1, mind: 1 }, sr: 0, al: 1, tag: null },
      { text: '금액이 작으면 두고, 크면 돌려준다.', w: { mind: 2, money: 1 }, sr: 0, al: 0, tag: null },
      { text: '모르는 척 그냥 간다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q50', stage: 'scenario', category: 'lead', situation: '여행 계획을 짜야 하는데 아무도 먼저 나서지 않아요.', choices: [
      { text: '내가 일정 초안을 만들어 공유한다.', w: { lead: 4, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '각자 하고 싶은 것을 물어 정리한다.', w: { lead: 2, care: 3 }, sr: 0, al: 1, tag: null },
      { text: '예산과 교통편부터 계산해 본다.', w: { money: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '누군가 나설 때까지 기다린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q51', stage: 'scenario', category: 'create', situation: '방 한쪽 벽이 비어 있어요.', choices: [
      { text: '직접 그리거나 만든 것으로 꾸민다.', w: { create: 4, charm: 1 }, sr: 1, al: 0, tag: null },
      { text: '마음에 드는 포스터나 사진을 골라 건다.', w: { charm: 3, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '수납이나 운동 공간으로 쓸 방법을 궁리한다.', w: { mind: 3, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '깔끔한 게 좋아서 비워 둔다.', w: { discipline: 2, recovery: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q52', stage: 'scenario', category: 'recovery', situation: '며칠째 잠이 부족한데 오늘 저녁 약속이 있어요.', choices: [
      { text: '약속을 미루고 일찍 잔다.', w: { recovery: 4, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '약속은 지키되 일찍 돌아온다.', w: { care: 2, discipline: 2, recovery: 1 }, sr: 0, al: 1, tag: null },
      { text: '약속에 가서 끝까지 즐긴다.', w: { care: 3, charm: 1 }, sr: 0, al: 1, tag: null },
      { text: '커피로 버티며 평소대로 한다.', w: { discipline: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q53', stage: 'scenario', category: 'esteem', situation: '내가 낸 의견이 회의에서 받아들여지지 않았어요.', choices: [
      { text: '근거를 보완해 다시 제안한다.', w: { esteem: 3, mind: 2 }, sr: 2, al: 0, tag: null },
      { text: '결정된 방향을 따르며 맡은 일을 한다.', w: { discipline: 3, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '따로 찾아가 이유를 물어본다.', w: { lead: 2, esteem: 2, mind: 1 }, sr: 1, al: 0, tag: null },
      { text: '내 생각이 틀렸나 보다 하고 접는다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q54', stage: 'scenario', category: 'discipline', situation: '식단을 조절하는 중인데 모임 메뉴가 기름진 음식이에요.', choices: [
      { text: '정해 둔 양만 먹는다.', w: { discipline: 4, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '오늘은 즐기고 내일 운동으로 보충한다.', w: { fit: 3, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '미리 가볍게 먹고 가서 조금만 먹는다.', w: { mind: 2, discipline: 2, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '분위기를 살리며 함께 즐긴다.', w: { care: 2, lead: 1, charm: 1 }, sr: 0, al: 1, tag: null }
    ] },
    { id: 'Q55', stage: 'scenario', category: 'care', situation: '동료가 며칠째 표정이 어두워요.', choices: [
      { text: '조용히 음료를 건네며 안부를 묻는다.', w: { care: 4 }, sr: 0, al: 2, tag: null },
      { text: '일을 조금 나눠 맡겠다고 말한다.', w: { care: 2, lead: 2, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '부담 주지 않으려고 지켜본다.', w: { care: 2, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '내 일에 집중한다.', w: { discipline: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q56', stage: 'scenario', category: 'mind', situation: '뉴스에서 처음 듣는 용어가 나왔어요.', choices: [
      { text: '바로 검색해서 뜻을 찾아본다.', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '내 돈 관리와 관련이 있는지 따져 본다.', w: { money: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '아는 사람에게 물어본다.', w: { care: 1, lead: 1, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '그냥 넘어간다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q57', stage: 'scenario', category: 'fit', situation: '친구가 주말 아침 등산을 가자고 해요.', choices: [
      { text: '좋다고 하고 전날 일찍 잔다.', w: { fit: 3, recovery: 1, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '가볍게 걸을 수 있는 코스로 바꾸자고 한다.', w: { fit: 2, lead: 2, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '등산 대신 점심을 같이 먹자고 한다.', w: { care: 3, recovery: 1 }, sr: 0, al: 1, tag: null },
      { text: '주말은 쉬고 싶다고 솔직히 말한다.', w: { esteem: 3, recovery: 2 }, sr: 2, al: 0, tag: null }
    ] },
    { id: 'Q58', stage: 'scenario', category: 'money', situation: '구독 서비스 결제 알림이 왔는데 요즘 거의 쓰지 않아요.', choices: [
      { text: '바로 해지한다.', w: { money: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '쓰고 있는 구독을 전부 점검해 정리한다.', w: { money: 3, mind: 1, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '이번 달은 제대로 써 보고 결정한다.', w: { mind: 2, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '귀찮아서 그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q59', stage: 'scenario', category: 'charm', situation: '머리를 자를 때가 됐어요.', choices: [
      { text: '새로운 스타일에 도전해 본다.', w: { charm: 3, create: 2 }, sr: 1, al: 0, tag: null },
      { text: '늘 하던 대로 단정하게 다듬는다.', w: { charm: 3, discipline: 2 }, sr: 1, al: 0, tag: null },
      { text: '사진을 찾아보고 어울리는 스타일을 연구한다.', w: { mind: 2, charm: 3 }, sr: 1, al: 0, tag: null },
      { text: '아직 괜찮아서 다음 달로 미룬다.', w: { money: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q60', stage: 'scenario', category: 'divine', situation: '버스에서 몸이 불편해 보이는 사람이 서 있어요. 나는 앉아 있고 많이 피곤해요.', choices: [
      { text: '바로 자리를 양보한다.', w: { divine: 4, care: 1 }, sr: 0, al: 3, tag: null },
      { text: '괜찮으신지 먼저 물어본다.', w: { care: 3, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '피곤해서 이번에는 그대로 앉아 있는다.', w: { recovery: 3 }, sr: 1, al: 0, tag: null },
      { text: '주변에 양보할 사람이 있는지 살핀다.', w: { mind: 2, lead: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q61', stage: 'scenario', category: 'lead', situation: '모임에서 행사 담당을 뽑는데 지원자가 없어요.', choices: [
      { text: '내가 맡겠다고 손을 든다.', w: { lead: 4, esteem: 1 }, sr: 1, al: 0, tag: null },
      { text: '둘이 나눠서 하자고 제안한다.', w: { lead: 2, care: 2 }, sr: 0, al: 1, tag: null },
      { text: '잘할 것 같은 사람을 추천한다.', w: { lead: 2, mind: 1, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '지금은 여력이 없어 가만히 있는다.', w: { recovery: 2, esteem: 1 }, sr: 1, al: 0, tag: null }
    ] },
    { id: 'Q62', stage: 'scenario', category: 'create', situation: '생일인 친구에게 줄 선물을 고민하고 있어요.', choices: [
      { text: '직접 만든 것이나 손편지를 준비한다.', w: { create: 4, care: 1 }, sr: 0, al: 1, tag: null },
      { text: '친구가 필요하다던 물건을 산다.', w: { care: 3, mind: 2 }, sr: 0, al: 1, tag: null },
      { text: '예산을 정해 그 안에서 고른다.', w: { money: 3, discipline: 1, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '같이 맛있는 것을 먹으며 축하한다.', w: { care: 3, recovery: 1 }, sr: 0, al: 1, tag: null }
    ] },
    { id: 'Q63', stage: 'scenario', category: 'recovery', situation: '일요일 저녁, 내일이 벌써 걱정돼요.', choices: [
      { text: '내일 할 일을 적어 두고 마음을 내려놓는다.', w: { mind: 2, discipline: 1, recovery: 2 }, sr: 1, al: 0, tag: null },
      { text: '따뜻하게 씻고 일찍 눕는다.', w: { recovery: 4, charm: 1 }, sr: 1, al: 0, tag: null },
      { text: '가볍게 산책하며 몸을 푼다.', w: { fit: 3, recovery: 2 }, sr: 1, al: 0, tag: null },
      { text: '친구와 통화하며 기분을 푼다.', w: { care: 3, recovery: 1 }, sr: 0, al: 0, tag: null },
      { text: '걱정하다가 늦게 잠든다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q64', stage: 'scenario', category: 'esteem', situation: '사람들 앞에서 말하다가 실수로 더듬었어요.', choices: [
      { text: '웃으며 다시 또박또박 말한다.', w: { esteem: 4, charm: 1 }, sr: 2, al: 0, tag: null },
      { text: '끝난 뒤 어디서 꼬였는지 돌아본다.', w: { mind: 3, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '다음에는 미리 연습하기로 한다.', w: { discipline: 3, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '한동안 그 장면이 계속 떠오른다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q65', stage: 'scenario', category: 'discipline', situation: '아침 알람이 울렸어요. 계획한 기상 시간이에요.', choices: [
      { text: '바로 일어나 계획대로 시작한다.', w: { discipline: 4, fit: 1 }, sr: 1, al: 0, tag: null },
      { text: '5분만 더 누워 있다가 일어난다.', w: { recovery: 2, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '누운 채 오늘 일정을 떠올려 본다.', w: { mind: 3 }, sr: 0, al: 0, tag: null },
      { text: '알람을 끄고 다시 잔다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q66', stage: 'scenario', category: 'care', situation: '이사하는 친구가 도와 달라고 해요. 그날은 쉬는 날이에요.', choices: [
      { text: '가서 끝까지 돕는다.', w: { care: 3, fit: 2 }, sr: 0, al: 3, tag: null },
      { text: '오전만 돕고 오후는 쉰다.', w: { care: 2, recovery: 2 }, sr: 0, al: 1, tag: null },
      { text: '짐 옮길 순서와 차량을 대신 알아봐 준다.', w: { mind: 2, lead: 2, care: 1 }, sr: 0, al: 1, tag: null },
      { text: '쉬고 싶다고 말하고 다음에 밥을 산다.', w: { esteem: 2, recovery: 2, care: 1 }, sr: 2, al: 0, tag: null }
    ] },
    { id: 'Q67', stage: 'scenario', category: 'mind', situation: '조립식 가구를 샀는데 설명서가 복잡해요.', choices: [
      { text: '설명서를 처음부터 차근차근 읽는다.', w: { mind: 3, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '일단 감으로 맞춰 본다.', w: { create: 3, esteem: 1 }, sr: 0, al: 0, tag: null },
      { text: '조립 영상을 찾아본다.', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '잘하는 사람에게 도움을 청한다.', w: { care: 1, lead: 2, mind: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q68', stage: 'scenario', category: 'fit', situation: '점심을 먹고 30분이 남았어요.', choices: [
      { text: '주변을 빠르게 걷는다.', w: { fit: 4, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '눈을 감고 잠깐 쉰다.', w: { recovery: 4 }, sr: 1, al: 0, tag: null },
      { text: '오후에 할 일을 미리 정리한다.', w: { discipline: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '동료와 이야기를 나눈다.', w: { care: 3, lead: 1 }, sr: 0, al: 1, tag: null }
    ] },
    { id: 'Q69', stage: 'scenario', category: 'money', situation: '친구들과 식사한 뒤 계산할 때예요.', choices: [
      { text: '정확히 나눠서 내자고 한다.', w: { money: 3, discipline: 1, esteem: 1 }, sr: 1, al: 0, tag: null },
      { text: '이번에는 내가 사겠다고 한다.', w: { care: 3, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '내가 먼저 계산하고 나중에 정산한다.', w: { lead: 2, money: 2, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '다른 사람이 정하는 대로 따른다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q70', stage: 'scenario', category: 'charm', situation: '거울을 보니 요즘 자세가 구부정해졌어요.', choices: [
      { text: '스트레칭과 자세 교정 운동을 시작한다.', w: { fit: 3, charm: 2 }, sr: 1, al: 0, tag: null },
      { text: '앉는 습관과 책상 높이를 바꾼다.', w: { mind: 2, discipline: 2, charm: 1 }, sr: 1, al: 0, tag: null },
      { text: '옷차림으로 보완해 본다.', w: { charm: 3, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '신경은 쓰이지만 그대로 지낸다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q71', stage: 'scenario', category: 'divine', situation: '함께하는 과제에서 한 사람이 거의 참여하지 않았는데 평가하는 사람은 몰라요.', choices: [
      { text: '그 사람에게 맡을 부분을 직접 말한다.', w: { lead: 3, esteem: 2 }, sr: 1, al: 0, tag: null },
      { text: '기여한 내용을 사실대로 적어 낸다.', w: { divine: 3, esteem: 2 }, sr: 1, al: 0, tag: null },
      { text: '내가 조금 더 하고 넘어간다.', w: { care: 2, discipline: 2 }, sr: 0, al: 1, tag: null },
      { text: '다른 팀원들과 어떻게 할지 의논한다.', w: { lead: 3, care: 1, mind: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q72', stage: 'scenario', category: 'lead', situation: '식당에서 주문한 음식이 한참 동안 나오지 않아요. 일행은 말을 못 하고 있어요.', choices: [
      { text: '내가 직원에게 정중히 확인한다.', w: { lead: 3, esteem: 2 }, sr: 1, al: 0, tag: null },
      { text: '조금 더 기다려 보자고 한다.', w: { care: 2, recovery: 1, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '일행에게 다른 곳으로 옮길지 묻는다.', w: { lead: 2, care: 2 }, sr: 0, al: 0, tag: null },
      { text: '누군가 말할 때까지 기다린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q73', stage: 'scenario', category: 'create', situation: '요리하려는데 필요한 재료 하나가 없어요.', choices: [
      { text: '있는 재료로 새로운 조합을 만들어 본다.', w: { create: 4, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '대신 쓸 수 있는 재료를 검색한다.', w: { mind: 3, create: 1 }, sr: 0, al: 0, tag: null },
      { text: '가까운 가게에 가서 사 온다.', w: { discipline: 3, fit: 1 }, sr: 0, al: 0, tag: null },
      { text: '다른 메뉴로 바꾼다.', w: { mind: 2, recovery: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q74', stage: 'scenario', category: 'recovery', situation: '휴가 첫날이에요.', choices: [
      { text: '아무 계획 없이 푹 쉰다.', w: { recovery: 4 }, sr: 2, al: 0, tag: null },
      { text: '미뤄 둔 취미를 한다.', w: { create: 3, recovery: 2 }, sr: 1, al: 0, tag: null },
      { text: '평소 못 한 운동을 한다.', w: { fit: 4 }, sr: 1, al: 0, tag: null },
      { text: '가족이나 친구를 만난다.', w: { care: 4 }, sr: 0, al: 1, tag: null },
      { text: '밀린 공부나 일을 한다.', w: { mind: 2, discipline: 3 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q75', stage: 'scenario', category: 'esteem', situation: 'SNS에서 또래의 성공 소식을 봤어요.', choices: [
      { text: '축하 메시지를 보낸다.', w: { care: 3, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '내 속도대로 가면 된다고 생각한다.', w: { esteem: 4, recovery: 1 }, sr: 3, al: 0, tag: null },
      { text: '자극을 받아 내 목표를 다시 점검한다.', w: { discipline: 2, mind: 2, esteem: 1 }, sr: 1, al: 0, tag: null },
      { text: '한동안 기분이 가라앉는다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q76', stage: 'scenario', category: 'discipline', situation: '영상을 보다 보니 자려던 시간이 됐어요.', choices: [
      { text: '바로 끄고 잘 준비를 한다.', w: { discipline: 4, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '보던 것만 끝내고 끈다.', w: { discipline: 2, recovery: 1 }, sr: 0, al: 0, tag: null },
      { text: '내일 일정이 괜찮은지 확인하고 조금 더 본다.', w: { mind: 3 }, sr: 0, al: 0, tag: null },
      { text: '시간 가는 줄 모르고 계속 본다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q77', stage: 'scenario', category: 'care', situation: '가까운 어른께 한동안 연락을 못 했어요.', choices: [
      { text: '오늘 바로 전화한다.', w: { care: 4 }, sr: 0, al: 2, tag: null },
      { text: '주말에 찾아갈 날을 잡는다.', w: { care: 3, discipline: 1, lead: 1 }, sr: 0, al: 2, tag: null },
      { text: '안부 메시지와 사진을 보낸다.', w: { care: 3, create: 1 }, sr: 0, al: 1, tag: null },
      { text: '바쁜 일이 끝나면 연락하기로 미룬다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q78', stage: 'scenario', category: 'mind', situation: '외국어로 된 안내문을 읽어야 해요.', choices: [
      { text: '사전을 찾아가며 직접 읽어 본다.', w: { mind: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '번역기를 돌려 빠르게 파악한다.', w: { mind: 3 }, sr: 0, al: 0, tag: null },
      { text: '이참에 그 언어를 조금씩 배워 보기로 한다.', w: { mind: 3, discipline: 2 }, sr: 1, al: 0, tag: null },
      { text: '잘 아는 사람에게 부탁한다.', w: { care: 1, lead: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q79', stage: 'scenario', category: 'fit', situation: '건강검진에서 운동이 부족하다는 말을 들었어요.', choices: [
      { text: '오늘부터 매일 걷기를 시작한다.', w: { fit: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '운동 계획표를 만들고 기록한다.', w: { discipline: 3, mind: 1, fit: 1 }, sr: 1, al: 0, tag: null },
      { text: '식단부터 바꿔 본다.', w: { recovery: 3, discipline: 2 }, sr: 1, al: 0, tag: null },
      { text: '같이 운동할 사람을 구한다.', w: { lead: 2, care: 1, fit: 2 }, sr: 0, al: 0, tag: null },
      { text: '당장은 바꾸지 않는다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q80', stage: 'scenario', category: 'money', situation: '갖고 싶던 물건이 중고로 싸게 나왔어요.', choices: [
      { text: '상태를 꼼꼼히 확인하고 산다.', w: { money: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '이번 달 예산에 여유가 있는지 먼저 본다.', w: { money: 3, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '정말 필요한지 하루 더 생각한다.', w: { discipline: 3, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '기회라고 생각해 바로 산다.', w: { charm: 1, esteem: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q81', stage: 'scenario', category: 'charm', situation: '처음 가는 모임에 초대받았어요.', choices: [
      { text: '깔끔하게 차려입고 간다.', w: { charm: 4, esteem: 1 }, sr: 1, al: 0, tag: null },
      { text: '먼저 인사하고 이름을 외운다.', w: { lead: 2, care: 2, charm: 1 }, sr: 0, al: 1, tag: null },
      { text: '어떤 사람들이 오는지 미리 알아본다.', w: { mind: 3, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '조용히 분위기를 보다가 편한 사람과 이야기한다.', w: { recovery: 2, care: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q82', stage: 'scenario', category: 'divine', situation: '길에서 모금 활동을 하는 사람이 말을 걸어요.', choices: [
      { text: '멈춰서 이야기를 들어 본다.', w: { care: 2, divine: 2 }, sr: 0, al: 1, tag: null },
      { text: '취지가 믿을 만한지 확인하고 참여한다.', w: { mind: 3, divine: 2 }, sr: 0, al: 1, tag: null },
      { text: '정중히 거절하고 지나간다.', w: { esteem: 3, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '못 본 척 지나간다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q83', stage: 'scenario', category: 'lead', situation: '회의가 길어지는데 결론이 나지 않아요.', choices: [
      { text: '지금까지 나온 내용을 정리해 선택지를 제시한다.', w: { lead: 4, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '다음 회의까지 각자 할 일을 나누자고 한다.', w: { lead: 3, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '의견이 다른 사람의 이야기를 더 들어 본다.', w: { care: 3, mind: 1 }, sr: 0, al: 1, tag: null },
      { text: '조용히 끝나기를 기다린다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q84', stage: 'scenario', category: 'create', situation: '휴대폰 사진첩에 사진이 수천 장 쌓였어요.', choices: [
      { text: '좋은 사진을 골라 앨범이나 영상으로 만든다.', w: { create: 4, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '날짜·주제별로 정리한다.', w: { discipline: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '필요 없는 사진을 지워 용량을 확보한다.', w: { discipline: 3, mind: 1 }, sr: 0, al: 0, tag: null },
      { text: '그대로 둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q85', stage: 'scenario', category: 'recovery', situation: '감기 기운이 있는데 오늘 운동 계획이 있어요.', choices: [
      { text: '운동을 쉬고 따뜻하게 쉰다.', w: { recovery: 4, esteem: 1 }, sr: 2, al: 0, tag: null },
      { text: '강도를 낮춰 가볍게 한다.', w: { fit: 2, recovery: 2, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '계획대로 한다.', w: { discipline: 3, fit: 2 }, sr: 0, al: 0, tag: null },
      { text: '병원이나 약국에 먼저 들른다.', w: { recovery: 3, mind: 2 }, sr: 1, al: 0, tag: null }
    ] },
    { id: 'Q86', stage: 'scenario', category: 'esteem', situation: '친구가 농담으로 내 약점을 건드렸어요.', choices: [
      { text: '그 말은 불편하다고 바로 말한다.', w: { esteem: 4, lead: 1 }, sr: 3, al: 0, tag: null },
      { text: '웃어넘기고 나중에 따로 이야기한다.', w: { care: 2, esteem: 2, mind: 1 }, sr: 1, al: 0, tag: null },
      { text: '나도 농담으로 받아친다.', w: { charm: 2, create: 2 }, sr: 0, al: 0, tag: null },
      { text: '아무 말 못 하고 넘어간다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q87', stage: 'scenario', category: 'discipline', situation: '목표를 세운 지 3주, 흐지부지되고 있어요.', choices: [
      { text: '목표를 더 작게 쪼개 다시 시작한다.', w: { discipline: 3, mind: 2 }, sr: 1, al: 0, tag: null },
      { text: '달력에 매일 표시하며 기록한다.', w: { discipline: 4 }, sr: 1, al: 0, tag: null },
      { text: '같이 할 사람을 찾아 서로 확인한다.', w: { lead: 2, care: 1, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '나와 맞지 않는 목표였다고 보고 바꾼다.', w: { esteem: 2, mind: 2, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '그만둔다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q88', stage: 'scenario', category: 'care', situation: '새로 들어온 사람이 혼자 점심을 먹으려 해요.', choices: [
      { text: '같이 먹자고 먼저 말한다.', w: { care: 4, lead: 1 }, sr: 0, al: 2, tag: null },
      { text: '주변 맛집을 알려 준다.', w: { care: 3 }, sr: 0, al: 1, tag: null },
      { text: '다음에 여럿이 갈 때 부른다.', w: { care: 2, lead: 2 }, sr: 0, al: 1, tag: null },
      { text: '혼자 있고 싶을 수도 있으니 그대로 둔다.', w: { care: 1, mind: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q89', stage: 'scenario', category: 'mind', situation: '중요한 결정을 앞두고 정보가 너무 많아요.', choices: [
      { text: '기준을 정하고 표로 비교한다.', w: { mind: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '경험해 본 사람에게 물어본다.', w: { care: 1, lead: 2, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '직감을 믿고 정한다.', w: { esteem: 3, create: 2 }, sr: 1, al: 0, tag: null },
      { text: '하루 자고 다시 생각한다.', w: { recovery: 3, mind: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q90', stage: 'scenario', category: 'fit', situation: '약속 장소까지 걸어서 25분, 버스로 10분이에요. 시간은 넉넉해요.', choices: [
      { text: '걸어간다.', w: { fit: 4, money: 1 }, sr: 1, al: 0, tag: null },
      { text: '버스를 타고 가서 여유 있게 기다린다.', w: { recovery: 2, discipline: 2 }, sr: 0, al: 0, tag: null },
      { text: '걸으면서 음성 강의를 듣는다.', w: { fit: 2, mind: 3 }, sr: 0, al: 0, tag: null },
      { text: '자전거를 탄다.', w: { fit: 3, create: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q91', stage: 'scenario', category: 'money', situation: '예상하지 못한 수리비가 나갔어요.', choices: [
      { text: '이번 달 지출 계획을 다시 짠다.', w: { money: 4, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '비상금 통장을 만들기로 한다.', w: { money: 3, mind: 1, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '어쩔 수 없다고 생각하고 넘긴다.', w: { recovery: 3, esteem: 1 }, sr: 1, al: 0, tag: null },
      { text: '추가로 벌 방법을 찾아본다.', w: { money: 3, create: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q92', stage: 'scenario', category: 'charm', situation: '프로필 사진을 바꾸려고 해요.', choices: [
      { text: '잘 나온 사진을 고르고 보정한다.', w: { charm: 4, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '직접 새로 찍는다.', w: { create: 3, charm: 2 }, sr: 1, al: 0, tag: null },
      { text: '꾸미지 않은 자연스러운 사진으로 한다.', w: { esteem: 3, charm: 1 }, sr: 2, al: 0, tag: null },
      { text: '친구에게 골라 달라고 한다.', w: { care: 2, lead: 1, charm: 1 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q93', stage: 'scenario', category: 'divine', situation: '약속에 늦을 것 같아요. 그럴듯한 핑계를 댈 수도 있어요.', choices: [
      { text: '늦는 이유를 사실대로 말하고 사과한다.', w: { divine: 4, esteem: 1 }, sr: 0, al: 1, tag: null },
      { text: '미리 연락해 도착 시간을 알린다.', w: { care: 3, discipline: 2 }, sr: 0, al: 1, tag: null },
      { text: '돈이 들더라도 빠른 교통편으로 시간을 맞춘다.', w: { discipline: 3, care: 1 }, sr: 0, al: 0, tag: null },
      { text: '핑계를 대고 넘어간다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q94', stage: 'scenario', category: 'lead', situation: '이웃 단체 대화방에서 소음 문제로 분위기가 험악해졌어요.', choices: [
      { text: '차분하게 규칙을 정하자고 제안한다.', w: { lead: 4, care: 1 }, sr: 0, al: 1, tag: null },
      { text: '당사자들에게 따로 연락해 중재한다.', w: { care: 3, lead: 2 }, sr: 0, al: 2, tag: null },
      { text: '관리하는 곳에 정식으로 알린다.', w: { discipline: 2, mind: 2, lead: 1 }, sr: 0, al: 0, tag: null },
      { text: '조용히 지켜본다.', w: {  }, sr: 0, al: 0, tag: 'inaction' }
    ] },
    { id: 'Q95', stage: 'scenario', category: 'create', situation: '지루하게 반복되는 일이 있어요.', choices: [
      { text: '더 빠른 방법을 궁리해 바꿔 본다.', w: { create: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '음악을 틀고 리듬에 맞춰 해치운다.', w: { create: 2, recovery: 2, discipline: 1 }, sr: 0, al: 0, tag: null },
      { text: '시간을 정해 집중해서 끝낸다.', w: { discipline: 4 }, sr: 0, al: 0, tag: null },
      { text: '동료와 나눠 번갈아 한다.', w: { lead: 2, care: 2 }, sr: 0, al: 0, tag: null }
    ] },
    { id: 'Q96', stage: 'scenario', category: 'recovery', situation: '스트레스가 쌓인 날, 일을 마친 뒤예요.', choices: [
      { text: '땀이 나게 운동한다.', w: { fit: 4, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '맛있는 것을 먹으며 쉰다.', w: { recovery: 4 }, sr: 1, al: 0, tag: null },
      { text: '친구에게 이야기를 털어놓는다.', w: { care: 3, recovery: 2 }, sr: 0, al: 0, tag: null },
      { text: '그림·음악·글로 풀어낸다.', w: { create: 4, recovery: 1 }, sr: 1, al: 0, tag: null },
      { text: '왜 그랬는지 글로 정리해 본다.', w: { mind: 3, esteem: 2 }, sr: 1, al: 0, tag: null }
    ] },
    { id: 'Q97', stage: 'scenario', category: 'esteem', situation: '칭찬을 받았어요.', choices: [
      { text: '고맙다고 하고 기쁘게 받아들인다.', w: { esteem: 4, charm: 1 }, sr: 3, al: 0, tag: null },
      { text: '도와준 사람들 덕분이라고 말한다.', w: { care: 3, divine: 2 }, sr: 0, al: 2, tag: null },
      { text: '다음에 더 잘할 점을 찾는다.', w: { discipline: 2, mind: 3 }, sr: 0, al: 0, tag: null },
      { text: '별것 아니라고 손사래를 친다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q98', stage: 'scenario', category: 'discipline', situation: '장을 보러 갔는데 사려던 목록에 없는 할인 상품이 많아요.', choices: [
      { text: '목록에 있는 것만 산다.', w: { discipline: 4, money: 1 }, sr: 0, al: 0, tag: null },
      { text: '꼭 쓸 것만 골라 조금 더 산다.', w: { money: 3, mind: 2 }, sr: 0, al: 0, tag: null },
      { text: '할인 상품으로 이번 주 메뉴를 새로 짠다.', w: { create: 3, money: 2 }, sr: 0, al: 0, tag: null },
      { text: '싸니까 넉넉히 담는다.', w: {  }, sr: 0, al: 0, tag: 'no_weight' }
    ] },
    { id: 'Q99', stage: 'scenario', category: 'care', situation: '친구가 고민을 털어놓는데 해결책은 바라지 않는 눈치예요.', choices: [
      { text: '끝까지 들어 주며 공감한다.', w: { care: 4, divine: 1 }, sr: 0, al: 2, tag: null },
      { text: '그래도 도움이 될 방법을 정리해 준다.', w: { mind: 3, lead: 1, care: 1 }, sr: 0, al: 1, tag: null },
      { text: '비슷한 내 경험을 이야기해 준다.', w: { care: 2, charm: 2 }, sr: 0, al: 0, tag: null },
      { text: '기분 전환하러 같이 나가자고 한다.', w: { lead: 2, care: 2, fit: 1 }, sr: 0, al: 1, tag: null }
    ] },
    { id: 'Q100', stage: 'scenario', category: 'mixed', situation: '비가 와서 주말 야외 계획이 취소됐어요.', choices: [
      { text: '집에서 할 수 있는 운동을 한다.', w: { fit: 4, discipline: 1 }, sr: 1, al: 0, tag: null },
      { text: '미뤄 둔 책이나 강의를 본다.', w: { mind: 4 }, sr: 0, al: 0, tag: null },
      { text: '집을 정리하고 꾸민다.', w: { charm: 2, discipline: 2, create: 1 }, sr: 1, al: 0, tag: null },
      { text: '친구를 집으로 초대한다.', w: { care: 3, lead: 2 }, sr: 0, al: 1, tag: null },
      { text: '느긋하게 쉰다.', w: { recovery: 4 }, sr: 1, al: 0, tag: null }
    ] }
  ]
};
