function getCookie(name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? unescape(value[2]) : null;
}

const PERMANENT_MAX_AGE = 315360000; // ~10 years

const setCookie = (name, value, days) => {
  let maxAge = 3600;

  if (days === Infinity || days === -1) {
    maxAge = PERMANENT_MAX_AGE;
  } else if (typeof days === "number" && days > 0) {
    maxAge = days * 24 * 60 * 60;
  }

  document.cookie = `${name}=${value}; path=/; max-age=${maxAge};`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0;`;
};

export { getCookie, setCookie, deleteCookie };
