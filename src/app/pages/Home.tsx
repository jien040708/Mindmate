import { useNavigate } from "react-router";
import { Heart, MessageCircle, Plus, User, Ear, Users, Briefcase, Target, Archive, Database, LogOut, Settings as SettingsIcon, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { Persona } from "../types/persona";
import { useAuth } from "../contexts/AuthContext";

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case "ear": return Ear;
    case "users": return Users;
    case "briefcase": return Briefcase;
    case "target": return Target;
    case "heart": return Heart;
    default: return User;
  }
};

const LANGUAGES = [
  { value: "Korean",   label: "한국어", flag: "🇰🇷" },
  { value: "English",  label: "English", flag: "🇺🇸" },
  { value: "Japanese", label: "日本語", flag: "🇯🇵" },
  { value: "Chinese",  label: "中文", flag: "🇨🇳" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [mood, setMood] = useState<number>(50);
  const [language, setLanguage] = useState<string>(
    () => localStorage.getItem("mindmate_language") || "Korean"
  );
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("personas");
    if (saved) setPersonas(JSON.parse(saved));
  }, []);

  const handleSelectLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("mindmate_language", lang);
  };

  const handleSelectPersona = (persona: Persona) => setSelectedPersona(persona);

  const handleStartChat = () => {
    if (!selectedPersona) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    navigate("/chat", { state: { persona: selectedPersona, mood, language } });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentLang = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
      <div className="max-w-6xl mx-auto">

        {/* ── 상단 바 ── */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div className="text-sm text-gray-600">
            {user?.name
              ? <span>안녕하세요, {user.name}!</span>
              : user?.email
              ? <span>안녕하세요, {user.email}!</span>
              : null}
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* 언어 선택 */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => handleSelectLanguage(e.target.value)}
                className="appearance-none pl-8 pr-4 py-2 bg-white rounded-full shadow-lg text-sm font-semibold text-[#355F4B] border-none focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
              <Globe className="w-4 h-4 text-[#355F4B] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Database className="w-5 h-5 text-[#355F4B]" />
              <span className="font-semibold text-[#355F4B]">기록</span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <SettingsIcon className="w-5 h-5 text-[#355F4B]" />
              <span className="font-semibold text-[#355F4B]">설정</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <LogOut className="w-5 h-5 text-[#355F4B]" />
              <span className="font-semibold text-[#355F4B]">로그아웃</span>
            </button>
          </div>
        </div>

        {/* ── 타이틀 ── */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] p-4 rounded-full">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent mb-3">
            MindMate
          </h1>
          <p className="text-xl text-gray-600">
            AI 심리 상담 서비스
          </p>
        </div>

        {/* ── 상담가 선택 ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">상담가 선택</h2>

          {personas.length === 0 ? (
            <div className="text-center py-16 bg-white/70 rounded-3xl border-2 border-dashed border-[#6BCB9A]">
              <div className="w-20 h-20 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[#355F4B]" />
              </div>
              <p className="text-gray-500 mb-6 text-lg">아직 만든 상담가가 없어요</p>
              <button
                onClick={() => navigate("/persona")}
                className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all"
              >
                나만의 상담가 만들기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {personas.map((persona) => {
                const IconComponent = getIcon(persona.icon);
                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona)}
                    className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 flex flex-col ${
                      selectedPersona?.id === persona.id
                        ? "ring-4 ring-[#6BCB9A] scale-105"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: persona.color }}
                      >
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-800 truncate">{persona.name}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-3 flex-1">{persona.description}</p>
                  </div>
                );
              })}

              {/* 새로 만들기 카드 */}
              <div
                onClick={() => navigate("/persona")}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-2 border-dashed border-[#6BCB9A] flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: "#6BCB9A" }}>
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">새 상담가 만들기</h3>
                <p className="text-xs text-gray-500 text-center">C-NIP 설문으로 맞춤 설정</p>
              </div>
            </div>
          )}
        </div>

        {/* ── 오늘의 기분 ── */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-[#CFF3E4]">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            오늘 기분이 어때요? (선택)
          </h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max px-2">
              {[
                { value: 10, emoji: "😭", label: "최악" },
                { value: 25, emoji: "😢", label: "매우 안 좋음" },
                { value: 40, emoji: "😟", label: "안 좋음" },
                { value: 50, emoji: "😐", label: "그냥 그래" },
                { value: 60, emoji: "🙂", label: "괜찮음" },
                { value: 75, emoji: "😊", label: "좋음" },
                { value: 85, emoji: "😄", label: "매우 좋음" },
                { value: 95, emoji: "🤗", label: "최고" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center flex-shrink-0 ${
                    mood >= option.value - 7 && mood <= option.value + 7
                      ? "border-[#6BCB9A] bg-[#CFF3E4]/30 scale-105"
                      : "border-gray-200 hover:border-[#6BCB9A]/50"
                  }`}
                >
                  <div className="text-3xl mb-1">{option.emoji}</div>
                  <div className="text-xs font-semibold text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 시작 버튼 ── */}
        <div className="space-y-3 mb-12">
          <button
            onClick={handleStartChat}
            disabled={!selectedPersona}
            className={`w-full px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedPersona
                ? "bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white hover:shadow-xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            {selectedPersona
              ? `${selectedPersona.name}와 대화 시작하기`
              : "상담가를 선택해 주세요"}
          </button>
          {showWarning && (
            <p className="text-center text-sm text-red-500 animate-pulse">
              대화를 시작하려면 상담가를 선택해 주세요
            </p>
          )}
        </div>

        {/* ── 서비스 소개 ── */}
        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-[#CFF3E4]">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">서비스 특징</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MessageCircle, title: "24/7 지원", desc: "언제 어디서든 대화할 수 있어요" },
              { icon: User, title: "맞춤 성향", desc: "C-NIP 설문으로 나에게 딱 맞는 상담가를 만들어요" },
              { icon: Archive, title: "대화 기록", desc: "대화를 저장하고 언제든지 다시 볼 수 있어요" },
              { icon: Globe, title: "다국어 지원", desc: "한국어, 영어, 일본어, 중국어로 상담받을 수 있어요" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-2xl flex items-center justify-center">
                  <Icon className="w-7 h-7 text-[#355F4B]" />
                </div>
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
