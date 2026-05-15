-- Run this in your Supabase SQL editor to set up the database

-- Study results table
create table study_results (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  file_name text not null,
  file_path text not null,
  mode text not null check (mode in ('answers', 'notes', 'both')),
  result text not null,
  created_at timestamptz default now()
);

-- Index for fast user history lookups
create index idx_study_results_user_id on study_results(user_id);

-- Storage bucket (run in Supabase Storage or via SQL)
-- Go to Storage > New Bucket > Name: study-files > Private bucket
