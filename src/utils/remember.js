const REMEMBER_KEY = "remember";
const SESSION_KEY = "sessionActive";
export const markLogin = (remember) => {
  localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  sessionStorage.setItem(SESSION_KEY, "1");
};
export const clearLoginMarkers = () => {
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};
export const canRestoreSession = () => {
  const remember = localStorage.getItem(REMEMBER_KEY);
  if (remember !== "0") return true;
  return sessionStorage.getItem(SESSION_KEY) === "1";
};
