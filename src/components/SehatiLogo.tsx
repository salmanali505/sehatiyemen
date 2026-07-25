import logo from "@/assets/sehati-logo.png";
import { useSettings } from "@/lib/settings/useSettings";

interface Props {
  size?: number;
  withName?: boolean;
  className?: string;
}

export function SehatiLogo({ size = 48, withName = false, className = "" }: Props) {
  const { value } = useSettings<{ app_name?: string; logo_url?: string }>("app", {
    app_name: "صحتي",
    logo_url: "",
  });
  const src = value.logo_url && value.logo_url.length > 4 ? value.logo_url : logo;
  const name = value.app_name || "صحتي";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain drop-shadow-md"
      />
      {withName && (
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-black text-gradient-health" style={{ fontFamily: "Tajawal" }}>
            {name}
          </span>
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider">
            SEHATI
          </span>
        </div>
      )}
    </div>
  );
}
