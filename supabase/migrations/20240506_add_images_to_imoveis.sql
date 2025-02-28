-- Add images array column to imoveis table
alter table public.imoveis
add column images text[] default array[]::text[];

-- Create storage bucket for property images if it doesn't exist
insert into storage.buckets (id, name, public)
values ('imoveis_images', 'imoveis_images', true)
on conflict (id) do nothing;

-- Enable RLS for the storage bucket
create policy "Authenticated users can upload property images"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'imoveis_images' and auth.role() = 'authenticated');

create policy "Property images are publicly accessible"
    on storage.objects for select
    to public
    using (bucket_id = 'imoveis_images');