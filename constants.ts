import type { Feature, Solution, Service, FaqItem } from './types';
import {
  SparklesIcon,
  CogIcon,
  TrendingUpIcon,
  UsersIcon,
  PuzzleIcon,
  BriefcaseIcon,
  CubeTransparentIcon,
  ChartBarIcon,
  ChatAlt2Icon,
  PencilAltIcon,
  BookOpenIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CloudIcon,
  DeviceMobileIcon,
} from './components/IconComponents';

export const FEATURES: Feature[] = [
  {
    icon: SparklesIcon,
    title: 'Orquestación inteligente del aprendizaje',
    description: 'Harmony, nuestro motor de IA integrado, automatiza tareas, personaliza recorridos y conecta procesos para una experiencia de aprendizaje sin sobrecarga administrativa.',
  },
  {
    icon: CogIcon,
    title: 'Configuración sin límites',
    description: 'Ponga en marcha sus programas de formación rápidamente con un potente motor de configuración de arrastrar y soltar para crear páginas específicas para cada público.',
  },
  {
    icon: TrendingUpIcon,
    title: 'Éxito escalable y sostenible',
    description: 'Nuestra plataforma responde al aumento de las demandas al tiempo que reduce los gastos administrativos y maximiza la eficiencia con procesos impulsados por IA.',
  },
  {
    icon: UsersIcon,
    title: 'Involucre a cualquier público',
    description: 'Fomente el rendimiento y el crecimiento con experiencias hiperpersonalizadas impulsadas por la IA que cubren automáticamente las lagunas de cada alumno.',
  },
  {
    icon: PuzzleIcon,
    title: 'Optimice sus tecnologías de aprendizaje',
    description: 'Integre con sus tecnologías existentes para simplificar la gestión, reducir gastos y disfrutar de una experiencia de aprendizaje fluida y totalmente conectada.',
  },
];

export const SOLUTIONS: Solution[] = [
  {
    icon: BookOpenIcon,
    title: 'Gestión eficaz del aprendizaje',
    description: 'Herramientas robustas para gestionar y proporcionar experiencias de aprendizaje personalizadas a públicos diversos, en cualquier momento y lugar.',
  },
  {
    icon: SparklesIcon,
    title: 'Simplifíquelo todo con Harmony',
    description: 'Nuestro copiloto y motor de orquestación con IA, diseñado para agilizar búsquedas, gestión, creación de contenidos, automatización y asistencia.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Soluciones flexibles de comercio electrónico',
    description: 'Monetice fácilmente sus cursos con nuestras funciones de comercio electrónico, admitiendo varias monedas, catálogos, promociones y descuentos.',
  },
  {
    icon: CubeTransparentIcon,
    title: 'Mercado con distintos contenidos',
    description: 'Acceda a contenidos de e-learning líderes en el sector que cubren las habilidades más relevantes para cumplir normativas y obtener certificaciones.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Integración fluida',
    description: 'Conecte el aprendizaje a su ecosistema tecnológico sin problemas para mejorar experiencias, aumentar la eficacia y ampliar programas.',
  },
  {
    icon: ChartBarIcon,
    title: 'Información basada en datos',
    description: 'Obtenga información de gran valor con análisis exhaustivos. Realice un seguimiento de métricas, identifique tendencias y demuestre el impacto del aprendizaje.',
  },
  {
    icon: ChatAlt2Icon,
    title: 'Aprendizaje impulsado por la comunidad',
    description: 'Motive a los alumnos con herramientas que fomenten la colaboración, el intercambio de conocimientos y debates personalizados en tiempo real.',
  },
  {
    icon: PencilAltIcon,
    title: 'Cree contenido a escala',
    description: 'Cree al instante cursos, evaluaciones y simulaciones con nuestra intuitiva herramienta basada en IA, y llévelos a todo el mundo con traducciones instantáneas.',
  },
];

export const SERVICES: Service[] = [
    {
        category: "Servicios gestionados",
        items: [
            {
                title: "Migración",
                description: "Trasladamos sus datos de usuarios y cursos desde sistemas heredados o hojas de cálculo a TalentFlow, garantizando una migración sin fisuras."
            }
        ]
    },
    {
        category: "Servicios de consultoría",
        items: [
            {
                title: "Incorporación de productos",
                description: "Nuestros expertos guían a sus administradores a través de los pasos necesarios para cada producto, garantizando un lanzamiento exitoso y puntual."
            },
            {
                title: "Transición del personal",
                description: "Capacitamos a su nuevo administrador para una transición fluida, asegurando la continuidad de la experiencia de aprendizaje sin interrupciones."
            },
            {
                title: "Horas de servicios profesionales",
                description: "Proporcionamos asistencia especial para abordar sus prioridades de aprendizaje más críticas con nuestra oferta de servicios a su disposición."
            },
            {
                title: "Consultoría de API",
                description: "Analizamos sus flujos de trabajo de API para automatizar procesos, maximizando el rendimiento, la eficiencia y la precisión de sus integraciones."
            }
        ]
    },
    {
        category: "Servicios estratégicos",
        items: [
            {
                title: "Optimización del aprendizaje",
                description: "Realizamos un análisis profundo de su plataforma para recomendar y ejecutar cambios que aseguren el éxito a largo plazo de sus programas."
            },
            {
                title: "Gestor técnico de cuentas (TAM)",
                description: "Un experto técnico y estratégico colaborará con usted a largo plazo para ayudarle a obtener el máximo valor de su inversión en aprendizaje."
            }
        ]
    },
     {
        category: "Servicios de asistencia",
        items: [
            {
                title: "Asistencia Premier",
                description: "Ofrecemos paquetes integrales y escalonados de formación y asistencia para que su plataforma y su empresa puedan crecer sin interrupciones."
            }
        ]
    }
];

export const FAQS: FaqItem[] = [
  {
    question: '¿En qué se diferencia TalentFlow de otras plataformas de aprendizaje?',
    answer: 'TalentFlow es una plataforma creada para empresas, centrada en resultados tangibles. A diferencia de otras, optimizamos el aprendizaje para los objetivos de la organización, integrando automatizaciones, herramientas de datos y tecnologías de IA generativa, además de todas las funciones interactivas que el alumno necesita.',
  },
  {
    question: '¿Se puede utilizar TalentFlow para hacer un seguimiento del desarrollo profesional y mejorarlo?',
    answer: 'Sí, TalentFlow es ideal para el desarrollo profesional. Ofrece herramientas para mejorar habilidades, paneles de control para seguimiento de progreso y un coach de IA para simulaciones realistas que proporcionan comentarios instantáneos sobre métricas de rendimiento.',
  },
  {
    question: '¿Qué herramientas únicas ofrece TalentFlow para la creación de contenidos?',
    answer: 'TalentFlow se distingue por sus herramientas de IA que facilitan la creación de contenidos, permitiendo a los educadores generar cursos, evaluaciones y simulaciones rápidamente. También ofrecemos plantillas prediseñadas y acceso a más de 20,000 cursos de los principales proveedores del mundo.',
  },
  {
    question: '¿Cuántos idiomas admite el LMS Learn?',
    answer: 'TalentFlow le permite localizar sus programas de aprendizaje en más de 50 idiomas, garantizando la accesibilidad y ofreciendo la mejor formación para alcanzar sus objetivos globales.',
  },
  {
    question: '¿El LMS Learn tiene un límite de almacenamiento en la nube?',
    answer: 'No. A diferencia de otros proveedores, los planes de precios de TalentFlow incluyen almacenamiento en la nube ilimitado para apoyar sus programas de formación sin restricciones.',
  },
  {
    question: '¿TalentFlow se integra con proveedores de contenido de e-learning?',
    answer: '¡Por supuesto! El Mercado de contenidos de TalentFlow le ofrece acceso rápido y fácil a contenidos de formación en tiempo real de socios como TalentFlow Content y LinkedIn Learning.',
  }
];

export const TESTIMONIAL = {
  quote: "Gracias a nuestra colaboración con TalentFlow, podemos llevar a nuestros equipos de todo el mundo nuestras excelentes formaciones y los excepcionales estándares de nuestra marca para ofrecerles una experiencia más interesante y accesible que nunca.",
  author: "Mia Kernaghan",
  title: "Especialista Global en Educación Digital en Kiehl's",
  image: "https://picsum.photos/id/1027/100/100"
};