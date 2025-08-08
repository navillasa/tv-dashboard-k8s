CREATE TABLE IF NOT EXISTS shows (
    id SERIAL,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(100) NOT NULL,
    air_date DATE,
    poster_url TEXT,
    trailer_url TEXT,
    description TEXT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE (id, platform)
);

INSERT INTO shows (title, platform, air_date, poster_url, trailer_url, description) VALUES
('Sample Netflix Show', 'netflix', '2025-07-01', '', '', 'A show from API One.');
