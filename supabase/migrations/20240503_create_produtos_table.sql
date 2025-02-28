-- Create a table to store product SKU sequences
create table public.product_sku_sequences (
    user_id uuid references auth.users(id) primary key,
    last_number integer default 0
);

-- Add RLS policies to product_sku_sequences
alter table public.product_sku_sequences enable row level security;

-- Users can only see and update their own sequence
create policy "Users can view their own sequence"
    on public.product_sku_sequences for select
    using (auth.uid() = user_id);

create policy "Users can update their own sequence"
    on public.product_sku_sequences for update
    using (auth.uid() = user_id);

create policy "Users can insert their own sequence"
    on public.product_sku_sequences for insert
    with check (auth.uid() = user_id);

-- Create the products table
create table public.produtos (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) not null,
    
    -- Basic product information
    sku varchar(10) unique not null,
    nome varchar(255) not null,
    descricao text,
    categoria varchar(100) not null,
    
    -- Pricing and inventory
    preco_venda decimal(10,2) not null default 0.00,
    preco_custo decimal(10,2) default 0.00,
    quantidade_estoque integer not null default 0,
    estoque_minimo integer default 0,
    
    -- Additional information
    unidade_medida varchar(20),
    marca varchar(100),
    fornecedor varchar(255),
    codigo_barras varchar(50),
    peso decimal(10,3),
    status boolean default true,
    imagem_url text
);

-- Enable RLS
alter table public.produtos enable row level security;

-- RLS Policies
create policy "Users can view their own products"
    on public.produtos for select
    using (auth.uid() = created_by);

create policy "Users can insert their own products"
    on public.produtos for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own products"
    on public.produtos for update
    using (auth.uid() = created_by);

create policy "Users can delete their own products"
    on public.produtos for delete
    using (auth.uid() = created_by);

-- Function to generate the next SKU
create or replace function public.get_next_sku()
returns varchar
language plpgsql
security definer
as $$
declare
    next_number integer;
    formatted_number varchar;
begin
    -- Insert or update the sequence for the current user
    insert into public.product_sku_sequences (user_id, last_number)
    values (auth.uid(), 0)
    on conflict (user_id)
    do update set last_number = product_sku_sequences.last_number + 1
    returning last_number into next_number;

    -- Format the number with leading zeros (SKU-XXXXX)
    formatted_number := 'SKU-' || lpad(next_number::text, 5, '0');
    
    return formatted_number;
end;
$$;

-- Trigger to automatically set SKU before insert
create or replace function public.set_product_sku()
returns trigger
language plpgsql
as $$
begin
    new.sku := public.get_next_sku();
    return new;
end;
$$;

create trigger set_product_sku_before_insert
    before insert on public.produtos
    for each row
    execute function public.set_product_sku();

-- Trigger for updating updated_at timestamp
create trigger handle_produtos_updated_at
    before update on public.produtos
    for each row
    execute function public.handle_updated_at();

-- Indexes for better performance
create index idx_produtos_created_by on public.produtos(created_by);
create index idx_produtos_sku on public.produtos(sku);
create index idx_produtos_categoria on public.produtos(categoria);
create index idx_produtos_nome on public.produtos(nome);