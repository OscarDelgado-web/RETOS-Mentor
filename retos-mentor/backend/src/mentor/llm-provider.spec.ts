import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { GeminiProvider, MockProvider, createLlmProvider } from './llm-provider';

describe('GeminiProvider', () => {
  const originalGeminiApiKey = process.env.GEMINI_API_KEY;
  const originalLlmApiKey = process.env.LLM_API_KEY;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalGeminiApiKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGeminiApiKey;
    if (originalLlmApiKey === undefined) delete process.env.LLM_API_KEY;
    else process.env.LLM_API_KEY = originalLlmApiKey;
  });

  it('uses the official v1beta endpoint, Gemini key header, conversation and parses the answer', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    delete process.env.LLM_API_KEY;
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: 'Respuesta de prueba.' }] } }] }),
    } as Response);

    const answer = await new GeminiProvider().generateAnswer({
      topic: 'JOIN',
      subject: 'Bases de Datos',
      student: 'Estudiante de prueba',
      level: 'BEGINNER',
      question: '¿Qué es JOIN?',
      history: [{ role: 'assistant', content: 'Hablemos de SQL.' }],
      modelId: 'gemini-2.5-flash',
      sources: [],
    });

    expect(answer).toBe('Respuesta de prueba.');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    expect(request?.headers).toMatchObject({ 'x-goog-api-key': 'test-gemini-key' });
    const body = JSON.parse(request?.body as string);
    expect(body.contents[0]).toMatchObject({ role: 'model', parts: [{ text: 'Hablemos de SQL.' }] });
    expect(body.contents[1].role).toBe('user');
  });

  it('falls back to secondary model if primary model returns 503 high demand', async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    delete process.env.LLM_API_KEY;

    let callCount = 0;
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: async () => ({ error: { message: 'High demand' } }),
        } as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ candidates: [{ content: { parts: [{ text: 'Respuesta desde modelo de respaldo.' }] } }] }),
      } as Response;
    });

    const answer = await new GeminiProvider().generateAnswer({
      topic: 'Subconsultas',
      subject: 'Bases de Datos',
      student: 'Estudiante',
      level: 'INTERMEDIATE',
      question: '¿Qué es una subconsulta?',
      history: [],
      modelId: 'gemini-3.8-flash',
      sources: [],
    });

    expect(answer).toBe('Respuesta desde modelo de respaldo.');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('MockProvider & createLlmProvider', () => {
  it('generates contextual answer in MockProvider', async () => {
    const provider = new MockProvider();
    const answer = await provider.generateAnswer({
      topic: 'Normalización',
      subject: 'Bases de Datos',
      student: 'Demo',
      level: 'ADVANCED',
      question: '¿Qué es 3FN?',
      history: [],
      sources: [],
    });

    expect(answer).toContain('Normalización');
    expect(answer).toContain('Bases de Datos');
    expect(answer).toContain('3FN');
    expect(answer).toContain('ADVANCED');
  });

  it('creates MockProvider when LLM_PROVIDER=mock', () => {
    const provider = createLlmProvider('mock');
    expect(provider).toBeInstanceOf(MockProvider);
  });
});
