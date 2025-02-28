import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, FileEdit, MessageSquare, Plus, UserPlus } from "lucide-react";

interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: string;
  timestamp: Date;
  type: "edit" | "message" | "add" | "user";
}

interface ActivityTrackingPanelProps {
  activities?: ActivityItem[];
  title?: string;
}

const ActivityTrackingPanel = ({
  activities = [
    {
      id: "1",
      user: {
        name: "Ana Silva",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
      },
      action: "editou",
      target: "Proposta Comercial #1234",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: "edit",
    },
    {
      id: "2",
      user: {
        name: "Carlos Mendes",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
      },
      action: "adicionou",
      target: "Nova tarefa: Ligar para cliente XYZ",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: "add",
    },
    {
      id: "3",
      user: {
        name: "Mariana Costa",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana",
      },
      action: "enviou mensagem para",
      target: "Equipe de Vendas",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      type: "message",
    },
    {
      id: "4",
      user: {
        name: "Pedro Santos",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
      },
      action: "adicionou",
      target: "Novo membro: Juliana Alves",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: "user",
    },
    {
      id: "5",
      user: {
        name: "Luisa Ferreira",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luisa",
      },
      action: "editou",
      target: "Perfil do cliente Empresa ABC",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
      type: "edit",
    },
  ],
  title = "Atividades Recentes da Equipe",
}: ActivityTrackingPanelProps) => {
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "edit":
        return <FileEdit className="h-4 w-4 text-amber-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "add":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "user":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full h-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={activity.user.avatar}
                    alt={activity.user.name}
                  />
                  <AvatarFallback>
                    {activity.user.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium">{activity.user.name}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="ml-2 px-1">
                            {getActivityIcon(activity.type)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {activity.type === "edit" && "Edição"}
                            {activity.type === "message" && "Mensagem"}
                            {activity.type === "add" && "Adição"}
                            {activity.type === "user" && "Novo Usuário"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span>{activity.action}</span>{" "}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityTrackingPanel;
