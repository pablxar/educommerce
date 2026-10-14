CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  product_id text NOT NULL,
  product_title text NOT NULL,
  module_ids text[] NOT NULL DEFAULT '{}',
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'CLP',
  status text NOT NULL DEFAULT 'pending',
  mp_preference_id text,
  mp_payment_id text,
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  campus_synced_at timestamptz
);
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX orders_pending_campus ON public.orders (paid_at) WHERE status = 'approved' AND campus_synced_at IS NULL;