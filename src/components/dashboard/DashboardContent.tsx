import React from "react";
import SalesMetricsChart from "./SalesMetricsChart";
import CustomerGrowthChart from "./CustomerGrowthChart";
import PendingTasksList from "./PendingTasksList";
import ActivityTrackingPanel from "./ActivityTrackingPanel";

interface DashboardContentProps {
  salesData?: {
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
  customerData?: {
    labels: string[];
    datasets: {
      name: string;
      data: number[];
    }[];
  };
  tasks?: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: "high" | "medium" | "low";
    assignee: string;
    completed: boolean;
  }[];
  activities?: {
    id: string;
    user: {
      name: string;
      avatar: string;
    };
    action: string;
    target: string;
    timestamp: Date;
    type: "edit" | "message" | "add" | "user";
  }[];
}

const DashboardContent = ({
  salesData = {
    monthly: [
      4500, 3500, 5200, 6100, 4800, 5300, 6500, 7200, 6800, 7500, 8200, 9000,
    ],
    quarterly: [13200, 16200, 20500, 24700],
    yearly: [74600, 98000, 125000],
  },
  customerData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        name: "New Customers",
        data: [45, 52, 38, 60, 93, 84],
      },
      {
        name: "Returning Customers",
        data: [35, 41, 62, 78, 88, 95],
      },
    ],
  },
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
  ],
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
  ],
}: DashboardContentProps) => {
  return (
    <div className="w-full h-full p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top row with charts */}
        <div className="h-[450px]">
          <SalesMetricsChart
            data={salesData}
            title="Métricas de Vendas"
            description="Visão geral do desempenho de vendas"
          />
        </div>
        <div className="h-[450px]">
          <CustomerGrowthChart
            data={customerData}
            title="Crescimento de Clientes"
            description="Métricas mensais de aquisição e retenção de clientes"
          />
        </div>

        {/* Bottom row with tasks and activity */}
        <div className="h-[450px]">
          <PendingTasksList
            tasks={tasks}
            onMarkComplete={(taskId) =>
              console.log(`Task ${taskId} marked as complete`)
            }
            onViewDetails={(task) =>
              console.log(`Viewing details for task: ${task.title}`)
            }
          />
        </div>
        <div className="h-[450px]">
          <ActivityTrackingPanel
            activities={activities}
            title="Atividades Recentes da Equipe"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
