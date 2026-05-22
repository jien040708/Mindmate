import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowRight, ArrowLeft, Camera } from "lucide-react";
import { Persona, CnipScores } from "../types/persona";
import { useLanguage } from "../contexts/LanguageContext";
import { PersonaAvatar, CHARACTER_OPTIONS } from "../components/PersonaAvatar";

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
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useLanguage();

  const editPersona = location.state?.editPersona as Persona | undefined;
  const isEdit      = !!editPersona;

  const [qValues, setQValues]             = useState<number[]>(
    () => editPersona?.cnipValues ?? Array(18).fill(0)
  );
  const [name, setName]                   = useState(editPersona?.name ?? "");
  const [selectedColor, setSelectedColor] = useState(editPersona?.color ?? colorOptions[0]);
  const [selectedIcon, setSelectedIcon]   = useState(editPersona?.icon ?? "char1");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(editPersona?.avatarDataUrl);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarDataUrl(result);
      setSelectedIcon("photo");
    };
    reader.readAsDataURL(file);
  };

  const handleQ = (index: number, value: number) => {
    const next = [...qValues];
    next[index] = value;
    setQValues(next);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) { alert(t.nameRequired); return; }

    const saved: Persona[] = JSON.parse(localStorage.getItem("personas") || "[]");

    if (isEdit && editPersona) {
      if (saved.some((p) => p.id !== editPersona.id && p.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert(t.nameDuplicate(trimmedName)); return;
      }
      const scores = calcCnipScores(qValues);
      const updated: Persona = {
        ...editPersona,
        name: trimmedName,
        description: getCnipDescription(scores),
        color: selectedColor,
        icon: selectedIcon,
        avatarDataUrl,
        cnipScores: scores,
        cnipValues: [...qValues],
      };
      const idx = saved.findIndex((p) => p.id === editPersona.id);
      if (idx >= 0) saved[idx] = updated;
      localStorage.setItem("personas", JSON.stringify(saved));
    } else {
      if (saved.some((p) => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert(t.nameDuplicate(trimmedName)); return;
      }
      const scores = calcCnipScores(qValues);
      const newPersona: Persona = {
        id: Date.now().toString(),
        name: trimmedName,
        mbti: "",
        description: getCnipDescription(scores),
        color: selectedColor,
        icon: selectedIcon,
        avatarDataUrl,
        cnipScores: scores,
        cnipValues: [...qValues],
      };
      saved.push(newPersona);
      localStorage.setItem("personas", JSON.stringify(saved));
    }
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
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
          {isEdit ? t.editCounselor : t.createCounselor}
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
                {t.counselorName} <span className="text-red-400">{t.required}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] bg-white text-gray-800"
              />
            </div>

            {/* 색상 */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700">{t.color}</label>
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
              <label className="text-sm font-bold text-gray-700">{t.icon}</label>

              {/* 캐릭터 */}
              <div className="flex gap-3">
                {CHARACTER_OPTIONS.map(({ id, label, Component }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => { setSelectedIcon(id); setAvatarDataUrl(undefined); }}
                    className={`w-14 h-14 rounded-full overflow-hidden transition-all duration-200 ${
                      selectedIcon === id
                        ? "ring-4 ring-offset-2 ring-[#6BCB9A] scale-110 shadow-md"
                        : "hover:scale-105 ring-2 ring-gray-200"
                    }`}
                    title={label}
                  >
                    <Component />
                  </button>
                ))}
              </div>

              {/* 사진 업로드 */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                    selectedIcon === "photo"
                      ? "border-[#6BCB9A] bg-[#CFF3E4]/40 text-[#355F4B]"
                      : "border-gray-200 text-gray-500 hover:border-[#6BCB9A]/50 hover:text-[#355F4B]"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  {avatarDataUrl ? "사진 변경" : "사진 업로드"}
                </button>
              </div>
            </div>

            {/* 미리보기 아바타 */}
            <div className="flex flex-col items-center gap-2 py-2">
              <PersonaAvatar
                persona={{ id: "", name, mbti: "", description: "", color: selectedColor, icon: selectedIcon, avatarDataUrl }}
                size={80}
                ringClass="ring-4 ring-white shadow-xl"
              />
              <p className="text-sm font-semibold text-gray-600">{name || t.namePreview}</p>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex-shrink-0 px-10 py-5 border-t border-[#CFF3E4] bg-white/40">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white font-bold text-base hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              {isEdit ? t.saveChanges : t.createBtn} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 오른쪽 패널: C-NIP 설문 ── */}
        <div className="w-1/2 flex flex-col bg-white/30">

          {/* 헤더 (고정) */}
          <div className="flex-shrink-0 px-8 py-4 border-b border-[#CFF3E4] bg-white/60 backdrop-blur-sm">
            <h2 className="font-bold text-gray-800 text-sm">{t.cnipSurvey}</h2>
            <div className="flex gap-5 mt-1.5 text-xs text-gray-400">
              <span><span className="font-bold text-[#355F4B]">-3</span> {t.scaleLeft}</span>
              <span><span className="font-bold text-gray-400">0</span> {t.scaleNeutral}</span>
              <span><span className="font-bold text-[#355F4B]">+3</span> {t.scaleRight}</span>
            </div>
          </div>

          {/* 설문 (이 영역만 스크롤) */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {t.questions.map((q, i) => (
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
            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
