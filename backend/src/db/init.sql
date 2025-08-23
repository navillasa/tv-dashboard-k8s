CREATE TABLE IF NOT EXISTS shows (
    id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    air_date DATE,
    poster_url TEXT,
    trailer_url TEXT,
    description TEXT,
    popularity FLOAT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id, platform)
);

INSERT INTO shows (id, title, platform, air_date, poster_url, trailer_url, description, popularity) VALUES
('dummy-netflix-id', 'Sample Netflix Show', 'netflix', '2025-07-01', '', '', 'A show from API One.', 100.0);
