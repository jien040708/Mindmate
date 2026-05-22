import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Send, Heart, ArrowLeft, User, Ear, Users, Briefcase, Target, History, X, SlidersHorizontal } from "lucide-react";
import { Persona, CnipScores } from "../types/persona";
import { Thread, Message } from "../types/thread";
import { sendMessageToGemini, isGeminiInitialized } from "../services/gemini";
import { calcCnipScores, getCnipDescription } from "./PersonaSetting";
import { useLanguage } from "../contexts/LanguageContext";
import { T } from "../i18n/translations";

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

// C-NIP 차원 정의 (refine 다이얼로그용) — 질문은 t.questions에서 가져옴
const cnipDimensionDef = [
  { id: "td"  as const, qRange: [0,  4] },
  { id: "ei"  as const, qRange: [5,  9] },
  { id: "pao" as const, qRange: [10, 12] },
  { id: "ws"  as const, qRange: [13, 17] },
];

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

function SevenCircleScale({
  value, onChange, leftLabel, rightLabel,
}: {
  value: number; onChange: (v: number) => void; leftLabel: string; rightLabel: string;
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

function getDimTitle(id: string, t: T): string {
  switch (id) {
    case "td":  return t.directiveness;
    case "ei":  return t.emotionFocus;
    case "pao": return t.timeOrientation;
    case "ws":  return t.feedbackStyle;
    default:    return id;
  }
}

function computeTraitSummary(scores: CnipScores, t: T) {
  return [
    {
      dimLabel: t.directiveness,
      label: scores.td  >= 8  ? t.traitTD_high  : scores.td  <= -3 ? t.traitTD_low  : t.traitTD_mid,
      desc:  scores.td  >= 8  ? t.descTD_high   : scores.td  <= -3 ? t.descTD_low   : t.descTD_mid,
      color: scores.td  >= 8  ? "text-blue-600" : scores.td  <= -3 ? "text-purple-600" : "text-green-600",
    },
    {
      dimLabel: t.emotionFocus,
      label: scores.ei  >= 7  ? t.traitEI_high  : scores.ei  <= -1 ? t.traitEI_low  : t.traitEI_mid,
      desc:  scores.ei  >= 7  ? t.descEI_high   : scores.ei  <= -1 ? t.descEI_low   : t.descEI_mid,
      color: scores.ei  >= 7  ? "text-rose-600" : scores.ei  <= -1 ? "text-sky-600"  : "text-green-600",
    },
    {
      dimLabel: t.timeOrientation,
      label: scores.pao >= 3  ? t.traitPaO_high : scores.pao <= -3 ? t.traitPaO_low : t.traitPaO_mid,
      desc:  scores.pao >= 3  ? t.descPaO_high  : scores.pao <= -3 ? t.descPaO_low  : t.descPaO_mid,
      color: scores.pao >= 3  ? "text-amber-600": scores.pao <= -3 ? "text-teal-600" : "text-green-600",
    },
    {
      dimLabel: t.feedbackStyle,
      label: scores.ws  >= 4  ? t.traitWS_high  : scores.ws  <= -4 ? t.traitWS_low  : t.traitWS_mid,
      desc:  scores.ws  >= 4  ? t.descWS_high   : scores.ws  <= -4 ? t.descWS_low   : t.descWS_mid,
      color: scores.ws  >= 4  ? "text-orange-500":scores.ws  <= -4 ? "text-red-600"  : "text-green-600",
    },
  ];
}

function computeSubtitle(scores: CnipScores, t: T): string {
  const td  = scores.td  >= 8  ? t.traitTD_high  : scores.td  <= -3 ? t.traitTD_low  : t.traitTD_mid;
  const ei  = scores.ei  >= 7  ? t.traitEI_high  : scores.ei  <= -1 ? t.traitEI_low  : t.traitEI_mid;
  const pao = scores.pao >= 3  ? t.traitPaO_high : scores.pao <= -3 ? t.traitPaO_low : t.traitPaO_mid;
  const ws  = scores.ws  >= 4  ? t.traitWS_high  : scores.ws  <= -4 ? t.traitWS_low  : t.traitWS_mid;
  return `${td} · ${ei} · ${pao} · ${ws}`;
}

export default function Chat() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { language, t } = useLanguage();

  const existingThread = location.state?.thread as Thread | undefined;
  const persona = existingThread?.persona || (location.state?.persona as Persona);
  const mood    = existingThread?.mood    || (location.state?.mood as number | undefined);

  const getMoodContext = (moodValue?: number) => {
    if (moodValue === undefined) return "";
    switch (language) {
      case "English":
        if (moodValue < 20) return " I can see you're having a tough day. Feel free to share.";
        if (moodValue < 40) return " Sounds like things are a bit rough. I'm here to listen.";
        if (moodValue < 60) return " How are you doing? Feel free to share anything.";
        if (moodValue < 80) return " Glad you're feeling good!";
        return " You seem to be in great spirits today!";
      case "Japanese":
        if (moodValue < 20) return " 今日はとても辛そうですね。気軽に話してください。";
        if (moodValue < 40) return " 少し辛そうですね。聞かせてください。";
        if (moodValue < 60) return " 今日はどうですか？何でも話してください。";
        if (moodValue < 80) return " 気分が良さそうですね！";
        return " 今日はとても元気そうですね！";
      case "Chinese":
        if (moodValue < 20) return " 今天看起来很难受。请随便说说吧。";
        if (moodValue < 40) return " 听起来有点辛苦。我在这里听你说。";
        if (moodValue < 60) return " 今天怎么样？什么都可以说。";
        if (moodValue < 80) return " 心情不错呢！";
        return " 今天精神很好呢！";
      default: // Korean
        if (moodValue < 20) return " 오늘 많이 힘드신 것 같아요. 편하게 이야기해 주세요.";
        if (moodValue < 40) return " 오늘 좀 힘드셨군요. 편하게 이야기해 주세요.";
        if (moodValue < 60) return " 오늘 어떠세요? 무슨 이야기든 해 주세요.";
        if (moodValue < 80) return " 오늘 기분이 좋으시군요!";
        return " 오늘 정말 좋으신 것 같아요!";
    }
  };

  const getInitialMessage = () => {
    if (!persona) return language === "Korean" ? "MindMate에 오신 것을 환영합니다" : "Welcome to MindMate";
    const moodCtx = getMoodContext(mood);
    switch (language) {
      case "English":
        return `Hello! I'm ${persona.name}.${moodCtx} Feel free to share what's on your mind.`;
      case "Japanese":
        return `こんにちは！私は${persona.name}です。${moodCtx} 何でも気軽に話しかけてください。`;
      case "Chinese":
        return `你好！我是${persona.name}。${moodCtx} 请随时告诉我您的想法。`;
      default:
        return `안녕하세요! 저는 ${persona.name}이에요.${moodCtx} 편하게 이야기해 주세요.`;
    }
  };

  const [messages, setMessages] = useState<Message[]>(
    existingThread?.messages ||
      (persona ? [{ id: 1, text: getInitialMessage(), sender: "ai", timestamp: new Date() }] : [])
  );
  const [input, setInput]                   = useState("");
  const [showPersonaEdit, setShowPersonaEdit] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [editedPersona, setEditedPersona]   = useState<Persona | undefined>(persona);
  const [cnipValues, setCnipValues]         = useState<number[]>(() => persona?.cnipValues ?? Array(18).fill(0));
  const [savedThreads, setSavedThreads]     = useState<Thread[]>([]);
  const [threadId]                          = useState(existingThread?.id || Date.now().toString());
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { if (!persona) navigate("/"); }, [persona, navigate]);
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
      const idx = threads.findIndex((th: Thread) => th.id === threadId);
      if (idx >= 0) threads[idx] = thread;
      else threads.push(thread);
      localStorage.setItem("threads", JSON.stringify(threads));
    }
  }, [messages, editedPersona]);

  useEffect(() => {
    const saved = localStorage.getItem("threads");
    if (saved) {
      const threads = JSON.parse(saved).map((th: Thread) => ({
        ...th,
        createdAt: new Date(th.createdAt),
        messages: th.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
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

  const handleSend = async () => {
    if (!input.trim() || !persona) return;
    const userMessage: Message = { id: messages.length + 1, text: input, sender: "user", timestamp: new Date() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoadingResponse(true);
    try {
      if (!isGeminiInitialized()) throw new Error(
        language === "Korean" ? "AI 서비스에 연결할 수 없어요. 설정을 확인해 주세요."
        : language === "Japanese" ? "AIサービスに接続できません。設定を確認してください。"
        : language === "Chinese" ? "无法连接AI服务。请检查设置。"
        : "Cannot connect to AI service. Please check settings."
      );
      const aiResponseText = await sendMessageToGemini(
        userMessage.text, editedPersona ?? persona, newMessages, mood, language
      );
      setMessages((prev) => [
        ...prev,
        { id: newMessages.length + 1, text: aiResponseText, sender: "ai", timestamp: new Date() },
      ]);
    } catch (error) {
      const fallback = language === "Korean" ? "응답을 가져오지 못했어요. 다시 시도해 주세요."
        : language === "Japanese" ? "応答を取得できませんでした。もう一度お試しください。"
        : language === "Chinese" ? "获取响应失败，请重试。"
        : "Failed to get a response. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: newMessages.length + 1,
          text: error instanceof Error ? error.message : fallback,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!persona) return null;

  const scores       = calcCnipScores(cnipValues);
  const traitSummary = computeTraitSummary(scores, t);
  const subtitle     = editedPersona?.cnipScores
    ? computeSubtitle(editedPersona.cnipScores, t)
    : t.aiCounselor;

  return (
    <div className="h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: persona.color }}>
            {(() => { const I = getIcon(persona.icon); return <I className="w-6 h-6 text-white" />; })()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{persona.name}</h2>
            <p className="text-xs text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#355F4B] rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <History className="w-5 h-5" />
            {t.history}
          </button>
          <button
            onClick={() => setShowPersonaEdit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6BCB9A] text-white rounded-full hover:bg-[#355F4B] transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {t.adjustStyle}
          </button>
        </div>
      </div>

      {/* C-NIP Refine 다이얼로그 */}
      {showPersonaEdit && editedPersona && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-800">{t.adjustStyle}</h3>
              <button
                onClick={() => { setShowPersonaEdit(false); setCnipValues(persona.cnipValues ?? Array(18).fill(0)); }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 현재 성향 요약 */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {traitSummary.map((tr) => (
                <div key={tr.dimLabel} className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-400">{tr.dimLabel}</p>
                  <p className={`text-sm font-bold ${tr.color}`}>{tr.label}</p>
                  <p className="text-xs text-gray-500 leading-tight">{tr.desc}</p>
                </div>
              ))}
            </div>

            {/* 눈금 설명 */}
            <div className="bg-[#CFF3E4]/40 rounded-xl p-3 text-xs text-gray-500 flex gap-4 flex-wrap justify-center mb-6">
              <span><strong className="text-[#355F4B]">-3</strong> {t.scaleLeft}</span>
              <span><strong className="text-gray-400">0</strong> {t.scaleNeutral}</span>
              <span><strong className="text-[#355F4B]">+3</strong> {t.scaleRight}</span>
            </div>

            {/* 설문 — t.questions로 번역된 질문 표시 */}
            <div className="space-y-8">
              {cnipDimensionDef.map((dim) => {
                const [start, end] = dim.qRange;
                return (
                  <div key={dim.id} className="space-y-4">
                    <div className="border-l-4 border-[#6BCB9A] pl-3">
                      <h4 className="font-bold text-sm text-gray-700">{getDimTitle(dim.id, t)}</h4>
                    </div>
                    <div className="space-y-4">
                      {Array.from({ length: end - start + 1 }, (_, qi) => {
                        const idx = start + qi;
                        const q   = t.questions[idx];
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
                {t.apply}
              </button>
              <button
                onClick={() => { setShowPersonaEdit(false); setCnipValues(persona.cnipValues ?? Array(18).fill(0)); }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                {t.cancel}
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
              <h2 className="text-xl font-bold text-gray-800">{t.chatHistory}</h2>
              <button onClick={() => setShowHistorySidebar(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              {savedThreads.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">{t.noHistory}</p>
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
                          <div className="text-xs text-gray-500">{t.messagesCount(thread.messages.length)}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {thread.messages[thread.messages.length - 1]?.text}
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        {thread.createdAt.toLocaleDateString()}
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
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white"
                  : "bg-white shadow-md text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p className={`text-xs mt-2 ${message.sender === "user" ? "text-[#CFF3E4]" : "text-gray-400"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-white border-t px-6 py-4">
        {isLoadingResponse && (
          <div className="text-sm text-gray-500 mb-2 px-5">{t.typing(persona.name)}</div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.typePlaceholder}
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
