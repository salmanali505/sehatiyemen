import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QrCanvas({ value, size = 160 }: { value: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    QRCode.toCanvas(ref.current, value, {
      width: size,
      margin: 1,
      color: { dark: "#0b1d3a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(() => {});
  }, [value, size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="rounded-2xl bg-white p-2 shadow-card"
      aria-label={`QR ${value}`}
    />
  );
}
