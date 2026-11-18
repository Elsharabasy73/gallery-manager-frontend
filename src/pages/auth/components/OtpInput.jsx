export default function OtpInput({
  value,
  onChange,
  onClearError,
  inputsRef,
  containerClassName,
  inputClassName,
  allowArrowNavigation = false,
}) {
  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const digit = val.slice(-1);
    const next = [...value];
    next[idx] = digit;
    onChange(next);
    onClearError();
    if (digit && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0)
      inputsRef.current[idx - 1]?.focus();
    if (allowArrowNavigation && e.key === "ArrowLeft" && idx > 0)
      inputsRef.current[idx - 1]?.focus();
    if (allowArrowNavigation && e.key === "ArrowRight" && idx < 5)
      inputsRef.current[idx + 1]?.focus();
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
    onChange(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div
      className={containerClassName}
      onPaste={handlePaste}
      dir="ltr"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          value={value[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          className={inputClassName}
        />
      ))}
    </div>
  );
}
