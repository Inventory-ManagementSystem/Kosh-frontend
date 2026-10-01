const GITHUB_LOGIN_API_URL = import.meta.env.VITE_GITHUB_LOGIN_API_URL;
const GITHUB_JWT_API_URL = import.meta.env.VITE_GITHUB_JWT_API_URL;

export const githubLogin = () => {
  window.location.href = GITHUB_LOGIN_API_URL;
};

export const githubJwt = async (code) => {
  const response = await fetch(GITHUB_JWT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || "GitHub login failed");
  }

  return data;
};
