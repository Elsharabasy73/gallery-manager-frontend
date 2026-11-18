export function StepIndicator({ step, t }) {
  return (
    <div className="flex gap-2 text-[11px] mb-4">
      {[t("auth.stepEmail"), t("auth.stepCode"), t("auth.stepNewPass")].map(
        (s, i) => (
          <span key={s} className={`px-2 py-1 rounded-full ${step === i + 1 ? "bg-[#4B3621] text-white" : "bg-[#FAF7F2] border"}`}>
            {i + 1}. {s}
          </span>
        ),
      )}
    </div>
  );
}

export default StepIndicator;
