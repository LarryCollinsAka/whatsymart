-- Initial locale seed. Run after the baseline migration and before creating
-- translations or SupportKnowledgeArticle rows.
-- Add further BCP 47 locale codes with INSERTs; adding a language does not
-- require a Prisma schema migration.

INSERT INTO "locales"
  ("code", "name", "nativeName", "isEnabled", "isDefault", "isRtl", "createdAt", "updatedAt")
VALUES
  ('en', 'English', 'English', true, true, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('fr', 'French', U&'Fran\00E7ais', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('es', 'Spanish', U&'Espa\00F1ol', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('pt', 'Portuguese', U&'Portugu\00EAs', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('nl', 'Dutch', 'Nederlands', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- Example for adding a regional variant later:
-- INSERT INTO "locales"
--   ("code", "name", "nativeName", "isEnabled", "isDefault", "isRtl", "createdAt", "updatedAt")
-- VALUES
--   ('fr-CA', 'Canadian French', U&'Fran\00E7ais canadien', true, false, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
-- ON CONFLICT ("code") DO NOTHING;
