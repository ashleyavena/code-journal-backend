import 'dotenv/config';
import pg from 'pg';
import express from 'express';
import { ClientError, errorMiddleware } from './lib/index.js';

type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();
app.use(express.json());

app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `
      select *
        from "entries";
    `;
    const result = await db.query<Entry>(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!Number.isInteger(+entryId)) {
      throw new ClientError(400, 'Invalid entry');
    }
    const sql = `
      select * from "entries"
      where "entryId" = $1;
    `;
    const params = [entryId];
    const result = await db.query(sql, params);
    const entry = result.rows[0];
    if (!entry) throw new ClientError(404, 'Entry not found');
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entries', async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    if (!title || !notes || !photoUrl) {
      throw new ClientError(400, 'Entry is required');
    }
    const sql = `
      insert into "entries" ("title", "notes", "photoUrl")
        values ($1, $2, $3)
        returning *
    `;
    const params = [title, notes, photoUrl];
    const result = await db.query<Entry>(sql, params);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const { title, notes, photoUrl } = req.body;

    if (!title || !notes || !photoUrl) {
      throw new ClientError(400, 'Entry is required');
    }
    if (!Number.isInteger(Number(entryId))) {
      throw new ClientError(400, 'Invalid entryId');
    }
    const sql = `
      update "grades"
      set "title" = $1,
          "notes" = $2,
          "photoUrl" = $3
      where "entryId" = $4
      returning *
    `;

    const params = [title, notes, photoUrl, entryId];
    const result = await db.query(sql, params);
    const updatedEntry = result.rows[0];
    if (!updatedEntry) {
      throw new ClientError(404, `Entry ID not found`);
    }
    res.status(200).json(updatedEntry);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    const { entryId } = req.params;
    if (!entryId) {
      throw new ClientError(400, 'Invalid entry');
    }
    const sql = `
      delete from "entries"
      where "entryId" = $1
      returning *
    `;
    const result = await db.query(sql, [entryId]);
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
