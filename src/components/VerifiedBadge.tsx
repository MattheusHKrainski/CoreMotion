import { IconVerified } from "./Icons";

type Props = {
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
  className?: string;
};

export default function VerifiedBadge({ size = "md", withLabel = true, className = "" }: Props) {
  const dim = size === "sm" ? 14 : size === "lg" ? 22 : 16;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-black uppercase tracking-wider ${size === "sm" ? "text-[10px] px-2 py-0.5" : size === "lg" ? "text-xs px-3 py-1" : "text-[11px] px-2.5 py-1"} ${className}`}
      title="Loja verificada pelo CoreMotion — legitimidade confirmada"
    >
      <IconVerified width={dim} height={dim} className="text-sky-600 shrink-0" />
      {withLabel && <span>Verificado</span>}
    </span>
  );
}

export function VerifiedStoreLabel({ name, verified }: { name: string; verified?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-bold">{name}</span>
      {verified && <VerifiedBadge size="sm" />}
    </span>
  );
}
