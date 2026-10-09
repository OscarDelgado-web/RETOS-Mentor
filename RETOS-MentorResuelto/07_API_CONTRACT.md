# RETOS Mentor — API Contract Semana 1

## GET /health
```json
{"status":"ok"}
```

## GET /students/:id
```json
{"id":1,"name":"Student Demo","careerId":1}
```

## GET /careers
```json
[{"id":1,"name":"Software Development"}]
```

## GET /subjects?careerId=1
```json
[{"id":1,"careerId":1,"name":"Databases"}]
```

## GET /topics?subjectId=1
```json
[{"id":1,"subjectId":1,"name":"JOIN"}]
```

## POST /mentor/messages

Request:
```json
{
  "studentId": 1,
  "subjectId": 1,
  "topicId": 1,
  "message": "Explícame qué es un JOIN"
}
```

Response:
```json
{
  "answer": "Un JOIN...",
  "context": {
    "topic": "JOIN",
    "level": "BEGINNER"
  }
}
```

Errores: `400` datos inválidos, `404` recurso no encontrado, `502` proveedor IA no disponible.

Cualquier cambio de contrato debe ser aprobado por el líder.
