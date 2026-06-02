import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-health">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">الصفحة غير موجودة</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          الصفحة التي تبحث عنها غير متاحة أو تم نقلها.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:scale-105"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">حدث خطأ غير متوقع</h1>
        <p className="mt-2 text-sm text-muted-foreground">يرجى المحاولة مرة أخرى.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-2xl gradient-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0066FF" },
      { title: "صحتي | Sehati - حجز المواعيد الطبية" },
      { name: "description", content: "منصة صحتي الرائدة لحجز المواعيد الطبية في اليمن. عيادات، مستشفيات، مختبرات، أشعة وصيدليات في تطبيق واحد." },
      { property: "og:title", content: "صحتي | Sehati - حجز المواعيد الطبية" },
      { property: "og:description", content: "منصة صحتي الرائدة لحجز المواعيد الطبية في اليمن. عيادات، مستشفيات، مختبرات، أشعة وصيدليات في تطبيق واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "صحتي | Sehati - حجز المواعيد الطبية" },
      { name: "twitter:description", content: "منصة صحتي الرائدة لحجز المواعيد الطبية في اليمن. عيادات، مستشفيات، مختبرات، أشعة وصيدليات في تطبيق واحد." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/aMfU7zttS3PCCXynTjYlvOSRKKD3/social-images/social-1780361561331-ChatGPT_Image_31_مايو_2026،_01_01_54_ص.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/aMfU7zttS3PCCXynTjYlvOSRKKD3/social-images/social-1780361561331-ChatGPT_Image_31_مايو_2026،_01_01_54_ص.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors closeButton dir="rtl" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
