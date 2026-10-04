# Skill — Architecture

## Purpose
Evitar divergencia entre implementaciones producidas por distintos agentes.

## Architecture Style
Monolito modular.

## Layers
```text
Frontend
  ↓
REST
  ↓
Controller
  ↓
Service
  ↓
Repository / Provider
```

## Boundaries
- Controllers no contienen negocio.
- Services no renderizan UI.
- Repositories no deciden reglas.
- Providers encapsulan servicios externos.
- Frontend no accede a DB ni LLM directamente.

## Forbidden
- microservicios;
- duplicación de services;
- llamadas directas a LLM fuera de `LLMProvider`;
- lógica crítica en componentes visuales;
- acceso a Prisma desde controllers.

## Change Policy
Si una tarea exige romper una frontera, reportar primero al líder.
