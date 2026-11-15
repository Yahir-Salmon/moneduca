'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Language = 'es' | 'en'

// Los textos se mantienen en español como idioma fuente. Si falta una cadena,
// se muestra el original en vez de ocultar el contenido o generar una traducción falsa.
const english: Record<string, string> = {
  'Te enviamos un email de confirmación a': 'We sent a confirmation email to',
  'Confírmalo y luego inicia sesión.': 'Confirm it, then sign in.',
  'Enviar mensaje ✦': 'Send message ✦',
  'Abrir menú': 'Open menu',
  'Verificando tu cuenta...': 'Verifying your account...',
  'En un momento te llevamos a tu dashboard': 'Taking you to your dashboard shortly',
  'Cursos': 'Courses',
  'Biblioteca': 'Library',
  'Nosotros': 'About us',
  'Contacto': 'Contact',
  'Mi cuenta': 'My account',
  'Mi perfil': 'My profile',
  'Salir': 'Sign out',
  'Cerrar sesión': 'Sign out',
  'Empezar gratis': 'Get started free',
  'Crear cuenta': 'Create account',
  'Iniciar sesión': 'Sign in',
  'Tu dinero,': 'Your money,',
  'tus reglas.': 'your rules.',
  'Aprende hoy.': 'Start learning today.',
  'Ver módulos': 'Explore courses',
  'Tu progreso esta semana': 'Your progress this week',
  'Ejemplo de tu avance': 'A preview of your progress',
  'Hola, soy Monedoki.': 'Hi, I’m Monedoki.',
  'Aprende a manejar tu dinero.': 'Learn how to manage your money.',
  'Aprende a organizar tus gastos, ahorrar y entender cómo funciona el dinero. Lecciones cortas, ejercicios prácticos y Monedoki para resolver tus dudas.': 'Learn to plan your spending, save, and understand how money works. Short lessons, hands-on activities, and Monedoki to answer your questions.',
  'módulos': 'modules',
  'gratuito': 'free',
  'por unidad': 'per lesson',
  'Lo que aprenderás': 'What you’ll learn',
  '6 módulos para dominar tu dinero': 'Six ways to understand your money',
  'Desde la historia del dinero hasta cómo protegerte de estafas. Todo lo que necesitas.': 'From the history of money to protecting yourself against scams.',
  'Básico': 'Beginner',
  'Intermedio': 'Intermediate',
  'Avanzado': 'Advanced',
  'Ver módulo': 'Explore module',
  'Bases: Historia del dinero': 'Foundations: History of money',
  'Presupuesto y ahorro': 'Budgeting and saving',
  'Inversiones': 'Investing',
  'Tarjetas de crédito y débito': 'Credit and debit cards',
  'Impuestos': 'Taxes',
  'Estafas y seguros': 'Scams and insurance',
  'Descubre cómo nació el dinero, por qué existe y cómo ha cambiado el mundo.': 'Discover where money came from, why it exists, and how it changed the world.',
  'Aprende a organizar tu dinero y crear el hábito del ahorro desde hoy.': 'Learn to manage your money and build a habit of saving.',
  'Haz que tu dinero trabaje para ti. CETES, interés compuesto y más.': 'Learn about government bonds, compound interest, and more.',
  'Usa el plástico a tu favor sin caer en deudas ni intereses.': 'Understand cards without getting trapped by debt or interest.',
  'Entiende qué son, para qué sirven y cómo funcionan en México.': 'Understand what taxes are and how they work in Mexico.',
  'Protégete de fraudes financieros y aprende qué es un seguro.': 'Protect yourself against fraud and learn the basics of insurance.',
  'Tu compañero de aprendizaje': 'Your learning companion',
  'Monedoki te acompaña en cada lección': 'Learn alongside Monedoki',
  'Aprende con preguntas interactivas, feedback inmediato y la compañía de Monedoki. Te celebra cuando aciertas y te anima cuando te equivocas.': 'Learn through interactive questions and instant feedback, with Monedoki by your side every step of the way.',
  'Conocer a Monedoki': 'Meet Monedoki',
  'Asistente financiero': 'Financial assistant',
  'Pregúntale a Monedoki lo que quieras': 'Ask Monedoki about money',
  'Monedoki no solo aparece en las lecciones — también puede resolver tus dudas financieras en cualquier momento, con lenguaje fácil y ejemplos de tu vida diaria.': 'Monedoki can explain financial concepts whenever you need, using everyday examples and clear language.',
  'Explica conceptos difíciles en palabras simples': 'Explains complex ideas in simple words',
  'Responde dudas de tus lecciones al instante': 'Answers questions from your lessons',
  'Ejemplos con situaciones cotidianas mexicanas': 'Uses relatable examples from Mexico',
  'Disponible las 24 horas del día': 'Available any time',
  'Cómo funciona': 'How it works',
  'Empieza en 4 pasos sencillos': 'Get started in four steps',
  'Crea tu cuenta gratis': 'Create your free account',
  'Sin tarjeta de crédito. Solo regístrate con tu email.': 'No credit card needed. Just use your email.',
  'Elige tu módulo': 'Choose a module',
  'Empieza por donde quieras. Cada unidad dura 15 minutos.': 'Start wherever you like. Lessons take about 15 minutes.',
  'Aprende con Monedoki': 'Learn with Monedoki',
  'Preguntas interactivas, feedback inmediato y progreso real.': 'Interactive questions, immediate feedback, real progress.',
  'Pregúntale al chat': 'Ask the assistant',
  'Monedoki responde tus dudas financieras cuando quieras.': 'Monedoki answers your money questions.',
  '¿Listo para': 'Ready to',
  'dominar': 'understand',
  'tu dinero?': 'your money?',
  'Únete gratis hoy. Sin tarjeta, sin compromisos.': 'Join for free. No card, no commitments.',
  'Crear mi cuenta gratis': 'Create my free account',
  'Tu camino hacia la libertad financiera empieza aquí': 'Your financial journey starts here',
  '¿Cómo te llamas?': 'What’s your name?',
  '¿Cuántos años tienes?': 'How old are you?',
  'Tu email': 'Your email',
  'Contraseña': 'Password',
  'Mínimo 8 caracteres': 'At least 8 characters',
  'Crear mi cuenta': 'Create my account',
  'Cargando...': 'Loading...',
  'Cuenta creada': 'Account created',
  '¡Cuenta creada!': 'Account created!',
  'Ir a iniciar sesión': 'Go to sign in',
  'o continúa con': 'or continue with',
  'Continuar con Google': 'Continue with Google',
  'Al crear una cuenta aceptas nuestros': 'By creating an account, you accept our',
  'Términos': 'Terms',
  'Privacidad': 'Privacy',
  'Ya existe una cuenta con ese email.': 'An account with this email already exists.',
  'Hubo un error al crear tu cuenta. Intenta de nuevo.': 'We couldn’t create your account. Please try again.',
  'Completa tu nombre y una edad válida.': 'Please enter your name and a valid age.',
  'No se pudo iniciar sesión. Revisa tus datos y confirma tu correo si es necesario.': 'Could not sign in. Check your credentials and confirm your email if needed.',
  'No pudimos conectar con Google. Intenta de nuevo.': 'Could not connect to Google. Please try again.',
  'Escríbenos': 'Write to us',
  '¿Tienes dudas?': 'Have a question?',
  '¡Hablemos!': 'Let’s talk!',
  'Estamos aquí para ayudarte. Ya sea que tengas una duda sobre un curso, quieras sugerir un tema o simplemente saludes — escríbenos.': 'We’re here to help. Ask about a course, suggest a topic, or simply say hello.',
  'Email': 'Email',
  'Tiempo de respuesta': 'Response time',
  'Respondemos en menos de 24 horas': 'We usually reply within 24 hours',
  '¿Dudas financieras?': 'Money questions?',
  'Usa nuestro chatbot en la página principal — disponible 24/7': 'Ask our financial assistant on the home page',
  'Tu nombre': 'Your name',
  'Mensaje': 'Message',
  'Enviar mensaje': 'Send message',
  'Enviando...': 'Sending...',
  '¡Mensaje enviado!': 'Message sent!',
  'Te responderemos pronto a tu correo. ¡Mientras tanto explora nuestros cursos!': 'We’ll reply to your email soon. In the meantime, explore our courses!',
  'Biblioteca de cursos': 'Course library',
  'Todo lo que aprenderás': 'Everything you can learn',
  'en Moneduca': 'at Moneduca',
  'unidades de aprendizaje. Cada módulo está diseñado para jóvenes de secundaria con ejemplos de la vida real.': 'learning units. Each module uses practical examples designed for secondary-school students.',
  'Para acceder a las lecciones, inicia sesión y ve a': 'To access the lessons, sign in and go to',
  'Módulo': 'Module',
  'Unidad': 'Unit',
  'unidades · Aprende a tu ritmo': 'units · Learn at your own pace',
  'Material de estudio': 'Study materials',
  'Lee el contenido de cada unidad sin presiones. Repasa lo que necesites antes de practicar.': 'Read through each lesson at your own pace. Review the material before you practice.',
  'Leer': 'Read',
  'Nuestra historia': 'Our story',
  'Nacimos para que el': 'We’re here to make',
  'dinero': 'money',
  'deje de ser un misterio': 'less of a mystery',
  'Moneduca es una plataforma de educación financiera creada para jóvenes que quieren tomar el control de su futuro.': 'Moneduca is a financial education platform for young people who want to take control of their future.',
  'Nuestra misión': 'Our mission',
  'Queremos que cada joven en México tenga las herramientas para tomar decisiones financieras inteligentes. No importa cuánto dinero tengas hoy — lo importante es saber cómo usarlo, ahorrarlo y hacerlo crecer. Eso es lo que enseñamos en Moneduca.': 'We want every young person in Mexico to have the tools to make informed financial decisions. What matters is learning how to use, save, and grow the money you have.',
  'Nuestros valores': 'Our values',
  'Accesible': 'Accessible',
  'Simple': 'Simple',
  'Práctico': 'Practical',
  'Para ti': 'Made for you',
  'Creemos que la educación financiera no debe ser un privilegio. Por eso Moneduca es gratis.': 'Financial education should not be a privilege. That’s why Moneduca is free.',
  'Nada de términos complicados. Explicamos todo con ejemplos de la vida real.': 'No complicated jargon. We use examples from everyday life.',
  'Cada lección incluye ejercicios que puedes aplicar en tu vida hoy mismo.': 'Each lesson includes activities you can use today.',
  'Diseñado específicamente para jóvenes mexicanos de secundaria.': 'Designed specifically for Mexican secondary-school students.',
  'El': 'The',
  'problema': 'problem',
  'que queremos resolver': 'we want to solve',
  'En México, la educación financiera casi no existe en la escuela. Millones de jóvenes llegan a la adultez sin saber cómo hacer un presupuesto, qué es el interés compuesto, o por qué importa tener un fondo de emergencia.': 'In Mexico, financial education is rarely taught in schools. Many young people enter adulthood without knowing how to budget, what compound interest is, or why an emergency fund matters.',
  'Las consecuencias son reales: deudas impagables, falta de ahorro, decisiones financieras malas que se arrastran toda la vida. Creemos que eso puede cambiar — y que el mejor momento para aprender es ahora, cuando eres joven.': 'The consequences are real: unmanageable debt, little savings, and poor financial decisions. We believe this can change, starting with learning while you’re young.',
  'Aprende': 'Learn',
  'Todos los módulos': 'All modules',
  'Presupuesto': 'Budgeting',
  'Inversión': 'Investing',
  'Quiénes somos': 'Who we are',
  'Legal': 'Legal',
  'Términos de uso': 'Terms of use',
  'Todos los derechos reservados.': 'All rights reserved.',
  'Educación financiera para jóvenes mexicanos.': 'Financial education for young people in Mexico.',
  'Educación financiera accesible para jóvenes de secundaria. Aprende a manejar tu dinero desde hoy.': 'Accessible financial education for middle-school students. Start making sense of money today.',
  '¿Qué es un presupuesto?': 'What is a budget?',
  '¿Cómo empiezo a ahorrar?': 'How can I start saving?',
  '¿Qué es la tasa de interés?': 'What is an interest rate?',
  'Pregúntale algo a Monedoki...': 'Ask Monedoki a question...',
  'Escribe tu pregunta para Monedoki': 'Write your question for Monedoki',
  'Asistente financiero de Moneduca': 'Moneduca financial assistant',
  'Activar modo claro': 'Switch to light mode',
  'Activar modo oscuro': 'Switch to dark mode',
  'Cambiar idioma a inglés': 'Switch language to English',
  'Switch language to Spanish': 'Switch language to Spanish',
  'Cargando cursos...': 'Loading courses...',
  'Cargando biblioteca...': 'Loading library...',
  'Hola': 'Hi',
  'Estudiante': 'Student',
  'Continúa aprendiendo': 'Keep learning',
  'Tu primera lección te espera.': 'Your first lesson is waiting.',
  'Logros': 'Achievements',
  'Certificados': 'Certificates',
  'Volver': 'Back',
  'Unidades completadas': 'Completed units',
  'Módulos terminados': 'Completed modules',
  'Días seguidos': 'Days in a row',
}

type LanguageContextValue = {
  language: Language
  setLanguage: (value: Language) => void
  t: (spanish: string) => string
}


/**
 * Translates content returned by Supabase while keeping the original Spanish
 * values in state. Quiz comparison and progress tracking always use originals.
 */
const translatedCache = new Map<string, string>()
const pending = new Set<string>()
const listeners = new Set<() => void>()
let requestScheduled = false

function announceTranslation() {
  listeners.forEach(listener => listener())
}

function scheduleTranslation(text: string) {
  if (!text.trim() || text.length > 1800 || translatedCache.has(text)) return
  pending.add(text)
  if (requestScheduled) return
  requestScheduled = true
  window.setTimeout(async () => {
    requestScheduled = false
    const requested = Array.from(pending).slice(0, 20)
    requested.forEach(item => pending.delete(item))
    if (!requested.length) return
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: requested }),
      })
      if (!response.ok) throw new Error('Translation request failed')
      const data: { translations?: unknown } = await response.json()
      if (!Array.isArray(data.translations) || data.translations.length !== requested.length) {
        throw new Error('Unexpected response')
      }
      requested.forEach((item, index) => {
        const translated = data.translations?.[index]
        if (typeof translated === 'string' && translated.trim()) {
          translatedCache.set(item, translated)
        }
      })
      announceTranslation()
    } catch {
      // Remain readable in Spanish if the translation service is offline.
    }
    if (pending.size) {
      const first = pending.values().next().value
      if (typeof first === 'string') scheduleTranslation(first)
    }
  }, 60)
}

export function useTranslatedText(text: string | null | undefined): string {
  const { language, t } = useLanguage()
  const original = text ?? ''
  const [translated, setTranslated] = useState<string | null>(null)
  useEffect(() => {
    if (language !== 'en' || !original || t(original) !== original) {
      setTranslated(null)
      return
    }
    const refresh = () => setTranslated(translatedCache.get(original) ?? null)
    refresh()
    listeners.add(refresh)
    scheduleTranslation(original)
    return () => { listeners.delete(refresh) }
  }, [language, original, t])
  if (language === 'es') return original
  const known = t(original)
  return known !== original ? known : translatedCache.get(original) ?? translated ?? original
}

export function Trans({ text }: { text: string | null | undefined }) {
  return <>{useTranslatedText(text)}</>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  useEffect(() => {
    const saved = window.localStorage.getItem('moneduca-language')
    if (saved === 'en') setLanguageState('en')
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    window.localStorage.setItem('moneduca-language', next)
  }

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (spanish) => language === 'en' ? (english[spanish] ?? spanish) : spanish,
  }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
