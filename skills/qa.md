# Skill — QA

## Role
Detectar fallos de integración y casos límite antes del E2E.

## Week 1 Scope
Validar:
- endpoints;
- errores;
- integración frontend/backend;
- datos demo;
- comportamiento ante fallos externos.

## Minimum Cases
- mensaje vacío;
- IDs inválidos;
- LLM caído;
- timeout;
- DB caída;
- respuesta malformada.

## Workflow
```text
Detectar → Reproducir → Registrar → Priorizar → Verificar fix
```

## Severity
- Critical: bloquea vertical slice.
- High: rompe función principal.
- Medium: degradación funcional.
- Low: detalle menor.

## Rules
- No corregir silenciosamente bugs ajenos sin registro.
- No cerrar bug sin verificar el fix.
- No reemplazar el E2E del líder.

## Deliverable
Issues claros, reproducibles y priorizados.
