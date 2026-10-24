create table if not exists public.portfolio_content (
  id smallint primary key check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;

drop policy if exists "Portfolio content is publicly readable"
  on public.portfolio_content;
create policy "Portfolio content is publicly readable"
  on public.portfolio_content
  for select
  to anon, authenticated
  using (true);

grant select on public.portfolio_content to anon, authenticated;
