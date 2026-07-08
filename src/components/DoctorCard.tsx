import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

interface Props {
  id?: string;
  name: string;
  specialty: string;
  rating: number;
  exp: string;
  image: string;
}

export function DoctorCard(d: Props) {
  const card = (
    <motion.div whileTap={{ scale: 0.96 }} className="min-w-[160px] bg-card rounded-3xl shadow-card p-3 border border-border/40 cursor-pointer">
      <div className="relative">
        <div className="w-full aspect-square rounded-2xl overflow-hidden gradient-primary p-0.5">
          <img src={d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover rounded-2xl" />
        </div>
        <div className="absolute -bottom-1 -left-1 bg-white rounded-full px-2 py-0.5 shadow-soft flex items-center gap-1">
          <Star className="text-warning fill-warning" size={10} />
          <span className="text-[10px] font-bold">{d.rating}</span>
        </div>
      </div>
      <h4 className="mt-3 font-bold text-sm text-foreground line-clamp-1">{d.name}</h4>
      <p className="text-[11px] text-primary font-semibold mt-0.5 line-clamp-1">{d.specialty}</p>
      <p className="text-[10px] text-muted-foreground mt-1">خبرة {d.exp}</p>
    </motion.div>
  );
  if (d.id) return <Link to="/doctor/$id" params={{ id: d.id }}>{card}</Link>;
  return card;
}
