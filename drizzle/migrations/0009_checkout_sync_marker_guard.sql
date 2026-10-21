CREATE OR REPLACE FUNCTION public.preserve_checkout_stage() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF ROW(NEW.email,NEW.name,NEW.phone,NEW.product_id,NEW.stage,NEW.order_id,NEW.attribution) IS NOT DISTINCT FROM ROW(OLD.email,OLD.name,OLD.phone,OLD.product_id,OLD.stage,OLD.order_id,OLD.attribution) THEN RETURN NEW; END IF;
 IF OLD.stage='pagado' OR (OLD.stage='pago_iniciado' AND NEW.stage='datos') THEN NEW.stage := OLD.stage; END IF;
 NEW.updated_at := now(); NEW.sync_revision := gen_random_uuid(); NEW.synced_at := NULL;
 RETURN NEW;
END; $$;