import certificate from "@/assets/certificado-graficas.png.asset.json";

export function CertificateSection() {
  return (
    <section className="certificate-section" aria-labelledby="certificate-title">
      <div className="certificate-copy">
        <p className="certificate-eyebrow">CERTIFICADO EDUCOMMERCE</p>
        <h2 id="certificate-title">Lo que aprendes también se puede mostrar.</h2>
        <p className="certificate-description">
          Al completar tu formación, obtén tu certificado de finalización de Educommerce
          para sumar a tu CV, compartir en LinkedIn y acompañar tu portafolio.
        </p>
        <p className="certificate-note">Un reconocimiento a tu aprendizaje y dedicación.</p>
      </div>
      <figure className="certificate-visual">
        <img
          src={certificate.url}
          alt="Ejemplo de certificado de finalización de Gráficas Publicitarias de Educommerce"
          width={768}
          height={1088}
          loading="lazy"
        />
        <figcaption>Modelo de referencia · Diseño en desarrollo</figcaption>
      </figure>
    </section>
  );
}