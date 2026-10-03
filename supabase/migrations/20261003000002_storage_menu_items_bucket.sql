-- Public bucket for menu item photos.
-- Anyone can view files (public bucket); only admins can upload, replace or delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-items',
  'menu-items',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public URLs work without a select policy; listing objects is admin-only.
drop policy if exists "menu-items: admin read" on storage.objects;
create policy "menu-items: admin read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'menu-items' and public.is_admin());

drop policy if exists "menu-items: admin insert" on storage.objects;
create policy "menu-items: admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-items' and public.is_admin());

drop policy if exists "menu-items: admin update" on storage.objects;
create policy "menu-items: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-items' and public.is_admin())
  with check (bucket_id = 'menu-items' and public.is_admin());

drop policy if exists "menu-items: admin delete" on storage.objects;
create policy "menu-items: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-items' and public.is_admin());
