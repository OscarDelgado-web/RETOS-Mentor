export interface CareerCatalog {
  id: string;
  backendId?: number;
  nombre: string;
  jornada: string[];
  objetivos: {
    general: string;
    especificos: string[];
  };
  competencias: string[];
  ocupaciones: string[];
  materias: string[];
}

export const CAREERS_CATALOG: CareerCatalog[] = [
  {
    id: 'desarrollo-software',
    backendId: 1,
    nombre: 'Técnico Superior en Desarrollo de Software',
    jornada: [
      'Campus 1: Semi presencial (Diurna y Nocturna)',
      'Desarrollo Dual',
    ],
    objetivos: {
      general:
        'Formar ingenieros en desarrollo de software altamente capacitados y competentes que, mediante el uso de tecnologías avanzadas y prácticas de ingeniería innovadoras, contribuyan al desarrollo tecnológico y mejoren la competitividad de las industrias a nivel global.',
      especificos: [
        'Aplicar prácticas y principios disciplinados de ingeniería de software al diseño, arquitectura, desarrollo, análisis, pruebas y mantenimiento de sistemas de software complejos para satisfacer las necesidades de la industria y dentro de restricciones realistas.',
        'Identificar, formular y resolver problemas de ingeniería mediante software informático.',
        'Contribuir con su experiencia a la solución de problemas aplicados, colaborando y comunicándose efectivamente con otras partes interesadas en equipos multidisciplinarios.',
        'Adaptarse a los rápidos avances en las herramientas, tecnologías, principios y prácticas de la informática y la ingeniería de software.',
      ],
    },
    competencias: [
      'Desarrolla software en diversos ambientes de producción para productos de tipo consola, desktop, web y móviles y API’s.',
      'Administra bases de datos de manera eficiente, asegurando la integridad, disponibilidad y seguridad de la información almacenada, para satisfacer las necesidades de la organización.',
      'Atiende las solicitudes y necesidades de los clientes de manera efectiva, ofreciendo soluciones y respuestas claras y precisas para garantizar su satisfacción y fidelización.',
      'Gestiona recursos en la nube para desarrolladores, optimizando la infraestructura y los servicios para facilitar el desarrollo y despliegue de aplicaciones y servicios.',
      'Establece políticas de seguridad de la información de forma exhaustiva, implementando medidas y controles para proteger los datos y la infraestructura de posibles amenazas y vulnerabilidades.',
      'Fomenta la innovación y el desarrollo en nuevas tecnologías, explorando y adoptando nuevas herramientas y metodologías para mantenerse actualizado y competitivo en el mercado.',
      'Implementa soluciones de inteligencia artificial de manera precisa, desarrollando algoritmos y modelos que mejoren procesos y toma de decisiones en diferentes ámbitos.',
      'Gobierna las tecnologías de la información de forma integral, estableciendo políticas y procesos que aseguren su alineación con los objetivos estratégicos de la organización y su correcto funcionamiento.',
      'Automatiza servicios de manera eficiente, desarrollando procesos y scripts que optimicen tareas repetitivas y mejoren la eficiencia operativa de la organización.',
      'Realiza auditorías de forma rigurosa, evaluando y verificando el cumplimiento de normativas, estándares y procedimientos para garantizar la integridad y seguridad de los sistemas y datos.',
      'Mantiene sitios web de manera constante, aplicando buenas prácticas de diseño y programación para ofrecer una experiencia óptima al usuario y garantizar su funcionamiento continuo.',
      'Analiza datos de forma exhaustiva, utilizando herramientas y técnicas estadísticas para identificar patrones, tendencias y oportunidades que permitan la toma de decisiones informadas y estratégicas.',
    ],
    ocupaciones: [
      'Desarrollador de Software',
      'Analista de Sistemas',
      'Ingeniero de Software',
      'Gestor de Proyectos de TI',
      'Especialista en Seguridad Informática',
      'Consultor Tecnológico',
      'Arquitecto de Software',
    ],
    materias: [
      'Planes de Negocio y Emprendedurismo',
      'Diseño de Bases de Datos II',
      'Gestión de la Seguridad Informática',
      'Desarrollo FrontEnd I',
      'Desarrollo de BackEnd',
      'Desarrollo de Programación Orientada a Objetos y Gestión de Código con Git',
      'Inglés',
      'Matemática',
      'Seguridad Ocupacional',
      'Competencia Ciudadana',
    ],
  },
  {
    id: 'operaciones-mantenimiento-industrial',
    backendId: 3,
    nombre: 'Técnico Superior en Operaciones y Mantenimiento Industrial',
    jornada: [
      'Campus 1: Diurna',
      'Modalidad Dual: Formación académica en conjunto con empresas',
    ],
    objetivos: {
      general:
        'Formar técnicos superiores capaces de gestionar, supervisar y ejecutar el mantenimiento predictivo, preventivo y correctivo en plantas industriales automatizadas, optimizando la disponibilidad y confiabilidad operativa.',
      especificos: [
        'Diagnosticar fallas y mantener sistemas electromecánicos y de control de procesos.',
        'Aplicar normas de seguridad ocupacional y calidad industrial en ambientes de manufactura y energía.',
        'Implementar mejoras de eficiencia energética y operativa en líneas de producción.',
      ],
    },
    competencias: [
      'Configurar y supervisar sistemas de control automatizados.',
      'Diagnosticar el estado de funcionamiento de los diferentes circuitos e instrumentos de mando en los sistemas de control automatizados.',
      'Corregir fallas en máquinas eléctricas y sistemas de control automatizados.',
      'Realizar el montaje y el desmontaje de componentes eléctricos, electrónicos, electroneumáticos, electrohidráulicos, de una maquinaria y sistemas de control en procesos automatizados.',
      'Ejecutar el mantenimiento preventivo y correctivo de maquinaria y sistemas de control en procesos automatizados.',
    ],
    ocupaciones: [
      'Supervisor de Mantenimiento de Equipo Electrónico',
      'Técnico de Mantenimiento de Equipo Electrónico',
      'Técnico en Sistemas de Control Automático',
      'Técnico Instrumentista',
      'Supervisor de Proyectos de Montaje de Maquinaria Industrial',
    ],
    materias: [
      'Planes de Negocio y Emprendedurismo',
      'Ejecución de Técnicas de Mantenimiento Preventivo',
      'Aplicación de Soldadura y Fabricación de Piezas con Máquinas Herramientas y CNC',
      'Inglés',
      'Competencias Ciudadanas',
      'Instrumentos',
      'Operaciones',
      'Hidráulica',
      'Fundamentos Aplicados',
    ],
  },
  {
    id: 'mecatronica',
    backendId: 4,
    nombre: 'Técnico Superior en Mecatrónica',
    jornada: ['Campus 1: Presencial'],
    objetivos: {
      general:
        'Formar profesionales técnicos multidisciplinarios que integren mecánica de precisión, electrónica de potencia y control computarizado para optimizar y diseñar sistemas automatizados y robóticos.',
      especificos: [
        'Diseñar e integrar soluciones mecánicas, electrónicas y de software en procesos industriales.',
        'Supervisar la operación y puesta en marcha de celdas robotizadas y líneas de ensamble.',
        'Contribuir a la innovación tecnológica y adopción de tecnologías de la Industria 4.0.',
      ],
    },
    competencias: [
      'Planificar la ejecución del mantenimiento preventivo y correctivo de maquinarias y sistemas de control en procesos automatizados.',
      'Planificar y supervisar el montaje e instalación de maquinarias y sistemas de control en procesos automatizados.',
      'Modificar el sistema mecánico, eléctrico y electrónico de maquinarias y sistemas de control en procesos automatizados.',
      'Diseñar maquinarias y sistemas de control en procesos automatizados de acuerdo a las necesidades de la industria.',
      'Gestar empresas de alta tecnología.',
      'Diseñar, simular y controlar procesos de fabricación por medio de software.',
      'Supervisar líneas de producción automatizadas y control de calidad de insumos.',
      'Contribuir con los procesos de formación profesional y tecnología dentro de las empresas.',
    ],
    ocupaciones: [
      'Jefe de Departamento de Mantenimiento Eléctrico o Mecánico',
      'Consultor de Proyectos de Innovación Tecnológica',
      'Jefe de Líneas Automatizadas de Producción',
      'Contratista',
      'Jefe de Taller de Control Numérico Computarizado (C.N.C.)',
      'Gerente de Producción',
    ],
    materias: [
      'Planes de Negocio y Emprendedurismo',
      'Electrohidráulica Digital',
      'Inglés',
      'Competencia Ciudadana',
      'Neumática',
      'Hidráulica',
      'Fundamentos de Física',
      'Electrónica',
    ],
  },
  {
    id: 'logistica',
    backendId: 2,
    nombre: 'Técnico Superior en Logística',
    jornada: ['Campus 1: Presencial (Diurna y Nocturna)'],
    objetivos: {
      general:
        'Desarrollar competencias técnicas en gestión de cadenas de suministro, logística nacional e internacional, almacenamiento inteligente y distribución eficiente orientadas a la competitividad del sector comercial e industrial.',
      especificos: [
        'Optimizar la recepción, almacenamiento y despacho de mercancías aplicando normativas vigentes.',
        'Implementar sistemas digitales de trazabilidad y gestión de inventarios en tiempo real.',
        'Coordinar cadenas de transporte multimodal con criterios de rentabilidad y sostenibilidad.',
      ],
    },
    competencias: [
      'Planificar y coordinar las operaciones de almacenamiento, transporte y distribución de mercancías.',
      'Gestionar inventarios, controlando entradas, salidas y niveles óptimos de stock.',
      'Organizar y supervisar procesos de la cadena de suministro, asegurando eficiencia y calidad.',
      'Aplicar normativas de comercio, transporte y seguridad en operaciones logísticas.',
      'Utilizar herramientas tecnológicas y sistemas de información logística para la toma de decisiones.',
      'Coordinar proveedores, clientes y operadores logísticos para el cumplimiento de tiempos y costos.',
      'Optimizar recursos y procesos logísticos para mejorar la competitividad de la organización.',
    ],
    ocupaciones: [
      'Técnico en Logística',
      'Asistente de Logística y Distribución',
      'Encargado de Almacén o Bodega',
      'Coordinador de Inventarios',
      'Asistente de Compras y Abastecimiento',
      'Supervisor de Operaciones Logísticas',
    ],
    materias: [
      'Gestión de Compras y Abastecimiento',
      'Operaciones Logísticas, Distribución de Carga y Transporte',
      'Inglés',
      'Contabilidad',
      'Seguridad Industrial y Normativa Aplicadas',
      'Matemática Aplicada',
      'Competencias Ciudadanas Aplicadas al Trabajo',
      'Fundamentos de la Logística y Cadena de Suministros',
      'Herramientas Informáticas y Sistemas Digitales para la Toma de Decisiones',
      'Gestión de Inventarios y Trazabilidad Inteligente de Productos',
    ],
  },
];
