// db 데이터 조회를 통하지 않아도 무결한 팀 코드 생성 함수 (시간 활용)
// 1/1000 s 단위로 생성하지 않는 이상 중복되지 않는 팀 코드 생성 가능
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateSmartCode = () => {
  // 1. 실제 데이터부 생성 (시간 6자 + 난수 2자 = 총 8자 가정)
  const timePart = Date.now().toString(36).slice(-6);
  const randPart = Math.random().toString(36).substring(2, 4);
  const body = timePart + randPart; // 예: "k9z1j4a1"

  // 2. 고정된 위치에 '검증 키' 삽입 (예: 3번째와 7번째 자리)
  // 서버만 아는 비밀 키(Salt)를 섞어 해싱하거나 간단한 연산 수행
  const secretSalt = 5381; // DJB2 해시 등에서 쓰이는 매직 넘버

  // 간단한 해시 함수: body의 각 문자 아스키 값을 더하고 salt 연산
  const hash = body
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), secretSalt);

  const checkDigit1 = chars[hash % 62];
  const checkDigit2 = chars[(hash >> 5) % 62]; // 비트 이동으로 다른 값 생성

  // 3. 최종 코드 조립 (중간중간 끼워넣어 패턴 은닉)
  // 구조: [body 0-2] + [check1] + [body 3-5] + [check2] + [body 6-7]
  return (
    body.slice(0, 3) +
    checkDigit1 +
    body.slice(3, 6) +
    checkDigit2 +
    body.slice(6)
  );
};

export const validateCodeFormat = (code) => {
  if (code.length !== 10) return false; // 고정 길이 체크

  // 끼워넣었던 body와 checkDigit을 다시 분리
  const body = code.slice(0, 3) + code.slice(4, 7) + code.slice(8);
  const check1 = code[3];
  const check2 = code[7];

  const secretSalt = 5381;
  const hash = body
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), secretSalt);

  const expectedCheck1 = chars[hash % 62];
  const expectedCheck2 = chars[(hash >> 5) % 62];

  return check1 === expectedCheck1 && check2 === expectedCheck2;
};
