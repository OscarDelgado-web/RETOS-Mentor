# RETOS Mentor — Monorepositorio Unificado

Este proyecto consolida tanto el **Frontend** (React + Vite + TailwindCSS) como el **Backend** (NestJS + Prisma + PostgreSQL) en un único monorepositorio con soporte para `npm workspaces`.

---

## 📁 Estructura del Proyecto

```text
retos-mentor/
├── backend/                  # API REST con NestJS y Prisma
│   ├── src/                  # Módulos: academic, mentor, students, prisma
│   ├── prisma/               # Esquema de base de datos y scripts de seed
│   ├── test/                 # Pruebas e2e y unitarias
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Aplicación Web con React, Vite y TailwindCSS
│   ├── src/                  # Páginas, componentes, features del Mentor
│   ├── public/               # Assets estáticos
│   ├── package.json
│   └── vite.config.ts        # Configuración con proxy a http://localhost:3000
├── skills/                   # Especificaciones de negocio, arquitectura y guías
│   ├── 02_MVP_SEMANA1.md
│   ├── 04_ARQUITECTURA.md
│   ├── 05_TECNOLOGIAS.md
│   └── ...
└── package.json              # Orquestador del monorepositorio (npm workspaces)
```

---

## 🚀 Inicio Rápido

### 1. Instalar todas las dependencias
Desde la carpeta raíz del proyecto (`retos-mentor`):
```bash
npm install
```
> Esto instalará automáticamente las dependencias tanto del backend como del frontend gracias a los *npm workspaces*.

### 2. Ejecutar ambos proyectos a la vez
Para iniciar el servidor de desarrollo del **backend** (NestJS en puerto 3000) y del **frontend** (Vite en puerto 5173) simultáneamente con una sola instrucción:
```bash
npm run dev
```

### 3. Comandos Individuales
Si deseas ejecutar cada servicio por separado:

- **Solo Backend:**
  ```bash
  npm run dev:backend
  ```

- **Solo Frontend:**
  ```bash
  npm run dev:frontend
  ```

### 4. Construcción (Build)
Para compilar ambos proyectos para producción:
```bash
npm run build
```

O individualmente:
```bash
npm run build:backend
npm run build:frontend
```

### 5. Pruebas y Linter
```bash
npm run test
npm run lint
```
