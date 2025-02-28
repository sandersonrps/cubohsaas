-- Create a table to store receipt number sequences
create table public.receipt_number_sequences (
    user_id uuid references auth.users(id) primary key,
    last_number integer default 0
);

-- Add RLS policies to receipt_number_sequences
alter table public.receipt_number_sequences enable row level security;

-- Users can only see and update their own sequence
create policy "Users can view their own receipt sequence"
    on public.receipt_number_sequences for select
    using (auth.uid() = user_id);

create policy "Users can update their own receipt sequence"
    on public.receipt_number_sequences for update
    using (auth.uid() = user_id);

create policy "Users can insert their own receipt sequence"
    on public.receipt_number_sequences for insert
    with check (auth.uid() = user_id);

-- Create the contas_receber table
create table public.contas_receber (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) not null,
    
    -- Basic receipt information
    numero_documento varchar(20) unique not null,
    descricao varchar(255) not null,
    valor decimal(10,2) not null default 0.00,
    
    -- Dates
    data_emissao date not null,
    data_vencimento date not null,
    data_recebimento date,
    
    -- Status and category
    status varchar(20) not null check (status in ('Pendente', 'Recebido', 'Atrasado', 'Cancelado')),
    categoria varchar(100) not null,
    
    -- Payment information
    forma_recebimento varchar(50),
    valor_recebido decimal(10,2),
    
    -- Related entities
    cliente_id uuid references public.clientes(id),
    cliente_nome varchar(255),
    
    -- Additional information
    observacoes text,
    comprovante_url text,
    parcela varchar(10),
    recorrente boolean default false
);

-- Enable RLS
alter table public.contas_receber enable row level security;

-- RLS Policies
create policy "Users can view their own receipts"
    on public.contas_receber for select
    using (auth.uid() = created_by);

create policy "Users can insert their own receipts"
    on public.contas_receber for insert
    with check (auth.uid() = created_by);

create policy "Users can update their own receipts"
    on public.contas_receber for update
    using (auth.uid() = created_by);

create policy "Users can delete their own receipts"
    on public.contas_receber for delete
    using (auth.uid() = created_by);

-- Function to generate the next receipt number
create or replace function public.get_next_receipt_number()
returns varchar
language plpgsql
security definer
as $$
declare
    next_number integer;
    formatted_number varchar;
begin
    -- Insert or update the sequence for the current user
    insert into public.receipt_number_sequences (user_id, last_number)
    values (auth.uid(), 0)
    on conflict (user_id)
    do update set last_number = receipt_number_sequences.last_number + 1
    returning last_number into next_number;

    -- Format the number with leading zeros (CR-XXXXX)
    formatted_number := 'CR-' || lpad(next_number::text, 5, '0');
    
    return formatted_number;
end;
$$;

-- Trigger to automatically set receipt number before insert
create or replace function public.set_receipt_number()
returns trigger
language plpgsql
as $$
begin
    -- Only set the number if it's empty
    if new.numero_documento is null or new.numero_documento = '' then
        new.numero_documento := public.get_next_receipt_number();
    end if;
    return new;
end;
$$;

create trigger set_receipt_number_before_insert
    before insert on public.contas_receber
    for each row
    execute function public.set_receipt_number();

-- Trigger for updating updated_at timestamp
create trigger handle_contas_receber_updated_at
    before update on public.contas_receber
    for each row
    execute function public.handle_updated_at();

-- Indexes for better performance
create index idx_contas_receber_created_by on public.contas_receber(created_by);
create index idx_contas_receber_numero_documento on public.contas_receber(numero_documento);
create index idx_contas_receber_data_vencimento on public.contas_receber(data_vencimento);
create index idx_contas_receber_status on public.contas_receber(status);
create index idx_contas_receber_categoria on public.contas_receber(categoria);
create index idx_contas_receber_cliente_id on public.contas_receber(cliente_id);