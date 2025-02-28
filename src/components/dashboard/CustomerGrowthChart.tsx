import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CustomerGrowthChartProps {
  data?: {
    labels: string[];
    datasets: {
      name: string;
      data: number[];
    }[];
  };
}

const CustomerGrowthChart = ({
  data = {
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
}: CustomerGrowthChartProps) => {
  // Preparar dados para o gráfico
  const chartData = data.labels.map((label, index) => ({
    name: label,
    novos: data.datasets[0].data[index],
    recorrentes: data.datasets[1].data[index],
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Crescimento de Clientes</CardTitle>
        <CardDescription>
          Análise do crescimento da base de clientes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="novos"
                name="Novos Clientes"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="recorrentes"
                name="Clientes Recorrentes"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerGrowthChart;
