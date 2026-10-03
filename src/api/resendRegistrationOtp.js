const RESEND_REG_OTP_API_URL = import.meta.env.VITE_RESEND_REG_OTP_API_URL;

export const resendRegistrationOtp = async (email) => {
  const response = await fetch(RESEND_REG_OTP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to resend OTP");
  }
  return data;
};
