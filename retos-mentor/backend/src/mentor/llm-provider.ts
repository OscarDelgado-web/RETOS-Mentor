export interface LlmPrompt {
  topic: string;
  subject: string;
  student: string;
  level: string;
  question: string;
  sources: Array<{ title: string; description: string | null; url: string }>;
}

export interface LlmProvider {
  generateAnswer(prompt: LlmPrompt): Promise<string>;
}

function formatPrompt(prompt: LlmPrompt): string {
  return `Estudiante: ${prompt.student}. Asignatura: ${prompt.subject}. Tema: ${prompt.topic}. Nivel: ${prompt.level}. Pregunta: ${prompt.question}. Fuentes disponibles: ${JSON.stringify(prompt.sources)}`;
}

export class OpenAiProvider implements LlmProvider {
  async generateAnswer(prompt: LlmPrompt): Promise<string> {
    const endpoint = process.env.LLM_API_URL ?? 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...(process.env.LLM_API_KEY ? { Authorization: `Bearer ${process.env.LLM_API_KEY}` } : {}),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL ?? 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un mentor académico. Responde en español, con claridad y adaptado al nivel indicado. Usa las fuentes proporcionadas cuando sean pertinentes y no inventes referencias.' },
          { role: 'user', content: formatPrompt(prompt) },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`LLM provider returned HTTP ${response.status}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const answer = payload.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('LLM provider returned an invalid answer');
    return answer.trim();
  }

}

export class OllamaProvider implements LlmProvider {
  async generateAnswer(prompt: LlmPrompt): Promise<string> {
    const endpoint = process.env.LLM_API_URL ?? 'http://localhost:11434/api/chat';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.LLM_MODEL ?? 'llama3.2',
        stream: false,
        messages: [
          { role: 'system', content: 'Eres un mentor académico. Responde en español, adaptado al nivel. Usa las fuentes disponibles sin inventar referencias.' },
          { role: 'user', content: formatPrompt(prompt) },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`LLM provider returned HTTP ${response.status}`);
    const payload = await response.json() as { message?: { content?: unknown } };
    const answer = payload.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('LLM provider returned an invalid answer');
    return answer.trim();
  }
}

export class MockProvider implements LlmProvider {
  async generateAnswer(prompt: LlmPrompt): Promise<string> {
    return `Un ${prompt.topic} es un concepto clave de ${prompt.subject}. Sobre tu consulta "${prompt.question}": te lo explico según tu nivel ${prompt.level}.`;
  }
}

export function createLlmProvider(name: string): LlmProvider {
  switch (name.toLowerCase()) {
    case 'openai': return new OpenAiProvider();
    case 'ollama': return new OllamaProvider();
    case 'mock': return new MockProvider();
    default: throw new Error(`Unsupported LLM_PROVIDER: ${name}`);
  }
}
