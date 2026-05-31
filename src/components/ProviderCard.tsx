import { Star, MapPin, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  name: string;
  type: string;
  rating: number;
  reviews: number;
  city: string;
  open: boolean;
  verified: boolean;
  image: string;
}

export function ProviderCard(p: Props) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      className="min-w-[240px] bg-card rounded-3xl shadow-card overflow-hidden border border-border/40"
    >
      <div className="relative h-32">
        <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${p.open ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
            <span className={`w-1.5 h-1.5 rounded-full bg-white ${p.open ? "animate-pulse" : ""}`} />
            {p.open ? "مفتوح الآن" : "مغلق"}
          </span>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 glass rounded-full text-[10px] font-bold text-foreground">
          {p.type}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1">
          <h4 className="font-bold text-sm text-foreground line-clamp-1 flex-1">{p.name}</h4>
          {p.verified && <BadgeCheck className="text-primary fill-primary/20" size={16} />}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star className="text-warning fill-warning" size={12} />
            <span className="text-xs font-bold">{p.rating}</span>
            <span className="text-[10px] text-muted-foreground">({p.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={11} />
            <span className="text-[10px]">{p.city}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
