export type PhoneComponentId =
  | "backGlass"
  | "frame"
  | "display"
  | "battery"
  | "motherboard"
  | "camera"
  | "speaker"
  | "chargingPort"
  | "wirelessCoil"
  | "simTray"
  | "buttons";

export interface PhoneComponentMeta {
  id: PhoneComponentId;
  label: string;
  title: string;
  description: string;
  bullets: string[];
  repairHref: string;
  repairLabel: string;
}

export const PHONE_COMPONENTS: Record<PhoneComponentId, PhoneComponentMeta> = {
  backGlass: {
    id: "backGlass",
    label: "Back Glass",
    title: "Back Glass",
    description: "Cracked or shattered rear glass affects protection and resale value.",
    bullets: ["Back glass assessment", "Colour-matched options when available", "Sealing checked after fitment"],
    repairHref: "/mobile-repair?category=other",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  frame: {
    id: "frame",
    label: "Frame",
    title: "Frame",
    description: "Structural integrity starts with a precision-aligned chassis.",
    bullets: ["Bent frame assessment", "Antenna line checks", "Button housing inspection"],
    repairHref: "/mobile-repair?category=other",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  display: {
    id: "display",
    label: "Display",
    title: "Display",
    description: "Cracks, dead pixels, touch issues, and brightness problems.",
    bullets: ["Display diagnosis", "Panel options explained before repair", "Touch response testing"],
    repairHref: "/mobile-repair?category=screen",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  battery: {
    id: "battery",
    label: "Battery",
    title: "Battery",
    description: "Powers the device and directly affects daily performance.",
    bullets: ["Battery Health Check", "Battery Replacement", "Charge behaviour testing"],
    repairHref: "/mobile-repair?category=battery",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  motherboard: {
    id: "motherboard",
    label: "Logic Board",
    title: "Motherboard",
    description: "Board-level diagnosis for boot loops, no power, and connectivity faults.",
    bullets: ["Component-level diagnosis", "Data recovery options when possible", "Clear quote before work"],
    repairHref: "/mobile-repair?category=other",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  camera: {
    id: "camera",
    label: "Camera",
    title: "Camera",
    description: "Front and rear camera modules, focus issues, and lens problems.",
    bullets: ["Camera module check", "Lens & glass inspection", "Focus and flash testing"],
    repairHref: "/mobile-repair?category=camera",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  speaker: {
    id: "speaker",
    label: "Speaker",
    title: "Speaker",
    description: "Muffled audio, earpiece failure, and loudspeaker distortion.",
    bullets: ["Earpiece check", "Loudspeaker testing", "Audio path diagnosis"],
    repairHref: "/mobile-repair?category=speaker",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  chargingPort: {
    id: "chargingPort",
    label: "Charging Port",
    title: "Charging Port",
    description: "Loose port, debris, or failed charging — cleaned or replaced when needed.",
    bullets: ["Port cleaning", "Flex inspection", "Charge delivery test"],
    repairHref: "/mobile-repair?category=charging",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  wirelessCoil: {
    id: "wirelessCoil",
    label: "Wireless Coil",
    title: "Wireless Charging",
    description: "Wireless charging coil issues that interrupt pad charging.",
    bullets: ["Coil continuity check", "Alignment inspection", "Wireless charge test"],
    repairHref: "/mobile-repair?category=charging",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  simTray: {
    id: "simTray",
    label: "SIM Tray",
    title: "SIM Tray",
    description: "Damaged trays and readers that affect network detection.",
    bullets: ["Tray fitment", "Reader contact check", "Network detection test"],
    repairHref: "/mobile-repair?category=other",
    repairLabel: "REPAIR THIS COMPONENT",
  },
  buttons: {
    id: "buttons",
    label: "Buttons",
    title: "Buttons",
    description: "Volume, power, and side-button response issues.",
    bullets: ["Button feel check", "Flex inspection", "Click response testing"],
    repairHref: "/mobile-repair?category=other",
    repairLabel: "REPAIR THIS COMPONENT",
  },
};

/** Narrative beats synced to scroll (0–1) */
export const SCROLL_NARRATIVE = [
  {
    start: 0,
    end: 0.18,
    headline: "Your phone is more than a screen.",
    sub: "A precision instrument — engineered layer by layer.",
  },
  {
    start: 0.18,
    end: 0.38,
    headline: "Every component matters.",
    sub: "The frame, display, and internals work together.",
  },
  {
    start: 0.38,
    end: 0.58,
    headline: "Professional repair starts with understanding what's inside.",
    sub: "We diagnose at the component level — not guesswork.",
  },
  {
    start: 0.58,
    end: 0.78,
    headline: "Expert repair. Clear communication.",
    sub: "Tap any part to explore our repair services.",
  },
  {
    start: 0.78,
    end: 1,
    headline: "Back to working.",
    sub: "Reassembled, tested, and ready for your pocket.",
  },
] as const;

/** Maps scroll 0→1 to explode amount (0 assembled → 1 full explode → 0 reassembled) */
export function scrollToExplode(progress: number): number {
  if (progress <= 0.2) return 0;
  if (progress <= 0.55) return (progress - 0.2) / 0.35;
  if (progress <= 0.75) return 1;
  return 1 - (progress - 0.75) / 0.25;
}
