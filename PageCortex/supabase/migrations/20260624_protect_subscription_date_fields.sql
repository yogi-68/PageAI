-- Extend billing field protection to subscription date columns
-- Migration: 20260624_protect_subscription_date_fields

CREATE OR REPLACE FUNCTION public.protect_billing_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = OLD.id AND auth.role() = 'authenticated' THEN
    IF NEW.plan IS DISTINCT FROM OLD.plan
       OR NEW.dodo_customer_id IS DISTINCT FROM OLD.dodo_customer_id
       OR NEW.dodo_subscription_id IS DISTINCT FROM OLD.dodo_subscription_id
       OR NEW.monthly_message_limit IS DISTINCT FROM OLD.monthly_message_limit
       OR NEW.max_pages_indexed IS DISTINCT FROM OLD.max_pages_indexed
       OR NEW.max_chatbots IS DISTINCT FROM OLD.max_chatbots
       OR NEW.api_access IS DISTINCT FROM OLD.api_access
       OR NEW.has_used_trial IS DISTINCT FROM OLD.has_used_trial
       OR NEW.addon_message_balance IS DISTINCT FROM OLD.addon_message_balance
       OR NEW.monthly_message_count IS DISTINCT FROM OLD.monthly_message_count
       OR NEW.subscription_started_at IS DISTINCT FROM OLD.subscription_started_at
       OR NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at
       OR NEW.billing_interval IS DISTINCT FROM OLD.billing_interval THEN
      RAISE EXCEPTION 'Billing fields cannot be updated directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
