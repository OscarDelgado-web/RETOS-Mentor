# RETOS Mentor — Business Rules

1. RETOS Mentor es un mentor académico digital; no sustituye al docente.
2. La respuesta debe considerar, cuando exista: carrera, asignatura, tema, nivel y contexto académico.
3. El LLM no es la fuente de verdad del sistema.
4. El backend valida, aplica reglas, autoriza y persiste.
5. La base de datos conserva estado, progreso y evidencia.
6. El progreso no puede modificarse únicamente por una opinión libre del LLM.
7. Frontend y backend deben respetar `07_API_CONTRACT.md`.
8. Ningún agente cambia contratos públicos sin aprobación del líder.
9. Toda integración con modelos debe pasar por `LLMProvider`.
10. Nunca se exponen API keys, tokens, secretos o credenciales.
11. Solo se almacenan datos necesarios.
12. Toda feature fuera del MVP semanal requiere aprobación del líder.
