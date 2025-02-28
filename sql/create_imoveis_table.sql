-- Criação da tabela de imóveis
CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR NOT NULL,
  tipo VARCHAR NOT NULL, -- Apartamento, Casa, Terreno, etc.
  endereco VARCHAR NOT NULL,
  bairro VARCHAR NOT NULL,
  cidade VARCHAR NOT NULL,
  estado VARCHAR(2) NOT NULL,
  cep VARCHAR(10),
  area_total DECIMAL(10, 2),
  area_construida DECIMAL(10, 2),
  quartos INTEGER,
  banheiros INTEGER,
  vagas_garagem INTEGER,
  valor_venda DECIMAL(12, 2),
  valor_aluguel DECIMAL(12, 2),
  disponivel_venda BOOLEAN DEFAULT false,
  disponivel_aluguel BOOLEAN DEFAULT false,
  descricao TEXT,
  caracteristicas TEXT[], -- Array com características do imóvel
  status VARCHAR NOT NULL CHECK (status IN ('Disponível', 'Vendido', 'Alugado', 'Em Negociação', 'Inativo')),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cliente_proprietario_id UUID REFERENCES clientes(id) ON DELETE SET NULL
);

-- Índices para melhorar a performance
CREATE INDEX idx_imoveis_tipo ON imoveis(tipo);
CREATE INDEX idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX idx_imoveis_bairro ON imoveis(bairro);
CREATE INDEX idx_imoveis_status ON imoveis(status);
CREATE INDEX idx_imoveis_created_by ON imoveis(created_by);
CREATE INDEX idx_imoveis_cliente_proprietario_id ON imoveis(cliente_proprietario_id);

-- Função para atualizar o timestamp de data_atualizacao
CREATE OR REPLACE FUNCTION update_imoveis_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de data_atualizacao
CREATE TRIGGER update_imoveis_data_atualizacao
BEFORE UPDATE ON imoveis
FOR EACH ROW
EXECUTE FUNCTION update_imoveis_data_atualizacao();

-- Função para gerar o código do imóvel automaticamente
CREATE OR REPLACE FUNCTION generate_imovel_code()
RETURNS TRIGGER AS $$
DECLARE
  tipo_prefixo VARCHAR;
  next_number INTEGER;
  ano_atual VARCHAR;
BEGIN
  -- Define o prefixo baseado no tipo de imóvel
  CASE NEW.tipo
    WHEN 'Apartamento' THEN tipo_prefixo := 'AP';
    WHEN 'Casa' THEN tipo_prefixo := 'CA';
    WHEN 'Terreno' THEN tipo_prefixo := 'TE';
    WHEN 'Comercial' THEN tipo_prefixo := 'CO';
    WHEN 'Rural' THEN tipo_prefixo := 'RU';
    ELSE tipo_prefixo := 'IM';
  END CASE;
  
  -- Ano atual
  ano_atual := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Obtém o próximo número sequencial para este tipo de imóvel
  SELECT COALESCE(MAX(SUBSTRING(codigo FROM '[0-9]+')::INTEGER), 0) + 1
  INTO next_number
  FROM imoveis
  WHERE tipo = NEW.tipo;
  
  -- Gera o código no formato TIPO-ANO-NUMERO (ex: AP-23-0001)
  NEW.codigo := tipo_prefixo || '-' || ano_atual || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar o código do imóvel automaticamente
CREATE TRIGGER generate_imovel_code_before_insert
BEFORE INSERT ON imoveis
FOR EACH ROW
WHEN (NEW.codigo IS NULL OR NEW.codigo = '')
EXECUTE FUNCTION generate_imovel_code();

-- Política de segurança para a tabela imoveis
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam todos os imóveis
CREATE POLICY "Usuários podem ver todos os imóveis" ON imoveis
FOR SELECT
USING (true);

-- Política para permitir que usuários insiram seus próprios imóveis
CREATE POLICY "Usuários podem inserir seus próprios imóveis" ON imoveis
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Política para permitir que usuários atualizem seus próprios imóveis
CREATE POLICY "Usuários podem atualizar seus próprios imóveis" ON imoveis
FOR UPDATE
USING (auth.uid() = created_by);

-- Política para permitir que usuários excluam seus próprios imóveis
CREATE POLICY "Usuários podem excluir seus próprios imóveis" ON imoveis
FOR DELETE
USING (auth.uid() = created_by);
