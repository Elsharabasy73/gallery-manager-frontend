import { useState } from "react";
import { googleLogin as googleLoginApi } from "../../api/auth";

export function useGoogleAuth({ role, setError, setAuth, navigate, redirectTo, googleFailedMessage }) {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async (credentialResponse) => {
    setError("");
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError(googleFailedMessage);
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await googleLoginApi({ idToken, role });
      if (res?.token) localStorage.setItem("token", res.token);
      if (res?.data) localStorage.setItem("user", JSON.stringify(res.data));
      if (setAuth && res?.data) setAuth(res.data, res.token);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(e.message || googleFailedMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return { handleGoogle, googleLoading };
}
