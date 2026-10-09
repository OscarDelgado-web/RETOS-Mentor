# Skill — Backend

## Role
Implementar reglas, contexto, persistencia e integración con IA.

## Stack
NestJS, TypeScript, Prisma, PostgreSQL, Jest.

## Week 1 Scope
- health;
- students;
- careers;
- subjects;
- topics;
- mentor/messages;
- `LLMProvider`.

## Architecture
```text
Controller → Service → Repository / Provider
```

## Rules
- DTOs validados.
- No Prisma directo en controllers.
- No llamadas directas al LLM fuera del provider.
- No cambiar contrato sin aprobación.
- Manejar errores del proveedor.
- Mantener services testeables.

## Testing
Cubrir validación, service, errores y endpoint principal.

## Definition of Done
Endpoint funcional + DB + LLMProvider + tests + errores controlados.
