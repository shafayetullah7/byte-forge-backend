ALTER TABLE "shops"
ALTER COLUMN "is_verified" DROP DEFAULT;

ALTER TABLE "shops"
ALTER COLUMN "is_verified"
SET DATA TYPE boolean
USING is_verified::boolean;

ALTER TABLE "shops"
ALTER COLUMN "is_verified"
SET DEFAULT false;