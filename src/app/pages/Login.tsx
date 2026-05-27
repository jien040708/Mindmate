import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError("로그인에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FAFFFC] p-4">
            <Card className="w-full max-w-md border-[#CFF3E4]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center text-[#6BCB9A]">
                        MindMate
                    </CardTitle>
                    <CardDescription className="text-center">
                        계정에 로그인하여 상담을 시작하세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-[#CFF3E4] focus:border-[#6BCB9A]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-[#CFF3E4] focus:border-[#6BCB9A]"
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full bg-[#6BCB9A] hover:bg-[#6BCB9A] text-white"
                            disabled={loading}
                        >
                            {loading ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-600">
                            계정이 없으신가요?{" "}
                        </span>
                        <Link
                            to="/signup"
                            className="text-[#6BCB9A] hover:text-[#6BCB9A] hover:underline"
                        >
                            회원가입
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
