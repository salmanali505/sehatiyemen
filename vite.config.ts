// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts
    server: { entry: "server" },
  },
  nitro: {
    // إجبار المحرك على توليد موقع ثابت متوافق مع جيت هاب بايجز
    preset: "github-pages",
    prerender: {
      routes: ["/"],
    },
  },
  vite: {
    // تحديد المسار الصحيح للمستودع لقرءاة التنسيقات
    base: "/sehatiyemen/",
    plugins: [mcpPlugin()],
  },
});
