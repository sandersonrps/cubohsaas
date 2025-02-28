import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { AlertCircle, CheckCircle2, Clock, DollarSign, Search, Trash2, Users } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContaReceber {
  id: string;
  numero_documento: string;
  descricao: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_recebimento: string | null;
  status: 'Pendente' | 'Recebido' | 'Atrasado' | 'Cancelado';
  categoria: string;
  forma_recebimento: string | null;
  valor_recebido: number | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  observacoes: string | null;
  comprovante_url: string | null;
  parcela: string | null;
  recorrente: boolean;
}

interface FormData {
  numero_documento: string;
  descricao: string;
  valor: number;
  data_emissao: Date;
  data_vencimento: Date;
  data_recebimento: Date | null;
  status: 'Pendente' | 'Recebido' | 'Atrasado' | 'Cancelado';
  categoria: string;
  forma_recebimento: string | null;
  valor_recebido: number | null;
  cliente_id: string | null;
  cliente_nome: string | null;
  observacoes: string | null;
  comprovante_url: string | null;
  parcela: string | null;
  recorrente: boolean;
}

interface Cliente {
  id: string;
  nome_razao_social: string;
}

const statusColors = {
  Pendente: 'bg-yellow-100 text-yellow-800',
  Recebido: 'bg-green-100 text-green-800',
  Atrasado: 'bg-red-100 text-red-800',
  Cancelado: 'bg-gray-100 text-gray-800',
};

const categorias = [
  'Vendas',
  'Serviços',
  'Aluguéis',
  'Empréstimos',
  'Investimentos',
  'Outros',
];

const formasPagamento = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Transferência',
  'Boleto',
  'Cheque',
  'Outros',
];

export default function ContasReceber() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  
  // Métricas
  const [totalRecebido, setTotalRecebido] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [totalAtrasado, setTotalAtrasado] = useState(0);
  const [totalGeral, setTotalGeral] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    numero_documento: '',
    descricao: '',
    valor: 0,
    data_emissao: new Date(),
    data_vencimento: new Date(),
    data_recebimento: null,
    status: 'Pendente',
    categoria: '',
    forma_recebimento: null,
    valor_recebido: null,
    cliente_id: null,
    cliente_nome: null,
    observacoes: null,
    comprovante_url: null,
    parcela: null,
    recorrente: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchContas();
    fetchClientes();
  }, [user, navigate]);

  useEffect(() => {
    if (contas.length > 0) {
      // Calcular métricas
      let recebido = 0;
      let pendente = 0;
      let atrasado = 0;
      let total = 0;

      contas.forEach(conta => {
        total += conta.valor;
        
        if (conta.status === 'Recebido') {
          recebido += conta.valor_recebido || conta.valor;
        } else if (conta.status === 'Pendente') {
          pendente += conta.valor;
        } else if (conta.status === 'Atrasado') {
          atrasado += conta.valor;
        }
      });

      setTotalRecebido(recebido);
      setTotalPendente(pendente);
      setTotalAtrasado(atrasado);
      setTotalGeral(total);
    }
  }, [contas]);

  const fetchContas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contas_receber')
        .select('*')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      
      // Verificar contas atrasadas
      const today = new Date();
      const updatedContas = data.map((conta: ContaReceber) => {
        if (conta.status === 'Pendente') {
          const vencimento = new Date(conta.data_vencimento);
          if (vencimento < today) {
            // Atualizar status para atrasado no banco
            updateContaStatus(conta.id, 'Atrasado');
            return { ...conta, status: 'Atrasado' };
          }
        }
        return conta;
      });
      
      setContas(updatedContas);
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContaStatus = async (id: string, status: string) => {
    try {
      await supabase
        .from('contas_receber')
        .update({ status })
        .eq('id', id);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome_razao_social')
        .order('nome_razao_social', { ascending: true });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      numero_documento: '',
      descricao: '',
      valor: 0,
      data_emissao: new Date(),
      data_vencimento: new Date(),
      data_recebimento: null,
      status: 'Pendente',
      categoria: '',
      forma_recebimento: null,
      valor_recebido: null,
      cliente_id: null,
      cliente_nome: null,
      observacoes: null,
      comprovante_url: null,
      parcela: null,
      recorrente: false,
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleOpenDialog = (conta?: ContaReceber) => {
    if (conta) {
      setIsEditing(true);
      setCurrentId(conta.id);
      setFormData({
        ...formData,
        numero_documento: conta.numero_documento,
        descricao: conta.descricao,
        valor: conta.valor,
        data_emissao: new Date(conta.data_emissao),
        data_vencimento: new Date(conta.data_vencimento),
        data_recebimento: conta.data_recebimento ? new Date(conta.data_recebimento) : null,
        status: conta.status,
        categoria: conta.categoria,
        forma_recebimento: conta.forma_recebimento,
        valor_recebido: conta.valor_recebido,
        cliente_id: conta.cliente_id,
        cliente_nome: conta.cliente_nome,
        observacoes: conta.observacoes,
        comprovante_url: conta.comprovante_url,
        parcela: conta.parcela,
        recorrente: conta.recorrente,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setFormData({
      ...formData,
      cliente_id: clienteId,
      cliente_nome: cliente ? cliente.nome_razao_social : null
    });
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const contaData = {
        numero_documento: formData.numero_documento || null, // Se vazio, o trigger gerará automaticamente
        descricao: formData.descricao,
        valor: formData.valor,
        data_emissao: formData.data_emissao.toISOString().split('T')[0],
        data_vencimento: formData.data_vencimento.toISOString().split('T')[0],
        data_recebimento: formData.data_recebimento ? formData.data_recebimento.toISOString().split('T')[0] : null,
        status: formData.status,
        categoria: formData.categoria,
        forma_recebimento: formData.forma_recebimento,
        valor_recebido: formData.valor_recebido,
        cliente_id: formData.cliente_id,
        cliente_nome: formData.cliente_nome,
        observacoes: formData.observacoes,
        comprovante_url: formData.comprovante_url,
        parcela: formData.parcela,
        recorrente: formData.recorrente,
      };

      if (isEditing && currentId) {
        const { error } = await supabase
          .from('contas_receber')
          .update(contaData)
          .eq('id', currentId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contas_receber')
          .insert([contaData]);

        if (error) throw error;
      }

      handleCloseDialog();
      fetchContas();
    } catch (error) {
      console.error('Erro ao salvar conta a receber:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta conta a receber?')) {
      try {
        const { error } = await supabase
          .from('contas_receber')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchContas();
      } catch (error) {
        console.error('Erro ao excluir conta a receber:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Contas a Receber</h1>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recebido</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalRecebido.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-2">Mês Atual</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Pendente</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalPendente.toFixed(2)}</p>
                <p className="text-sm text-yellow-600 mt-2">A Receber</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Atrasado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalAtrasado.toFixed(2)}</p>
                <p className="text-sm text-red-600 mt-2">Em Atraso</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Geral</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">R$ {totalGeral.toFixed(2)}</p>
                <p className="text-sm text-blue-600 mt-2">Valor Total</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
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
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Recebido">Recebido</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap bg-blue-600 hover:bg-blue-700">
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      name="descricao"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valor">Valor</Label>
                    <Input
                      id="valor"
                      name="valor"
                      type="number"
                      step="0.01"
                      value={formData.valor}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Data de Emissão</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !formData.data_emissao && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data_emissao ? format(formData.data_emissao, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.data_emissao}
                          onSelect={(date) => handleDateChange('data_emissao', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>Data de Vencimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !formData.data_vencimento && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.data_vencimento ? format(formData.data_vencimento, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.data_vencimento}
                          onSelect={(date) => handleDateChange('data_vencimento', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Recebido">Recebido</SelectItem>
                        <SelectItem value="Atrasado">Atrasado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleSelectChange('categoria', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Cliente</Label>
                  <Select value={formData.cliente_id || ''} onValueChange={handleClienteChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome_razao_social}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    name="observacoes"
                    value={formData.observacoes || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                  <Button type="submit">{isEditing ? 'Atualizar' : 'Salvar'}</Button>
                </DialogFooter>
              </form>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell>{conta.numero_documento}</TableCell>
                    <TableCell>{conta.descricao}</TableCell>
                    <TableCell>{conta.cliente_nome || '-'}</TableCell>
                    <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          conta.status === 'Recebido' && 'bg-green-100 text-green-800',
                          conta.status === 'Pendente' && 'bg-yellow-100 text-yellow-800',
                          conta.status === 'Atrasado' && 'bg-red-100 text-red-800',
                          conta.status === 'Cancelado' && 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {conta.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2"
                        onClick={() => handleOpenDialog(conta)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(conta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
}