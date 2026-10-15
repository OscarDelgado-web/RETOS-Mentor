# RETOS Mentor — Testing Strategy

## Responsabilidades
Desarrolladores: unit tests, componente e integración de su módulo.
QA: integración, edge cases, regresión y defectos.
Líder: E2E.

## Frontend
Probar render, selectores, loading, error, respuesta y consumo API.

## Backend
Probar DTOs, services, repositories, endpoints, validaciones y errores del LLM.

## Datos
Probar seed, FKs, relaciones, duplicados y consistencia.

## Casos límite
- mensaje vacío;
- IDs inexistentes;
- LLM no disponible;
- respuesta vacía;
- timeout;
- DB no disponible;
- respuesta malformada.

Un PR crítico no se considera terminado sin las pruebas correspondientes.
