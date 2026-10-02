import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGithubJwt } from "../../api/githubApi";
import { useAuth } from "../../context/AuthContext";

function GitHubOAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleGithubCallback = async () => {
      try {
        const response = await getGithubJwt();

        console.log("GitHub JWT response:", response);

        login(response.data.access);

        if (response.data.has_business === true) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/setup-business", { replace: true });
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
