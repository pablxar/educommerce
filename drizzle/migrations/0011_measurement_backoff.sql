CREATE OR REPLACE FUNCTION public.claim_payment_measurements(requested_order uuid DEFAULT NULL) RETURNS SETOF public.payment_measurements LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
UPDATE public.payment_measurements m SET lease_until=now()+interval '90 seconds', attempts=m.attempts+1,
  next_check_at = now() + CASE WHEN o.created_at > now()-interval '2 hours' THEN interval '5 minutes' WHEN o.created_at > now()-interval '1 day' THEN interval '30 minutes' WHEN o.created_at > now()-interval '7 days' THEN interval '6 hours' ELSE interval '24 hours' END
FROM public.orders o
WHERE o.id=m.order_id AND m.order_id IN (
  SELECT x.order_id FROM public.payment_measurements x JOIN public.orders y ON y.id=x.order_id
  WHERE (requested_order IS NULL OR x.order_id=requested_order) AND y.created_at > now()-interval '30 days'
    AND (requested_order IS NOT NULL OR x.next_check_at<=now()) AND (x.lease_until IS NULL OR x.lease_until<now())
    AND x.verification_status NOT IN ('blocked','refunded')
    AND (x.verification_status <> 'verified' OR (x.meta_sent_at IS NULL AND x.meta_attempts<8 AND x.meta_status NOT IN ('consent_or_age_blocked') AND EXISTS (SELECT 1 FROM public.measurement_settings s WHERE s.real_conversions_enabled)))
  ORDER BY x.next_check_at LIMIT 3 FOR UPDATE OF x SKIP LOCKED)
RETURNING m.* $$;
REVOKE ALL ON FUNCTION public.claim_payment_measurements(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_measurements(uuid) TO service_role;