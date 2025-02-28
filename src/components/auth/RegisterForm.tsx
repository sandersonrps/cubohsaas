import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const formSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z
      .string()
      .min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
      .regex(/[A-Z]/, {
        message: "Senha deve conter pelo menos uma letra maiúscula",
      })
      .regex(/[0-9]/, { message: "Senha deve conter pelo menos um número" }),
    confirmPassword: z.string().min(6, { message: "Confirme sua senha" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

interface RegisterFormProps {
  onSubmit?: (values: z.infer<typeof formSchema>) => void;
  onLoginClick?: () => void;
}

const RegisterForm = ({
  onSubmit = () => {},
  onLoginClick = () => {},
}: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white dark:bg-gray-950 shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Criar Conta
        </CardTitle>
        <CardDescription className="text-center">
          Preencha os dados abaixo para se registrar no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite seu nome completo"
                        {...field}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite seu email"
                        type="email"
                        {...field}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite sua senha"
                        type={showPassword ? "text" : "password"}
                        {...field}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1.5 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Confirme sua senha"
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-2.5 text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1.5 h-7 w-7"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Já possui uma conta?{" "}
          <Button variant="link" className="p-0" onClick={onLoginClick}>
            Faça login
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
