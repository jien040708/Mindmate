import type { CSSProperties } from "react";
import { User, Ear, Users, Briefcase, Target, Heart } from "lucide-react";
import { Persona } from "../types/persona";

function getLucideIcon(iconName?: string) {
    switch (iconName) {
        case "ear":
            return Ear;
        case "users":
            return Users;
        case "briefcase":
            return Briefcase;
        case "target":
            return Target;
        case "heart":
            return Heart;
        default:
            return User;
    }
}

interface PersonaAvatarProps {
    persona: Persona;
    size?: number;
    className?: string;
    ringClass?: string;
}

export function PersonaAvatar({
    persona,
    size = 40,
    className = "",
    ringClass = "",
}: PersonaAvatarProps) {
    const style: CSSProperties = { width: size, height: size };

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

    const found = CHARACTER_OPTIONS.find((c) => c.id === persona.icon);
    if (found) {
        return (
            <div
                className={`overflow-hidden flex-shrink-0 ${ringClass} ${className}`}
                style={style}
            >
                <img
                    src={found.src}
                    alt={found.label}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const IconComp = getLucideIcon(persona.icon);
    const iconSize = Math.round(size * 0.5);
    return (
        <div
            className={`rounded-full flex items-center justify-center flex-shrink-0 ${ringClass} ${className}`}
            style={{ ...style, backgroundColor: persona.color }}
        >
            <IconComp
                width={iconSize}
                height={iconSize}
                className="text-white"
            />
        </div>
    );
}

export const CHARACTER_OPTIONS = [
    { id: "char1", label: "곰", src: "/characters/bear.png" },
    { id: "char2", label: "토끼", src: "/characters/bunny.png" },
    { id: "char3", label: "코알라", src: "/characters/koala.png" },
    { id: "char4", label: "여우", src: "/characters/fox.png" },
    { id: "char5", label: "양", src: "/characters/sheep.png" },
] as const;
