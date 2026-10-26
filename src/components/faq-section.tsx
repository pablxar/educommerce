import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  title: string;
  items: FaqItem[];
};

const faqGroups: FaqGroup[] = [
  {
    title: "Sobre Educommerce",
    items: [
      {
        question: "¿Qué es Educommerce y qué puedo aprender?",
        answer:
          "Educommerce es una plataforma de cursos online donde aprendes habilidades digitales para aplicarlas en tu negocio, tus proyectos o los servicios que quieras ofrecer. Encontrarás formación en e-commerce, publicidad digital, email marketing, creación de contenido y desarrollo web sin programación.",
      },
      {
        question: "¿Necesito experiencia previa para empezar?",
        answer:
          "Puedes comenzar desde cero. Los contenidos están organizados paso a paso para que conozcas las herramientas y avances hacia su aplicación práctica. En cada módulo podrás revisar su temario y los conocimientos previos que requiere, si corresponde.",
      },
      {
        question: "¿Las clases son en vivo o grabadas?",
        answer:
          "Las clases son grabadas, por lo que puedes organizar tu aprendizaje según tus horarios, pausar las explicaciones y volver a revisar los contenidos.",
      },
    ],
  },
  {
    title: "Compras y contenidos",
    items: [
      {
        question: "¿Puedo comprar un módulo por separado o tengo que comprar el programa completo?",
        answer:
          "Puedes elegir un módulo disponible por separado o acceder a Educommerce Plus, que incluye los 9 módulos. Plus ofrece un año de acceso desde $199.990, acceso de por vida por $219.990 y opciones con asesoría o acompañamiento grupal.",
      },
      {
        question: "¿Qué incluye cada módulo?",
        answer:
          "Cada módulo reúne clases organizadas en cápsulas sobre una habilidad digital. Según la formación, también puede incluir proyectos prácticos, plantillas, guías y recursos descargables. Puedes revisar lo que incluye antes de comprar.",
      },
    ],
  },
  {
    title: "Aplicar lo aprendido",
    items: [
      {
        question: "¿Me sirve si ya tengo un negocio?",
        answer:
          "Sí. Puedes aplicar lo aprendido para crear o mejorar tu tienda online, desarrollar campañas publicitarias, preparar contenido o trabajar el email marketing de tu negocio. También puedes enfocarte únicamente en la habilidad que necesitas fortalecer.",
      },
      {
        question: "¿Puedo aplicar lo aprendido aunque todavía no tenga un negocio?",
        answer:
          "Sí. Puedes comenzar con un proyecto de práctica y construir ejemplos de tu trabajo. Eso te permite ganar experiencia con las herramientas y preparar un portafolio para presentar tus habilidades.",
      },
      {
        question: "¿Educommerce garantiza que voy a generar ingresos?",
        answer:
          "No garantizamos ingresos ni trabajo. Te entregamos formación y herramientas para desarrollar habilidades que puedes aplicar a un negocio o a la prestación de servicios. Los resultados dependen de tu práctica, dedicación, experiencia y las oportunidades que encuentres.",
      },
    ],
  },
  {
    title: "Certificados",
    items: [
      {
        question: "¿Recibiré un certificado al terminar?",
        answer:
          "Al completar los contenidos requeridos de un módulo, podrás obtener un certificado de finalización de Educommerce. Si completas todos los módulos de tu programa, podrás obtener el certificado correspondiente al programa.",
      },
      {
        question: "¿Qué acredita el certificado de Educommerce?",
        answer:
          "Acredita que completaste la formación indicada. Es un certificado emitido por Educommerce; no equivale a un título universitario ni garantiza experiencia profesional o contratación.",
      },
    ],
  },
  {
    title: "Oportunidades",
    items: [
      {
        question: "¿Cómo funciona la sección de oportunidades?",
        answer:
          "Empresas, negocios y personas podrán publicar proyectos relacionados con las habilidades que se enseñan en Educommerce. Podrás revisar sus requisitos y presupuesto, y postular presentando tu perfil, certificados y ejemplos de trabajo.",
      },
      {
        question: "¿Necesito un certificado para postular a los proyectos?",
        answer:
          "Dependerá de los requisitos de cada publicación. Algunos proyectos podrán solicitar una formación específica y otros valorarán principalmente tu portafolio, experiencia y propuesta.",
      },
      {
        question: "¿Tener un certificado me asegura conseguir un proyecto?",
        answer:
          "No. El certificado permite mostrar la formación que completaste, pero quien publica el proyecto decide a quién seleccionar. Un portafolio con ejemplos de tu trabajo también ayuda a presentar lo que sabes hacer.",
      },
    ],
  },
];

export function FaqSection() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  return (
    <section id="preguntas-frecuentes" className="faq-section" aria-labelledby="faq-title">
      <h2 id="faq-title" className="section-heading">
        Preguntas frecuentes
      </h2>
      <p className="section-subtitle">Resolvemos las dudas más comunes antes de empezar.</p>
      <div className="faq-groups">
        {faqGroups.map((group) => (
          <details
            className="faq-group"
            key={group.title}
            open={openGroup === group.title}
          >
            <summary
              onClick={(event) => {
                event.preventDefault();
                setOpenGroup(openGroup === group.title ? null : group.title);
              }}
            >
              <span>{group.title}</span>
              <ChevronDown className="faq-chevron" aria-hidden="true" />
            </summary>
            <div className="faq-items">
              {group.items.map((item) => (
                <details className="faq-item" key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <ChevronDown className="faq-chevron" aria-hidden="true" />
                  </summary>
                  <p className="faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
