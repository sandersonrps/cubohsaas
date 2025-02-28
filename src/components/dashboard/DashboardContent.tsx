import React from "react";
import { Card, Metric, Text, Title, Grid } from "@tremor/react";
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
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    datasets: [
      {
        name: "Novos Clientes",
        data: [45, 52, 38, 60, 93, 84],
      },
      {
        name: "Clientes Recorrentes",
        data: [35, 41, 62, 78, 88, 95],
      },
    ],
  },
  tasks = [
    {
      id: "1",
      title: "Contatar novos leads da campanha de marketing",
      description:
        "Entrar em contato com os novos leads que vieram da nossa campanha de email marketing do Q2 e agendar chamadas iniciais.",
      dueDate: "2023-06-15",
      priority: "high",
      assignee: "Maria Silva",
      completed: false,
    },
    {
      id: "2",
      title: "Preparar relatório trimestral de vendas",
      description:
        "Compilar dados de vendas do Q2 e preparar apresentação para a reunião da equipe executiva.",
      dueDate: "2023-06-20",
      priority: "medium",
      assignee: "João Santos",
      completed: false,
    },
    {
      id: "3",
      title: "Atualizar banco de dados de clientes",
      description:
        "Limpar registros de clientes e atualizar informações de contato para contas principais.",
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
      action: "atualizou",
      target: "perfil do cliente",
      timestamp: new Date(),
      type: "edit",
    },
  ],
}: DashboardContentProps) => {
  return (
    <div className="p-6 space-y-6">
      {/* Cards de Métricas */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        <Card className="bg-white shadow-sm">
          <Text>Total de Imóveis</Text>
          <Metric>1,269</Metric>
          <Text className="text-sm text-green-600">+12% em relação ao mês anterior</Text>
        </Card>
        <Card className="bg-white shadow-sm">
          <Text>Vendas este Mês</Text>
          <Metric>R$ 67.000</Metric>
          <Text className="text-sm text-green-600">+8% em relação ao mês anterior</Text>
        </Card>
        <Card className="bg-white shadow-sm">
          <Text>Contratos Ativos</Text>
          <Metric>842</Metric>
          <Text className="text-sm text-blue-600">98% de renovação</Text>
        </Card>
        <Card className="bg-white shadow-sm">
          <Text>Visitas Agendadas</Text>
          <Metric>28</Metric>
          <Text className="text-sm text-orange-600">Próximos 7 dias</Text>
        </Card>
      </Grid>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesMetricsChart data={salesData} />
        <CustomerGrowthChart data={customerData} />
      </div>

      {/* Lista de Tarefas */}
      <PendingTasksList tasks={tasks} />
      <ActivityTrackingPanel activities={activities} />
    </div>
  );
};

export default DashboardContent;
