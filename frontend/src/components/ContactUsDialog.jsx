import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export default function ContactUsDialog() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name:"", email:"", subject:"", message:"" });
  const [captcha, setCaptcha] = React.useState("");
  const [answer, setAnswer]   = React.useState(0);
  const [question, setQuestion] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const gen = () => {
    const a = Math.floor(Math.random()*15)+1, b = Math.floor(Math.random()*15)+1;
    const ops = ["+","-","×"]; const op = ops[Math.floor(Math.random()*ops.length)];
    let ans=a+b, q=`${a} + ${b}`;
    if(op==="-" ){ ans = Math.max(a,b)-Math.min(a,b); q = `${Math.max(a,b)} - ${Math.min(a,b)}`; }
    if(op==="×" ){ ans = a*b; q = `${a} × ${b}`; }
    setQuestion(q); setAnswer(ans);
  };
  React.useEffect(()=>{ if(open) gen(); },[open]);

  const submit = (e) => {
    e.preventDefault();
    if (parseInt(captcha) !== answer) { alert("Verificação incorreta"); gen(); setCaptcha(""); return; }
    setLoading(true);
    setTimeout(()=>{
      alert("Mensagem enviada!"); setForm({name:"",email:"",subject:"",message:""}); setCaptcha(""); setOpen(false); setLoading(false);
    }, 800);
  };

  return (
    <>
      <button onClick={()=>setOpen(true)} className="text-gray-600 hover:text-green-600 text-sm">Fale Conosco</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-green-800">Fale Conosco - Filmes.br</DialogTitle></DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Seu nome" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
            <Input type="email" placeholder="Seu email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
            <Input placeholder="Assunto" value={form.subject} onChange={(e)=>setForm({...form, subject:e.target.value})} required />
            <Textarea rows={4} placeholder="Sua mensagem..." value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} required />
            <div className="bg-gray-50 p-4 rounded-md flex items-center gap-3">
              <span className="text-lg font-mono bg-white px-3 py-2 border rounded">{question} = ?</span>
              <Input type="number" className="w-20" value={captcha} onChange={(e)=>setCaptcha(e.target.value)} required />
              <Button type="button" variant="outline" size="sm" onClick={gen}>🔄</Button>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={()=>setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
