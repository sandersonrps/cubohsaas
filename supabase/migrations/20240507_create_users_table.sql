-- Create users table for storing additional user data
create table public.users (
    id uuid default gen_random_uuid() primary key,
    auth_id uuid references auth.users(id) not null unique,
    email varchar(255) not null,
    user_name varchar(255),
    is_active boolean default true,
    last_login timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;

-- Create policy to allow users to read their own data
create policy "Users can read their own data"
    on public.users
    for select
    using (auth.uid() = auth_id);

-- Create policy to allow authenticated users to update their own data
create policy "Users can update their own data"
    on public.users
    for update
    using (auth.uid() = auth_id);

-- Create policy to allow service role to manage all users (full access for administrative purposes)
create policy "Service role can manage all users"
    on public.users
    to service_role
    using (true);