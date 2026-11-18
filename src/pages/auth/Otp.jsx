import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { sendVerificationOtp, verifyEmail as verifyEmailApi } from "../../api/auth";
import { useLanguage } from "../../i18n/LanguageContext";
import SplitLayout from './SplitLayout';
import OtpInput from './components/OtpInput';

export function Otp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [editingEmail, setEditingEmail] = useState(!initialEmail);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState(
    initialEmail ? `${t("auth.codeSentTo")} ${initialEmail}` : "",
  );
  const [cooldown, setCooldown] = useState(initialEmail ? 120 : 0);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (initialEmail && !editingEmail) inputsRef.current[0]?.focus();
  }, [initialEmail, editingEmail]);

  const handleResend = async () => {
    if (!email.trim()) {
      setError(t("auth.enterEmailFirst"));
      setEditingEmail(true);
      return;
    }
    if (cooldown > 0) return;
    setResending(true);
    setError("");
    setInfo("");
    try {
      await sendVerificationOtp(email.trim());
      setInfo(t("auth.codeResentTo", { email: email.trim() }));
      setCooldown(120);
    } catch (e) {
      setError(e.message || t("auth.resendFail"));
    } finally {
      setResending(false);
    }
  };
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      setError(t("auth.enter6"));
      return;
    }
    if (!email.trim()) {
      setError(t("auth.missingEmail"));
      setEditingEmail(true);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await verifyEmailApi({ email: email.trim(), otp: code });
      setSuccess(t("auth.verifiedRedirect"));
      setInfo("");
      setTimeout(() => {
        navigate("/login", {
          state: {
            email: email.trim(),
            justVerified: true,
            from: location.state?.from,
          },
          replace: true,
        });
      }, 1500);
    } catch (e) {
      setError(e.message || t("auth.invalidCode"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitLayout>
      <h2 className="font-serif text-xl mb-1">{t("auth.verifyTitle")}</h2>
      {editingEmail ? (
        <div className="mb-4">
          <label className="text-xs font-medium">{t("auth.email")}</label>
          <div className="flex gap-2 mt-1">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 border border-[#E7DFD3] rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => {
                if (email.trim()) {
                  setEditingEmail(false);
                  setInfo(`${t("auth.codeSentTo")} ${email.trim()}`);
                  setCooldown(120);
                }
              }}
              className="px-4 py-2 bg-[#4B3621] text-white rounded-lg text-xs whitespace-nowrap"
            >
              {t("auth.done")}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-[#8A8078] mb-4">
          {t("auth.codeSentTo")}{" "}
          <span className="font-medium text-[#4B3621]">{email}</span>{" "}
          <button
            onClick={() => setEditingEmail(true)}
            className="text-[#C19A6B] ms-1"
          >
            {t("auth.change")}
          </button>
        </p>
      )}
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
      <OtpInput
        value={otp}
        onChange={setOtp}
        onClearError={() => setError("")}
        inputsRef={inputsRef}
        containerClassName="flex gap-2 justify-center my-6"
        inputClassName="w-10 h-12 border border-[#E7DFD3] rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-[#C19A6B] outline-none"
        allowArrowNavigation
      />
      <button
        onClick={handleVerify}
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
            className="text-[#C19A6B] disabled:opacity-50"
          >
            {resending ? t("auth.sending") : t("auth.resend")}
          </button>
        )}
      </div>
    </SplitLayout>
  );
}

export default Otp;
