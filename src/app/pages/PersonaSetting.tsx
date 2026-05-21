import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, User, Ear, Users, Briefcase, Target, Heart, ArrowLeft, ClipboardList } from "lucide-react";
import { Persona, CnipScores } from "../types/persona";

// ─── C-NIP 설문 데이터 ──────────────────────────────────────────────────────────
const cnipDimensions = [
  {
    id: "td" as const,
    title: "치료사 주도성 vs 내담자 주도성",
    subtitle: "Therapist Directiveness vs. Client Directiveness",
    questions: [
      { left: "뚜렷한 목표를 세우고 상담하기", right: "특별한 목표 없이 자유롭게 상담하기" },
      { left: "체계적인 방식으로 대화 이끌기", right: "정해진 틀 없이 편안하게 대화하기" },
      { left: "문제 해결에 필요한 기술 알려주기", right: "구체적인 기술 가르치지 않기" },
      { left: "상담 후 과제(숙제) 내주기", right: "별도의 과제나 숙제 주지 않기" },
      { left: "AI 상담가가 대화를 주도하기", right: "내가 원하는 방향으로 대화 주도하기" },
    ],
  },
  {
    id: "ei" as const,
    title: "감정적 강렬함 vs 감정적 절제",
    subtitle: "Emotional Intensity vs. Emotional Reserve",
    questions: [
      { left: "불편한 감정도 깊이 다루도록 격려하기", right: "굳이 불편한 감정을 들추지 않기" },
      { left: "AI와 나의 상담 관계에 대해 이야기하기", right: "상담 관계보다 내 문제 자체에 집중하기" },
      { left: "나와 AI의 상호작용에 집중하기", right: "상호작용보다 내 문제 자체에 집중하기" },
      { left: "강렬한 감정을 솔직하게 쏟아내도록 격려하기", right: "강렬한 감정 표출을 굳이 유도하지 않기" },
      { left: "내 '감정'을 중심으로 다루기", right: "내 '생각과 논리'를 중심으로 다루기" },
    ],
  },
  {
    id: "pao" as const,
    title: "과거 지향 vs 현재 지향",
    subtitle: "Past Orientation vs. Present Orientation",
    questions: [
      { left: "과거의 내 삶과 경험에 집중하기", right: "현재의 내 삶과 상황에 집중하기" },
      { left: "어린 시절의 기억과 경험 돌아보기", right: "성인이 된 이후의 삶에 초점 맞추기" },
      { left: "지나온 나의 과거에 집중하기", right: "앞으로 다가올 미래에 집중하기" },
    ],
  },
  {
    id: "ws" as const,
    title: "따뜻한 지지 vs 초점화된 도전",
    subtitle: "Warm Support vs. Focused Challenge",
    questions: [
      { left: "부드럽고 온화하게 다가오기", right: "다소 날카롭더라도 직면할 수 있게 자극하기" },
      { left: "내 입장을 전적으로 지지하고 공감하기", right: "내 생각의 모순이나 문제점을 지적하기" },
      { left: "대화 중 내 말을 끊지 않고 끝까지 듣기", right: "주제 벗어나면 말을 끊어서라도 초점 잡아주기" },
      { left: "내 가치관이나 신념에 의문 제기하지 않기", right: "내 가치관이나 신념이 맞는지 이성적으로 짚어보기" },
      { left: "내 행동을 무조건적으로 긍정하고 지지하기", right: "내 행동에 잘못된 점이 있다면 명확히 지적하기" },
    ],
  },
];

// 각 dimension의 시작 질문 인덱스를 미리 계산
const dimensionStartIdx = cnipDimensions.reduce<number[]>((acc, dim, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + cnipDimensions[i - 1].questions.length);
  return acc;
}, []);

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

const colorOptions = ["#6BCB9A", "#355F4B", "#EEDC82", "#CFF3E4", "#6B9ACB", "#CB6B9A"];
const iconOptions = [
  { name: "user", label: "User" },
  { name: "ear", label: "Ear" },
  { name: "users", label: "Users" },
  { name: "briefcase", label: "Briefcase" },
  { name: "target", label: "Target" },
  { name: "heart", label: "Heart" },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "ear": return Ear;
    case "users": return Users;
    case "briefcase": return Briefcase;
    case "target": return Target;
    case "heart": return Heart;
    default: return User;
  }
};

// ─── 점수 계산 ─────────────────────────────────────────────────────────────────
export function calcCnipScores(values: number[]): CnipScores {
  const [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14, q15, q16, q17, q18] = values;
  return {
    td:  -(q1 + q2 + q3 + q4 + q5),
    ei:  -(q6 + q7 + q8 + q9 + q10),
    pao: -(q11 + q12 + q13),
    ws:  -(q14 + q15 + q16 + q17 + q18),
  };
}

export function getTraitLabels(scores: CnipScores) {
  const td =
    scores.td >= 8   ? { label: "AI 주도", color: "text-blue-600",   desc: "대화와 목표를 AI가 능동적으로 이끌어요" }
    : scores.td <= -3 ? { label: "내담자 주도", color: "text-purple-600", desc: "내가 원하는 방향으로 자유롭게 대화해요" }
    :                   { label: "균형", color: "text-green-600",  desc: "상황에 맞게 유연하게 조율해요" };

  const ei =
    scores.ei >= 7   ? { label: "감정 집중", color: "text-rose-600",  desc: "깊은 감정을 충분히 탐색하고 표현해요" }
    : scores.ei <= -1 ? { label: "이성/논리", color: "text-sky-600",   desc: "사실과 논리 중심으로 상황을 분석해요" }
    :                   { label: "균형", color: "text-green-600",  desc: "감정과 논리를 균형 있게 다뤄요" };

  const pao =
    scores.pao >= 3  ? { label: "과거 지향", color: "text-amber-600", desc: "과거 경험과 어린 시절을 중심으로 탐색해요" }
    : scores.pao <= -3? { label: "현재/미래 지향", color: "text-teal-600",  desc: "지금 할 수 있는 것과 미래 목표에 집중해요" }
    :                   { label: "균형", color: "text-green-600",  desc: "과거 맥락과 현재 상황을 함께 살펴요" };

  const ws =
    scores.ws >= 4   ? { label: "따뜻한 지지", color: "text-orange-500", desc: "무조건적인 공감과 긍정적 존중을 제공해요" }
    : scores.ws <= -4 ? { label: "직면/도전", color: "text-red-600",    desc: "논리적 오류나 모순을 직접적으로 짚어줘요" }
    :                   { label: "균형", color: "text-green-600",    desc: "지지하면서도 필요할 때 솔직한 피드백을 줘요" };

  return { td, ei, pao, ws };
}

export function getCnipDescription(scores: CnipScores): string {
  const t = getTraitLabels(scores);
  return `${t.td.label} · ${t.ei.label} · ${t.pao.label} · ${t.ws.label} 상담가`;
}

// ─── 7-circle 선택 컴포넌트 ────────────────────────────────────────────────────
function SevenCircleScale({
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-gray-500 flex-1 text-right leading-tight min-w-0 pr-1">
        {leftLabel}
      </span>
      <div className="flex gap-1.5 flex-shrink-0">
        {SCALE_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            title={v > 0 ? `+${v}` : String(v)}
            className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
              value === v
                ? "bg-[#6BCB9A] border-[#355F4B] scale-110 shadow"
                : "bg-white border-gray-300 hover:border-[#6BCB9A]"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 flex-1 leading-tight min-w-0 pl-1">
        {rightLabel}
      </span>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function PersonaSetting() {
  const navigate = useNavigate();
  const [qValues, setQValues] = useState<number[]>(Array(18).fill(0));
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedIcon, setSelectedIcon] = useState(iconOptions[0].name);

  const handleQ = (index: number, value: number) => {
    const next = [...qValues];
    next[index] = value;
    setQValues(next);
  };

  const scores = calcCnipScores(qValues);
  const traits = getTraitLabels(scores);

  const traitRows = [
    { dimLabel: "주도성",       ...traits.td,  score: scores.td,  maxAbs: 15 },
    { dimLabel: "감정 초점",    ...traits.ei,  score: scores.ei,  maxAbs: 15 },
    { dimLabel: "시간 지향",    ...traits.pao, score: scores.pao, maxAbs: 9  },
    { dimLabel: "피드백 스타일",...traits.ws,  score: scores.ws,  maxAbs: 15 },
  ];

  const handleCreate = () => {
    if (!name.trim()) {
      alert("상담가 이름을 입력해 주세요.");
      return;
    }
    const trimmedName = name.trim();
    const savedPersonas = localStorage.getItem("personas");
    const personas: Persona[] = savedPersonas ? JSON.parse(savedPersonas) : [];

    if (personas.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert(`"${trimmedName}" 이름의 상담가가 이미 존재해요. 다른 이름을 사용해 주세요.`);
      return;
    }

    const newPersona: Persona = {
      id: Date.now().toString(),
      name: trimmedName,
      mbti: "",
      description: getCnipDescription(scores),
      color: selectedColor,
      icon: selectedIcon,
      cnipScores: scores,
      cnipValues: [...qValues],
    };

    personas.push(newPersona);
    localStorage.setItem("personas", JSON.stringify(personas));
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로가기 */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-[#355F4B]" />
            <span className="font-semibold text-[#355F4B]">홈으로 돌아가기</span>
          </button>
        </div>

        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] rounded-full mb-4">
            <ClipboardList className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent mb-3">
            나만의 상담가 만들기
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto text-sm">
            아래 설문을 통해 나에게 딱 맞는 AI 상담가 스타일을 설정해요.
            각 문항에서 왼쪽(-3) ~ 오른쪽(+3) 중 선호하는 위치의 동그라미를 클릭해 주세요.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-10">

          {/* 이름 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">
              상담가 이름 <span className="text-red-500">*</span>
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="나만의 상담가 이름을 입력하세요"
              className="w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] focus:border-transparent"
            />
          </div>

          {/* 색상 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">색상</h3>
            <div className="flex gap-3 flex-wrap">
              {colorOptions.map((color, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-11 h-11 rounded-full transition-all duration-200 ${
                    selectedColor === color ? "ring-4 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 아이콘 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-800">아이콘</h3>
            <div className="flex gap-3 flex-wrap">
              {iconOptions.map((opt) => {
                const IconComp = getIcon(opt.name);
                return (
                  <button
                    key={opt.name}
                    type="button"
                    onClick={() => setSelectedIcon(opt.name)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                      selectedIcon === opt.name
                        ? "ring-4 ring-[#6BCB9A] scale-110"
                        : "ring-2 ring-gray-200"
                    }`}
                    style={{ backgroundColor: selectedColor }}
                  >
                    <IconComp className="w-5 h-5 text-white" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 눈금 설명 */}
          <div className="bg-[#CFF3E4]/40 rounded-2xl p-4 text-sm text-gray-600 flex gap-6 flex-wrap justify-center">
            <span><strong className="text-[#355F4B]">-3</strong> 왼쪽 항목 강하게 선호</span>
            <span><strong className="text-gray-400">0</strong> 중립 / 선호도 없음</span>
            <span><strong className="text-[#355F4B]">+3</strong> 오른쪽 항목 강하게 선호</span>
          </div>

          {/* 각 차원별 설문 */}
          {cnipDimensions.map((dim, dimIdx) => {
            const startIdx = dimensionStartIdx[dimIdx];
            return (
              <div key={dim.id} className="space-y-5">
                <div className="border-l-4 border-[#6BCB9A] pl-4">
                  <h3 className="font-bold text-gray-800">{dim.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{dim.subtitle}</p>
                </div>
                <div className="space-y-6">
                  {dim.questions.map((q, qi) => {
                    const idx = startIdx + qi;
                    return (
                      <div key={qi} className="space-y-2">
                        <span className="inline-block bg-[#CFF3E4] text-[#355F4B] text-xs font-bold px-2 py-0.5 rounded-full">
                          Q{idx + 1}
                        </span>
                        <SevenCircleScale
                          value={qValues[idx]}
                          onChange={(v) => handleQ(idx, v)}
                          leftLabel={q.left}
                          rightLabel={q.right}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* 점수 미리보기 */}
          <div className="bg-gradient-to-br from-[#CFF3E4]/60 to-white rounded-2xl p-6 space-y-4 border border-[#CFF3E4]">
            <h3 className="font-bold text-gray-800 text-center">나의 상담가 성향 미리보기</h3>
            <div className="grid grid-cols-2 gap-3">
              {traitRows.map((t) => (
                <div key={t.dimLabel} className="bg-white rounded-xl p-4 shadow-sm space-y-1">
                  <p className="text-xs text-gray-400 font-medium">{t.dimLabel}</p>
                  <p className={`font-bold text-sm ${t.color}`}>{t.label as string}</p>
                  <p className="text-xs text-gray-500 leading-tight">{t.desc as string}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 생성 버튼 */}
          <button
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            상담가 만들기
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
