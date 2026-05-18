import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function Disclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 max-w-md bg-white rounded-2xl shadow-2xl p-6 border-2 border-yellow-400 z-50">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">Important Notice</h3>
          <p className="text-sm text-gray-600 mb-3">
            This is an AI-powered service for general emotional support and conversation.
            It is <strong>not a substitute for professional mental health care</strong>.
            If you are experiencing a mental health crisis, please contact a licensed
            professional or emergency services immediately.
          </p>
          <button
            onClick={() => setIsVisible(false)}
            className="text-sm text-[#355F4B] font-semibold hover:underline"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
