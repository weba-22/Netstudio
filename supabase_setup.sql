-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.movies (
  id text NOT NULL,
  title text,
  titlerw text,
  description text,
  descriptionrw text,
  poster text,
  backdrop text,
  videourl text,
  trailerurl text,
  status text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  views_count integer DEFAULT 0,
  seasons_count integer DEFAULT 0,
  episodes_count integer DEFAULT 0,
  parts_count integer DEFAULT 0,
  seasons jsonb,
  episodes jsonb,
  parts jsonb,
  CONSTRAINT movies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.channels (
  id text NOT NULL,
  name text,
  stream_url text,
  icon text,
  views_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT channels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.plans (
  id text NOT NULL,
  name text,
  price numeric,
  duration_days integer,
  CONSTRAINT plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promotions (
  id text NOT NULL,
  is_global_free_active boolean,
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id text NOT NULL,
  username text,
  name text,
  email text UNIQUE,
  role text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);