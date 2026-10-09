# Skill — Coding Standards

## General
- TypeScript estricto.
- Nombres descriptivos.
- Funciones pequeñas.
- Una responsabilidad por módulo.
- Evitar `any`.
- Evitar valores hardcoded sin justificación.
- Reutilizar tipos y constantes.

## Naming
- Components: `PascalCase`.
- Functions/variables: `camelCase`.
- Constants: `UPPER_SNAKE_CASE` cuando aplique.
- Respetar la convención de archivos ya existente.

## Error Handling
- No silenciar errores.
- Usar mensajes claros.
- No exponer stack traces al usuario.
- Registrar errores útiles en backend.

## Comments
Comentar decisiones, no código obvio.

## Dependencies
No instalar librerías nuevas si la funcionalidad puede resolverse razonablemente con las existentes.
