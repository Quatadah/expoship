-- ExpoShip SaaS starter Supabase bootstrap
-- Run this script in the Supabase SQL editor or via the Supabase CLI.

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Profiles table --------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  website text,
  billing_plan text default 'free',
  onboarding_completed boolean not null default false,
  expo_push_token text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists profiles_username_idx on public.profiles (lower(username));

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_current_timestamp_updated_at on public.profiles;
create trigger set_current_timestamp_updated_at
before update on public.profiles
for each row
execute function public.set_current_timestamp_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_users_created on auth.users;
create trigger on_auth_users_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can view own profile'
  ) then
    create policy "Users can view own profile"
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile'
  ) then
    create policy "Users can update own profile"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end;
$$;

-- Billing metrics summary -----------------------------------------------------
create table if not exists public.billing_metrics_summary (
  id integer primary key default 1,
  impressions integer not null default 0,
  purchases integer not null default 0,
  conversion_rate double precision not null default 0,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

insert into public.billing_metrics_summary (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists set_current_timestamp_updated_at on public.billing_metrics_summary;
create trigger set_current_timestamp_updated_at
before update on public.billing_metrics_summary
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.billing_metrics_summary enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_metrics_summary'
      and policyname = 'Authenticated can read billing metrics summary'
  ) then
    create policy "Authenticated can read billing metrics summary"
      on public.billing_metrics_summary
      for select
      to authenticated
      using (true);
  end if;
end;
$$;

-- Supabase Realtime publication -----------------------------------------------
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.billing_metrics_summary;

-- Storage bucket & policies ---------------------------------------------------
insert into storage.buckets (id, name, public)
values ('public', 'public', true)
on conflict (id) do update set public = true;

do $$
declare
  has_storage_admin boolean := true;
begin
  begin
    execute 'alter table storage.objects enable row level security';
  exception
    when others then
      if SQLSTATE = '42501' then
        has_storage_admin := false;
        raise notice '[ExpoShip bootstrap] Skipped enabling RLS on storage.objects (requires supabase_admin privileges). Enable it manually from the Supabase dashboard if needed.';
      else
        raise;
      end if;
  end;

  if has_storage_admin then
    begin
      execute $cmd$
        create policy "Public bucket read access"
          on storage.objects
          for select
          to public
          using (bucket_id = 'public')
      $cmd$;
    exception
      when duplicate_object then
        null;
    end;

    begin
      execute $cmd$
        create policy "Authenticated can upload to public bucket"
          on storage.objects
          for insert
          to authenticated
          with check (bucket_id = 'public' and owner = auth.uid())
      $cmd$;
    exception
      when duplicate_object then
        null;
    end;

    begin
      execute $cmd$
        create policy "Authenticated can update own public objects"
          on storage.objects
          for update
          to authenticated
          using (bucket_id = 'public' and owner = auth.uid())
          with check (bucket_id = 'public' and owner = auth.uid())
      $cmd$;
    exception
      when duplicate_object then
        null;
    end;

    begin
      execute $cmd$
        create policy "Authenticated can delete own public objects"
          on storage.objects
          for delete
          to authenticated
          using (bucket_id = 'public' and owner = auth.uid())
      $cmd$;
    exception
      when duplicate_object then
        null;
    end;
  end if;
end;
$$;

comment on table public.profiles is
  'Per-user profile data for ExpoShip (mirrors auth.users via handle_new_user trigger).';

comment on table public.billing_metrics_summary is
  'Aggregated paywall metrics surfaced inside the ExpoShip Settings screen.';


