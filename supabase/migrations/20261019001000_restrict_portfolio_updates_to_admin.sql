revoke insert, update, delete on table public.portfolio_content from anon, authenticated;
grant select on table public.portfolio_content to anon, authenticated;
grant update on table public.portfolio_content to authenticated;

drop policy if exists "Only portfolio admin can update content"
  on public.portfolio_content;
create policy "Only portfolio admin can update content"
  on public.portfolio_content
  for update
  to authenticated
  using ((select auth.uid()) ='65c2eac6-4248-49bd-bb7a-8b3d784ee6db'::uuid)
  with check ((select auth.uid()) ='65c2eac6-4248-49bd-bb7a-8b3d784ee6db'::uuid);
