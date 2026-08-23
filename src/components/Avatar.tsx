type Props = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  rounded?: "full" | "xl" | "2xl";
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({
  src,
  name,
  size = 44,
  className = "",
  rounded = "full",
}: Props) {
  const radius =
    rounded === "full" ? "rounded-full" : rounded === "xl" ? "rounded-xl" : "rounded-2xl";
  return (
    <div
      className={`relative overflow-hidden bg-slate-200 ${radius} ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full grid place-items-center bg-gradient-to-br from-red-500 to-red-700 text-white font-black text-sm">
          {initials(name) || "?"}
        </div>
      )}
    </div>
  );
}
