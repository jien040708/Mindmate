import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Send, Heart, ArrowLeft, User, Ear, Users, Briefcase, Target, History, X } from "lucide-react";
import { Persona } from "../types/persona";
import { Thread, Message } from "../types/thread";
import { sendMessageToGemini, isGeminiInitialized } from "../services/gemini";

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

export default function Chat() {
  const location = useLocation();
  const navigate = useNavigate();
  const existingThread = location.state?.thread as Thread | undefined;
  const persona = existingThread?.persona || (location.state?.persona as Persona);
  const mood = existingThread?.mood || (location.state?.mood as number | undefined);
  const language = existingThread?.language || (location.state?.language as string | undefined) || "Korean";

  const getMoodContext = (moodValue?: number) => {
    if (moodValue === undefined) return "";
    if (moodValue < 20) return " I notice you're feeling quite down today. I'm here to listen. Remember, if you're in crisis, please reach out to a professional counselor.";
    if (moodValue < 40) return " I see you're not feeling great. Let's talk about it.";
    if (moodValue < 60) return " You seem to be feeling okay. What's on your mind?";
    if (moodValue < 80) return " It's nice to see you're feeling good! What would you like to talk about?";
    return " I'm glad you're feeling great! How can I support you today?";
  };

  const getInitialMessage = () => {
    if (!persona) return "Welcome to MindMate";
    const mbtiText = persona.mbti ? ` My MBTI is ${persona.mbti}.` : "";
    return `Hello! I'm ${persona.name}. ${persona.description}${mbtiText}${getMoodContext(mood)} Feel free to share what's on your mind.`;
  };

  const [messages, setMessages] = useState<Message[]>(
    existingThread?.messages || (persona ? [
      {
        id: 1,
        text: getInitialMessage(),
        sender: "ai",
        timestamp: new Date(),
      },
    ] : [])
  );
  const [input, setInput] = useState("");
  const [showPersonaEdit, setShowPersonaEdit] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [editedPersona, setEditedPersona] = useState<Persona | undefined>(persona);
  const [mbtiValues, setMbtiValues] = useState<number[]>([50, 50, 50, 50]);
  const [savedThreads, setSavedThreads] = useState<Thread[]>([]);
  const [threadId, setThreadId] = useState(existingThread?.id || Date.now().toString());
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mbtiDimensions = [
    { left: "E", right: "I", leftLabel: "Extraverted", rightLabel: "Introverted" },
    { left: "S", right: "N", leftLabel: "Sensing", rightLabel: "Intuitive" },
    { left: "T", right: "F", leftLabel: "Thinking", rightLabel: "Feeling" },
    { left: "J", right: "P", leftLabel: "Judging", rightLabel: "Perceiving" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Redirect if no persona is provided
    if (!persona) {
      navigate("/");
    }
  }, [persona, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-save conversation whenever messages change
  useEffect(() => {
    if (messages.length > 1 && editedPersona) { // Only save if there are actual messages beyond the greeting and persona exists
      const thread: Thread = {
        id: threadId,
        persona: editedPersona,
        messages,
        mood,
        language,
        createdAt: existingThread?.createdAt || new Date(),
        title: `Conversation on ${new Date().toLocaleDateString()}`,
        savedWithPersona: false,
      };

      const savedThreads = localStorage.getItem("threads");
      const threads = savedThreads ? JSON.parse(savedThreads) : [];

      const existingIndex = threads.findIndex((t: Thread) => t.id === threadId);
      if (existingIndex >= 0) {
        threads[existingIndex] = thread;
      } else {
        threads.push(thread);
      }

      localStorage.setItem("threads", JSON.stringify(threads));
    }
  }, [messages, editedPersona]);

  const defaultPersonas = ["listener", "friend", "consultant", "coach", "default"];

  const handleSavePersonaChanges = () => {
    if (!editedPersona) return;

    // Prevent editing default personas
    if (defaultPersonas.includes(editedPersona.id)) {
      alert("Cannot edit default personas. Please create a custom persona instead.");
      setShowPersonaEdit(false);
      return;
    }

    // Save updated persona to personas list
    const savedPersonas = localStorage.getItem("personas");
    const personas = savedPersonas ? JSON.parse(savedPersonas) : [];

    const existingPersonaIndex = personas.findIndex((p: Persona) => p.id === editedPersona.id);
    if (existingPersonaIndex >= 0) {
      personas[existingPersonaIndex] = editedPersona;
    } else {
      personas.push(editedPersona);
    }

    localStorage.setItem("personas", JSON.stringify(personas));

    setShowPersonaEdit(false);
  };

  const handleBack = () => {
    // Auto-save is already handled, just navigate back
    navigate("/");
  };

  const handleSliderChange = (index: number, value: number) => {
    if (!editedPersona) return;

    const newValues = [...mbtiValues];
    newValues[index] = value;
    setMbtiValues(newValues);

    // Update MBTI based on slider values with more granular selection
    const newMbti = mbtiDimensions
      .map((dim, i) => {
        if (newValues[i] < 45) return dim.left;
        if (newValues[i] > 55) return dim.right;
        return newValues[i] < 50 ? dim.left : dim.right;
      })
      .join("");

    setEditedPersona({
      ...editedPersona,
      mbti: newMbti,
    });
  };

  useEffect(() => {
    // Initialize slider values from persona MBTI
    if (persona && persona.mbti && persona.mbti.length === 4) {
      const initialValues = mbtiDimensions.map((dim, index) => {
        const letter = persona.mbti[index];
        return letter === dim.left ? 25 : 75;
      });
      setMbtiValues(initialValues);
    }

    // Load saved threads for history sidebar
    const loadThreads = () => {
      const saved = localStorage.getItem("threads");
      if (saved) {
        const threads = JSON.parse(saved);
        const threadsWithDates = threads.map((thread: Thread) => ({
          ...thread,
          createdAt: new Date(thread.createdAt),
          messages: thread.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setSavedThreads(threadsWithDates);
      }
    };
    loadThreads();
  }, [persona]);

  const handleThreadSelect = (thread: Thread) => {
    // Update state to load the selected thread
    setMessages(thread.messages);
    setEditedPersona(thread.persona);
    setThreadId(thread.id);

    // Update MBTI slider values from the thread's persona
    if (thread.persona.mbti && thread.persona.mbti.length === 4) {
      const newValues = mbtiDimensions.map((dim, index) => {
        const letter = thread.persona.mbti[index];
        return letter === dim.left ? 25 : 75;
      });
      setMbtiValues(newValues);
    }

    setShowHistorySidebar(false);
  };

  const handleExitWithoutSaving = () => {
    navigate("/");
  };

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
      if (!isGeminiInitialized()) {
        throw new Error('Gemini API is not configured. Please set your API key in settings.');
      }

      const aiResponseText = await sendMessageToGemini(
        userMessage.text,
        persona,
        newMessages,
        mood,
        language
      );

      const aiMessage: Message = {
        id: newMessages.length + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      const errorMessage: Message = {
        id: newMessages.length + 1,
        text: error instanceof Error
          ? error.message
          : "Sorry, I couldn't process your message. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
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

  // Don't render if no persona (redirect will happen in useEffect)
  if (!persona) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: persona.color }}
          >
            {(() => {
              const IconComponent = getIcon(persona.icon);
              return <IconComponent className="w-6 h-6 text-white" />;
            })()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{persona.name}</h2>
            <p className="text-sm text-gray-500">
              {persona.mbti ? `${persona.mbti} Counselor` : "AI Counselor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistorySidebar(!showHistorySidebar)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#355F4B] rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <History className="w-5 h-5" />
            History
          </button>
          <button
            onClick={() => setShowPersonaEdit(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6BCB9A] text-white rounded-full hover:bg-[#355F4B] transition-colors"
          >
            <User className="w-5 h-5" />
            Edit Persona
          </button>
        </div>
      </div>

      {/* Persona Edit Dialog */}
      {showPersonaEdit && editedPersona && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Edit Persona
            </h3>
            <p className="text-gray-600 mb-6">
              Adjust your counselor's MBTI personality
            </p>

            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Counselor: {editedPersona.name}
                </h4>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Updated MBTI</p>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
                    {editedPersona.mbti || "----"}
                  </div>
                </div>
                <div className="space-y-4">
                  {mbtiDimensions.map((dimension, index) => (
                    <div key={index} className="flex gap-2">
                      <button
                        onClick={() => handleSliderChange(index, 25)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          mbtiValues[index] < 50
                            ? "border-[#6BCB9A] bg-[#CFF3E4]/30"
                            : "border-gray-200 hover:border-[#6BCB9A]/50"
                        }`}
                      >
                        <div className="font-semibold text-[#6BCB9A] text-xs">
                          {dimension.leftLabel}
                        </div>
                        <div className="text-xl font-bold text-[#355F4B]">
                          {dimension.left}
                        </div>
                      </button>
                      <button
                        onClick={() => handleSliderChange(index, 75)}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                          mbtiValues[index] >= 50
                            ? "border-[#355F4B] bg-[#CFF3E4]/30"
                            : "border-gray-200 hover:border-[#355F4B]/50"
                        }`}
                      >
                        <div className="font-semibold text-[#355F4B] text-xs">
                          {dimension.rightLabel}
                        </div>
                        <div className="text-xl font-bold text-[#6BCB9A]">
                          {dimension.right}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            <div className="flex gap-3">
              <button
                onClick={handleSavePersonaChanges}
                className="flex-1 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Apply Changes
              </button>
              <button
                onClick={() => {
                  setShowPersonaEdit(false);
                  if (persona) setEditedPersona(persona);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistorySidebar && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Conversation History</h2>
              <button
                onClick={() => setShowHistorySidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              {savedThreads.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">
                  No saved conversations yet
                </p>
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
                          <div className="font-semibold text-sm text-gray-800 truncate">
                            {thread.persona.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {thread.messages.length} messages
                          </div>
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white"
                  : "bg-white shadow-md text-gray-800"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.text}</p>
              <p
                className={`text-xs mt-2 ${
                  message.sender === "user"
                    ? "text-[#CFF3E4]"
                    : "text-gray-400"
                }`}
              >
                {message.timestamp.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        {isLoadingResponse && (
          <div className="text-sm text-gray-500 mb-2 px-5">
            {persona.name} is typing...
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
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
