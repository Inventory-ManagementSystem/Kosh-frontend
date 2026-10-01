const GITHUB_LOGIN_API_URL = import.meta.env.VITE_GITHUB_LOGIN_API_URL;

export const githubLogin = () => {
  window.location.href = GITHUB_LOGIN_API_URL;
};
