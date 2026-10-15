# RETOS Mentor — Arquitectura Semana 1

## Estilo
**Monolito modular**.

```text
React / TypeScript
       ↓
REST API
       ↓
NestJS
       ↓
┌───────────────┬──────────────┐
↓               ↓              ↓
PostgreSQL   MentorService   LLMProvider
```

## Módulos backend
`auth`, `students`, `careers`, `subjects`, `topics`, `mentor`, `progress`, `shared`.

## Regla de capas
```text
Controller → Service → Repository / Provider
```

## Prohibiciones
- Controller accediendo directamente a DB.
- Controller consumiendo directamente el LLM.
- Duplicar lógica de negocio en frontend.
- Crear microservicios en semana 1.
- Cambiar de stack sin aprobación.

## Responsabilidades
Frontend: UI, estados, formularios, consumo API y feedback.
Backend: validación, negocio, contexto, DB e IA.
Datos: modelo, consistencia, seed y niveles de progreso.
