import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Send, ArrowLeft, History, X, SlidersHorizontal } from "lucide-react";
import { Persona, CnipScores } from "../types/persona";
import { Thread, Message } from "../types/thread";
import { sendMessageToGemini, isGeminiInitialized } from "../services/gemini";
import { calcCnipScores, getCnipDescription } from "./PersonaSetting";
import { useLanguage } from "../contexts/LanguageContext";
import { T } from "../i18n/translations";
import { PersonaAvatar } from "../components/PersonaAvatar";

const SCALE_VALUES = [-3, -2, -1, 0, 1, 2, 3];

// 중앙(0)에서 멀어질수록 커지는 원 크기 (PersonaSetting과 동일)
const circleSize = (v: number): string => {
  switch (Math.abs(v)) {
    case 0: return "w-4 h-4";
    case 1: return "w-5 h-5";
    case 2: return "w-7 h-7";
    case 3: return "w-9 h-9";
    default: return "w-5 h-5";
  }
};

function SevenCircleScale({
  value, onChange, leftLabel, rightLabel,
}: {
  value: number; onChange: (v: number) => void; leftLabel: string; rightLabel: string;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-xs text-gray-500 flex-1 text-right leading-tight min-w-0 pr-1">{leftLabel}</span>
      <div className="flex items-center gap-1 flex-shrink-0">
        {SCALE_VALUES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            title={v > 0 ? `+${v}` : String(v)}
            className={`rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 ${circleSize(v)} ${
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
    <div className="h-screen bg-gradient-to-br from-[#F4FBF7] via-[#E8F8F1] to-[#D6F3E6] flex flex-col">
      {/* 헤더 — frosted glass */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-[#CFF3E4]/70 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100/80 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <PersonaAvatar
            persona={editedPersona ?? persona}
            size={44}
            ringClass="ring-2 ring-white shadow-md"
          />
          <div>
            <h2 className="font-bold text-gray-800 text-base leading-tight">
              {(editedPersona ?? persona).name}
            </h2>
            <p className="text-xs text-gray-400 leading-tight">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#355F4B] rounded-full border border-[#CFF3E4] text-sm font-medium hover:bg-[#CFF3E4]/30 transition-colors shadow-sm"
          >
            <History className="w-4 h-4" />
            {t.history}
          </button>
          <button
            onClick={() => setShowPersonaEdit(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#6BCB9A] to-[#4DB87A] text-white rounded-full text-sm font-medium hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
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

            {/* 설문 — Q1~Q18 평면 나열, 카테고리 구분 없음 */}
            <div className="space-y-5">
              {t.questions.map((q, i) => (
                <div key={i} className="space-y-1">
                  <span className="inline-block bg-[#CFF3E4] text-[#355F4B] text-xs font-bold px-2 py-0.5 rounded-full">
                    Q{i + 1}
                  </span>
                  <SevenCircleScale
                    value={cnipValues[i]}
                    onChange={(v) => handleCnipQ(i, v)}
                    leftLabel={q.left}
                    rightLabel={q.right}
                  />
                </div>
              ))}
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
                        <PersonaAvatar persona={thread.persona} size={32} className="flex-shrink-0" />
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
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {messages.map((message) => (
          message.sender === "ai" ? (
            /* AI 메시지 */
            <div key={message.id} className="flex items-end gap-2">
              <PersonaAvatar
                persona={editedPersona ?? persona}
                size={32}
                className="flex-shrink-0 mb-0.5 shadow-sm"
              />
              <div
                className="max-w-[72%] bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border-l-[3px]"
                style={{ borderLeftColor: (editedPersona ?? persona).color || "#6BCB9A" }}
              >
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ) : (
            /* 사용자 메시지 */
            <div key={message.id} className="flex justify-end">
              <div className="max-w-[72%] bg-gradient-to-br from-[#6BCB9A] to-[#355F4B] rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs text-[#CFF3E4]/80 mt-1.5">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        ))}

        {/* 타이핑 인디케이터 */}
        {isLoadingResponse && (
          <div className="flex items-end gap-2">
            <PersonaAvatar
              persona={editedPersona ?? persona}
              size={32}
              className="flex-shrink-0 mb-0.5 shadow-sm"
            />
            <div
              className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border-l-[3px]"
              style={{ borderLeftColor: (editedPersona ?? persona).color || "#6BCB9A" }}
            >
              <div className="flex items-center gap-1.5 py-0.5">
                <span
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms", animationDuration: "0.9s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "180ms", animationDuration: "0.9s" }}
                />
                <span
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "360ms", animationDuration: "0.9s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-t border-[#CFF3E4]/70 px-4 py-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl pl-4 pr-2 py-2 border border-gray-200 focus-within:border-[#6BCB9A] focus-within:ring-2 focus-within:ring-[#6BCB9A]/20 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.typePlaceholder}
            className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 py-1"
            disabled={isLoadingResponse}
          />
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white p-2.5 rounded-xl hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={!input.trim() || isLoadingResponse}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
