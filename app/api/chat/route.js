const OpenAI = require("openai");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const { NextResponse } = require("next/server");

const days = ["일", "월", "화", "수", "목", "금", "토"];

const getCurrentDate = () => {
  // Intl.DateTimeFormat을 사용해 서버 위치와 상관없이 무조건 KST(Asia/Seoul) 기준으로 날짜를 뽑습니다.
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  // 예 출력: 2026. 06. 02. (화)
  const parts = formatter.formatToParts(new Date());

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;
  const weekday = parts.find((p) => p.type === "weekday").value;

  return `${year}-${month}-${day} (${weekday}요일)`;
};

const aiPrompt = {
  role: "system",
  content: `너는 사용자의 자연어 입력을 분석하여 '다인원 일정 계산기'용 JSON으로 변환하는 전문 비서야.

[기준 정보]
- 오늘의 날짜와 요일: ${getCurrentDate()}

[날짜 계산 규칙]
- '이번주 [요일]': 오늘 요일과 상관없이, 이번 주 달력에 속한 해당 요일의 날짜를 계산해.
- '다음주 [요일]': 다음 주 달력에 속한 해당 요일의 날짜를 계산해.
- '오후/저녁' 표현은 반드시 24시간제(12를 더함)로 변환해. (예: 오후 2시 -> 14:00)

[시간 분할 규칙]
- 사용자가 말한 시작 시간부터 종료 시간 직전까지 '1시간 단위'로 쪼개어 data 배열에 추가해.
- 예: "금요일 15시부터 17시" -> ["2026-06-05 15:00", "2026-06-05 16:00"] (총 2개 객체, count: 2)

[중요: 출력 JSON 포맷]
반드시 다른 설명 없이 오직 아래 구조의 JSON 데이터만 반환해. 키 이름을 마음대로 바꾸지 마.
{
  "reasoning": "오늘 기준 날짜와 요일을 바탕으로 날짜를 계산한 추론 과정",
  "user_name": "유저 이름 문자열",
  "count": 데이터개수숫자,
  "data": [
    { "start_time": "YYYY-MM-DD HH:mm" }
  ]
}`,
};

export async function getGroqChatCompletion(userName, message) {
  return groq.chat.completions.create({
    messages: [
      {
        role: aiPrompt.role,
        content: aiPrompt.content,
      },
      {
        role: "user",
        content: `user_name: ${userName} message: ${message}`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: {
      type: "json_object",
      // json_schema: {
      //   name: "available_time",
      //   strict: true,
      //   schema: {
      //     type: "object",
      //     properties: {
      //       // 🌟 AI의 추론 과정을 담을 필드 추가 (정확도 극대화)
      //       reasoning: {
      //         type: "string",
      //         description:
      //           "오늘 기준 날짜와 요일을 바탕으로 사용자가 말한 날짜를 계산하는 중간 과정 (예: 오늘 화요일이므로 이번주 금요일은 3일 뒤인 2026-06-05)",
      //       },
      //       user_name: { type: "string" },
      //       count: { type: "number" },
      //       data: {
      //         type: "array",
      //         items: {
      //           start_time: { type: "string" },
      //         },
      //       },
      //     },
      //     // required에 reasoning 필수 추가
      //     required: ["reasoning", "user_name", "count", "data"],
      //     additionalProperties: false,
      //   },
      // },
    },
  });
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function POST(req) {
  const { userName, message } = await req.json();
  const response = await getGroqChatCompletion(userName, message);

  return NextResponse.json({
    success: true,
    data: JSON.parse(response.choices[0]?.message?.content),
  });
}

export { POST };

/**방법 A: 시스템 프롬프트에 '현재 시간' 주입
가장 확실한 방법은 API 요청 시점에 서버의 현재 시간을 프롬프트에 포함하는 것입니다.

수정된 프롬프트 예시:
"오늘 날짜와 요일은 **2026-03-21 (토요일)**이야. 이를 기준으로 사용자의 메시지에서 날짜와 시간을 추출해줘. 'Next Wednesday'는 오늘 이후 처음 돌아오는 수요일을 의미해."

방법 B: Step-by-Step 사고 유도 (Chain of Thought)
AI가 바로 JSON을 뱉지 않고, 내부적으로 계산 과정을 거치도록 유도하면 정확도가 비약적으로 상승합니다.

프롬프트 추가 지침:

오늘의 날짜와 요일을 확인한다.

사용자가 말한 요일이 오늘로부터 며칠 뒤인지 계산한다.

계산된 날짜를 YYYY-MM-DD 형식으로 변환한다.

최종 결과만 JSON으로 출력한다. */
