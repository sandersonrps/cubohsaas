import React from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./auth/AuthLayout";
import { useAuth } from "../contexts/AuthContext";

interface HomeProps {
  initialAuthenticated?: boolean;
}

const Home = ({ initialAuthenticated = false }: HomeProps) => {
  const { user, isLoading, error, signIn, signUp, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (data: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    try {
      await signIn({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the AuthContext
      console.error("Login error:", err);
    }
  };

  const handleRegister = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      navigate("/dashboard");
    } catch (err) {
      // Error is handled by the AuthContext
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthLayout
        onLogin={handleLogin}
        onRegister={handleRegister}
        isLoading={isLoading}
        error={error || ""}
      />
    </div>
  );
};

export default Home;
