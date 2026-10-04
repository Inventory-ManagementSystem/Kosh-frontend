import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getGithubJwt } from "../../api/githubApi";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../api/getProfileApi";

function GitHubOAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleGithubCallback = async () => {
      try {
        const response = await getGithubJwt();
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
        console.error("GitHub login failed:", error);
      }
    };

    handleGithubCallback();
  }, [login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#00010f] text-[#e6e6e8]">
      Signing you in...
    </div>
  );
}

export default GitHubOAuthCallback;
