import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login as loginApi, sendVerificationOtp } from "../../api/auth";
import { getMyGallery } from "../../api/galleries";
import { useRole } from "../../context/RoleContext";
import { useLanguage } from "../../i18n/LanguageContext";
import { isTokenExpired } from "../../utils/auth";
import SplitLayout from './SplitLayout';
import { useGoogleAuth } from "./useGoogleAuth";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useRole();
  const { t } = useLanguage();
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState("customer");
  const { handleGoogle, googleLoading } = useGoogleAuth({
    role: googleRole,
    setError: (...args) => setError(...args),
    setAuth,
    navigate,
    redirectTo: location.state?.from || "/",
    googleFailedMessage: t("auth.googleFailed"),
  });
  const [error, setError] = useState(
    location.state?.justVerified
      ? ""
      : location.state?.justSignedUp
        ? t("auth.createdLogin")
        : "",
  );
  const sessionExpired =
    location.state?.expired ||
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("expired") === "1");

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token && !isTokenExpired(token)) {
        navigate(location.state?.from || "/", { replace: true });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError(t("auth.needEmailPass"));
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi({ email: email.trim(), password });
      if (res?.token) localStorage.setItem("token", res.token);
      if (res?.data) localStorage.setItem("user", JSON.stringify(res.data));
      if (setAuth && res?.data) setAuth(res.data, res.token);

      // If gallery_owner, check if they have a gallery — redirect to create if not
      const userRole = res?.data?.role;
      if (userRole === "gallery_owner") {
        try {
          const galRes = await getMyGallery();
          const gal = galRes?.data?.data || galRes?.data || galRes;
          const hasGallery = gal && (gal.id || gal._id || gal.gallery?.id);
          if (!hasGallery) {
            navigate("/dashboard/create-gallery", { replace: true });
            return;
          }
        } catch {
          // 404 or error means no gallery
          navigate("/dashboard/create-gallery", { replace: true });
          return;
        }
      }

      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (e) {
      if (e.status === 403 && /not verified|verify/i.test(e.message)) {
        try {
          await sendVerificationOtp(email.trim());
        } catch {}
        navigate("/otp", {
          state: { email: email.trim(), from: location.state?.from },
        });
        return;
      }
      setError(e.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitLayout>
      <h2 className="font-serif text-2xl mb-1">{t("auth.welcomeBack")}</h2>
      <p className="text-xs text-[#8A8078] mb-6">{t("auth.loginSub")}</p>
      {sessionExpired && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">
          {t("auth.sessionExpired")}
        </div>
      )}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {location.state?.resetSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">
          {t("auth.resetOkLogin")}
        </div>
      )}
      {location.state?.justVerified && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">
          {t("auth.verifiedLogin")}
        </div>
      )}
      {location.state?.justSignedUp &&
        !String(error).includes(t("auth.createdLogin").slice(0, 8)) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">
            {t("auth.createdOk")}
          </div>
        )}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { id: "customer", label: t("auth.customer") },
          { id: "gallery_owner", label: t("auth.owner") },
        ].map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setGoogleRole(r.id)}
            className={`border rounded-lg px-2 py-1.5 text-[11px] font-medium ${googleRole === r.id ? "border-[#4B3621] bg-[#FAF7F2] text-[#4B3621]" : "border-[#E7DFD3] text-[#8A8078]"}`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&iframe]:w-full">
        {googleLoading ? (
          <div className="w-full border border-[#E7DFD3] rounded-lg py-2.5 text-center text-xs text-[#8A8078]">
            {t("auth.loggingIn")}
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setError(t("auth.googleFailed"))}
            useOneTap={false}
            shape="rectangular"
            width="100%"
          />
        )}
      </div>
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-[#E7DFD3]" />
        <span className="text-[11px] text-[#8A8078]">
          {t("auth.orContinueWith")}
        </span>
        <div className="flex-1 h-px bg-[#E7DFD3]" />
      </div>
      <div className="space-y-3">
        <div>
          <label htmlFor="login-email" className="text-xs font-medium">{t("auth.email")}</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2.5 mt-1 text-sm outline-none transition focus-visible:border-[#C19A6B] focus-visible:ring-2 focus-visible:ring-[#C19A6B]/30"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="text-xs font-medium">{t("auth.password")}</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full border border-[#E7DFD3] rounded-lg px-3 py-2.5 mt-1 text-sm pe-10 outline-none transition focus-visible:border-[#C19A6B] focus-visible:ring-2 focus-visible:ring-[#C19A6B]/30"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label={showPw ? t("auth.hidePassword") : t("auth.showPassword")}
              onClick={() => setShowPw((v) => !v)}
              className="material-symbols-outlined absolute end-1 top-1/2 -translate-y-1/2 min-h-10 min-w-10 rounded-md text-[18px] text-[#8A8078] transition hover:bg-[#FAF7F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C19A6B]"
            >
              {showPw ? "visibility_off" : "visibility"}
            </button>
          </div>
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("auth.loggingIn") : t("auth.login")}
        </button>
        <div className="flex justify-between text-xs">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-[#C19A6B]"
          >
            {t("auth.forgot")}
          </button>
          <button
            onClick={() =>
              navigate("/signup", {
                state: { from: location.state?.from },
              })
            }
            className="text-[#4B3621] font-medium"
          >
            {t("auth.createAccount")}
          </button>
        </div>
      </div>
    </SplitLayout>
  );
}

export default Login;
