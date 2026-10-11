ALTER TABLE public.newsletter_subscribers ADD COLUMN name text, ADD COLUMN source text NOT NULL DEFAULT 'newsletter-footer', ADD COLUMN synced_at timestamptz, ADD COLUMN sync_revision uuid NOT NULL DEFAULT gen_random_uuid();
CREATE TABLE public.newsletter_name_receipts (token uuid PRIMARY KEY DEFAULT gen_random_uuid(), subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.newsletter_name_receipts TO service_role;
ALTER TABLE public.newsletter_name_receipts ENABLE ROW LEVEL SECURITY;
CREATE INDEX newsletter_pending_sync ON public.newsletter_subscribers(created_at) WHERE synced_at IS NULL;