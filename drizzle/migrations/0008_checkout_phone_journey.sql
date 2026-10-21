ALTER TABLE public.checkout_leads ADD COLUMN phone text NOT NULL DEFAULT '';
ALTER TABLE public.checkout_leads ADD COLUMN session_id uuid;
ALTER TABLE public.orders ADD COLUMN phone text NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN session_id uuid;
CREATE TABLE public.site_activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 session_id uuid,
 event_type text NOT NULL,
 source_id uuid NOT NULL,
 payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 synced_at timestamptz,
 attempts integer NOT NULL DEFAULT 0,
 last_status integer,
 next_attempt_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.site_activity TO service_role;
ALTER TABLE public.site_activity ENABLE ROW LEVEL SECURITY;
CREATE INDEX site_activity_pending ON public.site_activity(next_attempt_at,created_at) WHERE synced_at IS NULL;
CREATE OR REPLACE FUNCTION public.preserve_checkout_stage() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF OLD.stage='pagado' OR (OLD.stage='pago_iniciado' AND NEW.stage='datos') THEN NEW.stage := OLD.stage; END IF;
 NEW.updated_at := now(); NEW.sync_revision := gen_random_uuid(); NEW.synced_at := NULL;
 RETURN NEW;
END; $$;
CREATE TRIGGER checkout_stage_monotonic BEFORE UPDATE ON public.checkout_leads FOR EACH ROW EXECUTE FUNCTION public.preserve_checkout_stage();
CREATE OR REPLACE FUNCTION public.queue_site_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_type text; v_session uuid; v_payload jsonb;
BEGIN
 v_payload := to_jsonb(NEW) - 'synced_at' - 'campus_synced_at' - 'sync_revision';
 IF TG_TABLE_NAME='checkout_leads' THEN
  IF TG_OP='UPDATE' AND ROW(NEW.email,NEW.name,NEW.phone,NEW.product_id,NEW.stage,NEW.order_id) IS NOT DISTINCT FROM ROW(OLD.email,OLD.name,OLD.phone,OLD.product_id,OLD.stage,OLD.order_id) THEN RETURN NEW; END IF;
  v_type := 'checkout_' || NEW.stage; v_session := NEW.session_id;
 ELSIF TG_TABLE_NAME='orders' THEN
  IF TG_OP='UPDATE' AND NEW.status IS NOT DISTINCT FROM OLD.status THEN RETURN NEW; END IF;
  v_type := 'order_' || NEW.status; v_session := NEW.session_id;
 ELSE v_type := 'contact_submitted'; v_session := NULL;
 END IF;
 INSERT INTO public.site_activity(session_id,event_type,source_id,payload) VALUES(v_session,v_type,NEW.id,v_payload);
 RETURN NEW;
END; $$;
CREATE TRIGGER checkout_activity AFTER INSERT OR UPDATE ON public.checkout_leads FOR EACH ROW EXECUTE FUNCTION public.queue_site_activity();
CREATE TRIGGER order_activity AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.queue_site_activity();
CREATE TRIGGER contact_activity AFTER INSERT ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.queue_site_activity();
CREATE OR REPLACE FUNCTION public.save_checkout_contact(p_id uuid,p_email text,p_name text,p_phone text,p_product_id text,p_product_name text,p_amount integer,p_attribution jsonb,p_session_id uuid) RETURNS void LANGUAGE sql SET search_path = public AS $$
 INSERT INTO public.checkout_leads(id,email,name,phone,product_id,product_name,amount,attribution,session_id)
 VALUES(p_id,p_email,p_name,p_phone,p_product_id,p_product_name,p_amount,p_attribution,p_session_id)
 ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,name=EXCLUDED.name,phone=EXCLUDED.phone,product_id=EXCLUDED.product_id,product_name=EXCLUDED.product_name,amount=EXCLUDED.amount,attribution=EXCLUDED.attribution
 WHERE checkout_leads.stage='datos';
$$;
REVOKE ALL ON FUNCTION public.save_checkout_contact(uuid,text,text,text,text,text,integer,jsonb,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_checkout_contact(uuid,text,text,text,text,text,integer,jsonb,uuid) TO service_role;
REVOKE ALL ON FUNCTION public.queue_site_activity() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.preserve_checkout_stage() FROM PUBLIC,anon,authenticated;