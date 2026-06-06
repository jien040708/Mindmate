import { useNavigate } from "react-router";
import {
    Heart,
    MessageCircle,
    Plus,
    User,
    Database,
    LogOut,
    Settings as SettingsIcon,
    Globe,
    Trash2,
    X,
    Edit2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Persona, CnipScores } from "../types/persona";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { T } from "../i18n/translations";
import { PersonaAvatar, CHARACTER_OPTIONS } from "../components/PersonaAvatar";

const LANGUAGES = [
    { value: "Korean", label: "한국어", flag: "🇰🇷" },
    { value: "English", label: "English", flag: "🇺🇸" },
    { value: "Japanese", label: "日本語", flag: "🇯🇵" },
    { value: "Chinese", label: "中文", flag: "🇨🇳" },
];

const MOOD_EMOJIS = ["😭", "😟", "😐", "😊", "😄"];
const MOOD_VALUES = [10, 30, 50, 70, 90];

function computeTraitCards(scores: CnipScores, t: T) {
    return [
        {
            dimLabel: t.directiveness,
            label:
                scores.td >= 8
                    ? t.traitTD_high
                    : scores.td <= -3
                    ? t.traitTD_low
                    : t.traitTD_mid,
            desc:
                scores.td >= 8
                    ? t.descTD_high
                    : scores.td <= -3
                    ? t.descTD_low
                    : t.descTD_mid,
            color:
                scores.td >= 8
                    ? "text-blue-600"
                    : scores.td <= -3
                    ? "text-purple-600"
                    : "text-green-600",
            bg:
                scores.td >= 8
                    ? "bg-blue-50"
                    : scores.td <= -3
                    ? "bg-purple-50"
                    : "bg-green-50",
        },
        {
            dimLabel: t.emotionFocus,
            label:
                scores.ei >= 7
                    ? t.traitEI_high
                    : scores.ei <= -1
                    ? t.traitEI_low
                    : t.traitEI_mid,
            desc:
                scores.ei >= 7
                    ? t.descEI_high
                    : scores.ei <= -1
                    ? t.descEI_low
                    : t.descEI_mid,
            color:
                scores.ei >= 7
                    ? "text-rose-600"
                    : scores.ei <= -1
                    ? "text-sky-600"
                    : "text-green-600",
            bg:
                scores.ei >= 7
                    ? "bg-rose-50"
                    : scores.ei <= -1
                    ? "bg-sky-50"
                    : "bg-green-50",
        },
        {
            dimLabel: t.timeOrientation,
            label:
                scores.pao >= 3
                    ? t.traitPaO_high
                    : scores.pao <= -3
                    ? t.traitPaO_low
                    : t.traitPaO_mid,
            desc:
                scores.pao >= 3
                    ? t.descPaO_high
                    : scores.pao <= -3
                    ? t.descPaO_low
                    : t.descPaO_mid,
            color:
                scores.pao >= 3
                    ? "text-amber-600"
                    : scores.pao <= -3
                    ? "text-teal-600"
                    : "text-green-600",
            bg:
                scores.pao >= 3
                    ? "bg-amber-50"
                    : scores.pao <= -3
                    ? "bg-teal-50"
                    : "bg-green-50",
        },
        {
            dimLabel: t.feedbackStyle,
            label:
                scores.ws >= 4
                    ? t.traitWS_high
                    : scores.ws <= -4
                    ? t.traitWS_low
                    : t.traitWS_mid,
            desc:
                scores.ws >= 4
                    ? t.descWS_high
                    : scores.ws <= -4
                    ? t.descWS_low
                    : t.descWS_mid,
            color:
                scores.ws >= 4
                    ? "text-orange-500"
                    : scores.ws <= -4
                    ? "text-red-600"
                    : "text-green-600",
            bg:
                scores.ws >= 4
                    ? "bg-orange-50"
                    : scores.ws <= -4
                    ? "bg-red-50"
                    : "bg-green-50",
        },
    ];
}

function computeOneLiner(scores: CnipScores, t: T): string {
    const td =
        scores.td >= 8
            ? t.traitTD_high
            : scores.td <= -3
            ? t.traitTD_low
            : t.traitTD_mid;
    const ei =
        scores.ei >= 7
            ? t.traitEI_high
            : scores.ei <= -1
            ? t.traitEI_low
            : t.traitEI_mid;
    const pao =
        scores.pao >= 3
            ? t.traitPaO_high
            : scores.pao <= -3
            ? t.traitPaO_low
            : t.traitPaO_mid;
    const ws =
        scores.ws >= 4
            ? t.traitWS_high
            : scores.ws <= -4
            ? t.traitWS_low
            : t.traitWS_mid;
    return `${td} · ${ei} · ${pao} · ${ws}`;
}

export default function Home() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();

    const [personas, setPersonas] = useState<Persona[]>([]);
    const [selected, setSelected] = useState<Persona | null>(null);
    const [showMoodModal, setShowMoodModal] = useState(false);
    const [selectedMood, setSelectedMood] = useState<number | undefined>(
        undefined
    );

    useEffect(() => {
        const saved = localStorage.getItem("personas");
        if (saved) setPersonas(JSON.parse(saved));
    }, []);

    const handleDelete = () => {
        if (!selected) return;
        if (!window.confirm(t.deleteConfirm(selected.name))) return;
        const updated = personas.filter((p) => p.id !== selected.id);
        localStorage.setItem("personas", JSON.stringify(updated));
        setPersonas(updated);
        setSelected(null);
    };

    const handleEdit = () => {
        if (!selected) return;
        navigate("/persona", { state: { editPersona: selected } });
    };

    const handleStartChat = () => {
        if (!selected) return;
        setSelectedMood(undefined);
        setShowMoodModal(true);
    };

    const handleConfirmChat = () => {
        setShowMoodModal(false);
        navigate("/chat", {
            state: { persona: selected, mood: selectedMood, language },
        });
    };

    const traitCards = selected?.cnipScores
        ? computeTraitCards(selected.cnipScores, t)
        : null;
    const oneLiner = selected?.cnipScores
        ? computeOneLiner(selected.cnipScores, t)
        : selected?.description ?? "";

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] overflow-hidden">
            {/* ── 상단 바 ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white/70 backdrop-blur-sm border-b border-[#CFF3E4]">
                {/* 로고 */}
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-[#6BCB9A] to-[#6BCB9A] p-2 rounded-full">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-[#6BCB9A] to-[#6BCB9A] bg-clip-text text-transparent">
                        MindMate
                    </span>
                    {user?.name && (
                        <span className="text-sm text-gray-400 ml-2">
                            · {user.name}
                        </span>
                    )}
                </div>

                {/* 우측 컨트롤 */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) =>
                                setLanguage(e.target.value as typeof language)
                            }
                            className="appearance-none pl-7 pr-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#6BCB9A] border border-[#CFF3E4] focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] cursor-pointer"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.value} value={l.value}>
                                    {l.flag} {l.label}
                                </option>
                            ))}
                        </select>
                        <Globe className="w-3.5 h-3.5 text-[#6BCB9A] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button
                        onClick={() => navigate("/history")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#6BCB9A] border border-[#CFF3E4] hover:shadow-md transition-all"
                    >
                        <Database className="w-4 h-4" /> {t.history}
                    </button>
                    <button
                        onClick={() => {
                            logout();
                            navigate("/login");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#6BCB9A] border border-[#CFF3E4] hover:shadow-md transition-all"
                    >
                        <LogOut className="w-4 h-4" /> {t.logout}
                    </button>
                </div>
            </div>

            {/* ── 2분할 메인 ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* ── 왼쪽 패널: 페르소나 그리드 ── */}
                <div className="w-1/2 flex-shrink-0 flex flex-col bg-white/50 backdrop-blur-sm border-r border-[#CFF3E4]">
                    <div className="px-4 py-3 border-b border-[#CFF3E4]">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                            {t.counselorList}
                        </h2>
                    </div>

                    {/* 3열 그리드 목록 */}
                    <div className="flex-1 overflow-y-auto p-3">
                        {personas.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400">
                                <User className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm">{t.noCounselors}</p>
                                <p className="text-xs mt-1">
                                    {t.noCounselorsDesc}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {personas.map((persona) => {
                                    const isSelected =
                                        selected?.id === persona.id;
                                    return (
                                        <button
                                            key={persona.id}
                                            onClick={() => setSelected(persona)}
                                            className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border-2 transition-all ${
                                                isSelected
                                                    ? "bg-gradient-to-b from-[#6BCB9A]/20 to-[#6BCB9A]/10 border-[#6BCB9A] shadow-md"
                                                    : "bg-white/60 border-transparent hover:border-[#6BCB9A]/40 hover:bg-white/80"
                                            }`}
                                        >
                                            {(() => {
                                                const found =
                                                    CHARACTER_OPTIONS.find(
                                                        (c) =>
                                                            c.id ===
                                                            persona.icon
                                                    );
                                                return found ? (
                                                    <div className="w-48 h-60 rounded-xl overflow-hidden shadow-sm">
                                                        <img
                                                            src={found.src}
                                                            alt={persona.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <PersonaAvatar
                                                        persona={persona}
                                                        size={48}
                                                        className="shadow-sm"
                                                    />
                                                );
                                            })()}
                                            <p className="font-semibold text-xs text-gray-700 text-center leading-tight truncate w-full px-1">
                                                {persona.name}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 새 상담가 만들기 */}
                    <div className="flex-shrink-0 p-3 border-t border-[#CFF3E4]">
                        <button
                            onClick={() => navigate("/persona")}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#6BCB9A] text-[#6BCB9A] font-semibold text-sm hover:bg-[#CFF3E4]/40 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            {t.createNew}
                        </button>
                    </div>
                </div>

                {/* ── 오른쪽 패널: 선택된 페르소나 상세 ── */}
                <div className="w-1/2 flex flex-col overflow-hidden">
                    {selected ? (
                        <div className="flex-1 flex flex-col px-8 py-6 gap-4">
                            {/* 이름 + 수정/삭제 버튼 */}
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                                    {selected.name}
                                </h2>
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />{" "}
                                        {t.edit}
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 bg-white text-red-400 text-xs font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />{" "}
                                        {t.delete}
                                    </button>
                                </div>
                            </div>

                            {/* 한 줄 설명 */}
                            <p className="text-sm text-gray-500 leading-relaxed items-center">
                                {oneLiner}
                            </p>

                            {/* 아바타 (중앙) */}
                            {(() => {
                                const found = CHARACTER_OPTIONS.find(
                                    (c) => c.id === selected.icon
                                );
                                return found ? (
                                    <div className="flex justify-center">
                                        <div className="w-80 h-100 rounded-2xl overflow-hidden ring-4 ring-white shadow-2xl">
                                            <img
                                                src={found.src}
                                                alt={selected.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <PersonaAvatar
                                        persona={selected}
                                        size={96}
                                        ringClass="ring-4 ring-white shadow-2xl"
                                    />
                                );
                            })()}

                            {/* C-NIP 성향 카드 (2×2 그리드) */}
                            {traitCards && (
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                    {traitCards.map((card) => (
                                        <div
                                            key={card.dimLabel}
                                            className={`${card.bg} rounded-2xl p-3 flex flex-col justify-center`}
                                        >
                                            <p className="text-sm text-gray-400 font-medium mb-1">
                                                {card.dimLabel}
                                            </p>
                                            <p
                                                className={`text-xl font-bold ${card.color} mb-1`}
                                            >
                                                {card.label}
                                            </p>
                                            <p className="text-sm text-gray-500 leading-snug mt-1">
                                                {card.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 대화 시작 버튼 */}
                            <div className="mt-auto pt-2">
                                <button
                                    onClick={handleStartChat}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#6BCB9A] text-white font-bold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t.startConversation}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* 선택 전 플레이스홀더 */
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-12 gap-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/20 flex items-center justify-center mb-2">
                                <User className="w-12 h-12 text-[#6BCB9A]/50" />
                            </div>
                            <p className="text-gray-400 text-lg font-medium">
                                {t.selectCounselor}
                            </p>
                            <p className="text-gray-300 text-sm whitespace-pre-line">
                                {t.selectCounselorDesc}
                            </p>
                            {personas.length === 0 && (
                                <button
                                    onClick={() => navigate("/persona")}
                                    className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#6BCB9A] text-white font-semibold hover:shadow-xl hover:scale-105 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    {t.createFirst}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── 기분 선택 팝업 ── */}
            {showMoodModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {t.howAreYou}
                                </h3>
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {t.moodOptional}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowMoodModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* 기분 그리드 */}
                        <div className="flex gap-2 mb-6">
                            {MOOD_EMOJIS.map((emoji, i) => {
                                const value = MOOD_VALUES[i];
                                const label = t.moods[i];
                                return (
                                    <button
                                        key={value}
                                        onClick={() =>
                                            setSelectedMood(
                                                selectedMood === value
                                                    ? undefined
                                                    : value
                                            )
                                        }
                                        className={`flex flex-col items-center gap-1 py-3 flex-1 rounded-2xl border-2 transition-all ${
                                            selectedMood === value
                                                ? "border-[#6BCB9A] bg-[#CFF3E4]/40 scale-105 shadow"
                                                : "border-gray-100 hover:border-[#6BCB9A]/40 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="text-2xl">
                                            {emoji}
                                        </span>
                                        <span className="text-xs font-medium text-gray-600 text-center leading-tight">
                                            {label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmChat}
                                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#6BCB9A] text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02] transition-all"
                            >
                                {t.startChat}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
