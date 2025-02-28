import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  defaultTab?: "login" | "register";
  onLogin?: (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => void;
  onRegister?: (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  isLoading?: boolean;
  error?: string;
}

const AuthLayout = ({
  defaultTab = "login",
  onLogin = () => {},
  onRegister = () => {},
  isLoading = false,
  error = "",
}: AuthLayoutProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);

  const handleLoginSubmit = (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    onLogin(data);
  };

  const handleRegisterSubmit = (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    onRegister(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full bg-white dark:bg-gray-950 shadow-xl border-0">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl font-bold text-center">
              CRM System
            </CardTitle>
            <CardDescription className="text-center">
              Gerencie seus clientes, vendas e equipe em um só lugar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "login" | "register")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrar</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-0">
                <LoginForm
                  onSubmit={handleLoginSubmit}
                  onRegister={() => setActiveTab("register")}
                  isLoading={isLoading}
                  error={activeTab === "login" ? error : ""}
                />
              </TabsContent>
              <TabsContent value="register" className="mt-0">
                <RegisterForm
                  onSubmit={handleRegisterSubmit}
                  onLoginClick={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2023 CRM System. Todos os direitos reservados.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
