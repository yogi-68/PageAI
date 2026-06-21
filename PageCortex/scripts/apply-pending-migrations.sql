-- Apply pending production migrations (run in Supabase SQL Editor, in order)
-- Verify after: SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'profiles' AND column_name LIKE 'subscription%';

\i supabase/migrations/20260512_api_integrations.sql
\i supabase/migrations/20260622_protect_billing_profile_fields.sql
\i supabase/migrations/20260623_subscription_dates.sql
\i supabase/migrations/20260624_protect_subscription_date_fields.sql
