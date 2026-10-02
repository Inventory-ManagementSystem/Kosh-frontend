const GOOGLE_LOGIN_API_URL = import.meta.env.VITE_GOOGLE_API_URL;
const GOOGLE_JWT_API_URL = import.meta.env.VITE_GOOGLE_JWT_API_URL;

export const googleLogin = () => {
  window.location.href = GOOGLE_LOGIN_API_URL;
};

export const getGoogleJwt = async () => {
  const response = await fetch(GOOGLE_JWT_API_URL, {
    method: "POST",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.detail || data.error || "Google login failed",
    );
  }

  return data;
};
