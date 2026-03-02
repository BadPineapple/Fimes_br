// src/components/LoginDialog.jsx
import React, { useState } from "react";
import { Mail, Lock, User, X, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginDialog() {
  const { signIn } = useAuth();
  
  // Controle do Modal
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Campos do Formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // 1. Verificação Simples de E-mail
  const emailValido = email.includes("@") && email.includes(".");

  // 2 & 3. Força de Senha e Confirmação
  const calcularForcaSenha = (s) => {
    let forca = 0;
    if (s.length >= 6) forca += 1; // Tamanho
    if (/[A-Z]/.test(s)) forca += 1; // Letra Maiúscula
    if (/[0-9]/.test(s)) forca += 1; // Número
    if (/[^A-Za-z0-9]/.test(s)) forca += 1; // Caractere Especial
    return forca;
  };

  const forca = calcularForcaSenha(senha);
  const senhasBatem = senha === confirmarSenha && senha.length > 0;

  // Lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isRegistering) {
      if (!emailValido) return alert("Por favor, insira um e-mail válido.");
      if (!senhasBatem) return alert("As senhas não coincidem!");
      if (forca < 2) return alert("Sua senha é muito fraca. Use letras e números.");
      
      // Aqui você chamaria a sua rota de /auth/registrar do backend
      alert("Integração de registro em andamento! (Aqui chamaremos o backend)");
    } else {
      // Chama a função signIn do AuthContext que liga com o seu MySQL
      await signIn({ email, senha });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botão que fica no Header */}
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-md font-bold transition flex items-center gap-2"
      >
        <User size={18} /> Entrar
      </button>

      {/* O Modal (Popup) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Fundo escuro desfocado */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Caixa do Formulário */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Cabeçalho do Modal */}
            <div className="bg-green-800 p-6 text-white flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {isRegistering ? "Criar Conta" : "Bem-vindo de volta"}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {isRegistering && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Nome</label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text" required
                        value={nome} onChange={(e) => setNome(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Como quer ser chamado?"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">E-mail</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${email.length > 0 && !emailValido ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Senha</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type={mostrarSenha ? "text" : "password"} required
                      value={senha} onChange={(e) => setSenha(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="••••••••"
                    />
                    <button 
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Indicador de Força de Senha */}
                  {isRegistering && senha.length > 0 && (
                    <div className="mt-2 flex gap-1 h-1.5">
                      <div className={`flex-1 rounded-full ${forca >= 1 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                      <div className={`flex-1 rounded-full ${forca >= 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                      <div className={`flex-1 rounded-full ${forca >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`flex-1 rounded-full ${forca >= 4 ? 'bg-green-700' : 'bg-gray-200'}`}></div>
                    </div>
                  )}
                </div>

                {isRegistering && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confirmar Senha</label>
                    <div className="relative mt-1">
                      <ShieldCheck className={`absolute left-3 top-1/2 -translate-y-1/2 ${confirmarSenha.length > 0 ? (senhasBatem ? 'text-green-500' : 'text-red-500') : 'text-gray-400'}`} size={18} />
                      <input 
                        type={mostrarSenha ? "text" : "password"} required
                        value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition ${confirmarSenha.length > 0 ? (senhasBatem ? 'border-green-500 focus:ring-2 focus:ring-green-500' : 'border-red-500 focus:ring-2 focus:ring-red-500') : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`}
                        placeholder="Repita sua senha"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-lg transition mt-4"
                >
                  {isRegistering ? "Criar Conta" : "Entrar"}
                </button>
              </form>

              {/* 4. Login pelo Google */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <button 
                  type="button"
                  className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-3"
                  onClick={() => alert("A integração com o Google requer configuração no Firebase/Google Cloud!")}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  Continuar com o Google
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                {isRegistering ? "Já tem uma conta?" : "Ainda não tem conta?"}
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-1 text-green-700 font-bold hover:underline"
                >
                  {isRegistering ? "Faça login" : "Cadastre-se"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}