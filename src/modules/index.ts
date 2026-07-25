// Central barrel for modular hooks/utilities across the app.
// Prefer importing from `@/modules` in new code to keep the surface stable.

export { useSettings } from "@/lib/settings/useSettings";
export { useFeatureFlag, useAllFlags } from "@/lib/settings/useFeatureFlag";
export { useDashRole, useDashMenu } from "@/lib/dash/permissions";
export { useRealtimeTable } from "@/lib/dash/realtime";
export { useRoles } from "@/lib/useRoles";
