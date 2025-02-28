import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';
import { Users, UserCheck, UserPlus, TrendingUp, Pencil, Trash2 } from 'lucide-react';

interface Customer {
  id: string;
  nome_razao_social: string;
  email: string;
  telefone: string;
  celular: string;
  tipo_pessoa: string;
  cpf_cnpj: string;
  status: boolean;
  created_at: string;
  client_number: string;
}

interface FieldErrors {
  [key: string]: string;
}

const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    retentionRate: 0
  });

  const [formData, setFormData] = useState({
    tipo_pessoa: 'F',
    nome_razao_social: '',
    cpf_cnpj: '',
    rg_ie: '',
    data_nascimento_fundacao: '',
    email: '',
    telefone: '',
    celular: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    observacoes: '',
    status: true,
    limite_credito: 0,
    client_number: ''
  });

  useEffect(() => {
    fetchCustomers();
    fetchMetrics();
  }, [currentPage, statusFilter]);

  const fetchCustomers = async () => {
    try {
      let query = supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter === 'ativo');
      }

      if (searchTerm) {
        query = query.or(
          `nome_razao_social.ilike.%${searchTerm}%,cpf_cnpj.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { data: totalCustomers } = await supabase
        .from('clientes')
        .select('count', { count: 'exact' });

      const { data: activeCustomers } = await supabase
        .from('clientes')
        .select('count', { count: 'exact' })
        .eq('status', true);

      const { data: newCustomers } = await supabase
        .from('clientes')
        .select('count', { count: 'exact' })
        .gte('created_at', firstDayOfMonth);

      setMetrics({
        total: totalCustomers?.count || 0,
        active: activeCustomers?.count || 0,
        newThisMonth: newCustomers?.count || 0,
        retentionRate: totalCustomers?.count ? 
          Math.round((activeCustomers?.count || 0) / totalCustomers.count * 100) : 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_pessoa: 'F',
      nome_razao_social: '',
      cpf_cnpj: '',
      rg_ie: '',
      data_nascimento_fundacao: '',
      email: '',
      telefone: '',
      celular: '',
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      observacoes: '',
      status: true,
      limite_credito: 0,
      client_number: ''
    });
    setFieldErrors({});
    setSelectedCustomerId(null);
    setIsEditing(false);
    setIsReadOnly(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error for this field when user starts typing
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: FieldErrors = {};
    let isValid = true;
    
    // Validate required fields
    if (!formData.tipo_pessoa) {
      errors.tipo_pessoa = 'Tipo de Cliente é obrigatório';
      isValid = false;
    }
    
    if (!formData.nome_razao_social) {
      errors.nome_razao_social = 'Nome/Razão Social é obrigatório';
      isValid = false;
    }
    
    // Validate email format if provided
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      // Create a copy of formData to modify
      const dataToSubmit = { ...formData };
      
      // Convert empty date string to null to avoid PostgreSQL date format error
      if (dataToSubmit.data_nascimento_fundacao === '') {
        dataToSubmit.data_nascimento_fundacao = null;
      }

      // Set cpf_cnpj to null if empty
      if (!dataToSubmit.cpf_cnpj.trim()) {
        dataToSubmit.cpf_cnpj = null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isEditing && selectedCustomerId) {
        // Update existing customer
        const { error } = await supabase
          .from('clientes')
          .update(dataToSubmit)
          .eq('id', selectedCustomerId);

        if (error) throw error;
      } else {
        // Insert new customer
        const { error } = await supabase
          .from('clientes')
          .insert([{
            ...dataToSubmit,
            created_by: user.id
          }]);

        if (error) throw error;
      }

      fetchCustomers();
      fetchMetrics();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleRowClick = async (customer: Customer) => {
    try {
      // Get full customer data
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', customer.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          tipo_pessoa: data.tipo_pessoa,
          nome_razao_social: data.nome_razao_social,
          cpf_cnpj: data.cpf_cnpj,
          rg_ie: data.rg_ie || '',
          data_nascimento_fundacao: data.data_nascimento_fundacao || '',
          email: data.email || '',
          telefone: data.telefone || '',
          celular: data.celular || '',
          cep: data.cep || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          observacoes: data.observacoes || '',
          status: data.status,
          limite_credito: data.limite_credito || 0,
          client_number: data.client_number || ''
        });
        setFieldErrors({});
        setSelectedCustomerId(customer.id);
        setIsReadOnly(true);
        setIsEditing(true);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
    }
  };

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  const handleDelete = async () => {
    if (!selectedCustomerId) return;
    
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', selectedCustomerId);

      if (error) throw error;

      fetchCustomers();
      fetchMetrics();
      resetForm();
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleNewCustomer = () => {
    resetForm();
    setIsReadOnly(false);
    setIsDialogOpen(true);
  };

  const metricsCards = [
    {
      title: 'Total de Clientes',
      value: metrics.total.toString(),
      icon: <Users className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Clientes Ativos',
      value: metrics.active.toString(),
      icon: <UserCheck className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Novos este mês',
      value: metrics.newThisMonth.toString(),
      icon: <UserPlus className="h-6 w-6 text-purple-600" />
    },
    {
      title: 'Taxa de Retenção',
      value: `${metrics.retentionRate}%`,
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />
    }
  ];

  // Helper function to determine if a field has an error
  const hasError = (fieldName: string) => {
    return fieldErrors[fieldName] ? true : false;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.title}</p>
                <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNewCustomer}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome/Razão Social</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(customer)}
              >
                <TableCell>{customer.client_number || '-'}</TableCell>
                <TableCell>{customer.nome_razao_social}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.telefone}</TableCell>
                <TableCell>
                  <Badge variant={customer.status ? 'default' : 'destructive'}>
                    {customer.status ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(customer);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomerId(customer.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Detalhes do Cliente' : 'Adicionar Novo Cliente'}
            </DialogTitle>
            {Object.keys(fieldErrors).length > 0 && (
              <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800">Por favor, corrija os seguintes erros:</p>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(fieldErrors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tipo_pessoa" className={hasError('tipo_pessoa') ? 'text-red-500' : ''}>Tipo de Cliente *</Label>
                <Select
                  value={formData.tipo_pessoa}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, tipo_pessoa: value }));
                    setFieldErrors(prev => ({ ...prev, tipo_pessoa: '' }));
                  }}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={hasError('tipo_pessoa') ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F">Pessoa Física</SelectItem>
                    <SelectItem value="J">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
                {hasError('tipo_pessoa') && <p className="text-sm text-red-500">{fieldErrors.tipo_pessoa}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nome_razao_social" className={hasError('nome_razao_social') ? 'text-red-500' : ''}>
                  {formData.tipo_pessoa === 'F' ? 'Nome' : 'Razão Social'} *
                </Label>
                <Input
                  id="nome_razao_social"
                  value={formData.nome_razao_social}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={hasError('nome_razao_social') ? 'border-red-500' : ''}
                />
                {hasError('nome_razao_social') && <p className="text-sm text-red-500">{fieldErrors.nome_razao_social}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data_nascimento_fundacao">{formData.tipo_pessoa === 'F' ? 'Data de Nascimento' : 'Data de Fundação'}</Label>
                <Input
                  id="data_nascimento_fundacao"
                  type="date"
                  value={formData.data_nascimento_fundacao}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cpf_cnpj">{formData.tipo_pessoa === 'F' ? 'CPF' : 'CNPJ'}</Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rg_ie">{formData.tipo_pessoa === 'F' ? 'RG' : 'Inscrição Estadual'}</Label>
                <Input
                  id="rg_ie"
                  value={formData.rg_ie}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="limite_credito">Limite de Crédito</Label>
                <Input
                  id="limite_credito"
                  type="number"
                  value={formData.limite_credito}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className={hasError('email') ? 'text-red-500' : ''}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                  className={hasError('email') ? 'border-red-500' : ''}
                />
                {hasError('email') && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="celular">Celular</Label>
                <Input
                  id="celular"
                  value={formData.celular}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input
                  id="logradouro"
                  value={formData.logradouro}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  maxLength={2}
                  value={formData.estado}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
              <div className="grid gap-2 col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  readOnly={isReadOnly}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-2">
              {isEditing ? (
                <>
                  {isReadOnly ? (
                    <>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
                      <Button variant="default" onClick={handleEdit}>Editar</Button>
                      <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => {
                        setIsReadOnly(true);
                        handleRowClick({ id: selectedCustomerId! } as Customer);
                      }}>Cancelar</Button>
                      <Button onClick={handleSubmit}>Salvar Alterações</Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}>Cancelar</Button>
                  <Button onClick={handleSubmit}>Salvar Cliente</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
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

export default CustomersPage;