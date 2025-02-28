import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Package, PackagePlus, Pencil, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  nome: string;
  descricao: string;
  categoria: string;
  preco_venda: number;
  quantidade_estoque: number;
  status: boolean;
  created_at: string;
}

const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    totalValue: 0
  });

  const [formData, setFormData] = useState({
    sku: '',
    nome: '',
    descricao: '',
    categoria: '',
    preco_venda: 0,
    preco_custo: 0,
    quantidade_estoque: 0,
    estoque_minimo: 0,
    unidade_medida: '',
    marca: '',
    fornecedor: '',
    codigo_barras: '',
    peso: 0,
    status: true,
    imagem_url: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchMetrics();
  }, [currentPage, statusFilter]);

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'todos') {
        query = query.eq('status', statusFilter === 'ativo');
      }

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data: totalProducts } = await supabase
        .from('produtos')
        .select('count', { count: 'exact' });

      const { data: activeProducts } = await supabase
        .from('produtos')
        .select('count', { count: 'exact' })
        .eq('status', true);

      const { data: lowStockProducts } = await supabase
        .from('produtos')
        .select('count', { count: 'exact' })
        .lt('quantidade_estoque', 10);

      const { data: totalValue } = await supabase
        .from('produtos')
        .select('preco_venda, quantidade_estoque');

      const totalInventoryValue = totalValue?.reduce((acc, product) => {
        return acc + (product.preco_venda * product.quantidade_estoque);
      }, 0) || 0;

      setMetrics({
        total: totalProducts?.count || 0,
        active: activeProducts?.count || 0,
        lowStock: lowStockProducts?.count || 0,
        totalValue: totalInventoryValue
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      nome: '',
      descricao: '',
      categoria: '',
      preco_venda: 0,
      preco_custo: 0,
      quantidade_estoque: 0,
      estoque_minimo: 0,
      unidade_medida: '',
      marca: '',
      fornecedor: '',
      codigo_barras: '',
      peso: 0,
      status: true,
      imagem_url: ''
    });
    setFieldErrors({});
    setSelectedProductId(null);
    setIsEditing(false);
    setIsReadOnly(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    if (!formData.nome) {
      errors.nome = 'Nome do produto é obrigatório';
      isValid = false;
    }
    
    if (!formData.categoria) {
      errors.categoria = 'Categoria é obrigatória';
      isValid = false;
    }
    
    if (formData.preco_venda <= 0) {
      errors.preco_venda = 'Preço de venda deve ser maior que zero';
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isEditing && selectedProductId) {
        const { error } = await supabase
          .from('produtos')
          .update(formData)
          .eq('id', selectedProductId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert([{
            ...formData,
            created_by: user.id
          }]);

        if (error) throw error;
      }

      fetchProducts();
      fetchMetrics();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleRowClick = async (product: Product) => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', product.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData(data);
        setFieldErrors({});
        setSelectedProductId(product.id);
        setIsReadOnly(true);
        setIsEditing(true);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleEdit = () => {
    setIsReadOnly(false);
  };

  const handleDelete = async () => {
    if (!selectedProductId) return;
    
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', selectedProductId);

      if (error) throw error;

      fetchProducts();
      fetchMetrics();
      resetForm();
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleNewProduct = () => {
    resetForm();
    setIsReadOnly(false);
    setIsDialogOpen(true);
  };

  const metricsCards = [
    {
      title: 'Total de Produtos',
      value: metrics.total.toString(),
      icon: <Package className="h-6 w-6 text-blue-600" />
    },
    {
      title: 'Produtos Ativos',
      value: metrics.active.toString(),
      icon: <Package className="h-6 w-6 text-green-600" />
    },
    {
      title: 'Estoque Baixo',
      value: metrics.lowStock.toString(),
      icon: <Package className="h-6 w-6 text-orange-600" />
    },
    {
      title: 'Valor Total do Estoque',
      value: `R$ ${metrics.totalValue.toFixed(2)}`,
      icon: <Package className="h-6 w-6 text-purple-600" />
    }
  ];

  const hasError = (fieldName: string) => {
    return fieldErrors[fieldName] ? true : false;
  };

  return (
    <div className="p-6 space-y-6">
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

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 w-full md:w-auto">
            <Input
              placeholder="Buscar produtos..."
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

          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNewProduct}>
            <PackagePlus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow 
                key={product.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(product)}
              >
                <TableCell>{product.sku}</TableCell>
                <TableCell>{product.nome}</TableCell>
                <TableCell>{product.categoria}</TableCell>
                <TableCell>R$ {product.preco_venda.toFixed(2)}</TableCell>
                <TableCell>{product.quantidade_estoque}</TableCell>
                <TableCell>
                  <Badge variant={product.status ? 'default' : 'destructive'}>
                    {product.status ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(product);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProductId(product.id);
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Detalhes do Produto' : 'Adicionar Novo Produto'}
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
              {/* Basic Information */}
              <div className="grid gap-2">
                <Label htmlFor="sku" className={hasError('sku') ? 'text-red-500' : ''}>SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className={hasError('sku') ? 'border-red-500' : ''}
                  disabled={true}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nome" className={hasError('nome') ? 'text-red-500' : ''}>Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={hasError('nome') ? 'border-red-500' : ''}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="categoria" className={hasError('categoria') ? 'text-red-500' : ''}>Categoria *</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={hasError('categoria') ? 'border-red-500' : ''}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Pricing and Inventory */}
              <div className="grid gap-2">
                <Label htmlFor="preco_venda" className={hasError('preco_venda') ? 'text-red-500' : ''}>Preço de Venda *</Label>
                <Input
                  id="preco_venda"
                  type="number"
                  value={formData.preco_venda}
                  onChange={handleInputChange}
                  className={hasError('preco_venda') ? 'border-red-500' : ''}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="preco_custo">Preço de Custo</Label>
                <Input
                  id="preco_custo"
                  type="number"
                  value={formData.preco_custo}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantidade_estoque">Quantidade em Estoque</Label>
                <Input
                  id="quantidade_estoque"
                  type="number"
                  value={formData.quantidade_estoque}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Additional Information */}
              <div className="grid gap-2">
                <Label htmlFor="unidade_medida">Unidade de Medida</Label>
                <Input
                  id="unidade_medida"
                  value={formData.unidade_medida}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fornecedor">Fornecedor</Label>
                <Input
                  id="fornecedor"
                  value={formData.fornecedor}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="codigo_barras">Código de Barras</Label>
                <Input
                  id="codigo_barras"
                  value={formData.codigo_barras}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  value={formData.peso}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  value={formData.estoque_minimo}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  value={formData.imagem_url}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.status ? 'ativo' : 'inativo'}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, status: value === 'ativo' }));
                  }}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                {isReadOnly ? (
                  <Button onClick={handleEdit}>Editar</Button>
                ) : (
                  <Button onClick={handleSubmit}>Salvar</Button>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Excluir
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSubmit}>Salvar</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p>Tem certeza que deseja excluir este produto?</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;