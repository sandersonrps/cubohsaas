-- Criar a tabela de clientes com RLS
create table public.clientes (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) not null,
    
    -- Dados básicos
    tipo_pessoa varchar(1) not null check (tipo_pessoa in ('F', 'J')),
    nome_razao_social varchar(255) not null,
    cpf_cnpj varchar(14) unique,
    rg_ie varchar(20),
    data_nascimento_fundacao date,
    
    -- Contato
    email varchar(255),
    telefone varchar(20),
    celular varchar(20),
    
    -- Endereço
    cep varchar(8),
    logradouro varchar(255),
    numero varchar(10),
    complemento varchar(100),
    bairro varchar(100),
    cidade varchar(100),
    estado char(2),
    
    -- Dados adicionais
    observacoes text,
    status boolean default true,
    limite_credito decimal(10,2) default 0.00
);

-- Habilitar Row Level Security
alter table public.clientes enable row level security;

-- Política para SELECT - usuário só vê seus próprios registros
create policy "Usuários podem ver apenas seus próprios clientes"
    on public.clientes for select
    using (auth.uid() = created_by);

-- Política para INSERT - usuário só insere registros próprios
create policy "Usuários podem inserir seus próprios clientes"
    on public.clientes for insert
    with check (auth.uid() = created_by);

-- Política para UPDATE - usuário só atualiza seus próprios registros
create policy "Usuários podem atualizar apenas seus próprios clientes"
    on public.clientes for update
    using (auth.uid() = created_by);

-- Política para DELETE - usuário só deleta seus próprios registros
create policy "Usuários podem deletar apenas seus próprios clientes"
    on public.clientes for delete
    using (auth.uid() = created_by);

-- Trigger para atualizar o updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

create trigger handle_clientes_updated_at
    before update on public.clientes
    for each row
    execute function public.handle_updated_at();

-- Índices para melhor performance
create index idx_clientes_created_by on public.clientes(created_by);
create index idx_clientes_cpf_cnpj on public.clientes(cpf_cnpj);