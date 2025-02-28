import React, { useState, useEffect } from "react";
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
import { Button } from "../ui/button";
import { ArrowUpRight, Users, TrendingUp, Download } from "lucide-react";

interface CustomerGrowthChartProps {
  title?: string;
  description?: string;
  data?: {
    labels: string[];
    datasets: {
      name: string;
      data: number[];
    }[];
  };
}

const CustomerGrowthChart = ({
  title = "Customer Growth",
  description = "Monthly customer acquisition and retention metrics",
  data = {
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
}: CustomerGrowthChartProps) => {
  const [timeRange, setTimeRange] = useState("6m");
  const [chartType, setChartType] = useState("growth");

  // This would be replaced with actual chart rendering using ECharts
  const renderChart = () => {
    // Placeholder for actual chart implementation
    return (
      <div className="w-full h-[250px] bg-slate-50 dark:bg-slate-900 rounded-md flex items-center justify-center relative">
        {/* Placeholder chart visualization */}
        <div className="absolute inset-0 p-4">
          {/* Fake chart bars */}
          <div className="flex h-full items-end justify-between gap-2 px-4">
            {data.labels.map((label, index) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 w-full"
              >
                <div className="w-full flex gap-1 justify-center">
                  <div
                    className="w-5 bg-blue-500 rounded-t-sm"
                    style={{ height: `${data.datasets[0].data[index] / 2}px` }}
                  />
                  <div
                    className="w-5 bg-green-500 rounded-t-sm"
                    style={{ height: `${data.datasets[1].data[index] / 2}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Overlay message */}
        <div className="bg-white/80 dark:bg-black/50 p-4 rounded-lg shadow-sm z-10">
          <div className="flex items-center gap-2 text-primary">
            <TrendingUp className="h-5 w-5" />
            <span className="font-medium">
              ECharts visualization would render here
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full bg-white dark:bg-slate-950 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="growth"
          className="w-full"
          onValueChange={setChartType}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="churn">Churn Rate</TabsTrigger>
          </TabsList>
          <TabsContent value="growth" className="mt-0">
            {renderChart()}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">New Customers</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">372</p>
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <ArrowUpRight className="h-3 w-3" /> 12.5%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Growth Rate</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold">8.7%</p>
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                      <ArrowUpRight className="h-3 w-3" /> 2.1%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="retention" className="mt-0">
            <div className="flex items-center justify-center h-[250px] bg-slate-50 dark:bg-slate-900 rounded-md">
              <p className="text-muted-foreground">
                Retention data visualization would appear here
              </p>
            </div>
          </TabsContent>
          <TabsContent value="churn" className="mt-0">
            <div className="flex items-center justify-center h-[250px] bg-slate-50 dark:bg-slate-900 rounded-md">
              <p className="text-muted-foreground">
                Churn rate data visualization would appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerGrowthChart;
