import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  bcrypt.hash('1234'.toString(), 8).then(async (password) => {
    const baseUser = await prisma.user.create({
      data: {
        password,
        name: 'fabian',
      },
    });

    console.log({ baseUser });
  });

  const qty = Array.from({ length: 3 }, (_, v) => v + 1);

  qty.forEach(async (v) => {
    await prisma.top.create({
      data: {
        name: `top${v}`,
      },
    });

    await prisma.bottom.create({
      data: {
        name: `bottom${v}`,
      },
    });

    await prisma.shoe.create({
      data: {
        name: `shoe${v}`,
      },
    });
  });

  await prisma.character.createMany({
    data: [
      {
        name: 'characterA',
      },
      {
        name: 'characterB',
      },
      {
        name: 'characterC',
      },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
