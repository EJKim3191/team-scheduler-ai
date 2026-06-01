/**
 * IssueSelector 스크롤·검색 테스트용 더미 데이터
 *
 * 사용 예 (직접 적용):
 *   import IssueSelector from "@/app/components/IssueSelector/IssueSelector";
 *   import { DUMMY_ISSUES } from "@/app/components/IssueSelector/dummyIssues";
 *
 *   <IssueSelector issues={DUMMY_ISSUES} />
 */

/** @typedef {{ id: string | number, title: string, status?: string, team?: { team_name?: string } }} IssueOption */

/** @type {IssueOption[]} */
export const DUMMY_ISSUES = [
  {
    id: 1,
    title: "스프린트 일정 조율",
    status: "open",
    team: { team_name: "알파" },
  },
  {
    id: 2,
    title: "배포 파이프라인 점검",
    status: "closed",
    team: { team_name: "베타" },
  },
  {
    id: 3,
    title: "온보딩 플로우 개선",
    status: "open",
    team: { team_name: "감마" },
  },
  {
    id: 4,
    title: "캘린더 RLS 정책 검토",
    status: "open",
    team: { team_name: "알파" },
  },
  {
    id: 5,
    title: "팀 초대 UX 문구 수정",
    status: "closed",
    team: { team_name: "델타" },
  },
  {
    id: 6,
    title: "관리자 대시보드 이슈 집계",
    status: "open",
    team: { team_name: "베타" },
  },
  {
    id: 7,
    title: "채팅 API 응답 지연 조사",
    status: "open",
    team: { team_name: "감마" },
  },
  {
    id: 8,
    title: "모바일 레이아웃 깨짐 수정",
    status: "closed",
    team: { team_name: "알파" },
  },
  {
    id: 9,
    title: "이슈 셀렉터 검색 필터 QA",
    status: "open",
    team: { team_name: "델타" },
  },
  {
    id: 10,
    title: "프로덕션 배포 체크리스트",
    status: "closed",
    team: { team_name: "베타" },
  },
];
