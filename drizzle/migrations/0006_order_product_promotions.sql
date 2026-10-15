ALTER TABLE public.orders
  ADD COLUMN product_name text,
  ADD COLUMN product_kind text,
  ADD COLUMN list_amount integer,
  ADD COLUMN discount_code text,
  ADD COLUMN discount_percent numeric,
  ADD COLUMN discount_amount integer,
  ADD COLUMN mp_coupon_amount numeric;
UPDATE public.orders SET product_name = product_title;
COMMENT ON COLUMN public.orders.discount_code IS 'Landing promotion identifier; not a Mercado Pago coupon or a second discount.';
COMMENT ON COLUMN public.orders.mp_coupon_amount IS 'Provider coupon amount reported by the verified payment, kept separate from the landing promotion.';
GRANT ALL ON public.orders TO service_role;