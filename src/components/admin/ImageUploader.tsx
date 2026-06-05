import { Upload, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  aspect?: "square" | "cover" | "auto";
};

export default function ImageUploader({ value, onChange, folder = "misc", label = "ارفع صورة", aspect = "cover" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) return toast.error("PNG / JPG / WEBP فقط");
    if (file.size > 5 * 1024 * 1024) return toast.error("الحد الأقصى 5 ميجابايت");
    setBusy(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("provider-images").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { setBusy(false); return toast.error(error.message); }
    const { data } = await supabase.storage.from("provider-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (!data?.signedUrl) return toast.error("تعذّر إنشاء الرابط");
    onChange(data.signedUrl);
    toast.success("تم الرفع");
  }

  const ar = aspect === "square" ? "aspect-square" : aspect === "cover" ? "aspect-[16/9]" : "";

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      {value ? (
        <div className={`relative ${ar} rounded-2xl overflow-hidden border bg-muted group`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange(null)}
            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg opacity-90 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className={`${ar} w-full rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary bg-muted/30 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition disabled:opacity-50`}>
          {busy ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
          <span className="font-bold">{label}</span>
          <span className="text-[10px]">PNG / JPG / WEBP · ≤ 5MB</span>
        </button>
      )}
    </div>
  );
}
