import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthLayoutProps {
  error?: string;
  onLogin?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  onRegister?: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  isLoading?: boolean;
  defaultTab?: "login" | "register";
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  error,
  onLogin,
  onRegister,
  isLoading = false,
  defaultTab = "login",
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Lado Esquerdo - Logo e Título */}
      <div className="hidden lg:flex w-1/2 items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-primary">
        <div className="max-w-md text-center text-white">
          <img 
            src="./logo.png" 
            alt="Cuboh Logo" 
            className="w-48 h-48 mx-auto mb-8"
          />
          <h1 className="text-4xl font-bold mb-4">
            Cuboh SaaS
          </h1>
          <p className="text-xl">
            Sistema de Gestão em Módulos
          </p>
        </div>
      </div>

      {/* Lado Direito - Login/Registro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo para Mobile */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="./logo.png" 
              alt="Cuboh Logo" 
              className="w-24 h-24 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">Cuboh SaaS</h2>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <Tabs
              defaultValue={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "login" | "register")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login" className="mt-0">
                <LoginForm
                  onLogin={onLogin}
                  error={activeTab === "login" ? error : ""}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <RegisterForm
                  onSubmit={onRegister}
                  error={activeTab === "register" ? error : ""}
                  onLoginClick={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
