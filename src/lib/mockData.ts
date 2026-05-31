import { Stethoscope, Building2, FlaskConical, Scan, Pill } from "lucide-react";

export const categories = [
  { id: "clinics", label: "العيادات", icon: Stethoscope, color: "from-blue-500 to-blue-600", count: 240 },
  { id: "hospitals", label: "المستشفيات", icon: Building2, color: "from-cyan-500 to-cyan-600", count: 58 },
  { id: "labs", label: "المختبرات", icon: FlaskConical, color: "from-emerald-500 to-emerald-600", count: 120 },
  { id: "radiology", label: "الأشعة", icon: Scan, color: "from-indigo-500 to-indigo-600", count: 45 },
  { id: "pharmacies", label: "الصيدليات", icon: Pill, color: "from-teal-500 to-teal-600", count: 380 },
];

export type ProviderKind = "clinic" | "hospital" | "lab" | "radiology" | "pharmacy";

export interface Provider {
  id: string;
  name: string;
  kind: ProviderKind;
  typeLabel: string;
  rating: number;
  reviews: number;
  followers: number;
  city: string;
  area: string;
  address: string;
  phone: string;
  whatsapp: string;
  description: string;
  open: boolean;
  verified: boolean;
  image: string;
  cover: string;
  hours: string;
  services: { name: string; price: number; duration: string }[];
  gallery: string[];
  doctors: string[];
}

export const providers: Provider[] = [
  {
    id: "p1", name: "مجمع الحياة الطبي", kind: "hospital", typeLabel: "مستشفى",
    rating: 4.9, reviews: 1240, followers: 8420, city: "صنعاء", area: "حدة",
    address: "شارع حدة، صنعاء", phone: "+967 1 234 567", whatsapp: "+967 777 123 456",
    description: "مجمع طبي متكامل يقدم خدمات صحية شاملة على أعلى مستوى من الجودة والاحترافية.",
    open: true, verified: true, hours: "24/7",
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop",
    cover: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=400&fit=crop",
    services: [
      { name: "كشف عام", price: 5000, duration: "30 دقيقة" },
      { name: "استشارة قلب", price: 12000, duration: "45 دقيقة" },
      { name: "فحص شامل", price: 25000, duration: "ساعة" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop",
    ],
    doctors: ["d1", "d2", "d3"],
  },
  {
    id: "p2", name: "عيادة الشفاء التخصصية", kind: "clinic", typeLabel: "عيادة",
    rating: 4.8, reviews: 856, followers: 3210, city: "عدن", area: "كريتر",
    address: "شارع الملكة أروى، عدن", phone: "+967 2 345 678", whatsapp: "+967 777 234 567",
    description: "عيادة تخصصية تضم نخبة من الأطباء المتميزين في مختلف التخصصات.",
    open: true, verified: true, hours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&h=400&fit=crop",
    cover: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1200&h=400&fit=crop",
    services: [
      { name: "كشف باطنية", price: 6000, duration: "30 دقيقة" },
      { name: "كشف أطفال", price: 5500, duration: "30 دقيقة" },
    ],
    gallery: [
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop",
    ],
    doctors: ["d2", "d4"],
  },
  {
    id: "p3", name: "مختبر السلام الطبي", kind: "lab", typeLabel: "مختبر",
    rating: 4.7, reviews: 612, followers: 1840, city: "تعز", area: "الحوبان",
    address: "شارع جمال، تعز", phone: "+967 4 456 789", whatsapp: "+967 777 345 678",
    description: "مختبر معتمد يقدم تحاليل دقيقة بأحدث الأجهزة العالمية.",
    open: false, verified: true, hours: "07:00 - 20:00",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop",
    cover: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1200&h=400&fit=crop",
    services: [
      { name: "تحليل دم شامل", price: 8000, duration: "ساعتان" },
      { name: "تحليل سكر صائم", price: 1500, duration: "30 دقيقة" },
      { name: "تحليل وظائف كبد", price: 6000, duration: "ساعة" },
    ],
    gallery: ["https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=300&fit=crop"],
    doctors: [],
  },
  {
    id: "p4", name: "مركز النور للأشعة", kind: "radiology", typeLabel: "أشعة",
    rating: 4.9, reviews: 423, followers: 1230, city: "الحديدة", area: "الكورنيش",
    address: "شارع الكورنيش، الحديدة", phone: "+967 3 567 890", whatsapp: "+967 777 456 789",
    description: "مركز متخصص في جميع أنواع الأشعة والتصوير الطبي.",
    open: true, verified: true, hours: "08:00 - 22:00",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&h=400&fit=crop",
    cover: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=400&fit=crop",
    services: [
      { name: "أشعة سينية", price: 4000, duration: "20 دقيقة" },
      { name: "رنين مغناطيسي", price: 35000, duration: "ساعة" },
      { name: "أشعة مقطعية", price: 25000, duration: "45 دقيقة" },
    ],
    gallery: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&h=300&fit=crop"],
    doctors: [],
  },
  {
    id: "p5", name: "صيدلية الصحة", kind: "pharmacy", typeLabel: "صيدلية",
    rating: 4.6, reviews: 298, followers: 980, city: "صنعاء", area: "شارع الستين",
    address: "شارع الستين، صنعاء", phone: "+967 1 678 901", whatsapp: "+967 777 567 890",
    description: "صيدلية متكاملة بأحدث الأدوية والمستحضرات الطبية.",
    open: true, verified: true, hours: "24/7",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=600&h=400&fit=crop",
    cover: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=400&fit=crop",
    services: [],
    gallery: ["https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=300&fit=crop"],
    doctors: [],
  },
  {
    id: "p6", name: "مستشفى الأمل التخصصي", kind: "hospital", typeLabel: "مستشفى",
    rating: 4.8, reviews: 920, followers: 5600, city: "صنعاء", area: "بيت بوس",
    address: "بيت بوس، صنعاء", phone: "+967 1 789 012", whatsapp: "+967 777 678 901",
    description: "مستشفى متخصص في جراحات القلب والأوعية الدموية.",
    open: true, verified: true, hours: "24/7",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
    cover: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=400&fit=crop",
    services: [
      { name: "استشارة جراحة قلب", price: 15000, duration: "ساعة" },
      { name: "تخطيط قلب", price: 5000, duration: "30 دقيقة" },
    ],
    gallery: ["https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop"],
    doctors: ["d1", "d3"],
  },
];

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  exp: string;
  image: string;
  qualifications: string;
  bio: string;
}

export const doctors: Doctor[] = [
  { id: "d1", name: "د. أحمد الحضرمي", specialty: "قلب وأوعية دموية", rating: 4.9, reviews: 412, exp: "15 سنة",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop",
    qualifications: "دكتوراه أمراض القلب - جامعة القاهرة، زمالة لندن الملكية",
    bio: "استشاري أول قلب وأوعية دموية مع خبرة 15 عاماً في تشخيص وعلاج أمراض القلب." },
  { id: "d2", name: "د. سارة المقطري", specialty: "طب الأطفال", rating: 4.8, reviews: 356, exp: "12 سنة",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop",
    qualifications: "ماجستير طب الأطفال - جامعة صنعاء",
    bio: "استشارية طب أطفال متخصصة في حديثي الولادة والأمراض الصدرية." },
  { id: "d3", name: "د. محمد الزبيري", specialty: "الجلدية والتجميل", rating: 4.9, reviews: 287, exp: "10 سنوات",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop",
    qualifications: "بورد عربي جلدية - دكتوراه جامعة الأزهر",
    bio: "استشاري جلدية وتجميل مع خبرة واسعة في علاج أمراض الجلد التجميلية." },
  { id: "d4", name: "د. نورا العزي", specialty: "نساء وولادة", rating: 4.7, reviews: 198, exp: "8 سنوات",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop",
    qualifications: "زمالة الكلية الملكية - دكتوراه نساء وولادة",
    bio: "استشارية نساء وولادة متخصصة في الحمل عالي الخطورة." },
];

export const offers = [
  { id: 1, title: "فحص شامل", discount: "خصم 40%", desc: "للمختبرات الموثقة", color: "from-emerald-500 to-teal-600" },
  { id: 2, title: "استشارة أطفال", discount: "خصم 25%", desc: "العيادات المعتمدة", color: "from-blue-500 to-indigo-600" },
  { id: 3, title: "أشعة سينية", discount: "خصم 30%", desc: "في جميع المراكز", color: "from-cyan-500 to-blue-600" },
];

// Convenience aliases for backwards compat with existing components
export const featuredProviders = providers.map((p) => ({
  id: p.id, name: p.name, type: p.typeLabel, rating: p.rating, reviews: p.reviews,
  city: p.city, open: p.open, verified: p.verified, image: p.image,
}));

export const topDoctors = doctors.map((d) => ({
  id: d.id, name: d.name, specialty: d.specialty, rating: d.rating, exp: d.exp, image: d.image,
}));

export function getProvider(id: string) {
  return providers.find((p) => p.id === id);
}
export function getDoctor(id: string) {
  return doctors.find((d) => d.id === id);
}
