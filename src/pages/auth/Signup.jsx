import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { signup as signupApi, googleLogin as googleLoginApi, sendVerificationOtp } from "../../api/auth";
import { useRole } from "../../context/RoleContext";
import { useLanguage } from "../../i18n/LanguageContext";
import SplitLayout from './SplitLayout';

export function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { setAuth } = useRole();
  const [role, setRole] = useState("customer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async () => {
    setError("");
    setFieldErrors({});
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !passwordConfirm
    ) {
      setError(t("auth.fillAll"));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t("auth.passMismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.passMin"));
      return;
    }
    setLoading(true);
    try {
      const res = await signupApi({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
        role,
      });
      const emailToVerify = res.data?.email || email.trim();
      try {
        await sendVerificationOtp(emailToVerify);
      } catch (otpErr) {
        console.warn(
          "sendVerificationOtp after signup failed:",
          otpErr?.message,
        );
      }
      navigate("/otp", {
        state: {
          email: emailToVerify,
          fromSignup: true,
          from: location.state?.from,
        },
      });
    } catch (e) {
      if (e.details) {
        const fe = {};
        e.details.forEach((d) => {
          if (d.path) fe[d.path] = d.msg;
        });
        setFieldErrors(fe);
        setError(e.message || t("auth.validationFailed"));
      } else {
        setError(e.message || t("auth.signupFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const errFor = (f) =>
    fieldErrors[f] ? (
      <div className="text-[11px] text-red-600 mt-1">{fieldErrors[f]}</div>
    ) : null;

  const handleGoogle = async (credentialResponse) => {
    setError("");
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError(t("auth.googleFailed"));
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await googleLoginApi({ idToken, role });
      if (res?.token) localStorage.setItem("token", res.token);
      if (res?.data) localStorage.setItem("user", JSON.stringify(res.data));
      if (setAuth && res?.data) setAuth(res.data, res.token);
      navigate(location.state?.from || "/", { replace: true });
    } catch (e) {
      setError(e.message || t("auth.googleFailed"));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SplitLayout>
      <h2 className="font-serif text-2xl mb-1">{t("auth.createTitle")}</h2>
      <p className="text-xs text-[#8A8078] mb-4">{t("auth.createSub")}</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          {
            id: "customer",
            label: t("auth.customer"),
            desc: t("auth.customerDesc"),
          },
          {
            id: "gallery_owner",
            label: t("auth.owner"),
            desc: t("auth.ownerDesc"),
          },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className={`border rounded-lg p-3 text-start ${role === r.id ? "border-[#4B3621] bg-[#FAF7F2]" : "border-[#E7DFD3]"}`}
          >
            <div className="text-xs font-semibold">{r.label}</div>
            <div className="text-[11px] text-[#8A8078]">{r.desc}</div>
          </button>
        ))}
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs">{t("auth.firstName")}</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
          {errFor("firstName")}
        </div>
        <div>
          <label className="text-xs">{t("auth.lastName")}</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
          {errFor("lastName")}
        </div>
        <div className="col-span-2">
          <label className="text-xs">{t("auth.emailReq")}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            placeholder="you@example.com"
          />
          {errFor("email")}
        </div>
        <div className="col-span-2">
          <label className="text-xs">{t("auth.passReq")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
          {errFor("password")}
        </div>
        <div className="col-span-2">
          <label className="text-xs">{t("auth.confirmPassReq")}</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
          />
          {errFor("passwordConfirm")}
          {errFor("role")}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm font-medium mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("auth.creating") : t("auth.createAccount")}
      </button>
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-[#E7DFD3]" />
        <span className="text-[11px] text-[#8A8078]">
          {t("auth.orContinueWith")}
        </span>
        <div className="flex-1 h-px bg-[#E7DFD3]" />
      </div>
      <div className="flex justify-center [&>div]:w-full [&>div>div]:w-full [&iframe]:w-full">
        {googleLoading ? (
          <div className="w-full border border-[#E7DFD3] rounded-lg py-2.5 text-center text-xs text-[#8A8078]">
            {t("auth.creating")}
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
      <div className="text-xs text-center mt-3">
        {t("auth.haveAccount")}{" "}
        <button
          onClick={() =>
            navigate("/login", {
              state: { from: location.state?.from },
            })
          }
          className="text-[#C19A6B]"
        >
          {t("auth.login")}
        </button>
      </div>
    </SplitLayout>
  );
}

export default Signup;
