import { useNavigate } from 'react-router';
import { ArrowLeft, Key, ExternalLink, CheckCircle, Server } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFFFC] via-[#CFF3E4] to-[#CFF3E4] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#355F4B] hover:text-[#6BCB9A] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#355F4B] to-[#6BCB9A] bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-gray-600">Configure your MindMate experience</p>
        </div>

        <Card className="border-[#CFF3E4] mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#CFF3E4] to-[#6BCB9A]/30 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-[#355F4B]" />
              </div>
              <div>
                <CardTitle>Backend Integration</CardTitle>
                <CardDescription>Secure server-side API configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  Supabase Backend Connected
                </p>
              </div>
              <p className="text-xs text-green-700">
                Your AI requests are now securely processed through the backend server.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-800">
                  Configure Gemini API Key
                </p>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                To enable AI chat, add your Gemini API key to the Supabase environment variables:
              </p>
              <ol className="text-xs text-blue-700 space-y-2 list-decimal list-inside mb-3">
                <li>Get your API key from <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900"
                >
                  Google AI Studio
                </a></li>
                <li>Open MindMate <strong>Settings</strong> in the Make app</li>
                <li>Navigate to <strong>Supabase</strong> section</li>
                <li>Click <strong>Environment Variables</strong></li>
                <li>Add variable: <code className="bg-blue-100 px-2 py-1 rounded">GEMINI_API_KEY</code></li>
                <li>Paste your API key as the value</li>
                <li>Click <strong>Deploy</strong> to apply changes</li>
              </ol>
              <div className="bg-blue-100 rounded p-2">
                <p className="text-xs text-blue-800 font-mono">
                  Variable name: <strong>GEMINI_API_KEY</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#CFF3E4]">
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
              <p className="text-sm text-green-800 leading-relaxed">
                <strong>✓ Secure:</strong> Your API key is stored as an environment variable on the Supabase server.
                It is never exposed to the browser or client-side code, providing better security than localStorage.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
