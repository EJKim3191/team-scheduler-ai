function getCookie(name) {
  var value = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return value ? unescape(value[2]) : null;
}

const setCookie = (name, value, days) => {
  document.cookie = `${name}=${value}; path=/; max-age=3600;`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; max-age=0;`;
};

export { getCookie, setCookie, deleteCookie };
