import { PrismaClient, ProgressLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Career", "Subject", "Topic", "Student", "StudentTopicProgress", "MentorSession", "MentorMessage" RESTART IDENTITY CASCADE;`
  );

  // 1. Carreras exactas requeridas
  const software = await prisma.career.create({
    data: { name: 'Desarrollo de Software' },
  });
  const logistica = await prisma.career.create({
    data: { name: 'Logística' },
  });
  const mantenimiento = await prisma.career.create({
    data: { name: 'Mantenimiento Industrial' },
  });
  const mecatronica = await prisma.career.create({
    data: { name: 'Mecatrónica' },
  });

  // 2. Asignaturas y Temas para Desarrollo de Software
  await prisma.subject.create({
    data: {
      name: 'Bases de Datos',
      careerId: software.id,
      topics: {
        create: [
          { name: 'JOIN' },
          { name: 'INDEXING' },
          { name: 'TRANSACTIONS' },
        ],
      },
    },
  });

  await prisma.subject.create({
    data: {
      name: 'Arquitectura Web',
      careerId: software.id,
      topics: {
        create: [
          { name: 'REST APIs' },
          { name: 'GraphQL' },
          { name: 'WebSockets' },
        ],
      },
    },
  });

  // 3. Asignaturas y Temas para Logística
  await prisma.subject.create({
    data: {
      name: 'Cadena de Suministro',
      careerId: logistica.id,
      topics: {
        create: [
          { name: 'Inventarios' },
          { name: 'Gestión de Almacenes' },
          { name: 'Rutas de Distribución' },
        ],
      },
    },
  });
  await prisma.subject.create({
    data: {
      name: 'Comercio Internacional',
      careerId: logistica.id,
      topics: {
        create: [
          { name: 'Incoterms' },
          { name: 'Aduanas' },
          { name: 'Logística Marítima' },
        ],
      },
    },
  });

  // 4. Asignaturas y Temas para Mantenimiento Industrial
  await prisma.subject.create({
    data: {
      name: 'Mantenimiento Predictivo',
      careerId: mantenimiento.id,
      topics: {
        create: [
          { name: 'Análisis de Vibraciones' },
          { name: 'Termografía' },
          { name: 'Análisis de Aceites' },
        ],
      },
    },
  });
  await prisma.subject.create({
    data: {
      name: 'Sistemas Hidráulicos',
      careerId: mantenimiento.id,
      topics: {
        create: [
          { name: 'Bombas Hidráulicas' },
          { name: 'Válvulas de Control' },
          { name: 'Circuitos Oleohidráulicos' },
        ],
      },
    },
  });

  // 5. Asignaturas y Temas para Mecatrónica
  await prisma.subject.create({
    data: {
      name: 'Automatización Industrial',
      careerId: mecatronica.id,
      topics: {
        create: [
          { name: 'PLCs' },
          { name: 'Sensores Industriales' },
          { name: 'Programación Ladder' },
        ],
      },
    },
  });
  await prisma.subject.create({
    data: {
      name: 'Robótica Aplicada',
      careerId: mecatronica.id,
      topics: {
        create: [
          { name: 'Cinemática de Robots' },
          { name: 'Servomotores' },
          { name: 'Sistemas de Visión Artificial' },
        ],
      },
    },
  });

  // 6. Estudiantes solicitados
  const student1 = await prisma.student.create({
    data: {
      name: 'Student Demo',
      careerId: software.id,
    },
  });

  await prisma.student.create({
    data: {
      name: 'Carlos Adán',
      careerId: software.id,
    },
  });

  await prisma.student.create({
    data: {
      name: 'Óscar Osmín',
      careerId: mecatronica.id,
    },
  });

  await prisma.student.create({
    data: {
      name: 'Denys Rosa',
      careerId: mantenimiento.id,
    },
  });

  // 7. Progreso inicial del estudiante demo
  const joinTopic = await prisma.topic.findFirst({ where: { name: 'JOIN' } });
  if (joinTopic) {
    await prisma.studentTopicProgress.create({
      data: {
        studentId: student1.id,
        topicId: joinTopic.id,
        level: ProgressLevel.BEGINNER,
      },
    });
  }

  console.log('Seed ejecutado correctamente con los nuevos estudiantes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });