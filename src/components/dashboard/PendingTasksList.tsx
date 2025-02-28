import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const priorityLabels = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

const PendingTasksList = ({
  tasks = [
    {
      id: "1",
      title: "Contatar novos leads da campanha de marketing",
      description:
        "Entrar em contato com os novos leads que vieram da nossa campanha de email marketing do Q2 e agendar chamadas iniciais.",
      dueDate: "2024-03-15",
      priority: "high",
      assignee: "Maria Silva",
      completed: false,
    },
    {
      id: "2",
      title: "Preparar relatório trimestral de vendas",
      description:
        "Compilar dados de vendas do Q2 e preparar apresentação para a reunião da equipe executiva.",
      dueDate: "2024-03-20",
      priority: "medium",
      assignee: "João Santos",
      completed: false,
    },
    {
      id: "3",
      title: "Atualizar banco de dados de clientes",
      description:
        "Limpar registros de clientes e atualizar informações de contato para contas principais.",
      dueDate: "2024-03-10",
      priority: "low",
      assignee: "Ana Costa",
      completed: false,
    },
  ],
}: PendingTasksListProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Tarefas Pendentes</CardTitle>
        <CardDescription>
          Lista de tarefas que precisam de atenção
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {task.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      className={`${
                        priorityColors[task.priority]
                      } px-2 py-1 text-xs font-medium`}
                    >
                      {priorityLabels[task.priority]}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Responsável: {task.assignee}
                    </span>
                  </div>
                </div>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  Vence em{" "}
                  {format(new Date(task.dueDate), "dd 'de' MMMM", {
                    locale: ptBR,
                  })}
                </time>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingTasksList;
