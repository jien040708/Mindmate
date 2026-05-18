import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, User, Ear, Users, Briefcase, Target, Heart, ArrowLeft } from "lucide-react";
import { Persona } from "../types/persona";

const getIcon = (iconName: string) => {
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

const mbtiDimensions = [
  {
    name: "Energy Direction",
    left: "E",
    right: "I",
    leftLabel: "Extraverted",
    rightLabel: "Introverted",
    leftDesc: "Gains energy from being with people",
    rightDesc: "Gains energy from alone time",
  },
  {
    name: "Perception Style",
    left: "S",
    right: "N",
    leftLabel: "Sensing",
    rightLabel: "Intuitive",
    leftDesc: "Focuses on present and practical matters",
    rightDesc: "Imagines future and possibilities",
  },
  {
    name: "Decision Making",
    left: "T",
    right: "F",
    leftLabel: "Thinking",
    rightLabel: "Feeling",
    leftDesc: "Values logic and analysis",
    rightDesc: "Values emotions and relationships",
  },
  {
    name: "Lifestyle",
    left: "J",
    right: "P",
    leftLabel: "Judging",
    rightLabel: "Perceiving",
    leftDesc: "Planned and organized",
    rightDesc: "Flexible and spontaneous",
  },
];

const colorOptions = [
  "#6BCB9A",
  "#355F4B",
  "#EEDC82",
  "#CFF3E4",
  "#6B9ACB",
  "#CB6B9A",
];

const iconOptions = [
  { name: "user", label: "User" },
  { name: "ear", label: "Ear" },
  { name: "users", label: "Users" },
  { name: "briefcase", label: "Briefcase" },
  { name: "target", label: "Target" },
  { name: "heart", label: "Heart" },
];

export default function PersonaSetting() {
  const navigate = useNavigate();
  const [values, setValues] = useState<number[]>([50, 50, 50, 50]);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0].name);

  const handleSliderChange = (index: number, value: number) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  const getMBTI = () => {
    return mbtiDimensions
      .map((dim, i) => {
        // More granular selection: under 45 = left, over 55 = right, 45-55 = slightly favoring the side
        if (values[i] < 45) return dim.left;
        if (values[i] > 55) return dim.right;
        // For middle range, use exact 50 as threshold
        return values[i] < 50 ? dim.left : dim.right;
      })
      .join("");
  };

  const getMBTIDescription = (mbti: string) => {
    const descriptions: { [key: string]: string } = {
      INTJ: "Strategic and analytical counselor",
      INTP: "Logical and objective advisor",
      ENTJ: "Goal-oriented and leadership-focused counselor",
      ENTP: "Creative and innovative problem solver",
      INFJ: "Empathetic and insightful counselor",
      INFP: "Warm and idealistic counselor",
      ENFJ: "Charismatic and inspiring counselor",
      ENFP: "Enthusiastic and positive energy provider",
      ISTJ: "Systematic and reliable counselor",
      ISFJ: "Attentive and caring counselor",
      ESTJ: "Practical and efficient advisor",
      ESFJ: "Friendly and sociable counselor",
      ISTP: "Excellent problem-solving counselor",
      ISFP: "Artistic and sensitive counselor",
      ESTP: "Active and realistic counselor",
      ESFP: "Fun and energetic counselor",
    };
    return descriptions[mbti] || "Your unique counselor";
  };

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter a name for your counselor.");
      return;
    }

    const trimmedName = name.trim();
    const normalizedName = trimmedName.toLowerCase();

    // Check against default persona names
    const defaultPersonaNames = ["listener", "friend", "consultant", "coach"];
    if (defaultPersonaNames.includes(normalizedName)) {
      alert(`"${trimmedName}" is a reserved name. Please choose a different name.`);
      return;
    }

    // Check for duplicate names in saved personas
    const savedPersonas = localStorage.getItem("personas");
    const personas = savedPersonas ? JSON.parse(savedPersonas) : [];

    if (personas.some((p: Persona) => p.name.toLowerCase() === normalizedName)) {
      alert(`A counselor with the name "${trimmedName}" already exists. Please choose a different name.`);
      return;
    }

    const mbti = getMBTI();
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: trimmedName,
      mbti,
      description: getMBTIDescription(mbti),
      color: selectedColor,
      icon: selectedIcon,
    };

    personas.push(newPersona);
    localStorage.setItem("personas", JSON.stringify(personas));

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-[#355F4B]" />
            <span className="font-semibold text-[#355F4B]">Back to Home</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent mb-3">
            Create Counselor Persona
          </h1>
          <p className="text-gray-600">
            Select your counselor's MBTI personality traits
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">
              Counselor Name <span className="text-red-500">*</span>
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a unique name for your counselor"
              required
              className="w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              * Required field - Must be unique
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">
              Counselor Color
            </h3>
            <div className="flex gap-3 flex-wrap">
              {colorOptions.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full ${
                    selectedColor === color
                      ? "ring-4 ring-gray-300 scale-110"
                      : ""
                  } transition-all duration-200`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">
              Counselor Icon
            </h3>
            <div className="flex gap-3 flex-wrap">
              {iconOptions.map((iconOption) => {
                const IconComponent = getIcon(iconOption.name);
                return (
                  <button
                    key={iconOption.name}
                    onClick={() => setSelectedIcon(iconOption.name)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedIcon === iconOption.name
                        ? "ring-4 ring-[#6BCB9A] scale-110"
                        : "ring-2 ring-gray-200"
                    } transition-all duration-200`}
                    style={{ backgroundColor: selectedColor }}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </button>
                );
              })}
            </div>
          </div>

          {mbtiDimensions.map((dimension, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">
                {dimension.name}
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSliderChange(index, 25)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    values[index] < 50
                      ? "border-[#6BCB9A] bg-[#CFF3E4]/30 scale-105"
                      : "border-gray-200 hover:border-[#6BCB9A]/50"
                  }`}
                >
                  <div className="font-semibold text-[#6BCB9A] text-sm mb-1">
                    {dimension.leftLabel}
                  </div>
                  <div className="text-3xl font-bold text-[#355F4B] mb-2">
                    {dimension.left}
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">
                    {dimension.leftDesc}
                  </p>
                </button>
                <button
                  onClick={() => handleSliderChange(index, 75)}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    values[index] >= 50
                      ? "border-[#355F4B] bg-[#CFF3E4]/30 scale-105"
                      : "border-gray-200 hover:border-[#355F4B]/50"
                  }`}
                >
                  <div className="font-semibold text-[#355F4B] text-sm mb-1">
                    {dimension.rightLabel}
                  </div>
                  <div className="text-3xl font-bold text-[#6BCB9A] mb-2">
                    {dimension.right}
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">
                    {dimension.rightDesc}
                  </p>
                </button>
              </div>
            </div>
          ))}

          <div className="pt-6 border-t">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Counselor MBTI</p>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent mb-2">
                {getMBTI()}
              </div>
              <p className="text-sm text-gray-500">
                {getMBTIDescription(getMBTI())}
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              Create Persona
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
