# RETOS Mentor — Workflow de Desarrollo

## Branches
```text
main
 └── develop
      ├── feat/frontend-mentor
      ├── feat/backend-mentor
      ├── feat/data-seed
      └── test/mentor-integration
```

## Flujo
```text
Issue → Branch → Agent work → Human review → Tests → PR → QA → develop
```

El líder realiza E2E antes de promover cambios relevantes a `main`.

## Reglas
1. No desarrollar en `main` ni `develop`.
2. Una branch = una responsabilidad.
3. No mezclar feature y refactor grande.
4. No modificar otro módulo sin necesidad.
5. No cambiar contratos unilateralmente.
6. Actualizar branch antes del PR.
7. PR pequeño > PR gigante.
8. No mergear con tests rotos.
9. Resolver conflictos con el responsable del módulo.
10. Reuniones de 15–30 minutos máximo.
