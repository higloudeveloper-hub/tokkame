export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="#ff4d1c" strokeWidth="2.4" />
      <circle cx="16" cy="16" r="4.5" fill="#e6b56a" />
    </svg>
  );
}

export function Avatar({
  hue,
  name,
  size = 40,
}: {
  hue: number;
  name: string;
  size?: number;
}) {
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        background: `hsl(${hue} 52% 40%)`,
        fontSize: size < 36 ? 12 : 16,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
