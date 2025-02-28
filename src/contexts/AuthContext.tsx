import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthUser, getCurrentUser, signIn, signOut, signUp } from "../lib/auth";
import { SignInData, SignUpData } from "../lib/auth";

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err: any) {
        console.error("Error loading user:", err);
        // Handle refresh token errors by clearing the session
        if (err.message?.includes("Refresh Token")) {
          await handleSignOut();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await signIn(data);
      if (user) {
        setUser({
          id: user.id,
          email: user.email || "",
          user_name: user.user_metadata?.user_name,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await signUp(data);
      if (user) {
        setUser({
          id: user.id,
          email: user.email || "",
          user_name: data.name,
        });
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Erro ao sair");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
