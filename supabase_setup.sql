-- 1. Movies/Series Table
CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    title TEXT,
    titleRw TEXT,
    description TEXT,
    descriptionRw TEXT,
    poster TEXT,
    backdrop TEXT,
    videoUrl TEXT,
    trailerUrl TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    views_count INTEGER DEFAULT 0,
    seasons_count INTEGER DEFAULT 0,
    episodes_count INTEGER DEFAULT 0,
    parts_count INTEGER DEFAULT 0,
    seasons JSONB,
    episodes JSONB,
    parts JSONB
);

-- 2. Channels Table
CREATE TABLE IF NOT EXISTS channels (
    id TEXT PRIMARY KEY,
    name TEXT,
    stream_url TEXT,
    icon TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT,
    price DECIMAL,
    duration_days INTEGER
);

-- 4. Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    is_global_free_active BOOLEAN
);

-- 5. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Realtime for movies table
ALTER PUBLICATION supabase_realtime ADD TABLE movies;
