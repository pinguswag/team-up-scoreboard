import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Mail, ArrowRight } from 'lucide-react';

const Auth = () => {
  const { signInWithGoogle, signInWithKakao, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading('google');
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('Google 로그인 실패: ' + error.message);
    }
    setLoading(null);
  };

  const handleKakaoLogin = async () => {
    setLoading('kakao');
    const { error } = await signInWithKakao();
    if (error) {
      toast.error('카카오 로그인 실패: ' + error.message);
    }
    setLoading(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('이메일을 입력해주세요');
      return;
    }
    setLoading('email');
    const { error } = await signInWithEmail(email);
    if (error) {
      toast.error('이메일 로그인 실패: ' + error.message);
    } else {
      setEmailSent(true);
      toast.success('매직링크가 전송되었습니다! 이메일을 확인해주세요.');
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center glow">
            <span className="text-3xl font-display font-bold text-primary-foreground">SF</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground">
            Sports<span className="text-primary">Fan</span>
          </h1>
          <p className="text-muted-foreground">
            좋아하는 팀의 경기 일정과 중계 정보를 한눈에
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass border-border/50 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold">로그인</CardTitle>
            <CardDescription>
              간편하게 로그인하고 팀을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Kakao Login */}
            <Button
              onClick={handleKakaoLogin}
              disabled={!!loading}
              className="w-full h-12 text-base font-medium bg-[hsl(50,100%,50%)] hover:bg-[hsl(50,100%,45%)] text-[hsl(50,30%,15%)]"
            >
              {loading === 'kakao' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.8 5.16 4.5 6.54-.2.72-.72 2.64-.84 3.06-.12.54.2.54.42.4.18-.12 2.82-1.92 3.96-2.7.6.12 1.26.18 1.92.18 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
                </svg>
              )}
              카카오로 로그인
            </Button>

            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              disabled={!!loading}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-secondary"
            >
              {loading === 'google' ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Google로 로그인
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {/* Email Login */}
            {!emailSent ? (
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="이메일 주소 입력"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!!loading}
                  className="w-full h-12 text-base font-medium gradient-primary hover:opacity-90"
                >
                  {loading === 'email' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-5 w-5" />
                  )}
                  이메일로 로그인
                </Button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <div className="text-4xl">✉️</div>
                <p className="text-foreground font-medium">매직링크가 전송되었습니다!</p>
                <p className="text-sm text-muted-foreground">
                  {email}로 전송된 링크를 클릭하여 로그인하세요
                </p>
                <Button
                  variant="ghost"
                  onClick={() => setEmailSent(false)}
                  className="mt-4"
                >
                  다른 이메일로 시도
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          로그인 시 서비스 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
};

export default Auth;
