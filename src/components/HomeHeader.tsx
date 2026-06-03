import { SehatiLogo } from "./SehatiLogo";
import { LocationPicker } from "./LocationPicker";
import { NotificationBell } from "./NotificationBell";

export function HomeHeader() {
  return (
    <div className="px-4 pt-12 pb-4 flex items-center justify-between gap-2">
      <SehatiLogo size={42} withName />
      <div className="flex items-center gap-2">
        <LocationPicker />
        <NotificationBell />
      </div>
    </div>
  );
}
