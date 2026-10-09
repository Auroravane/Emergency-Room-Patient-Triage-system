ALTER TABLE account ADD COLUMN access_token text;
ALTER TABLE account ADD COLUMN refresh_token text;
ALTER TABLE account ADD COLUMN id_token text;
ALTER TABLE account ADD COLUMN access_token_expires_at integer;
ALTER TABLE account ADD COLUMN refresh_token_expires_at integer;
ALTER TABLE account ADD COLUMN scope text;
