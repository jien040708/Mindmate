import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Send, Heart, ArrowLeft, User, Ear, Users, Briefcase, Target, History, X, SlidersHorizontal } from "lucide-react";
import { Persona } from "../types/persona";
import { Thread, Message } from "../types/thread";
import { sendMessageToGemini, isGeminiInitialized } from "../services/gemini";
import { calcCnipScores, getTraitLabels, getCnipDescription } from "./PersonaSetting";

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

// C-NIP 차원 정의 (refine 다이얼로그용)
const cnipDimensions = [
  {
    id: "td" as const,
    title: "치료사 주도성 vs 내담자 주도성",
    questions: [
      { left: "뚜렷한 목표를 세우고 상담하기", right: "특별한 목표 없이 자유롭게" },
      { left: "체계적인 방식으로 대화 이끌기", right: "정해진 틀 없이 편안하게" },
      { left: "문제 해결 기술 알려주기", right: "구체적인 기술 가르치지 않기" },
      { left: "상담 후 과제(숙제) 내주기", right: "과제나 숙제 주지 않기" },
      { left: "AI가 대화를 주도하기", right: "내가 대화를 주도하기" },
    ],
  },
  {
    id: "ei" as const,
    title: "감정적 강렬함 vs 감정적 절제",
    questions: [
      { left: "불편한 감정도 깊이 다루기", right: "불편한 감정 들추지 않기" },
      { left: "상담 관계에 대해 이야기하기", right: "내 문제 자체에만 집중하기" },
      { left: "나와 AI 상호작용에 집중하기", right: "내 문제에만 집중하기" },
      { left: "강렬한 감정 표현 격려하기", right: "강렬한 감정 표출 유도 안 하기" },
      { left: "내 '감정' 중심으로 다루기", right: "내 '생각과 논리' 중심으로" },
    ],
  },
  {
    id: "pao" as const,
    title: "과거 지향 vs 현재 지향",
    questions: [
      { left: "과거의 삶과 경험에 집중하기", right: "현재의 삶과 상황에 집중하기" },
      { left: "어린 시절 기억 돌아보기", right: "성인이 된 이후 삶에 집중하기" },
      { left: "지나온 과거에 집중하기", right: "앞으로 다가올 미래에 집중하기" },
    ],
  },
  {
    id: "ws" as const,
    title: "따뜻한 지지 vs 초점화된 도전",
    questions: [
      { left: "부드럽고 온화하게 다가오기", right: "날카롭더라도 직면하게 자극하기" },
      { left: "내 입장 전적으로 지지하기", right: "내 생각의 모순을 지적하기" },
      { left: "내 말을 끊지 않고 끝까지 듣기", right: "주제 벗어나면 말 끊어 초점 잡기" },
      { left: "내 가치관에 의문 제기 안 하기", right: "가치관을 이성적으로 짚어보기" },
      { left: "내 행동 무조건 긍정하기", right: "잘못된 행동 명확히 지적하기" },
    ],
  },
];

const dimensionStartIdx = cnipDimensions.reduce<number[]>((acc, dim, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + cnipDimensions[i - 1].questions.length);
  return acc;
}, []);

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

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
      <span className="text-xs text-gray-500 flex-1 text-right leading-tight min-w-0 pr-1">{leftLabel}</span>
      <div className="flex gap-1.5 flex-shrink-0">
        {SCALE_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            title={v > 0 ? `+${v}` : String(v)}
            className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
              value === v
                ? "bg-[#6BCB9A] border-[#355F4B] scale-110 shadow"
                : "bg-white border-gray-300 hover:border-[#6BCB9A]"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 flex-1 leading-tight min-w-0 pl-1">{rightLabel}</span>
    </div>
  );
}

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const existingThread = location.state?.thread as Thread | undefined;
  const persona = existingThread?.persona || (location.state?.persona as Persona);
  const mood = existingThread?.mood || (location.state?.mood as number | undefined);
  const language =
    existingThread?.language ||
    (location.state?.language as string | undefined) ||
    localStorage.getItem("mindmate_language") ||
    "Korean";

  const getMoodContext = (moodValue?: number) => {
    if (moodValue === undefined) return "";
    if (moodValue < 20) return " 오늘 많이 힘드신 것 같아요. 위기 상황이라면 전문 상담사에게 연락하세요.";
    if (moodValue < 40) return " 오늘 좀 힘드셨군요. 편하게 이야기해 주세요.";
    if (moodValue < 60) return " 오늘 어떠세요? 무슨 이야기든 해 주세요.";
    if (moodValue < 80) return " 오늘 기분이 좋으시군요! 무슨 이야기가 있으신가요?";
    return " 오늘 정말 좋으신 것 같아요! 무엇을 도와드릴까요?";
  };

  const getInitialMessage = () => {
    if (!persona) return "MindMate에 오신 것을 환영합니다";
    return `안녕하세요! 저는 ${persona.name}이에요. ${persona.description}${getMoodContext(mood)} 편하게 이야기해 주세요.`;
  };

  const [messages, setMessages] = useState<Message[]>(
    existingThread?.messages ||
      (persona
        ? [{ id: 1, text: getInitialMessage(), sender: "ai", timestamp: new Date() }]
        : [])
  );
  const [input, setInput] = useState("");
  const [showPersonaEdit, setShowPersonaEdit] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [editedPersona, setEditedPersona] = useState<Persona | undefined>(persona);
  const [cnipValues, setCnipValues] = useState<number[]>(
    () => persona?.cnipValues ?? Array(18).fill(0)
  );
  const [savedThreads, setSavedThreads] = useState<Thread[]>([]);
  const [threadId] = useState(existingThread?.id || Date.now().toString());
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!persona) navigate("/");
  }, [persona, navigate]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // 자동 저장
  useEffect(() => {
    if (messages.length > 1 && editedPersona) {
      const thread: Thread = {
        id: threadId,
        persona: editedPersona,
        messages,
        mood,
        language,
        createdAt: existingThread?.createdAt || new Date(),
        title: `${new Date().toLocaleDateString()} 대화`,
        savedWithPersona: false,
      };
      const saved = localStorage.getItem("threads");
      const threads = saved ? JSON.parse(saved) : [];
      const idx = threads.findIndex((t: Thread) => t.id === threadId);
      if (idx >= 0) threads[idx] = thread;
      else threads.push(thread);
      localStorage.setItem("threads", JSON.stringify(threads));
    }
  }, [messages, editedPersona]);

  useEffect(() => {
    const saved = localStorage.getItem("threads");
    if (saved) {
      const threads = JSON.parse(saved).map((t: Thread) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        messages: t.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
      }));
      setSavedThreads(threads);
    }
  }, [persona]);

  const handleCnipQ = (index: number, value: number) => {
    const next = [...cnipValues];
    next[index] = value;
    setCnipValues(next);
  };

  const handleApplyPersonaChanges = () => {
    if (!editedPersona) return;
    const newScores = calcCnipScores(cnipValues);
    const updated: Persona = {
      ...editedPersona,
      cnipScores: newScores,
      cnipValues: [...cnipValues],
      description: getCnipDescription(newScores),
    };
    setEditedPersona(updated);

    // 커스텀 페르소나면 localStorage도 업데이트
    const saved = localStorage.getItem("personas");
    if (saved) {
      const personas: Persona[] = JSON.parse(saved);
      const i = personas.findIndex((p) => p.id === updated.id);
      if (i >= 0) {
        personas[i] = updated;
        localStorage.setItem("personas", JSON.stringify(personas));
      }
    }
    setShowPersonaEdit(false);
  };

  const handleThreadSelect = (thread: Thread) => {
    setMessages(thread.messages);
    setEditedPersona(thread.persona);
    setCnipValues(thread.persona.cnipValues ?? Array(18).fill(0));
    setShowHistorySidebar(false);
  };

  const handleBack = () => navigate("/");

  const handleSend = async () => {
    if (!input.trim() || !persona) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoadingResponse(true);

    try {
      if (!isGeminiInitialized()) throw new Error("AI 서비스에 연결할 수 없어요. 설정을 확인해 주세요.");

      const aiResponseText = await sendMessageToGemini(
        userMessage.text,
        editedPersona ?? persona,
        newMessages,
        mood,
        language
      );
      setMessages((prev) => [
        ...prev,
        { id: newMessages.length + 1, text: aiResponseText, sender: "ai", timestamp: new Date() },
      ]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: newMessages.length + 1,
          text: error instanceof Error ? error.message : "응답을 가져오지 못했어요. 다시 시도해 주세요.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!persona) return null;

  const scores = calcCnipScores(cnipValues);
  const traits = getTraitLabels(scores);

  return (
    <div className="h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: persona.color }}
          >
            {(() => { const I = getIcon(persona.icon); return <I className="w-6 h-6 text-white" />; })()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{persona.name}</h2>
            <p className="text-xs text-gray-400">{language} · {editedPersona?.description ?? "AI 상담가"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#355F4B] rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <History className="w-5 h-5" />
            기록
          </button>
          <button
            onClick={() => setShowPersonaEdit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6BCB9A] text-white rounded-full hover:bg-[#355F4B] transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            성향 조정
          </button>
        </div>
      </div>

      {/* C-NIP Refine 다이얼로그 */}
      {showPersonaEdit && editedPersona && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-800">상담가 성향 조정</h3>
              <button
                onClick={() => { setShowPersonaEdit(false); setCnipValues(persona.cnipValues ?? Array(18).fill(0)); }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              각 문항에서 동그라미를 선택해 상담 스타일을 다시 설정할 수 있어요
            </p>

            {/* 현재 성향 요약 */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { dimLabel: "주도성", trait: traits.td },
                { dimLabel: "감정 초점", trait: traits.ei },
                { dimLabel: "시간 지향", trait: traits.pao },
                { dimLabel: "피드백", trait: traits.ws },
              ].map((t) => (
                <div key={t.dimLabel} className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-400">{t.dimLabel}</p>
                  <p className={`text-sm font-bold ${t.trait.color}`}>{t.trait.label}</p>
                  <p className="text-xs text-gray-500 leading-tight">{t.trait.desc}</p>
                </div>
              ))}
            </div>

            {/* 눈금 설명 */}
            <div className="bg-[#CFF3E4]/40 rounded-xl p-3 text-xs text-gray-500 flex gap-4 flex-wrap justify-center mb-6">
              <span><strong className="text-[#355F4B]">-3</strong> 왼쪽 강하게 선호</span>
              <span><strong className="text-gray-400">0</strong> 중립</span>
              <span><strong className="text-[#355F4B]">+3</strong> 오른쪽 강하게 선호</span>
            </div>

            {/* 설문 */}
            <div className="space-y-8">
              {cnipDimensions.map((dim, dimIdx) => {
                const startIdx = dimensionStartIdx[dimIdx];
                return (
                  <div key={dim.id} className="space-y-4">
                    <div className="border-l-4 border-[#6BCB9A] pl-3">
                      <h4 className="font-bold text-sm text-gray-700">{dim.title}</h4>
                    </div>
                    <div className="space-y-4">
                      {dim.questions.map((q, qi) => {
                        const idx = startIdx + qi;
                        return (
                          <div key={qi} className="space-y-1">
                            <span className="inline-block bg-[#CFF3E4] text-[#355F4B] text-xs font-bold px-2 py-0.5 rounded-full">
                              Q{idx + 1}
                            </span>
                            <SevenCircleScale
                              value={cnipValues[idx]}
                              onChange={(v) => handleCnipQ(idx, v)}
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
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleApplyPersonaChanges}
                className="flex-1 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                적용하기
              </button>
              <button
                onClick={() => { setShowPersonaEdit(false); setCnipValues(persona.cnipValues ?? Array(18).fill(0)); }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 기록 사이드바 */}
      {showHistorySidebar && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">대화 기록</h2>
              <button onClick={() => setShowHistorySidebar(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              {savedThreads.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">저장된 대화가 없어요</p>
              ) : (
                savedThreads.map((thread) => {
                  const IconComponent = getIcon(thread.persona.icon);
                  return (
                    <button
                      key={thread.id}
                      onClick={() => handleThreadSelect(thread)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        thread.id === threadId
                          ? "border-[#6BCB9A] bg-[#CFF3E4]/30"
                          : "border-gray-200 hover:border-[#6BCB9A]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: thread.persona.color }}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm text-gray-800 truncate">{thread.persona.name}</div>
                          <div className="text-xs text-gray-500">{thread.messages.length}개 메시지</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {thread.messages[thread.messages.length - 1]?.text}
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        {thread.createdAt.toLocaleDateString("ko-KR")}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white"
                  : "bg-white shadow-md text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-2 ${message.sender === "user" ? "text-[#CFF3E4]" : "text-gray-400"}`}>
                {message.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-white border-t px-6 py-4">
        {isLoadingResponse && (
          <div className="text-sm text-gray-500 mb-2 px-5">{persona.name} 입력 중...</div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] focus:border-transparent"
            disabled={isLoadingResponse}
          />
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white p-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim() || isLoadingResponse}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
