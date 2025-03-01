import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DashboardContent from "./DashboardContent";
import { useAuth } from "../../contexts/AuthContext";
import { Toaster } from "sonner";
import ErrorBoundary from "../ErrorBoundary";

interface DashboardLayoutProps {
  children?: React.ReactNode;
  userName?: string;
  userAvatar?: string;
  activePath?: string;
  onLogout?: () => void;
}

const DashboardLayout = ({
  children,
  userName,
  userAvatar,
  activePath = "/dashboard",
  onLogout,
}: DashboardLayoutProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState(activePath);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    navigate(path);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  // Use user data from auth context if not provided as props
  const displayName =
    userName || user?.user_name || user?.email?.split("@")[0] || "Usuário";
  const avatarUrl =
    userAvatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar
          userName={displayName}
          userAvatar={avatarUrl}
          onLogout={handleLogout}
        />
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;
