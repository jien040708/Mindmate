/**
 * PersonaAvatar — 3 hand-drawn SVG characters + photo upload support
 *
 * Characters:
 *  char1 = Nari  (cat-fairy, lavender)
 *  char2 = Mochi (bear cub,  warm honey)
 *  char3 = Haru  (bunny,     mint-green)
 *
 * Legacy Lucide icon names still work as a colour circle fallback.
 */
import { User, Ear, Users, Briefcase, Target, Heart } from "lucide-react";
import { Persona } from "../types/persona";

// ─── SVG Characters ───────────────────────────────────────────────────────────

/** Nari — round cat-fairy with crescent ears and sparkle eyes */
function NariChar() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* head */}
      <circle cx="50" cy="56" r="37" fill="#EDE4FF" />
      {/* ear left */}
      <polygon points="20,34 34,6 46,34" fill="#C9B8F8" />
      <polygon points="25,32 34,12 43,32" fill="#FFB8D9" />
      {/* ear right */}
      <polygon points="54,34 66,6 80,34" fill="#C9B8F8" />
      <polygon points="57,32 66,12 75,32" fill="#FFB8D9" />
      {/* eyes */}
      <ellipse cx="35" cy="53" rx="9" ry="10" fill="#3B2A7A" />
      <ellipse cx="65" cy="53" rx="9" ry="10" fill="#3B2A7A" />
      {/* eye shine */}
      <circle cx="38" cy="49" r="3.5" fill="white" />
      <circle cx="68" cy="49" r="3.5" fill="white" />
      <circle cx="37" cy="55" r="1.5" fill="white" opacity="0.6" />
      <circle cx="67" cy="55" r="1.5" fill="white" opacity="0.6" />
      {/* nose */}
      <ellipse cx="50" cy="66" rx="4" ry="2.8" fill="#FFB8D9" />
      {/* mouth */}
      <path d="M 44 70 Q 50 76 56 70" stroke="#3B2A7A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* whiskers left */}
      <line x1="8" y1="63" x2="36" y2="66" stroke="#9580CC" strokeWidth="1.4" opacity="0.45" />
      <line x1="8" y1="70" x2="36" y2="69" stroke="#9580CC" strokeWidth="1.4" opacity="0.45" />
      {/* whiskers right */}
      <line x1="64" y1="66" x2="92" y2="63" stroke="#9580CC" strokeWidth="1.4" opacity="0.45" />
      <line x1="64" y1="69" x2="92" y2="70" stroke="#9580CC" strokeWidth="1.4" opacity="0.45" />
      {/* blush */}
      <circle cx="24" cy="65" r="8" fill="#FFB8D9" opacity="0.35" />
      <circle cx="76" cy="65" r="8" fill="#FFB8D9" opacity="0.35" />
    </svg>
  );
}

/** Mochi — chubby bear cub with honey-warm colours */
function MochiChar() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* outer ears */}
      <circle cx="24" cy="26" r="16" fill="#D4A96A" />
      <circle cx="76" cy="26" r="16" fill="#D4A96A" />
      {/* inner ears */}
      <circle cx="24" cy="26" r="9" fill="#F2C58A" />
      <circle cx="76" cy="26" r="9" fill="#F2C58A" />
      {/* head */}
      <circle cx="50" cy="56" r="38" fill="#F0C88A" />
      {/* forehead tuft */}
      <ellipse cx="50" cy="24" rx="10" ry="7" fill="#D4A96A" />
      {/* eyes */}
      <ellipse cx="35" cy="52" rx="9" ry="10" fill="#3A2510" />
      <ellipse cx="65" cy="52" rx="9" ry="10" fill="#3A2510" />
      {/* eye shine */}
      <circle cx="38" cy="48" r="3.5" fill="white" />
      <circle cx="68" cy="48" r="3.5" fill="white" />
      <circle cx="37" cy="54" r="1.5" fill="white" opacity="0.55" />
      <circle cx="67" cy="54" r="1.5" fill="white" opacity="0.55" />
      {/* snout */}
      <ellipse cx="50" cy="66" rx="14" ry="10" fill="#E8B070" />
      {/* nose */}
      <ellipse cx="50" cy="61" rx="5" ry="3.5" fill="#3A2510" />
      {/* mouth */}
      <path d="M 44 67 Q 50 74 56 67" stroke="#3A2510" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* blush */}
      <circle cx="22" cy="64" r="9" fill="#F4A080" opacity="0.4" />
      <circle cx="78" cy="64" r="9" fill="#F4A080" opacity="0.4" />
    </svg>
  );
}

/** Haru — soft bunny with long ears and mint tones */
function HaruChar() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      {/* ears outer */}
      <ellipse cx="32" cy="22" rx="11" ry="24" fill="#B8E8D0" />
      <ellipse cx="68" cy="22" rx="11" ry="24" fill="#B8E8D0" />
      {/* ears inner */}
      <ellipse cx="32" cy="22" rx="6" ry="18" fill="#FFB8D9" />
      <ellipse cx="68" cy="22" rx="6" ry="18" fill="#FFB8D9" />
      {/* head */}
      <circle cx="50" cy="60" r="36" fill="#D8F5E8" />
      {/* eyes */}
      <ellipse cx="36" cy="56" rx="9" ry="10" fill="#2A6A4A" />
      <ellipse cx="64" cy="56" rx="9" ry="10" fill="#2A6A4A" />
      {/* eye shine */}
      <circle cx="39" cy="52" r="3.5" fill="white" />
      <circle cx="67" cy="52" r="3.5" fill="white" />
      <circle cx="38" cy="58" r="1.5" fill="white" opacity="0.55" />
      <circle cx="66" cy="58" r="1.5" fill="white" opacity="0.55" />
      {/* nose */}
      <ellipse cx="50" cy="68" rx="4" ry="3" fill="#FFB8D9" />
      {/* mouth */}
      <path d="M 44 72 Q 50 79 56 72" stroke="#2A6A4A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* blush */}
      <circle cx="24" cy="67" r="8" fill="#FFB8D9" opacity="0.38" />
      <circle cx="76" cy="67" r="8" fill="#FFB8D9" opacity="0.38" />
    </svg>
  );
}

// ─── Legacy Lucide fallback ───────────────────────────────────────────────────

function getLucideIcon(iconName?: string) {
  switch (iconName) {
    case "ear":       return Ear;
    case "users":     return Users;
    case "briefcase": return Briefcase;
    case "target":    return Target;
    case "heart":     return Heart;
    default:          return User;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PersonaAvatarProps {
  persona: Persona;
  size?: number;       // pixel size
  className?: string;
  ringClass?: string;  // e.g. "ring-4 ring-white"
}

export function PersonaAvatar({
  persona,
  size = 40,
  className = "",
  ringClass = "",
}: PersonaAvatarProps) {
  const style: React.CSSProperties = { width: size, height: size };

  // Photo upload
  if (persona.avatarDataUrl) {
    return (
      <img
        src={persona.avatarDataUrl}
        alt={persona.name}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass} ${className}`}
        style={style}
      />
    );
  }

  // SVG characters — rendered on a tinted circle
  if (persona.icon === "char1" || persona.icon === "char2" || persona.icon === "char3") {
    const CharComp = persona.icon === "char1" ? NariChar : persona.icon === "char2" ? MochiChar : HaruChar;
    return (
      <div
        className={`rounded-full overflow-hidden flex-shrink-0 ${ringClass} ${className}`}
        style={style}
      >
        <CharComp />
      </div>
    );
  }

  // Legacy Lucide icon in a coloured circle
  const IconComp = getLucideIcon(persona.icon);
  const iconSize = Math.round(size * 0.5);
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 ${ringClass} ${className}`}
      style={{ ...style, backgroundColor: persona.color }}
    >
      <IconComp width={iconSize} height={iconSize} className="text-white" />
    </div>
  );
}

// Export character names for the picker
export const CHARACTER_OPTIONS = [
  { id: "char1", label: "Nari", Component: NariChar },
  { id: "char2", label: "Mochi", Component: MochiChar },
  { id: "char3", label: "Haru", Component: HaruChar },
] as const;
