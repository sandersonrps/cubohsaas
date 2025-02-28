import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from './imoveis/ImageUploader';

interface Imovel {
  id: string;
  codigo: string;
  tipo: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep?: string;
  area_total?: number;
  area_construida?: number;
  quartos?: number;
  banheiros?: number;
  vagas_garagem?: number;
  valor_venda?: number;
  valor_aluguel?: number;
  disponivel_venda: boolean;
  disponivel_aluguel: boolean;
  descricao?: string;
  caracteristicas?: string[];
  status: 'Disponível' | 'Vendido' | 'Alugado' | 'Em Negociação' | 'Inativo';
  cliente_proprietario_id?: string;
  video?: string;
  images?: string[];
}

interface FormData extends Omit<Imovel, 'id' | 'codigo'> {
  id?: string;
}

const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Imovel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Imovel | null>(null);
  const [formData, setFormData] = useState<FormData>({
    tipo: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    area_total: undefined,
    area_construida: undefined,
    quartos: undefined,
    banheiros: undefined,
    vagas_garagem: undefined,
    valor_venda: undefined,
    valor_aluguel: undefined,
    disponivel_venda: false,
    disponivel_aluguel: false,
    descricao: '',
    caracteristicas: [],
    status: 'Disponível',
    cliente_proprietario_id: undefined
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);

  // Carregar imóveis
  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .order('data_cadastro', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      toast.error('Erro ao carregar imóveis');
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
    loadProperties();
    loadCustomers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = async () => {
    try {
      // Validações básicas
      if (!formData.tipo || !formData.endereco || !formData.cidade || !formData.estado) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const propertyData = {
        ...formData,
        created_by: user.id
      };

      if (selectedProperty && selectedProperty.id) {
        // Atualizar imóvel existente
        const { error } = await supabase
          .from('imoveis')
          .update(propertyData)
          .eq('id', selectedProperty.id);

        if (error) throw error;
        toast.success('Imóvel atualizado com sucesso');
      } else {
        // Criar novo imóvel
        const { error } = await supabase
          .from('imoveis')
          .insert([propertyData]);

        if (error) throw error;
        toast.success('Imóvel cadastrado com sucesso');
      }

      setIsModalOpen(false);
      loadProperties();
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      toast.error('Erro ao salvar imóvel');
    }
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;

    try {
      const { error } = await supabase
        .from('imoveis')
        .delete()
        .eq('id', selectedProperty.id);

      if (error) throw error;
      
      toast.success('Imóvel excluído com sucesso');
      setIsDeleteDialogOpen(false);
      loadProperties();
    } catch (error) {
      console.error('Erro ao excluir imóvel:', error);
      toast.error('Erro ao excluir imóvel');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      endereco: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      area_total: undefined,
      area_construida: undefined,
      quartos: undefined,
      banheiros: undefined,
      vagas_garagem: undefined,
      valor_venda: undefined,
      valor_aluguel: undefined,
      disponivel_venda: false,
      disponivel_aluguel: false,
      descricao: '',
      caracteristicas: [],
      status: 'Disponível',
      cliente_proprietario_id: undefined,
      video: ''
    });
    setSelectedProperty(null);
  };

  const handleNewProperty = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditProperty = (property: Imovel) => {
    setSelectedProperty(property);
    setFormData({
      ...property,
      id: property.id
    });
    setIsModalOpen(true);
  };

  const handleDeleteProperty = (property: Imovel) => {
    setSelectedProperty(property);
    setIsDeleteDialogOpen(true);
  };

  // Filtrar imóveis baseado no termo de busca
  const filteredProperties = properties.filter(property =>
    property.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.bairro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.cidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="Pesquisar imóveis..."
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
              onClick={handleNewProperty}
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Novo Imóvel
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Cidade/Estado</TableHead>
              <TableHead>Valor Venda</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProperties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>
                  {property.images && property.images.length > 0 && (
                    <img
                      src={`${supabase.storageUrl}/object/public/imoveis_images/${property.images[0].split('/').pop()}`}
                      alt="Imagem do imóvel"
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                </TableCell>
                <TableCell>{property.codigo}</TableCell>
                <TableCell>{property.tipo}</TableCell>
                <TableCell>{property.endereco}</TableCell>
                <TableCell>{`${property.cidade} - ${property.estado}`}</TableCell>
                <TableCell>
                  {property.valor_venda?.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) || 'N/A'}
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    property.status === 'Disponível' ? 'bg-green-100 text-green-800' : 
                    property.status === 'Vendido' ? 'bg-red-100 text-red-800' :
                    property.status === 'Em Negociação' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="!rounded-button whitespace-nowrap"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="!rounded-button whitespace-nowrap"
                      onClick={() => handleDeleteProperty(property)}
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

      {/* New/Edit Property Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProperty ? 'Editar Imóvel' : 'Novo Imóvel'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleSelectChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Imóvel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Apartamento">Apartamento</SelectItem>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Terreno">Terreno</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={formData.cliente_proprietario_id || ''}
                onValueChange={(value) => handleSelectChange('cliente_proprietario_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Proprietário" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.nome_razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Input
                name="endereco"
                placeholder="Endereço"
                value={formData.endereco}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="bairro"
                placeholder="Bairro"
                value={formData.bairro}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="cidade"
                placeholder="Cidade"
                value={formData.cidade}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="estado"
                placeholder="Estado"
                value={formData.estado}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="cep"
                placeholder="CEP"
                value={formData.cep}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="area_total"
                type="number"
                placeholder="Área Total (m²)"
                value={formData.area_total || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="area_construida"
                type="number"
                placeholder="Área Construída (m²)"
                value={formData.area_construida || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="quartos"
                type="number"
                placeholder="Quartos"
                value={formData.quartos || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="banheiros"
                type="number"
                placeholder="Banheiros"
                value={formData.banheiros || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="vagas_garagem"
                type="number"
                placeholder="Vagas de Garagem"
                value={formData.vagas_garagem || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="valor_venda"
                type="number"
                placeholder="Valor de Venda"
                value={formData.valor_venda || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Input
                name="valor_aluguel"
                type="number"
                placeholder="Valor de Aluguel"
                value={formData.valor_aluguel || ''}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Vendido">Vendido</SelectItem>
                  <SelectItem value="Alugado">Alugado</SelectItem>
                  <SelectItem value="Em Negociação">Em Negociação</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Input
                name="video"
                placeholder="URL do Vídeo"
                value={formData.video || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                name="descricao"
                placeholder="Descrição do Imóvel"
                value={formData.descricao}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-2">
              <ImageUploader
                images={formData.images}
                onChange={handleImageChange}
                maxImages={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter>
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

export default PropertiesPage;
