import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { TrendingUp, DollarSign } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";

interface SalesMetricsChartProps {
  title?: string;
  description?: string;
  data?: {
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
  labels?: {
    monthly: string[];
    quarterly: string[];
    yearly: string[];
  };
  percentage?: number;
  isPositive?: boolean;
}

const SalesMetricsChart = ({
  title = "Métricas de Vendas",
  description = "Visão geral do desempenho de vendas",
  data = {
    monthly: [4500, 3500, 5200, 6100, 4800, 5300, 6500, 7200, 6800, 7500, 8200, 9000],
    quarterly: [13200, 16200, 20500, 24700],
    yearly: [74600, 98000, 125000],
  },
  labels = {
    monthly: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    quarterly: ["T1", "T2", "T3", "T4"],
    yearly: ["2021", "2022", "2023"],
  },
  percentage = 12.5,
  isPositive = true,
}: SalesMetricsChartProps) => {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Preparar dados para o gráfico
  const chartData = data[period].map((value, index) => ({
    name: labels[period][index],
    valor: value,
  }));

  // Formatar valores em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <TabsList>
                <TabsTrigger value="area">
                  <TrendingUp className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="bar">
                  <DollarSign className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value as number), "Valor"]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Valor"]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                />
                <Legend />
                <Bar
                  dataKey="valor"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesMetricsChart;
