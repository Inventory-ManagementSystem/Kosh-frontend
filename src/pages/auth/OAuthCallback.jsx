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
        const data = await getGoogleJwt();

        login(data.access, data.refresh);

        if (data.has_business) {
          navigate("/dashboard");
        } else {
          navigate("/setup-business");
        }
      } catch (error) {
        console.error("Google login failed:", error);
        navigate("/login");
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
