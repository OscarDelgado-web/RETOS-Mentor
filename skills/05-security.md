# Skill — Security

## Secrets
- Nunca exponer API keys.
- Usar variables de entorno.
- No commitear `.env`.

## Input
- Validar DTOs.
- Rechazar payloads inválidos.
- Limitar tamaño de inputs razonablemente.

## Output
- No exponer stack traces.
- No devolver datos innecesarios.

## AI
- No enviar secretos al modelo.
- No permitir que una respuesta del LLM ejecute acciones privilegiadas.
- Tratar la salida del LLM como contenido no confiable.

## Database
- Usar ORM parametrizado.
- Mantener constraints.
- Validar IDs.

## Week 1
Priorizar seguridad base sin retrasar el vertical slice.
