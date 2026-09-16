export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const styles =
    variant === "secondary"
      ? "bg-wheat text-leaf hover:bg-[#f0cf86]"
      : "bg-leaf text-white hover:bg-grove";
  return (
    <button
      className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
