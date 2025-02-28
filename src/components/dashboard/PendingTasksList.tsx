import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  assignee: string;
  completed: boolean;
}

interface PendingTasksListProps {
  tasks?: Task[];
  onMarkComplete?: (taskId: string) => void;
  onViewDetails?: (task: Task) => void;
}

const PendingTasksList = ({
  tasks = [
    {
      id: "1",
      title: "Contact new leads from marketing campaign",
      description:
        "Reach out to the new leads that came in from our Q2 email marketing campaign and schedule initial calls.",
      dueDate: "2023-06-15",
      priority: "high",
      assignee: "Maria Silva",
      completed: false,
    },
    {
      id: "2",
      title: "Prepare quarterly sales report",
      description:
        "Compile sales data from Q2 and prepare presentation for the executive team meeting.",
      dueDate: "2023-06-20",
      priority: "medium",
      assignee: "João Santos",
      completed: false,
    },
    {
      id: "3",
      title: "Update customer database",
      description:
        "Clean up customer records and update contact information for key accounts.",
      dueDate: "2023-06-10",
      priority: "low",
      assignee: "Ana Costa",
      completed: false,
    },
    {
      id: "4",
      title: "Follow up with potential enterprise clients",
      description:
        "Send follow-up emails to enterprise prospects from the trade show last month.",
      dueDate: "2023-06-08",
      priority: "high",
      assignee: "Carlos Oliveira",
      completed: false,
    },
    {
      id: "5",
      title: "Review new CRM features",
      description:
        "Explore and document the new features released in the latest CRM update.",
      dueDate: "2023-06-25",
      priority: "medium",
      assignee: "Sofia Martins",
      completed: false,
    },
  ],
  onMarkComplete = () => {},
  onViewDetails = () => {},
}: PendingTasksListProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  const handleMarkComplete = (taskId: string) => {
    setLocalTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
    onMarkComplete(taskId);
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    onViewDetails(task);
  };

  const getPriorityBadge = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">Alta</Badge>;
      case "medium":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Média</Badge>
        );
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600">Baixa</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const isOverdue = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    return dueDate < today;
  };

  return (
    <Card className="w-full h-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Tarefas Pendentes
        </CardTitle>
        <CardDescription>
          Gerencie suas tarefas e acompanhe o progresso
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {localTasks
              .filter((task) => !task.completed)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-start space-x-4 p-3 rounded-md border hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => handleMarkComplete(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}
                      >
                        {task.title}
                      </label>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(task.priority)}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(task)}
                            >
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMarkComplete(task.id)}
                            >
                              Marcar como Concluída
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span
                          className={
                            isOverdue(task.dueDate)
                              ? "text-red-500 font-medium"
                              : ""
                          }
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        <span>{task.assignee}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {localTasks.filter((task) => !task.completed).length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">
                  Todas as tarefas concluídas!
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Você não tem tarefas pendentes no momento.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-gray-500">
          {localTasks.filter((task) => !task.completed).length} tarefas
          pendentes
        </div>
        <Button variant="outline" size="sm">
          Ver Todas
        </Button>
      </CardFooter>

      {/* Task Details Dialog */}
      {selectedTask && (
        <Dialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              <DialogDescription>
                Detalhes da tarefa e informações de acompanhamento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Descrição</h4>
                <p className="text-sm text-gray-500">
                  {selectedTask.description}
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Data de Vencimento
                  </h4>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span
                      className={
                        isOverdue(selectedTask.dueDate)
                          ? "text-red-500 font-medium"
                          : ""
                      }
                    >
                      {formatDate(selectedTask.dueDate)}
                      {isOverdue(selectedTask.dueDate) && (
                        <span className="ml-2 inline-flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" /> Atrasada
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Prioridade</h4>
                  <div>{getPriorityBadge(selectedTask.priority)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Responsável</h4>
                  <div className="flex items-center text-sm">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{selectedTask.assignee}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Status</h4>
                  <Badge
                    variant={selectedTask.completed ? "outline" : "secondary"}
                  >
                    {selectedTask.completed ? "Concluída" : "Pendente"}
                  </Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  handleMarkComplete(selectedTask.id);
                  setSelectedTask(null);
                }}
              >
                {selectedTask.completed
                  ? "Marcar como Pendente"
                  : "Marcar como Concluída"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default PendingTasksList;
