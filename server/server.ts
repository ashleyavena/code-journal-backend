import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { authMiddleware, ClientError, errorMiddleware } from './lib/index.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

type User = {
  userId: number;
  username: string;
  hashedPassword: string;
};

type Auth = {
  user: User;
  token: string;
  username: string;
  password: string;
};

const hashKey = process.env.TOKEN_SECRET ?? '';
if (!hashKey) throw new Error('TOKEN_SECRET not found in env');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

app.post('/api/auth/sign-up', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ClientError(400, 'username and password are required fields');
    }

    const hashedPassword = await argon2.hash(password);
    const sql = `
      insert into "users" ("username", "hashedPassword")
      values ($1, $2)
      returning "userId", "username", "createdAt";
    `;
    const result = await db.query<User>(sql, [username, hashedPassword]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.post('/api/auth/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body as Partial<Auth>;
    if (!username || !password) {
      throw new ClientError(401, 'invalid login');
    }

    const sql = `
      select "userId", "hashedPassword"
        from "users"
       where "username" = $1;
    `;
    const result = await db.query<User>(sql, [username]);
    const user = result.rows[0];
    if (!user) throw new ClientError(401, 'invalid login');
    const { userId, hashedPassword } = user;
    if (!(await argon2.verify(hashedPassword, password)))
      throw new ClientError(401, 'invalid login');

    const payload = { userId, username };
    const token = jwt.sign(payload, hashKey);
    res.json({ user: payload, token });
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries', authMiddleware, async (req, res, next) => {
  try {
    const sql = `
      select *
        from "entries"
        where "userId" = $1;
    `;
    const result = await db.query<Entry>(sql, [req.user?.userId]);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:entryId', authMiddleware, async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId)) {
      throw new ClientError(400, 'Invalid entry');
    }
    const sql = `
      select * from "entries"
      where "entryId" = $1 and "userId"= $2;
    `;
    const params = [entryId, req.user?.userId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, 'Entry not found');
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entries', authMiddleware, async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    if (!title || !notes || !photoUrl) {
      throw new ClientError(400, 'Entry is required');
    }
    const sql = `
      insert into "entries" ("title", "notes", "photoUrl", "userId")
        values ($1, $2, $3, $4)
        returning *
    `;
    const params = [title, notes, photoUrl, req.user?.userId];
    const result = await db.query<Entry>(sql, params);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/entries/:entryId', authMiddleware, async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { title, notes, photoUrl } = req.body;
    if (!title || !notes || !photoUrl) {
      throw new ClientError(400, 'Title, notes, and photoUrl are required');
    }
    if (!Number.isInteger(+entryId)) {
      throw new ClientError(400, 'Invalid entry ID');
    }
    const sql = `
      UPDATE "entries"
      SET "title" = $1, "notes" = $2, "photoUrl" = $3
      WHERE "entryId" = $4 AND "userId" = $5
      RETURNING *;
    `;
    const params = [title, notes, photoUrl, entryId, req.user?.userId];

    const result = await db.query(sql, params);
    const updatedEntry = result.rows[0];
    if (!updatedEntry) {
      throw new ClientError(
        404,
        'Entry not found or you are not authorized to update it'
      );
    }

    res.json(updatedEntry);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/entries/:entryId', authMiddleware, async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!entryId) {
      throw new ClientError(400, 'Invalid entry');
    }
    const sql = `
      delete from "entries"
      where "entryId" = $1 and "userId"= $2
      returning *
    `;
    const result = await db.query(sql, [entryId, req.user?.userId]);
    if (result.rowCount === 0) {
      throw new ClientError(404, 'Entry ID not found');
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
