# team-shceduler-ai

---

## 한국어

### 소개

**팀 일정 조율기**는 Next.js 기반 웹 앱입니다. 캘린더·팀원·채팅을 한 화면에서 다루고, 자연어 입력을 AI(Groq)가 분석해 다인원 일정 계산에 맞는 JSON으로 변환합니다. 일정 기준은 한국 표준시(KST)입니다.

### 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org) 16 (App Router)
- **프론트엔드**: React 19, `react-calendar`, Zustand
- **백엔드/데이터**: [Supabase](https://supabase.com) (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI**: Groq SDK (`groq-sdk`), OpenAI 패키지

### 사전 요구 사항

- Node.js (프로젝트에 맞는 LTS 권장)
- npm 또는 호환 패키지 매니저

### 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

### 빌드·프로덕션

```bash
npm run build
npm start
```

### 환경 변수

프로젝트 루트에 `.env` 파일을 두고 아래 변수를 설정합니다. **실제 키는 저장소에 커밋하지 마세요.**

| 변수명 | 설명 |
|--------|------|
| `GROQ_API_KEY` | Groq API 키 (채팅/일정 파싱에 사용) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase 공개(Publishable/anon) 키 |

### 주요 디렉터리

```text
team-shceduler-ai/
├── app/
│   ├── api/
│   │   ├── calendar/route.js      # 일정 관련 API
│   │   ├── chat/route.js          # 자연어 -> 일정 JSON 변환 API
│   │   └── user/route.js          # 사용자 관련 API
│   ├── components/
│   │   ├── Calendar/
│   │   │   ├── Calendar.jsx
│   │   │   └── Calendar.module.css
│   │   ├── Chat/
│   │   │   ├── Chat.js
│   │   │   └── Chat.module.css
│   │   ├── DatePicker/
│   │   │   ├── DatePicker.jsx
│   │   │   └── DatePicker.module.css
│   │   ├── TeamMate/
│   │   │   ├── TeamMate.jsx
│   │   │   └── TeamMate.module.css
│   │   └── Teammate/
│   │       └── TeamMate.jsx
│   ├── store/
│   │   ├── calander.js            # 캘린더 상태 (Zustand)
│   │   └── user.js                # 사용자 상태
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── page.module.css
├── lib/
│   └── supabase/
│       ├── client.js              # 브라우저용 Supabase 클라이언트
│       └── server.js              # 서버용 Supabase 클라이언트
└── utils/
    └── timeStamp.js               # 날짜/시간 유틸
```

---

## English

### Overview

**Team Scheduler** is a Next.js web app that combines a calendar, teammates, and chat on one screen. Natural-language input is analyzed by AI (Groq) and turned into JSON suited for multi-person scheduling. All scheduling logic assumes **Korea Standard Time (KST)**.

### Tech stack

- **Framework**: [Next.js](https://nextjs.org) 16 (App Router)
- **UI**: React 19, `react-calendar`, Zustand
- **Data**: [Supabase](https://supabase.com) (`@supabase/ssr`, `@supabase/supabase-js`)
- **AI**: Groq SDK (`groq-sdk`), OpenAI package

### Prerequisites

- Node.js (LTS recommended)
- npm or a compatible package manager

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build and production

```bash
npm run build
npm start
```

### Environment variables

Create a `.env` file in the project root. **Do not commit real secrets to the repository.**

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key (chat / schedule parsing) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase public (publishable / anon) key |

If your local file uses a different name (e.g. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`), align it with what the app reads in `lib/supabase/*.js`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |

### Main directories

```text
team-shceduler-ai/
├── app/
│   ├── api/
│   │   ├── calendar/route.js      # Calendar-related API
│   │   ├── chat/route.js          # Natural language -> schedule JSON
│   │   └── user/route.js          # User-related API
│   ├── components/
│   │   ├── Calendar/
│   │   │   ├── Calendar.jsx
│   │   │   └── Calendar.module.css
│   │   ├── Chat/
│   │   │   ├── Chat.js
│   │   │   └── Chat.module.css
│   │   ├── DatePicker/
│   │   │   ├── DatePicker.jsx
│   │   │   └── DatePicker.module.css
│   │   ├── TeamMate/
│   │   │   ├── TeamMate.jsx
│   │   │   └── TeamMate.module.css
│   │   └── Teammate/
│   │       └── TeamMate.jsx
│   ├── store/
│   │   ├── calander.js            # Calendar state (Zustand)
│   │   └── user.js                # User state
│   ├── globals.css
│   ├── layout.js
│   ├── page.js
│   └── page.module.css
├── lib/
│   └── supabase/
│       ├── client.js              # Supabase client for browser
│       └── server.js              # Supabase client for server
└── utils/
    └── timeStamp.js               # Date/time utility
```
