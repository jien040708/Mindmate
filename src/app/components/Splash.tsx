import { Heart } from "lucide-react";

export default function Splash() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] flex items-center justify-center">
      <div className="text-center space-y-6 animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] p-8 rounded-full shadow-2xl">
            <Heart className="w-20 h-20 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
          MindMate
        </h1>
        <p className="text-xl text-gray-600">
          AI-powered psychological counseling service
        </p>
        <div className="flex justify-center pt-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-[#6BCB9A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-3 h-3 bg-[#6BCB9A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-3 h-3 bg-[#6BCB9A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
