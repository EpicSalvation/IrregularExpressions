import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import connectMySQLSession from 'express-mysql-session';
import { pool, initSchema } from './db.js';
import authRouter from './routes/auth.js';
import progressRouter from './routes/progress.js';

const MySQLStore = connectMySQLSession(session);
const app = express();

app.use(express.json());
app.use(express.static('.'));

app.use(session({
  secret: process.env.SESSION_SECRET ?? 'changeme',
  store: new MySQLStore({}, pool),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));

app.use('/auth', authRouter);
app.use('/api', progressRouter);

const PORT = process.env.PORT ?? 3000;

initSchema()
  .then(() => app.listen(PORT, () => console.log(`Listening on :${PORT}`)))
  .catch(err => { console.error('DB init failed', err); process.exit(1); });
