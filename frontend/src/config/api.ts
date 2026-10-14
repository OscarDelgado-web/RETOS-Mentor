const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchApi = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  await delay(800); // Mantenemos el delay para ver la animación de "escribiendo..."

  // Datos reales basados en el temario
  if (endpoint === '/careers') return [{ id: 1, name: 'Técnico Superior en Desarrollo de Software' }] as unknown as T;
  
  if (endpoint.startsWith('/subjects')) {
    return [{ id: 101, careerId: 1, name: 'Fundamentos de Programación (Ciclo I)' }] as unknown as T;
  }
  
  if (endpoint.startsWith('/topics')) {
    return [
      { id: 1001, subjectId: 101, name: 'Introducción y Lógica Computacional' },
      { id: 1002, subjectId: 101, name: 'Variables, Tipos de Datos y Operadores' },
      { id: 1003, subjectId: 101, name: 'Estructuras de Control' },
      { id: 1004, subjectId: 101, name: 'Funciones y Estructuras de Datos' }
    ] as unknown as T;
  }

  // Lógica del Chat con Extensiones
  if (endpoint === '/mentor/messages' && options?.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const userMsg = body.message.toLowerCase();

    // Si el usuario pregunta por un concepto técnico, devolvemos una tarjeta de concepto
    if (userMsg.includes('variable') || userMsg.includes('ejercicio')) {
      return { 
        answer: '¡Excelente pregunta! Una variable es como una caja donde guardamos información. Aquí tienes un resumen visual y un ejemplo en código:', 
        context: { topic: 'Variables', level: 'BEGINNER' },
        extensionType: 'concept_card',
        extensionData: {
          title: 'Variables en Python',
          code: 'edad = 20\nnombre = "Enrique"\nprint(nombre, "tiene", edad, "años")',
          tip: 'Recuerda que Python es de tipado dinámico, no necesitas declarar el tipo de variable.'
        }
      } as unknown as T;
    }

    // Respuesta por defecto
    return { 
      answer: `He analizado tu mensaje: "${body.message}". ¿Te gustaría profundizar en algún concepto específico del temario?`, 
      context: { topic: 'General', level: 'BEGINNER' },
      extensionType: 'text'
    } as unknown as T;
  }
  
  throw new Error(`Endpoint no mockeado: ${endpoint}`);
};