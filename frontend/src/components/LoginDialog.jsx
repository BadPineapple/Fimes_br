import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginDialog() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [captcha, setCaptcha] = React.useState("");
  const [answer, setAnswer] = React.useState(0);
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { login } = useAuth();

  const gen = React.useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ["+", "-", "×"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let ans = a + b, q = `${a} + ${b}`;
    if (op === "-") { ans = Math.max(a, b) - Math.min(a, b); q = `${Math.max(a,b)} - ${Math.min(a,b)}`; }
    if (op === "×") { ans = a * b; q = `${a} × ${b}`; }
    setQuestion(q); setAnswer(ans);
  }, []);

  React.useEffect(() => { if (open) gen(); }, [open, gen]);

  const submit = async (e) => {
    e.preventDefault();
    if (parseInt(captcha) !== answer) { alert("Verificação incorreta"); gen(); setCaptcha(""); return; }
    setLoading(true);
    try { await login(email); setOpen(false); setEmail(""); setCaptcha(""); }
    catch (err) { console.error(err); alert("Falha no login"); }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} data-testid="login-button">
        <User size={18} className="mr-2" /> Entrar
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Entrar no Filmes.br</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Input type="email" placeholder="Seu email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <div className="bg-gray-50 p-4 rounded-md flex items-center gap-3">
              <span className="text-lg font-mono bg-white px-3 py-2 border rounded">{question} = ?</span>
              <Input type="number" className="w-20" value={captcha} onChange={(e)=>setCaptcha(e.target.value)} required />
              <Button type="button" variant="outline" size="sm" onClick={gen}>🔄</Button>
            </div>
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Entrando..." : "Entrar"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
