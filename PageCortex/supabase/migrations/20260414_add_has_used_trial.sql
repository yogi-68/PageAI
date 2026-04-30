-- Migration: Add has_used_trial column to profiles
-- Purpose: Prevent trial abuse — each user gets ONE 7-day trial across all paid plans
-- Backend checks this before passing trial_period_days to Dodo Payments.
-- Dodo products themselves have NO trial period set (trial is fully controlled server-side).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.has_used_trial IS
  'Set to TRUE when the user first activates a paid subscription (via webhook subscription.active).
   Prevents trial abuse: subsequent subscriptions receive trial_period_days=0.
   Only Starter and Growth plans are eligible for the 7-day trial.';
