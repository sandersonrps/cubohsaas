import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSuccess?: () => void;
  error?: string;
  onLogin?: (data: LoginFormValues) => Promise<void>;
}

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, error, onLogin }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Se onLogin foi fornecido, use-o para autenticar
      if (onLogin) {
        await onLogin(data);
      } else {
        // Fallback para o comportamento anterior
        onSuccess?.();
      }
      
      // Mostrar mensagem de sucesso após o login bem-sucedido
      toast.success("Login realizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao fazer login", {
        description: error?.message || "Não foi possível realizar o login",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Acesse sua conta
        </h2>
        <p className="text-gray-600 mt-2">
          Insira suas credenciais para continuar
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            E-mail
          </Label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            Senha
          </Label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary rounded border-gray-300"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Lembrar de mim
            </label>
          </div>

          <div className="text-sm">
            <a
              href="/recuperar-senha"
              className="font-medium text-primary hover:text-primary/80"
            >
              Esqueceu a senha?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
