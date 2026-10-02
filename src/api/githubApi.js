const GITHUB_LOGIN_API_URL = import.meta.env.VITE_GITHUB_LOGIN_API_URL;
const GITHUB_JWT_API_URL = import.meta.env.VITE_GITHUB_JWT_API_URL;

export const githubLogin = () => {
  window.location.href = GITHUB_LOGIN_API_URL;
};

export const getGithubJwt = async () => {
  const response = await fetch(GITHUB_JWT_API_URL, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.detail || data.error || "GitHub login failed",
    );
  }

  return data;
};
