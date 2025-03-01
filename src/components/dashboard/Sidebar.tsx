import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
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
  Package,
  Building2,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { Separator } from "../ui/separator";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: (path: string) => void;
  activePath?: string;
  items?: Array<{
    label: string;
    path: string;
    icon: keyof typeof iconComponents;
  }>;
}

const iconComponents = {
  Home: LayoutDashboard,
  Users: Users,
  BarChart: DollarSign,
  Building2: Building2,
  Package: Package,
  Settings: Settings,
  Help: HelpCircle
};

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  subItems?: NavigationSubItem[];
}

interface NavigationSubItem {
  label: string;
  path: string;
}

const Sidebar = ({
  collapsed = false,
  onToggle = () => {},
  onNavigate = () => {},
  activePath = "/dashboard",
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const toggleSubMenu = (path: string) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navigationItems: NavigationItem[] = [
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
      icon: <Package size={20} />,
      label: "Produtos",
      path: "/products",
    },
    {
      icon: <ShoppingCart size={20} />,
      label: "Vendas",
      path: "/sales",
    },
    {
      icon: <Building2 size={20} />,
      label: "Imóveis",
      path: "/properties",
    },
    {
      icon: <DollarSign size={20} />,
      label: "Financeiro",
      path: "/financeiro",
      subItems: [
        {
          label: "Contas a Pagar",
          path: "/financeiro/contas-pagar",
        },
        {
          label: "Contas a Receber",
          path: "/financeiro/contas-receber",
        },
      ],
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
        "h-full bg-gradient-to-b from-blue-700 to-blue-900 border-r flex flex-col transition-all duration-300",
        isCollapsed ? "w-[70px]" : "w-[250px]",
      )}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b bg-white/10">
        {!isCollapsed && (
          <div className="flex items-center">
            <img src="/logo.png" alt="Logo" className="h-8" />
            <span className="ml-2 font-bold text-white">Cuboh</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={cn("ml-auto text-white hover:bg-white/20", isCollapsed ? "mx-auto" : "")}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = activePath === item.path || activePath.startsWith(item.path + "/");
            const isExpanded = expandedMenus.includes(item.path);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            return (
              <React.Fragment key={item.path}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start mb-1 text-white hover:bg-white/20",
                          isCollapsed ? "px-2" : "px-3",
                          isActive ? "bg-white/20" : ""
                        )}
                        onClick={() => hasSubItems ? toggleSubMenu(item.path) : onNavigate(item.path)}
                      >
                        <span
                          className={cn(
                            "flex items-center w-full",
                            isCollapsed ? "justify-center" : "",
                          )}
                        >
                          {item.icon}
                          {!isCollapsed && (
                            <>
                              <span className="ml-3 flex-grow">{item.label}</span>
                              {hasSubItems && (
                                <ChevronDown 
                                  size={16} 
                                  className={cn(
                                    "transition-transform",
                                    isExpanded ? "transform rotate-180" : ""
                                  )}
                                />
                              )}
                            </>
                          )}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                
                {/* Submenu items */}
                {!isCollapsed && hasSubItems && isExpanded && (
                  <div className="ml-6 mt-1 mb-2 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = activePath === subItem.path;
                      return (
                        <Button
                          key={subItem.path}
                          variant={isSubItemActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start text-white hover:bg-white/20",
                            isSubItemActive ? "bg-white/20" : ""
                          )}
                          onClick={() => onNavigate(subItem.path)}
                        >
                          <span className="ml-3">{subItem.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/20 p-4">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-white hover:bg-white/20",
            isCollapsed ? "px-2" : "px-3",
          )}
          onClick={handleLogout}
        >
          <span
            className={cn(
              "flex items-center w-full",
              isCollapsed ? "justify-center" : "",
            )}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
