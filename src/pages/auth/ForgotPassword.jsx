import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, verifyResetOtp, resetPassword } from "../../api/auth";
import { useLanguage } from "../../i18n/LanguageContext";
import SplitLayout from './SplitLayout';
import StepIndicator from './components/StepIndicator';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 2) inputsRef.current[0]?.focus();
  }, [step]);

  const handleSendCode = async () => {
    setError("");
    setInfo("");
    setSuccess("");
    if (!email.trim()) {
      setError(t("auth.enterEmail"));
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setInfo(t("auth.resetSentTo", { email: email.trim() }));
      setCooldown(120);
      setStep(2);
    } catch (e) {
      setError(e.message || t("auth.sendFail"));
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    if (cooldown > 0) return;
    if (!email.trim()) {
      setError(t("auth.missingEmail"));
      return;
    }
    setResending(true);
    setError("");
    setInfo("");
    try {
      await forgotPassword(email.trim());
      setInfo(t("auth.resetResentTo", { email: email.trim() }));
      setCooldown(120);
    } catch (e) {
      setError(e.message || t("auth.resendFail"));
    } finally {
      setResending(false);
    }
  };
  const handleChangeOtp = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const d = val.slice(-1);
    const next = [...otp];
    next[idx] = d;
    setOtp(next);
    setError("");
    if (d && idx < 5) inputsRef.current[idx + 1]?.focus();
  };
  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  };
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError(t("auth.enter6Short"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyResetOtp({ email: email.trim(), otp: code });
      setInfo(t("auth.codeVerified"));
      setError("");
      setStep(3);
    } catch (e) {
      setError(e.message || t("auth.invalidCode"));
    } finally {
      setLoading(false);
    }
  };
  const handleReset = async () => {
    setError("");
    setSuccess("");
    if (!newPassword || !confirmPassword) {
      setError(t("auth.fillBoth"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("auth.passMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("auth.passMismatch"));
      return;
    }
    const code = otp.join("");
    setLoading(true);
    try {
      await resetPassword({
        email: email.trim(),
        otp: code,
        password: newPassword,
        passwordConfirm: confirmPassword,
      });
      setSuccess(t("auth.resetDone"));
      setTimeout(
        () =>
          navigate("/login", {
            state: { email: email.trim(), resetSuccess: true },
            replace: true,
          }),
        1500,
      );
    } catch (e) {
      setError(e.message || t("auth.resetFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitLayout>
      <StepIndicator step={step} t={t} />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 mb-3">
          {success}
        </div>
      )}
      {info && !error && !success && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2 mb-3">
          {info}
        </div>
      )}
      {step === 1 && (
        <>
          <h2 className="font-serif text-xl mb-3">{t("auth.resetTitle")}</h2>
          <label className="text-xs">{t("auth.email")}</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
            placeholder="you@example.com"
          />
          <button
            onClick={handleSendCode}
            disabled={loading}
            className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.sendingCode") : t("auth.sendCode")}
          </button>
          <div className="text-xs text-center mt-3">
            <button
              onClick={() => navigate("/login")}
              className="text-[#C19A6B]"
            >
              {t("auth.backLogin")}
            </button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="font-serif text-xl mb-3">
            {t("auth.enterCodeTitle")}
          </h2>
          <p className="text-xs text-[#8A8078] mb-2">
            {t("auth.codeSent")}{" "}
            <span className="font-medium text-[#4B3621]">{email}</span>{" "}
            <button onClick={() => setStep(1)} className="text-[#C19A6B] ms-1">
              {t("auth.change")}
            </button>
          </p>
          <div
            className="flex gap-2 justify-center my-4"
            onPaste={handlePaste}
            dir="ltr"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={otp[i]}
                onChange={(e) => handleChangeOtp(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
                className="w-10 h-12 border border-[#E7DFD3] rounded-lg text-center text-lg focus:ring-2 focus:ring-[#C19A6B] outline-none"
              />
            ))}
          </div>
          <button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.verifying") : t("auth.verify")}
          </button>
          <div className="text-xs text-center mt-3 text-[#8A8078]">
            {t("auth.noCode")}{" "}
            {cooldown > 0 ? (
              <span>
                {t("auth.resendIn", {
                  t: `${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}`,
                })}
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-[#C19A6B]"
              >
                {resending ? t("auth.sending") : t("auth.resend")}
              </button>
            )}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="font-serif text-xl mb-3">{t("auth.newPassTitle")}</h2>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("auth.newPassPh")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth.confirmPassPh")}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleReset}
            disabled={loading || !!success}
            className="w-full bg-[#4B3621] text-white py-2.5 rounded-lg text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("auth.updating")
              : success
                ? t("auth.success")
                : t("auth.updatePass")}
          </button>
        </>
      )}
    </SplitLayout>
  );
}

export default ForgotPassword;
