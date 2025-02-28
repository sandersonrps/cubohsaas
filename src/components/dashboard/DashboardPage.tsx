import React from "react";
import { Card, Metric, Text, Title, BarList, Flex, Grid } from "@tremor/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Dados de exemplo
const vendasMensais = [
  { mes: "Jan", vendas: 45000 },
  { mes: "Fev", vendas: 52000 },
  { mes: "Mar", vendas: 48000 },
  { mes: "Abr", vendas: 61000 },
  { mes: "Mai", vendas: 55000 },
  { mes: "Jun", vendas: 67000 },
];

const imoveisPorTipo = [
  { name: "Apartamentos", value: 456 },
  { name: "Casas", value: 351 },
  { name: "Comercial", value: 271 },
  { name: "Terrenos", value: 191 },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Cards de Métricas */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6 mb-6">
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
        {/* Gráfico de Vendas */}
        <Card className="bg-white shadow-sm">
          <Title>Vendas Mensais</Title>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={vendasMensais}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(value as number)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="vendas"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribuição por Tipo */}
        <Card className="bg-white shadow-sm">
          <Title>Imóveis por Tipo</Title>
          <Flex className="mt-6">
            <Text>Tipo</Text>
            <Text className="text-right">Quantidade</Text>
          </Flex>
          <BarList
            data={imoveisPorTipo}
            className="mt-2"
            valueFormatter={(number: number) =>
              Intl.NumberFormat("pt-BR").format(number).toString()
            }
          />
        </Card>
      </div>

      {/* Seção de Atividades Recentes */}
      <Card className="mt-6 bg-white shadow-sm">
        <Title>Atividades Recentes</Title>
        <div className="mt-4 space-y-4">
          {[
            {
              acao: "Novo Contrato",
              descricao: "Contrato de locação assinado - Apt 302, Ed. Aurora",
              data: new Date(2024, 1, 28, 14, 30),
            },
            {
              acao: "Visita Agendada",
              descricao: "Cliente João Silva - Casa Vila Nova",
              data: new Date(2024, 1, 28, 10, 15),
            },
            {
              acao: "Proposta Recebida",
              descricao: "Oferta para compra - Terreno Jd. América",
              data: new Date(2024, 1, 27, 16, 45),
            },
          ].map((atividade, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{atividade.acao}</h3>
                <p className="text-gray-600">{atividade.descricao}</p>
              </div>
              <time className="text-sm text-gray-500">
                {format(atividade.data, "dd 'de' MMMM', às 'HH:mm", {
                  locale: ptBR,
                })}
              </time>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
