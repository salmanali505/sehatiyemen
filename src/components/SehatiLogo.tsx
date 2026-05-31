import logo from "@/assets/sehati-logo.png";

interface Props {
  size?: number;
  withName?: boolean;
  className?: string;
}

export function SehatiLogo({ size = 48, withName = false, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="صحتي"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain drop-shadow-md"
      />
      {withName && (
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-black text-gradient-health" style={{ fontFamily: "Tajawal" }}>
            صحتي
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
            SEHATI
          </span>
        </div>
      )}
    </div>
  );
}
