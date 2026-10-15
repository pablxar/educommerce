CREATE TABLE public.checkout_leads (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text NOT NULL DEFAULT '',
  product_id text NOT NULL,
  product_name text,
  amount integer,
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  stage text NOT NULL DEFAULT 'datos' CHECK (stage IN ('datos','pago_iniciado','pagado')),
  order_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz,
  sync_revision uuid NOT NULL DEFAULT gen_random_uuid()
);
CREATE INDEX checkout_leads_pending_idx ON public.checkout_leads (updated_at) WHERE synced_at IS NULL;
CREATE INDEX checkout_leads_order_idx ON public.checkout_leads (order_id);
GRANT ALL ON public.checkout_leads TO service_role;
ALTER TABLE public.checkout_leads ENABLE ROW LEVEL SECURITY;