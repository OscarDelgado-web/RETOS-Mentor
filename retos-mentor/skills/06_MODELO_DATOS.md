# RETOS Mentor — Modelo de Datos Semana 1

## Entidades
```text
Career(id, name)
Subject(id, careerId, name)
Topic(id, subjectId, name)
Student(id, name, careerId)
StudentTopicProgress(studentId, topicId, level)
MentorSession(id, studentId, createdAt)
MentorMessage(id, sessionId, role, content, createdAt)
```

## Niveles
`NOT_EVALUATED`, `BEGINNER`, `IN_PROGRESS`, `COMPETENT`.

## Relaciones
```text
Career
  └── Subject
        └── Topic

Student
  ├── Career
  ├── StudentTopicProgress
  └── MentorSession
        └── MentorMessage
```

## Seed mínimo
- 4 carreras;
- 2 asignaturas por carrera;
- 3 temas por asignatura;
- 3 a 5 estudiantes.

No agregar entidades nuevas sin una necesidad directa del flujo principal.
