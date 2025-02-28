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
import {
  BarChart,
  LineChart,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface SalesMetricsChartProps {
  title?: string;
  description?: string;
  data?: {
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
  labels?: string[];
  percentage?: number;
  isPositive?: boolean;
}

const SalesMetricsChart = ({
  title = "Sales Metrics",
  description = "Overview of your sales performance",
  data = {
    monthly: [
      4500, 3500, 5200, 6100, 4800, 5300, 6500, 7200, 6800, 7500, 8200, 9000,
    ],
    quarterly: [13200, 16200, 20500, 24700],
    yearly: [74600, 98000, 125000],
  },
  labels = {
    monthly: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    quarterly: ["Q1", "Q2", "Q3", "Q4"],
    yearly: ["2021", "2022", "2023"],
  }["monthly"],
  percentage = 12.5,
  isPositive = true,
}: SalesMetricsChartProps) => {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">(
    "monthly",
  );
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  // This would be replaced with actual chart rendering using ECharts
  const renderChart = () => {
    const currentData = data[period];
    const currentLabels = {
      monthly: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      quarterly: ["Q1", "Q2", "Q3", "Q4"],
      yearly: ["2021", "2022", "2023"],
    }[period];

    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
        <div className="text-center">
          {chartType === "bar" ? (
            <BarChart className="h-10 w-10 mx-auto mb-2 text-primary" />
          ) : (
            <LineChart className="h-10 w-10 mx-auto mb-2 text-primary" />
          )}
          <p className="text-sm text-muted-foreground">
            Chart visualization would render here using ECharts
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {currentData.map((value, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span>{currentLabels[index]}</span>
                <span className="font-medium">${value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full h-full bg-white dark:bg-gray-950 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold">{title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isPositive ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {percentage}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Tabs
            defaultValue="bar"
            className="w-24"
            onValueChange={(value) => setChartType(value as "bar" | "line")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bar" className="text-xs px-2 py-1">
                <BarChart className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="line" className="text-xs px-2 py-1">
                <LineChart className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Select
            defaultValue="monthly"
            onValueChange={(value) =>
              setPeriod(value as "monthly" | "quarterly" | "yearly")
            }
          >
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {renderChart()}

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <DollarSign className="h-5 w-5 text-primary mb-1" />
            <span className="text-sm font-medium">$9,850</span>
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <Users className="h-5 w-5 text-primary mb-1" />
            <span className="text-sm font-medium">124</span>
            <span className="text-xs text-muted-foreground">Customers</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
            <TrendingUp className="h-5 w-5 text-primary mb-1" />
            <span className="text-sm font-medium">18.2%</span>
            <span className="text-xs text-muted-foreground">Growth</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesMetricsChart;
