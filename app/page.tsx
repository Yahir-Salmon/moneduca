const pilaresCurso = [
  {
    titulo: "Lecciones tipo Duolingo/Khan Academy",
    descripcion:
      "Módulos cortos con explicaciones claras, práctica guiada y microevaluaciones para aprender de forma progresiva.",
  },
  {
    titulo: "Actividades variables",
    descripcion:
      "Retos interactivos con distintos niveles de dificultad, ejemplos de la vida real y ejercicios aplicados al contexto de estudiantes.",
  },
  {
    titulo: "Sistema de progreso y reconocimientos",
    descripcion:
      "Rachas de estudio, puntos de experiencia, insignias y metas semanales para mantener la motivación y celebrar avances.",
  },
  {
    titulo: "Cuentas y multidispositivo",
    descripcion:
      "Acceso con log in / log out para que cada alumno continúe su aprendizaje desde distintos dispositivos.",
  },
]

export default function Home() {
  return (
    <main className="home">
      <header className="hero">
        <p className="tag">Lecciones de Finanzas para Mentes Jóvenes</p>
        <h1>Moneduca</h1>
        <p>
          Una plataforma de estudio y aprendizaje para estudiantes de secundaria,
          centrada en crear hábitos financieros saludables desde edades tempranas.
        </p>
      </header>

      <section className="card">
        <h2>¿Cómo nace Moneduca?</h2>
        <p>
          Este proyecto nace a partir de mirar a nuestro alrededor y percatarnos
          de que muchos de nuestros familiares y conocidos adultos enfrentaban
          múltiples problemas financieros: desde mal uso del crédito hasta la
          falta de una planificación de gastos.
        </p>
        <p>
          Esto nos hizo preguntarnos: ¿cómo podemos hacer que las personas
          construyan hábitos financieros saludables?
        </p>
        <p>
          De esta forma, nace Moneduca: Lecciones de Finanzas Para Mentes
          Jóvenes, un proyecto destinado a los estudiantes de educación
          secundaria para prevenir que, cuando sean adultos, enfrenten los
          mismos problemas que la actual población mayor de edad.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Objetivo</h2>
          <p>
            Fomentar la educación financiera en niños y jóvenes que cursen
            educación básica en Monterrey y San Nicolás, mediante talleres
            gratuitos y accesibles, con la finalidad de desarrollar habilidades
            económicas básicas que promuevan una toma de decisiones responsable
            y la reducción de desigualdades.
          </p>
        </article>

        <article className="card">
          <h2>Misión</h2>
          <p>
            Enseñar finanzas personales de forma práctica, sencilla y atractiva,
            para que cada estudiante construya una relación sana con el dinero y
            tome mejores decisiones desde hoy.
          </p>
        </article>

        <article className="card">
          <h2>Visión</h2>
          <p>
            Ser una referencia en educación financiera escolar en Nuevo León,
            impulsando una generación de jóvenes con mayor autonomía económica,
            pensamiento crítico y oportunidades de crecimiento.
          </p>
        </article>
      </section>

      <section className="card">
        <h2>Problemática a abordar</h2>
        <p>
          En México, según datos de la Encuesta Nacional Sobre Salud Financiera
          (ENSAFI), realizada en 2023 en todo el país, el 42.6% de encuestados
          mayores de 18 años de Nuevo León respondieron que tenían una forma de
          ahorro, cifra considerablemente inferior al promedio nacional, que se
          sitúa en 52.0%, considerando tanto ahorro formal como informal.
        </p>
        <p>
          Por otro lado, tan solo el 39.6% total de los encuestados sentían
          confianza para administrar su dinero día con día, y un 19.9% se sentía
          con confianza para tomar decisiones sobre productos financieros.
        </p>
        <p>
          Estos resultados apuntan a que aún hay bastantes áreas de oportunidad
          en cuanto a la difusión de la educación financiera en el estado de
          Nuevo León y en México.
        </p>
      </section>

      <section className="card">
        <h2>Curso tipo Duolingo/Khan Academy</h2>
        <p>
          El enfoque central de la página es funcionar como un espacio de estudio
          y aprendizaje para alumnos, con contenido dinámico y acompañado de
          práctica continua.
        </p>
        <div className="features">
          {pilaresCurso.map((pilar) => (
            <article key={pilar.titulo} className="featureItem">
              <h3>{pilar.titulo}</h3>
              <p>{pilar.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Actividad disponible</h2>
        <p>
          Inicia con una lección práctica sobre presupuesto para reforzar los
          conceptos fundamentales.
        </p>
        <a className="cta" href="/actividad">
          Ir a Actividad 1: Presupuesto
        </a>
      </section>

      <section className="card contactPlaceholder">
        <h2>Medios de contacto</h2>
        <p>
          Espacio reservado para agregar correo, redes sociales, WhatsApp,
          formulario o cualquier otro canal de comunicación del proyecto.
        </p>
      </section>
    </main>
  )
}
