const FORGOTPWD_API_URL = import.meta.env.VITE_FORGOTPWD_API_URL;

export const forgotPwd = async (email) => {
  const response = await fetch(FORGOTPWD_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to send OTP");
  }

  return data;
};
