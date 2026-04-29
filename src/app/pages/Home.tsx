import { useNavigate } from "react-router";
import { Heart, MessageCircle, Plus, User, Sparkles, Zap, Ear, Users, Briefcase, Target, Archive, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { Persona } from "../types/persona";

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
    color: "#EEDC82",
    icon: "users",
  },
  {
    id: "consultant",
    name: "Consultant",
    mbti: "INTJ",
    description: "An analytical counselor providing professional and logical advice",
    color: "#355F4B",
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
  const [customPersonas, setCustomPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [mood, setMood] = useState<number>(50);

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
    if (value < 20) return "Very Bad";
    if (value < 40) return "Bad";
    if (value < 60) return "Okay";
    if (value < 80) return "Good";
    return "Very Good";
  };

  const getMoodEmoji = (value: number) => {
    if (value < 20) return "😢";
    if (value < 40) return "😟";
    if (value < 60) return "😐";
    if (value < 80) return "🙂";
    return "😄";
  };

  const handleStartChat = () => {
    const personaToUse = selectedPersona || defaultAI;
    navigate("/chat", { state: { persona: personaToUse, mood } });
  };

  const handleCreateNew = () => {
    navigate("/persona");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate("/history")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Database className="w-5 h-5 text-[#355F4B]" />
            <span className="font-semibold text-[#355F4B]">Storage</span>
          </button>
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
              How are you feeling today? (Optional)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Bad</span>
                <div className="text-center">
                  <div className="text-3xl mb-1">{getMoodEmoji(mood)}</div>
                  <div className="font-semibold text-gray-700">
                    {getMoodLabel(mood)}
                  </div>
                </div>
                <span>Good</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#6BCB9A] [&::-webkit-slider-thumb]:to-[#355F4B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleStartChat}
              className="w-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-6 h-6" />
              {selectedPersona
                ? `Start Conversation with ${selectedPersona.name}`
                : "Start Conversation"}
            </button>
            {!selectedPersona && (
              <p className="text-center text-sm text-gray-500 mt-3">
                No counselor selected? You'll chat with our general AI counselor
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
