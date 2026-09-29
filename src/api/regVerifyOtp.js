const REG_VERIFY_OTP_API_URL=import.meta.env.VITE_REG_VERIFY_OTP_API_URL;
export const regVerifyOtp=async(otpData)=>{
    const response=await fetch(REG_VERIFY_OTP_API_URL,{
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(otpData),
    });
    const data = await response.json();
    if (!response.ok) {
    const error = new Error(
      data.error || "OTP verification failed"
    );
    error.status = response.status;
    error.remainingAttempts = data.remaining_attempts;
     throw error;
  }
  return data;
}