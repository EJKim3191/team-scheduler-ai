import { validateCodeFormat } from "@/utils/teamCode";

/** blur 검증 우선순위 (앞일수록 먼저 표시) */
export const SIGNUP_FIELD_PRIORITY = [
  "id",
  "password",
  "confirmPassword",
  "name",
  "teamCode",
];

const VALID = { valid: true, message: null };

/**
 * blur 시 검증·에러 표시 여부 (길이 > 0일 때만 검증)
 * 필드별 기준을 바꾸려면 이 함수만 수정하세요.
 */
export function shouldValidateFieldOnBlur(field, values) {
  switch (field) {
    case "id":
      return values.id.trim().length > 0;
    case "password":
      return values.password.length > 0;
    case "confirmPassword":
      return values.confirmPassword.length > 0;
    case "name":
      return values.name.trim().length > 0;
    case "teamCode":
      return values.teamCode.trim().length > 0;
    default:
      return false;
  }
}

// ——— 아래 함수들에서 규칙·메시지를 자유롭게 수정하세요 ———

export function validateEmail(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: "이메일을 입력해주세요." };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, message: "올바른 이메일 형식이 아닙니다." };
  }
  return VALID;
}

export function validatePassword(value) {
  if (!value) {
    return { valid: false, message: "비밀번호를 입력해주세요." };
  }
  if (value.length < 8) {
    return { valid: false, message: "비밀번호는 8자 이상이어야 합니다." };
  }
  return VALID;
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { valid: false, message: "비밀번호 확인을 입력해주세요." };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: "비밀번호가 일치하지 않습니다." };
  }
  return VALID;
}

export function validateName(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: "이름을 입력해주세요." };
  }
  if (trimmed.length > 10) {
    return { valid: false, message: "이름은 10자 이하로 입력해주세요." };
  }
  return VALID;
}

export function validateTeamCode(value) {
  if (!value.trim()) {
    return { valid: false, message: "팀 코드를 입력해주세요." };
  }
  if (!validateCodeFormat(value)) {
    return { valid: false, message: "팀 코드 형식이 올바르지 않습니다." };
  }
  return VALID;
}

/** 필드별 검증 라우터 — 새 필드는 여기와 SIGNUP_FIELD_PRIORITY에 추가 */
export function validateSignupField(field, values) {
  switch (field) {
    case "id":
      return validateEmail(values.id);
    case "password":
      return validatePassword(values.password);
    case "confirmPassword":
      return validateConfirmPassword(values.password, values.confirmPassword);
    case "name":
      return validateName(values.name);
    case "teamCode":
      return validateTeamCode(values.teamCode);
    default:
      return VALID;
  }
}

/** touched + blur 시 길이 > 0 인 필드만 검증해 field → message 맵 반환 */
export function collectFieldErrors(touched, values) {
  const errors = {};
  for (const field of SIGNUP_FIELD_PRIORITY) {
    if (!touched[field]) continue;
    if (!shouldValidateFieldOnBlur(field, values)) continue;
    const result = validateSignupField(field, values);
    if (!result.valid && result.message) {
      errors[field] = result.message;
    }
  }
  return errors;
}

/** 우선순위에 따라 표시할 메시지 하나만 선택 */
export function pickPriorityErrorMessage(fieldErrors) {
  for (const field of SIGNUP_FIELD_PRIORITY) {
    if (fieldErrors[field]) return fieldErrors[field];
  }
  return "";
}
