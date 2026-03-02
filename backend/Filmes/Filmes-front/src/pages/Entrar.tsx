import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

type LoginMode = "credentials" | "email-code" | "forgot-password";

const Entrar = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState<LoginMode>("credentials");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  // Credentials
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // Email code
  const [code, setCode] = useState("");

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    try {
      await login(email, senha);
      toast.success("Login realizado com sucesso!");
      navigate("/");
    } catch {
      toast.error("E-mail ou senha incorretos");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    setLoading(true);
    // Mock: api.post('/auth/send-code', { email })
    setTimeout(() => {
      setCodeSent(true);
      setLoading(false);
      toast.success("Código enviado para seu e-mail!");
    }, 1000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error("Informe o código de 6 dígitos");
      return;
    }
    setLoading(true);
    // Mock: api.post('/auth/verify-code', { email, code })
    setTimeout(() => {
      login(email, "code-login");
      setLoading(false);
      toast.success("Login realizado com sucesso!");
      navigate("/");
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    setLoading(true);
    // Mock: api.post('/auth/forgot-password', { email })
    setTimeout(() => {
      setLoading(false);
      toast.success("Link de recuperação enviado para seu e-mail!");
      setMode("credentials");
    }, 1000);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 gradient-warm">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <Film className="w-8 h-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">
              Filmes<span className="text-secondary">.</span>br
            </span>
          </Link>
          <p className="text-muted-foreground text-sm">
            {mode === "credentials" && "Entre na sua conta"}
            {mode === "email-code" && "Entrar com código por e-mail"}
            {mode === "forgot-password" && "Recuperar sua senha"}
          </p>
        </div>

        <Card className="shadow-card border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">
              {mode === "credentials" && "Login"}
              {mode === "email-code" && "Código de Acesso"}
              {mode === "forgot-password" && "Esqueci a Senha"}
            </CardTitle>
            <CardDescription>
              {mode === "credentials" && "Use seu e-mail e senha para entrar"}
              {mode === "email-code" && "Receba um código no seu e-mail"}
              {mode === "forgot-password" && "Enviaremos um link de recuperação"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* ===== CREDENTIALS LOGIN ===== */}
            {mode === "credentials" && (
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            )}

            {/* ===== EMAIL CODE LOGIN ===== */}
            {mode === "email-code" && !codeSent && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-code">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email-code"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Código"}
                  {!loading && <Mail className="w-4 h-4" />}
                </Button>
              </form>
            )}

            {mode === "email-code" && codeSent && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enviamos um código de 6 dígitos para <strong className="text-foreground">{email}</strong>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className="pl-10 text-center tracking-[0.5em] font-mono text-lg"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verificando..." : "Verificar Código"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setCodeSent(false); setCode(""); }}
                  className="text-sm text-primary hover:underline w-full text-center"
                >
                  Reenviar código
                </button>
              </form>
            )}

            {/* ===== FORGOT PASSWORD ===== */}
            {mode === "forgot-password" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-forgot">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email-forgot"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                </Button>
              </form>
            )}

            {/* ===== MODE SWITCHERS ===== */}
            <div className="pt-2 border-t border-border space-y-2">
              {mode === "credentials" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("forgot-password")}
                    className="text-sm text-primary hover:underline w-full text-center"
                  >
                    Esqueci minha senha
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("email-code"); setCodeSent(false); setCode(""); }}
                    className="text-sm text-muted-foreground hover:text-foreground w-full text-center flex items-center justify-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Entrar com código por e-mail
                  </button>
                </>
              )}
              {mode !== "credentials" && (
                <button
                  type="button"
                  onClick={() => { setMode("credentials"); setCodeSent(false); setCode(""); }}
                  className="text-sm text-primary hover:underline w-full text-center"
                >
                  ← Voltar ao login com senha
                </button>
              )}
            </div>

            {/* REGISTER LINK */}
            <div className="pt-2 text-center">
              <span className="text-sm text-muted-foreground">Não tem conta? </span>
              <Link to="/registrar" className="text-sm font-semibold text-primary hover:underline">
                Criar conta
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Entrar;
