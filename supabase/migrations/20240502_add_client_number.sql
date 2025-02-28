-- Create a table to store the last used number for each user
create table public.client_number_sequences (
    user_id uuid references auth.users(id) primary key,
    last_number integer default 0
);

-- Add RLS policies to client_number_sequences
alter table public.client_number_sequences enable row level security;

-- Users can only see and update their own sequence
create policy "Users can view their own sequence"
    on public.client_number_sequences for select
    using (auth.uid() = user_id);

create policy "Users can update their own sequence"
    on public.client_number_sequences for update
    using (auth.uid() = user_id);

create policy "Users can insert their own sequence"
    on public.client_number_sequences for insert
    with check (auth.uid() = user_id);

-- Add the client_number column to clientes table
alter table public.clientes
add column client_number varchar(4);

-- Create a function to generate the next client number for a user
create or replace function public.get_next_client_number()
returns varchar
language plpgsql
security definer
as $$
declare
    next_number integer;
    formatted_number varchar;
begin
    -- Insert or update the sequence for the current user
    insert into public.client_number_sequences (user_id, last_number)
    values (auth.uid(), 0)
    on conflict (user_id)
    do update set last_number = client_number_sequences.last_number + 1
    returning last_number into next_number;

    -- Format the number with leading zeros
    formatted_number := lpad(next_number::text, 4, '0');
    
    return formatted_number;
end;
$$;

-- Create a trigger to automatically set the client_number before insert
create or replace function public.set_client_number()
returns trigger
language plpgsql
as $$
begin
    new.client_number := public.get_next_client_number();
    return new;
end;
$$;

create trigger set_client_number_before_insert
    before insert on public.clientes
    for each row
    execute function public.set_client_number();

-- Add an index for better performance
create index idx_clientes_client_number on public.clientes(client_number);