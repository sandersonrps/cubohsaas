-- Create a table to store bill number sequences
create table public.bill_number_sequences (
    user_id uuid references auth.users(id) primary key,
    last_number integer default 0
);

-- Add RLS policies to bill_number_sequences
alter table public.bill_number_sequences enable row level security;

-- Users can only see and update their own sequence
create policy "Users can view their own bill sequence"
    on public.bill_number_sequences for select
    using (auth.uid() = user_id);

create policy "Users can update their own bill sequence"
    on public.bill_number_sequences for update
    using (auth.uid() = user_id);

create policy "Users can insert their own bill sequence"
    on public.bill_number_sequences for insert
    with check (auth.uid() = user_id);

-- Create the contas_pagar table
create table public.contas_pagar (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) not null,
    
    -- Basic bill information
    numero_documento varchar(20) unique not null,
    descricao varchar(255) not null,
    valor decimal(10,2) not null default 0.00,
    
    -- Dates
    data_emissao date not null,
    data_vencimento date not null,
    data_pagamento date,
    
    -- Status and category
    status varchar(20) not null check (status in ('Pendente', 'Pago', 'Atrasado', 'Cancelado')),
    categoria varchar(100) not null,
    
    -- Payment information
    forma_pagamento varchar(50),
    valor_pago decimal(10,2),
    
    -- Related entities
    fornecedor_id uuid,
    fornecedor_nome varchar(255),
    
    -- Additional information
    observacoes text,
    comprovante_url text,
    parcela varchar(10),
    recorrente boolean default false
);

-- Enable RLS
alter table public.contas_pagar enable row level security;

-- RLS Policies
create policy "Users can view their own bills"
    on public.contas_pagar for select
    using (auth.uid() = created_by);

create policy "Users can insert their own bills"
    on public.contas_pagar for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own bills"
    on public.contas_pagar for update
    using (auth.uid() = created_by);

create policy "Users can delete their own bills"
    on public.contas_pagar for delete
    using (auth.uid() = created_by);

-- Function to generate the next bill number
create or replace function public.get_next_bill_number()
returns varchar
language plpgsql
security definer
as $$
declare
    next_number integer;
    formatted_number varchar;
begin
    -- Insert or update the sequence for the current user
    insert into public.bill_number_sequences (user_id, last_number)
    values (auth.uid(), 0)
    on conflict (user_id)
    do update set last_number = bill_number_sequences.last_number + 1
    returning last_number into next_number;

    -- Format the number with leading zeros (CP-XXXXX)
    formatted_number := 'CP-' || lpad(next_number::text, 5, '0');
    
    return formatted_number;
end;
$$;

-- Trigger to automatically set bill number before insert
create or replace function public.set_bill_number()
returns trigger
language plpgsql
as $$
begin
    -- Only set the number if it's empty
    if new.numero_documento is null or new.numero_documento = '' then
        new.numero_documento := public.get_next_bill_number();
    end if;
    return new;
end;
$$;

create trigger set_bill_number_before_insert
    before insert on public.contas_pagar
    for each row
    execute function public.set_bill_number();

-- Trigger for updating updated_at timestamp
create trigger handle_contas_pagar_updated_at
    before update on public.contas_pagar
    for each row
    execute function public.handle_updated_at();

-- Indexes for better performance
create index idx_contas_pagar_created_by on public.contas_pagar(created_by);
create index idx_contas_pagar_numero_documento on public.contas_pagar(numero_documento);
create index idx_contas_pagar_data_vencimento on public.contas_pagar(data_vencimento);
create index idx_contas_pagar_status on public.contas_pagar(status);
create index idx_contas_pagar_categoria on public.contas_pagar(categoria);