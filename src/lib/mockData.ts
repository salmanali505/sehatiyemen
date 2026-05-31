import { Stethoscope, Building2, FlaskConical, Scan, Pill } from "lucide-react";

export const categories = [
  { id: "clinics", label: "العيادات", icon: Stethoscope, color: "from-blue-500 to-blue-600", count: 240 },
  { id: "hospitals", label: "المستشفيات", icon: Building2, color: "from-cyan-500 to-cyan-600", count: 58 },
  { id: "labs", label: "المختبرات", icon: FlaskConical, color: "from-emerald-500 to-emerald-600", count: 120 },
  { id: "radiology", label: "الأشعة", icon: Scan, color: "from-indigo-500 to-indigo-600", count: 45 },
  { id: "pharmacies", label: "الصيدليات", icon: Pill, color: "from-teal-500 to-teal-600", count: 380 },
];

export const featuredProviders = [
  { id: 1, name: "مجمع الحياة الطبي", type: "مستشفى", rating: 4.9, reviews: 1240, city: "صنعاء", open: true, verified: true, image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=300&fit=crop" },
  { id: 2, name: "عيادة الشفاء التخصصية", type: "عيادة", rating: 4.8, reviews: 856, city: "عدن", open: true, verified: true, image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop" },
  { id: 3, name: "مختبر السلام الطبي", type: "مختبر", rating: 4.7, reviews: 612, city: "تعز", open: false, verified: true, image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop" },
  { id: 4, name: "مركز النور للأشعة", type: "أشعة", rating: 4.9, reviews: 423, city: "الحديدة", open: true, verified: true, image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop" },
];

export const topDoctors = [
  { id: 1, name: "د. أحمد الحضرمي", specialty: "قلب وأوعية دموية", rating: 4.9, exp: "15 سنة", image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop" },
  { id: 2, name: "د. سارة المقطري", specialty: "أطفال", rating: 4.8, exp: "12 سنة", image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop" },
  { id: 3, name: "د. محمد الزبيري", specialty: "جلدية", rating: 4.9, exp: "10 سنوات", image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop" },
  { id: 4, name: "د. نورا العزي", specialty: "نساء وولادة", rating: 4.7, exp: "8 سنوات", image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop" },
];

export const offers = [
  { id: 1, title: "فحص شامل", discount: "خصم 40%", desc: "للمختبرات الموثقة", color: "from-emerald-500 to-teal-600" },
  { id: 2, title: "استشارة أطفال", discount: "خصم 25%", desc: "العيادات المعتمدة", color: "from-blue-500 to-indigo-600" },
  { id: 3, title: "أشعة سينية", discount: "خصم 30%", desc: "في جميع المراكز", color: "from-cyan-500 to-blue-600" },
];
