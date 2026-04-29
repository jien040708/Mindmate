import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Send, Heart, ArrowLeft, User, Ear, Users, Briefcase, Target, Save } from "lucide-react";
import { Persona } from "../types/persona";
import { Thread, Message } from "../types/thread";

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

  if (!persona) {
    navigate("/");
    return null;
  }

  const getMoodContext = (moodValue?: number) => {
    if (moodValue === undefined) return "";
    if (moodValue < 20) return " I notice you're feeling quite down today. I'm here to listen.";
    if (moodValue < 40) return " I see you're not feeling great. Let's talk about it.";
    if (moodValue < 60) return " You seem to be feeling okay. What's on your mind?";
    if (moodValue < 80) return " It's nice to see you're feeling good! What would you like to talk about?";
    return " I'm glad you're feeling great! How can I support you today?";
  };

  const getInitialMessage = () => {
    const mbtiText = persona.mbti ? ` My MBTI is ${persona.mbti}.` : "";
    return `Hello! I'm ${persona.name}. ${persona.description}${mbtiText}${getMoodContext(mood)} Feel free to share what's on your mind.`;
  };

  const [messages, setMessages] = useState<Message[]>(
    existingThread?.messages || [
      {
        id: 1,
        text: getInitialMessage(),
        sender: "ai",
        timestamp: new Date(),
      },
    ]
  );
  const [input, setInput] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveWithPersona, setSaveWithPersona] = useState(false);
  const [editedPersona, setEditedPersona] = useState<Persona>(persona);
  const [mbtiValues, setMbtiValues] = useState<number[]>([50, 50, 50, 50]);
  const [threadId] = useState(existingThread?.id || Date.now().toString());
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
    scrollToBottom();
  }, [messages]);

  const handleSaveClick = () => {
    setShowSaveOptions(true);
  };

  const saveThread = (withPersona: boolean, personaToSave: Persona = persona) => {
    const thread: Thread = {
      id: threadId,
      persona: personaToSave,
      messages,
      mood,
      createdAt: existingThread?.createdAt || new Date(),
      title: `Conversation on ${new Date().toLocaleDateString()}`,
      savedWithPersona: withPersona,
    };

    const savedThreads = localStorage.getItem("threads");
    const threads = savedThreads ? JSON.parse(savedThreads) : [];

    // Update existing thread or add new one
    const existingIndex = threads.findIndex((t: Thread) => t.id === threadId);
    if (existingIndex >= 0) {
      threads[existingIndex] = thread;
    } else {
      threads.push(thread);
    }

    localStorage.setItem("threads", JSON.stringify(threads));

    // If saving with persona, also save to personas list
    if (withPersona && !defaultPersonas.some(p => p.id === personaToSave.id)) {
      const savedPersonas = localStorage.getItem("personas");
      const personas = savedPersonas ? JSON.parse(savedPersonas) : [];

      // Check if persona already exists
      const existingPersonaIndex = personas.findIndex((p: Persona) => p.id === personaToSave.id);
      if (existingPersonaIndex >= 0) {
        personas[existingPersonaIndex] = personaToSave;
      } else {
        personas.push(personaToSave);
      }

      localStorage.setItem("personas", JSON.stringify(personas));
    }

    // Show success message
    setShowSaveSuccess(true);
    setShowSaveOptions(false);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  const defaultPersonas = ["listener", "friend", "consultant", "coach", "default"];

  const handleBack = () => {
    if (messages.length > 1) {
      setShowSaveDialog(true);
    } else {
      navigate("/");
    }
  };

  const handleSaveAndExit = () => {
    saveThread(false);
    navigate("/");
  };

  const handleSliderChange = (index: number, value: number) => {
    const newValues = [...mbtiValues];
    newValues[index] = value;
    setMbtiValues(newValues);

    // Update MBTI based on slider values
    const newMbti = mbtiDimensions
      .map((dim, i) => (newValues[i] < 50 ? dim.left : dim.right))
      .join("");

    setEditedPersona({
      ...editedPersona,
      mbti: newMbti,
    });
  };

  useEffect(() => {
    // Initialize slider values from persona MBTI
    if (persona.mbti && persona.mbti.length === 4) {
      const initialValues = mbtiDimensions.map((dim, index) => {
        const letter = persona.mbti[index];
        return letter === dim.left ? 25 : 75;
      });
      setMbtiValues(initialValues);
    }
  }, []);

  const handleExitWithoutSaving = () => {
    navigate("/");
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput("");

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponses = [
        "I see. It's completely understandable to feel that way. Would you like to tell me more about it?",
        "It sounds like you've been thinking about this a lot. What part is the most challenging for you?",
        "Your feelings in that situation are a natural response. Shall we start by acknowledging your emotions?",
        "I can sense how thoughtfully you're approaching this. What do you feel you need most right now?",
      ];

      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        <button
          onClick={handleSaveClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#6BCB9A] text-white rounded-full hover:bg-[#355F4B] transition-colors"
        >
          <Save className="w-5 h-5" />
          Save
        </button>
      </div>

      {/* Save Options Dialog */}
      {showSaveOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Save Conversation
            </h3>
            <p className="text-gray-600 mb-6">
              Choose how you want to save this conversation
            </p>

            <div className="space-y-4 mb-6">
              <button
                onClick={() => setSaveWithPersona(false)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  !saveWithPersona
                    ? "border-[#6BCB9A] bg-[#CFF3E4]/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  Save Conversation Only
                </div>
                <p className="text-sm text-gray-600">
                  Save just the messages from this conversation
                </p>
              </button>

              <button
                onClick={() => setSaveWithPersona(true)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                  saveWithPersona
                    ? "border-[#6BCB9A] bg-[#CFF3E4]/30"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">
                  Save with Persona
                </div>
                <p className="text-sm text-gray-600">
                  Save the conversation and the counselor's personality
                </p>
              </button>
            </div>

            {saveWithPersona && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">
                  Edit Persona MBTI
                </h4>
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">Updated MBTI</p>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
                    {editedPersona.mbti || "----"}
                  </div>
                </div>
                <div className="space-y-6">
                  {mbtiDimensions.map((dimension, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#6BCB9A]">
                          {dimension.leftLabel} ({dimension.left})
                        </span>
                        <span className="font-semibold text-[#355F4B]">
                          {dimension.rightLabel} ({dimension.right})
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={mbtiValues[index]}
                        onChange={(e) =>
                          handleSliderChange(index, parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-gradient-to-r from-[#CFF3E4] to-[#6BCB9A]/40 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-[#6BCB9A] [&::-webkit-slider-thumb]:to-[#355F4B] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => saveThread(saveWithPersona, editedPersona)}
                className="flex-1 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowSaveOptions(false);
                  setSaveWithPersona(false);
                  setEditedPersona(persona);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Save Conversation?
            </h3>
            <p className="text-gray-600 mb-6">
              Would you like to save this conversation before leaving?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAndExit}
                className="flex-1 bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Save & Exit
              </button>
              <button
                onClick={handleExitWithoutSaving}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
              >
                Exit Without Saving
              </button>
            </div>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      <div
        className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
          showSaveSuccess ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3">
          <Save className="w-5 h-5" />
          <span className="font-semibold">Conversation saved successfully!</span>
        </div>
      </div>

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
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6BCB9A] focus:border-transparent"
          />
          <button
            onClick={handleSend}
            className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] text-white p-3 rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim()}
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
