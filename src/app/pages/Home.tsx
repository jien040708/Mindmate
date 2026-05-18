import { useNavigate } from "react-router";
import { Heart, MessageCircle, Plus, User, Sparkles, Zap, Ear, Users, Briefcase, Target, Archive, Database, LogOut, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Persona } from "../types/persona";
import { useAuth } from "../contexts/AuthContext";

const defaultAI: Persona = {
  id: "default",
  name: "MindMate AI",
  mbti: "",
  description: "A general AI counselor ready to help with any concerns",
  color: "#6BCB9A",
  icon: "heart",
};

const defaultPersonas: Persona[] = [
  {
    id: "listener",
    name: "Listener",
    mbti: "INFP",
    description: "A warm counselor who listens carefully and empathizes with you",
    color: "#6BCB9A",
    icon: "ear",
  },
  {
    id: "friend",
    name: "Friend",
    mbti: "ENFP",
    description: "A friendly companion who chats comfortably and shares positive energy",
    color: "#6BCB9A",
    icon: "users",
  },
  {
    id: "consultant",
    name: "Consultant",
    mbti: "INTJ",
    description: "An analytical counselor providing professional and logical advice",
    color: "#6BCB9A",
    icon: "briefcase",
  },
  {
    id: "coach",
    name: "Coach",
    mbti: "ENTJ",
    description: "A motivational guide who presents action plans for achieving goals",
    color: "#6BCB9A",
    icon: "target",
  },
];

const getIcon = (iconName?: string) => {
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
};

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [mood, setMood] = useState<number>(50);
  const [language, setLanguage] = useState<string>("Korean");
  const [hasConsented, setHasConsented] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const savedPersonas = localStorage.getItem("personas");
    if (savedPersonas) {
      setCustomPersonas(JSON.parse(savedPersonas));
    }
  }, []);

  const allPersonas = [...defaultPersonas, ...customPersonas];

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
  };

  const getMoodLabel = (value: number) => {
    if (value < 10) return "Terrible";
    if (value < 20) return "Very Bad";
    if (value < 30) return "Bad";
    if (value < 40) return "Not Good";
    if (value < 50) return "Struggling";
    if (value < 60) return "Okay";
    if (value < 70) return "Fine";
    if (value < 80) return "Good";
    if (value < 90) return "Very Good";
    return "Excellent";
  };

  const getMoodEmoji = (value: number) => {
    if (value < 10) return "😭";
    if (value < 20) return "😢";
    if (value < 30) return "😞";
    if (value < 40) return "😟";
    if (value < 50) return "😕";
    if (value < 60) return "😐";
    if (value < 70) return "🙂";
    if (value < 80) return "😊";
    if (value < 90) return "😄";
    return "🤗";
  };

  const handleStartChat = () => {
    if (!selectedPersona) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    if (!hasConsented) {
      alert("Please acknowledge the AI limitations before starting the conversation.");
      return;
    }
    navigate("/chat", { state: { persona: selectedPersona, mood, language } });
  };

  const handleCreateNew = () => {
    navigate("/persona");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            {user?.name && <span>Welcome, {user.name}!</span>}
            {!user?.name && user?.email && <span>Welcome, {user.email}!</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Database className="w-5 h-5 text-[#355F4B]" />
              <span className="font-semibold text-[#355F4B]">Storage</span>
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <SettingsIcon className="w-5 h-5 text-[#355F4B]" />
              <span className="font-semibold text-[#355F4B]">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <LogOut className="w-5 h-5 text-[#355F4B]" />
              <span className="font-semibold text-[#355F4B]">Logout</span>
            </button>
          </div>
        </div>

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
            AI-powered psychological counseling service that understands your mind
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Select Your Counselor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allPersonas.map((persona) => {
              const IconComponent = getIcon(persona.icon);
              return (
                <div
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona)}
                  className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 h-[200px] flex flex-col ${
                    selectedPersona?.id === persona.id
                      ? "ring-4 ring-[#6BCB9A] scale-105"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: persona.color }}
                    >
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-800 truncate">
                        {persona.name}
                      </h3>
                      <p className="text-sm text-gray-500">{persona.mbti}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-1">
                    {persona.description}
                  </p>
                </div>
              );
            })}

            <div
              onClick={handleCreateNew}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border-2 border-dashed border-[#6BCB9A] flex flex-col items-center justify-center h-[200px]"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#6BCB9A" }}>
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">
                Create New Counselor
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Design your own custom counselor
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-[#CFF3E4]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Preferred Language
            </h3>
            <div className="flex gap-3 justify-center flex-wrap">
              {[
                { value: "Korean", label: "한국어", flag: "🇰🇷" },
                { value: "English", label: "English", flag: "🇺🇸" },
                { value: "Japanese", label: "日本語", flag: "🇯🇵" },
                { value: "Chinese", label: "中文", flag: "🇨🇳" },
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`px-6 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                    language === lang.value
                      ? "border-[#6BCB9A] bg-[#CFF3E4]/30 scale-105"
                      : "border-gray-200 hover:border-[#6BCB9A]/50"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-semibold text-gray-700">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-[#CFF3E4]">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              How are you feeling today? (Optional)
            </h3>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max px-2">
                {[
                  { value: 10, emoji: "😭", label: "Terrible" },
                  { value: 25, emoji: "😢", label: "Very Bad" },
                  { value: 40, emoji: "😟", label: "Not Good" },
                  { value: 50, emoji: "😐", label: "Okay" },
                  { value: 60, emoji: "🙂", label: "Fine" },
                  { value: 75, emoji: "😊", label: "Good" },
                  { value: 85, emoji: "😄", label: "Very Good" },
                  { value: 95, emoji: "🤗", label: "Excellent" },
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
                    <div className="text-3xl mb-2">{option.emoji}</div>
                    <div className="text-xs font-semibold text-gray-700">
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#6BCB9A] border-gray-300 rounded focus:ring-[#6BCB9A]"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    I acknowledge the following:
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    This AI service may occasionally provide responses that are inaccurate,
                    inappropriate, or unhelpful. This is not a substitute for professional
                    mental health care. If experiencing a crisis, please contact a licensed
                    professional immediately.
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleStartChat}
              disabled={!hasConsented || !selectedPersona}
              className={`w-full px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                hasConsented && selectedPersona
                  ? "bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white hover:shadow-xl hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              {selectedPersona
                ? `Start Conversation with ${selectedPersona.name}`
                : "Start Conversation"}
            </button>
            {showWarning && (
              <p className="text-center text-sm text-red-500 animate-pulse">
                Please select a counselor to start
              </p>
            )}
            {selectedPersona && !hasConsented && (
              <p className="text-center text-sm text-yellow-600">
                Please acknowledge the terms above
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-[#CFF3E4]">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Service Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-[#355F4B]" />
              </div>
              <h4 className="font-semibold text-gray-800">24/7 Support</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chat anytime, anywhere
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-[#355F4B]" />
              </div>
              <h4 className="font-semibold text-gray-800">Diverse Personalities</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Various MBTI counselors
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-2xl flex items-center justify-center">
                <Archive className="w-7 h-7 text-[#355F4B]" />
              </div>
              <h4 className="font-semibold text-gray-800">Long-term Partner</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Save your conversations and build lasting relationships
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-2xl flex items-center justify-center">
                <Zap className="w-7 h-7 text-[#355F4B]" />
              </div>
              <h4 className="font-semibold text-gray-800">Personalized Care</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Choose the right counselor for you
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}