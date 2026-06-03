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

[자연어 시간 단어 정의 (★저녁/밤/새벽 판단 기준)]
유저가 아래 단어를 사용하면 명시된 시간대로 간주하고 계산해:
- '오후', '저녁', '밤': 기본적으로 12시 이후의 시간(24시간제)을 의미함. (예: "저녁 7시" -> 19:00, "밤 11시" -> 23:00)
- '오전', '아침', '새벽': 기본적으로 12시 이전의 시간 또는 익일 새벽을 의미함. (예: "아침 9시" -> 09:00, "새벽 1시" -> 익일 01:00)
- 만약 "저녁에 봐", "오후에 가능"처럼 정확한 숫자가 없으면 시간 범위(오후: 12:00~18:00, 저녁/밤: 18:00~23:00)를 1시간 단위로 전부 채워줘.

[모호한 시간 처리 규칙]
사용자가 '오전/오후/저녁' 등의 수식어 없이 단독으로 "9시", "2시~5시"처럼만 말한 경우에 한해서만, 발생할 수 있는 모든 낮/밤/새벽의 경우의 수를 전부 계산하여 '각각 별도의 그룹'으로 scenarios 배열에 담아줘.

1. "9시에 가능해" (단일 시간)
   - 시나리오 A (오전): 09:00
   - 시나리오 B (오후/밤): 21:00
2. "9시부터 11시까지 가능해" (일반 구간)
   - 시나리오 A (오전~오전): 09:00~11:00
   - 시나리오 B (오전~오후/밤): 09:00~23:00
   - 시나리오 C (오후/밤~오후/밤): 21:00~23:00
3. "9시부터 2시까지 가능해" (숫자가 작아지는 구간 - 새벽 연장 포함)
   - 시나리오 A (오전~오후): 09:00 ~ 14:00 (오전 9시부터 오후 2시까지)
   - 시나리오 B (오전~익일 새벽): 09:00 ~ 다음날 02:00 (오전 9시부터 다음날 새벽 2시까지 통으로 비는 긴 시간)
   - 시나리오 C (오후/밤~익일 새벽): 21:00 ~ 다음날 02:00 (오후 9시부터 다음날 새벽 2시까지 술자리나 게임 시간)

[시간 분할 규칙]
- 모든 경우의 수는 1시간 단위로 쪼개어 배열에 넣는다.
- 유저가 "저녁 7시"라고 명시했다면 모호한 경우가 아니므로, 굳이 오전 7시 시나리오를 만들지 말고 '저녁 7시(19:00)' 시나리오 1개만 정확히 생성한다.
- 다음날로 넘어가는 새벽 시간의 경우 YYYY-MM-DD의 날짜를 +1일로 계산하여 정확히 반영한다.

[★빈 값 리턴 및 예외 처리 규칙 - 필수 준수]
- "언제든 상관없어", "아무 때나", "알아서 정해줘", "웅주님 언제 됨?" 처럼 특정 날짜나 구체적인 시간 숫자를 전혀 유추할 수 없는 대화인 경우, 절대로 임의로 새벽 시간이나 특정 시간대를 생성하지 마라.
- 판단이 불가능하거나 구체적인 시간이 없을 때는 무조건 scenarios를 빈 배열 [] 로 만들고, count를 0으로 리턴해야 한다.

[중요: 출력 JSON 포맷]
반드시 다른 설명 없이 오직 아래 구조의 JSON 데이터만 반환해. (9시부터 2시까지 예시처럼 모호할 경우 반드시 3개의 시나리오를 모두 생성해야 함)
{
  "reasoning": "유저가 오전/오후를 명시하지 않았으므로, 오전/오후/새벽 연장을 포함한 총 3가지 가능한 시나리오를 모두 생성함.",
  "user_name": "유저 이름 문자열",
  "scenarios": [
    {
      "description": "오전 9시 ~ 오후 2시",
      "count": 5,
      "data": [
        { "start_time": "2026-06-03 09:00" },
        { "start_time": "2026-06-03 10:00" },
        { "start_time": "2026-06-03 11:00" },
        { "start_time": "2026-06-03 12:00" },
        { "start_time": "2026-06-03 13:00" }
      ]
    },
    {
      "description": "오전 9시 ~ 익일 새벽 2시",
      "count": 17,
      "data": [
        { "start_time": "2026-06-03 09:00" },
        { "start_time": "2026-06-03 10:00" },
        { "start_time": "2026-06-03 11:00" },
        { "start_time": "2026-06-03 12:00" },
        { "start_time": "2026-06-03 13:00" },
        { "start_time": "2026-06-03 14:00" },
        { "start_time": "2026-06-03 15:00" },
        { "start_time": "2026-06-03 16:00" },
        { "start_time": "2026-06-03 17:00" },
        { "start_time": "2026-06-03 18:00" },
        { "start_time": "2026-06-03 19:00" },
        { "start_time": "2026-06-03 20:00" },
        { "start_time": "2026-06-03 21:00" },
        { "start_time": "2026-06-03 22:00" },
        { "start_time": "2026-06-03 23:00" },
        { "start_time": "2026-06-04 00:00" },
        { "start_time": "2026-06-04 01:00" }
      ]
    },
    {
      "description": "오후 9시 ~ 익일 새벽 2시",
      "count": 5,
      "data": [
        { "start_time": "2026-06-03 21:00" },
        { "start_time": "2026-06-03 22:00" },
        { "start_time": "2026-06-03 23:00" },
        { "start_time": "2026-06-04 00:00" },
        { "start_time": "2026-06-04 01:00" }
      ]
    }
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
