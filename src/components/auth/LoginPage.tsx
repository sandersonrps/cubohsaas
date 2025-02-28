import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn({
        email,
        password
      });

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Erro ao fazer login', {
        description: error.message || 'Não foi possível realizar o login'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado Esquerdo - Logo e Título */}
      <div className="hidden lg:flex w-1/2 bg-white items-center justify-center p-8">
        <div className="max-w-md text-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="mx-auto mb-8 w-48"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bem-vindo ao Cuboh</h1>
          <p className="text-gray-600">Gerencie seu negócio de forma simples e eficiente</p>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Entrar</h2>
            <p className="mt-2 text-gray-600">Faça login para acessar sua conta</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
