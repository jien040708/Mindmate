import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, User, Ear, Users, Briefcase, Target, Heart } from "lucide-react";
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
      .map((dim, i) => (values[i] < 50 ? dim.left : dim.right))
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
    const mbti = getMBTI();
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: name || `${mbti} Counselor`,
      mbti,
      description: getMBTIDescription(mbti),
      color: selectedColor,
      icon: selectedIcon,
    };

    const savedPersonas = localStorage.getItem("personas");
    const personas = savedPersonas ? JSON.parse(savedPersonas) : [];
    personas.push(newPersona);
    localStorage.setItem("personas", JSON.stringify(personas));

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent mb-3">
            Create Counselor Persona
          </h1>
          <p className="text-gray-600">
            Adjust sliders to set your counselor's personality
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-10">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-800">
              Counselor Name (Optional)
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${getMBTI()} Counselor`}
              className="w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] focus:border-transparent"
            />
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
              <div className="flex items-center gap-6">
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[#6BCB9A]">
                    {dimension.leftLabel} ({dimension.left})
                  </div>
                  <p className="text-sm text-gray-500">{dimension.leftDesc}</p>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-semibold text-[#355F4B]">
                    {dimension.rightLabel} ({dimension.right})
                  </div>
                  <p className="text-sm text-gray-500">{dimension.rightDesc}</p>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={values[index]}
                onChange={(e) =>
                  handleSliderChange(index, parseInt(e.target.value))
                }
                className="w-full h-3 bg-gradient-to-r from-[#CFF3E4] to-[#6BCB9A]/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#6BCB9A] [&::-webkit-slider-thumb]:to-[#355F4B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
              />
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
