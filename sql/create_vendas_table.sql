-- Criação da tabela de vendas
CREATE TABLE vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_venda VARCHAR NOT NULL,
  data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  produto VARCHAR NOT NULL,
  quantidade INTEGER NOT NULL,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  status VARCHAR NOT NULL CHECK (status IN ('Pendente', 'Concluído', 'Cancelado')),
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação de índices para melhorar a performance
CREATE INDEX idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX idx_vendas_created_by ON vendas(created_by);
CREATE INDEX idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX idx_vendas_status ON vendas(status);

-- Função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de updated_at
CREATE TRIGGER update_vendas_updated_at
BEFORE UPDATE ON vendas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Política de segurança para que usuários só possam ver suas próprias vendas
CREATE POLICY "Usuários podem ver suas próprias vendas" ON vendas
FOR SELECT
USING (auth.uid() = created_by);

-- Política de segurança para que usuários só possam inserir suas próprias vendas
CREATE POLICY "Usuários podem inserir suas próprias vendas" ON vendas
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Política de segurança para que usuários só possam atualizar suas próprias vendas
CREATE POLICY "Usuários podem atualizar suas próprias vendas" ON vendas
FOR UPDATE
USING (auth.uid() = created_by);

-- Política de segurança para que usuários só possam excluir suas próprias vendas
CREATE POLICY "Usuários podem excluir suas próprias vendas" ON vendas
FOR DELETE
USING (auth.uid() = created_by);

-- Habilitar RLS (Row Level Security)
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
