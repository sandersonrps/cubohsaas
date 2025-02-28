import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { Separator } from "../ui/separator";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: (path: string) => void;
  activePath?: string;
}

const Sidebar = ({
  collapsed = false,
  onToggle = () => {},
  onNavigate = () => {},
  activePath = "/dashboard",
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const navigationItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <Users size={20} />,
      label: "Clientes",
      path: "/customers",
    },
    {
      icon: <ShoppingCart size={20} />,
      label: "Vendas",
      path: "/sales",
    },
    {
      icon: <UserCog size={20} />,
      label: "Equipe",
      path: "/team",
    },
    {
      icon: <Settings size={20} />,
      label: "Configurações",
      path: "/settings",
    },
  ];

  return (
    <div
      className={cn(
        "h-full bg-white dark:bg-gray-950 border-r flex flex-col transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]",
      )}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b">
        {!isCollapsed && (
          <div className="font-bold text-xl text-primary">CRM System</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={cn("ml-auto", isCollapsed ? "mx-auto" : "")}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = activePath === item.path;
            return (
              <TooltipProvider key={item.path} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        isCollapsed ? "px-2" : "px-3",
                      )}
                      onClick={() => onNavigate(item.path)}
                    >
                      <span
                        className={cn(
                          "flex items-center",
                          isCollapsed ? "justify-center" : "",
                        )}
                      >
                        {item.icon}
                        {!isCollapsed && (
                          <span className="ml-3">{item.label}</span>
                        )}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start mb-2",
                  isCollapsed ? "px-2" : "px-3",
                )}
              >
                <span
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "",
                  )}
                >
                  <HelpCircle size={20} />
                  {!isCollapsed && <span className="ml-3">Ajuda</span>}
                </span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Ajuda</TooltipContent>}
          </Tooltip>
        </TooltipProvider>

        <Separator className="my-2" />

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
                  isCollapsed ? "px-2" : "px-3",
                )}
                onClick={() => onNavigate("/")}
              >
                <span
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "",
                  )}
                >
                  <LogOut size={20} />
                  {!isCollapsed && <span className="ml-3">Sair</span>}
                </span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Sair</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Sidebar;
