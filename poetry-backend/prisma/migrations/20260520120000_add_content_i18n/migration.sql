-- Add i18n JSON columns for multilingual content
ALTER TABLE "Author" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Poem" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Holiday" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "SeasonSlide" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Quiz" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "i18n" JSONB;
ALTER TABLE "Zone" ADD COLUMN IF NOT EXISTS "i18n" JSONB;

-- Backfill Belarusian locale from existing scalar fields
UPDATE "Author"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object('name', "name", 'bio', COALESCE("bio", ''))
)
WHERE "i18n" IS NULL;

UPDATE "Category"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object('name', "name", 'description', COALESCE("description", ''))
)
WHERE "i18n" IS NULL;

UPDATE "Poem"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object(
    'title', "title",
    'content', "content",
    'description', COALESCE("description", '')
  )
)
WHERE "i18n" IS NULL;

UPDATE "Holiday"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object('name', "name", 'description', COALESCE("description", ''))
)
WHERE "i18n" IS NULL;

UPDATE "SeasonSlide"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object('title', "title", 'subtitle', "subtitle", 'altText', "altText")
)
WHERE "i18n" IS NULL;

UPDATE "Quiz"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object('title', "title", 'description', COALESCE("description", ''))
)
WHERE "i18n" IS NULL;

UPDATE "Question"
SET "i18n" = jsonb_build_object('be', jsonb_build_object('text', "text"))
WHERE "i18n" IS NULL;

UPDATE "Item"
SET "i18n" = jsonb_build_object(
  'be', jsonb_build_object(
    'content', "content",
    'subtitle', COALESCE("subtitle", '')
  )
)
WHERE "i18n" IS NULL;

UPDATE "Zone"
SET "i18n" = jsonb_build_object('be', jsonb_build_object('content', "content"))
WHERE "i18n" IS NULL;
