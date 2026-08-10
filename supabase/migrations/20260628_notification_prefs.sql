-- Create user_notification_prefs table for per-user notification settings
create table if not exists public.user_notification_prefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  email_alerts boolean not null default true,
  order_tracking boolean not null default true,
  marketing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_notification_prefs enable row level security;

-- Users can read/update their own prefs
create policy "Users can manage their own notification prefs"
  on public.user_notification_prefs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Auto-create prefs on profile creation
create or replace function public.handle_new_user_prefs()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_notification_prefs (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Trigger on profile insert
drop trigger if exists on_profile_created_create_prefs on public.profiles;
create trigger on_profile_created_create_prefs
  after insert on public.profiles
  for each row
  execute function public.handle_new_user_prefs();
