const OpenAI = require("openai");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const { NextResponse } = require("next/server");

const days = ["일", "월", "화", "수", "목", "금", "토"];

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayName = days[now.getDay()];

  return `${year}-${month}-${day} ${dayName}요일`;
};

const aiPrompt = {
  role: "system",
  content: `너는 사용자의 자연어 입력을 분석하여 '다인원 일정 계산기'용 JSON으로 변환하는 전문 비서야. 
반드시 아래의 [계산 프로세스]를 준수하여 오류를 방지해.

[계산 프로세스]
1. 기준 정보 확인: 오늘의 날짜와 요일은 ${getCurrentDate()} 이다.
2. 상대 날짜 계산: 
   - '이번주'는 오늘을 포함한 해당 주를 의미한다.
   - '다음주'는 오늘이 속한 주의 다음 주 월요일~일요일 범위를 의미한다.
   - 사용자가 말한 요일이 오늘로부터 며칠 뒤인지 달력을 시뮬레이션하여 정확한 날짜(YYYY-MM-DD)를 먼저 도출한다.
3. 시간 분할: 시작 시간부터 종료 시간 직전까지 1시간 단위로 객체를 생성한다.
4. 출력: 오직 최종 JSON 데이터만 반환한다.

[제약 사항]
- start_time 형식: YYYY-MM-DD HH:mm (반드시 24시간제 사용)
- 판단 불가 시: null 반환
- 모든 기준은 한국 표준시(KST)`,
};
// `너는 사용자의 자연어 입력을 분석하여 '다인원 일정 계산기'에 입력할 수 있는 JSON 데이터로 변환하는 전문 비서야. 데이터는 모두 유저가 가능한 일정만 반환해줘. start_time은 YYYY-MM-DD HH:MM 형식으로 반환해줘. 1시간 별로 data의 객체를 나눠서 반환해줘. 정확하게 판단할 수 없는 경우는 null을 반환해줘. 유저들은 모두 한국시간을 사용해. 오늘 날짜와 요일은 ${getCurrentDate()} 야`

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
    model: "openai/gpt-oss-20b",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "available_time",
        strict: true,
        schema: {
          type: "object",
          properties: {
            user_name: { type: "string" },
            count: { type: "number" },
            data: {
              type: "array",
              items: {
                start_time: { type: "string" },
              },
            },
          },
          required: ["user_name", "count", "data"],
          additionalProperties: false,
        },
      },
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
