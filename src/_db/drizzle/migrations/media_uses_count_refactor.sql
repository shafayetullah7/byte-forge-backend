-- Migration: Add usesCount to media table
-- Replaces usedAt timestamp with usesCount integer for tracking media usage

-- Add new column
ALTER TABLE media ADD COLUMN uses_count INTEGER NOT NULL DEFAULT 0;

-- Migrate existing data: if usedAt was set (media was used), set usesCount to 1
UPDATE media SET uses_count = 1 WHERE used_at IS NOT NULL;

-- Verify the migration
SELECT id, file_name, uses_count, used_at FROM media LIMIT 10;

-- After verification, drop the old column (uncomment after testing)
-- ALTER TABLE media DROP COLUMN used_at;

-- Optional: Also drop the uses JSON column if not used (uncomment after testing)
-- ALTER TABLE media DROP COLUMN uses;
