// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Bill {
  id: string;
  numero_documento: string;
  descricao: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento: string | null;
  status: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
  categoria: string;
  forma_pagamento: string | null;
  valor_pago: number | null;
  fornecedor_nome: string | null;
}

const ContasAPagar: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [metrics, setMetrics] = useState({
    totalAPagar: 0,
    contasVencidas: 0,
    pagasEsteMes: 0,
    totalContas: 0
  });

  useEffect(() => {
    fetchBills();
    fetchMetrics();
  }, []);

  const fetchBills = async () => {
    try {
      let query = supabase
        .from('contas_pagar')
        .select('*')
        .order('data_vencimento', { ascending: true });

      if (searchTerm) {
        query = query.or(`descricao.ilike.%${searchTerm}%,numero_documento.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const today = new Date().toISOString();
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

      const { data: totalAPagar } = await supabase
        .from('contas_pagar')
        .select('valor')
        .eq('status', 'Pendente');

      const { data: contasVencidas } = await supabase
        .from('contas_pagar')
        .select('valor')
        .eq('status', 'Atrasado');

      const { data: pagasEsteMes } = await supabase
        .from('contas_pagar')
        .select('valor_pago')
        .eq('status', 'Pago')
        .gte('data_pagamento', firstDayOfMonth)
        .lte('data_pagamento', lastDayOfMonth);

      const { data: totalContas } = await supabase
        .from('contas_pagar')
        .select('count', { count: 'exact' });

      setMetrics({
        totalAPagar: totalAPagar?.reduce((acc, bill) => acc + (bill.valor || 0), 0) || 0,
        contasVencidas: contasVencidas?.reduce((acc, bill) => acc + (bill.valor || 0), 0) || 0,
        pagasEsteMes: pagasEsteMes?.reduce((acc, bill) => acc + (bill.valor_pago || 0), 0) || 0,
        totalContas: totalContas?.count || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const metricsData = [
    {
      title: 'Total a Pagar',
      value: `R$ ${metrics.totalAPagar.toFixed(2)}`,
      change: '+12%',
      icon: 'fa-solid fa-money-bill-wave'
    },
    {
      title: 'Contas Vencidas',
      value: `R$ ${metrics.contasVencidas.toFixed(2)}`,
      change: '+5%',
      icon: 'fa-solid fa-clock'
    },
    {
      title: 'Pagas este Mês',
      value: `R$ ${metrics.pagasEsteMes.toFixed(2)}`,
      change: '+18%',
      icon: 'fa-solid fa-check-circle'
    },
    {
      title: 'Total de Contas',
      value: metrics.totalContas.toString(),
      change: '+8%',
      icon: 'fa-solid fa-file-invoice'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Contas a Pagar</h1>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData.map((metric, index) => (
            <Card key={index} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <p className="text-sm text-green-600 mt-2">{metric.change} este mês</p>
                </div>
                <i className={`${metric.icon} text-3xl text-blue-500`}></i>
              </div>
            </Card>
          ))}
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="text"
                placeholder="Buscar contas..."
                className="pl-10 pr-4 py-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="!rounded-button whitespace-nowrap bg-blue-600 hover:bg-blue-700">
                <i className="fa-solid fa-plus mr-2"></i>
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Conta a Pagar</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="description">Descrição</label>
                  <Input id="description" placeholder="Digite a descrição" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="value">Valor</label>
                  <Input id="value" type="number" placeholder="R$ 0,00" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="date">Data de Vencimento</label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <label>Status</label>
                  <Select defaultValue="pendente">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="atrasado">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.numero_documento}</TableCell>
                    <TableCell>{bill.descricao}</TableCell>
                    <TableCell>R$ {bill.valor.toFixed(2)}</TableCell>
                    <TableCell>{new Date(bill.data_vencimento).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${bill.status === 'Pago' ? 'bg-green-100 text-green-800' : bill.status === 'Atrasado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {bill.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="mr-2">
                        <i className="fa-solid fa-edit"></i>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <i className="fa-solid fa-trash"></i>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
};

export default ContasAPagar;