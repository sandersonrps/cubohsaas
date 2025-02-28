-- Criar tabela para armazenar as sequências por usuário
CREATE TABLE user_sequences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    last_sale_number INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_user_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o timestamp
CREATE TRIGGER update_user_sequences_timestamp
    BEFORE UPDATE ON user_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_sequences_updated_at();

-- Função para obter o próximo número de venda para um usuário
CREATE OR REPLACE FUNCTION get_next_sale_number(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Inserir ou atualizar o registro do usuário e obter o próximo número
    INSERT INTO user_sequences (user_id, last_sale_number)
    VALUES (p_user_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET last_sale_number = user_sequences.last_sale_number + 1
    RETURNING last_sale_number INTO next_number;
    
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar o número formatado da venda (ex: V0001)
CREATE OR REPLACE FUNCTION generate_sale_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Obter o próximo número
    next_number := get_next_sale_number(p_user_id);
    
    -- Formatar o número com zeros à esquerda (V0001)
    formatted_number := 'V' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Política de segurança para a tabela user_sequences
ALTER TABLE user_sequences ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas sua própria sequência
CREATE POLICY "Usuários podem ver sua própria sequência" ON user_sequences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas sua própria sequência
CREATE POLICY "Usuários podem atualizar sua própria sequência" ON user_sequences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram sua própria sequência
CREATE POLICY "Usuários podem inserir sua própria sequência" ON user_sequences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Trigger para gerar automaticamente o número da venda antes de inserir
CREATE OR REPLACE FUNCTION generate_sale_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Gerar o número da venda apenas se não foi fornecido
    IF NEW.numero_venda IS NULL OR NEW.numero_venda = '' THEN
        NEW.numero_venda := generate_sale_number(NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar o trigger à tabela de vendas
CREATE TRIGGER generate_sale_number_before_insert
    BEFORE INSERT ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION generate_sale_number_trigger();
