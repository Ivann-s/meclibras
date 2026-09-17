-- Execute no Supabase > SQL Editor > New query.
-- O bucket videos-libras precisa existir e estar como público para o MVP.

create policy "Admins enviam videos Libras"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'videos-libras'
  and public.is_admin()
);

create policy "Admins atualizam videos Libras"
on storage.objects
for update to authenticated
using (
  bucket_id = 'videos-libras'
  and public.is_admin()
)
with check (
  bucket_id = 'videos-libras'
  and public.is_admin()
);

create policy "Admins excluem videos Libras"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'videos-libras'
  and public.is_admin()
);
