import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Sale {
  id: string;
  numero_venda: string;
  data_venda: string;
  cliente_id: string;
  produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: 'Pendente' | 'Concluído' | 'Cancelado';
  observacoes?: string;
  cliente?: {
    nome_razao_social: string;
  };
}

interface FormData {
  numero_venda: string;
  cliente_id: string;
  produto: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  status: string;
  observacoes: string;
}

const SalesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    numero_venda: '', // Este campo será preenchido automaticamente pelo Supabase
    cliente_id: '',
    produto: '',
    quantidade: 1,
    valor_unitario: 0,
    valor_total: 0,
    status: 'Pendente',
    observacoes: ''
  });

  // Carregar vendas
  const loadSales = async () => {
    try {
      setIsLoading(true);
      const { data: salesData, error } = await supabase
        .from('vendas')
        .select(`
          *,
          cliente:clientes(nome_razao_social)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSales(salesData || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar clientes
  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_razao_social')
        .order('nome_razao_social');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    }
  };

  useEffect(() => {
    loadSales();
    loadCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calcular valor total quando quantidade ou valor unitário mudar
      if (name === 'quantidade' || name === 'valor_unitario') {
        newData.valor_total = Number(newData.quantidade) * Number(newData.valor_unitario);
      }
      
      return newData;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.cliente_id || !formData.produto) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const saleData = {
        ...formData,
        created_by: user.id
      };

      if (selectedSale) {
        // Atualizar venda existente
        const { error } = await supabase
          .from('vendas')
          .update(saleData)
          .eq('id', selectedSale.id);

        if (error) throw error;
        toast.success('Venda atualizada com sucesso');
      } else {
        // Criar nova venda
        const { error } = await supabase
          .from('vendas')
          .insert([saleData]);

        if (error) throw error;
        toast.success('Venda criada com sucesso');
      }

      setIsModalOpen(false);
      loadSales();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      toast.error('Erro ao salvar venda');
    }
  };

  const handleDelete = async () => {
    if (!selectedSale) return;

    try {
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', selectedSale.id);

      if (error) throw error;
      
      toast.success('Venda excluída com sucesso');
      setIsDeleteAlertOpen(false);
      loadSales();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast.error('Erro ao excluir venda');
    }
  };

  const resetForm = () => {
    setFormData({
      numero_venda: '', // Este campo será preenchido automaticamente pelo Supabase
      cliente_id: '',
      produto: '',
      quantidade: 1,
      valor_unitario: 0,
      valor_total: 0,
      status: 'Pendente',
      observacoes: ''
    });
    setSelectedSale(null);
  };

  const handleNewSale = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setSelectedSale(sale);
    setFormData({
      numero_venda: sale.numero_venda,
      cliente_id: sale.cliente_id,
      produto: sale.produto,
      quantidade: sale.quantidade,
      valor_unitario: sale.valor_unitario,
      valor_total: sale.valor_total,
      status: sale.status,
      observacoes: sale.observacoes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDeleteAlertOpen(true);
  };

  // Filtrar vendas baseado no termo de busca
  const filteredSales = sales.filter(sale =>
    sale.numero_venda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.cliente?.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Pesquisar vendas..."
                  className="pl-10 pr-4 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button 
                className="!rounded-button whitespace-nowrap"
                onClick={handleNewSale}
              >
                <i className="fa-solid fa-plus mr-2"></i>
                Nova Venda
              </Button>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.numero_venda}</TableCell>
                  <TableCell>{new Date(sale.data_venda).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{sale.cliente?.nome_razao_social}</TableCell>
                  <TableCell>{sale.produto}</TableCell>
                  <TableCell>{sale.quantidade}</TableCell>
                  <TableCell>
                    {sale.valor_total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      sale.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                      sale.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="!rounded-button whitespace-nowrap"
                        onClick={() => handleEdit(sale)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="!rounded-button whitespace-nowrap"
                        onClick={() => handleDeleteClick(sale)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* New/Edit Sale Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[650px] p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">{selectedSale ? 'Editar Venda' : 'Nova Venda'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <label htmlFor="numero_venda" className="text-sm font-medium">Número da Venda</label>
              <div className="relative">
                <Input
                  id="numero_venda"
                  name="numero_venda"
                  type="text"
                  placeholder="Número será gerado automaticamente se vazio"
                  className="w-full focus:ring-2 focus:ring-primary/20"
                  value={formData.numero_venda}
                  onChange={handleInputChange}
                  aria-required="true"
                />
                {!formData.numero_venda && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-muted-foreground">Automático</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="cliente_id" className="text-sm font-medium">Cliente <span className="text-red-500">*</span></label>
              <Select
                value={formData.cliente_id}
                onValueChange={(value) => handleSelectChange('cliente_id', value)}
              >
                <SelectTrigger id="cliente_id" className="w-full focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.nome_razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.cliente_id && (
                <p className="text-xs text-muted-foreground mt-1">Este campo é obrigatório</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="produto" className="text-sm font-medium">Produto/Serviço <span className="text-red-500">*</span></label>
              <Input
                id="produto"
                name="produto"
                type="text"
                placeholder="Nome do produto ou serviço"
                className="w-full focus:ring-2 focus:ring-primary/20"
                value={formData.produto}
                onChange={handleInputChange}
                aria-required="true"
              />
              {!formData.produto && (
                <p className="text-xs text-muted-foreground mt-1">Este campo é obrigatório</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="quantidade" className="text-sm font-medium">Quantidade</label>
                <Input
                  id="quantidade"
                  name="quantidade"
                  type="number"
                  placeholder="Quantidade"
                  className="w-full focus:ring-2 focus:ring-primary/20"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  min={1}
                />
                <p className="text-xs text-muted-foreground mt-1">Quantidade mínima: 1</p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="valor_unitario" className="text-sm font-medium">Valor Unitário (R$)</label>
                <Input
                  id="valor_unitario"
                  name="valor_unitario"
                  type="number"
                  placeholder="0,00"
                  className="w-full focus:ring-2 focus:ring-primary/20"
                  value={formData.valor_unitario}
                  onChange={handleInputChange}
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            
            <div className="space-y-2 bg-muted/20 p-3 rounded-md">
              <label htmlFor="valor_total" className="text-sm font-medium">Valor Total (R$)</label>
              <Input
                id="valor_total"
                name="valor_total"
                type="number"
                placeholder="Valor Total"
                className="w-full bg-white focus:ring-2 focus:ring-primary/20 font-medium"
                value={formData.valor_total}
                readOnly
              />
              <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente (Quantidade × Valor Unitário)</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">Status da Venda</label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status" className="w-full focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="observacoes" className="text-sm font-medium">Observações</label>
              <Input
                id="observacoes"
                name="observacoes"
                type="text"
                placeholder="Informações adicionais sobre a venda"
                className="w-full focus:ring-2 focus:ring-primary/20"
                value={formData.observacoes}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="min-w-[100px]">Cancelar</Button>
            <Button onClick={handleSubmit} className="min-w-[100px]">
              {selectedSale ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <DialogContent>
          <Alert>
            <AlertDescription>
              Tem certeza que deseja excluir esta venda?
              Esta ação não pode ser desfeita.
            </AlertDescription>
          </Alert>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteAlertOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
