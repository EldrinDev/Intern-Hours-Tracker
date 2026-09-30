"use client";

import * as React from "react";
import {
  LayoutDashboardIcon,
  ListChecksIcon,
  CirclePlusIcon,
  UploadIcon,
  DownloadIcon,
  FileTextIcon,
  Building2Icon,
  SettingsIcon,
  InfoIcon,
  ClockIcon,
} from "@animateicons/react/lucide";

/** Shared imperative handle exposed by every AnimateIcons component. */
export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

export type AnimatedIconName =
  | "dashboard"
  | "records"
  | "add"
  | "import"
  | "export"
  | "dtr"
  | "company"
  | "settings"
  | "about"
  | "clock";

type IconComponent = React.ForwardRefExoticComponent<
  { size?: number; className?: string } & React.RefAttributes<AnimatedIconHandle>
>;

const REGISTRY: Record<AnimatedIconName, IconComponent> = {
  dashboard: LayoutDashboardIcon as unknown as IconComponent,
  records: ListChecksIcon as unknown as IconComponent,
  add: CirclePlusIcon as unknown as IconComponent,
  import: UploadIcon as unknown as IconComponent,
  export: DownloadIcon as unknown as IconComponent,
  dtr: FileTextIcon as unknown as IconComponent,
  company: Building2Icon as unknown as IconComponent,
  settings: SettingsIcon as unknown as IconComponent,
  about: InfoIcon as unknown as IconComponent,
  clock: ClockIcon as unknown as IconComponent,
};

interface AnimatedIconProps {
  name: AnimatedIconName;
  size?: number;
  className?: string;
  /**
   * When true, the icon animates on a loop by itself (no hover needed).
   * `autoPlayInterval` controls how often the animation replays (ms).
   */
  autoPlay?: boolean;
  autoPlayInterval?: number;
  /** Delay (ms) before the first autoplay cycle, useful for staggering. */
  autoPlayDelay?: number;
}

/**
 * Animated icon.
 * - By default it exposes an imperative handle so a parent can trigger it
 *   (e.g. on row hover).
 * - With `autoPlay`, it drives its own animation on a repeating timer so it
 *   animates continuously without any hover.
 */
export const AnimatedIcon = React.forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ name, size = 18, className, autoPlay = false, autoPlayInterval = 2600, autoPlayDelay = 0 }, ref) => {
    const Cmp = REGISTRY[name];
    const innerRef = React.useRef<AnimatedIconHandle>(null);

    // Let a parent still control this icon even in autoPlay mode.
    React.useImperativeHandle(ref, () => ({
      startAnimation: () => innerRef.current?.startAnimation(),
      stopAnimation: () => innerRef.current?.stopAnimation(),
    }));

    React.useEffect(() => {
      if (!autoPlay) return;
      let intervalId: ReturnType<typeof setInterval> | undefined;

      const startTimeout = setTimeout(() => {
        innerRef.current?.startAnimation();
        intervalId = setInterval(() => {
          innerRef.current?.startAnimation();
        }, autoPlayInterval);
      }, autoPlayDelay);

      return () => {
        clearTimeout(startTimeout);
        if (intervalId) clearInterval(intervalId);
      };
    }, [autoPlay, autoPlayInterval, autoPlayDelay]);

    return <Cmp ref={innerRef} size={size} className={className} />;
  }
);
AnimatedIcon.displayName = "AnimatedIcon";
