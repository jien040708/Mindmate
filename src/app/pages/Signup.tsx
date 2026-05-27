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

export default function Signup() {
    const navigate = useNavigate();
    const { user, signup } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (password.length < 6) {
            setError("비밀번호는 최소 6자 이상이어야 합니다.");
            return;
        }

        setLoading(true);

        try {
            await signup(email, password, name);
            navigate("/");
        } catch (err) {
            setError("회원가입에 실패했습니다. 다시 시도해주세요.");
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
                        새 계정을 만들어 시작하세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="홍길동"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="border-[#CFF3E4] focus:border-[#6BCB9A]"
                            />
                        </div>
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
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">
                                비밀번호 확인
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
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
                            {loading ? "가입 중..." : "회원가입"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-600">
                            이미 계정이 있으신가요?{" "}
                        </span>
                        <Link
                            to="/login"
                            className="text-[#6BCB9A] hover:text-[#6BCB9A] hover:underline"
                        >
                            로그인
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
