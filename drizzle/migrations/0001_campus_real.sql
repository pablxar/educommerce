CREATE TYPE public.app_role AS ENUM ('admin', 'alumno');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Ver roles propios o admin" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  apellido TEXT NOT NULL DEFAULT '',
  correo TEXT NOT NULL DEFAULT '',
  pais TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver perfil propio o admin" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Editar perfil propio" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, correo)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.email, ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'alumno');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.accesos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id)
);
GRANT SELECT, INSERT, DELETE ON public.accesos TO authenticated;
GRANT ALL ON public.accesos TO service_role;
ALTER TABLE public.accesos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver accesos propios o admin" ON public.accesos FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin otorga accesos" ON public.accesos FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin quita accesos" ON public.accesos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.progreso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_id TEXT NOT NULL,
  capsula INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, module_id, capsula)
);
GRANT SELECT, INSERT, DELETE ON public.progreso TO authenticated;
GRANT ALL ON public.progreso TO service_role;
ALTER TABLE public.progreso ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ver progreso propio o admin" ON public.progreso FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Marcar progreso propio con acceso" ON public.progreso FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.accesos a WHERE a.user_id = auth.uid() AND a.module_id = progreso.module_id));
CREATE POLICY "Desmarcar progreso propio" ON public.progreso FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.lista_espera TO authenticated;
CREATE POLICY "Admin ve lista de espera" ON public.lista_espera FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));