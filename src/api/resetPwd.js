const RESETPWD_API_URL = import.meta.env.VITE_RESETPWD_API_URL;

export const resetPwd = async (resetToken, newPassword, confirmPassword) => {
  const response = await fetch(RESETPWD_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reset_token: resetToken,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to reset password");
  }

  return data;
};
