import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, User, Ear, Users, Briefcase, Target, Heart, ArrowLeft } from "lucide-react";
import { Persona, CnipScores } from "../types/persona";

// ─── C-NIP 18문항 (카테고리명 없이 평탄하게) ───────────────────────────────────
const cnipQuestions = [
  // TD (Q1-Q5)
  { left: "뚜렷한 목표를 세우고 상담하기",       right: "특별한 목표 없이 자유롭게 상담하기" },
  { left: "체계적인 방식으로 대화 이끌기",        right: "정해진 틀 없이 편안하게 대화하기" },
  { left: "문제 해결에 필요한 기술 알려주기",     right: "구체적인 기술 가르치지 않기" },
  { left: "상담 후 과제(숙제) 내주기",           right: "별도의 과제나 숙제 주지 않기" },
  { left: "AI 상담가가 대화를 주도하기",         right: "내가 원하는 방향으로 대화 주도하기" },
  // EI (Q6-Q10)
  { left: "불편한 감정도 깊이 다루도록 격려하기", right: "굳이 불편한 감정을 들추지 않기" },
  { left: "AI와 나의 상담 관계에 대해 이야기하기",right: "상담 관계보다 내 문제 자체에 집중하기" },
  { left: "나와 AI의 상호작용에 집중하기",       right: "상호작용보다 내 문제 자체에 집중하기" },
  { left: "강렬한 감정을 솔직하게 쏟아내도록 격려하기", right: "강렬한 감정 표출을 굳이 유도하지 않기" },
  { left: "내 '감정'을 중심으로 다루기",         right: "내 '생각과 논리'를 중심으로 다루기" },
  // PaO (Q11-Q13)
  { left: "과거의 내 삶과 경험에 집중하기",      right: "현재의 내 삶과 상황에 집중하기" },
  { left: "어린 시절의 기억과 경험 돌아보기",    right: "성인이 된 이후의 삶에 초점 맞추기" },
  { left: "지나온 나의 과거에 집중하기",         right: "앞으로 다가올 미래에 집중하기" },
  // WS (Q14-Q18)
  { left: "부드럽고 온화하게 다가오기",          right: "다소 날카롭더라도 직면할 수 있게 자극하기" },
  { left: "내 입장을 전적으로 지지하고 공감하기", right: "내 생각의 모순이나 문제점을 지적하기" },
  { left: "대화 중 내 말을 끊지 않고 끝까지 듣기",right: "주제 벗어나면 말을 끊어서라도 초점 잡아주기" },
  { left: "내 가치관이나 신념에 의문 제기하지 않기",right: "내 가치관이나 신념이 맞는지 이성적으로 짚어보기" },
  { left: "내 행동을 무조건적으로 긍정하고 지지하기",right: "내 행동에 잘못된 점이 있다면 명확히 지적하기" },
];

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

// 중앙(0)에서 멀어질수록 커지는 원 크기
const circleSize = (v: number): string => {
  const dist = Math.abs(v);
  switch (dist) {
    case 0: return "w-4 h-4";
    case 1: return "w-5 h-5";
    case 2: return "w-7 h-7";
    case 3: return "w-9 h-9";
    default: return "w-5 h-5";
  }
};

const colorOptions = ["#6BCB9A", "#355F4B", "#EEDC82", "#CFF3E4", "#6B9ACB", "#CB6B9A"];
const iconOptions = [
  { name: "user",      Icon: User },
  { name: "ear",       Icon: Ear },
  { name: "users",     Icon: Users },
  { name: "briefcase", Icon: Briefcase },
  { name: "target",    Icon: Target },
  { name: "heart",     Icon: Heart },
];

// ─── 점수 계산 (export — Chat.tsx에서도 사용) ──────────────────────────────────
export function calcCnipScores(values: number[]): CnipScores {
  const [q1,q2,q3,q4,q5,q6,q7,q8,q9,q10,q11,q12,q13,q14,q15,q16,q17,q18] = values;
  return {
    td:  -(q1+q2+q3+q4+q5),
    ei:  -(q6+q7+q8+q9+q10),
    pao: -(q11+q12+q13),
    ws:  -(q14+q15+q16+q17+q18),
  };
}

export function getTraitLabels(scores: CnipScores) {
  const td =
    scores.td >= 8    ? { label: "AI 주도",      color: "text-blue-600",   desc: "대화와 목표를 AI가 능동적으로 이끌어요" }
    : scores.td <= -3 ? { label: "내담자 주도",   color: "text-purple-600", desc: "내가 원하는 방향으로 자유롭게 대화해요" }
    :                   { label: "균형",           color: "text-green-600",  desc: "상황에 맞게 유연하게 조율해요" };

  const ei =
    scores.ei >= 7    ? { label: "감정 집중",     color: "text-rose-600",   desc: "깊은 감정을 충분히 탐색하고 표현해요" }
    : scores.ei <= -1 ? { label: "이성/논리",     color: "text-sky-600",    desc: "사실과 논리 중심으로 상황을 분석해요" }
    :                   { label: "균형",           color: "text-green-600",  desc: "감정과 논리를 균형 있게 다뤄요" };

  const pao =
    scores.pao >= 3   ? { label: "과거 지향",     color: "text-amber-600",  desc: "과거 경험과 어린 시절을 중심으로 탐색해요" }
    : scores.pao <= -3? { label: "현재/미래 지향", color: "text-teal-600",   desc: "지금 할 수 있는 것과 미래 목표에 집중해요" }
    :                   { label: "균형",           color: "text-green-600",  desc: "과거 맥락과 현재 상황을 함께 살펴요" };

  const ws =
    scores.ws >= 4    ? { label: "따뜻한 지지",   color: "text-orange-500", desc: "무조건적인 공감과 긍정적 존중을 제공해요" }
    : scores.ws <= -4 ? { label: "직면/도전",     color: "text-red-600",    desc: "논리적 오류나 모순을 직접적으로 짚어줘요" }
    :                   { label: "균형",           color: "text-green-600",  desc: "지지하면서도 필요할 때 솔직한 피드백을 줘요" };

  return { td, ei, pao, ws };
}

export function getCnipDescription(scores: CnipScores): string {
  const t = getTraitLabels(scores);
  return `${t.td.label} · ${t.ei.label} · ${t.pao.label} · ${t.ws.label} 상담가`;
}

// ─── 7-circle 선택기 ───────────────────────────────────────────────────────────
function SevenCircleScale({
  value, onChange, leftLabel, rightLabel,
}: {
  value: number; onChange: (v: number) => void; leftLabel: string; rightLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-gray-500 w-36 text-right leading-tight flex-shrink-0">{leftLabel}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {SCALE_VALUES.map((v) => {
          const sz = circleSize(v);
          const isSelected = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              title={v > 0 ? `+${v}` : String(v)}
              className={`rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 ${sz} ${
                isSelected
                  ? "bg-[#6BCB9A] border-[#355F4B] shadow-md"
                  : "bg-white border-gray-300 hover:border-[#6BCB9A]"
              }`}
            />
          );
        })}
      </div>
      <span className="text-xs text-gray-500 w-36 leading-tight flex-shrink-0">{rightLabel}</span>
    </div>
  );
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function PersonaSetting() {
  const navigate = useNavigate();
  const [qValues, setQValues]         = useState<number[]>(Array(18).fill(0));
  const [name, setName]               = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [selectedIcon, setSelectedIcon]   = useState(iconOptions[0].name);

  const handleQ = (index: number, value: number) => {
    const next = [...qValues];
    next[index] = value;
    setQValues(next);
  };

  const handleCreate = () => {
    if (!name.trim()) { alert("상담가 이름을 입력해 주세요."); return; }
    const trimmedName = name.trim();
    const saved: Persona[] = JSON.parse(localStorage.getItem("personas") || "[]");
    if (saved.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert(`"${trimmedName}" 이름이 이미 존재해요.`); return;
    }
    const scores = calcCnipScores(qValues);
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
    saved.push(newPersona);
    localStorage.setItem("personas", JSON.stringify(saved));
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] overflow-hidden">

      {/* ── 상단 바 ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-sm border-b border-[#CFF3E4]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow text-sm font-semibold text-[#355F4B] border border-[#CFF3E4] hover:shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> 돌아가기
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
          나만의 상담가 만들기
        </h1>
      </div>

      {/* ── 2분할 본문 ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── 왼쪽 패널: 이름 / 색상 / 아이콘 ── */}
        <div className="w-1/2 flex flex-col border-r border-[#CFF3E4] bg-white/50 backdrop-blur-sm overflow-hidden">
          <div className="flex-1 flex flex-col justify-center px-10 py-8 gap-8">

            {/* 이름 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                상담가 이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] bg-white text-gray-800"
              />
            </div>

            {/* 색상 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">색상</label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full transition-all duration-200 ${
                      selectedColor === color ? "ring-4 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* 아이콘 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">아이콘</label>
              <div className="flex gap-3 flex-wrap">
                {iconOptions.map(({ name: n, Icon }) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedIcon(n)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                      selectedIcon === n
                        ? "ring-4 ring-offset-2 ring-[#6BCB9A] scale-110"
                        : "hover:scale-105 ring-2 ring-gray-200"
                    }`}
                    style={{ backgroundColor: selectedColor }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </button>
                ))}
              </div>
            </div>

            {/* 미리보기 아바타 */}
            <div className="flex flex-col items-center gap-2 py-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl ring-4 ring-white"
                style={{ backgroundColor: selectedColor }}
              >
                {(() => {
                  const opt = iconOptions.find((o) => o.name === selectedIcon) ?? iconOptions[0];
                  return <opt.Icon className="w-10 h-10 text-white" />;
                })()}
              </div>
              <p className="text-sm font-semibold text-gray-600">{name || "이름 미입력"}</p>
            </div>
          </div>

          {/* 만들기 버튼 */}
          <div className="flex-shrink-0 px-10 py-5 border-t border-[#CFF3E4] bg-white/40">
            <button
              onClick={handleCreate}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white font-bold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              상담가 만들기 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 오른쪽 패널: C-NIP 설문 ── */}
        <div className="w-1/2 flex flex-col bg-white/30">

          {/* 헤더 (고정) */}
          <div className="flex-shrink-0 px-8 py-4 border-b border-[#CFF3E4] bg-white/60 backdrop-blur-sm">
            <h2 className="font-bold text-gray-800 text-sm">C-NIP 상담 스타일 설문</h2>
            <div className="flex gap-5 mt-1.5 text-xs text-gray-400">
              <span><span className="font-bold text-[#355F4B]">-3</span> 왼쪽 강하게 선호</span>
              <span><span className="font-bold text-gray-400">0</span> 중립</span>
              <span><span className="font-bold text-[#355F4B]">+3</span> 오른쪽 강하게 선호</span>
            </div>
          </div>

          {/* 설문 (이 영역만 스크롤) */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {cnipQuestions.map((q, i) => (
              <div key={i} className="space-y-2">
                <span className="inline-block bg-[#CFF3E4] text-[#355F4B] text-xs font-bold px-2 py-0.5 rounded-full">
                  Q{i + 1}
                </span>
                <SevenCircleScale
                  value={qValues[i]}
                  onChange={(v) => handleQ(i, v)}
                  leftLabel={q.left}
                  rightLabel={q.right}
                />
              </div>
            ))}
            {/* 여백 */}
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
