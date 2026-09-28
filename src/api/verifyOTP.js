const VERIFY_OTP_API_URL = import.meta.env.VITE_VERIFY_OTP_API_URL;

export const verifyOTP = async (email, otp) => {
  const response = await fetch(VERIFY_OTP_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "OTP verification failed");
  }

  return data;
};
