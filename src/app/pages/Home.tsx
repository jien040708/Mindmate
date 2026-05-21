import { useNavigate } from "react-router";
import {
  Heart, MessageCircle, Plus, User, Ear, Users, Briefcase, Target,
  Database, LogOut, Settings as SettingsIcon, Globe, Trash2, X, ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Persona } from "../types/persona";
import { useAuth } from "../contexts/AuthContext";
import { getTraitLabels } from "./PersonaSetting";

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "ear":       return Ear;
    case "users":     return Users;
    case "briefcase": return Briefcase;
    case "target":    return Target;
    case "heart":     return Heart;
    default:          return User;
  }
};

const LANGUAGES = [
  { value: "Korean",   label: "한국어", flag: "🇰🇷" },
  { value: "English",  label: "English", flag: "🇺🇸" },
  { value: "Japanese", label: "日本語", flag: "🇯🇵" },
  { value: "Chinese",  label: "中文",   flag: "🇨🇳" },
];

const MOODS = [
  { value: 10,  emoji: "😭", label: "최악" },
  { value: 25,  emoji: "😢", label: "매우 안 좋음" },
  { value: 40,  emoji: "😟", label: "안 좋음" },
  { value: 50,  emoji: "😐", label: "그냥 그래" },
  { value: 60,  emoji: "🙂", label: "괜찮음" },
  { value: 75,  emoji: "😊", label: "좋음" },
  { value: 85,  emoji: "😄", label: "매우 좋음" },
  { value: 95,  emoji: "🤗", label: "최고" },
];

export default function Home() {
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const [personas, setPersonas]               = useState<Persona[]>([]);
  const [selected, setSelected]               = useState<Persona | null>(null);
  const [language, setLanguage]               = useState<string>(
    () => localStorage.getItem("mindmate_language") || "Korean"
  );
  const [showMoodModal, setShowMoodModal]     = useState(false);
  const [selectedMood, setSelectedMood]       = useState<number | undefined>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("personas");
    if (saved) setPersonas(JSON.parse(saved));
  }, []);

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("mindmate_language", lang);
  };

  const handleDelete = () => {
    if (!selected) return;
    if (!window.confirm(`"${selected.name}" 상담가를 삭제할까요?`)) return;
    const updated = personas.filter((p) => p.id !== selected.id);
    localStorage.setItem("personas", JSON.stringify(updated));
    setPersonas(updated);
    setSelected(null);
  };

  const handleStartChat = () => {
    if (!selected) return;
    setSelectedMood(undefined);
    setShowMoodModal(true);
  };

  const handleConfirmChat = () => {
    setShowMoodModal(false);
    navigate("/chat", { state: { persona: selected, mood: selectedMood, language } });
  };

  const traits = selected?.cnipScores ? getTraitLabels(selected.cnipScores) : null;

  const traitBadges = traits
    ? [
        { label: traits.td.label,  color: traits.td.color  },
        { label: traits.ei.label,  color: traits.ei.color  },
        { label: traits.pao.label, color: traits.pao.color },
        { label: traits.ws.label,  color: traits.ws.color  },
      ]
    : [];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] overflow-hidden">

      {/* ── 상단 바 ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white/70 backdrop-blur-sm border-b border-[#CFF3E4]">
        {/* 로고 */}
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] p-2 rounded-full">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
            MindMate
          </span>
          {user?.name && (
            <span className="text-sm text-gray-400 ml-2">· 안녕하세요, {user.name}!</span>
          )}
        </div>

        {/* 우측 컨트롤 */}
        <div className="flex items-center gap-2">
          {/* 언어 선택 */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => handleSelectLanguage(e.target.value)}
              className="appearance-none pl-7 pr-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#355F4B] border border-[#CFF3E4] focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
              ))}
            </select>
            <Globe className="w-3.5 h-3.5 text-[#355F4B] absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#355F4B] border border-[#CFF3E4] hover:shadow-md transition-all"
          >
            <Database className="w-4 h-4" /> 기록
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#355F4B] border border-[#CFF3E4] hover:shadow-md transition-all"
          >
            <SettingsIcon className="w-4 h-4" /> 설정
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#355F4B] border border-[#CFF3E4] hover:shadow-md transition-all"
          >
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
        </div>
      </div>

      {/* ── 2분할 메인 ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── 왼쪽 패널: 페르소나 목록 ── */}
        <div className="w-1/2 flex-shrink-0 flex flex-col bg-white/50 backdrop-blur-sm border-r border-[#CFF3E4]">
          <div className="px-4 py-3 border-b border-[#CFF3E4]">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider">상담가 목록</h2>
          </div>

          {/* 목록 (스크롤 가능) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {personas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-400">
                <User className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">아직 상담가가 없어요</p>
                <p className="text-xs mt-1">아래 버튼으로 만들어보세요</p>
              </div>
            ) : (
              personas.map((persona) => {
                const IconComp = getIcon(persona.icon);
                const isSelected = selected?.id === persona.id;
                return (
                  <button
                    key={persona.id}
                    onClick={() => setSelected(persona)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-[#6BCB9A]/20 to-[#355F4B]/10 border-2 border-[#6BCB9A] shadow-sm"
                        : "hover:bg-white/80 border-2 border-transparent"
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: persona.color }}
                    >
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{persona.name}</p>
                      <p className="text-xs text-gray-400 truncate">{persona.description}</p>
                    </div>
                    {isSelected && <ChevronRight className="w-4 h-4 text-[#6BCB9A] flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* 새 상담가 만들기 */}
          <div className="flex-shrink-0 p-3 border-t border-[#CFF3E4]">
            <button
              onClick={() => navigate("/persona")}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[#6BCB9A] text-[#355F4B] font-semibold text-sm hover:bg-[#CFF3E4]/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              새 상담가 만들기
            </button>
          </div>
        </div>

        {/* ── 오른쪽 패널: 선택된 페르소나 상세 ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selected ? (
            <>
              {/* 상세 정보 (스크롤 없이 꽉 채우기) */}
              <div className="flex-1 flex flex-col items-center justify-center px-12 py-8 gap-5">
                {/* 아바타 */}
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white"
                  style={{ backgroundColor: selected.color }}
                >
                  {(() => { const I = getIcon(selected.icon); return <I className="w-14 h-14 text-white" />; })()}
                </div>

                {/* 이름 */}
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-1">{selected.name}</h2>
                  <p className="text-gray-500 text-sm max-w-sm text-center leading-relaxed">
                    {selected.description}
                  </p>
                </div>

                {/* C-NIP 성향 뱃지 */}
                {traitBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {traitBadges.map((t, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-semibold bg-white shadow-sm border border-gray-100 ${t.color}`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* 구분선 */}
                <div className="w-16 h-0.5 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] rounded-full" />

                {/* 힌트 */}
                <p className="text-xs text-gray-400 text-center">
                  C-NIP 설문 기반으로 설정된 나만의 상담가예요
                </p>
              </div>

              {/* 하단 버튼 바 */}
              <div className="flex-shrink-0 px-10 py-5 border-t border-[#CFF3E4] bg-white/40 backdrop-blur-sm flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-red-200 text-red-400 font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </button>
                <button
                  onClick={handleStartChat}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white font-semibold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  {selected.name}와 대화 시작
                </button>
              </div>
            </>
          ) : (
            /* 선택 전 플레이스홀더 */
            <div className="flex-1 flex flex-col items-center justify-center text-center px-12 gap-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/20 flex items-center justify-center mb-2">
                <User className="w-12 h-12 text-[#6BCB9A]/50" />
              </div>
              <p className="text-gray-400 text-lg font-medium">상담가를 선택해 주세요</p>
              <p className="text-gray-300 text-sm">왼쪽 목록에서 상담가를 선택하면<br />상세 정보와 대화 시작 버튼이 나타나요</p>
              {personas.length === 0 && (
                <button
                  onClick={() => navigate("/persona")}
                  className="mt-4 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white font-semibold hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  첫 상담가 만들기
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
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800">오늘 기분이 어때요?</h3>
                <p className="text-sm text-gray-400 mt-0.5">선택하지 않아도 대화를 시작할 수 있어요</p>
              </div>
              <button
                onClick={() => setShowMoodModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* 기분 그리드 */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(selectedMood === m.value ? undefined : m.value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                    selectedMood === m.value
                      ? "border-[#6BCB9A] bg-[#CFF3E4]/40 scale-105 shadow"
                      : "border-gray-100 hover:border-[#6BCB9A]/40 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-medium text-gray-600 text-center leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedMood(undefined); handleConfirmChat(); }}
                className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all"
              >
                건너뛰기
              </button>
              <button
                onClick={handleConfirmChat}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white font-semibold text-sm hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                대화 시작 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
