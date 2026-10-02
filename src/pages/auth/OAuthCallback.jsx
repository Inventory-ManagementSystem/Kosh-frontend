import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getGoogleJwt } from "../../api/googleApi";
import { useAuth } from "../../context/AuthContext";

function OAuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const response = await getGoogleJwt();

        console.log("Google JWT response:", response);
        console.log("Access token:", response.data.access);

        login(response.data.access);

        if (response.data.has_business === true) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/setup-business", { replace: true });
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
