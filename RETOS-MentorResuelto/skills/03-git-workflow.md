# Skill — Git Workflow

## Branches
- `main`: estable.
- `develop`: integración.
- feature/test branches: trabajo diario.

## Rules
- Nunca commit directo a `main`.
- Nunca commit directo a `develop`.
- Un PR debe ser pequeño y enfocado.
- No mezclar cambios ajenos.
- No reformatear archivos no relacionados.
- Evitar renombrados innecesarios.
- Antes del PR: actualizar branch y ejecutar tests.

## Commit Style
```text
feat(frontend): add mentor question form
feat(backend): add mentor message endpoint
test(mentor): cover invalid topic id
fix(api): handle llm provider timeout
```

## Merge Conflict Prevention
- respetar ownership;
- no tocar contratos sin aprobación;
- no reordenar carpetas sin necesidad;
- evitar cambios cosméticos masivos.
