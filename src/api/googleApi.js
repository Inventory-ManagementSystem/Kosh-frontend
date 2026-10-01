const GOOGLE_API_URL = import.meta.env.VITE_GOOGLE_API_URL;
const GOOGLE_JWT_API_URL = import.meta.env.VITE_GOOGLE_JWT_API_URL;

export const googleLogin = () => {
  window.location.href = GOOGLE_API_URL;
};

export const getGoogleJwt = async () => {
  const response = await fetch(GOOGLE_JWT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.detail || "Google login failed");
  }

  return data;
};
