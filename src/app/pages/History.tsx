import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
    ArrowLeft,
    MessageCircle,
    Trash2,
    User,
    Ear,
    Users,
    Briefcase,
    Target,
    Heart,
} from "lucide-react";
import { Thread } from "../types/thread";

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

export default function History() {
    const navigate = useNavigate();
    const [threads, setThreads] = useState<Thread[]>([]);

    useEffect(() => {
        const savedThreads = localStorage.getItem("threads");
        if (savedThreads) {
            const parsedThreads = JSON.parse(savedThreads);
            // Convert date strings back to Date objects
            const threadsWithDates = parsedThreads.map((thread: Thread) => ({
                ...thread,
                createdAt: new Date(thread.createdAt),
                messages: thread.messages.map((msg) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                })),
            }));
            setThreads(threadsWithDates);
        }
    }, []);

    const handleDeleteThread = (threadId: string) => {
        const updatedThreads = threads.filter((t) => t.id !== threadId);
        setThreads(updatedThreads);
        localStorage.setItem("threads", JSON.stringify(updatedThreads));
    };

    const handleViewThread = (thread: Thread) => {
        navigate("/chat", { state: { thread } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6 py-12">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 mb-6"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#6BCB9A]" />
                        <span className="font-semibold text-[#6BCB9A]">
                            Back to Home
                        </span>
                    </button>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#6BCB9A] to-[#6BCB9A] bg-clip-text text-transparent">
                        Conversation History
                    </h1>
                </div>

                {threads.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 text-center border border-[#CFF3E4]">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No saved conversations yet
                        </h3>
                        <p className="text-gray-500">
                            Start a conversation and save it to see it here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {threads.map((thread) => {
                            const IconComponent = getIcon(thread.persona.icon);
                            return (
                                <div
                                    key={thread.id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer"
                                    onClick={() => handleViewThread(thread)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        thread.persona.color,
                                                }}
                                            >
                                                <IconComponent className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {thread.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    with {thread.persona.name}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteThread(thread.id);
                                            }}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5 text-red-500" />
                                        </button>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3">
                                        <p className="line-clamp-2">
                                            {thread.messages[
                                                thread.messages.length - 1
                                            ]?.text || "No messages"}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>
                                            {thread.messages.length} messages
                                        </span>
                                        <span>
                                            {thread.createdAt.toLocaleDateString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                }
                                            )}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
