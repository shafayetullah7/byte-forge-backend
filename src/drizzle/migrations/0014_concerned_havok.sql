-- 1. Drop the FK on user_local_auth_session that references user_local_auth(user_id)
ALTER TABLE "user_local_auth_session"
  DROP CONSTRAINT "user_local_auth_session_local_auth_id_user_local_auth_user_id_f";

-- 2. Drop the old PK on user_id
ALTER TABLE "user_local_auth" DROP CONSTRAINT "user_local_auth_pkey";

-- 3. Add id column as new PK
ALTER TABLE "user_local_auth" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "user_local_auth" ADD CONSTRAINT "user_local_auth_pkey" PRIMARY KEY ("id");

-- 4. Ensure user_id is unique
ALTER TABLE "user_local_auth" ADD CONSTRAINT "user_local_auth_user_id_unique" UNIQUE("user_id");

-- 5. Recreate the FK in user_local_auth_session (now referencing the UNIQUE user_id, not PK)
ALTER TABLE "user_local_auth_session"
  ADD CONSTRAINT "user_local_auth_session_local_auth_id_fkey"
  FOREIGN KEY ("local_auth_id") REFERENCES "user_local_auth"("user_id")
  ON DELETE CASCADE
  ON UPDATE NO ACTION;
