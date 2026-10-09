# Skill — Frontend

## Role
Construir la experiencia del estudiante sin duplicar reglas del backend.

## Stack
React, TypeScript, Vite, TailwindCSS, React Router, TanStack Query, Vitest.

## Week 1 Scope
- `/mentor`;
- selectores;
- pregunta;
- loading;
- error;
- respuesta;
- consumo API.

## Architecture
Separar:
- UI components;
- hooks/query logic;
- API client;
- types.

## Rules
- No hardcodear respuestas del mentor.
- No acceder a DB.
- No llamar directamente al proveedor LLM.
- No inventar campos distintos al API Contract.
- Manejar loading y error.
- Responsive básico obligatorio.

## Testing
Cubrir render, submit, loading, error y success.

## Definition of Done
UI funcional + API integrada + tests + contrato respetado.
