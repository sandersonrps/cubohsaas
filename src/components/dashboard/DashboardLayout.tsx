import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import DashboardContent from "./DashboardContent";
import { useAuth } from "../../contexts/AuthContext";
import { Toaster } from "sonner";

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
    <div className="flex h-screen w-full bg-white dark:bg-gray-950">
      <Toaster richColors position="top-right" />
      {/* Sidebar */}
      <div className="h-full">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          onNavigate={handleNavigate}
          activePath={currentPath}
          items={[
            { label: "Início", path: "/dashboard", icon: "Home" },
            { label: "Clientes", path: "/customers", icon: "Users" },
            { label: "Vendas", path: "/sales", icon: "BarChart" },
            { label: "Imóveis", path: "/properties", icon: "Building2" },
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          userName={displayName}
          userAvatar={avatarUrl}
          onLogout={onLogout || handleLogout}
        />

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children ? children : <DashboardContent />}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
