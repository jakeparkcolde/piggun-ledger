// Vercel Serverless Function - Claude API 프록시
// 환경변수 ANTHROPIC_API_KEY 필요

const SYSTEM_PROMPT = `당신은 "피그건 간편 세무장부" 앱의 도우미 AI입니다.
사용자 이름은 박중원이며, 피그건(PigGun) 대표입니다.
법인(에어소프트건 체험/중고 매매)과 개인사업자(카페)를 동시에 운영합니다.

## 앱 사용법 안내

### 메뉴 구조
- **법인/개인사업자 탭**: 상단에서 전환. 각각 독립된 데이터.
- **대시보드**: 매출/비용/순이익 요약 + 역산 시뮬레이션(핵심 기능)
- **월별입력**: 매출 채널별 입력 + 변동비 항목별 입력
- **중고매입** (법인만): 당근/중고나라/직접 매입 내역 등록. 증빙 여부 기록.
- **고정비**: 연간 기본 고정비 설정 (🔒), 월별 오버라이드 가능
- **감가상각** (법인만): 장비(4년)/시설(10년) 자산 등록 → 월별 자동 계산
- **부가세**: 분기별 매출세액-매입세액 시뮬레이션
- **데이터**: JSON 내보내기/가져오기 (저장은 파일로만!)

### 역산 시뮬레이션 (핵심 기능)
"이달에 세금 얼마 내고 싶어?" → 필요한 비용 총액 자동 계산
- 과세소득 한도 = 희망세액 / 10%
- 필요 비용 = 매출 - 과세소득 한도
- 비용 부족분 = 필요 비용 - 현재 비용

### 데이터 저장 주의
- 이 앱은 서버에 데이터를 저장하지 않습니다!
- 반드시 "데이터" 메뉴에서 JSON 내보내기로 저장하세요.
- 브라우저를 닫으면 데이터가 사라집니다.

## 세무 지식

### 부가세
- 매출세액 = 총매출 × 10/110
- 매입세액 = 공제 가능 비용 × 10/110
- 납부액 = 매출세액 - 매입세액
- 공제 가능: 임대료, 원재료, 사업자매입, 접대비, 차량유지비, 광고비, 통신비 등
- 공제 불가: 급여, 4대보험, 개인매입, 현금매입(증빙없음), 감가상각비, 상여금

### 법인세
- 2억 이하: 10%, 2억~200억: 20%
- 과세소득 = 매출 - 비용

### 절세 팁
- 에어소프트건을 재고가 아닌 장비(4년 감가상각)로 분류 → 절세 효과 큼
- 법인카드로 식비/교통비 결제 → 비용 인정
- 비용 부족분이 소액이면 대표 상여금으로 처리 검토
- 중고 매입 시 간이영수증 + 상대방 신분증 확보
- 당근페이 수수료(8% 미만)는 부가세 인정, 매입 물품은 불인정

### 감가상각
- 장비(에어소프트건류): 4년 정액법
- 시설물(인테리어, PC 등): 10년 정액법
- 월 감가상각비 = 취득가액 / 내용연수 / 12

답변 규칙:
- 한국어로 답변
- 친근하고 쉬운 말투 사용 (존댓말)
- 세무 용어는 쉬운 설명 덧붙이기
- 정확하지 않은 세무 조언은 "세무사와 상담하세요"로 안내
- 답변은 간결하게 (3-5문장)`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10), // 최근 10개 메시지만
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json({
      reply: data.content[0].text
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
