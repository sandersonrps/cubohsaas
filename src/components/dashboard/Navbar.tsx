import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
} from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface NavbarProps {
  onToggleSidebar?: () => void;
  userName?: string;
  userAvatar?: string;
  notifications?: Array<{
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
  }>;
  onLanguageChange?: (language: string) => void;
  onLogout?: () => void;
}

const Navbar = ({
  onToggleSidebar = () => {},
  userName = "João Silva",
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  notifications = [
    {
      id: "1",
      title: "Nova mensagem",
      description: "Carlos enviou uma mensagem sobre a proposta comercial",
      time: "5 min atrás",
      read: false,
    },
    {
      id: "2",
      title: "Reunião agendada",
      description: "Reunião com a equipe de vendas às 15:00",
      time: "1 hora atrás",
      read: false,
    },
    {
      id: "3",
      title: "Meta atingida",
      description: "Sua equipe atingiu 85% da meta mensal",
      time: "3 horas atrás",
      read: true,
    },
  ],
  onLanguageChange = () => {},
  onLogout = () => {},
}: NavbarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState("pt-BR");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    onLanguageChange(value);
  };

  return (
    <div className="w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="mr-2 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="w-full h-9 pl-8 pr-4 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(true)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
                    variant="destructive"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notificações</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mensagens</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[130px] h-9">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Idioma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pt-BR">Português</SelectItem>
            <SelectItem value="en-US">English</SelectItem>
            <SelectItem value="es-ES">Español</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>{userName.substring(0, 2)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@empresa.com.br
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notificações</DialogTitle>
            <DialogDescription>
              Suas notificações e alertas recentes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${notification.read ? "bg-white dark:bg-gray-950" : "bg-blue-50 dark:bg-blue-950"}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-medium">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {notification.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Bell className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Nenhuma notificação</p>
              </div>
            )}
          </div>
          <div className="flex justify-between mt-4">
            <Button variant="outline" size="sm">
              Marcar todas como lidas
            </Button>
            <Button variant="outline" size="sm">
              Ver todas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
