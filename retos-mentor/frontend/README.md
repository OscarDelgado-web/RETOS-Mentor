# RETOS Mentor — Módulo Frontend (MVP)

Interfaz web interactiva del sistema **RETOS Mentor**, desarrollada con **React, TypeScript, Vite y Tailwind CSS v4**. Este módulo permite a los estudiantes de las 4 carreras técnicas institucionales seleccionar su contexto académico en cascada (**Carrera → Asignatura → Tema**), realizar consultas contextualizadas a un tutor impulsado por IA, sostener conversaciones de seguimiento multiturno y consultar fuentes académicas asociadas.

---

## 🛠️ Stack Tecnológico

* **Framework UI:** React + TypeScript
* **Entorno de Construcción y Dev Server:** Vite (Puerto `5173` con proxy reverso hacia `http://localhost:3000`)
* **Estilos y Diseño:** Tailwind CSS v4 (Diseño 100% Responsive para escritorio y móvil)
* **Enrutamiento y Estado:** React Router DOM + React Context API (`AuthContext`, `MateriasContext`, `ChatContext`, `ToastContext`)
* **Pruebas Unitarias:** Vitest + React Testing Library

---

## 📁 Estructura del Directorio (`frontend/`)

```text
frontend/
├── public/                        # Recursos estáticos
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Contenedor principal responsive con barra lateral plegable
│   │   │   └── Sidebar.tsx        # Navegación entre Inicio, Materias y Mentor Chat
│   │   ├── HeroContextSelector.tsx      # Selector académico en cascada (Carrera -> Asignatura -> Tema)
│   │   └── HeroContextSelector.spec.tsx # Pruebas unitarias del selector en cascada
│   ├── context/
│   │   ├── AuthContext.tsx        # Sesión activa del estudiante y carrera seleccionada
│   │   ├── ChatContext.tsx        # Gestión de sesiones, envío de IDs reales (1..8, 1..24) y fuentes
│   │   ├── MateriasContext.tsx    # Sincronización de materias con backendId real desde GET /subjects
│   │   └── ToastContext.tsx       # Alertas y notificaciones visuales
│   ├── data/
│   │   └── careersCatalog.ts      # Catálogo alineado con los backendId reales (1 a 4) de PostgreSQL
│   ├── pages/
│   │   ├── HomePage.tsx           # Ficha técnica de las 4 carreras, competencias y ocupaciones
│   │   ├── LoginPage.tsx          # Inicio de sesión y selección de perfil/carrera
│   │   ├── MateriasPage.tsx       # Catálogo de asignaturas por carrera
│   │   ├── MentorChatPage.tsx     # Vista principal del tutor IA con selector en cascada y fuentes
│   │   └── MentorChatPage.spec.tsx# Pruebas unitarias del flujo de chat y renderizado de fuentes
│   ├── services/
│   │   ├── api.ts                 # Cliente HTTP con base /api, sin mocks silenciosos (propaga errores reales)
│   │   └── api.spec.ts            # Pruebas unitarias del cliente HTTP y manejo de códigos 200/201/errores
│   ├── types/
│   │   ├── api.ts                 # Contratos DTO (MentorMessageRequest, MentorMessageResponse, MentorSource)
│   │   └── index.ts               # Tipos globales de la interfaz y mensajes con soporte de sources
│   ├── App.tsx                    # Definición de rutas de la aplicación
│   └── main.tsx                   # Punto de entrada de React
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts                 # Proxy configurado de /api/* hacia http://localhost:3000/*
