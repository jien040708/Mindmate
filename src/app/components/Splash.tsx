import { Heart, AlertTriangle } from "lucide-react";

export default function Splash() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] flex flex-col items-center justify-center gap-8">
      {/* 메인 로고 영역 */}
      <div className="text-center space-y-6 animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-[#6BCB9A] to-[#355F4B] p-8 rounded-full shadow-2xl">
            <Heart className="w-20 h-20 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent">
          MindMate
        </h1>
        <p className="text-xl text-gray-600">나만의 AI 심리 상담가를 준비하는 중...</p>
        <div className="flex justify-center pt-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-[#6BCB9A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-3 h-3 bg-[#6BCB9A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-3 h-3 bg-[#6BCB9A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>

      {/* 안전 경고 배너 */}
      <div className="max-w-md w-full mx-4 bg-yellow-50 border border-yellow-300 rounded-2xl p-4 flex gap-3 items-start shadow-sm">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800 leading-relaxed">
          <strong className="block mb-1">이용 전 안내</strong>
          MindMate는 AI 기반 서비스로, 전문 심리 치료나 의료 서비스를 대체하지 않습니다.
          위기 상황이거나 즉각적인 도움이 필요한 경우, 자살예방상담전화{" "}
          <strong>1393</strong> 또는 정신건강위기상담전화{" "}
          <strong>1577-0199</strong>에 연락해 주세요.
        </div>
      </div>
    </div>
  );
}
