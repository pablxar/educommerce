import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const waitlistSchema = z.object({
  nombre: z.string().trim().nonempty({ message: "Ingresa tu nombre" }).max(100, { message: "Máximo 100 caracteres" }),
  correo: z
    .string()
    .trim()
    .nonempty({ message: "Ingresa tu correo" })
    .email({ message: "Ingresa un correo válido" })
    .max(255, { message: "Máximo 255 caracteres" }),
  acepta: z.literal(true, { message: "Debes aceptar el uso de tu correo" }),
});

type Status = "idle" | "loading" | "success" | "duplicate";

export function WaitlistSection() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const parsed = waitlistSchema.safeParse({ nombre, correo, acepta });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Revisa los campos");
      return;
    }
    setError(null);
    setStatus("loading");
    const { error: insertError } = await supabase
      .from("lista_espera")
      .insert({ nombre: parsed.data.nombre, correo: parsed.data.correo.toLowerCase() });
    if (insertError) {
      if (insertError.code === "23505") {
        setStatus("duplicate");
      } else {
        setStatus("idle");
        setError("No pudimos guardar tu registro. Inténtalo de nuevo.");
      }
      return;
    }
    setStatus("success");
  }

  return (
    <section className="waitlist-section" aria-labelledby="waitlist-title">
      <div className="waitlist-card">
        <p className="eyebrow">LISTA DE ESPERA</p>
        <h2 id="waitlist-title">Sé de los primeros en entrar</h2>
        <p className="waitlist-subtitle">
          Déjanos tu correo y te avisamos apenas abran los módulos. Sin spam: solo el aviso de lanzamiento.
        </p>
        {status === "success" ? (
          <p className="waitlist-success" role="status">
            ¡Listo! Te avisaremos apenas abramos.
          </p>
        ) : status === "duplicate" ? (
          <p className="waitlist-success" role="status">
            Ya estás en la lista. Te avisaremos.
          </p>
        ) : (
          <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
            <div className="waitlist-fields">
              <label>
                <span className="sr-only">Nombre</span>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>
              <label>
                <span className="sr-only">Correo</span>
                <input
                  type="email"
                  name="correo"
                  placeholder="Tu correo"
                  autoComplete="email"
                  required
                  maxLength={255}
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </label>
            </div>
            <label className="waitlist-consent">
              <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} required />
              <span>Acepto que Educommerce use mi correo para avisarme del lanzamiento.</span>
            </label>
            {error && (
              <p className="waitlist-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={status === "loading"} className="waitlist-submit">
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> Enviando…
                </>
              ) : (
                "Unirme a la lista"
              )}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
