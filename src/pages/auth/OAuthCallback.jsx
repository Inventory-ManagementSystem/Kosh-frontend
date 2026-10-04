import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getGoogleJwt } from "../../api/googleApi";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../api/getProfileApi";

function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const response = await getGoogleJwt();
        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;
        login(accessToken, refreshToken);
        const profile = await getProfile(accessToken);
        const role = profile.data?.role;
        if (role === "owner") {
          navigate("/dashboard", { replace: true });
        } else if (role === "employee") {
          navigate("/employee-dashboard", { replace: true });
        } else {
          localStorage.setItem("oauthUser", "true");
          navigate("/role", { replace: true });
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    };
    handleGoogleCallback();
  }, [login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00010f] text-[#e6e6e8]">
      Signing you in...
    </div>
  );
}

export default OAuthCallback;
