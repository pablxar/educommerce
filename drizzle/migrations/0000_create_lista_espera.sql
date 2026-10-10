CREATE TABLE public.lista_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.lista_espera TO anon;
GRANT ALL ON public.lista_espera TO service_role;

ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede unirse a la lista de espera"
ON public.lista_espera
FOR INSERT
TO anon
WITH CHECK (true);