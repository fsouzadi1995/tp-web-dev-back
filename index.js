import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { signUser } from './utils';
import { withJwt } from './auth';

const app = express();

const prismaClient = new PrismaClient();

app.use(express.json());
app.use(cors());

// app.post('/api/signup', async (req, res) => {
//   const name = req.query.name?.toLocaleLowerCase();
//   const password = +req.query.pwd;

//   try {
//     if (!name) {
//       return res.status(400).send('name field cannot be empty');
//     }

//     const nameExists = await prismaClient.user.findFirst({
//       where: { name },
//     });

//     if (nameExists) {
//       return res.status(400).send('name already taken');
//     }

//     if (password.toString().length < 4) {
//       return res.status(400).send('password must be at least 4 characters');
//     }

//     if (password.toString().length > 16) {
//       return res.status(400).send('password cannot exceed 16 characters');
//     }

//     if (isNaN(password)) {
//       return res.status(400).send('not a number');
//     }

//     bcrypt.hash(password.toString(), 8).then(async (hashed_pw) => {
//       await prismaClient.user.create({
//         data: { name, password: hashed_pw },
//       });
//     });

//     res.status(200).send();
//   } catch (ex) {
//     console.log(ex);
//     return res.status(500).send();
//   }
// });

app.post('/api/signin', async (req, res) => {
  console.log(req.body);

  const name = req.body.name;
  const password = +req.body.password;

  console.log({ name, password });

  try {
    if (!name) {
      return res.status(400).send('name field cannot be empty');
    }

    if (isNaN(password)) {
      return res.status(400).send('password is not a number');
    }

    if (password.toString().length < 4) {
      return res.status(400).send('password must be at least 4 characters');
    }

    if (password.toString().length > 16) {
      return res.status(400).send('password cannot exceed 16 characters');
    }

    const db_user = await prismaClient.user.findFirst({ where: { name } });

    if (!db_user) {
      return res.status(400).send('user not found');
    }

    return bcrypt
      .compare(password.toString(), db_user.password)
      .then((result) => {
        if (!result) {
          return res.status(400).send('Invalid password');
        }

        return res.status(200).json({ jwt: signUser(db_user.id) });
      });
  } catch (ex) {
    console.log(ex);
    return res.status(500).send();
  }
});

app.post('/api/outfit', withJwt, async (req, res) => {
  const { character, top, bottom, shoe } = req.body;
  const { id: user_id } = req.jwt_payload;

  console.log(req.body);

  try {
    if (!character || !top || !bottom || !shoe) {
      return res.status(400).send('malformed outfit');
    }

    const db_user = await prismaClient.user.findFirstOrThrow({
      where: { id: user_id },
    });

    const db_character = await prismaClient.character.findFirstOrThrow({
      where: { name: { equals: character } },
    });

    const db_top = await prismaClient.top.findFirstOrThrow({
      where: { name: { equals: top } },
    });

    const db_bottom = await prismaClient.bottom.findFirstOrThrow({
      where: { name: { equals: bottom } },
    });

    const db_shoe = await prismaClient.shoe.findFirstOrThrow({
      where: { name: { equals: shoe } },
    });

    const outfit = await prismaClient.outfit.create({
      data: {
        user_id: db_user.id,
        character_id: db_character.id,
        top_id: db_top.id,
        bottom_id: db_bottom.id,
        shoe_id: db_shoe.id,
      },
    });

    if (!outfit) {
      return res.status(400).send();
    }

    return res.status(200).json(outfit);
  } catch (ex) {
    console.log(ex);
    return res.status(400).send();
  }
});

app.get('/api/outfit/history', async (req, res) => {
  try {
    const outfits = await prismaClient.outfit.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        user: { select: { id: true } },
        character: { select: { name: true } },
        bottom: { select: { name: true } },
        top: { select: { name: true } },
        shoe: { select: { name: true } },
      },
    });

    return res.status(200).json(outfits);
  } catch (ex) {
    console.log(ex);
    return res.status(500).send();
  }
});

app.get('/api/outfit/private_history', withJwt, async (req, res) => {
  const { id: user_id } = req.jwt_payload;

  try {
    const outfits = await prismaClient.outfit.findMany({
      where: { user_id: { equals: user_id } },
      orderBy: { id: 'desc' },
      select: {
        id: true,
        user: { select: { id: true } },
        character: { select: { name: true } },
        bottom: { select: { name: true } },
        top: { select: { name: true } },
        shoe: { select: { name: true } },
      },
    });

    console.log(outfits);

    return res.status(200).json(outfits);
  } catch (ex) {
    console.log(ex);
    return res.status(500).send();
  }
});

app.get('/api/ping', (_, res) => res.send('pong'));

app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});
