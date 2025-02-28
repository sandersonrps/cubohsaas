-- Atualizar a tabela de clientes para tornar apenas tipo_pessoa e nome_razao_social obrigatórios

-- Remover a restrição NOT NULL do campo cpf_cnpj
ALTER TABLE public.clientes
ALTER COLUMN cpf_cnpj DROP NOT NULL;

-- Adicionar valor padrão para data_nascimento_fundacao
ALTER TABLE public.clientes
ALTER COLUMN data_nascimento_fundacao SET DEFAULT CURRENT_DATE;

-- Adicionar comentário explicativo
COMMENT ON TABLE public.clientes IS 'Tabela de clientes com apenas tipo_pessoa e nome_razao_social como campos obrigatórios';

-- Adicionar comentários nos campos obrigatórios
COMMENT ON COLUMN public.clientes.tipo_pessoa IS 'Tipo de pessoa (F ou J) - Campo obrigatório';
COMMENT ON COLUMN public.clientes.nome_razao_social IS 'Nome ou Razão Social - Campo obrigatório';