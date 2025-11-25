-- Drop foreign key on logo_id first
ALTER TABLE "business_account" 
DROP CONSTRAINT IF EXISTS "business_account_logo_id_media_id_fk";

-- Alter columns in business_account_verification to UUID
ALTER TABLE "business_account_verification"
  ALTER COLUMN "trade_license_document" 
  SET DATA TYPE uuid
  USING (
    CASE 
      WHEN "trade_license_document" ~* '^[0-9a-fA-F0-9-]{36}$' 
      THEN "trade_license_document"::uuid
      ELSE NULL
    END
  );

ALTER TABLE "business_account_verification"
  ALTER COLUMN "tin_document" 
  SET DATA TYPE uuid
  USING (
    CASE 
      WHEN "tin_document" ~* '^[0-9a-fA-F0-9-]{36}$' 
      THEN "tin_document"::uuid
      ELSE NULL
    END
  );

ALTER TABLE "business_account_verification"
  ALTER COLUMN "other_supporting_document" 
  SET DATA TYPE uuid
  USING (
    CASE 
      WHEN "other_supporting_document" ~* '^[0-9a-fA-F0-9-]{36}$' 
      THEN "other_supporting_document"::uuid
      ELSE NULL
    END
  );

-- Re-add foreign key on logo_id
ALTER TABLE "business_account" 
  ADD CONSTRAINT "business_account_logo_id_media_id_fk"
  FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

-- Add foreign keys for the verification documents
ALTER TABLE "business_account_verification"
  ADD CONSTRAINT "business_account_verification_trade_license_document_media_id_fk"
  FOREIGN KEY ("trade_license_document") REFERENCES "public"."media"("id")
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "business_account_verification"
  ADD CONSTRAINT "business_account_verification_tin_document_media_id_fk"
  FOREIGN KEY ("tin_document") REFERENCES "public"."media"("id")
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

ALTER TABLE "business_account_verification"
  ADD CONSTRAINT "business_account_verification_other_supporting_document_media_id_fk"
  FOREIGN KEY ("other_supporting_document") REFERENCES "public"."media"("id")
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;
